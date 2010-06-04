Glow.provide(function(glow) {
	var XhrResponseProto,
		util = glow.util;
	
	/**
		@name glow.net.XhrResponse
		@class
		@extends glow.events.Event
		@description The event object for {@link glow.net.XhrRequest}'s 'load' & 'error' events.
		@glowPrivateConstructor There is no direct constructor.
	*/
	
	/*
		These params are hidden as we don't want users to try and create instances of this...
	 
		@param {glow.net.XhrRequest} [request] Original request object
		@param {Boolean} [timedOut=false] Set to true if the response timed out
		
	*/
	function XhrResponse(request, timedOut) {
		var nativeResponse = this.nativeResponse = request.nativeRequest;
		this._request = request;
		
		//IE reports status as 1223 rather than 204, for laffs
		this.status = timedOut ? 408 :
			nativeResponse.status == 1223 ? 204 : nativeResponse.status;

		this.timedOut = !!timedOut;
			
		this.successful = (this.status >= 200 && this.status < 300) ||
			//from cache
			this.status == 304 ||
			//watch our for requests from file://
			(this.status == 0 && nativeResponse.responseText);
	}

	util.extend(XhrResponse, glow.events.Event);
	XhrResponseProto = XhrResponse.prototype;
	
	/**
		@name glow.net.XhrResponse#_request
		@private
		@description Original request object
		@type glow.net.XhrRequest
	*/
	
	/**
		@name glow.net.XhrResponse#nativeResponse
		@description The response object from the browser.
			This may not have the same properties and methods across user agents.
		@type XMLHttpRequest
	*/
	
	/**
		@name glow.net.XhrResponse#status
		@description HTTP status code of the response
		@type number
	*/

	/**
		@name glow.net.XhrResponse#timedOut
		@description Boolean indicating if the requests time out was reached.
		@type boolean
	*/
	
	/**
		@name glow.net.XhrResponse#successful
		@description  Boolean indicating if the request returned successfully.
		@type boolean
	*/
	
	/**
		@name glow.net.XhrResponse#text
		@function
		@description Gets the body of the response as plain text
		@returns {string}
	*/

	XhrResponseProto.text = function() {
		return this.nativeResponse.responseText;
	};
	
	/**
		@name glow.net.XhrResponse#xml
		@function
		@description Gets the body of the response as xml
		@returns {XML} 
	*/
	
	XhrResponseProto.xml = function() {
		var nativeResponse = this.nativeResponse;
		
		if (
			// IE 6 & 7 fail to recognise Content-Types ending +xml (eg application/rss+xml)
			// Files from the filesystem don't have a content type, but could be xml files, parse them to be safe
			glow.env.ie && (
				response.header("Content-Type").slice(-4) === '+xml' ||
				contentType === '' ||
				this._request._forceXml
			)
		) {
			var doc = new ActiveXObject("Microsoft.XMLDOM");
			doc.loadXML( nativeResponse.responseText );
			return doc;
		}
		else {
			return nativeResponse.responseXML;
		}				
	};
	
	/**
		@name glow.net.XhrResponse#json
		@function
		@description Gets the body of the response as a JSON object.
		
		@param {boolean} [safeMode=false]
			If true, the response will be parsed using a string parser which
			will filter out non-JSON javascript, this will be slower but
			recommended if you do not trust the data source.
	
		@returns {object}
	*/
	XhrResponseProto.json = function(safe) {
		return util.decodeJson(this.text(), {safeMode:safe});
	};
	
	/**
		@name glow.net.XhrResponse#nodeList
		@function
		@description Gets the body of the response as a {@link glow.NodeList}.
	
		@returns {glow.NodeList}
	*/
	XhrResponseProto.nodeList = function(safe) {
		return glow(
			glow.NodeList._strToNodes( this.text() )
		);
	};

	/**
		@name glow.net.XhrResponse#header
		@function
		@description Gets a header from the response.
	
		@param {string} name Header name
		@returns {string} Header value
	
		@example var contentType = myResponse.header("Content-Type");
	*/
	
	XhrResponseProto.header = function(name) {
		return this.nativeResponse.getResponseHeader(name);
	};

	/**
		@name glow.net.XhrResponse#statusText
		@function
		@description Gets the meaning of {@link glow.net.XhrResponse#status status}.
	
		@returns {string}
	*/
	XhrResponseProto.statusText = function() {
		return this.timedOut ? "Request Timeout" : this.nativeResponse.statusText;
	};
	
	glow.net.XhrResponse = XhrResponse;
});