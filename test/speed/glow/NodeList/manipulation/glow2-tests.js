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
	'after': new woosh.TimeTest(1, function() {
		paragraphs.after('<p>hello</p>');
		if (++testCount == 20) {
			return new glow.NodeList('p').length;
		}
	}),
	'before': new woosh.TimeTest(1, function() {
		paragraphs.before('<p>hello</p>');
		if (++testCount == 20) {
			return new glow.NodeList('p').length;
		}
	}),
	'append': new woosh.TimeTest(1, function() {
		paragraphs.append('<span>hello</span>');
		if (++testCount == 20) {
			return new glow.NodeList('span').length;
		}
	}),
	'prepend': new woosh.TimeTest(1, function() {
		paragraphs.prepend('<span>hello</span>');
		if (++testCount == 20) {
			return new glow.NodeList('span').length;
		}
	}),
	'appendTo': new woosh.TimeTest(1, function() {
		paragraphs.appendTo(testBin);
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
	}),
	'prependTo': new woosh.TimeTest(1, function() {
		paragraphs.prependTo(testBin);
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
	}),
	'insertAfter': new woosh.TimeTest(1, function() {
		paragraphs.insertAfter(testBin);
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
	}),
	'insertBefore': new woosh.TimeTest(1, function() {
		paragraphs.insertBefore(testBin);
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
	}),
	'destroy': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.destroy();
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = new glow.NodeList('p');
	}),
	'remove': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.remove();
		if (++testCount == 20) {
			return new glow.NodeList('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = new glow.NodeList('p');
	}),
	'empty': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.empty();
		if (++testCount == 20) {
			return new glow.NodeList('p').children().length;
		}
		testBin[0].innerHTML = html;
		paragraphs = new glow.NodeList('p');
	}),
	'replaceWith': new woosh.TimeTest(1, function() {
		paragraphs.replaceWith('<p>Hello!</p>');
		if (++testCount == 20) {
			return new glow.NodeList('p').length;
		}
		paragraphs = new glow.NodeList('p');
	}),
	'wrap': new woosh.TimeTest(1, function() {
		paragraphs.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 20) {
			return new glow.NodeList('div.wrapInner').length;
		}
	}),
	'wrap single': new woosh.TimeTest(1, function() {
		paragraph.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 200) {
			return new glow.NodeList('div.wrapInner').length;
		}
	}),
	'unwrap': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.unwrap();
		if (++testCount == 20) {
			return new glow.NodeList('div.wrappingToRemove').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = new glow.NodeList('p');
	}),
	'clone': new woosh.TimeTest(1, function() {
		paragraphs.clone();
		if (++testCount == 20) {
			return paragraphs.length;
		}
	}),
	'copy': new woosh.TimeTest(1, function() {
		paragraphs.copy();
		if (++testCount == 200) {
			return paragraphs.length;
		}
	}),
	'html getting': new woosh.TimeTest(1, function() {
		return paragraphs.html();
	}),
	'html setting': new woosh.TimeTest(1, function() {
		paragraphs.html('Hello!');
		if (++testCount == 100) {
			return paragraphs[0].innerHTML;
		}
	}),
	'text getting': new woosh.TimeTest(1, function() {
		return paragraph.text();
	}),
	'text setting': new woosh.TimeTest(1, function() {
		paragraphs.text('Hello!');
		if (++testCount == 100) {
			return paragraphs[0].innerHTML;
		}
	})
});