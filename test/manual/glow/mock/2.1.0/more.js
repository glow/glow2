setTimeout(
	function() {
		
		Glow.provide(
			function(glow) {
				glow.more = glow.more || {};
				
				glow.more.one = 1;
				log.info(' [2] built more.one 2.1.0');
			}
		);
		
		Glow.provide(
			function(glow) {
				glow.more = glow.more || {};
				
				glow.more.two = 2;
				log.info('     built more.two 2.1.0');
			}
		);
		
		Glow.complete('more', '2.1.0');
	},
	500
);