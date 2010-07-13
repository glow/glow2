setTimeout(
	function() {
	
		Brew.provide(
			function($) {
				if (!$.dom) { throw new Error('Cannot build widgets before dom.'); }
				
				$.widgets = {};
				window.log.push(' (3) built widgets 2.0.0');
			}
		);
		
		Brew.complete('widgets', '2.0.0');
	},
	100 + Math.floor(Math.random()*1000)
);