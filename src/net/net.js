/**
	@name glow.net
	@namespace
	@description AJAX methods
*/
Glow.provide(function(glow) {
	var net = {},
		undefined;
	
	
	
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
		@param {Boolean} [opts.useCache=false] Allow a cached response
			If false, a random number is added to the query string to ensure a fresh version of the file is being fetched
		@param {Number} [opts.timeout] Time to allow for the request in seconds
			No timeout is set by default. Only applies for async requests. Once
			the time is reached, the error event will fire with a "408" status code.
		@param {Boolean} [opts.defer=false] Do not send the request straight away
			Deferred requests need to be triggered later using myRequest.send()
		@param {Boolean} [opts.forceXml=false] Treat the response as XML.
			This will allow you to use {@link glow.net.Response#xml response.xml()}
			even if the response has a non-XML mime type.
 
	@returns {glow.net.Request|glow.net.Response}
		A response object for non-defered sync requests, otherwise a
		request object is returned
 
	@example
		glow.net.get("myFile.html").on("load", {
				function(response){
					alert("Got file:" +response.text());
				}
			});
		
	*/
	net.get = function() { };
	
	
	
	
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
 
	@returns {glow.net.Request|glow.net.Response}
		A response object for non-defered sync requests, otherwise a
		request object is returned
 
	@example
		glow.net.post("myFile.html", {key:"value", otherkey:["value1", "value2"]}).on("load", {
				function(response){
					alert("Got file:" +response.text());
				}
			});
		*/
	net.post = function() { };
	
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
			glow.net.send('HEAD', 'myFile.html', null).on('load'), {
				function(response{
					// continue
				})
			}
		*/
	
	net.send = function() { };
	
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
			glow.net.put("myFile.html", {key:"value", otherkey:["value1", "value2"]}.on('load'), {
				function(response{
					// continue
				})
			}
		*/
	
	net.put = function() { };
	
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
			glow.net.del("myFile.html").on('load'), {
				function(response){
					// continue
				})
		*/
	
	net.del = function() { };
	
	/**
		@name glow.net.loadScript
		@function
		@description Loads data by adding a script element to the end of the page
			This can be used cross domain, but should only be used with trusted
			sources as any javascript included in the script will be executed.
 
		@param {String} url
			Url of the script. An optional "{callback}" value may be added to the the querystring if the data source supports it.
		@param {Object} [opts]
			An object of options to use if "{callback}" is specified in the url.
			@param {Function} [opts.onLoad] Called when loadScript succeeds.
				The parameters are passed in by the external data source
			@param {Function} [opts.onError] Called on timeout
				No parameters are passed
			@param {Function} [opts.onAbort] Called if the request is aborted
			@param {Boolean} [opts.useCache=false] Allow a cached response
			@param {Number} [opts.timeout] Time to allow for the request in seconds
			@param {String} [opts.charset] Charset attribute value for the script
			
 
		@returns {glow.net.Request}
 
		@example
			// load script with a callback specified
			glow.net.loadScript("http://www.server.com/json/tvshows.php?jsoncallback={callback}").on('load'), {
				function(data){
					// use data
				})
		*/
	net.loadScript = function() { };
	
	
	/**
		@name glow.net.xDomainPost
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
				@param {Function} onLoad
						a callback that is called when the response to the post is recieved. The function is passed
						a single parameter containing the value of window.name set by the response to the post.
				@param {Number} timeout
						the request timeout in seconds (default 10 seconds)
				@param {Function} onTimeout
						a callback that is called when the request times out
				@param {String} blankUrl
						the path of a blank URL on the same domain as the caller (default '/includes/blank/')	   
		*/
	
	net.xDomainPost = function() { };
	
	
	/**
		@name glow.net.xDomainGet
		@function
		@description Send a get request via a form submission in a hidden iframe.
					 The result is returned by the recipient of the form submission setting the iframe's
					 window.name property.
 
					 The URL that's requested should respond with a blank HTML page containing JavaScript
					 that assigns the result to window.name as a string:
 
					 <script type="text/javascript">
					 window.name = '{ "success": true }';
					 </script>
		
		@param {String} url
				the URL to perform the get request on.
		@param {Object} opts
				Zero or more of the following as properties of an object:
				@param {Function} onLoad
						a callback that is called when the response to the post is recieved. The function is passed
						a single parameter containing the value of window.name set by the response to the post.
				@param {Number} timeout
						the request timeout in seconds (default 10 seconds)
				@param {Function} onTimeout
						a callback that is called when the request times out
				@param {String} blankUrl
						the path of a blank URL on the same domain as the caller (default '/includes/blank/')	   
		*/
	
	net.xDomainGet = function() {} ;
		
	}

		
	
		
		
	// export
	glow.net = net;
});