var glowbug = {
	log: function(msg) {
		if (window.console && typeof window.console.log == 'function') {
			console.log(msg);
		}
	}
	,
	warn: function(msg) {
		if (window.console && typeof window.console.warn == 'function') {
			console.warn(msg);
		}
	}
	,
	error: function(msg) {
		if (window.console && typeof window.console.error == 'function') {
			console.error(msg);
		}
	}
};