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

test('Adding animations to a timeline', 4, function() {
	var anim1 = glow.anim.Anim(3),
		anim2 = glow.anim.Anim(2),
		timeline = glow.anim.Timeline(),
		returnVal;
		
	equal(typeof timeline.track, 'function', '#track correct type');
	
	returnVal = timeline.track(anim1, anim2);
	
	equal(returnVal, timeline, '#track returns self');
	equal(timeline.duration, 5, 'Duration updated');
	
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

test('event sequence - Adding animations to a timeline', 13, function() {
	stop(5000);
	
	var anim1 = glow.anim.Anim(0.25),
		anim2 = glow.anim.Anim(0.5),
		timeline = glow.anim.Timeline().track(anim1, anim2),
		returnVal,
		animEventLog = [],
		timelineEventLog = [],
		anim1PositionLog = [],
		anim2PositionLog = [],
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
			timelineEventLog.push('frame');
		}
		anim1PositionLog.push( anim1.position );
		anim2PositionLog.push( anim2.position );
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
		ok(anim2Duration >= 500, 'anim2 duration looks right: ' + anim2Duration);
		
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

// timeline properties: position, playing (more?)
// anim properties: playing
// are animations added to timelines stopped?
// adding functions & numbers to a timeline
// stopping and resuming
// adding timelines to a timeline
// Do functions in a timeline sync?
// event cancelling
// looping
// goto (before & after current position)