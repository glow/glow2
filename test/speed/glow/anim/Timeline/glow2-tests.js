// First param is the library name, as defined in woosh.libs
woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.anim1 = new glow.anim.Anim(1);
			window.anim2 = new glow.anim.Anim(2);
			window.anim3 = new glow.anim.Anim(3);
			window.anim4 = new glow.anim.Anim(1);
			window.timeline = new glow.anim.Timeline().track(anim1, anim2).track(anim3, anim4);
		}
	},
	'Creating 2 track timeline': new woosh.TimeTest(1, function() {
		return new glow.anim.Timeline()
			.track( new glow.anim.Anim(1), new glow.anim.Anim(2) )
			.track( new glow.anim.Anim(3), new glow.anim.Anim(1) ).duration;
	}),
	'Playing timeline': new woosh.AsyncTest(1, function(test) {
		var frames = 0;
		
		new glow.anim.Timeline()
			.track( new glow.anim.Anim(1), new glow.anim.Anim(2) )
			.track( new glow.anim.Anim(3), new glow.anim.Anim(1) )
			.on('frame', function() {
				frames++;
			}).on('complete', function() {
				test.setResult(frames / this.duration, 'fps', true).endTest(this.duration);
			}).start();
	}),
	'goTo': new woosh.TimeTest(1, function() {
		timeline.goTo(4).goTo(0);
	})
});