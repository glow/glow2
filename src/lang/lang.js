/*!debug*/
	// this will only appear in the debug version
/*gubed!*/

/**
	@name glow.lang
	@namespace
 */

Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		glow.lang = glow.lang || {};
		
		/**
			@name glow.lang.trim
			@function
			@param {String} str
		 */
		glow.lang.trim = function(str) {
			return str.replace(/^\s*((?:[\S\s]*\S)?)\s*$/, '$1');
		};
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		glow.lang = glow.lang || {};
		
		/**
			@name glow.lang.toArray
			@function
			@param {String} str
		 */
		glow.lang.toArray = function(arrayLike) {
			if (arrayLike.constructor == Array) {
				return arrayLike;
			}
			//use array.slice if not IE? Could be faster
			var r = [];
			for (var i = 0, len = arrayLike.length; i < len; i++) {
				r[i] = arrayLike[i];
			}
			return r;
		};
		
		
		
		glow.lang.apply = function(destination, source) {
					for (var i in source) {
						destination[i] = source[i];
					}
					return destination;
				};
		
	}
});