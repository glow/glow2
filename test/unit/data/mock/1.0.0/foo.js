setTimeout(
	function() {
		Brew.provide(function($) {
			$.foo = $.foo || {};
			
			$.order = $.order || [];
			$.order.push('foo');
			
			$.foo.fibble = function() {
			};
		});
		
		
		Brew.complete('foo', '1.0.0');
	}
	,
	1000
);