/**
	@name glow.util
	@namespace
	@description Core JavaScript helpers
*/
Glow.provide(function(glow) {
	var util = {},
		undefined,
		TYPES = {
			UNDEFINED : "undefined",
			OBJECT    : "object",
			NUMBER    : "number",
			BOOLEAN   : "boolean",
			STRING    : "string",
			ARRAY     : "array",
			FUNCTION  : "function",
			NULL      : "null"
		},
		/*
		PrivateProperty: TEXT
			hash of strings used in encoding/decoding
		*/
		TEXT = {
			AT    : "@",
			EQ    : "=",
			DOT   : ".",
			EMPTY : "",
			AND   : "&",
			OPEN  : "(",
			CLOSE : ")"
		},
		/*
		PrivateProperty: JSON
			nested hash of strings and regular expressions used in encoding/decoding Json
		*/
		JSON = {
			HASH : {
				START     : "{",
				END       : "}",
				SHOW_KEYS : true
			},

			ARRAY : {
				START     : "[",
				END       : "]",
				SHOW_KEYS : false
			},

			DATA_SEPARATOR   : ",",
			KEY_SEPARATOR    : ":",
			KEY_DELIMITER    : "\"",
			STRING_DELIMITER : "\"",

			SAFE_PT1 : /^[\],:{}\s]*$/,
			SAFE_PT2 : /\\./g,
			SAFE_PT3 : /\"[^\"\\\n\r]*\"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g,
			SAFE_PT4 : /(?:^|:|,)(?:\s*\[)+/g
		};
	/**
		@private
		@name glow.util-_getType
		@param {Object} object The object to be tested.
		@returns {string} The data type of the object.
	*/
	function _getType(object) {
		var typeOfObject = typeof object,
			constructorStr;
		
		if (object === null) {
			return 'null';
		}
		
		if (typeOfObject === 'object') {
			if (object.constructor.name) {
				return object.constructor.name;
			}
			else {
				constructorStr = object.constructor.toString();
				return constructorStr.slice( constructorStr.indexOf('function ') + 9, constructorStr.indexOf('(') );
			}
		}
		else {
			return typeOfObject;
		}
	}

	/**
		@name glow.util.getType
		@function
		@description Get the native type or constructor name of an object.
			This allows you to safely get the type of an object, even
			if it came from another frame.
			
		@param {Object} object Object to get the type of.
			
		@example
			glow.util.getType('Hello'); // 'string'
			glow.util.getType( {} ); // 'Object'
			glow.util.getType(12); // 'number'
			glow.util.getType( [] ); // 'Array'
			glow.util.getType( glow('#whatever') ); // 'NodeList'
			
		@example
			var MyConstructor = function() {},
				obj = new MyConstructor;
			
			glow.util.getType(obj); // ''
			// The above returns an empty string as the constructor
			// is an anonymous function and therefore has no name
	*/
	util.getType = _getType;
	
	/**
		@name glow.util.apply
		@function
		@description Copies properties from one object to another
			All properties from 'source' will be copied onto
			'destination', potentially overwriting existing properties
			on 'destination'.
			
			Properties from 'source's prototype chain will not be copied.
		
		@param {Object} [destination] Destination object.
			If this object is undefined or falsey, a new object will be created.
		
		@param {Object} [source] Properties of this object will be copied onto the destination
			If this object is undefined or falsey, a new object will be created.
		
		@returns {Object} The destination object.
		
		@example
			var obj = glow.util.apply({foo: "hello", bar: "world"}, {bar: "everyone"});
			//results in {foo: "hello", bar: "everyone"}
	*/
	util.apply = function(destination, source) {
		destination = destination || {};
		source = source || {};
		
		/*!debug*/
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
				MyOtherClass.base.apply(this, arguments);
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
		var type = _getType(object),
			paramsList = [],
			listLength = 0;
		
		/*!debug*/
			if (typeof object !== 'object') {
				throw new Error('glow.util.encodeUrl: cannot encode item');
			}
		/*gubed!*/
		
		for (var key in object) {
			type = _getType( object[key] );
			/*!debug*/
				if (type !== 'Array' || type !== 'string') {
					glow.debug.warn('[wrong type] glow.util.encodeUrl expected Array or String value for "' + key + '", not ' + type + '.');
				}
			/*gubed!*/
			if (type === 'Array') {
				for(var i = 0, l = object[key].length; i < l; i++) {
					/*!debug*/
						if (_getType(object[key])[i] !== 'string') {
							glow.debug.warn('[wrong type] glow.util.encodeUrl expected string value for "' + key + '" value at index ' + i + ', not ' + _getType(object[key])[i] + '.');
						}
					/*gubed!*/
					paramsList[listLength++] = key + '=' + encodeURIComponent(object[key][i]);
				}
			}
			else { // assume string
				paramsList[listLength++] = key + '=' + encodeURIComponent(object[key]);
			}
		}

		return paramsList.join('&');
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
			@name glow.util.encodeJson
			@function
			@description Encodes an object into a string JSON representation.
			
				Returns a string representing the object as JSON.
			
			@param {Object} object The object to be encoded.
			 
				This can be arbitrarily nested, but must not contain 
				functions or cyclical structures.
			
			@returns {Object}
			
			@example
				var myObj = {foo: "Foo", bar: ["Bar 1", "Bar2"]};
				var getRef = glow.util.encodeJson(myObj);
				// will return '{"foo": "Foo", "bar": ["Bar 1", "Bar2"]}'
			*/
	util.encodeJson = function(object, options){
		function _encode(object, options)
				{
					if(_getType(object) == TYPES.ARRAY) {
						var type = JSON.ARRAY;
					} else {
						var type = JSON.HASH;
					}

					var serial = [type.START];
					var len = 1;
					var dataType;
					var notFirst = false;

					for(var key in object) {
						dataType = _getType(object[key]);

						if(dataType != TYPES.UNDEFINED) { /* ignore undefined data */
							if(notFirst) {
								serial[len++] = JSON.DATA_SEPARATOR;
							}
							notFirst = true;

							if(type.SHOW_KEYS) {
								serial[len++] = JSON.KEY_DELIMITER;
								serial[len++] = key;
								serial[len++] = JSON.KEY_DELIMITER;
								serial[len++] = JSON.KEY_SEPARATOR;
							}

							switch(dataType) {
								case TYPES.FUNCTION:
									throw new Error("glow.data.encodeJson: cannot encode item");
									break;
								case TYPES.STRING:
								default:
									serial[len++] = JSON.STRING_DELIMITER;
									serial[len++] = glow.lang.replace(object[key], SLASHES.TEST, _replaceSlashes);
									serial[len++] = JSON.STRING_DELIMITER;
									break;
								case TYPES.NUMBER:
								case TYPES.BOOLEAN:
									serial[len++] = object[key];
									break;
								case TYPES.OBJECT:
								case TYPES.ARRAY:
									serial[len++] = _encode(object[key], options);
									break;
								case TYPES.NULL:
									serial[len++] = TYPES.NULL;
									break;
							}
						}
					}
					serial[len++] = type.END;

					return serial.join(TEXT.EMPTY);
				}

				options = options || {};
				var type = _getType(object);

				if((type == TYPES.OBJECT) || (type == TYPES.ARRAY)) {
					return _encode(object, options);
				} else {
					throw new Error("glow.data.encodeJson: cannot encode item");
				}
		
	};
	/**
			@name glow.util.decodeJson
			@function
			@description Decodes a string JSON representation into an object.
				
				Returns a JavaScript object that mirrors the data given.
			
			@param {String} string The string to be decoded.
				Must be valid JSON. 
			
			@param {Object} opts
			
					Zero or more of the following as properties of an object:
					@param {Boolean} [opts.safeMode=false] Whether the string should only be decoded if it is  deemed "safe". 
					The json.org regular expression checks are used. 
			
			@returns {Object}
			
			@example
				var getRef = glow.util.decodeJson('{foo: "Foo", bar: ["Bar 1", "Bar2"]}');
				// will return {foo: "Foo", bar: ["Bar 1", "Bar2"]}
			
				var getRef = glow.util.decodeJson('foobar', {safeMode: true});
				// will throw an error
			*/
	util.decodeJson = function(text, options){
		if(_getType(text) != TYPES.STRING) {
					throw new Error("glow.data.decodeJson: cannot decode item");
				}

				options = options || {};
				options.safeMode = options.safeMode || false;

				var canEval = true;

				if(options.safeMode) {
					canEval = (JSON.SAFE_PT1.test(text.replace(JSON.SAFE_PT2, TEXT.AT).replace(JSON.SAFE_PT3, JSON.ARRAY.END).replace(JSON.SAFE_PT4, TEXT.EMPTY)));
				}

				if(canEval) {
					try {
						return eval(TEXT.OPEN + text + TEXT.CLOSE);
					}
					catch(e) {/* continue to error */}
				}

				throw new Error("glow.data.decodeJson: cannot decode item");
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
		return str.trim ? str.trim() : str.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, '$1');
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