woosh.addTests('jq-142', {
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
	'attr set one': new woosh.TimeTest(1, function() {
		paragraphs.attr('title', 'some title goes here');
		if (++testCount == 200) {
			return $('p').length;
		}
	}),
	'attr set many': new woosh.TimeTest(1, function() {
		paragraphs.attr({'title': 'some title goes here', 'class': 'some-class'});
		if (++testCount == 100) {
			return $('p').length;
		}
	}),
	'attr get': new woosh.TimeTest(1, function() {
		var title = paragraphs.attr('title');
		if (++testCount == 1200) {
			return title || '';
		}
	}),
	'attr has': new woosh.TimeTest(1, function() {
		paragraphs.attr('zoop') !== undefined;
		if (++testCount == 1000) {
			return paragraphs.attr('zoop') !== undefined;
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
	})
});