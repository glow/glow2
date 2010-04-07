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
		if(_getType(text) !== 'string') {
			throw new Error('glow.util.decodeUrl: cannot decode item');
		}
		else if (text === '') {
			return {};
		}

		var result = {};
		var keyValues = text.split(/[&;]/);

		var thisPair, key, value;

		for(var i = 0, l = keyValues.length; i < l; i++) {
			thisPair = keyValues[i].split('=');
			
			if (thisPair.length < 2) {
				key = keyValues[i];
				value = '';
			}
			else {
				key   = glow.util.trim( decodeURIComponent(thisPair[0]) );
				value = glow.util.trim( decodeURIComponent(thisPair[1]) );
			}
			
			switch (_getType(result[key])) {
				case 'array':
					result[key].push(value);
					break;
				case 'undefined':
					result[key] = value;
					break;
				default:
					result[key] = [result[key], value];
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
	
	// export
	glow.util = util;
});