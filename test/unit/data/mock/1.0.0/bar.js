Brew.provide( function(glow) {
	glow.bar = glow.bar || {};
	
	glow.order = glow.order || [];
	glow.order.push('bar');
	
	glow.bar.bibble = function() {
	};
});


Brew.complete('bar', '1.0.0');