woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			// initial setup
			window.htmlForTest = document.getElementById('htmlForTest');
			window.largeHtmlCollection = htmlForTest.getElementsByTagName('*');

		}
	},
	'NodeList#ancestors': new woosh.TimeTest(1, function() {
		return glow.dom.get('.tocline3').ancestors().length;
	}),
	'NodeList#parent': new woosh.TimeTest(1, function() {
		return glow.dom.get('.tocline3').parent().length;
	}),
	'NodeList#get': new woosh.TimeTest(1, function() {
		return new glow.dom.get('.toc').get('li').length;
	}),
	'NodeList#prev': new woosh.TimeTest(1, function() {
		return glow.dom.get('.tocline3').prev().length;
	}),
	'NodeList#next': new woosh.TimeTest(1, function() {
		return glow.dom.get('.tocline3').next().length;
	}),
	'NodeList#contains': new woosh.TimeTest(1, function() {
		var set = glow.dom.get('.subtoc');
		return glow.dom.get('.toc').isWithin(set);
	}),
	'NodeList#children': new woosh.TimeTest(1, function() {
		return glow.dom.get('.toc').children().length;
	})
});