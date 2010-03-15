woosh.addTests('glow-170', {
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
		window.elementToAnim = glow.dom.get('#elementToAnim');
	},
	'Compiling animation': new woosh.TimeTest(1, function() {
		glow.anim.css(elementToAnim, 2, {
			width: 800,
			height: 0,
			'margin-left': '1em'
		});
	}),
	'Animation framerate': new woosh.VisualTest(1, function(test) {
		var frames = 0,
			anim = glow.anim.css(elementToAnim, 2, {
				width: 800,
				height: 0,
				'margin-left': '1em'
			}).start();
		
		glow.events.addListener(anim, 'frame', function() {
			frames++;
		});
		
		glow.events.addListener(anim, 'complete', function() {
			test.setResult(frames / this.duration, 'fps', true).endTest();
		});
	}),
	'Animation framerate (inc colour)': new woosh.VisualTest(1, function(test) {
		var frames = 0,
			anim = glow.anim.css(elementToAnim, 2, {
				width: 800,
				height: 0,
				'margin-left': '1em',
				'background-color': 'green'
			}).start();
		
		glow.events.addListener(anim, 'frame', function() {
			frames++;
		});
		
		glow.events.addListener(anim, 'complete', function() {
			test.setResult(frames / this.duration, 'fps', true).endTest();
		});
	})
});