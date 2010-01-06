Glow.provide(function(glow) {
	var util = {};
	
	util.apply = function(destination, source) {
		for (var i in source) {
			destination[i] = source[i];
		}
		return destination;
	};
	
	// export
	glow.util = util;
});