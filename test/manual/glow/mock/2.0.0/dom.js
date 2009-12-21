setTimeout(
	function() {
		
		Glow.provide(
			function(glow) {
				glow.dom = glow.dom || {};
				
				glow.dom.one = 1;
				log.info(' (2) built dom.one 2.0.0');
			}
		);
		
		Glow.provide(
			function(glow) {
				glow.dom = glow.dom || {};
				
				glow.dom.two = 2;
				log.info('     built dom.two 2.0.0');
			}
		);
		
		Glow.complete('dom', '2.0.0');
	},
	100 + Math.floor(Math.random()*1000)
);