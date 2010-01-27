// First param is the library name, as defined in woosh.libs
woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		switch (nextTest) {
			case 'Firing Custom Listeners':
				window.testObj = {};
				window.eventsFired = 0
				glow.events.addListener(testObj, 'testEvent', function() {
					eventsFired++
				});
				glow.events.addListener(testObj, 'testEvent', function() {
					eventsFired++
				});
				glow.events.addListener(testObj, 'testEvent', function() {
					eventsFired++
				});
				break;
		}
	},
	'Adding Custom Listeners': new woosh.TimeTest(1, function() {
		var obj = {};
		glow.events.addListener(obj, 'testEvent', function() {});
		glow.events.addListener(obj, 'testEvent', function() {});
		glow.events.addListener(obj, 'testEvent', function() {});
	}),
	'Firing Custom Listeners': new woosh.TimeTest(1, function() {
		glow.events.fire(testObj, 'testEvent');
	}),
	'Removing Custom Listeners': new woosh.TimeTest(1, function() {
		var obj = {};
		function testListener() {}
		var listener = glow.events.addListener(obj, 'test', testListener);
		glow.events.removeListener(listener);	
		
		var listener = glow.events.addListener(obj, 'test', testListener);
		glow.events.removeListener(listener);
		
		var listener = glow.events.addListener(obj, 'test', testListener);
		glow.events.removeListener(listener);	
	})
});