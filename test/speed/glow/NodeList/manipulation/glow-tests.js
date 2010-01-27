woosh.addTests('glow-170', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
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
	'after': new woosh.TimeTest(1, function() {
		paragraphs.after('<p>hello</p>');
		if (++testCount == 20) {
			return glow.dom.get('p').length;
		}
	}),
	'before': new woosh.TimeTest(1, function() {
		paragraphs.before('<p>hello</p>');
		if (++testCount == 20) {
			return glow.dom.get('p').length;
		}
	}),
	'append': new woosh.TimeTest(1, function() {
		paragraphs.append('<span>hello</span>');
		if (++testCount == 20) {
			return glow.dom.get('span').length;
		}
	}),
	'prepend': new woosh.TimeTest(1, function() {
		paragraphs.prepend('<span>hello</span>');
		if (++testCount == 20) {
			return glow.dom.get('span').length;
		}
	}),
	'appendTo': new woosh.TimeTest(1, function() {
		paragraphs.appendTo(testBin);
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'prependTo': new woosh.TimeTest(1, function() {
		paragraphs.prependTo(testBin);
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'insertAfter': new woosh.TimeTest(1, function() {
		paragraphs.insertAfter(testBin);
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'insertBefore': new woosh.TimeTest(1, function() {
		paragraphs.insertBefore(testBin);
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'destroy': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.destroy();
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'remove': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.remove();
		if (++testCount == 20) {
			return glow.dom.get('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'empty': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.empty();
		if (++testCount == 20) {
			return glow.dom.get('p').children().length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'replaceWith': new woosh.TimeTest(1, function() {
		paragraphs.replaceWith('<p>Hello!</p>');
		if (++testCount == 20) {
			return glow.dom.get('p').length;
		}
		paragraphs = glow.dom.get('p');
	}),
	'wrap': new woosh.TimeTest(1, function() {
		paragraphs.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 20) {
			return glow.dom.get('div.wrapInner').length;
		}
	}),
	'wrap single': new woosh.TimeTest(1, function() {
		paragraph.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 200) {
			return glow.dom.get('div.wrapInner').length;
		}
	}),
	'unwrap': new woosh.TimeTest(1, function() {
		var html = testBin[0].innerHTML;
		paragraphs.unwrap();
		if (++testCount == 20) {
			return glow.dom.get('div.wrappingToRemove').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'clone': new woosh.TimeTest(1, function() {
		paragraphs.clone(true);
		if (++testCount == 20) {
			return paragraphs.length;
		}
	}),
	'copy': new woosh.TimeTest(1, function() {
		paragraphs.clone(false);
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