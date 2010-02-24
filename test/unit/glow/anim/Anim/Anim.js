module('glow.anim.Anim');

test('Creating animation instances', 12, function() {
	equal(typeof glow.anim, 'object', 'glow.anim namespace');
	equal(typeof glow.anim.Anim, 'function', 'glow.anim.Anim constructor');
	
	var anim = new glow.anim.Anim(3);
	
	equal(anim.constructor, glow.anim.Anim, 'Constructor creates instance');
	equal(typeof anim.tween, 'function', 'Tween set');
	strictEqual(anim.position, 0, 'Position set');
	strictEqual(anim.playing, false, 'playing set');
	strictEqual(anim.loop, false, 'looping set');
	strictEqual(anim.value, 0, 'value set');
	strictEqual(anim.duration, 3, 'duration set');
	
	var anim2 = glow.anim.Anim(3);
	
	equal(anim2.constructor, glow.anim.Anim, 'Constructor creates instance without new');
	
	var customTween = function(t) { return t; };
	var anim3 = glow.anim.Anim(5, {
		loop: true,
		tween: customTween
	});
	
	strictEqual(anim3.loop, true, 'looping set');
	strictEqual(anim3.tween, customTween, 'tween set');
});

test('Basic animation event & prop lifecycle', 19, function() {
	stop(5000);
	
	var eventLog = [],
		positionLog = [],
		positionsCorrect = true,
		valueLog = [],
		valuesCorrect = true,
		startDate = new Date;
	
	var anim = glow.anim.Anim(2).on('start', function() {
		eventLog.push('start');
		strictEqual(anim.position, 0, 'Position set');
		strictEqual(anim.playing, false, 'playing set');
		strictEqual(anim.value, 0, 'value set');
	}).on('frame', function() {
		// avoid logging multiple frames in a row
		if (eventLog.slice(-1)[0] != 'frame') {
			eventLog.push('frame');
			strictEqual(anim.position, 0, 'First frame is position 0');
			strictEqual(anim.playing, true, 'playing set on first frame');
			strictEqual(anim.value, 0, 'First frame is value 0');
		}
		valueLog.push(anim.value);
		positionLog.push(anim.position);
	}).on('stop', function() {
		// this event shouldn't fire as we don't stop the animation
		eventLog.push('stop');
	}).on('complete', function() {
		eventLog.push('complete');
		
		// check value log
		strictEqual(valueLog[0], 0, 'Values start');
		strictEqual(valueLog.slice(-1)[0], 1, 'Values end');
		for (var i = 0, leni = valueLog.length - 1; i < leni; i++) {
			// make sure each value isn't larger than the next value
			// this may happen for some tweens, but not this one
			if ( valueLog[i] > valueLog[i + 1] ) {
				valuesCorrect = false;
				break;
			}
		}
		// check position log
		strictEqual(positionLog[0], 0, 'Position start');
		strictEqual(positionLog.slice(-1)[0], 2, 'Position end');
		for (var i = 0, leni = positionLog.length - 1; i < leni; i++) {
			// make sure each value isn't larger than the next value
			// this may happen for some tweens, but not this one
			if ( positionLog[i] > positionLog[i + 1] ) {
				positionsCorrect = false;
				break;
			}
		}
		
		strictEqual(anim.position, 2, 'End position');
		strictEqual(anim.playing, true, 'End playing (true as it stops after event)');
		strictEqual(anim.value, 1, 'End value');
		
		var animLen = new Date - startDate;
		ok(animLen >= 2000, 'Animation lasted ~ 2 seconds (' + animLen + ')');
		same(eventLog, ['start', 'frame', 'complete'], 'Events fired correctly');
		ok(positionsCorrect, 'Positions look correct');
		ok(valuesCorrect, 'Values look correct');
		
		start();
	});
	
	equal(typeof anim.start, 'function', 'start is function');
	
	equal(anim.start(), anim, 'start returns self');
});

