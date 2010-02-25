module('reverse');

test('reverse', 3, function() {
	stop(2000);
	
	var anim = glow.anim.Anim(0.5),
		valueLog = [];
	
	equal(typeof anim.reverse, 'function', 'Reverse is function');
	
	anim.reverse().on('frame', function() {
		valueLog.push(this.value);
	}).on('complete', function() {
		equal(valueLog[0], 1, 'first value correct');
		equal(valueLog.slice(-1)[0], 0, 'last value correct');
		start();
	});
	
	anim.start();
});

test('reverse while playing', 3, function() {
	stop(2000);

	var anim = glow.anim.Anim(0.5),
		valueLog = [],
		reversedVal;
	
	anim.on('frame', function() {
		valueLog.push(this.value);
		if (this.value > 0.5 && !reversedVal) {
			reversedVal = this.value;
			this.reverse();
		}
	}).on('complete', function() {
		equal(valueLog[0], 0, 'first value correct');
		equal(valueLog.slice(-1)[0], 0, 'last value correct');
		equal(Math.max.apply(null, valueLog), reversedVal, 'Animation doesn\'t do beyond value we reversed at')
		start();
	});
	
	anim.start();
});

module('pingPong');

test('pingPong', 6, function() {
	stop(2000);
	
	var anim = glow.anim.Anim(0.5),
		valueLog = [],
		startTime = new Date;
	
	equal(typeof anim.pingPong, 'function', 'pingPong is function');
	
	anim.pingPong().on('frame', function() {
		valueLog.push(this.value);
	}).on('complete', function() {
		equal(valueLog[0], 0, 'first value correct');
		equal(valueLog.slice(-1)[0], 0, 'last value correct');
		ok(Math.max.apply(null, valueLog) > 0.9, 'looks like it peaks around 1');
		equal(this.duration, 1, 'duration reports doubled');
		ok(new Date - startTime >= 1000, 'Anim duration actually doubled');
		start();
	});
	
	anim.start();
});