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
	'attr set one': new woosh.TimeTest(1, function(test) {
		paragraphs.attr('title', 'some title goes here');
		if (test.lastLoop) {
			return $('p').length;
		}
	}),
	'attr set many': new woosh.TimeTest(1, function(test) {
		paragraphs.attr({'title': 'some title goes here', 'class': 'some-class'});
		if (test.lastLoop) {
			return $('p').length;
		}
	}),
	'attr get': new woosh.TimeTest(1, function(test) {
		var title = paragraphs.attr('title');
		if (test.lastLoop) {
			return title || '';
		}
	}),
	'attr has': new woosh.TimeTest(1, function(test) {
		paragraphs.attr('zoop') !== undefined;
		if (test.lastLoop) {
			return paragraphs.attr('zoop') !== undefined;
		}
	}),
	'attr remove': new woosh.TimeTest(1, function(test) {
		paragraphs.removeAttr('title');
		if (test.lastLoop) {
			return paragraphs.attr('title') || '';
		}
	}),
	'attr add class': new woosh.TimeTest(1, function(test) {
		paragraphs.addClass('selected');
		if (test.lastLoop) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr has class': new woosh.TimeTest(1, function(test) {
		paragraphs.hasClass('selected');
		if (test.lastLoop) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr class remove': new woosh.TimeTest(1, function(test) {
		paragraphs.removeClass('selected');
		if (test.lastLoop) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr class toggle': new woosh.TimeTest(1, function(test) {
		paragraphs.toggleClass('selected');
		if (test.lastLoop) {
			return paragraphs.hasClass('selected');
		}
	}),
	'attr data': new woosh.TimeTest(1, function(test) {
		paragraphs.data('color', 'blue');
		if (test.lastLoop) {
			return paragraphs.data('color');
		}
	}),
	'attr remove data': new woosh.TimeTest(1, function(test) {
		paragraphs.removeData('color');
		if (test.lastLoop) {
			return paragraphs.data('color');
		}
	})
});