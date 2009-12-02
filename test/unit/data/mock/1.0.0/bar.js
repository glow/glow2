Glow.provide({
	version: '1.0.0',
	builder: function(glow) {
		glow.bar = glow.bar || {};
		
		glow.order = glow.order || [];
		glow.order.push('bar');
		
		glow.bar.bibble = function() {
		};
	}
});


Glow.complete({packageName: 'bar', version: '1.0.0'});