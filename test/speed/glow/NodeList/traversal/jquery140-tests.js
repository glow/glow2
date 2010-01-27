woosh.addTests('jq-140', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			
		}
	},
	'NodeList#ancestors': new woosh.TimeTest(1, function() {
		return $('.tocline3').parents().length;
	}),
	'NodeList#parent': new woosh.TimeTest(1, function() {
		return $('.tocline3').parent().length;
	}),
	'NodeList#get': new woosh.TimeTest(1, function() {
		return $('.toc').find('li').length;
	}),
	'NodeList#prev': new woosh.TimeTest(1, function() {
		return $('.tocline3').prev().length;
	}),
	'NodeList#next': new woosh.TimeTest(1, function() {
		return $('.tocline3').next().length;
	}),
	'NodeList#children': new woosh.TimeTest(1, function() {
		return $('.toc').children().length;
	})
});