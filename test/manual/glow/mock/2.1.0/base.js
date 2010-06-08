setTimeout(
	function() {
		Glow.provide(
			function(glow) {
				glow.base = glow.base || {};
			}
		);
		
		Glow.provide(
			function(glow) {
				glow.base = glow.base || {};
				
				glow.base.isLoaded = true;
				window.log.push(' [1] built base 2.1.0');
			}
		);
		
		Glow.complete('base', '2.1.0');
	},
	100 + Math.floor(Math.random()*1000)
);