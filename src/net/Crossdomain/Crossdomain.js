Glow.provide(function(glow) {
	var undefined,
		CrossdomainRequestProto,
		net = glow.net,
		emptyFunc = function(){},
		events = glow.events,
	
		// Private (x-domain request)

		/**
		@name CrossDomainRequest
		@private
		@class
		@description A request made via a form submission in a hidden iframe, with the result being communicated
					 via the name attribute of the iframe's window.

		@param {String} url
				the URL to post the data to.
		@param {Object} data
				the data to post. This should be keys with String values (or values that will be converted to
				strings) or Array values where more than one value should be sent for a single key.
		@param {Object} opts
				an Object containing the same options as passed to glow.net.xDomainPost.
		*/
		CrossDomainRequest = function (url, data, isGet, opts) {
			this.url  = url;
			this.data = data;
			this.isGet = isGet;
			this.opts = opts;
		};

		
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
	
	net.crossDomainPost = function(url, data, opts) {
		var request = new CrossDomainRequest(url, data, false, opts);
			request._send();
		};
	
	
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
	
	net.crossDomainGet = function(url, opts) {
		var request = new CrossDomainRequest(url, {}, true, opts);
			request._send();
		};
		
		
	glow.util.extend(CrossDomainRequest, glow.events.Target);
	CrossDomainRequestProto = CrossDomainRequest.prototype;

			/**
			@name CrossDomainRequest#_send
			@private
			@function
			@description Send the request
			*/
			CrossDomainRequestProto._send = function () {
				this._addIframe();
				this._addForm();
				this._addTimeout();
				this.onLoad = this._handleResponse;
				this._submitForm();
			},

			/**
			@name CrossDomainRequest#_addIframe
			@private
			@function
			@description Add a hidden iframe for posting the request
			*/
			CrossDomainRequestProto._addIframe = function () {
				this.iframe = glow(
					'<iframe style="visibility: hidden; position: absolute; height: 0;"></iframe>'
				);
				
				var iframe   = this.iframe[0],
					request  = this,
					callback = function () {
						if (request.onLoad) request.onLoad();
					};
				
				if (iframe.attachEvent) {
					iframe.attachEvent('onload', callback);
				} else {
					iframe.onload = callback;
				}
				
				glow(this.iframe).appendTo('body');
				
			},
		
			/**
			@name CrossDomainRequest#_addForm
			@private
			@function
			@description Add the form to the iframe for posting the request
			*/
			CrossDomainRequestProto._addForm = function () {
				var doc = this._window().document;

				// IE needs an empty document to be written to written to the iframe
				if (glow.env.ie) {
					doc.open();
					doc.write('<html><body></body></html>');
					doc.close();
				}

				var form = this.form = doc.createElement('form');
				form.setAttribute('action', this.url);
				form.setAttribute('method', this.isGet ? 'GET' : 'POST');

				var body = doc.getElementsByTagName('body')[0];
				body.appendChild(form);
				this._addFormData();
			},

			/**
			@name CrossDomainRequest#_addFormData
			@private
			@function
			@description Add the data to the form
			*/
			CrossDomainRequestProto._addFormData = function () {
				
				for (var i in this.data) {
					if (! this.data.hasOwnProperty(i)) continue;
					if (this.data[i] instanceof Array) {
						var l = this.data[i].length;
						for (var j = 0; j < l; j++) {
							this._addHiddenInput(i, this.data[i][j]);
						 }
					}
					else {
						this._addHiddenInput(i, this.data[i]);
					}
				}
			},

			/**
			@name CrossDomainRequest#_addHiddenInput
			@private
			@function
			@description Add a hidden input to the form for a piece of data
			*/
			CrossDomainRequestProto._addHiddenInput = function (name, value) {
				var input = this._window().document.createElement('input');
				input.type = 'hidden';
				input.name = name;
				input.value = value;
				this.form.appendChild(input);
			},

			/**
			@name CrossDomainRequest#window
			@private
			@function
			@description Get the window for the hidden iframe
			*/
			CrossDomainRequestProto._window = function () {
				var iframe = this.iframe[0];
				if (iframe.contentWindow)
					return iframe.contentWindow;
				throw new Error('could not get contentWindow from iframe');

				// this code was here to work around a browser quirk, but I don't know which for...
				// I have tested in recent Safari, Chrome, Firefox, Opera and IE 6, 7, 8
				// If the above error shows up, then this is the thing to try

				// if (iframe.contentDocument && iframe.contentDocument.parentWindow)
				//	return iframe.contentDocument.parentWindow;
			},

			/**
			@name CrossDomainRequest#_addTimeout
			@private
			@function
			@description Add a timeout to cancel the request if it takes too long
			*/
			CrossDomainRequestProto._addTimeout = function () {
				var request = this;
				this.timeout = setTimeout(function () {				
					request.fire('error');					
					request._cleanup();
				}, (this.opts.timeout || 10) * 1000); /* 10 second default */
			},

			/**
			@name CrossDomainRequest#_handleResponse
			@private
			@function
			@description Callback for load event in the hidden iframe
			*/
			CrossDomainRequestProto._handleResponse = function () {
				var err, href, win = this._window();
				try {
					href = win.location.href;
				}
				catch (e) {
					err  = e;
				}
				if (href != 'about:blank' || err) {
					clearTimeout(this.timeout);
					this.onLoad = this._readHandler;
					// this is just here for the tests, normally always want it to be in the same origin
					if ('_fullBlankUrl' in this.opts) {
						win.location = this.opts._fullBlankUrl;
					}
					else {
						win.location = window.location.protocol + '//' + window.location.host + (this.opts.blankUrl || '/favicon.ico');
					}
				}
			},

			/**
			@name CrossDomainRequest#_readHandler
			@private
			@function
			@description Callback for load event of blank page in same origin
			*/
			CrossDomainRequestProto._readHandler = function () {
				var response = new glow.net.CrossDomainResponse(this._window().name);
				this.fire('load', response);			
				this._cleanup();			
			},
			
			/**
			@name CrossDomainRequest#_cleanup
			@private
			@function
			@description Removes the iframe and any event listeners
			*/
			CrossDomainRequestProto._cleanup = function () {
				this.iframe.remove();
			},

			/**
			@name CrossDomainRequest#_submitForm
			@private
			@function
			@description Submit the form to make the post request
			*/
			CrossDomainRequestProto._submitForm = function () {
				var request = this;
				// the set timeout is here to make the form submit in the context of the iframe
				this._window().setTimeout(function () { request.form.submit() }, 0);
			}
		
	
			function CrossDomainResponse(textResponse) { this._text = textResponse; }
			CrossDomainResponse.prototype.text = function() { return this._text; }
			 CrossDomainResponse.prototype.json = function() { return makeItJson(this._text); }

	
	glow.net.CrossDomainRequest = CrossDomainRequest;
	glow.net.CrossDomainResponse = CrossDomainResponse
});