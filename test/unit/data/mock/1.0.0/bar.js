Glow.provide( function(glow) {
	glow.bar = glow.bar || {};
	
	glow.order = glow.order || [];
	glow.order.push('bar');
	
	glow.bar.bibble = function() {
	};
});


Glow.complete('bar', '1.0.0');