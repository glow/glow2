// First param is the library name, as defined in woosh.libs
woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.anim1 = new glow.anim.Animation(1);
			window.anim2 = new glow.anim.Animation(2);
			window.anim3 = new glow.anim.Animation(3);
			window.anim4 = new glow.anim.Animation(1);
			window.timeline = new glow.anim.Timeline([
				[anim1, anim2],
				[anim3, anim4]
			]);
		}
	},
	'Creating 2 track timeline': new woosh.TimeTest(1, function() {
		return new glow.anim.Timeline([
			[new glow.anim.Animation(1), new glow.anim.Animation(2)],
			[new glow.anim.Animation(3), new glow.anim.Animation(1)]
		]).duration;
	}),
	'Playing timeline': new woosh.AsyncTest(1, function(test) {
		var frames = 0,
			timeline = new glow.anim.Timeline([
				[new glow.anim.Animation(1), new glow.anim.Animation(2)],
				[new glow.anim.Animation(3), new glow.anim.Animation(1)]
			]);
		
		glow.events.addListener(timeline, 'frame', function() {
			frames++;
		});
		
		glow.events.addListener(timeline, 'complete', function() {
			test.setResult(frames / timeline.duration, 'fps', true).endTest(timeline.duration);
		});
		
		timeline.start();
		
	}),
	'goTo': new woosh.TimeTest(1, function() {
		timeline.goTo(4).goTo(0);
	})
});