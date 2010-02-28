// First param is the library name, as defined in woosh.libs
woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.MyObj = function() {};
			MyObj.prototype = new glow.events.Target;
		}
		
		switch (nextTest) {
			case 'Firing Custom Listeners':
				window.testObj = new MyObj();
				window.eventsFired = 0;
				
				testObj.on('testEvent', function() {
					eventsFired++
				});
				testObj.on('testEvent', function() {
					eventsFired++
				});
				testObj.on('testEvent', function() {
					eventsFired++
				});
				break;
		}
	},
	'Adding Custom Listeners': new woosh.TimeTest(1, function() {
		var obj = new MyObj();
		obj.on('testEvent', function() {});
		obj.on('testEvent', function() {});
		obj.on('testEvent', function() {});
	}),
	'Firing Custom Listeners': new woosh.TimeTest(1, function() {
		testObj.fire('testEvent');
	}),
	'Removing Custom Listeners': new woosh.TimeTest(1, function() {
		var obj = new MyObj();
		function testListener() {}
		obj.on('test', testListener);
		obj.detach('test', testListener);	
		
		obj.on('test', testListener);
		obj.detach('test', testListener);	
	
		obj.on('test', testListener);
		obj.detach('test', testListener);
	})
});