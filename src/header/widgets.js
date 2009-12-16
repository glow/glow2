if (typeof Glow == 'undefined') {
	glow = (typeof glow == 'undefined')? {} : glow;
	Glow = { provide: function(builder) { builder(glow); }, complete: function(){} };
}
