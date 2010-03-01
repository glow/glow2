module('glow.anim.Timeline');

test('Creating Timeline instances', 9, function() {
	equal(typeof glow.anim.Timeline, 'function', 'glow.anim.Timeline constructor');
	
	var timeline = new glow.anim.Timeline();
	
	equal(timeline.constructor, glow.anim.Timeline, 'Constructor creates instance');
	strictEqual(timeline.position, 0, 'Position set');
	strictEqual(timeline.playing, false, 'playing set');
	strictEqual(timeline.duration, 0, 'duration set');
	strictEqual(timeline.destroyOnComplete, true, 'destroyOnComplete set');
	
	var timeline2 = glow.anim.Timeline();
	
	equal(timeline2 && timeline2.constructor, glow.anim.Timeline, 'Constructor creates instance without new');
	
	var timeline3 = glow.anim.Timeline({
		loop: true,
		destroyOnComplete: false
	});
	
	strictEqual(timeline3.loop, true, 'looping set');
	strictEqual(timeline3.destroyOnComplete, false, 'destroyOnComplete set');
});

test('Adding animations to a timeline', 6, function() {
	var anim1 = glow.anim.Anim(3).start(),
		anim2 = glow.anim.Anim(2),
		timeline = glow.anim.Timeline(),
		returnVal;
		
	equal(typeof timeline.track, 'function', '#track correct type');
	equal(anim1.playing, true, 'anim1 is playing');
	
	returnVal = timeline.track(anim1, anim2);
	
	equal(returnVal, timeline, '#track returns self');
	equal(timeline.duration, 5, 'Duration updated');
	equal(anim1.playing, false, 'anim1 stopped after entering timeline');
	
	// once an animation is owned by a timeline, certain methods can no longer
	// be used. Test that they now throw errors
	var illegalMethods = ['start', 'stop', 'destroy', 'reverse', 'pingPong'],
		i = illegalMethods.length,
		errorsThrown = 0;
	
	while (i--) {
		try {
			anim1[ illegalMethods[i] ]();
		}
		catch(e) { errorsThrown++; }
		try {
			anim2[ illegalMethods[i] ]();
		}
		catch(e) { errorsThrown++; }
	}
	
	equal(illegalMethods.length * 2, errorsThrown, 'Prevented methods now throw errors');
});

test('event sequence - Adding animations to a timeline', 17, function() {
	stop(5000);
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.5),
		timeline = glow.anim.Timeline().track(anim1, anim2),
		returnVal,
		animEventLog = [],
		timelineEventLog = [],
		anim1PositionLog = [],
		anim2PositionLog = [],
		timelinePositionLog = [],
		anim1Start,
		anim1Duration,
		anim2Start,
		anim2Duration;
	
	equal(timeline.duration, 0.75, 'Duration updated');
	
	anim1.on('start', function() {
		animEventLog.push('anim1: start');
		anim1Start = new Date;
	}).on('frame', function() {
		if (animEventLog.slice(-1)[0] !== 'anim1: frame') {
			animEventLog.push('anim1: frame');
		}
	}).on('stop', function() {
		// shouldn't fire
		animEventLog.push('anim1: stop');
	}).on('complete', function() {
		animEventLog.push('anim1: complete');
		anim1Duration = new Date - anim1Start;
	});
	
	anim2.on('start', function() {
		animEventLog.push('anim2: start');
		anim2Start = new Date;
	}).on('frame', function() {
		if (animEventLog.slice(-1)[0] !== 'anim2: frame') {
			animEventLog.push('anim2: frame');
		}
	}).on('stop', function() {
		// shouldn't fire
		animEventLog.push('anim2: stop');
	}).on('complete', function() {
		animEventLog.push('anim2: complete');
		anim2Duration = new Date - anim2Start;
	});
	
	timeline.on('start', function() {
		timelineEventLog.push('start');
	}).on('frame', function() {
		if (timelineEventLog.slice(-1)[0] !== 'frame') {
			strictEqual(this.playing, true, 'timeline playing is true');
			timelineEventLog.push('frame');
		}
		anim1PositionLog.push( anim1.position );
		anim2PositionLog.push( anim2.position );
		timelinePositionLog.push( this.position );
	}).on('stop', function() {
		// shouldn't fire
		timelineEventLog.push('stop');
	}).on('complete', function() {
		timelineEventLog.push('complete');
		
		equal(anim1PositionLog[0], 0, 'anim1 start pos');
		equal(anim1PositionLog.slice(-1)[0], 0.25, 'anim1 end pos');
		equal(Math.max.apply(null, anim1PositionLog), 0.25, 'anim1 positions look right');
		ok(anim1Duration >= 250 && anim1Duration < 500, 'anim1 duration looks right: ' + anim1Duration);
		
		equal(anim2PositionLog[0], 0, 'anim2 start pos');
		equal(anim2PositionLog.slice(-1)[0], 0.5, 'anim2 end pos');
		equal(Math.max.apply(null, anim2PositionLog), 0.5, 'anim2 positions look right');
		// this animation may take less than 500 as frames are dropped
		ok(anim2Duration >= 490, 'anim2 duration looks right: ' + anim2Duration);
		
		equal(timelinePositionLog[0], 0, 'timeline start pos');
		equal(timelinePositionLog.slice(-1)[0], 0.75, 'timeline end pos');
		equal(Math.max.apply(null, timelinePositionLog), 0.75, 'timeline positions look right');
		
		same(animEventLog, [
			'anim1: start',
			'anim1: frame',
			'anim1: complete',
			'anim2: start',
			'anim2: frame',
			'anim2: complete'
		], 'anim events');
		
		same(timelineEventLog, [
			'start',
			'frame',
			'complete'
		], 'timeline events');
		
		start();
	});
	
	equal(typeof timeline.start, 'function', '#start correct type');
	returnVal = timeline.start();
	equal(returnVal, timeline, '#start returns self');
});

