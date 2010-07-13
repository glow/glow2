

setTimeout(
	function() {
		
		Brew.provide(
			function($) {
				$.more = $.more || {};
				
				$.more.one = 1;
				window.log.push(' [2] built more.one 2.1.1');
			}
		);
		
		Brew.provide(
			function($) {
				$.more = $.more || {};
				
				$.more.two = 2;
				window.log.push('     built more.two 2.1.1');
			}
		);
		
		Brew.complete('more', '2.1.1');
	},
	500
);