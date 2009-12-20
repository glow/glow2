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
				log.info(' [1] built base 2.1.1');
			}
		);
		
		Glow.complete('base', '2.1.1');
	},
	100 + Math.floor(Math.random()*1000)
);