// First param is the library name, as defined in woosh.libs
woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {},
	'linear': new woosh.TimeTest(1, function() {
		glow.tweens.linear(1);
	}),
	'easeIn': new woosh.TimeTest(1, function() {
		glow.tweens.easeIn(1);
	}),
	'easeOut': new woosh.TimeTest(1, function() {
		glow.tweens.easeOut(1);
	}),
	'easeBoth': new woosh.TimeTest(1, function() {
		glow.tweens.easeBoth(1);
	}),
	'overshootIn': new woosh.TimeTest(1, function() {
		glow.tweens.overshootIn(1);
	}),
	'overshootOut': new woosh.TimeTest(1, function() {
		glow.tweens.overshootOut(1);
	}),
	'overshootBoth': new woosh.TimeTest(1, function() {
		glow.tweens.overshootBoth(1);
	}),
	'bounceIn': new woosh.TimeTest(1, function() {
		glow.tweens.bounceIn(1);
	}),
	'bounceOut': new woosh.TimeTest(1, function() {
		glow.tweens.bounceOut(1);
	}),
	'elasticIn': new woosh.TimeTest(1, function() {
		glow.tweens.elasticIn(1);
	}),
	'elasticOut': new woosh.TimeTest(1, function() {
		glow.tweens.elasticOut(1);
	}),
	'combine': new woosh.TimeTest(1, function() {
		glow.tweens.combine(1);
	})
});