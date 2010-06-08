setTimeout(
	function() {
		
		Glow.provide(
			function(glow) {
				glow.more = glow.more || {};
				
				glow.more.one = 1;
				window.log.push(' [2] built more.one 2.1.0');
			}
		);
		
		Glow.provide(
			function(glow) {
				glow.more = glow.more || {};
				
				glow.more.two = 2;
				window.log.push('     built more.two 2.1.0');
			}
		);
		
		Glow.complete('more', '2.1.0');
	},
	500
);