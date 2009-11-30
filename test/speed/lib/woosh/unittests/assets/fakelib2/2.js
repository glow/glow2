fakeLib2.file2Loaded = true;
fakeLib2.blockingFunc = function() {
	var start = new Date;
	while (new Date - start < 500);
	return 'fakeLib2.blockingFunc';
};
fakeLib2.asyncFunc = function(onComplete) {
	setTimeout(function() {
		onComplete('fakeLib2.asyncFunc');
	}, 500);
};