test('2 animations running at once', 9, function() {
	stop();
	
	var anim1 = glow.anim.Anim(1),
		anim2 = glow.anim.Anim(2),
		eventLog = [],
		anim1ValueLog = [],
		anim2ValueLog = [],
		anim1FirstFrame = true,
		anim2FIrstFrame = true,
		valuesCorrect = true,
		startTime = new Date;
		
	anim1.on('start', function() {
		eventLog.push('anim1 start');
	}).on('frame', function() {
		if (eventLog.slice(-1)[0] !== 'frame') {
			eventLog.push('frame');
		}
		anim1ValueLog.push(this.value);
	}).on('complete', function() {
		var duration = new Date - startTime;
		eventLog.push('anim1 complete');
		ok(duration >= 1000 && duration < 2000, 'anim1 duration correct ' + duration);
	});
	
	anim2.on('start', function() {
		eventLog.push('anim2 start');
	}).on('frame', function() {
		if (eventLog.slice(-1)[0] !== 'frame') {
			eventLog.push('frame');
		}
		anim2ValueLog.push(this.value);
	}).on('complete', function() {
		eventLog.push('anim2 complete');
		
		var duration = new Date - startTime;
		ok(duration >= 2000, 'anim2 duration correct ' + duration);
		
		same(eventLog, [
			'anim1 start',
			'frame',
			'anim2 start',
			'frame',
			'anim1 complete',
			'frame',
			'anim2 complete'
		], 'Events fired correctly');
		
		strictEqual(anim1ValueLog[0], 0, 'anim1 Values start');
		strictEqual(anim1ValueLog.slice(-1)[0], 1, 'anim1 Values end');
		for (var i = 0, leni = anim1ValueLog.length - 1; i < leni; i++) {
			// make sure each value isn't larger than the next value
			// this may happen for some tweens, but not this one
			if ( anim1ValueLog[i] > anim1ValueLog[i + 1] ) {
				valuesCorrect = false;
				break;
			}
		}
		ok(valuesCorrect, 'anim1 Values look correct');
		
		valuesCorrect = true;
		strictEqual(anim2ValueLog[0], 0, 'anim2 Values start');
		strictEqual(anim2ValueLog.slice(-1)[0], 1, 'anim2 Values end');
		for (var i = 0, leni = anim2ValueLog.length - 1; i < leni; i++) {
			// make sure each value isn't larger than the next value
			// this may happen for some tweens, but not this one
			if ( anim2ValueLog[i] > anim2ValueLog[i + 1] ) {
				valuesCorrect = false;
				break;
			}
		}
		ok(valuesCorrect, 'anim2 Values look correct');
		
		start();
	});
	
	anim1.start();
	anim2.start();
});

test('animation stopping and resuming', 4, function() {
	stop();
	
	var eventLog = [],
		positionLog = [],
		firstHalf = true,
		anim = glow.anim.Anim(1).on('start', function() {
			eventLog.push('start');
		}).on('frame', function() {
			if (eventLog.slice(-1)[0] !== 'frame') {
				eventLog.push('frame');
			}
			if (firstHalf && this.position >= 0.5) {
				firstHalf = false;
				anim.stop();
				ok(Math.max.apply(null, positionLog) <= 0.5, 'First half position vals lte 0.5');
				positionLog = [];
				// use a set timeout to see if the animation continues playing
				setTimeout(function() {
					eventLog.push('timeout');
					anim.start();
				}, 500);
			}
		}).on('stop', function() {
			eventLog.push('stop');
		}).on('complete', function() {
			eventLog.push('complete');
			ok(Math.max.apply(null, positionLog) <= 1, 'Second half position vals lte 1');
			ok(Math.min.apply(null, positionLog) >= 0.5, 'Second half position vals gte 0.5');
			same(eventLog, [
				'start',
				'frame',
				'stop',
				'timeout',
				'start',
				'frame',
				'complete'
			], 'correct events');
			start();
		});
		
	anim.start();
});

test('event cancelling (start & stop)', function() {
	stop();
	
	var cancelStart = true,
		stopped = false,
		eventLog = [],
		anim = glow.anim.Anim(0.5).on('start', function() {
			eventLog.push('start');
			// cancel the start event once
			var r = !cancelStart;
			if (cancelStart) {
				cancelStart = false;
				// call start again in a bit
				setTimeout(function() {
					eventLog.push('timeout');
					anim.start();
				}, 500)
			}
			return r;
		}).on('frame', function() {
			if (eventLog.slice(-1)[0] !== 'frame') {
				eventLog.push('frame');
			}
			if (!stopped && this.position > 0.25) {
				stopped = true;
				this.stop();
			}
		}).on('stop', function() {
			eventLog.push('stop');
			return false;
		}).on('complete', function() {
			eventLog.push('complete');
			same(eventLog, [
				'start',
				'timeout',
				'start',
				'frame',
				'stop',
				'frame',
				'complete'
			], 'Correct events');
			start();
			
		}).start();
});

