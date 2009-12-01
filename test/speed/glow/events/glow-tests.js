// First param is the library name, as defined in woosh.libs
woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.testObj = {};
			window.eventsFired = 0;
		}
	},
	'Adding Custom Listeners': new woosh.Test(100000, function() {
		glow.events.addListener(testObj, 'testEvent', function() {
			eventsFired++;
		});
	}),
	'Firing Custom Listeners': new woosh.Test(1, function() {
		glow.events.fire(testObj, 'testEvent');
		return eventsFired;
	}),
	'Removing Custom Listeners': new woosh.Test(1, function() {
		glow.events.removeListener(testObj, "testEvent");
		return;
	})
});