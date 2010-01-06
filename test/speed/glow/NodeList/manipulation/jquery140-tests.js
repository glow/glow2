woosh.addTests('jq-140', {
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
	'after': woosh.Test(20, function() {
		paragraphs.after('<p>hello</p>');
		if (++testCount == 20) {
			return $('p').length;
		}
	}),
	'before': woosh.Test(20, function() {
		paragraphs.before('<p>hello</p>');
		if (++testCount == 20) {
			return $('p').length;
		}
	}),
	'append': woosh.Test(20, function() {
		paragraphs.append('<span>hello</span>');
		if (++testCount == 20) {
			return $('span').length;
		}
	}),
	'prepend': woosh.Test(20, function() {
		paragraphs.prepend('<span>hello</span>');
		if (++testCount == 20) {
			return $('span').length;
		}
	}),
	'appendTo': woosh.Test(20, function() {
		paragraphs.appendTo(testBin);
		if (++testCount == 20) {
			return new $('#testBin p').length;
		}
	}),
	'prependTo': woosh.Test(20, function() {
		paragraphs.prependTo(testBin);
		if (++testCount == 20) {
			return new $('#testBin p').length;
		}
	}),
	'insertAfter': woosh.Test(20, function() {
		paragraphs.insertAfter(testBin);
		if (++testCount == 20) {
			return $('#testBin p').length;
		}
	}),
	'insertBefore': woosh.Test(20, function() {
		paragraphs.insertBefore(testBin);
		if (++testCount == 20) {
			return $('#testBin p').length;
		}
	}),
	'remove': woosh.Test(20, function() {
		var html = testBin[0].innerHTML;
		paragraphs.remove();
		if (++testCount == 20) {
			return $('#testBin p').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = $('p');
	}),
	'empty': woosh.Test(20, function() {
		var html = testBin[0].innerHTML;
		paragraphs.empty();
		if (++testCount == 20) {
			return $('p').children().length;
		}
		testBin[0].innerHTML = html;
		paragraphs = $('p');
	}),
	'replaceWith': woosh.Test(20, function() {
		paragraphs.replaceWith('<p>Hello!</p>');
		if (++testCount == 20) {
			return $('p').length;
		}
		paragraphs = $('p');
	}),
	'wrap': woosh.Test(20, function() {
		paragraphs.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 20) {
			return $('div.wrapInner').length;
		}
	}),
	'wrap single': woosh.Test(200, function() {
		paragraph.wrap('<div><div class="wrapInner"></div></div>');
		if (++testCount == 200) {
			return $('div.wrapInner').length;
		}
	}),
	'unwrap': woosh.Test(20, function() {
		var html = testBin[0].innerHTML;
		paragraphs.unwrap();
		if (++testCount == 20) {
			return $('div.wrappingToRemove').length;
		}
		testBin[0].innerHTML = html;
		paragraphs = $('p');
	}),
	'clone': woosh.Test(20, function() {
		paragraphs.clone(true);
		if (++testCount == 20) {
			return paragraphs.length;
		}
	}),
	'copy': woosh.Test(200, function() {
		paragraphs.clone(false);
		if (++testCount == 200) {
			return paragraphs.length;
		}
	}),
	'html getting': woosh.Test(2000, function() {
		return paragraphs.html();
	}),
	'html setting': woosh.Test(100, function() {
		paragraphs.html('Hello!');
		if (++testCount == 100) {
			return paragraphs[0].innerHTML;
		}
	}),
	'text getting': woosh.Test(2000, function() {
		return paragraph.text();
	}),
	'text setting': woosh.Test(100, function() {
		paragraphs.text('Hello!');
		if (++testCount == 100) {
			return paragraphs[0].innerHTML;
		}
	})
});