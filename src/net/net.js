/**
	@name glow.net
	@namespace
	@description AJAX methods
*/
Glow.provide(function(glow) {
	var net = {},
		undefined;
	
	var STR = {
				XML_ERR:'Cannot get response as XML, check the mime type of the data',
				POST_DEFAULT_CONTENT_TYPE:'application/x-www-form-urlencoded;'
			},
			endsPlusXml = /\+xml$/,			
			events = glow.events,
			emptyFunc = function(){},
			idCount = 1;
 
		/**
		 * @name glow.net.xmlHTTPRequest
		 * @private
		 * @function
		 * @description Creates an xmlHTTPRequest transport
		 * @returns Object
		 */
		function xmlHTTPRequest() {
			//try IE first. IE7's xmlhttprequest and XMLHTTP6 are broken. Avoid avoid avoid!
			if (window.ActiveXObject) {
				return (xmlHTTPRequest = function() { return new ActiveXObject('Microsoft.XMLHTTP'); })();
			} else {
				return (xmlHTTPRequest = function() { return new XMLHttpRequest(); })();
			}
		}
 
		/**
		 * @name glow.net.populateOptions
		 * @private
		 * @function
		 * @description Adds defaults to get / post option object
		 * @param {Object} opts Object to add defaults to
		 * @returns Object
		 */
		net.populateOptions = function(opts) {
			var newOpts = glow.util.apply({
				headers: {},				
				async: true,
				cacheBust: true,
				data: null,
				forceXml: false
			}, opts || {} );
 
			// add requested with header if one hasn't been added
			if ( !('X-Requested-With' in newOpts.headers) ) {
				newOpts.headers['X-Requested-With'] = 'XMLHttpRequest';
			}
			return newOpts;
		}
 
		/*
		PrivateMethod: noCacheUrl
			Adds random numbers to the querystring of a url so the browser doesn't use a cached version
		*/
 
		function noCacheUrl(url) {
			return [url, (/\?/.test(url) ? "&" : "?"), "a", new Date().getTime(), parseInt(Math.random()*100000)].join("");
		}
 
		/*
		PrivateMethod: makeXhrRequest
			Makes an http request
		*/
		/**
		 * @name glow.net.makeXhrRequest
		 * @private
		 * @function
		 * @description Makes an xhr http request
		 * @param {String} method HTTP Method
		 * @param {String} url URL of the request
		 * @param {Object} Options, see options for {@link glow.net.get}
		 * @returns Object
		 */
		function makeXhrRequest(method, url, opts) {
			
			var req = xmlHTTPRequest(), //request object
				data = opts.data && (typeof opts.data == "string" ? opts.data : glow.util.encodeUrl(opts.data)),
				i,
				request = new glow.net.Request(req, opts);
		
 
			if (!opts.cacheBust) {
				url = noCacheUrl(url);
			}
 
			//open needs to go first to maintain cross-browser support for readystates
			req.open(method, url, opts.async);
 
			//add custom headers
			for (i in opts.headers) {
				req.setRequestHeader(i, opts.headers[i]);
			}

			function send() {
				request.send = emptyFunc;

					//sort out the timeout if there is one
					if (opts.timeout) {
						 
						request._timeout = setTimeout(function() {
							
							abortRequest(request);
							
							var response = new glow.net.Response(req, true, request);
							request.fire("error", response);
						}, opts.timeout * 1000);
					}
					
					req.onreadystatechange = function() {
					
						if (req.readyState == 4) {
							//clear the timeout
							request._timeout && clearTimeout(request._timeout);
							//set as completed
							request.completed = true;
							var response = new glow.net.Response(req, false, request);

							if (response.wasSuccessful) {
							
								request.fire("load", response);
								
							} else {
								request.fire("error", response);
							}
							// prevent parent scopes leaking (cross-page) in IE
							req.onreadystatechange = new Function();
						}
					};
					
					req.send(data);
					return request;
				
			}
 
			request.send = send;
			return send();
		}
		/**
		@name glow.net.abortRequest
		@private
		@function
		@description Aborts the request
			Doesn't trigger any events
		
		@param {glow.net.Request} req Request Object
		@returns this
		*/
		net.abortRequest = function(req) {
			var nativeReq = req.nativeRequest;

			//clear timeout
			req._timeout && clearTimeout(req._timeout);
			//different if request came from loadScript
			if (nativeReq) {
				//clear listeners
				// prevent parent scopes leaking (cross-page) in IE
				nativeReq.onreadystatechange = new Function();
				nativeReq.abort();
			}
			
			
		}
	/**
	@name glow.net.get
	@function
	@description Makes an HTTP GET request to a given url
 
	@param {String} url
		URL to make the request to. This can be a relative path. You cannot make requests
		for files on other domains, to do that you must put your data in a javascript
		file and use {@link glow.net.loadScript} to fetch it or see {@link glow.net.xDomainGet}.
	@param {Object} opts
		Options Object of options.
		@param {Object} [opts.headers] A hash of headers to send along with the request
			@example {"Accept-Language": "en-gb"}
		@param {Boolean} [opts.cacheBust=true] Allow a cached response
			If false, a random number is added to the query string to ensure a fresh version of the file is being fetched
		@param {Number} [opts.timeout] Time to allow for the request in seconds
			No timeout is set by default. Only applies for async requests. Once
			the time is reached, the error event will fire with a "408" status code.
		@param {Boolean} [opts.forceXml=false] Treat the response as XML.
			This will allow you to use {@link glow.net.Response#xml response.xml()}
			even if the response has a non-XML mime type.
 
	@returns {glow.net.Request}
		A request object is returned
 
	@example
		glow.net.get("myFile.html").on("load", 
				function(response){
					alert("Got file:" +response.text());
				}).on("error",
				function(response){
					alert("Something went wrong:" +response.text());;
				});
		
	*/
	net.get = function(url, opts) {
			
		opts = glow.net.populateOptions(opts);
		
			return makeXhrRequest('GET', url, opts);
		};
	
	
	
	
	/**
	@name glow.net.post
	@function
	@description Makes an HTTP POST request to a given url
 
	@param {String} url
		Url to make the request to. This can be a relative path. You cannot make requests
		for files on other domains, to do that you must put your data in a javascript
		file and use {@link glow.net.loadScript} to fetch it or see {@link glow.net.xDomainPost}.
	@param {Object|String} data
		Data to post, either as a JSON-style object or a urlEncoded string
	@param {Object} opts
		Same options as {@link glow.net.get}
 
	@returns {glow.net.Request}
		A request object is returned
 
	@example
		glow.net.post("myFile.html", {key:"value", otherkey:["value1", "value2"]}).on("load", 
				function(response){
					alert("Got file:" +response.text());
				});
		*/
	net.post = function(url, data, opts) {
			opts = glow.net.populateOptions(opts);
			opts.data = data;
			if (!opts.headers["Content-Type"]) {
				opts.headers["Content-Type"] = STR.POST_DEFAULT_CONTENT_TYPE;
			}
			return makeXhrRequest('POST', url, opts);};
	
	/**
		@name glow.net.send
		@function
		@description Makes a custom HTTP request to a given url
			Not all HTTP verbs work cross-browser. Use {@link glow.net.get get},
			{@link glow.net.post post}, {@link glow.net.put put} or
			{@link glow.net.del del} for 'safe' methods.
 
		@param {String} method
			The HTTP method to use for the request. Methods are case sensitive
			in some browsers.
		@param {String} url
			Url to make the request to. This can be a relative path. You cannot make requests
			for files on other domains, to do that you must put your data in a javascript
			file and use {@link glow.net.loadScript} to fetch it.
		@param {Object|String} [data]
			Data to post, either as a JSON-style object or a urlEncoded string
		@param {Object} opts
			Same options as {@link glow.net.get}
 
		@returns {glow.net.Request|glow.net.Response}
			A response object for non-defered sync requests, otherwise a
			request object is returned
 
		@example
			glow.net.send('HEAD', 'myFile.html', null).on('load', 
				function(response){
					// handle response
				});
		*/
	
	net.send = function(method, url, data, opts) {
	
		// Ensure that an empty body does not cause a 411 error.
			data = data || '';

			opts = glow.net.populateOptions(o);
			opts.data = data;
			
			return makeXhrRequest(method, url, opts);
		};
	
	/**
		@name glow.net.put
		@function
		@description Makes an HTTP PUT request to a given url
 
		@param {String} url
			Url to make the request to. This can be a relative path. You cannot make requests
			for files on other domains, to do that you must put your data in a javascript
			file and use {@link glow.net.loadScript} to fetch it.
		@param {Object|String} data
			Data to put, either as a JSON-style object or a urlEncoded string
		@param {Object} opts
			Same options as {@link glow.net.get}
 
		@returns {glow.net.Request|glow.net.Response}
			A response object for non-defered sync requests, otherwise a
			request object is returned
 
		@example
			glow.net.put("myFile.html", {key:"value", otherkey:["value1", "value2"]}.on('load', 
				function(response){
					// handle response
				});
		*/
	
	net.put = function(url, data, opts) {
		opts = glow.net.populateOptions(opts);
			opts.data = data;
			if (!opts.headers["Content-Type"]) {
				opts.headers["Content-Type"] = STR.POST_DEFAULT_CONTENT_TYPE;
			}
			return makeXhrRequest('PUT', url, opts);
		};
	
	/**
		@name glow.net.del
		@function
		@description Makes an HTTP DELETE request to a given url
 
		@param {String} url
			Url to make the request to. This can be a relative path. You cannot make requests
			for files on other domains, to do that you must put your data in a javascript
			file and use {@link glow.net.loadScript} to fetch it.
		@param {Object} opts
			Same options as {@link glow.net.get}
 
		@returns {glow.net.Request|glow.net.Response}
			A response object for non-defered sync requests, otherwise a
			request object is returned
 
		@example
			glow.net.del("myFile.html").on('load', 
				function(response){
					// handle response
				});
		*/
	
	net.del = function(url, opts) {
		opts = glow.net.populateOptions(opts);
			return makeXhrRequest('DELETE', url, opts);
		};
	
	
	
		
	
		
		
	// export
	glow.net = net;
});