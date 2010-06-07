Glow.provide(function(glow) {
	var undefined,
		CrossDomainRequestProto,
		CrossDomainResponseProto,
		net = glow.net,
		// We borrow some methods from XhrRequest later
		XhrResponseProto = net.XhrRequest.prototype,
		Target = glow.events.Target;

	/**
		@name glow.net.CrossDomainRequest
		@class
		@description Cross-domain request via window.name
			A request made via a form submission in a hidden iframe, with the
			result being communicated via the name attribute of the iframe's window.
			
			The URL that's requested should respond with a blank HTML page containing JavaScript
			that assigns the result to window.name as a string:
 
			`<script type="text/javascript">window.name = 'result string';</script>`
			
			Instances of this are returned by shortcut methods {@link glow.net.crossDomainGet}
			and {@link glow.net.crossDomainPost}
	
		@param {string} method The HTTP method to use for the request.
			Only 'POST' and 'GET' are considered cross-browser.
		@param {string} url The URL to request.
		@param {Object} [opts]
			@param {Object|string} [opts.data] Data to send.
				This can be either a JSON-style object or a urlEncoded string.
			@param {number} [opts.timeout] Time to allow for the request in seconds.
				No timeout is set by default.
			@param {string} [opts.blankUrl='/favicon.ico']
				The path of a page on same domain as the caller, ideally a page likely
				to be in the user's cache.
	*/
	function CrossDomainRequest(method, url, opts) {
		var request = this,
			timeout;
		
		request._opts = opts = glow.util.apply({
			data: {},
			blankUrl: '/favicon.ico'
		}, opts);
		
		// convert data to object
		if (typeof opts.data === 'string') {
			opts.data = glow.util.decodeUrl(opts.data);
		}
		
		// set timeout for the request
		timeout = opts.timeout;
		if (timeout) {
			request._timeout = setTimeout(function () {				
				request.fire('error');					
				cleanup(request);
			}, timeout * 1000);
		}
		
		addIframe(request);
		buildAndSubmitForm(request, method, url);
	}
	glow.util.extend(CrossDomainRequest, Target);
	CrossDomainRequestProto = CrossDomainRequest.prototype;
	
	/**
		@name glow.net.CrossDomainRequest#_opts
		@private
		@type Object
		@description Options object with defaults applied
	*/
	
	/**
		@name glow.net.CrossDomainRequest#_iframe
		@private
		@type glow.NodeList
		@description Iframe used to send the data.
	*/
	
	/**
		@name glow.net.CrossDomainRequest#_timeout
		@private
		@type number
		@description setTimeout id for request timeout
	*/

	/**
		@private
		@function
		@description Add a hidden iframe for posting the request
		@param {glow.net.CrossDomainRequest} request
	*/
	function addIframe(request) {
		var iframe = request._iframe = glow(
			'<iframe style="visibility: hidden; position: absolute; height: 0;"></iframe>'
		).appendTo(document.body);
	};
		
	/**
		@private
		@function
		@description Add a form to the iframe & submit it
		
		@param {glow.net.CrossDomainRequest} request
		@param {string} method The HTTP method to use for the request.
			Only 'POST' and 'GET' are considered cross-browser.
		@param {string} url The URL to request.
	*/
	function buildAndSubmitForm(request, method, url) {
		var iframe = request._iframe,
			win = iframe[0].contentWindow,
			doc = win.document,
			form,
			data = request._opts.data;

		// IE needs an empty document to be written to written to the iframe
		if (glow.env.ie) {
			doc.open();
			doc.write('<html><body></body></html>');
			doc.close();
		}
		
		// create form
		form = doc.createElement('form');
		form.action = url;
		form.method = method;

		doc.body.appendChild(form);
		
		// build form elements
		for (var i in data) {
			if ( !data.hasOwnProperty(i) ) { continue; }
			
			if (data[i] instanceof Array) {
				for (var j = 0, jLen = data[i].length; j < jLen; j++) {
					addHiddenInput( form, i, this.data[i][j] );
				}
			}
			else {
				addHiddenInput( form, i, this.data[i] );
			}
		}
		
		// submit - the setTimeout makes the function run in the context of the form
		win.setTimeout(function () {
			form.submit();
		}, 0);
		
		// listen for form submitting
		iframe.on('load', handleResponse, request);
	}

	/**
		@private
		@function
		@description Add a hidden input to a form for a piece of data.
		
		@param {HTMLFormElement} form
		@param {string} name Input name
		@param {string} value Input value
	*/
	function addHiddenInput(form, name, value) {
		var input = form.ownerDocument.createElement('input');
		input.type = 'hidden';
		input.name = name;
		input.value = value;
		form.appendChild(input);
	}

	/**
		@private
		@function
		@description Callback for load event in the hidden iframe.
			`this` is the request.
	*/
	function handleResponse() {		
		var err,
			href,
			win = this._iframe[0].contentWindow;
		
		try {
			href = win.location.href;
		}
		catch (e) {
			err = e;
		}
		
		if (href !== 'about:blank' || err) {
			clearTimeout(this._timeout);
			this._iframe.detach('load', handleResponse).on('load', readHandler, this);
			
			win.location = window.location.protocol + '//' + window.location.host + this._opts.blankUrl;
		}
	}

	/**
		@private
		@function
		@description Callback for load event of blank page in same origin.
			`this` is the request.
	*/
	function readHandler() {
		this.fire( 'load', new CrossDomainResponse(this._iframe[0].contentWindow.name) );			
		cleanup(this);			
	}
			
	/**
		@private
		@function
		@description Removes the iframe and any event listeners.
		@param {glow.net.CrossDomainRequest} request
	*/
	function cleanup(request) {
		request._iframe.destroy();
		glow.events.removeAllListeners(request);
	}
	
	/**
		@name glow.net.CrossDomainRequest#event:load
		@event
		@param {glow.net.CrossDomainResponse} response
		@description Fired when the request is sucessful.
	*/
 
	/**
		@name glow.net.CrossDomainRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request times out.
	*/
	
	/**
		@name glow.net.CrossDomainResponse
		@class
		@description Response object for cross-domain requests.
			This is provided in {@link glow.net.CrossDomainRequest}'s 'load' event.
		@glowPrivateConstructor There is no direct constructor.
	*/
	function CrossDomainResponse(textResponse) {
		this._text = textResponse;
	}
	glow.util.extend(CrossDomainResponse, Target);
	CrossDomainResponseProto = CrossDomainResponse.prototype;
	
	/**
		@name glow.net.CrossDomainResponse#_text
		@private
		@type string
		@description Text response from the server
	*/
	
	/**
		@name glow.net.CrossDomainResponse#text
		@function
		@description Gets the body of the response as plain text.
		@returns {string}
	*/
	CrossDomainResponseProto.text = function() {
		return this._text;
	}
	
	/**
		@name glow.net.CrossDomainResponse#json
		@function
		@description Gets the body of the response as a JSON object.
		
		@param {boolean} [safeMode=false]
			If true, the response will be parsed using a string parser which
			will filter out non-JSON javascript, this will be slower but
			recommended if you do not trust the data source.
	
		@returns {object}
	*/
	CrossDomainResponseProto.json = XhrResponseProto.json;
	
	/**
		@name glow.net.CrossDomainResponse#nodeList
		@function
		@description Gets the body of the response as a {@link glow.NodeList}.
	
		@returns {glow.NodeList}
	*/
	CrossDomainResponseProto.nodeList = XhrResponseProto.nodeList;
	
	// ...and now, the factory methods! Yey!
	
	/**
		@name glow.net.crossDomainPost
		@function
		@description Cross-domain post via window.name
			A request made via a form submission in a hidden iframe, with the
			result being communicated via the name attribute of the iframe's window.
			
			The URL that's requested should respond with a blank HTML page containing JavaScript
			that assigns the result to window.name as a string:
 
			`<script type="text/javascript">window.name = 'result string';</script>`

		@param {string} url The URL to request.
		@param {Object|string} data Data to send.
			This can be either a JSON-style object or a urlEncoded string.
		@param {Object} [opts]
			@param {number} [opts.timeout] Time to allow for the request in seconds.
				No timeout is set by default.
			@param {string} [opts.blankUrl='/favicon.ico']
				The path of a page on same domain as the caller, ideally a page likely
				to be in the user's cache.
	*/
	
	net.crossDomainPost = function(url, data, opts) {
		opts = opts || {};
		opts.data = data;
		return new CrossDomainRequest('POST', url, opts);
	};
	
	
	/**
		@name glow.net.crossDomainGet
		@function
		@description Cross-domain get via window.name
			A request made via a form submission in a hidden iframe, with the
			result being communicated via the name attribute of the iframe's window.
			
			The URL that's requested should respond with a blank HTML page containing JavaScript
			that assigns the result to window.name as a string:
 
			`<script type="text/javascript">window.name = 'result string';</script>`
	
		@param {string} url The URL to request.
		@param {Object} [opts]
			@param {number} [opts.timeout] Time to allow for the request in seconds.
				No timeout is set by default.
			@param {string} [opts.blankUrl='/favicon.ico']
				The path of a page on same domain as the caller, ideally a page likely
				to be in the user's cache.
	*/
	
	net.crossDomainGet = function(url, opts) {
		return new CrossDomainRequest('GET', url, opts);
	};

	// export
	glow.net.CrossDomainRequest  = CrossDomainRequest;
	glow.net.CrossDomainResponse = CrossDomainResponse;
});