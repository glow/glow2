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
	'after': new woosh.TimeTest(1, function(test) {
		paragraphs.after('<p>hello</p>');
		if (test.lastLoop) {
			return glow.dom.get('p').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraphs = glow.dom.get('p');
	}),
	'before': new woosh.TimeTest(1, function(test) {
		paragraphs.before('<p>hello</p>');
		if (test.lastLoop) {
			return glow.dom.get('p').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraphs = glow.dom.get('p');
	}),
	'append': new woosh.TimeTest(1, function(test) {
		paragraphs.append('<span>hello</span>');
		if (test.lastLoop) {
			return glow.dom.get('span').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraphs = glow.dom.get('p');
	}),
	'prepend': new woosh.TimeTest(1, function(test) {
		paragraphs.prepend('<span>hello</span>');
		if (test.lastLoop) {
			return glow.dom.get('span').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraphs = glow.dom.get('p');
	}),
	'appendTo': new woosh.TimeTest(1, function(test) {
		paragraphs.appendTo(testBin);
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'prependTo': new woosh.TimeTest(1, function(test) {
		paragraphs.prependTo(testBin);
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'insertAfter': new woosh.TimeTest(1, function(test) {
		paragraphs.insertAfter(testBin);
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'insertBefore': new woosh.TimeTest(1, function(test) {
		paragraphs.insertBefore(testBin);
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
	}),
	'destroy': new woosh.TimeTest(1, function(test) {
		var html = testBin[0].innerHTML;
		paragraphs.destroy();
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'remove': new woosh.TimeTest(1, function(test) {
		var html = testBin[0].innerHTML;
		paragraphs.remove();
		if (test.lastLoop) {
			return glow.dom.get('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'empty': new woosh.TimeTest(1, function(test) {
		var html = testBin[0].innerHTML;
		paragraphs.empty();
		if (test.lastLoop) {
			return glow.dom.get('p').children().length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'replaceWith': new woosh.TimeTest(1, function(test) {
		paragraphs.replaceWith('<p>Hello!</p>');
		if (test.lastLoop) {
			return glow.dom.get('p').length;
		}
		paragraphs = glow.dom.get('p');
	}),
	'wrap': new woosh.TimeTest(1, function(test) {
		paragraphs.wrap('<div><div class="wrapInner"></div></div>');
		if (test.lastLoop) {
			return glow.dom.get('div.wrapInner').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraphs = glow.dom.get('p');
	}),
	'wrap single': new woosh.TimeTest(1, function(test) {
		paragraph.wrap('<div><div class="wrapInner"></div></div>');
		if (test.lastLoop) {
			return glow.dom.get('div.wrapInner').length;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		paragraph = glow.dom.get('p').slice(0,1);
	}),
	'unwrap': new woosh.TimeTest(1, function(test) {
		var html = testBin[0].innerHTML;
		paragraphs.unwrap();
		if (test.lastLoop) {
			return glow.dom.get('div.wrappingToRemove').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = glow.dom.get('p');
	}),
	'clone': new woosh.TimeTest(1, function(test) {
		paragraphs.clone(true);
		if (test.lastLoop) {
			return paragraphs.length;
		}
	}),
	'copy': new woosh.TimeTest(1, function(test) {
		paragraphs.clone(false);
		if (test.lastLoop) {
			return paragraphs.length;
		}
	}),
	'html getting': new woosh.TimeTest(1, function(test) {
		return paragraphs.html();
	}),
	'html setting': new woosh.TimeTest(1, function(test) {
		paragraphs.html('Hello!');
		if (test.lastLoop) {
			return paragraphs[0].innerHTML;
		}
	}),
	'text getting': new woosh.TimeTest(1, function(test) {
		return paragraph.text();
	}),
	'text setting': new woosh.TimeTest(1, function(test) {
		paragraphs.text('Hello!');
		if (test.lastLoop) {
			return paragraphs[0].innerHTML;
		}
	})
});