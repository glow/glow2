woosh.addTests('jq-142', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			document.getElementById('msg').style.display = 'none';
			window.htmlForTest = document.getElementById('htmlForTest');
			htmlForTest.style.height = 'auto';
			window.htmlStr = htmlForTest.innerHTML;
		}
		else {
			htmlForTest.innerHTML = htmlStr;
		}
		window.elementToAnim = $('#elementToAnim');
	},
	'Compiling animation': new woosh.TimeTest(1, function() {
		elementToAnim.animate({
			width: 800,
			height: 0,
			'margin-left': '1em'
		}, {duration: 2000}).stop();
	}),
	'Animation framerate': new woosh.VisualTest(1, function(test) {
		var frames = 0;
		
		elementToAnim.animate({
			width: 800,
			height: 0,
			'margin-left': '1em'
		}, {
			duration: 2000,
			step: function() {
				frames++;
			},
			complete: function() {
				// divide frames by 3, it calls step per property
				test.setResult( (frames / 3) / 2, 'fps', true ).endTest();
			}
		});
	})
});