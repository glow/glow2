setTimeout(
	function() {
		Glow.provide({
			version: '@SRC@',
			builder: function(glow) {
				glow.foo = glow.foo || {};
				
				glow.order = glow.order || [];
				glow.order.push('foo');
				
				glow.foo.fibble = function() {
				};
			}
		});
		
		
		Glow.complete({packageName: 'foo', version: '@SRC@'});
	}
	,
	1000
);