setTimeout(
	function() {
		
		Brew.provide(
			function($) {
				$.dom = $.dom || {};
				
				$.dom.one = 1;
				window.log.push(' (2) built dom.one 2.0.0');
			}
		);
		
		Brew.provide(
			function($) {
				$.dom = $.dom || {};
				
				$.dom.two = 2;
				window.log.push('     built dom.two 2.0.0');
			}
		);
		
		Brew.complete('dom', '2.0.0');
	},
	100 + Math.floor(Math.random()*1000)
);