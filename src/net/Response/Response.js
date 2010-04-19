Glow.provide(function(glow) {
	var ResponseProto;
	
	/**
	@name glow.net.Response
	@class
	@description Provided in callbacks to {@link glow.net.post glow.net.post} and {@link glow.net.get glow.net.get}

 
	@glowPrivateConstructor There is no direct constructor.
	*/
	
	/*
	These params are hidden as we don't want users to try and create instances of this...
 
	@param {XMLHttpRequest} nativeResponse
	@param {Boolean} [timedOut=false] Set to true if the response timed out
	@param {glow.net.Request} [request] Original request object
	*/
	function Response(nativeResponse, timedOut, request) {
		console.log("response")
		//run Event constructor
		//events.Event.call(this);
			
		/**
		@name glow.net.Response#_request
		@private
		@description Original request object
		@type glow.net.Request
		*/
		
		this._request = request;
			
		/**
		@name glow.net.Response#nativeResponse
		@description The response object from the browser.
			This may not have the same properties and methods across user agents.
		@type Object
		*/
		
		this.nativeResponse = nativeResponse;
		
		/**
		@name glow.net.Response#status
		@description HTTP status code of the response
		@type Number
		*/
		
		//IE reports status as 1223 rather than 204, for laffs
		this.status = timedOut ? 408 :
			nativeResponse.status == 1223 ? 204 : nativeResponse.status;

		/**
		@name glow.net.Response#timedOut
		@description Boolean indicating if the requests time out was reached.
		@type Boolean
		*/
		
		this.timedOut = !!timedOut;

		/**
		@name glow.net.Response#wasSuccessful
		@description  Boolean indicating if the request returned successfully.
		@type Boolean
		*/
			
		this.wasSuccessful = (this.status >= 200 && this.status < 300) ||
		//from cache
		this.status == 304 ||
		//watch our for requests from file://
		(this.status == 0 && nativeResponse.responseText);

	}
	
	
	glow.util.extend(Response, glow.events.Target);
	ResponseProto = Response.prototype;
	

		
		/**
			@name glow.net.Response#text
			@function
			@description Gets the body of the response as plain text
			@returns {String}
				Response as text
		*/
	
		ResponseProto.text = function() {
			return this.nativeResponse.responseText;
		};
		
		/**
		@name glow.net.Response#xml
		@function
		@description Gets the body of the response as xml
		@returns {xml}
			Response as XML
		*/
		
		ResponseProto.xml = function() {
			var nativeResponse = this.nativeResponse;
				
			if (
				// IE fails to recognise the doc as XML in some cases
				( glow.env.ie && shouldParseAsXml.call(this) )
				// If the _forceXml option is set, we need to turn the response text into xml
				|| ( this._request._forceXml && !this._request.nativeRequest.overrideMimeType && window.ActiveXObject )
			) {
				var doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.loadXML( nativeResponse.responseText );
				return doc;
			}
			else {
				// check property exists
				if (!nativeResponse.responseXML) {
					throw new Error(STR.XML_ERR);
				}
				return nativeResponse.responseXML;
			}				
		};

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
		
		ResponseProto.json = function(safe) {
			return glow.util.decodeJson(this.text(), {safeMode:safe});
		};

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
		
		ResponseProto.header = function(name) {
			return this.nativeResponse.getResponseHeader(name);
		};

		/**
		@name glow.net.Response#statusText
		@function
		@description Gets the meaning of {@link glow.net.Response#status myResponse.status}

		@returns {String}
		*/
		ResponseProto.statusText = function() {
			return this.timedOut ? "Request Timeout" : this.nativeResponse.statusText;
		};
	
	
	glow.net.Response = Response;
});