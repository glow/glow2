function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList traversal');

test('glow.dom.NodeList#get', 2, function() {
	
	var myNodeList = new glow.NodeList('#testElmsContainer');
	
	equal(typeof glow.NodeList, 'function', 'glow.NodeList is function');
	
	var nodes = myNodeList.get('span');
	
	equal(nodes.length, 3, "Returns nodeList with 2 items");
	
	console.log("nodes: ");
	console.log(nodes);
});

test('glow.NodeList#parent', 3, function() {
	
	var myNodeList = new glow.NodeList('#innerDiv1');
	
	equals(typeof myNodeList.parent, 'function', 'glow.NodeList#parent is function');
	
	var nodes = myNodeList.parent();	
	
	equals(nodes[0], byId('twoInnerDivs'), "Gets direct parents");
	
	myNodeList = new glow.NodeList("#innerDiv1, #innerDiv2");
	
	correctNodes = new glow.NodeList('#twoInnerDivs');
	
	nodes = myNodeList.parent();

	equals(nodes[0], byId('twoInnerDivs'), "Gets only unique parents");

});

test('glow.dom.NodeList#prev', 5, function() {
	var myNodeList = new glow.NodeList('#innerEm2');
	
	equals(typeof myNodeList.prev, 'function', 'glow.NodeList#prev is function');
	
	var nodes = myNodeList.prev("#innerEm2");
	
	equals(nodes[0], byId('innerEm1'), "Gets previous elements");	
	
	myNodeList = new glow.NodeList('#constructor');
	
	var nodes = myNodeList.prev('#constructor');

	equal(nodes.length, 0, "Returns nothing if no previous element");
	
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
	
	var myNodeList = new glow.NodeList('#secondspan');
	
	nodes = myNodeList.prev('#secondspan');
	
	equal(nodes[0], byId('firstspan'), "Skips comment nodes");
});

test('glow.dom.NodeList#next', 5, function() {
	var myNodeList = new glow.NodeList('#innerEm1');

	var nodes = myNodeList.next();
	
	equal(typeof myNodeList.next, 'function', 'glow.NodeList#next is function');
	
	equal(nodes[0], byId('innerEm2'), "Gets next element");
	
	myNodeList = new glow.NodeList('#constructor');
	
	nodes = myNodeList.next('#constructor');

	equal(nodes.length, 0, "Returns nothing if no next element");
	
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
	
	var myNodeList = new glow.NodeList('#firstspan');
	
	nodes = myNodeList.next('#firstspan');
	
	equal(nodes[0], byId('secondspan'), "Skips comment nodes");
});


test('glow.dom.NodeList#ancestors', 13, function() {
	var myNodeList = new glow.NodeList('#innerDiv2');
	
	equal(typeof myNodeList.ancestors, 'function', 'glow.NodeList#ancestors is function');
	
	/* [*]innerDiv2 > [3]twoInnerDivs > [2]testElmsContainer > [1]body > [0]html*/
	
	var nodes = myNodeList.ancestors();
	
	equal(nodes.length, 4, "innerDiv2 has 4 ancestors");
	
	equal(nodes[3], byId('twoInnerDivs'), "Correct first ancestor");
	equal(nodes[2], byId('testElmsContainer'), "Correct second ancestor");
	equal(nodes[1], byId('body'), "Correct third ancestor");
	equal(nodes[0], byId('html'), "Correct fourth ancestor");
	
	/* [*]innerDiv2 > [3]twoInnerDivs > [2]testElmsContainer > [1]body > [0]html*/
	/* [*]innerEm1 > [3]twoInnerEms > [2]testElmsContainer > [1]body > [0]html*/
	var myNodeList = new glow.NodeList('#innerDiv2, #innerEm1');
	
	var nodes = myNodeList.ancestors();

	equal(nodes.length, 5, "innerDiv2 and innerEm1 have 5 ancestors");      
	
	equal(nodes[4], byId('twoInnerEms'), "Correct first ancestor");
	equal(nodes[3], byId('twoInnerDivs'), "Correct second ancestor");
	equal(nodes[2], byId('testElmsContainer'), "Correct third ancestor");
	equal(nodes[1], byId('body'), "Correct fourth ancestor");
	equal(nodes[0], byId('html'), "Correct fifth ancestor");	

	
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
});

test('glow.dom.NodeList#children', 5, function() {
	
	var myNodeList = new glow.NodeList('#twoInnerDivs');
	
	equal(typeof myNodeList.children, 'function', 'glow.NodeList#children is function');
	
	/* [*]twoInnerDivs > innerDiv1 > innerDiv2*/
	var nodes = myNodeList.children();

	equal(nodes.length, 2, "twoInnerDivs has 2 child elements");
	
	equal(nodes[1], byId('innerDiv2'), "Correct first child");
	equal(nodes[0], byId('innerDiv1'), "Correct second child");
	

	
	ok(nodes instanceof glow.NodeList, "Returns NodeList");
	
});

test('glow.dom.NodeList#contains', 1, function() {
	
	equal(typeof glow.NodeList, 'function', 'glow.NodeList is function');
	
	
});