function byId(id) {
	return document.getElementById(id);
}

var testHtml;

function setup() {
	testHtml = byId('testElmsContainer').innerHTML;
}

function teardown() {
	byId('testElmsContainer').innerHTML = testHtml;
}

module('glow.NodeList#clone', {setup:setup, teardown:teardown});

test('glow.NodeList#clone', 10, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span><span>World</span>'),
		clones;
	
	equal(typeof myNodeList.clone, 'function', 'glow.NodeList#clone is a function');
	
	clones = myNodeList.clone();
	
	equal(clones.constructor, glow.NodeList, 'returns nodelist');
	notEqual(clones, myNodeList, 'returns new nodelist');
	
	notEqual( clones[0], myNodeList[0], 'First elements aren\'t equal' );
	notEqual( clones[1], myNodeList[1], 'Second elements aren\'t equal' );
	equal( clones.length, myNodeList.length, 'Lengths are equal' );
	
	equal(clones[0].nodeName, 'SPAN', 'copy is span');
	equal(clones[0].firstChild.nodeValue, 'Hello', 'copied inner text node');
	equal(clones[1].nodeName, 'SPAN', 'copy is span');
	equal(clones[1].firstChild.nodeValue, 'World', 'copied inner text node');
});

test('glow.NodeList#clone data preserving', 60, function() {
	ok(false, 'todo, waiting for events & data');
});

test('glow.NodeList#clone events preserving', 60, function() {
	ok(false, 'todo, waiting for events & data');
});

module('glow.NodeList#after', {setup:setup, teardown:teardown});

test('glow.NodeList#after html string (single elm)', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	equal(typeof myNodeList.after, 'function', 'glow.NodeList#after is a function');
	
	returnNodeList = myNodeList.after('<span>Hello</span>');
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	myNodeList.each(function(i) {
		equal(this.nextSibling.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#after html string (multiple elm)', 17, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	returnNodeList = myNodeList.after('<span>Hello</span>World<!-- comment --><span>Foobar</span>');
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.nextSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nextSibling.nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nextSibling.nextSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#after html element (single elm)', 7, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = myNodeList.after( elementToMove[0] );
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.nextSibling.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].nextSibling, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#after html element (multiple elms)', 21, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = myNodeList.after(elementsToMove);
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.nextSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.nextSibling.innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(this.nextSibling.nextSibling.nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].nextSibling, elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].nextSibling.nextSibling, elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#after empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.after('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.after(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.after(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.after(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').after('<b></b>')[0].innerHTML, 'hey', 'Node with no parent');
	
});

module('glow.NodeList#before', {setup:setup, teardown:teardown});

test('glow.NodeList#before html string (single elm)', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	equal(typeof myNodeList.before, 'function', 'glow.NodeList#before is a function');
	
	returnNodeList = myNodeList.before('<span>Hello</span>');
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	myNodeList.each(function(i) {
		equal(this.previousSibling.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#before html string (multiple elm)', 17, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	returnNodeList = myNodeList.before('<span>Hello</span>World<!-- comment --><span>Foobar</span>');
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.previousSibling.previousSibling.previousSibling.previousSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.previousSibling.previousSibling.previousSibling.nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(this.previousSibling.previousSibling.nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(this.previousSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#before html element (single elm)', 7, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = myNodeList.before( elementToMove[0] );
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.previousSibling.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].previousSibling, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#before html element (multiple elms)', 21, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = myNodeList.before(elementsToMove);
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.previousSibling.previousSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.previousSibling.previousSibling.innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(this.previousSibling.nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(this.previousSibling.innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].previousSibling.previousSibling, elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].previousSibling, elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#before empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.before('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.before(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.before(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.before(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').before('<b></b>')[0].innerHTML, 'hey', 'Node with no parent');
	
});