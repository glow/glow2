setTimeout(
	function() {
		Glow.provide(function(glow) {
			glow.foo = glow.foo || {};
			
			glow.order = glow.order || [];
			glow.order.push('foo');
			
			glow.foo.fibble = function() {
			};
		});
		
		
		Glow.complete('foo', '1.0.0');
	}
	,
	1000
);