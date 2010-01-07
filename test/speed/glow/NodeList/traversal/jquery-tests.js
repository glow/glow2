woosh.addTests('jq-132', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			
		}
	},
	'NodeList#ancestors': new woosh.Test(10000, function() {
		return $('.tocline3').parents().length;
	}),
	'NodeList#parent': new woosh.Test(10000, function() {
		return $('.tocline3').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return $('.toc').find('li').length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return $('.tocline3').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return $('.tocline3').next().length;
	})
});