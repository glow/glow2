Glow.provide(function(glow) {
	var undefined,
		ResourceRequestProto,
		ResourceResponseProto,
		net = glow.net;
	
	/**
		@private
		@function
		@description Normalise urls param.
			Normalise ResourceRequest's urls parameter to an object with 'css', 'js' and 'img' properties.
	*/
	function normaliseUrlsParam(urls) {
		var r = {
				js: [],
				css: [],
				img: []
			},
			url;
		
		if (typeof urls === 'object' && !urls.push) {
			r = glow.util.apply(r, urls);
		}
		else {
			// convert urls to an array if need be
			typeof urls === 'string' && ( urls = [urls] );
			
			// forwards loop, maintain order
			for (var i = 0, len = urls.length; i < len; i++) {
				url = urls[i];
				if ( url.slice(-4) === '.css' ) {
					r.css[r.css.length] = url;
				}
				else if ( url.slice(-3) === '.js' ) {
					r.js[r.js.length] = url;
				}
				else {
					r.img[r.img.length] = url;
				}
			}
		}
		
		return r;
	}
	
	/**
		@name glow.net.ResourceRequest
		@class
		@description Request made via {@link glow.net.getResources}
		@glowPrivateConstructor There is no direct constructor.
	*/
	function ResourceRequest(urls) {
		urls = normaliseUrlsParam(urls);
		
		var request = this,
			js = urls.js,
			css = urls.css,
			img = urls.img,
			jsLen = js.length,
			cssLen = css.length,
			imgLen = img.length,
			i;
		
		request.totalResources = jsLen + cssLen + imgLen;
		
		// ensure events don't fire until they're added
		setTimeout(function() {
			// guess it makes sense to load CSS, js then images (the browser will queue the requests)
			for (i = 0; i < cssLen; i++) {
				loadCss( request, css[i] );
			}
			for (i = 0; i < jsLen; i++) {
				loadJs( request, js[i] );
			}
			for (i = 0; i < imgLen; i++) {
				loadImg( request, img[i] );
			}
		}, 0);
		
	}
	
	glow.util.extend(ResourceRequest, glow.events.Target);
	ResourceRequestProto = ResourceRequest.prototype;
	
	/**
		@name glow.net.ResourceRequest#totalResources
		@type number
		@description Total number of resources requested.
	*/
	ResourceRequestProto.totalResources = 0;
	
	/**
		@name glow.net.ResourceRequest#totalLoaded
		@type number
		@description Total number of resources successfully loaded.
	*/
	ResourceRequestProto.totalLoaded = 0;
	
	/**
		@private
		@function
		@description Update a request after a resource loads.
		
		@param {glow.net.ResourceRequest} request.
		@param {string} url Url of the requested resource.
		@param {glow.NodeList} resource The element used to load the resource.
		@param {string} type 'js', 'css' or 'img'
	*/
	function progress(request, url, resource, type) {
		
		var totalLoaded = ++request.totalLoaded;
		
		request.fire('progress', {
			resource: resource,
			url: url,
			type: type
		});
		
		if (totalLoaded === request.totalResources) {
			request.fire('load');
		}
	}
	
	/**
		@private
		@function
		@description Start loading an image
		
		@param {glow.net.ResourceRequest} request
		@param {string} imgUrl
	*/
	function loadImg(request, imgUrl) {
		var img = new Image;
		// keep the url in its original format
		glow(img).data('srcUrl', imgUrl).on('load', imgLoaded, request);
		img.src = imgUrl;
	}
	
	/**
		@private
		@function
		@description Process a loaded image.
			'this' is the ResourceRequest
	*/
	function imgLoaded(event) {
		var img = glow(event.attachedTo);
		progress( this, img.data('srcUrl'), img, 'img' );
	}
	
	/**
		@private
		@function
		@description Start loading a script
		
		@param {glow.net.ResourceRequest} request
		@param {string} scriptUrl
	*/
	function loadJs(request, scriptUrl){
		var script = glow( document.createElement('script') )
			.data('srcUrl', scriptUrl)
			.prependTo('head');
		
		// two methods, one for IE (readystatechange) and the other for others
		script.on('readystatechange', jsLoaded, request).on('load', jsLoaded, request);
		
		script[0].src = scriptUrl;
	}
	
	/**
		@private
		@function
		@description Process a loaded script.
			'this' is the ResourceRequest
	*/
	function jsLoaded(event) {
		var script = glow(event.attachedTo),
			scriptElm = script[0],
			readyState = scriptElm.readyState;
		
		if ( !readyState || readyState === 'loaded' || readyState === 'complete' ) {
			// remove events to prevent double-firing
			script.detach('readystatechange', jsLoaded).detach('load', jsLoaded);
			progress( this, script.data('srcUrl'), script, 'js' );
		}
	}
	
	/**
		@private
		@function
		@description Start loading a CSS file
		
		@param {glow.net.ResourceRequest} request
		@param {string} cssUrl
	*/
	// This technique was found in http://code.google.com/p/ajaxsoft/source/browse/trunk/xLazyLoader
	function loadCss(request, cssUrl){
		var currentHostname,
			urlHostname,
			link = glow('<link rel="stylesheet" type="text/css" media="all" href="' + cssUrl + '" />').data('srcUrl', cssUrl);
		
		// we have to do something special for Gecko browsers when the css is from another domain
		if ( glow.env.gecko && /^(?:https?\:|\/\/)/.test(cssUrl) ) {
			currentHostname = location.hostname.replace('www.', '');
			urlHostname = cssUrl.replace(/https?:\/\/|www\.|:.*/g, '').replace(/\/.*/g, '');
			
			if (currentHostname !== urlHostname) {
				// ack, we have to cheat
				setTimeout(function() {
					cssLoaded.call(request, {
						attachedTo: link
					});
				}, 500);
			}
		}
		else {
			// two methods, one for IE (readystatechange), and one for opera
			link.on('readystatechange', cssLoaded, request).on('load', cssLoaded, request);
			// ...and one more for Moz & webkit
			(function pollCssRules() {
				try {
					link[0].sheet.cssRules;
					// we'll error before the next line if CSS hasn't loaded
					cssLoaded.call(request, {
						attachedTo: link
					});
				}
				catch (e) {
					if ( !link.data('loaded') ) {
						setTimeout(pollCssRules, 20);
					}
				};
			})();
		}
		
		//link[0].href = cssUrl;
		link.prependTo('head');
	}
	
	/**
		@private
		@function
		@description Process a loaded stylesheet.
			'this' is the ResourceRequest
	*/
	function cssLoaded(event) {
		var link = glow(event.attachedTo),
			linkElm = link[0],
			readyState = linkElm.readyState;
		
		if ( !readyState || readyState === 'loaded' || readyState === 'complete' ) {
			// just incase there's a timeout still waiting
			if ( link.data('loaded') ) {
				return;
			}
			link.data('loaded', true);
			
			// remove events to prevent double-firing
			link.detach('readystatechange', cssLoaded).detach('load', cssLoaded);
			progress( this, link.data('srcUrl'), link, 'css' );
		}
	}
	
	
	/**
		@name glow.net.ResourceRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when all the requested items have completed.
	*/
 
	/**
		@name glow.net.ResourceRequest#event:progress
		@event
		@description Fired when a single resource loads.
		
		@param {glow.events.Event} event Event Object
			@param {string} event.url Url of the loaded resource.
			@param {glow.NodeList} event.resource The element used to load the resource.
				This will be a `<script>`, `<link>`, or `<img>` element.
			@param {string} event.type 'js', 'css' or 'img'.
	*/
	
	/**
		@name glow.net.getResources
		@function
		@description Load scripts, images & CSS.
			Files can be loaded from other domains.
			
			Note: Due to a cross-browser restriction, 'load' may fire before
			CSS files from another domain are fully loaded in Gecko browsers.
	 
		@param {string[]|string|Object} url
			Url(s) to load. Urls ending in ".css" are assumed to be CSS files,
			Urls ending in ".js" are assumed to be JavaScript. All other files
			will be treated as images.
			
			You can provide an object in the form `{js: [], css: [], img: []}` to
			be explicit about how to treat each file.
			
		@returns {glow.net.ResourceRequest}
	 
		@example
			// load a single CSS file with a callback specified
			glow.net.getResources('/styles/custom.css').on('load', function() {
				// CSS has now loaded
			});
			
		@example
			// load a single CSS file with a callback specified
			glow.net.getResources([
				'/imgs/whatever.png',
				'/style/screen.css',
			]).on('load', function() {
				// CSS & image now loaded
			});
			
		@example
			// load multiple files by specifying and array
			glow.net.getResources({
				js: ['http://www.server.com/script', 'http://www.server.com/anotherScript'],
				img: ['http://www.server.com/product4/thumb']
			}).on('progress', function(event) {
				// update a progress meter
			}).on('load', function(response){
				// files now loaded
			});
	*/
	net.getResources = function(urls, opts) {
		/*!debug*/
			if (arguments.length < 1 && arguments.length > 2) {
				glow.debug.warn('[wrong count] glow.net.getResources expects 1 or 2 arguments, not ' + arguments.length + '.');
			}
		/*gubed!*/
		return new glow.net.ResourceRequest(urls, opts);
	};
	
	glow.net.ResourceRequest = ResourceRequest;	
});