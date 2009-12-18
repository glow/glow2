if (!window.Glow) { // loading packages via user SCRIPT tags?
	Glow = { provide: function(f) { f(glow); }, complete: function(n, v){ glow.version = v; } };
	if (!window.glow) { glow = { load: function(){ throw new Error('Method load() is not available without glow.js'); } }; }
}

/*!debug*/
Glow.provide(function(glow) {
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
});
/*gubed!*/