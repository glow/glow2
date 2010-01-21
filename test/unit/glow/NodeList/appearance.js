function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList appearance');

test('glow.NodeList#css general set methods', 6, function() {
	
	// TRY A SINGLE ENTRY
	nodes = new glow.NodeList("#cssTests div.test");
	equal(nodes.css("width", "100px").css("width"), "100px", "Set width to 100px");
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
	//node.parentNode.removeChild(node);
});

test('glow.NodeList#css general get methods', 11, function() {
	//var node = new glow.NodeList('#cssTests');
	//document.body.appendChild(node);
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
});

test('glow.NodeList#css lists', 6, function() {
	//lists
	nodes = new glow.NodeList("#cssTests ul.listTest");
	equal(nodes.css("list-style-image"), "none", "list-style-image");
	equal(nodes.css("list-style-position"), "outside", "list-style-position");
	equal(nodes.css("list-style-type"), "square", "list-style-type");
	nodes = new glow.NodeList("#cssTests ul.listTest li");
	equal(nodes.css("list-style-image"), "none", "list-style-image (on li)");
	equal(nodes.css("list-style-position"), "outside", "list-style-position (on li)");
	equal(nodes.css("list-style-type"), "square", "list-style-type (on li)");

});

test('glow.NodeList#css colours', 4, function() {
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

});

