function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList traversal');

test('glow.dom.NodeList#get', 1, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	equal(typeof glow.NodeList, 'function', 'glow.NodeList is function');
	
});

test('glow.NodeList#parent', 3, function() {
	
	var myNodeList = new glow.NodeList('#innerDiv1'),
		correctNodes = new glow.NodeList('#twoInnerDivs');
		
	equal(typeof myNodeList.parent, 'function', 'glow.NodeList#parent is function');
	
	var nodes = myNodeList.parent();
	equal(nodes, correctNodes, "Gets direct parents");
	
	myNodeList = new glow.NodeList("#innerDiv1, #innerDiv2");
	correctNodes = new glow.NodeList('#twoInnerDivs');
	
	nodes = myNodeList.parent();
	
	equal(nodes, correctNodes, "Gets only unique parents");

});

test('glow.dom.NodeList#prev', 5, function() {
	var myNodeList = new glow.NodeList('#innerEm2');
	var correctNodes = new glow.NodeList('#innerEm1');
	equal(typeof myNodeList.prev, 'function', 'glow.NodeList#prev is function');
	var nodes = myNodeList.prev("#innerEm2");
	equal(nodes, correctNodes, "Gets previous elements");
	
	
	myNodeList = new glow.NodeList('#constructor');
	nodes = myNodeList.prev('#constructor');
	
	equal(nodes, [], "Returns nothing if no previous element");
	
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
	
	var myNodeList = new glow.NodeList('#secondspan');
	var correctNodes = new glow.NodeList('#firstspan');
	nodes = myNodeList.prev('#secondspan')
	equal(nodes, correctNodes, "Skips comment nodes");
});

test('glow.dom.NodeList#next', 5, function() {
	var myNodeList = new glow.NodeList('#innerEm1'),
	correctNodes = new glow.NodeList('#innerEm2');

	var nodes = myNodeList.next();
	equal(typeof myNodeList.next, 'function', 'glow.NodeList#next is function');
	
	equal(nodes, correctNodes, "Gets next elements");
	nodes = glow.dom.get("#simon1").next();
	isSet(nodes, [], "Returns nothing if no next element");
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
	nodes = glow.dom.create("<div><div>Prev One</div><!-- html comment -->Text<div>Next One</div></div>").get("div").slice(0, 1);
	equals(nodes.next().text(), "Next One", "Skips comment nodes");
});


test('glow.dom.NodeList#ancestors', 3, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	
	var nodes = glow.dom.get("#simon1").ancestors();
	var expectedNodes = glow.dom.get("#firstp, #main, dl, body, html");
	
	isSet(nodes, expectedNodes, "Gets ancestors");
	
	var nodes = glow.dom.get("#simon1, #foo").ancestors();
	var expectedNodes = glow.dom.get("#firstp, #main, dl, body, html");
      
	
	isSet(nodes, expectedNodes, "Gets only unique ancestors");
	
	nodes = glow.dom.get("#foo, #ap").ancestors();
	
	ok(nodes instanceof glow.dom.NodeList, "Returns NodeList");
});

test('glow.dom.NodeList#children', 3, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	
	var nodes = glow.dom.get("#foo").children();
	isSet(nodes, q("sndp", "en", "sap"), "Gets direct children");
	nodes = glow.dom.get("#sndp").children();
	equals(nodes.length, 1, "Gets only elements");
	ok(nodes instanceof glow.dom.NodeList, "Returns NodeList");
});

test('glow.dom.NodeList#contains', 1, function() {
	equal(typeof glow.NodeList, 'function', 'glow.NodeList is function');
	
});