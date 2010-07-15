setTimeout(
	function() {
		Brew.provide(
			function($) {
				$.base = $.base || {};
			}
		);
		
		Brew.provide(
			function($) {
				$.base = $.base || {};
				
				$.base.isLoaded = true;
				window.log.push(' [1] built base 2.1.1');
			}
		);
		
		Brew.complete('base', '2.1.1');
	},
	100 + Math.floor(Math.random()*1000)
);