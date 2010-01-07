woosh.addTests('jq-132', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		window.paragraphs = $('p');
		window.paragraph = paragraphs.eq(0);
		window.testBin = $('#testBin');
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
			return $('p').length;
		}
	}),
	'attr set many': woosh.Test(200, function() {
		paragraphs.attr({'title': 'some title goes here', 'class': 'some-class'});
		if (++testCount == 200) {
			return $('p').length;
		}
	}),
	'attr get': woosh.Test(1000, function() {
		var title = paragraphs.attr('title');
		if (++testCount == 1000) {
			return title;
		}
	})
});