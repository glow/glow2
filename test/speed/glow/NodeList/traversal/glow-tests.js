woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			// initial setup
			window.htmlForTest = document.getElementById('htmlForTest');
			window.largeHtmlCollection = htmlForTest.getElementsByTagName('*');

		}
	},
	'NodeList#ancestors': new woosh.Test(10000, function() {
		return glow.dom.get('.tocline3').ancestors().length;
	}),
	'NodeList#parent': new woosh.Test(10000, function() {
		return glow.dom.get('.tocline3').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return new glow.dom.get('.toc').get('li').length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return glow.dom.get('.tocline3').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return glow.dom.get('.tocline3').next().length;
	}),
	'NodeList#contains': new woosh.Test(10000, function() {
		var set = glow.dom.get('.subtoc');
		return glow.dom.get('.toc').isWithin(set);
	})
});