Glow.provide(function(glow) {
	var util = {};
	
	util.apply = function(destination, source) {
		for (var i in source) {
			destination[i] = source[i];
		}
		return destination;
	};
	/**
	@name glow.utll.replace
	@function
	@description Makes a replacement in a string.

		Has the same interface as the builtin
		String.prototype.replace method, but takes the input
		string as the first parameter. In general the native string
		method should be used unless you need to pass a function as the
		second parameter, as this method will work accross our
		supported browsers.

	@param {String} str Input string

	@param {String | RegExp} pattern String or regular expression to match against

	@param {String | Function} replacement String to make replacements with, or a function to generate the replacements

	@returns {String}
		A new string with the replacement(s) made

	@example
		var myDays = '1 3 6';
		var dayNames = glow.util.replace(myDays, /(\d)/, function (day) {
			return " MTWTFSS".charAt(day - 1);
		});
		// dayNames now contains "M W S"
	*/
	util.replace = function() {
		var replaceBroken = "g".replace(/g/, function () { return 'l'; }) != 'l',
			def = String.prototype.replace;
			
			return function (inputString, re, replaceWith) {
				
		
		var pos, match, last, buf;
			if (! replaceBroken || typeof(replaceWith) != 'function') {
				return def.call(inputString, re, replaceWith);
			}
			if (! (re instanceof RegExp)) {
				pos = inputString.indexOf(re);
				return pos == -1 ?
				inputString : def.call(inputString, re, replaceWith.call(null, re, pos, inputString));
			}
			buf = [];
			last = re.lastIndex = 0;
			while ((match = re.exec(inputString)) != null) {
				pos = match.index;
				buf[buf.length] = inputString.slice(last, pos);
				buf[buf.length] = replaceWith.apply(null, match);
				if (re.global) {
					last = re.lastIndex;
				} else {
					last = pos + match[0].length;
					break;
					}
			}
			buf[buf.length] = inputString.slice(last);
			return buf.join("");
			};
	};
	// export
	glow.util = util;
});