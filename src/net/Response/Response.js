/**
	@name glow.net.Response
	@namespace
	@description Provided in callbacks to {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get}
*/
Glow.provide(function(glow) {
	ResponseProto;
		/**
		@name glow.net.Response
		@class
		@description Provided in callbacks to {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get}
		@see <a href="../furtherinfo/net/net.shtml">Using glow.net</a>
 
		@glowPrivateConstructor There is no direct constructor, since {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get} create the instances.
		*/
		/*
		 These params are hidden as we don't want users to try and create instances of this...
 
		 @param {XMLHttpRequest} nativeResponse
		 @param {Boolean} [timedOut=false] Set to true if the response timed out
		 @param {glow.net.Request} [request] Original request object
		*/
		
		
		/**
			@name glow.net.Response#nativeResponse
			@description The response object from the browser.
				This may not have the same properties and methods across user agents.
			@type Object
			*/
		/**
			@name glow.net.Response#status
			@description HTTP status code of the response
			@type Number
			*/
		/**
			 * @name glow.net.Response#timedOut
			 * @description Boolean indicating if the requests time out was reached.
			 * @type Boolean
			 */
		
		/**
			 * @name glow.net.Response#wasSuccessful
			 * @description  Boolean indicating if the request returned successfully.
			 * @type Boolean
			 */
		
		/**
			@name glow.net.Response#text
			@function
			@description Gets the body of the response as plain text
			@returns {String}
				Response as text
			*/
		
		/**
			@name glow.net.Response#xml
			@function
			@description Gets the body of the response as xml
			@returns {xml}
				Response as XML
			*/
		
		/**
			@name glow.net.Response#json
			@function
			@description Gets the body of the response as a json object
 
			@param {Boolean} [safeMode=false]
				If true, the response will be parsed using a string parser which
				will filter out non-JSON javascript, this will be slower but
				recommended if you do not trust the data source.
 
			@returns {Object}
			*/
		
		/**
			@name glow.net.Response#header
			@function
			@description Gets a header from the response
 
			@param {String} name
				Header name
 
			@returns {String}
				Header value
 
			@example var contentType = myResponse.header("Content-Type");
			*/
		
		/**
			@name glow.net.Response#statusText
			@function
			@description Gets the meaning of {@link glow.net.Response#status myResponse.status}
 
			@returns {String}
			*/
	glow.net.Response = Response;
};