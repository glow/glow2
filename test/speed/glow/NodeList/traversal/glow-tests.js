woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			// initial setup
			window.htmlForTest = document.getElementById('htmlForTest');
			window.largeHtmlCollection = htmlForTest.getElementsByTagName('*');

		}
	},
	'NodeList#ancestors': new woosh.Test(1000, function() {
		return glow.dom.get('#univnmsp').ancestors().length;
	}),
	'NodeList#parent': new woosh.Test(1000, function() {
		return glow.dom.get('#univnmsp').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return new glow.dom.get('#univnmsp').get().length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return glow.dom.get('#univnmsp').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return glow.dom.get('#univnmsp').next().length;
	}),
	'NodeList#contains': new woosh.Test(10000, function() {
		return glow.dom.get('#univnmsp').isWithin('subtocunivnmsp');
	})
});