test('multiple tracks - Adding animations to a timeline', 9, function() {
	stop(5000);
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.5),
		anim1PositionLog = [],
		anim2PositionLog = [],
		anim1Playing = true,
		timeline = glow.anim.Timeline().track(anim1).track(anim2);
		
	equal(timeline.duration, 0.5, 'Duration updated');
	
	timeline.on('frame', function() {
		if (anim1Playing) {
			anim1PositionLog.push( anim1.position );
		}
		anim2PositionLog.push( anim2.position );
		anim1Playing = anim1.playing;
	}).on('complete', function() {
		equal(anim1PositionLog[0], 0, 'anim1 start pos');
		equal(anim1PositionLog.slice(-1)[0], 0.25, 'anim1 end pos');
		equal(Math.max.apply(null, anim1PositionLog), 0.25, 'anim1 positions look right');
		
		equal(anim2PositionLog[0], 0, 'anim1 start pos');
		equal(anim2PositionLog.slice(-1)[0], 0.5, 'anim2 end pos');
		equal(Math.max.apply(null, anim2PositionLog), 0.5, 'anim2 positions look right');
		
		ok(anim1PositionLog.length < anim2PositionLog.length, 'anim2 went on longer than anim1');
		
		// did the animation positions stay in sync (until anim1 stopped)?
		// The last frame of anim1PositionLog may have been called out of sync, this
		// is just to ensure the final frame is always played
		same(anim1PositionLog.slice(0, -1), anim2PositionLog.slice(0, anim1PositionLog.length - 1), 'Animations synced')
		
		start();
	});
	
	timeline.start();
});

test('Adding numbers and functions to timeline', 3, function() {
	stop();
	
	var anim1 = glow.anim.Anim(0.5),
		timeline,
		startTime,
		anim1PositionLog = [],
		anim1Started = false;
	
	function callback() {
		var callbackStartTime = new Date;
		ok( callbackStartTime - startTime >= 250, 'Number treated as pause: ' + (callbackStartTime - startTime) );
		equal(anim1Started, false, 'Callback called before anim');
		// block for 0.25 sec
		while (new Date - start < 250);
	}
	
	anim1.on('start', function() {
		anim1Started = true;
	}).on('frame', function() {
		anim1PositionLog.push( this.position );
	});
	
	timeline = glow.anim.Timeline().track(0.25, callback, anim1).on('complete', function() {
		ok(anim1PositionLog[0] >= 0.25, 'anim1 starts 0.25 in: ' + anim1PositionLog[0]);
		start();
	});
	
	startTime = new Date;
	timeline.start();
});

