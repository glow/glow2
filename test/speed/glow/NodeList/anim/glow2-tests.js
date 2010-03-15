woosh.addTests('glow2-src', {
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
		window.elementToAnim = glow('#elementToAnim');
	},
	'Compiling animation': new woosh.TimeTest(1, function() {
		elementToAnim.anim(2, {
			width: 800,
			height: 0,
			'margin-left': '1em'
		}, {startNow:false, tween: 'linear'});
	}),
	'Animation framerate': new woosh.VisualTest(1, function(test) {
		var frames = 0;
		
		elementToAnim.anim(2, {
			width: 800,
			height: 0,
			'margin-left': '1em'
		}, {tween: 'linear'}).on('frame', function() {
			frames++;
		}).on('complete', function() {
			test.setResult(frames / this.duration, 'fps', true).endTest();
		});
	}),
	'Animation framerate (inc colour)': new woosh.VisualTest(1, function(test) {
		var frames = 0;
		
		elementToAnim.anim(2, {
			width: 800,
			height: 0,
			'margin-left': '1em',
			'background-color': 'green'
		}, {tween: 'linear'}).on('frame', function() {
			frames++;
		}).on('complete', function() {
			test.setResult(frames / this.duration, 'fps', true).endTest();
		});
	})
});