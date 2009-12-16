if (typeof Glow == 'undefined') {
	glow = (typeof glow == 'undefined')? {} : glow;
	Glow = { provide: function(builder) { builder(glow); }, complete: function(){} };
}

/*!debug*/
Glow.provide(function(glow) {
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
});
/*gubed!*/