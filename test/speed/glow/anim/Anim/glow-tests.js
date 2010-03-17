// First param is the library name, as defined in woosh.libs
woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {}
	},
	'Creating animation & adding frame event': new woosh.TimeTest(1, function() {
		var anim = new glow.anim.Animation(5)
		glow.events.addListener(anim, 'frame', function() {
		});
		return anim.duration;
	}),
	'Empty anim': new woosh.AsyncTest(1, function(test) {
		var frames = 0,
			anim = new glow.anim.Animation(3);
		
		glow.events.addListener(anim, 'frame', function() {
			frames++;
		});
		
		glow.events.addListener(anim, 'complete', function() {
			test.setResult(frames / anim.duration, 'fps', true).endTest(anim.duration);
		});
			
		anim.start();
	})
});