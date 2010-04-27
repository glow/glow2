Glow.provide(function(glow) {
	var undefined,
		RequestProto,
		events = glow.events;
		
	/**
	@name glow.net.Request
	@class
	@description Returned by {@link glow.net.post post}, {@link glow.net.get get} async requests and {@link glow.net.loadScript loadScript}
	@glowPrivateConstructor There is no direct constructor, since {@link glow.net.post post} and {@link glow.net.get get} create the instances.
	*/

	
	function Request(requestObj, opts) {
		
			/**
			@name glow.net.Request#_timeout
			@private
			@description timeout ID. This is set by makeXhrRequest or loadScript
			@type Number
			*/
			this._timeout = null;
			
			/**
			@name glow.net.Request#_forceXml
			@private
			@type Boolean
			@description Force the response to be treated as xml
			*/
			this._forceXml = opts.forceXml;
			
			// force the reponse to be treated as xml
			// IE doesn't support overrideMineType, we need to deal with that in {@link glow.net.Response#xml}
			if (opts.forceXml && requestObj.overrideMimeType) {
				requestObj.overrideMimeType('application/xml');
			}
			
			/**
			@name glow.net.Request#complete
			@description Boolean indicating whether the request has completed
			@example
			// request.complete with an asynchronous call
			var request = glow.net.get(
				"myFile.html", 
				{
					async: true,
						onload: function(response) {
						alert(request.complete); // returns true
					}
				}
			);
			alert(request.complete); // returns boolean depending on timing of asynchronous call

			// request.complete with a synchronous call
			var request = glow.net.get("myFile.html", {async: false;});
			alert(request.complete); // returns true
			
			@type Boolean
			*/
			this.complete = false;

			
				/**
				 * @name glow.net.Request#nativeRequest
				 * @description The request object from the browser.
				 *   This may not have the same properties and methods across user agents.
				 *   Also, this will be undefined if the request originated from loadScript.
				 * @example
				var request = glow.net.get(
					"myFile.html", 
					{
						async: true,
						onload: function(response) {
							alert(request.NativeObject); // returns Object()
						}
					}
				);
				 * @type Object
				 */
				this.nativeRequest = requestObj;
			


		
		
		
		 
	/**
		@name glow.net.Request#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is sucessful
			For a get / post request, this will be fired when request returns
			with an HTTP code of 2xx. 
	*/
 
	/**
		@name glow.net.Request#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted
			If you cancel the default (eg, by returning false) the request
			will continue.
		@description Returned by {@link glow.net.post glow.net.post}, {@link glow.net.get glow.net.get}, {@link glow.net.put glow.net.put} and {@link glow.net.delete glow.net.delete}

			glowPrivateConstructor There is no direct constructor, since {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get} create the instances.
	*/
 
	/**
		@name glow.net.Request#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is unsucessful
			For a get/post request, this will be fired when request returns
			with an HTTP code which isn't 2xx or the request times out. loadScript
			calls will fire 'error' only if the request times out.
	*/

 
	/*
	 We don't want users to create instances of this class, so the constructor is documented
	 out of view of jsdoc
 
		@param {Object} requestObj
			Object which represents the request type.
			For XHR requests it should be an XmlHttpRequest object, for loadScript
			requests it should be a number, the Index of the callback in glow.net._jsonCbs
 
	*/
		
	/**
		@name glow.net.Request#complete
		@description Boolean indicating whether the request has completed
		@example
			// request.complete with an asynchronous call
			var request = glow.net.get(
				"myFile.html").on('load', 
				function(response){
					alert(request.complete); // returns true
				})
				
					
		@type Boolean
			 */
		
	/**
		@name glow.net.Request#nativeRequest
		@description The request object from the browser.
			This may not have the same properties and methods across user agents.
			Also, this will be undefined if the request originated from loadScript.
		example
			var request = glow.net.get(
				"myFile.html").on('load', 
				function(response){
					alert(request.NativeObject); // returns Object()
				});
					
		@type Object
				 */
	}
	glow.util.extend(Request, glow.events.Target);
	RequestProto = Request.prototype;
	
	/**
		@name glow.net.Request#send
		@function
		@description Sends the request.
			This is done automatically unless the defer option is set
		@example
			var request = glow.net.get(
				"myFile.html").on('load', 
				function(response){
					// handle response
				}); 
					
			request.send(); // returns "Loaded"
		@returns {Object}
			This for async requests or a response object for sync requests
	*/
	RequestProto.send = function() {};
	/**
		@name glow.net.Request#abort
		@function
		@description Aborts an async request
			The load & error events will not fire. If the request has been
			made using {@link glow.net.loadScript loadScript}, the script
			may still be loaded but	the callback will not be fired.
		@example
			var request = glow.net.get(
				"myFile.html").on('load', 
				function(response){
					//handle response
				}).on('abort',
					function() {
						alert("Something bad happened.  The request was aborted.");
					}
				});  
			request.abort(); // returns "Something bad happened.  The request was aborted"
		@returns thistwixst
	*/
	RequestProto.abort = function() {
				if (!this.completed && !events.fire(this, 'abort').defaultPrevented()) {
					glow.net.abortRequest(this);
					this.fire('abort')
				}
				return this;
			};
	/**
		@name glow.net.Request#destroy
		@function
		@description Release memory from a {@link glow.net.loadScript} call.
				
			This is called automatically by {@link glow.net.loadScript loadScript}
			calls that have {callback} in the URL. However, if you are not using
			{callback}, you can use this method manually to release memory when
			the request has finished.
			 
		@example
			var request = glow.net.loadScript('http://www.bbc.co.uk/whatever.js');
			
		@returns this
			*/
	RequestProto.destroy = function() {
				var that = this;
				
				if (this._callbackIndex !== undefined) {
					// set timeout is used here to prevent a crash in IE7 (possibly other versions) when the script is from the filesystem
					setTimeout(function() {
						$( scriptElements[that._callbackIndex] ).destroy();
						scriptElements[that._callbackIndex] = undefined;
						delete scriptElements[that._callbackIndex];
					}, 0);
				}
				return this;
			};
	
		
		
		
		glow.net.Request = Request;
});