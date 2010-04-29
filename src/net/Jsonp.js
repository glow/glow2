Glow.provide(function(glow) {
	var undefined,
		JsonpRequestProto,
		net = glow.net,
		emptyFunc = function(){},
		events = glow.events,
		/**
			 * @name scriptElements
			 * @private
			 * @description Script elements that have been added via {@link glow.net.getJsonp getJsonp}
			 * @type HTMLElement[]
			 */
			scriptElements = [],
			/**
			 * @name callbackPrefix
			 * @private
			 * @description Callbacks in _jsonCbs will be named this + a number
			 * @type string
			 */
			callbackPrefix = 'c',
			/**
			 * @name globalObjectName
			 * @private
			 * @description Name of the global object used to store getJsonp callbacks
			 * @type string
			 */
			globalObjectName = '_' + glow.UID + 'loadScriptCbs';
	/**
		@name glow.net.getJsonp
		@function
		@description Loads data by adding a script element to the end of the page
			This can be used cross domain, but should only be used with trusted
			sources as any javascript included in the script will be executed.
 
		@param {string} url
			Url of the script. "{callback}" must be added to the the querystring to ensure this method functions properly.
		@param {object} [opts]
			@param {number} [opts.timeout] Time to allow for the request in seconds
			@param {string} [opts.charset] Charset attribute value for the script
			
 
		@returns {glow.net.Response}
 
		@example
			// load script with a callback specified
			glow.net.getJsonp("http://www.server.com/json/tvshows.php?jsoncallback={callback}")
			.on('load'), 
				function(data){
					// use data
				});
		*/
	net.getJsonp = function(url, opts) {
		
		//id of the request
		var newIndex = scriptElements.length,
			//script element that gets inserted on the page
			script,
			//generated name of the callback, may not be used
			callbackName = callbackPrefix + newIndex,
			
			opts = glow.net.populateOptions(opts),		
			
			request = new glow.net.JsonpRequest(newIndex, opts),
			
			
			//the global property used to hide callbacks
			globalObject = window[globalObjectName] || (window[globalObjectName] = {});

			
			
				globalObject[callbackName] = function() {
			
					//clear the timeout
					request._timeout && clearTimeout(request._timeout);
					//set as completed
					request.completed = true;
					
					
					request.data = arguments;
				
					script = globalObject[callbackName] = undefined;
					delete globalObject[callbackName];
			
					var loadListeners = glow.events._getListeners(request).load;
				
					if(loadListeners){
						loadListeners = loadListeners.slice(0);
						var i = loadListeners.length;
						while(i--){
							loadListeners[i][0].apply(loadListeners[i][1], arguments);
						}
						
					}
					
				
					
				};
				url = glow.util.interpolate(url, {callback: globalObjectName + '.' + callbackName});
			

			

			script = scriptElements[newIndex] = document.createElement('script');
			if (opts.charset) {
				script.charset = opts.charset;
			}


			glow.ready(function() {
				//sort out the timeout
				if (opts.timeout) {
					request._timeout = setTimeout(function() {
						glow.net.abortRequest(request);
						
						var callbackIndex = request._callbackIndex;
						if (callbackIndex) {
							//clear callback
							window[globalObjectName][callbackPrefix + callbackIndex] = emptyFunc;
							//remove script element
							glow(scriptElements[callbackIndex]).destroy();
							
						}
						request.fire('error');
					}, opts.timeout * 1000);
					request.fire('abort');
				}
				
				script.src = url;
				
				//add script to page
				document.body.appendChild(script);
				
				
			});

			return request;
		};
		
	/**
		@name glow.net.JsonpRequest
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	 
	function JsonpRequest(request, opts) {
		/**
		@private
		@description timeout ID. This is set by makeXhrRequest or loadScript
			 * @type Number
			 */
			this._timeout = null;
			
			
			
			
			
		/**
		@name glow.net.JsonpRequest#complete
		@description Boolean indicating whether the request has completed
		@example

		var request = glow.net.getJsonp(
			"myFile.html").on('load', function(request){ 
				request.complete); // returns true
			});
				
		@type Boolean
		*/
			this.complete = false;


				/**
				 * @name glow.net.JsonpRequest#_callbackIndex
				 * @private
				 * @description Index of the callback in glow.net._jsonCbs
				 *   This is only relavent for requests made via loadscript using the
				 *   {callback} placeholder
				 * @type Number
				 */
				this._callbackIndex = request;
			
	 
	
	}
	
	/**
		@name glow.net.JsonpRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is sucessful
			
	*/
 
	/**
		@name glow.net.JsonpRequest#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted


	*/
 
	/**
		@name glow.net.JsonpRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request times out
			getJsonp calls will fire 'error' only if the request times out.
	*/
	
	glow.util.extend(JsonpRequest, glow.events.Target);
	JsonpRequestProto = JsonpRequest.prototype;
	
	/**
		@name glow.net.JsonpRequest#abort
		@function
		@description Will attempt to abort the request
			
	*/
	JsonpRequestProto.abort = function() {
			glow.net.abortRequest(this);
			this.fire('abort')
		};
	
	
	glow.net.JsonpRequest = JsonpRequest;
});