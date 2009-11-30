Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		glow.bar = glow.bar || {};
		
		glow.order = glow.order || [];
		glow.order.push('bar');
		
		glow.bar.bibble = function() {
		};
	}
});


Glow.complete({packageName: 'bar', version: '@SRC@'});