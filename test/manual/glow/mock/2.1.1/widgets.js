setTimeout(
	function() {
			
			Glow.provide(
			function(glow) {
				if (!glow.more) { throw new Error('Cannot build widgets before more.'); }
				
				glow.widgets = {};
				log.info(' [3] built widgets 2.1.1');
			}
		);
		
		Glow.complete('widgets', '2.1.1');
	},
	100 + Math.floor(Math.random()*1000)
);