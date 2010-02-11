module('glow.events');
	test('Tweens basic tests', function() {
	expect(33);
	
	var tweenTypes = [
		"linear",
		"easeIn", "easeOut", "easeBoth",
		"overshootIn", "overshootOut", "overshootBoth",
		"bounceIn", "bounceOut",
		"elasticIn", "elasticOut"
	],
		i,
		len = tweenTypes.length,
		tween;
	
	for (i = 0; i < len; i++) {
		tween = glow.tweens[tweenTypes[i]]();
		ok(tween instanceof Function, tweenTypes[i] + " is function");
		equal(tween(0), 0, tweenTypes[i] + " starts at 0");
		equal(tween(1), 1, tweenTypes[i] + " ends at 1");
	}
});