if (typeof Glow == 'undefined') {
	glow = (typeof glow == 'undefined')? {} : glow;
	Glow = { provide: function(module) { module.builder(glow); }, complete: function(){} };
}
