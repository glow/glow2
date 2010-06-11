Glow.provide(function(glow) {
	var undefined,
		XhrRequestProto,
		events = glow.events,
		removeAllListeners = events.removeAllListeners;
	
	/**
		@private
		@function
		@description Creates an XMLHttpRequest transport
		@returns XMLHttpRequest
	*/
	var xmlHTTPRequest = window.ActiveXObject ?
		function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		} :
		function() {
			return new XMLHttpRequest();
		};
		
	/**
		@private
		@function
		@description Apply option object defaults.
		
		@param {object} opts Options object to apply defaults to.
		@param {string} method HTTP method.
		
		@returns {object} New opts object with defaults applied.
	*/
	function applyOptsDefaults(opts, method) {
		opts = glow.util.apply({
			headers: {}
		}, opts);
		
		var headers = opts.headers;
		
		// convert data to string
		if (typeof opts.data === 'object') {
			opts.data = glow.util.encodeUrl(opts.data);
		}
		
		// add requested with header if one hasn't been added
		if ( !headers['X-Requested-With'] ) {
			headers['X-Requested-With'] = 'XMLHttpRequest';
		}
		
		if (method !== 'GET' && !headers["Content-Type"]) {
			headers["Content-Type"] = 'application/x-www-form-urlencoded;';
		}
		
		return opts;
	}
	
	/**
		@name glow.net.XhrRequest
		@class
		@param {string} method The HTTP method to use for the request.
			Methods are case sensitive in some browsers.
		@param {string} url Url to make the request to.
			This can be a relative path. You cannot make requests for files on
			other domains (including sub-domains). For cross-domain requests, see
			{@link glow.dom.getJsonp} and {@link glow.dom.crossDomainGet}.
		@param {Object} [opts] Options object
			@param {Object} [opts.headers] A hash of headers to send along with the request.
				eg `{'Accept-Language': 'en-gb'}`
			@param {boolean} [opts.cacheBust=false] Prevent the browser returning a cached response.
				If true, a value is added to the query string to ensure a fresh version of the
	 			file is being fetched.
			@param {number} [opts.timeout] Time to allow for the request in seconds.
				No timeout is set by default. Once the time is reached, the error
				event will fire with a '408' status code.
			@param {boolean} [opts.forceXml=false] Treat the response as XML.
				This will allow you to use {@link glow.net.XhrResponse#xml response.xml()}
				even if the response has a non-XML mime type.
			@param {Object|string} [opts.data] Data to send.
				This can be either a JSON-style object or a urlEncoded string.
				
		@description Create an XHR request.
			Most common requests can be made using shortcuts methods in {@link glow.net},
			such as {@link glow.net.get}.
		
		@example
			new glow.net.XhrRequest('DELETE', 'whatever.php', {
				timeout: 10
			}).on('load', function(response) {
				alert( response.text() );
			});
	*/
	function XhrRequest(method, url, opts) {
		this._opts = opts = applyOptsDefaults(opts, method);
		
		var request = this,
			nativeRequest = request.nativeRequest = xmlHTTPRequest(), //request object
			i;

		// add the cacheBust to the url
		if (opts.cacheBust) {
			url = url + (url.indexOf('?') === -1 ? '?' : '&') + 'cachebuster=' + new Date().valueOf();
		}

		request.complete = false;
		
		//open needs to go first to maintain cross-browser support for readystates
		nativeRequest.open(method, url, true);
 
		//add custom headers
		for (i in opts.headers) {
			nativeRequest.setRequestHeader( i, opts.headers[i] );
		}
		
		// force the reponse to be treated as xml
		// IE doesn't support overrideMineType, we need to deal with that in {@link glow.net.XhrResponse#xml}
		if (opts.forceXml && nativeRequest.overrideMimeType) {
			nativeRequest.overrideMimeType('application/xml');
		}
		
		//sort out the timeout if there is one
		if (opts.timeout) {			 
			request._timeout = setTimeout(function() {
				var response = new glow.net.XhrResponse(request, true);
				request.abort().fire('error', response);
			}, opts.timeout * 1000);
		}
		
		nativeRequest.onreadystatechange = function() {
			if (nativeRequest.readyState === 4) {
				var response = new glow.net.XhrResponse(request);
				
				//clear the timeout
				clearTimeout(request._timeout);
				
				//set as completed
				request.completed = true;
				request.fire(response.successful ? 'load' : 'error', response);
				
				// prevent parent scopes leaking (cross-page) in IE
				nativeRequest.onreadystatechange = new Function();
				removeAllListeners(request);
			}
		};
		
		// make sure it doesn't complete before listeners are attached
		setTimeout(function() {
			nativeRequest.send(opts.data || null);
		}, 0);
	}
	glow.util.extend(XhrRequest, events.Target);
	XhrRequestProto = XhrRequest.prototype;
	
	/**
		@name glow.net.XhrRequest#_timeout
		@private
		@description setTimeout ID
		@type number
	*/
	
	/**
		@name glow.net.XhrRequest#complete
		@description Boolean indicating whether the request has completed
		@example
			// request.complete with an asynchronous call
			var request = glow.net.get(
				"myFile.html").on('load', 
				function(response){
					alert(request.complete); // returns true
				})
				
					
		@type boolean
	*/
	
	/**
		@name glow.net.XhrRequest#nativeRequest
		@description The request object from the browser.
			This may not have the same properties and methods across user agents.
			Also, this will be undefined if the request originated from getJsonp.
			
		@type Object
	*/
	
	/**
		@name glow.net.XhrRequest#abort
		@function
		@description Aborts a request
			The load & error events will not fire.
		@example
			var request = glow.net.get('myFile.html').on('load', function(response) {
				//handle response
			}).on('abort', function() {
				alert('Something bad happened. The request was aborted.');
			});
			
			request.abort(); // alerts "Something bad happened.  The request was aborted"
		@returns this
	*/
	XhrRequestProto.abort = function() {
		if ( !this.completed && !this.fire('abort').defaultPrevented() ) {
			clearTimeout(this._timeout);
			this.nativeRequest.onreadystatechange = new Function();
			removeAllListeners(this);
		}
		return this;
	};
		 
	/**
		@name glow.net.XhrRequest#event:load
		@event
		@param {glow.net.XhrResponse} response
		@description Fired when the request is sucessful
			This will be fired when request returns with an HTTP code of 2xx. 
	*/
 
	/**
		@name glow.net.XhrRequest#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted
			If you cancel the default (eg, by returning false) the request
			will continue.
	*/
 
	/**
		@name glow.net.XhrRequest#event:error
		@event
		@param {glow.net.XhrResponse} response
		@description Fired when the request is unsucessful
			This will be fired when request returns with an HTTP code which
			isn't 2xx or the request times out.
	*/
	
	glow.net.XhrRequest = XhrRequest;
});