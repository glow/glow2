Glow.provide({
	version: '2.0.0',
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
	version: '2.0.0',
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
	}
});