test('event cancelling (complete)', 2, function() {
	stop(5000);
	
	var loopCount = 2,
		firstFrame = true,
		lastPos = 0.5,
		correctPositions = true,
		eventLog = [],
		anim = glow.anim.Anim(0.5).on('start', function() {
			eventLog.push('start');
		}).on('frame', function() {
			if (eventLog.slice(-1)[0] !== 'frame') {
				eventLog.push('frame');
			}
			if (firstFrame) {
				firstFrame = false;
				correctPositions = correctPositions && (lastPos > this.position);
			} else {
				correctPositions = correctPositions && (lastPos <= this.position);
			}
			lastPos = this.position;
		}).on('stop', function() {
			// shouldn't fire
			eventLog.push('stop');
		}).on('complete', function() {
			eventLog.push('complete');
			if (!loopCount) {
				same(eventLog, [
					'start',
					'frame',
					'complete',
					'frame',
					'complete',
					'frame',
					'complete'
				], 'Correct events');
				ok(correctPositions, 'Positions look correct')
				start();
			}
			firstFrame = true;
			return !loopCount--;
		}).start();
});

test('starting from position', 1, function() {
	stop();
	
	var positionLog = [],
		anim = glow.anim.Anim(0.5).on('frame', function() {
			positionLog.push(this.position);
		}).on('complete', function() {
			equal(Math.min.apply(null, positionLog), 0.3, 'Started 0.3 in');
			start();
		}).start(0.3);
});

test('goTo', 2, function() {
	stop();
	
	var positionLog = [],
		anim = glow.anim.Anim(0.5).on('frame', function() {
			positionLog.push(this.position);
		}).on('complete', function() {
			equal(Math.min.apply(null, positionLog), 0.3, 'Started 0.3 in');
			start();
		});
		
	anim.goTo(0.2).goTo(0.1);
	same(positionLog, [0.2, 0.1], 'goTo fires frames');
	positionLog = [];
	anim.goTo(0.3).start();
});

test('destroy', 1, function() {
	stop();
	
	var eventLog = [],
		anim = glow.anim.Anim(0.5).on('start', function() {
			eventLog.push('start');
		}).on('frame', function() {
			if (eventLog.slice(-1)[0] !== 'frame') {
				eventLog.push('frame');
			}
		}).on('stop', function() {
			// shouldn't fire
			eventLog.push('stop');
		}).on('complete', function() {
			eventLog.push('complete');
			
			// the animation will auto-destroy now, if we try and play it again it won't fire events
			setTimeout(function() {
				// restart anim, events should be gone by now
				anim.start();
			}, 0);
			setTimeout(function() {
				same(eventLog, ['start', 'frame', 'complete'], 'Correct event sequence');
				start();
			}, 250);
		}).start();
});

test('Looping', 2, function() {
	stop(5000);
	
	var loopCount = 2,
		firstFrame = true,
		lastPos = 0.5,
		correctPositions = true,
		eventLog = [],
		anim = glow.anim.Anim(0.5, {loop:true}).on('start', function() {
			eventLog.push('start');
		}).on('frame', function() {
			if (eventLog.slice(-1)[0] !== 'frame') {
				eventLog.push('frame');
			}
			if (firstFrame) {
				firstFrame = false;
				correctPositions = correctPositions && (lastPos > this.position);
			} else {
				correctPositions = correctPositions && (lastPos <= this.position);
			}
			lastPos = this.position;
		}).on('stop', function() {
			// shouldn't fire
			eventLog.push('stop');
		}).on('complete', function() {
			eventLog.push('complete');
			if (!loopCount) {
				same(eventLog, [
					'start',
					'frame',
					'complete',
					'frame',
					'complete',
					'frame',
					'complete'
				], 'Correct events');
				ok(correctPositions, 'Positions look correct')
				start();
			}
			firstFrame = true;
			if (!loopCount--) {
				this.loop = false;
			}
		}).start();
});

test('Tweening', 2, function() {
	stop(5000);
	
	// make a tween that always returns 0.5
	function customTween() {
		return 0.5;
	}
	
	var valueLog = [],
		anim = glow.anim.Anim(0.5, {tween:customTween}).on('frame', function() {
			valueLog.push( String(this.value) );
		}).on('complete', function() {
			var expectedValueLog = new Array(valueLog.length + 1).join('0.5,').slice(0, -1).split(',');
			equal(valueLog.length, expectedValueLog.length, 'Values log is expected length');
			same(valueLog, expectedValueLog, 'Values are all 0.5');
			start();
		}).start();
});

test('String tween', 1, function() {
	stop(5000);
	
	var valueLog = [],
		anim = glow.anim.Anim(0.5, {tween:'elasticOut'}).on('frame', function() {
			valueLog.push(this.value);
		}).on('complete', function() {
			// the elasticOut tween's values go beyond 1, we use that to test if that tween was used
			ok(Math.max.apply(null, valueLog) > 1, 'Values look correct');
			start();
		}).start();
});

// to test:
// prop (and target)
// memory creep