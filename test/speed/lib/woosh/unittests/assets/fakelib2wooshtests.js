woosh.addTests('fakeLib2', {
	'blockingFunc': function() {
		return fakeLib2.blockingFunc();
	},
	'asyncFunc': new woosh.AsyncTest(1, function(test) {		
		fakeLib2.asyncFunc(function(val) {
			test.endTest(val);
		})
	}),
	'customResultTest': new woosh.Test(100, function(test) {
		test.result(456, 'fps', true);
		return 'fakeLib2 customResultTest';
	}),
	'onlyInFakelib2': function() {
		return 'bye';
	}
});