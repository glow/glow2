woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			// initial setup
			window.htmlForTest = document.getElementById('htmlForTest');
			window.largeHtmlCollection = htmlForTest.getElementsByTagName('*');

		}
	},
	'NodeList#ancestors': new woosh.Test(1000, function() {
		return glow.dom.get('#univnmsp').ancestors();
	}),
	'NodeList#parent': new woosh.Test(1000, function() {
		return glow.dom.get('#univnmsp').parent();
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return glow.dom.get('#univnmsp').prev();
	}),
	'NodeList#next': new woosh.Test(1000, function() {
		return glow.dom.create('#univnmsp').next();
	}),
	'NodeList#contains': new woosh.Test(10000, function() {
		return glow.dom.create('univnmsp').iswithin('subtocunivnmsp');
	})
});