test('stopping & resuming', 3, function() {
	stop();
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.25),
		stoppedAndResumed = false,
		anim1Log = [],
		anim2Log = [],
		timelineLog = [],
		timeline;
	
	anim1.on('start', function() {
		anim1Log.push('start');
	}).on('stop', function() {
		anim1Log.push('stop');
	}).on('frame', function() {
		if (anim1Log.slice(-1)[0] !== 'frame') {
			anim1Log.push('frame');
		}
		if (this.position > 0.125 && !stoppedAndResumed) {
			timeline.stop();
			setTimeout(function() {
				anim1Log.push('timeout');
				timeline.start();
			}, 250);
			
			stoppedAndResumed = true;
		}
	}).on('complete', function() {
		anim1Log.push('complete');
	});
	
	anim2.on('start', function() {
		anim2Log.push('start');
	}).on('stop', function() {
		anim2Log.push('stop');
	}).on('frame', function() {
		if (anim2Log.slice(-1)[0] !== 'frame') {
			anim2Log.push('frame');
		}
	}).on('complete', function() {
		anim2Log.push('complete');
	});
	
	timeline = glow.anim.Timeline().track(anim1, anim2).on('start', function() {
		timelineLog.push('start');
	}).on('stop', function() {
		timelineLog.push('stop');
	}).on('frame', function() {
		if (timelineLog.slice(-1)[0] !== 'frame') {
			timelineLog.push('frame');
		}
	}).on('complete', function() {
		timelineLog.push('complete');
		
		same(anim1Log, [
			'start',
			'frame',
			'stop',
			'timeout',
			'start',
			'frame',
			'complete'
		]);
		
		same(anim2Log, [
			'start',
			'frame',
			'complete'
		]);
		
		same(timelineLog, [
			'start',
			'frame',
			'stop',
			'start',
			'frame',
			'complete'
		]);
		
		start();
	});

	timeline.start();
});

test('Timelines in timelines', 4, function() {
	stop();
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.25),
		anim3 = glow.anim.Anim(0.25),
		anim1Complete,
		anim2Complete,
		anim3Complete,
		timeline1 = glow.anim.Timeline().track(anim2, anim3),
		timeline1Complete,
		timeline2 = glow.anim.Timeline().track(anim1, timeline1);
		
	anim1.on('complete', function() {
		anim1Complete = true;
	});
	anim2.on('complete', function() {
		anim2Complete = true;
	});
	anim3.on('complete', function() {
		anim3Complete = true;
	});
	timeline1.on('complete', function() {
		timeline1Complete = true;
	});
		
	timeline2.on('complete', function() {
		ok(anim1Complete, 'anim1 completed');
		ok(anim2Complete, 'anim2 completed');
		ok(anim3Complete, 'anim3 completed');
		ok(timeline1Complete, 'timeline1 completed');
		start();
	})
	
	timeline2.start();
});

test('Event cancelling', 1, function() {
	stop(2000);
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.25),
		timeline1 = glow.anim.Timeline().track(anim1, anim2),
		cancelStart = true,
		stopped = false,
		eventLog = [];
		
	timeline1.on('start', function() {
		eventLog.push('start');
		// cancel the start event once
		var r = !cancelStart;
		if (cancelStart) {
			cancelStart = false;
			// call start again in a bit
			setTimeout(function() {
				eventLog.push('timeout');
				timeline1.start();
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
		anim = glow.anim.Anim(0.5),
		anim = glow.anim.Timeline().track(anim).on('start', function() {
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

test('Looping', 2, function() {
	stop(5000);
	
	var loopCount = 2,
		firstFrame = true,
		lastPos = 0.5,
		correctPositions = true,
		eventLog = [],
		anim = glow.anim.Anim(0.5),
		timeline = glow.anim.Timeline({loop:true}).track(anim).on('start', function() {
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

// looping
// goto (before & after current position)
// destroying