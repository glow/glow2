woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			// initial setup
			window.htmlForTest = document.getElementById('htmlForTest');
			window.largeHtmlCollection = htmlForTest.getElementsByTagName('*');
		}
	},
	'NodeList#ancestors': new woosh.Test(1000, function() {
		return new glow.NodeList('#univnmsp').ancestors();
	}),
	'NodeList#parent': new woosh.Test(1000, function() {
		return new glow.NodeList('#univnmsp').parent();
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return new glow.NodeList('#htmlForTest').get();
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').prev();
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').next();
	}),
	'NodeList#contains': new woosh.Test(1000, function() {
		return new glow.NodeList('subtocunivnmsp').contains('univnmsp');
	})
});