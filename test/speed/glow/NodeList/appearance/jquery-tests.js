woosh.addTests('jq-132', {
	'$preTest': function(prevTest, nextTest) {
		if (!prevTest) {
			window.htmlForTest = document.getElementById('htmlForTest');
			window.htmlForTestHTML = htmlForTest.innerHTML;
		}
		htmlForTest.innerHTML = htmlForTestHTML;
		window.tenElms = $('#settingStyles').children();
		window.oneElm = tenElms.slice(0, 1);
		window.gettingElm = $('#gettingStyles');
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
		tenElms.width(200)
		if (test.lastLoop) {
			return tenElms.width();
		}
	}),
	'width setting - one elm': new woosh.TimeTest(1, function() {
		oneElm.width(200);
		if (test.lastLoop) {
			return oneElm.width();
		}
	}),
	'height getting': new woosh.TimeTest(1, function() {
		return gettingElm.height();
	}),
	'height setting - many elms': new woosh.TimeTest(1, function() {
		tenElms.height(200);
		if (test.lastLoop) {
			return tenElms.height();
		}
	}),
	'height setting - one elm': new woosh.TimeTest(1, function() {
		oneElm.height(200);
		if (test.lastLoop) {
			return oneElm.height();
		}
	})
});