woosh.addTests('fakeLib1', {
	'blockingFunc': function() {
		return fakeLib1.blockingFunc();
	},
	'asyncFunc': new woosh.AsyncTest(1, function(test) {
		fakeLib1.asyncFunc(function(val) {
			test.endTest(val);
		})
	}),
	'customResultTest': new woosh.Test(100, function(test) {
		test.result(123, 'fps', true);
		return 'fakeLib1 customResultTest';
	}),
	'onlyInFakeLib1': function() {
		return 'fakeLib1 onlyInFakeLib1';
	}
});