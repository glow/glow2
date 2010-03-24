Glow.provide(function(glow) {
	RequestProto,
	Request = glow.net.Request;
		
	/**
	* @name glow.net.Request
	* @class
	* @description Returned by {@link glow.net.post post}, {@link glow.net.get get} async requests and {@link glow.net.loadScript loadScript}
	* @glowPrivateConstructor There is no direct constructor, since {@link glow.net.post post} and {@link glow.net.get get} create the instances.
	*/
	 
	 
	 // make event shortcuts available (on)
	glow.util.extend(Request, glow.events.Target);
	
	 
	/**
	* @name glow.net.Request#event:load
	* @event
	* @param {glow.events.Event} event Event Object
	* @description Fired when the request is sucessful
	*   For a get / post request, this will be fired when request returns
	*   with an HTTP code of 2xx. 
	*/
 
	/**
	* @name glow.net.Request#event:abort
	* @event
	* @param {glow.events.Event} event Event Object
	* @description Fired when the request is aborted
	*   If you cancel the default (eg, by returning false) the request
	*   will continue.
	* @description Returned by {@link glow.net.post glow.net.post}, {@link glow.net.get glow.net.get} async requests and {@link glow.net.loadScript glow.net.loadScript}
	* @see <a href="../furtherinfo/net/net.shtml">Using glow.net</a>
	* @glowPrivateConstructor There is no direct constructor, since {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get} create the instances.
	*/
 
	/**
	* @name glow.net.Request#event:error
	* @event
	* @param {glow.events.Event} event Event Object
	* @description Fired when the request is unsucessful
	*   For a get/post request, this will be fired when request returns
	*   with an HTTP code which isn't 2xx or the request times out. loadScript
	*   calls will fire 'error' only if the request times out.
	*/
 
 
	/*
	 We don't want users to create instances of this class, so the constructor is documented
	 out of view of jsdoc
 
	@param {Object} requestObj
		Object which represents the request type.
		For XHR requests it should be an XmlHttpRequest object, for loadScript
		requests it should be a number, the Index of the callback in glow.net._jsonCbs
	@param {Object} opts
		Zero or more of the following as properties of an object:
		@param {Function} [opts.onLoad] Called when the request is sucessful
		@param {Function} [opts.onError] Called when a request is unsucessful
		@param {Function} [opts.onAbort] Called when a request is aborted
 
	*/
		
	/**
		* @name glow.net.Request#complete
			 * @description Boolean indicating whether the request has completed
			 * @example
				// request.complete with an asynchronous call
				var request = glow.net.get(
					"myFile.html").on('load', {
					function(response){
						alert(request.complete); // returns true
					}) 
					
			 * @type Boolean
			 */
		
	/**
				 * @name glow.net.Request#nativeRequest
				 * @description The request object from the browser.
				 *   This may not have the same properties and methods across user agents.
				 *   Also, this will be undefined if the request originated from loadScript.
				 * @example
				var request = glow.net.get(
					"myFile.html").on('load', {
					function(response){
						alert(request.NativeObject); // returns Object()
					});
					
				 * @type Object
				 */
	
	/**
			@name glow.net.Request#send
			@function
			@description Sends the request.
				This is done automatically unless the defer option is set
			@example
				var request = glow.net.get(
					"myFile.html").on('load', {
					function(response){
						defer: true
					}); 
					
				request.send(); // returns "Loaded"
			@returns {Object}
				This for async requests or a response object for sync requests
			*/
	
	/**
			 *	@name glow.net.Request#abort
			 *	@function
			 *	@description Aborts an async request
			 *		The load & error events will not fire. If the request has been
			 *		made using {@link glow.net.loadScript loadScript}, the script
			 *		may still be loaded but	the callback will not be fired.
			 * @example
				var request = glow.net.get(
					"myFile.html").on('load', {
					function(response){
						async: true,
						defer: true
					}).on('abort',{
						function() {
							alert("Something bad happened.  The request was aborted.");
						}
					});  
				request.abort(); // returns "Something bad happened.  The request was aborted"
			 *	@returns this
			 */
	
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
		
	glow.net.Request = Request;
}