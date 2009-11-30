var glowbug = {
	log: function(msg) {
		if (window.console && typeof window.console.log == 'function') {
			console.log(msg);
		}
		else if (window.opera && opera.postError) {
			opera.postError('[LOG] ' + msg);
		}
	}
	,
	warn: function(msg) {
		if (window.console && typeof window.console.warn == 'function') {
			console.warn(msg);
		}
		else if (window.opera && opera.postError) {
			opera.postError('[WARN] ' + msg);
		}
	}
	,
	error: function(msg) {
		if (window.console && typeof window.console.error == 'function') {
			console.error(msg);
		}
		else if (window.opera && opera.postError) {
			opera.postError('[ERROR] ' + msg);
		}
	}
};