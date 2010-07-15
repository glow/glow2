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
				window.log.push(' (1) built base 2.0.0');
			}
		);
		
		Brew.complete('base', '2.0.0');
	},
	100 + Math.floor(Math.random()*1000)
);