module('glow.anim.Anim#prop');

test('target setting', 5, function() {
	var anim = glow.anim.Anim(1),
		returnVal,
		obj = {},
		obj2 = {};
	
	same(anim._targets, [], '#_targets initial value');
	equal(typeof anim.target, 'function', '#target is function');
	
	returnVal = anim.target(obj);
	
	strictEqual(returnVal, anim, '#target returns self');
	same(anim._targets, [obj], '#_targets set correctly');
	
	anim.target(obj2);
	
	same(anim._targets, [obj, obj2], '#_targets set correctly');
});

test('Single val prop anim (no template)', 5, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		returnVal,
		testPropLog = [],
		obj = {};
	
	equal(typeof anim.prop, 'function', '#prop is function');
	
	returnVal = anim.target(obj).prop('testProp', {
		from: 50,
		to: 100
	});
	
	strictEqual(returnVal, anim, '#prop returns self');
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {
		equal(testPropLog[0], 50, 'first value correct');
		equal(testPropLog.slice(-1)[0], 100, 'last value correct');
		ok(Math.min.apply(null, testPropLog) >= 50 && Math.max.apply(null, testPropLog) <= 100, 'values in range')
		start();
	});
	
	anim.start();
});

test('Single val prop anim with no from', 2, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		testPropLog = [],
		obj = {testProp: 110};
	
	anim.target(obj).prop('testProp', {
		to: 100
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {
		equal(testPropLog[0], 110, 'first value correct');
		equal(testPropLog.slice(-1)[0], 100, 'last value correct');
		start();
	});
	
	anim.start();
});

test('Single val anim 2 targets', 6, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		obj1TestPropLog = [],
		obj2TestPropLog = [],
		obj1 = {},
		obj2 = {};
	
	anim.target(obj1).prop('testProp', {
		from: 50,
		to: 100
	}).target(obj2).prop('testProp2', {
		from: 100,
		to: -100
	});
	
	anim.on('frame', function() {
		obj1TestPropLog.push( obj1.testProp );
		obj2TestPropLog.push( obj2.testProp2 );
	}).on('complete', function() {
		equal(obj1TestPropLog[0], 50, 'obj1 first value correct');
		equal(obj1TestPropLog.slice(-1)[0], 100, 'obj1 last value correct');
		ok(Math.min.apply(null, obj1TestPropLog) >= 50 && Math.max.apply(null, obj1TestPropLog) <= 100, 'values in range')
		
		equal(obj2TestPropLog[0], 100, 'obj2 first value correct');
		equal(obj2TestPropLog.slice(-1)[0], -100, 'obj2 last value correct');
		ok(Math.min.apply(null, obj2TestPropLog) >= -100 && Math.max.apply(null, obj2TestPropLog) <= 100, 'values in range')
		
		start();
	});
	
	anim.start();
});

test('Single val prop anim (no template) range & round=true', 3, function() {
	stop();
	
	// elasticOut will try and go below zero
	var anim = glow.anim.Anim(0.5, {tween:'elasticOut'}),
		testPropLog = [],
		obj = {};
	
	anim.target(obj).prop('testProp', {
		from: 50,
		to: 0,
		round: true,
		min: 0,
		max: 40
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {
		ok(testPropLog.join('').indexOf('.') === -1, 'No fractional values');
		equal(Math.min.apply(null, testPropLog), 0, 'Lowest value');
		equal(Math.max.apply(null, testPropLog), 40, 'Highest value');
		start();
	});
	
	anim.start();
});

test('Single val with template', 3, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		testPropLog = [],
		obj = {};
	
	anim.target(obj).prop('testProp', {
		template: '?px',
		from: 10,
		to: 25
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {
		var allValuesHavePx = true,
			i = testPropLog.length;
		
		equal(testPropLog[0], '10px', 'first value correct');
		equal(testPropLog.slice(-1)[0], '25px', 'last value correct');
		
		while (i--) {
			if ( !(typeof testPropLog[i] === 'string' && testPropLog[i].slice(-2) === 'px') ) {
				allValuesHavePx = false;
				break;
			}
		}
		
		ok(allValuesHavePx, 'All values have px');
		start();
	});
	
	anim.start();
});

test('Multiple ?, single value & escaping ?', 2, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		testPropLog = [],
		obj = {};
	
	anim.target(obj).prop('testProp', {
		template: '?:?\\?',
		from: 10,
		to: 25
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {
		var allValuesHavePx = true,
			i = testPropLog.length;
		
		equal(testPropLog[0], '10:10?', 'first value correct');
		equal(testPropLog.slice(-1)[0], '25:25?', 'last value correct');
		
		start();
	});
	
	anim.start();
});

test('Multiple ?, multiple values', 2, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		testPropLog = [],
		obj = {};
	
	anim.target(obj).prop('testProp', {
		template: '?px ?px',
		from: [0, 80],
		to: [10, 100]
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {	
		equal(testPropLog[0], '0px 80px', 'first value correct');
		equal(testPropLog.slice(-1)[0], '10px 100px', 'last value correct');
		
		start();
	});
	
	anim.start();
});

test('Multiple ?, range & round', 3, function() {
	stop();
	
	// elasticOut will try and go below zero
	var anim = glow.anim.Anim(0.5, {tween:'elasticOut'}),
		testPropLog = [],
		testPropLogStr,
		obj = {};
	
	anim.target(obj).prop('testProp', {
		template: '?allowNeg ?disallowNeg',
		from: 100,
		to: 0,
		round: true,
		min: [undefined, 0]
	});
	
	anim.on('frame', function() {
		testPropLog.push(obj.testProp);
	}).on('complete', function() {
		testPropLogStr = testPropLog.join('');
		
		// look for negative values for 'disallowNeg'
		ok(/\-[\d\.]+allowNeg/.test(testPropLogStr), 'First value has negatives');
		ok(!/\-[\d\.]+disallowNeg/.test(testPropLogStr), 'Second value has no negatives');
		// look for fractional values
		ok(testPropLogStr.indexOf('.') === -1, 'Values are rounded');
		
		start();
	});
	
	anim.start();
});

test('Multiple ?, multiple values, no from vals', 2, function() {
	stop();
	
	var anim = glow.anim.Anim(0.5),
		testPropLog = [],
		obj = {testProp:'[hello .5px 80px 0.5px -20.54px world]'};
	
	anim.target(obj).prop('testProp', {
		template: '[hello ?px ?px ?px ?px world]',
		to: [10, 100, 78, 42]
	});
	
	anim.on('frame', function() {
		testPropLog.push( obj.testProp );
	}).on('complete', function() {	
		equal(testPropLog[0], '[hello 0.5px 80px 0.5px -20.54px world]', 'first value correct');
		equal(testPropLog.slice(-1)[0], '[hello 10px 100px 78px 42px world]', 'last value correct');
		
		start();
	});
	
	anim.start();
});