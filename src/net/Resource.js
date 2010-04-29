Glow.provide(function(glow) {
	var undefined,
		ResourceRequestProto,
		ResourceResponseProto,
		net = glow.net;
		
	/**
		@name glow.net.getResources
		@function
		@description Loads image or CSS files from the same or another domain.
 
		@param {array|string} url
			Url of the script as a string or an array of urls.
		@param {Object} [opts]
			@param {Number} [opts.timeout] Time to allow for the request in seconds		
 
		@returns {glow.net.ResourceRequest}
 
		@example
			// load a single CSS file with a callback specified
			glow.net.getResources("http://www.server.com/custom.css").on('load', 
				function(response){
					// examine response
				});
				
		@example
			// load multiple files by specifying and array
			glow.net.getResources(
			["http://www.server.com/custom.css",
			http://www.anotherserver.com/myimage.jpg"]).on('load', 
				function(response){
					// examine response
				});
		*/
	net.getResources = function(urls, opts) {
		/*!debug*/
			if (arguments.length < 1) {
				glow.debug.warn('[wrong count] glow.net.getResources expects 0 or 1 argument, not ' + arguments.length + '.');
			}
		/*gubed!*/
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
		
		/**
		@private
		@property
		@description Total number of resources requests
		*/
		this._totalResources = urls.length,
		/**
		@private
		@property
		@description Total number of resources that have been successfully loaded.
		*/
		this._totalRequests = 0,
		i = this._totalResources, 
		this.allAssets = [];
		
		if (opts.timeout) {
			this._timeout = setTimeout(function() {
				//request.fire('error');			
			}, opts.timeout * 1000);
		}
		while(i--){
			var extension = (/[.]/.exec(urls[i])) ? /[^.]+$/.exec(urls[i]) : undefined,
				request;
			if(extension == 'css'){
				_loadCss(urls[i], this)
			}
			else if(extension == 'js'){
				_loadJs(urls[i], this);
			}
			else{
				_loadImage(urls[i], this)
			}
			
		}
		
		
		
	}
	
	/*
	 @name _progress
	 @private
	 @description Fires a progress event for a given request and also fire if all assets have loaded.
	*/
	function _progress(asset, elm, request){
		request.fire('progress', asset);
			request._totalRequests++
			request.allAssets.push(elm);
			if(request._totalRequests == request._totalResources){
				
				var response = new glow.net.ResourceResponse(request.allAssets, request._totalRequests)
				request.fire('load', response);
				
			}
	}
	
	function _loadImage(image, request){
		var oImage = new Image;
	
		oImage.onload = function() {
			var asset = oImage.src;
			_progress(asset, oImage, request);
		}
		
	
		oImage.src = image;
					
		return(oImage);
		
	}
	
	function _loadJs(source, request){
		var script = glow('<script></script>').attr({
					type: 'text/javascript',
					src: source
			  });
		script.onload = function() {
			var asset = oImage.src;
			_progress(source, script, request);
		}

			
		
	}
	
	function _loadCss(source, request){
		var link = glow('<link />').attr({
					rel: 'stylesheet',
					media: 'screen',
					type: 'text/css',
					href: source
			  });
			// some browsers offer an onload method, so for those we let it use that
			if ('onload' in link) {
				if (onLoad){
					link.onload = function(){
						_progress(source, link, request);
					}
				}
			  }
			// for browser that don't (that's most of them) we load after a timeout of 3s
			else {
				setTimeout(function () {
					_progress(source, link, request);
				}, 3000);
			}
		
	}
	
	glow.util.extend(ResourceRequest, glow.events.Target);
	ResourceRequestProto = ResourceRequest.prototype;
	
	
	glow.net.ResourceRequest = ResourceRequest;
	
	
	/**
		@name glow.net.ResourceRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when all the requested items have completed.
	*/

 
	/**
		@name glow.net.ResourceRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is unsucessful
			This is fired if the request timesout.
	*/

 
	/**
		@name glow.net.ResourceRequest#event:progress
		@event
		@param {glow.events.Event} event Event Object
		@returns {string} uri URI of the resourced that just completed
		@description Fired when a single resource completes.
	*/
	
	
	
	
	function ResourceResponse(resources, completed) {
		/**
		@name glow.net.ResourceRequest#nodes
		@description Provides a nodelist of completed items.
		@type {glow.NodeList}
	
		*/
		this.nodes = glow(resources),
		/**
		@name glow.net.ResourceRequest#complete
		@description Reports total number of items completed
		@example
					
		@type Array
		*/
		this.completed = completed;
	}
			
	

	
	glow.net.ResourceResponse = ResourceResponse;
});