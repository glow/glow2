Glow.provide(function(glow) {
	var undefined,
		ResourceRequestProto,
		ResourceResponseProto,
		net = glow.net,
		totalRequests = 0,
		totalResources = 0,
		emptyFunc = function(){};
		
	/**
		@name glow.net.getResources
		@function
		@description Loads an image or CSS file from the same or another domain.
 
		@param {String} url
			Url of the script. 
		@param {Object} [opts]
			@param {Boolean} [opts.useCache=false] Allow a cached response
			@param {Number} [opts.timeout] Time to allow for the request in seconds
			
 
		@returns {glow.net.Request}
 
		@example
			// load script with a callback specified
			glow.net.getResources("http://www.server.com/custom.css").on('load'), 
				function(data){
					// use data
				});
		*/
	net.getResources = function(urls, opts) {
		var request,
			opts = glow.net.populateOptions(opts);
		
		if(!urls.push){
			urls = [urls];
		}
		return new glow.net.ResourceRequest(urls, opts);
		
	};
	
	/**
		@name glow.net.ResourceRequest
		@class
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	function ResourceRequest(urls, opts) {
		totalResources = urls.length,
		totalRequests;
		
		for(var i = 0; i < totalResources; i++){
			var extension = (/[.]/.exec(urls[i])) ? /[^.]+$/.exec(urls[i]) : undefined,
				request;
			if(extension == 'css'){
				var request = _loadCss(urls[i], this)
			}
			else{
				var request = _loadImages(urls[i], this)
			}
		}
		
	}
	
	function _loadImages(images, request){
		var oImage = new Image;
		
		oImage.onload = function() {
			request.fire('progress', oImage.src);
			totalRequests++
			if(totalRequests == totalResources){
				var response = new glow.net.ResourceResponse(oImage.src, totalRequests)
				request.fire('load', response);
				}
		}
		oImage.onerror = function() {
			request.fire('error')
		};
					
		oImage.onabort = function() {
			request.fire('abort')
		};
	
		oImage.src = images;
					
		return(oImage);
		
	}
	
	
	
	function _loadCss(source, request){		
		var onLoad = ResourceRequest._progress,
			link = glow('<link />').attr({
					rel: "stylesheet",
					media: "screen",
					type: 'text/css',
					href: source
			  });
			
			// some browsers offer an onload method, so for those we let it use that
			if (("onload" in link) && !Browser.Engines.webkit()) {
				if (onLoad){
					link.onload = function(){
						request.fire('progress', source);
						totalRequests++
						if(totalRequests == totalResources){
							var response = new glow.net.ResourceResponse(link, totalRequests);
							request.fire('load', response);
						}
					}
				}
			  }
			// for browser that don't (that's most of them) we load after a timeout of 3s
			else {
				setTimeout(function () {
					request.fire('progress', source);
					totalRequests++
					if(totalRequests == totalResources){
						var response = new glow.net.ResourceResponse(link, totalRequests)
						request.fire('load', response);
					}
				}, 3000);
			}
			
			
			
		
		
		
		return link;
	}
	
	glow.util.extend(ResourceRequest, glow.events.Target);
	ResourceRequestProto = ResourceRequest.prototype;
	
	
	glow.net.ResourceRequest = ResourceRequest;
	
	
	/**
		@name glow.net.ResourceRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is sucessful
			For a get / post request, this will be fired when request returns
			with an HTTP code of 2xx. 
	*/
 
	/**
		@name glow.net.ResourceRequest#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted
			If you cancel the default (eg, by returning false) the request
			will continue.
		@description Returned by {@link glow.net.post glow.net.post}, {@link glow.net.get glow.net.get} async requests and {@link glow.net.loadScript glow.net.loadScript}
			@see <a href="../furtherinfo/net/net.shtml">Using glow.net</a>
			glowPrivateConstructor There is no direct constructor, since {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get} create the instances.
	*/
 
	/**
		@name glow.net.ResourceRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is unsucessful
			For a get/post request, this will be fired when request returns
			with an HTTP code which isn't 2xx or the request times out. loadScript
			calls will fire 'error' only if the request times out.
	*/

 
	/**
		@name glow.net.ResourceRequest#event:progress
		@event
		@param {glow.events.Event} event Event Object
		@returns {string} uri URI of the resourced that just completed
		@description Fired when a single resource completes.
	*/
	
	
	
	
	function ResourceResponse(resources, completed) {
		this._text = resources,
		this.completed = completed;
	}
			
	glow.util.extend(ResourceResponse, glow.events.Target);
			
	ResourceResponseProto = ResourceResponse.prototype;
			

	/**
		@name glow.net.ResourceRequest#element
		@description Provides a nodelist of completed items.
		@type {glow.NodeList}
	
	*/
	ResourceResponseProto.element = function() { return this._text; }
	
	/**
		@name glow.net.ResourceRequest#complete
		@description Reports total number of items completed
		@example
					
		@type Array
	*/
	ResourceResponseProto.completed = function() {
		return this._text;
	}
	
	glow.net.ResourceResponse = ResourceResponse;
});