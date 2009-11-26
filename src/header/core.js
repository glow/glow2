/*
 * BBC Glow javaScript Library (c) 2009
 * Package: core
 * Revision: 1ac626v8222j332l2k2wscdaa163
 */

if (typeof Glow == 'undefined') {
	glow = (typeof glow == 'undefined')? {} : glow;
	Glow = { provide: function(module) { module.builder(glow); }, complete: function(){} };
}

/*!debug*/
Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		/*!include:glowbug.js*/;
		if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
	}
});
/*gubed!*/