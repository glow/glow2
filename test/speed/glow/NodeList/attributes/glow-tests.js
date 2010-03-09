woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		form = glow.dom.get('form');
		window.paragraphs = glow.dom.get('p');
		window.paragraph = paragraphs.slice(0,1);
		window.testBin = glow.dom.get('#testBin');
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
	'attr set one': new woosh.TimeTest(1, function() {
		paragraphs.attr('title', 'some title goes here');
		if (++testCount == 200) {
			return glow.dom.get('p').length;
		}
	}),
	'attr set many': new woosh.TimeTest(1, function() {
		paragraphs.attr({'title': 'some title goes here', 'class': 'some-class'});
		if (++testCount == 100) {
			return glow.dom.get('p').length;
		}
	}),
	'attr get': new woosh.TimeTest(1, function() {
		var title = paragraphs.attr('title');
		if (++testCount == 1200) {
			return title || '';
		}
	}),
	'attr has': new woosh.TimeTest(1, function() {
		paragraphs.hasAttr('zoop');
		if (++testCount == 1000) {
			return paragraphs.hasAttr();
		}
	}),
	'attr remove': new woosh.TimeTest(1, function() {
		paragraphs.removeAttr('title');
		if (++testCount == 600) {
			return paragraphs.attr('title') || '';
		}
	}),
	'attr add class': new woosh.TimeTest(1, function() {
		paragraphs.addClass('selected');
		if (++testCount == 600) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr has class': new woosh.TimeTest(1, function() {
		paragraphs.hasClass('selected');
		if (++testCount == 600) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr class remove': new woosh.TimeTest(1, function() {
		paragraphs.removeClass('selected');
		if (++testCount == 600) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr class toggle': new woosh.TimeTest(1, function() {
		paragraphs.toggleClass('selected');
		if (++testCount == 100) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr data': new woosh.TimeTest(1, function() {
		paragraphs.data('color', 'blue');
		if (++testCount == 50) {
			return paragraphs.data('color');
		}
	}),
	'attr remove data': new woosh.TimeTest(1, function() {
		paragraphs.removeData('color');
		if (++testCount == 200) {
			return paragraphs.data('color');
		}
	}),
	'form val': new woosh.TimeTest(1, function() {
		form.val();
		if (++testCount == 200) {
			return form.nm1;
		}
	})
});