Glow.provide(function(glow) {
	var undefined,
		JsonpRequestProto,
		net = glow.net,
		emptyFunc = function(){},
		events = glow.events,
		// Script elements that have been added via {@link glow.net.jsonp jsonp}, keyed by callback name
		scriptElements = {},
		scriptElementsLen = 0,
		callbackPrefix = 'c',
		// Name of the global object used to store jsonp callbacks
		globalObjectName = '_' + glow.UID + 'jsonp',
		head = glow('head'),
		// a reference to the global object holding the callbacks
		globalObject;
	
	/**
		@private
		@function
		@description Handle jsonp load.
		@param {glow.net.JsonpRequest} request
		@param {Object[]} args Arguments object passed to the callback from the jsonp source
	*/
	function jsonpLoad(request, args) {
		// we have to call listeners manually as we don't provide a real event object. A bit of a hack.
		var loadListeners = events._getListeners(request).load,
			i;
			
		if (loadListeners) {
			loadListeners = loadListeners.slice(0);
			i = loadListeners.length;
			while (i--) {
				loadListeners[i][0].apply( loadListeners[i][1], args );
			}
		}
		//set as completed
		request.completed = true;

		cleanUp(request);
	}
	
	/**
		@private
		@function
		@description Clean up to avoid memory leaks
		@param {glow.net.JsonpRequest} request
		@param {boolean} [leaveEmptyFunc] Replace global callback with blank function.
			If false, the global callback will be set to undefined, which is better for memory,
			but in some cases the callback may later be called (like a timed out request) so an
			empty function needs to be used to avoid errors.
	*/
	function cleanUp(request, leaveEmptyFunc) {
		var callbackName = request._callbackName;
		
		clearTimeout(request._timeout);
		globalObject[callbackName] = leaveEmptyFunc ? emptyFunc : undefined;
		glow( scriptElements[callbackName] ).destroy();
		scriptElements[callbackName] = undefined;
	}
	
	/**
		@name glow.net.JsonpRequest
		@class
		@description A JSONP request.
			Although instance of this can be created manually, using
			{@link glow.net.jsonp} is preferred. 
	*/
	// the params for this are the same as {@link glow.net.jsonp}.
	function JsonpRequest(url, opts) {
		opts = opts || {};
		
		var newIndex = scriptElements.length,
			//script element that gets inserted on the page
			//generated name of the callback
			callbackName = this._callbackName = callbackPrefix + (scriptElementsLen++),
			// script element to add to the page
			script = scriptElements[callbackName] = document.createElement('script'),
			request = this,
			timeout = opts.timeout,
			charset = opts.charset;
		
		// add the callback name to the url
		url = glow.util.interpolate(url, {
			callback: globalObjectName + '.' + callbackName
		});
		
		// create the global object if it doesn't exist already
		globalObject || ( globalObject = window[globalObjectName] = {} );
		
		// create our callback
		globalObject[callbackName] = function() {
			jsonpLoad(request, arguments);
		};
		
		// set charset
		charset && (script.charset = charset);
		
		if (opts.timeout) {
			request._timeout = setTimeout(function() {
				request.abort().fire('error');
			}, timeout * 1000);
		}
			
		script.src = url;
		
		//add script to page
		head.prepend(script);
		
		script = undefined;
	}
	
	glow.util.extend(JsonpRequest, events.Target);
	JsonpRequestProto = JsonpRequest.prototype;
	
	/**
		@name glow.net.JsonpRequest#_callbackName
		@private
		@description The name of the callback, used as a property name in globalObject and scriptElements
	*/
	
	/**
		@name glow.net.JsonpRequest#_timeout
		@private
		@description timeout ID
		@type number
	*/
	
	/**
		@name glow.net.JsonpRequest#complete
		@description Boolean indicating whether the request has completed
		@type boolean
	*/
	JsonpRequestProto.complete = false;
	
	/**
		@name glow.net.JsonpRequest#abort
		@function
		@description Abort the request.
			The script file may still load, but the 'load' event will not fire.
		@returns this
	*/
	JsonpRequestProto.abort = function() {
		this.fire('abort');
		cleanUp(this, true);
		return this;
	};
	
	/**
		@name glow.net.JsonpRequest#event:load
		@event
		@description Fired when the request is sucessful.
			The parameters to this event are whatever the datasource provides.
			
		@example
			glow.net.jsonp('http://twitter.com/statuses/user_timeline/15390783.json?callback={callback}')
				.on('load', function(data) {
					alert(data);
				});
	*/
 
	/**
		@name glow.net.JsonpRequest#event:abort
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request is aborted.
	*/
 
	/**
		@name glow.net.JsonpRequest#event:error
		@event
		@param {glow.events.Event} event Event Object
		@description Fired when the request times out.
	*/
	
	/**
		@name glow.net.jsonp
		@function
		@description Fetch JSON via JSONP.
			This can be used cross domain, but should only be used with trusted
			sources as any javascript included in the script will be executed.
			
			This method only works if the server allows you to specify a callback
			name for JSON data. Not all JSON sources support this, check the API of the
			data source to ensure you're using the correct querystring parameter
			to set the callback name.
	 
		@param {string} url Url of the script.
			Set the callback name via the querystring to `{callback}`, Glow will
			replace this with another value and manage the callback internally.
			
			Check the API of your data source for the correct parameter name.
			Eg, in Flickr it's `jsoncallback={callback}`, in Twitter it's
			`callback={callback}`.
		@param {object} [opts]
			@param {number} [opts.timeout] Time to allow for the request in seconds.
			@param {string} [opts.charset] Charset attribute value for the script.
	 
		@returns {glow.net.JsonpRequest}
	 
		@example
			glow.net.jsonp('http://twitter.com/statuses/user_timeline/15390783.json?callback={callback}', {
				timeout: 5
			}).on('load', function(data) {
				alert(data);
			}).on('error', function() {
				alert('Request timeout');
			});
	*/
	net.jsonp = function(url, opts) {
		return new glow.net.JsonpRequest(url, opts);
	};
	
	glow.net.JsonpRequest = JsonpRequest;
});