Glow.provide(function(glow) {
	var undefined,
		ResourceRequestProto,
		net = glow.net,
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
	net.getResources = function(url, opts) {
		var request,
			opts = glow.net.populateOptions(opts),
			type,
			extension = (/[.]/.exec(url)) ? /[^.]+$/.exec(url) : undefined;

		
		switch(String(extension)){
			case 'jpg':
			case 'jpeg':
			case 'tiff':
			case 'png':				
				type = "image";
				break;
			case 'css':
				type = "css";
				break;
			default: alert("can't work with that filetype");			
		}
	
		request = new glow.net.ResourceRequest(url, opts, type);
		
		console.log(request);
		return request;
		
	};
	
	/**
		@name glow.net.ResourceRequest
		@class
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	function ResourceRequest(url, opts, type) {
		console.log(url);
		console.log(opts);
		console.log(type);
		
		
		if(type == "image"){
			var request = loadImages([url], this)
		}
		else{
			var request = loadCss([url], this)
		}
		
		console.log(request);
		
				
		
	}
	function loadImages(images, request)
		{
		   // store the call-back
		  // this.callback = callback;
		 
		   // initialize internal state.
		   this.numberLoaded = 0;
		   this.numberProcessed = 0;
		   this.allImages = new Array;
		 
		   // record the number of images.
		   this.totalImages = images.length;
			console.log(this.totalImages);
		   // for each image, call preload()
		   for ( var i = 0; i < totalImages; i++ ){
			 var oImage = new Image;
					this.allImages.push(oImage);
				   
					// set up event handlers for the Image object
					oImage.onload = function() {  request.fire('progress'); };

					oImage.onerror = function() { request.fire('error'); };
					
					oImage.onabort = function() { request.fire('abort'); };
	
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
				if (onLoad) link.onload = ResourceRequest._progress(request);
			  } else {
				(function() {
				  try {
					link.sheet.cssRules;
				  } catch (e) {
					setTimeout(arguments.callee, 100);
					return;
				  };
				  if (onLoad) ResourceRequest._progress(request);
				})();
			  }
			
		
			
			ResourceRequest._loaded(request);
		}
		
		return link;
	}
	
	glow.util.extend(ResourceRequest, glow.events.Target);
	ResourceRequestProto = ResourceRequest.prototype;
	
	
	glow.net.ResourceRequest = ResourceRequest;
	
	ResourceRequest._loaded = function(){
		console.log('loaded')
	}
	
	ResourceRequest._progress = function(request){
		request.fire('progress');
		console.log('progress');
		
	
	}
	ResourceRequest._error = function(){
		request.fire('error');
	}
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
	
	/**
		@name glow.net.ResourceRequest#complete
		@description Reports total number of items completed
		@example
					
		@type Array
	*/
	
	/**
		@name glow.net.ResourceRequest#nodes
		@description
		@type {glow.NodeList}
	
	*/
		
});