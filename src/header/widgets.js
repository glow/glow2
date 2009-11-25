/*
 * BBC Glow javaScript Library (c) 2009
 * Package: widgets
 * Revision: 4t6334fs281ac6222j337fa16v82
 */

if (typeof Glow == 'undefined') {
	glow = (typeof glow == 'undefined')? {} : glow;
	Glow = { provide: function(module) { module.builder(glow); }, complete: function(){} };
}
