if (!window.Glow) { // loading packages via user SCRIPT tags?
	window.Glow = {
		provide: function(f) {
			f(glow);
		},
		complete: function(n, version) {
			glow.version = version;
		}
	};
	
	window.glow = function(nodeListContents) {
		return new glow.NodeList(nodeListContents);
	};
	
	glow.load = function() {
		throw new Error('Method load() is not available without glow.js');
	}
}


Glow.provide(function(glow) {
	/*!debug*/
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
	/*gubed!*/
});
