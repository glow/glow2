woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		window.paragraphs = new glow.NodeList('p');
		window.paragraph = paragraphs.item(0);
		window.testBin = new glow.NodeList('#testBin');
		window.testCount = 0;
		switch (nextTest) {
			case 'destroy':
			case 'remove':
			case 'empty':
				paragraphs.appendTo(testBin);
				break;
			case 'unwrap':
				paragraphs.appendTo(testBin).wrap('<div class="wrappingToRemove"></div>');
				break;
		}
	},
	'attr set one': woosh.Test(200, function() {
		paragraphs.attr('title', 'some title goes here');
		if (++testCount == 200) {
			return new glow.NodeList('p').length;
		}
	}),
	'attr set many': woosh.Test(200, function() {
		paragraphs.attr({'title': 'some title goes here', 'class': 'some-class'});
		if (++testCount == 200) {
			return new glow.NodeList('p').length;
		}
	}),
	'attr get': woosh.Test(1000, function() {
		var title = paragraphs.attr('title');
		if (++testCount == 1000) {
			return title;
		}
	})
});