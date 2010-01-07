woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			
		}
	},
	'NodeList#ancestors': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').ancestors().length;
	}),
	'NodeList#parent': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return new glow.NodeList('#htmlForTest').get().length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return new glow.NodeList('#univnmsp').next().length;
	}),
	'NodeList#contains': new woosh.Test(10000, function() {
		return new glow.NodeList('subtocunivnmsp').contains('univnmsp');
	})
});