test('glow.NodeList#css backgrounds', 3, function() {
	//background test
	nodes = new glow.NodeList("#cssTests div.backgroundTest");
	equal(nodes.css("background-image"), "url(" + /^([\s\S]+)\//.exec(window.location.href)[1] + "/testdata/fail.png)", "background-image");
	equal(nodes.css("background-attachment"), "scroll", "background-attachment");
	equal(nodes.css("background-repeat"), "repeat-x", "background-repeat");
		//Cannot get a reliable value for this
		//equal(glow.dom.get("#cssTests div.backgroundTest").css("background-position"), "top right", "background-position");

});

test('glow.NodeList#css text styles', 10, function() {
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
	nodes = new glow.NodeList("#cssTests div.fontTest")
	equal(nodes.css("white-space"), "nowrap", "white-space");
	equal(nodes.css("word-spacing"), "240px", "word-spacing");

});

test('glow.NodeList#css border styles', 4, function() {
	//bordering
	nodes = new glow.NodeList("#cssTests div.borderTest");
	equal(nodes.css("border-top-style"), "dotted", "border-top-style");
	equal(nodes.css("border-right-style"), "dashed", "border-right-style");
	equal(nodes.css("border-bottom-style"), "double", "border-bottom-style");
	equal(nodes.css("border-left-style"), "solid", "border-left-style");
});

test('glow.NodeList#css floats, display and position', 21, function() {

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


});

test('glow.NodeList#height', 13, function() {
	
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

});

test('glow.NodeList#width', 13, function() {

	
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
	
});

test('glow.NodeList#scrollLeft / scrollTop', 8, function() {
	var testElm = new glow.NodeList(' \
		<div style="width:300px; height:200px; overflow:scroll; zoom:1;"> \
			<div style="width:2000px;height:2000px"></div> \
		</div> \
	').appendTo(document.body);

	equal( typeof testElm.scrollLeft(), 'number', 'scrollLeft returns number' );
	equal( typeof testElm.scrollTop(), 'number', 'scrollTop returns number' );
	
	// set scroll positions to 0,0
	// setting scrollLeft twice to test chaining
	testElm.scrollLeft(10).scrollTop(0).scrollLeft(0);
	
	equal( testElm.scrollTop(), 0, 'scrollTop' );
	equal( testElm.scrollLeft(), 0, 'scrollLeft' );
	
	testElm.scrollLeft(30);
	
	equal( testElm.scrollTop(), 0, 'scrollTop' );
	equal( testElm.scrollLeft(), 30, 'scrollLeft' );
	
	testElm.scrollTop(50);
	
	equal( testElm.scrollTop(), 50, 'scrollTop' );
	equal( testElm.scrollLeft(), 30, 'scrollLeft' );

});



test('glow.NodeList#hide / show', 4, function() {
	nodes = new glow.NodeList("#visibility-toggle");
	nodes.hide();
	equal(nodes.css("display"), "none", "Element has display none");
	equal(nodes.css("visibility"), "hidden", "Element has visibility hidden");
	nodes.show();
	equal(nodes.css("display"), "block", "Element has display block");
	equal(nodes.css("visibility"), "visible", "Element has visibility visible");
});


test('glow.NodeList#offset', 18, function() {
	
	nodes = new glow.NodeList("#elm1");
	var elm1Offset = nodes.offset();
	nodes = new glow.NodeList("#elm1_1");
	var elm1_1Offset = nodes.offset();
	nodes = new glow.NodeList("#elm2");
	var elm2Offset = nodes.offset();
	nodes = new glow.NodeList("#elm2_1");
	var elm2_1Offset = nodes.offset();
	nodes = new glow.NodeList("#elm3");
	var elm3Offset = nodes.offset();
	nodes = new glow.NodeList("#elm3_1");
	var elm3_1Offset = nodes.offset();
	nodes = new glow.NodeList("#elm4");
	var elm4Offset = nodes.offset();
	nodes = new glow.NodeList("#elm4_1");
	var elm4_1Offset = nodes.offset();
	nodes = new glow.NodeList("#elm5_1");
	var elm5_1Offset = nodes.offset();
	
	equal(elm1Offset.top, 0, "elm1 top offset");
	equal(elm1Offset.left, 10, "elm1 left offset");
	
	equal(elm1_1Offset.top, 20, "elm1_1 top offset");
	equal(elm1_1Offset.left, 30, "elm1_1 left offset");
	
	equal(elm2Offset.top, 170, "elm2 top offset");
	equal(elm2Offset.left, 10, "elm2 left offset");
	
	equal(elm2_1Offset.top, 200, "elm2_1 top offset");
	equal(elm2_1Offset.left, 40, "elm2_1 left offset");
	
	equal(elm3Offset.top, 380, "elm3 top offset");
	equal(elm3Offset.left, 10, "elm3 left offset");
	
	equal(elm3_1Offset.top, (glow.env.ie < 8) ? 400 : 410, "elm3_1 top offset");
	equal(elm3_1Offset.left, 40, "elm3_1 left offset");
	
	equal(elm4Offset.top, 15, "elm4 top offset");
	equal(elm4Offset.left, 15, "elm4 left offset");
	
	equal(elm4_1Offset.top, (glow.env.ie < 8) ? 20 : 25, "elm4_1 top offset");
	equal(elm4_1Offset.left, 25, "elm4_1 left offset");
	
	equal(elm5_1Offset.top, 650, "elm5_1 top offset");
	equal(elm5_1Offset.left, 40, "elm5_1 left offset");
	

});

test('glow.NodeList#position', 18, function() {

	nodes = new glow.NodeList("#pos1");
	var pos1Position = nodes.position();
	nodes = new glow.NodeList("#pos1_1");
	var pos1_1Position = nodes.position();
	nodes = new glow.NodeList("#pos2");
	var pos2Position = nodes.position();
	nodes = new glow.NodeList("#pos2_1");
	var pos2_1Position = nodes.position();
	nodes = new glow.NodeList("#pos3");
	var pos3Position = nodes.position();
	nodes = new glow.NodeList("#pos3_1");
	var pos3_1Position = nodes.position();
	nodes = new glow.NodeList("#pos4");
	var pos4Position = nodes.position();
	nodes = new glow.NodeList("#pos4_1");
	var pos4_1Position = nodes.position();
	nodes = new glow.NodeList("#pos5_1");
	var pos5_1Position = nodes.position();
	
	equal(pos1Position.top, 0, "pos1 top position");
	equal(pos1Position.left, 0, "pos1 left position");
	
	equal(pos1_1Position.top, 20, "pos1_1 top position");
	equal(pos1_1Position.left, 20, "pos1_1 left position");
	
	equal(pos2Position.top, 160, "pos2 top position");
	equal(pos2Position.left, 0, "pos2 left position");
	
	equal(pos2_1Position.top, 20, "pos2_1 top position");
	equal(pos2_1Position.left, 20, "pos2_1 left position");
	
	equal(pos3Position.top, 370, "pos3 top position");
	equal(pos3Position.left, 0, "pos3 left position");
	
	equal(pos3_1Position.top, (glow.env.ie < 8) ? 390 : 400, "pos3_1 top position");
	equal(pos3_1Position.left, 30, "pos3_1 left position");
	
	equal(pos4Position.top, 5, "pos4 top position");
	equal(pos4Position.left, 5, "pos4 left position");
	
	equal(pos4_1Position.top, (glow.env.ie < 8) ? 0 : 5, "pos4_1 top position");
	equal(pos4_1Position.left, 5, "pos4_1 left position");
	
	equal(pos5_1Position.top, 20, "pos5_1 top position");
	equal(pos5_1Position.left, 20, "pos5_1 left position");
	
	
	
});

test('cleanup', 0, function() {
	//cleanup
	var cleanup = new glow.NodeList("#nodelistcsstests");

	cleanup.destroy();
});