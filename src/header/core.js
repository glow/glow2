/**
	@name glow
	@namespace
	@version @VERSION@
	@description The glow library namespace
		The library can also be used as a function, which is a shortcut to
		{@link glow.NodeList}.
		
	@example
		var links = glow('a');
		// is the same as
		var links = new glow.NodeList('a');
*/
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
	glow.UID = 'glow' + Math.floor(Math.random() * (1<<30));
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
