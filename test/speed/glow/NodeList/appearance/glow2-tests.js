woosh.addTests('glow2-src', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		window.tenElms = new glow.NodeList('#settingStyles').children();
		window.oneElm = tenElms.item(0);
		window.gettingElm = new glow.NodeList('#gettingStyles');
	},
	'CSS setting, many elms one val': new woosh.TimeTest(1, function(test) {
		tenElms.css('display', 'block');
		if (test.lastLoop) {
			return tenElms.css('display');
		}
	}),
	'CSS setting, one elm one val': new woosh.TimeTest(1, function(test) {
		oneElm.css('font-weight', 'bold');
		if (test.lastLoop) {
			return oneElm.css('display');
		}
	}),
	'CSS setting, one elm 3 vals': new woosh.TimeTest(1, function(test) {
		tenElms.css({
			'display': 'block',
			'font-weight': 'bold',
			'background-color': 'black'
		});
		if (test.lastLoop) {
			return oneElm.css('display') + oneElm.css('font-weight') + oneElm.css('background-color');
		}
	}),
	'CSS getting - display': new woosh.TimeTest(1, function() {
		return gettingElm.css('display');
	}),
	'CSS getting - background-color': new woosh.TimeTest(1, function() {
		return gettingElm.css('background-color');
	}),
	'CSS getting - width': new woosh.TimeTest(1, function() {
		return gettingElm.css('width');
	}),
	'width getting': new woosh.TimeTest(1, function() {
		return gettingElm.width();
	}),
	'width setting - many elms': new woosh.TimeTest(1, function() {
		return tenElms.width(200);
	}),
	'width setting - one elm': new woosh.TimeTest(1, function() {
		return oneElm.width(200);
	}),
	'height getting': new woosh.TimeTest(1, function() {
		return gettingElm.height();
	}),
	'height setting - many elms': new woosh.TimeTest(1, function() {
		return tenElms.height(200);
	}),
	'height setting - one elm': new woosh.TimeTest(1, function() {
		return oneElm.height(200);
	})
});