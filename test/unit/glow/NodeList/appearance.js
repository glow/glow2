function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList appearance');

test('glow.NodeList#css', 64, function() {
	var node = new glow.NodeList("" +
		'<div id="cssTests">' +
			'<div class="test">Test</div>' +
		'</div>'
	)[0];
	document.body.appendChild(node);
	// TRY A SINGLE ENTRY
	nodes = new glow.NodeList("#cssTests div.test");
	equal(nodes.css({width: "100px"}).css("width"), "100px", "Set width to 100px");
	// TRY MULTIPLE ENTRY
	nodes = new glow.NodeList("#cssTests div.test");
	nodes.css({
		"font-style": "italic",
		"font-size": "10px",
		padding: "10px",
		margin: "10px"
	});
	equal(nodes.css("font-style"), "italic", "Set font-style to italic");
	equal(nodes.css("font-size"), "10px", "Set font-weight to 10px");
	equal(nodes.css("padding-left"), "10px", "Set font-weight to 10px");
	equal(nodes.css("margin-left"), "10px", "Set font-weight to 10px");
	node.parentNode.removeChild(node);
	
	
	var node = new glow.NodeList("" +
		'<div id="cssTests">' +
			'<div class="width100">Test</div>' +
			'<div class="height100">Test</div>' +
			'<div class="containsWidth100Div" style="float:left"><div class="width100">Test</div></div>' +
			'<div class="padTest">padTest</div>' +
			'<div class="borderTest">Test</div>' +
			'<div class="marginTest">Test</div>' +
			'<div class="marginTest2">Test</div>' +
			'<ul class="listTest">' +
				'<li>Test</li>' +
				'<li>' +
					'<ul>' +
						'<li>Test</li>' +
					'</ul>' +
				'</li>' +
			'</ul>' +
			'<div class="colourTest">Test<div>Test</div></div>' +
			'<div class="backgroundTest">Test</div>' +
			'<div class="fontTest">Test</div>' +
			'<table class="tableTest"><tr><td>Test</td><td>Test</td></tr><tr><td>Test</td><td>Test</td></tr></table>' +
			'<div class="posTest1">Test</div>' +
			'<div class="posTest2">postest2</div>' +
			'<div class="posTest3">Test</div>' +
			'<div class="posTest4Container"><div class="posTest4">Test</div><div class="posTest5">Test</div></div>' +
			'<div class="posTest4Container"><div class="padTest2">Test</div></div>' +
			'<div class="posTest6Container" style="position:relative;zoom:1"><div style="height:100px">Padding!</div><div class="posTest6">Test</div></div>' +
			'<div class="posTest7Container" style="width:500px;margin-left:20px;"><div class="posTest7">Test</div></div>' +
			'<div class="posTest8">posTest8</div>' +
			'<div class="opacityTest">Test</div>' +
			'<div class="displayTest1">Test</div>' +
			'<div class="displayTest2">Test</div>' +
			'<div class="displayNone" style="display:none"><div class="posTest8">Test</div></div>' +
		'</div>'
	)[0];
	document.body.appendChild(node);
	nodes = new glow.NodeList("#cssTests div.width100");
	equal(nodes.css("width"), "100px", "Width");
	nodes = new glow.NodeList("#cssTests div.height100");
	equal(nodes.css("height"), "100px", "Height");
	nodes = new glow.NodeList("#cssTests div.padTest");
	equal(nodes.css("padding-right"), "10px", "Absolute Padding");
	
	equal(nodes.css("padding-left"), "60px", "Relative Padding");
	nodes = new glow.NodeList("#cssTests div.borderTest");
	equal(nodes.css("border-right-width"), "10px", "Absolute Border");

	equal(nodes.css("border-left-width"), "60px", "Relative Border");
	nodes = new glow.NodeList("#cssTests div.marginTest");
	equal(nodes.css("margin-right"), "10px", "Absolute margin");

	equal(nodes.css("margin-left"), "60px", "Relative margin");
	nodes = new glow.NodeList("#cssTests div.padTest");
	equal(nodes.css(["padding-right", "padding-left"]), "70px", "Left and right padding total");
	nodes = new glow.NodeList("#cssTests div.borderTest");
	equal(nodes.css(["border-right-width", "border-left-width"]), "70px", "Left and right border total");
	nodes = new glow.NodeList("#cssTests div.marginTest");
	equal(nodes.css(["margin-right", "margin-left"]), "70px", "Left and right margin total");
		//this is fine, but IE's % padding calculator is broken so it fails this test
		//equal(glow.dom.get("#cssTests div.padTest2").css("padding-left"), "250px", "Percent padding");
		//cannot get value for auto in some browsers
		//equal(glow.dom.get("#cssTests div.marginTest2").css("margin-left"), "dunno", "Auto margin");
	
	//lists
	nodes = new glow.NodeList("#cssTests ul.listTest");
	equal(nodes.css("list-style-image"), "none", "list-style-image");
	equal(nodes.css("list-style-position"), "outside", "list-style-position");
	equal(nodes.css("list-style-type"), "square", "list-style-type");
	nodes = new glow.NodeList("#cssTests ul.listTest li");
	equal(nodes.css("list-style-image"), "none", "list-style-image (on li)");
	equal(nodes.css("list-style-position"), "outside", "list-style-position (on li)");
	equal(nodes.css("list-style-type"), "square", "list-style-type (on li)");
	
	//color tests
	nodes = new glow.NodeList("#cssTests div.colourTest");
	equal(nodes.css("color"), "rgb(0, 255, 0)", "color");
	nodes = new glow.NodeList("#cssTests div.colourTest div");
	equal(nodes.css("color"), "rgb(0, 255, 0)", "color nested");
	//safari gets this one a little wrong, but it's ok
	nodes = new glow.NodeList("#cssTests div.colourTest");
	ok(/rgb\(12[78], 12[78], 12[78]\)/.test(nodes.css("background-color")), "background-color (percentage color)");
	nodes = new glow.NodeList("#cssTests div.colourTest");
	equal(nodes.css("border-left-color"), "rgb(0, 128, 0)", "border-left-color (keyword)");
	
	//background test
	nodes = new glow.NodeList("#cssTests div.backgroundTest");
	equal(nodes.css("background-image"), "url(" + /^([\s\S]+)\//.exec(window.location.href)[1] + "/testdata/fail.png)", "background-image");
	equal(nodes.css("background-attachment"), "scroll", "background-attachment");
	equal(nodes.css("background-repeat"), "repeat-x", "background-repeat");
		//Cannot get a reliable value for this
		//equal(glow.dom.get("#cssTests div.backgroundTest").css("background-position"), "top right", "background-position");
	
	//font & direction
	nodes = new glow.NodeList("#cssTests div.fontTest");
	equal(nodes.css("direction"), "rtl", "direction");
		//some browsers return used font, others return full list provided in stylesheet
		//equal(glow.dom.get("#cssTests div.fontTest").css("font-family"), "verdana", "font-family");
		//cannot get a computed value for IE
		//equal(glow.dom.get("#cssTests div.fontTest").css("font-size"), "60px", "font-size");
	nodes = new glow.NodeList("#cssTests div.fontTest");
	equal(nodes.css("font-style"), "italic", "font-style");
	equal(nodes.css("font-variant"), "small-caps", "font-variant");
		//cannot get a computed value for this, some use 'bold', others '700'. Could map the realtive values, but I'm not convinced it's needed
		//equal(glow.dom.get("#cssTests div.fontTest").css("font-weight"), "bold", "font-weight");
	//opera adds 2 decimal places for a laugh
	ok(/120(\.00)?px/.test(nodes.css("line-height")), "line-height");
	equal(nodes.css("letter-spacing"), "120px", "letter-spacing");
	equal(nodes.css("text-align"), "justify", "text-align");
	equal(nodes.css("text-decoration"), "underline", "text-decoration");
	equal(nodes.css("text-indent"), "120px", "text-indent");
		//IE 5.5 returns "uppercase"
		//equal(glow.dom.get("#cssTests div.fontTest").css("text-transform"), "capitalize", "text-transform");
	equal(glow.dom.get("#cssTests div.fontTest").css("white-space"), "nowrap", "white-space");
	equal(glow.dom.get("#cssTests div.fontTest").css("word-spacing"), "240px", "word-spacing");
	
	//bordering
	nodes = new glow.NodeList("#cssTests div.borderTest");
	equal(nodes.css("border-top-style"), "dotted", "border-top-style");
	equal(nodes.css("border-right-style"), "dashed", "border-right-style");
	equal(nodes.css("border-bottom-style"), "double", "border-bottom-style");
	equal(nodes.css("border-left-style"), "solid", "border-left-style");
	
	//misc
	nodes = new glow.NodeList("#cssTests div.containsWidth100Div");
	equal(nodes.css("float"), "left", "float");
	nodes = new glow.NodeList("#cssTests div.padTest");
	equal(nodes.css("clear"), "left", "clear");
		//can't get a good value out of firefox
		//equal(glow.dom.get("#cssTests table.tableTest").css("table-layout"), "fixed", "table-layout")
	nodes = new glow.NodeList("#cssTests div.displayTest1");
	equal(nodes.css("display"), "inline", "display");
	nodes = new glow.NodeList("#cssTests div.displayTest2");
	equal(nodes.css("display"), "none", "display");
	nodes = new glow.NodeList("#cssTests div.padTest");
	equal(nodes.css("opacity"), "1", "opacity - none set");
	nodes = new glow.NodeList("#cssTests div.opacityTest");
	equal(nodes.css("opacity"), "0.25", "opacity - none set");
	
	//positioning
	nodes = new glow.NodeList("#cssTests div.posTest1");
	equal(nodes.css("position"), "absolute", "position");
	equal(nodes.css("top"), "66px", "top (em val)");
	equal(nodes.css("left"), "30px", "left (px val)");
	equal(nodes.css("z-index"), "32", "z-index");
	nodes = new glow.NodeList("#cssTests div.posTest2");
	equal(nodes.css("right"), "60px", "right (em val)");
	equal(nodes.css("bottom"), "30px", "bottom (px val)");
	nodes = new glow.NodeList("#cssTests div.posTest3");
	equal(nodes.css("position"), "relative", "position");
	equal(nodes.css("top"), "-60px", "top (reltive negative em)");
	equal(nodes.css("left"), "-30px", "left (reltive negative em)");
	nodes = new glow.NodeList("#cssTests div.posTest4");
	equal(nodes.css("left"), "250px", "left (%)");
	nodes = new glow.NodeList("#cssTests div.posTest5");
	equal(nodes.css("right"), "250px", "right (%)");
	nodes = new glow.NodeList("#cssTests div.posTest7");
	equal(nodes.css("left"), "30px", "Using correct offset parent");
	
	//display none tests
	// doesn't work while display:none, may fix later?
	//equal(glow.dom.get("#cssTests div.posTest8").css("top"), "60px", "top (em val display none)");
	//equal(glow.dom.get("#cssTests div.posTest8").css("left"), "30px", "left (px val display none)");
	nodes = new glow.NodeList("#cssTests div.posTest8");
	equal(nodes.css("width"), "60px", "width (em val display none)");
	equal(nodes.css("width"), "60px", "width (em val display none)");
	equal(nodes.css("height"), "30px", "height (px val display none)");
	//equal(glow.dom.get("#cssTests div.displayNone div").css("top"), "60px", "top (em val inside display none)");
	
	
	node.parentNode.removeChild(node);
});

test('glow.NodeList#height', 13, function() {
	var node = new glow.NodeList("" +
		'<div id="cssTests">' +
			'<div class="height100">Test</div>' +
			'<div class="height100 padding10">Test</div>' +
			'<div class="bordered" style="height:100px;border:10px solid #000">Test</div>' +
			'<div class="height100 overflowScroll">Test</div>' +
			'<div class="containsHeight100Div"><div class="height100">Test</div></div>' +
		'</div>'
	)[0];
	document.body.appendChild(node);
	nodes = new glow.NodeList(window);
	ok( nodes.height() == 'number', "window height is number" );
	nodes = new glow.NodeList(window);
	ok( nodes.height() > 0, "window height is greater than zero" );
	nodes = new glow.NodeList(document);
	ok( typeof nodes.height() == 'number', "document height is number" );
	ok( nodes.height() > 0, "document height is greater than zero" );
	nodes = new glow.NodeList("#cssTests div.height100");
	equal(nodes.height(), 100, "height get");
	nodes = new glow.NodeList("#cssTests div.height100.padding10");
	equal(nodes.height(), 100, "Ignore padding");
	nodes = new glow.NodeList("#cssTests div.bordered");
	equal(nodes.height(), 100, "Ignore border");
	nodes = new glow.NodeList("#cssTests div.height100.overflowScroll");
	equal(nodes.height(), 100, "Element with scrollbars");
	nodes = new glow.NodeList("#cssTests div.containsHeight100Div");
	equal(nodes.height(), 100, "Element floating and containing div");
	nodes = new glow.NodeList("#cssTests div.bordered");
	equal(nodes.height(200).height(), 200, "Set height number");
	equal(nodes.height("300").height(), 300, "Set height str, no unit");
	equal(nodes.height("400px").height(), 400, "Set height str, inc unit");
	node.parentNode.removeChild(node);
});

test('glow.NodeList#width', 13, function() {
	var node = new glow.NodeList("" +
		'<div id="cssTests">' +
			'<div class="width100">Test</div>' +
			'<div class="width100 padding10">Test</div>' +
			'<div class="bordered" style="width:100px;border:10px solid #000">Test</div>' +
			'<div class="width100 overflowScroll">Test</div>' +
			'<div class="containsWidth100Div" style="float:left"><div class="width100">Test</div></div>' +
			'<div style="width:500px; height: 100px"> <div id="autoWidthTest" style="border:5px solid red; padding:10px;"></div> </div>' +
		'</div>'
	)[0];
	document.body.appendChild(node);
	
	nodes = new glow.NodeList(window);
	ok( typeof nodes.width() == 'number', "window width is number" );
	ok( nodes.width() > 0, "window width is greater than zero" );
	nodes = new glow.NodeList(document);
	ok( typeof nodes.width() == 'number', "document width is number" );
	ok( nodes.width() > 0, "document width is greater than zero" );
	nodes = new glow.NodeList("#cssTests div.width100");
	equal(nodes.width(), 100, "Width get");
	nodes = new glow.NodeList("#cssTests div.width100.padding10");
	equal(nodes.width(), 100, "Ignore padding");
	nodes = new glow.NodeList("#cssTests div.bordered");
	equal(nodes.width(), 100, "Ignore border");
	nodes = new glow.NodeList("#cssTests div.width100.overflowScroll");
	equal(nodes.width(), 100, "Element with scrollbars");
	nodes = new glow.NodeList("#cssTests div.containsWidth100Div");
	equal(nodes.width(), 100, "Element floating and containing div");
	nodes = new glow.NodeList("autoWidthTest");
	equal(nodes.width(), 470, "Auto width element with border & padding");
	nodes = new glow.NodeList("#cssTests div.bordered");
	equal(nodes.width(200).width(), 200, "Set width number");
	equal(nodes.width("300").width(), 300, "Set width str, no unit");
	equal(nodes.width("400px").width(), 400, "Set width str, inc unit");
	
	node.parentNode.removeChild(node);
});

test('glow.NodeList#scrollLeft', 0, function() {

});

test('glow.NodeList#scrollTop', 0, function() {

});

test('glow.NodeList#hide', 0, function() {
		
});

test('glow.NodeList#show', 0, function() {
	
});

test('glow.NodeList#offset', 0, function() {
	
});

test('glow.NodeList#position', 0, function() {
	
});