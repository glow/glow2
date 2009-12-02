setTimeout(
	function() {
		Glow.provide({
			version: '1.0.0',
			builder: function(glow) {
				glow.foo = glow.foo || {};
				
				glow.order = glow.order || [];
				glow.order.push('foo');
				
				glow.foo.fibble = function() {
				};
			}
		});
		
		
		Glow.complete({packageName: 'foo', version: '1.0.0'});
	}
	,
	1000
);