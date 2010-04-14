Glow.provide(function(glow) {
	var undefined,
		ResourceRequestProto,
		ResourceResponseProto,
		net = glow.net,
		totalRequests = 0,
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
		
		return new glow.net.ResourceRequest(urls, opts);
		
	};
	
	/**
		@name glow.net.ResourceRequest
		@class
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	function ResourceRequest(urls, opts) {
		var type,
			extension = (/[.]/.exec(urls)) ? /[^.]+$/.exec(urls) : undefined,
			totalImages = urls.length;
			
		
		for(var i = 0; i < totalResources; i++){	
			if(extension == 'css'){
				var request = loadCss([urls], this)
			}
			else{
				var request = loadImages([urls], this)
			}
		}
		
		
	
		
	}
	function loadImages(images, request){

		 
		   // initialize internal state.
		   this.numberLoaded = 0;
		   this.numberProcessed = 0;
		   this.allImages = new Array;
		 
		   // record the number of images.
		   this.totalImages = images.length;
	
		   // for each image, call preload()
		for ( var i = 0; i < totalImages; i++ ){
			var oImage = new Image;
			this.allImages.push(oImage.src);
				   
					// set up event handlers for the Image object
					oImage.onload = function() {
						request.fire('progress', oImage.src);
						totalRequests++
						console.log(totalImages);
						if(totalRequests == totalImages){
							var response = new glow.net.ResourceResponse(this.allImages);
							console.log(allImages);
							request.fire('load', response);
						};
					
					}
					oImage.onerror = function() { request.fire('error') };
					
					oImage.onabort = function() { request.fire('abort') };
	
					oImage.src = images[i];
					
		   }
			
			return(allImages);
		}
	
	function loadCss(source, request){
		var onLoad = ResourceRequest._progress;
		
		var totalFiles = source.length;
		
		for (var i = 0; i < totalFiles; i++){

			
			var link = glow('<link />').attr({
					rel: "stylesheet",
					media: "screen",
					type: 'text/css',
					href: source
			  });
			 if (("onload" in link) && !Browser.Engines.webkit()) {
				if (onLoad) link.onload = request.fire('progress');
			  } else {
				(function() {
				  try {
					link.sheet.cssRules;
				  } catch (e) {
					setTimeout(arguments.callee, 100);
					return;
				  };
				  if (onLoad) request.fire('progress');
				})();
			  }
			
		
			
			request.fire('load');
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
	
	
	
	
	function ResourceResponse(image) { this._text = image; }
			
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
		return glow(this._text).length;
	}
	
	glow.net.ResourceResponse = ResourceResponse;
});