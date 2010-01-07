woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			
		}
	},
	'NodeList#ancestors': new woosh.Test(10000, function() {
		return new glow.NodeList('.tocline3').ancestors().length;
	}),
	'NodeList#parent': new woosh.Test(10000, function() {
		return new glow.NodeList('.tocline3').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return new glow.NodeList('toc').get('li').length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return new glow.NodeList('.tocline3').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return new glow.NodeList('.tocline3').next().length;
	}),
	'NodeList#contains': new woosh.Test(10000, function() {
		return new glow.NodeList('.subtoc').contains('.toc');
	})
	,
	'NodeList#children': new woosh.Test(10000, function() {
		return new glow.NodeList('.toc').children().length;
	})
});