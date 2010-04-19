/**
	@name glow.net
	@namespace
	@description AJAX methods
*/
Glow.provide(function(glow) {
	var net = {},
		undefined;
	
	var STR = {
				XML_ERR:"Cannot get response as XML, check the mime type of the data",
				POST_DEFAULT_CONTENT_TYPE:'application/x-www-form-urlencoded;'
			},
			endsPlusXml = /\+xml$/,
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
			callbackPrefix = "c",
			/**
			 * @name glow.net.globalObjectName
			 * @private
			 * @description Name of the global object used to store loadScript callbacks
			 * @type String
			 */
			globalObjectName = "_" + glow.UID + "loadScriptCbs",
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
				return (xmlHTTPRequest = function() { return new ActiveXObject("Microsoft.XMLHTTP"); })();
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
		function populateOptions(opts) {
			var newOpts = glow.util.apply({
				onLoad: emptyFunc,
				onError: emptyFunc,
				onAbort: emptyFunc,
				headers: {},
				async: true,
				useCache: false,
				data: null,
				defer: false,
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
				data = opts.data && (typeof opts.data == "string" ? opts.data : glow.data.encodeUrl(opts.data)),
				i,
				request = new glow.net.Request(req, opts);
			
 
			if (!opts.useCache) {
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
			return opts.defer ? request : send();
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
		opts = populateOptions(opts);
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
			opts = populateOptions(opts);
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

			opts = populateOptions(o);
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
		opts = populateOptions(opts);
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
		opts = populateOptions(opts);
			return makeXhrRequest('DELETE', url, opts);
		};
	
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
			@param {Boolean} [opts.useCache=false] Allow a cached response
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
	net.getJsonp = function() { };
	
	
	/**
		@name glow.net.getResources
		@function
		@description Loads data by adding a script element to the end of the page
			This can be used cross domain, but should only be used with trusted
			sources as any javascript included in the script will be executed.
 
		@param {String} url
			Url of the script. An optional "{callback}" value may be added to the the querystring if the data source supports it.
		@param {Object} [opts]
			An object of options to use if "{callback}" is specified in the url.
			@param {Boolean} [opts.useCache=false] Allow a cached response
			@param {Number} [opts.timeout] Time to allow for the request in seconds
			@param {String} [opts.charset] Charset attribute value for the script
			
 
		@returns {glow.net.Request}
 
		@example
			// load script with a callback specified
			glow.net.getResources("http://www.server.com/custom.css").on('load'), 
				function(data){
					// use data
				});
		*/
	net.getResources = function() { };
	
	/**
		@name glow.net.crossDomainPost
		@function
		@description Send a post request via a form submission in a hidden iframe.
			The result is returned by the recipient of the form submission setting the iframe's
			window.name property.
 
			The URL that's requested should respond with a blank HTML page containing JavaScript
			that assigns the result to window.name as a string:
 
			<script type="text/javascript">
				window.name = '{ "success": true }';
			</script>
		
		@param {String} url
			The URL to post the data to.
		@param {Object} data
			The data to post. This should be keys with String values (or values that will be converted to
			strings) or Array values where more than one value should be sent for a single key.
		@param {Object} opts
			Zero or more of the following as properties of an object:
			@param {Number} timeout
				The request timeout in seconds (default 10 seconds)
			@param {String} blankUrl
				The path of a blank URL on the same domain as the caller (default '/includes/blank/')	   
		*/
	
	net.xDomainPost = function() { };
	
	
	/**
		@name glow.net.crossDomainGet
		@function
		@description Send a get request via a form submission in a hidden iframe.
			The result is returned by the recipient of the form submission setting the iframe's
			window.name property.
 
			The URL that's requested should respond with a blank HTML page containing JavaScript
			that assigns the result to window.name as a string:
 
			<script type="text/javascript">
				window.name = '{ "success": true }';
			</script>
		
		@param {String} url The URL to perform the get request on.
		@param {Object} opts
			Zero or more of the following as properties of an object:
			@param {Function} onTimeout A callback that is called when the request times out
			@param {String} blankUrl The path of a blank URL on the same domain as the caller (default '/includes/blank/')	   
		*/
	
	net.xDomainGet = function() {} ;
		
	

		
	
		
		
	// export
	glow.net = net;
});