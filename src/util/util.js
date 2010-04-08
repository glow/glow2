/**
	@name glow.util
	@namespace
	@description Core JavaScript helpers
*/
Glow.provide(function(glow) {
	var util = {},
		undefined;
		
	/**
		@private
		@name glow.util-_getType
		@param {Object} object The object to be tested.
		@returns {string} The data type of the object.
	*/
	function _getType(object) {
		if (typeof object === 'object') {
			if (object === null) { return 'null'; }
			if (Object.prototype.toString.call(object) === '[object Array]') { // see: http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
				return 'array';
			}
		}
		
		return typeof object;
	}

	
	/**
		@name glow.util.apply
		@function
		@description Copies properties from one object to another
			All properties from 'source' will be copied onto
			'destination', potentially overwriting existing properties
			on 'destination'.
			
			Properties from 'source's prototype chain will not be copied.
		
		@param {Object} destination Destination object
		
		@param {Object} source Properties of this object will be copied onto the destination
		
		@returns {Object} The destination object.
		
		@example
			var obj = glow.util.apply({foo: "hello", bar: "world"}, {bar: "everyone"});
			//results in {foo: "hello", bar: "everyone"}
	*/
	util.apply = function(destination, source) {
		/*!debug*/
			if (arguments.length != 2) {
				glow.debug.warn('[wrong count] glow.util.apply expects 2 arguments, not '+arguments.length+'.');
			}
			if (typeof destination != 'object') {
				glow.debug.warn('[wrong type] glow.util.apply expects argument "destination" to be of type object, not ' + typeof destination + '.');
			}
			if (typeof source != 'object') {
				glow.debug.warn('[wrong type] glow.util.apply expects argument "source" to be of type object, not ' + typeof source + '.');
			}
		/*gubed!*/
		for (var i in source) {
			if ( source.hasOwnProperty(i) ) {
				destination[i] = source[i];
			}
		}
		return destination;
	};
	
	/**
		@name glow.util.extend
		@function
		@description Copies the prototype of one object to another
			The 'subclass' can also access the 'base class' via subclass.base

		@param {Function} sub Class which inherits properties.
		@param {Function} base Class to inherit from.
		@param {Object} additionalProperties An object of properties and methods to add to the subclass.

		@example
			function MyClass(arg) {
				this.prop = arg;
			}
			MyClass.prototype.showProp = function() {
				alert(this.prop);
			};
			function MyOtherClass(arg) {
				//call the base class's constructor
				arguments.callee.base.apply(this, arguments);
			}
			glow.util.extend(MyOtherClass, MyClass, {
				setProp: function(newProp) {
					this.prop = newProp;
				}
			});

			var test = new MyOtherClass("hello");
			test.showProp(); // alerts "hello"
			test.setProp("world");
			test.showProp(); // alerts "world"
	*/
	util.extend = function(sub, base, additionalProperties) {
		/*!debug*/
			if (arguments.length < 2) {
				glow.debug.warn('[wrong count] glow.util.extend expects at least 2 arguments, not '+arguments.length+'.');
			}
			if (typeof sub != 'function') {
				glow.debug.error('[wrong type] glow.util.extend expects argument "sub" to be of type function, not ' + typeof sub + '.');
			}
			if (typeof base != 'function') {
				glow.debug.error('[wrong type] glow.util.extend expects argument "base" to be of type function, not ' + typeof base + '.');
			}
		/*gubed!*/
		var f = function () {}, p;
		f.prototype = base.prototype;
		p = new f();
		sub.prototype = p;
		p.constructor = sub;
		sub.base = base;
		if (additionalProperties) {
			util.apply(sub.prototype, additionalProperties);
		}
	};
	
	/**
		@name glow.util.escapeRegex
		@function
		@description Escape special regex chars from a string

		@param {string} str String to escape
		
		@returns {string} Escaped string
		
		@example
			var str = glow.util.escapeRegex('[Hello. Is this escaped?]');
			// Outputs:
			// \[Hello\. Is this escaped\?\]
	*/
	util.escapeRegex = function(str) {
		/*!debug*/
			if (arguments.length !== 1) {
				glow.debug.warn('[wrong count] glow.util.escapeRegex expects 1 argument, not '+arguments.length+'.');
			}
		/*gubed!*/
		return String(str).replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&');
	};
	
	/**
		@name glow.util.encodeUrl
		@function
		@description Encodes an object for use as a query string.
		
			Returns a string representing the object suitable for use 
			as a query string, with all values suitably escaped.
			It does not include the initial question mark. Where the 
			input field was an array, the key is repeated in the output.
		
		@param {Object} object The object to be encoded.
		
			This must be a hash whose values can only be primitives or 
			arrays of primitives.
		
		@returns {String}
		
		@example
			var getRef = glow.util.encodeUrl({foo: "Foo", bar: ["Bar 1", "Bar2"]});
			// will return "foo=Foo&bar=Bar%201&bar=Bar2"
	*/
	util.encodeUrl = function (object) {
		var objectType = _getType(object);
		var paramsList = [];
		var listLength = 0;

		if (objectType !== 'object') {
			throw new Error('glow.util.encodeUrl: cannot encode item');
		}
		else {
			for (var key in object) {
				switch(_getType(object[key])) {
					case 'function':
					case 'object':
						throw new Error('glow.util.encodeUrl: cannot encode item');
						break;
					case 'array':
						for(var i = 0, l = object[key].length; i < l; i++) {
							switch(_getType(object[key])[i]) {
								case 'function':
								case 'object':
								case 'array':
									throw new Error('glow.util.encodeUrl: cannot encode item');
									break;
								default:
									paramsList[listLength++] = key + '=' + encodeURIComponent(object[key][i]);
							}
						}
						break;
					default:
						paramsList[listLength++] = key + '=' + encodeURIComponent(object[key]);
				}
			}

			return paramsList.join('&');
		}
	};
	
	/**
		@name glow.util.decodeUrl
		@function
		@description Decodes a query string into an object.
		
			Returns an object representing the data given by the query 
			string, with all values suitably unescaped. All keys in the 
			query string are keys of the object. Repeated keys result 
			in an array.
		
		@param {String} string The query string to be decoded.
		
			It should not include the initial question mark.
		
		@returns {Object}
		
		@example
			var getRef = glow.util.decodeUrl("foo=Foo&bar=Bar%201&bar=Bar2");
			// will return the object {foo: "Foo", bar: ["Bar 1", "Bar2"]}
	*/
	util.decodeUrl = function(text) {
		/*!debug*/
			if (arguments.length !== 1) {
				glow.debug.warn('[wrong count] glow.util.decodeUrl expects 1 argument, not '+arguments.length+'.');
			}
			if (typeof text !== 'string') {
				glow.debug.warn('[wrong type] glow.util.decodeUrl expects argument "text" to be of type string, not ' + typeof text + '.');
			}
		/*gubed!*/
		
		var result = {},
			keyValues = text.split(/[&;]/),
			thisPair,
			key,
			value;

		for(var i = 0, leni = keyValues.length; i < leni; i++) {
			thisPair = keyValues[i].split('=');
			
			if (thisPair.length < 2) {
				key = keyValues[i];
				value = '';
			}
			else {
				key   = '' + decodeURIComponent(thisPair[0]);
				value = '' + decodeURIComponent(thisPair[1]);
			}
			
			// will be either: undefined, string or [object Array]
			switch (typeof result[key]) {
				case 'string':
					result[key] = [result[key], value];
					break;
				case 'undefined':
					result[key] = value;
					break;
				default:
					result[key].push(value);
			}
		}

		return result;
	};
	
	/**
		@name glow.util.trim
		@function
		@description Removes leading and trailing whitespace from a string
	
		@param {string} str String to trim
	
		@returns {String}
	
			String without leading and trailing whitespace
	
		@example
			glow.util.trim("  Hello World  "); // "Hello World"
	*/
	util.trim = function(str) {
		//this optimisation from http://blog.stevenlevithan.com/archives/faster-trim-javascript
		return str.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, '$1');
	};
	
	/**
		@name glow.util.interpolate
		@function
		@description Replaces placeholders in a string with data from an object
		
		@param {String} template The string containing {placeholders}
		@param {Object} data Object containing the data to be merged in to the template
			<p>The object can contain nested data objects and arrays, with nested object properties and array elements are accessed using dot notation. eg foo.bar or foo.0.</p>
			<p>The data labels in the object cannot contain characters used in the template delimiters, so if the data must be allowed to contain the default { and } delimiters, the delimters must be changed using the option below.</p>
		@param {Object} opts Options object
			@param {String} [opts.delimiter="{}"] Alternative label delimiter(s) for the template
				The first character supplied will be the opening delimiter, and the second the closing. If only one character is supplied, it will be used for both ends.
			@param {Boolean} [opts.escapeHtml=false] Escape any special html characters found in the data object
				Use this to safely inject data from the user into an HTML template. The glow.dom module
				must be present for this feature to work (an error will be thrown otherwise).
		
		@returns {String}
		
		@example
			var data = {
				name: "Domino",
				colours: ["black", "white"],
				family: {
					mum: "Spot",
					dad: "Patch",
					siblings: []
				}
			};
			var template = "My cat's name is {name}. His colours are {colours.0} & {colours.1}. His mum is {family.mum}, his dad is {family.dad} and he has {family.siblings.length} brothers or sisters.";
			var result = glow.util.interpolate(template, data);
			// result == "My cat's name is Domino. His colours are black & white. His mum is Spot, his dad is Patch and he has 0 brothers or sisters."
		
		@example
			var data = {
				name: 'Haxors!!1 <script src="hackhackhack.js"></script>'
			}
			var template = '<p>Hello, my name is {name}</p>';
			var result = glow.util.interpolate(template, data, {
				escapeHtml: true
			});
			// result == '<p>Hello, my name is Haxors!!1 &lt;script src="hackhackhack.js"&gt;&lt;/script&gt;</p>'
	*/
	util.interpolate = function(template, data, opts) {
		var placeHolderRx,
			leftDelimiter,
			rightDelimiter,
			// div used for html escaping
			div;
	
		opts = opts || {};
		
		// make sure the dom module is around
		if (opts.escapeHtml) {
			div = glow('<div></div>');
		}
	
		if (opts.delimiter == undefined) {
			placeHolderRx = /\{[^{}]+\}/g;
		}
		else {
			leftDelimiter = opts.delimiter.substr(0, 1).replace(regexEscape, "\\$1");
			rightDelimiter = opts.delimiter.substr(1, 1).replace(regexEscape, "\\$1") || leftDelimiter;
			placeHolderRx = new RegExp(leftDelimiter + "[^" + leftDelimiter + rightDelimiter + "]+" + rightDelimiter, "g");
		}
	
		return template.replace(placeHolderRx, function (placeholder) {
			var key = placeholder.slice(1, -1),
				keyParts = key.split("."),
				val,
				i = 0,
				len = keyParts.length;
			
			if (key in data) {
				// need to be backwards compatible with "flattened" data.
				val = data[key]; 
			}
			else {
				// look up the chain
				val = data;
				for (; i < len; i++) {
					if (keyParts[i] in val) {
						val = val[ keyParts[i] ];
					}
					else {
						return placeholder;
					}
				}
			}
			
			if (opts.escapeHtml) {
				val = div.text(val).html();
			}
			return val;
		});
	};
	
	/**
		@example
			glow.util.cookie(key); // get value for key
			glow.util.cookie({key: val, key2: val2}, opts); // set all keys, vals
			glow.util.cookie(key, val, opts); // set key, val
			glow.util.cookie(); // get all keys, vals
			
			// use value of undefined
	*/
	util.cookie = function(key, value, opts) {
		/*!debug*/
			if (arguments.length > 3) {
				glow.debug.warn('[wrong count] glow.util.cookie expects 3 or less arguments, not '+arguments.length+'.');
			}
			
			if (arguments.length === 1 && _getType(key) !== 'string' && _getType(key) !== 'object') {
				glow.debug.warn('[wrong type] glow.util.cookie expects argument "key" to be of type string or object, not ' + _getType(key) + '.');
			}
			
			if (
				arguments.length === 2
				&&
				(
					! (_getType(key) === 'string' && _getType(value) === 'string')
					||
					! (_getType(key) === 'object' && _getType(value) === 'object')
				)
			) {
				glow.debug.warn('[wrong type] glow.util.cookie expects arguments to be (key, val) or (keyVals, opts).');
			}
			
			if (arguments.length === 3 && _getType(key) !== 'string' && _getType(value) !== 'string' && _getType(opts) !== 'object') {
				glow.debug.warn('[wrong type] glow.util.cookie expects argument "key" and "value" to be strings and "options" to be an object.');
			}
			
			if (opts && opts.debug && (typeof opts.expires !== 'number' || !opts.expires.toUTCString)) {
				glow.debug.warn('[wrong type] glow.util.cookie expects opts.expires to be a number or a Date.');
			}
		/*gubed!*/
		
		
		var date = '',
			expires = '',
			path = '',
			domain = '',
			secure = '',
			keyValues,
			thisPair,
			key,
			val,
			cookieValues;
		
		if (opts) {
			if (opts.expires) {
				if (typeof opts.expires === 'number') {
					date = new Date();
					date.setTime(date.getTime() + (opts.expires * 24 * 60 * 60 * 1000)); // opts.expires days
				}
				else { // is already a Date
					date = opts.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
		   
			path = opts.path ? '; path=' + (opts.path) : '';
			domain = opts.domain ? '; domain=' + (opts.domain) : '';
			secure = opts.secure ? '; secure' : '';
		}
		else {
			opts = {};
		}
		
		if (typeof key === 'string' && typeof value === 'string') { // a single setter
			document.cookie = key + '=' + encodeURIComponent(value) + expires + path + domain + secure;
		}
		else if (typeof key === 'object') { // an all setter
			for (var p in key) {
				document.cookie = p + '=' + encodeURIComponent(key[p]) + expires + path + domain + secure;
			}
		}
		else { // a getter
			cookieValues = {};
			if (document.cookie && document.cookie != '') {
				keyValues = document.cookie.split(/; ?/);
				for (var i = 0, leni = keyValues.length; i < leni; i++) {
					thisPair = keyValues[i].split('=');
					
					cookieValues[thisPair[0]] = decodeURIComponent(thisPair[1]);
				}
			}
			
			if (typeof key === 'string') { // a single getter
				return cookieValues[key];
			}
			else if (typeof key === 'undefined') { // an all getter
				return cookieValues;
			}
		}
	};
	
	util.removeCookie = function(key) {
		util.cookie(key, '', {expires: -1});
	};
	
	// export
	glow.util = util;
});