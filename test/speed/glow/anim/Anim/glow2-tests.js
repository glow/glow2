// First param is the library name, as defined in woosh.libs
woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.anim = glow.anim.Anim(3).target({});
		}
	},
	'Creating animation & adding frame event': new woosh.TimeTest(1, function() {
		var anim = new glow.anim.Anim(5).on('frame', function() {
		});
		return anim.duration;
	}),
	'Empty anim': new woosh.AsyncTest(1, function(test) {
		var frames = 0,
			anim = new glow.anim.Anim(3).on('frame', function() {
				frames++;
			}).on('complete', function() {
				test.setResult(frames / anim.duration, 'fps', true).endTest(anim.duration);
			}).start();
	}),
	'Compiling anim': new woosh.TimeTest(1, function(test) {
		anim.prop('propName', {
			template: 'blah?blah?blah',
			to: [4, 5],
			from: [1, 2],
			max: 100,
			min: 0,
			round: true
		});
	}),
	'Reversing anim': new woosh.TimeTest(1, function(test) {
		anim.reverse();
	})
});