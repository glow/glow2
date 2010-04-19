Glow.provide(function(glow) {
	var undefined,
		JsonpRequestProto,
		net = glow.net,
		emptyFunc = function(){},
		events = glow.events,
		/**
			 * @name glow.net.scriptElements
			 * @private
			 * @description Script elements that have been added via {@link glow.net.loadScript loadScript}
			 * @type Array
			 */
			scriptElements = [],
			/**
			 * @name glow.net.callbackPrefix
			 * @private
			 * @description Callbacks in _jsonCbs will be named this + a number
			 * @type String
			 */
			callbackPrefix = 'c',
			/**
			 * @name glow.net.globalObjectName
			 * @private
			 * @description Name of the global object used to store loadScript callbacks
			 * @type String
			 */
			globalObjectName = '_' + glow.UID + 'loadScriptCbs';
	/**
		@name glow.net.getJsonp
		@function
		@description Loads data by adding a script element to the end of the page
			This can be used cross domain, but should only be used with trusted
			sources as any javascript included in the script will be executed.
 
		@param {String} url
			Url of the script. An optional "{callback}" value may be added to the the querystring if the data source supports it.
		@param {Object} [opts]
			An object of options to use if "{callback}" is specified in the url.
			@param {Boolean} [opts.cacheBust=true] Allow a cached response
			@param {Number} [opts.timeout] Time to allow for the request in seconds
			@param {String} [opts.charset] Charset attribute value for the script
			
 
		@returns {glow.net.Request}
 
		@example
			// load script with a callback specified
			glow.net.getJsonp("http://www.server.com/json/tvshows.php?jsoncallback={callback}").on('load'), 
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
			
			url = opts.cacheBust ? url : noCacheUrl(url),
			
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
				//using setTimeout to stop Opera 9.0 - 9.26 from running the loaded script before other code
				//in the current script block
				if (glow.env.opera) {
					setTimeout(function() {
						if (script) { //script may have been removed already
							script.src = url;
						}
					}, 0);
				} else {
					script.src = url;
				}
				//add script to page
				document.body.appendChild(script);
				
				
			});

			return request;
		};
		
	/**
		@name glow.net.JsonpRequest
		@class
		@description Returned by {@link glow.net.getResources }
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.getResources} creates the instances.
	*/
	 
	function JsonpRequest(requestObj, opts) {
	/**
			 * @name glow.net.Request#_timeout
			 * @private
			 * @description timeout ID. This is set by makeXhrRequest or loadScript
			 * @type Number
			 */
			this._timeout = null;
			
			/*
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
			 * @name glow.net.Request#complete
			 * @description Boolean indicating whether the request has completed
			 * @example
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
			 * @type Boolean
			 */
			this.complete = false;

			if (typeof requestObj == "number") {
				/**
				 * @name glow.net.Request#_callbackIndex
				 * @private
				 * @description Index of the callback in glow.net._jsonCbs
				 *   This is only relavent for requests made via loadscript using the
				 *   {callback} placeholder
				 * @type Number
				 */
				this._callbackIndex = requestObj;
			} else {
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
			}
	 
	/**
		@name glow.net.JsonpRequest#event:load
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is sucessful
			For a get / post request, this will be fired when request returns
			with an HTTP code of 2xx. 
	*/
 
	/**
		@name glow.net.JsonpRequest#event:abort
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
		@name glow.net.JsonpRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is unsucessful
			For a get/post request, this will be fired when request returns
			with an HTTP code which isn't 2xx or the request times out. loadScript
			calls will fire 'error' only if the request times out.
	*/
	}
	glow.util.extend(JsonpRequest, glow.events.Target);
	JsonpRequestProto = JsonpRequest.prototype;
	
	JsonpRequestProto.abort = function() {
			glow.net.abortRequest(this);
			
		};
	
	
	glow.net.JsonpRequest = JsonpRequest;
});