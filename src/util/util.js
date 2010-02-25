/**
	@name glow.util
	@namespace
	@description Core JavaScript helpers
*/
Glow.provide(function(glow) {
	var util = {},
		undefined;
	
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
	}
	
	// export
	glow.util = util;
});