fakeLib1.file2Loaded = true;
fakeLib1.blockingFunc = function() {
	var start = new Date;
	while (new Date - start < 500);
	return 'fakeLib1.blockingFunc';
};
fakeLib1.asyncFunc = function(onComplete) {
	setTimeout(function() {
		onComplete('fakeLib1.asyncFunc');
	}, 500);
};