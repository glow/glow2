// First param is the library name, as defined in woosh.libs
woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.testObj = new glow.events.Target();
			window.eventsFired = 0;
		}
	},
	'Adding Custom Listeners': new woosh.Test(100000, function() {
		testObj.on('testEvent', function() {
			eventsFired++;
		});
	}),
	'Firing Custom Listeners': new woosh.Test(1, function() {
		testObj.fire('testEvent');
		return eventsFired;
	}),
	'Removing Custom Listeners': new woosh.Test(1, function() {
		testObj.detach(testObj, 'testEvent');
		return;
	})
});