woosh.addTests('jq-132', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			
		}
	},
	'NodeList#ancestors': new woosh.Test(10000, function() {
		return $('#univnmsp').parents().length;
	}),
	'NodeList#parent': new woosh.Test(10000, function() {
		return $('#univnmsp').parent().length;
	}),
	'NodeList#get': new woosh.Test(10000, function() {
		return $('#univnmsp').get().length;
	}),
	'NodeList#prev': new woosh.Test(10000, function() {
		return $('#univnmsp').prev().length;
	}),
	'NodeList#next': new woosh.Test(10000, function() {
		return $('#univnmsp').next().length;
	})
});