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

test('glow.NodeList#clone data preserving', 0, function() {
	ok(false, 'todo, waiting for events & data');
});

test('glow.NodeList#clone events preserving', 0, function() {
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

test('glow.NodeList#after on detatched elements & non-elements', 12, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = childNodeList.after('<span>Hello</span>');
	
	strictEqual(returnNodeList, childNodeList, 'Same nodelist returned');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[2].nodeName, '#text', 'Correct Node');
	equal(childNodeList[3].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[5].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[6].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[7].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[8].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[9].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList.length, 10, 'Correct length');
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

test('glow.NodeList#before on detatched elements & non-elements', 12, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = childNodeList.before('<span>Hello</span>');
	
	strictEqual(returnNodeList, childNodeList, 'Same nodelist returned');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[1].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[2].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[3].nodeName, '#text', 'Correct Node');
	equal(childNodeList[4].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[5].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[6].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[7].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[8].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[9].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 10, 'Correct length');
});

module('glow.NodeList#append', {setup:setup, teardown:teardown});

test('glow.NodeList#append html string (single elm)', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	equal(typeof myNodeList.append, 'function', 'glow.NodeList#append is a function');
	
	returnNodeList = myNodeList.append('<span>Hello</span>');
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	myNodeList.each(function(i) {
		equal(this.lastChild.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#append html string (multiple elm)', 17, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	returnNodeList = myNodeList.append('<span>Hello</span>World<!-- comment --><span>Foobar</span>');
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes,
			len = childNodes.length;
		
		equal(childNodes[len-4].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[len-3].nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(childNodes[len-2].nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(childNodes[len-1].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#append html element (single elm)', 7, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = myNodeList.append( elementToMove[0] );
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.lastChild.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].lastChild, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#append html element (multiple elms)', 21, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = myNodeList.append(elementsToMove);
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes,
			len = childNodes.length;
			
		equal(childNodes[len-2].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[len-2].innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(childNodes[len-1].nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(childNodes[len-1].innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].childNodes[ myNodeList[0].childNodes.length-2 ], elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].lastChild, elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#append empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.append('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.append(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.append(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.append(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').append('<b></b>')[0].childNodes.length, 2, 'Node with no parent');
});

test('glow.NodeList#append on detatched elements & non-elements', 10, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = childNodeList.append('<span>Hello</span>');
	
	strictEqual(returnNodeList, childNodeList, 'Same nodelist returned');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, '#text', 'Correct Node');
	equal(childNodeList[2].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[3].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 5, 'Correct length');
	
	equal(childNodeList[0].lastChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[2].lastChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[4].lastChild.innerHTML, 'Hello', 'Span added');
});

module('glow.NodeList#prepend', {setup:setup, teardown:teardown});

test('glow.NodeList#prepend html string (single elm)', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	equal(typeof myNodeList.prepend, 'function', 'glow.NodeList#prepend is a function');
	
	returnNodeList = myNodeList.prepend('<span>Hello</span>');
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	myNodeList.each(function(i) {
		equal(this.firstChild.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#prepend html string (multiple elm)', 17, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnNodeList;
		
	returnNodeList = myNodeList.prepend('<span>Hello</span>World<!-- comment --><span>Foobar</span>');
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes;
		
		equal(childNodes[0].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[1].nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(childNodes[2].nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(childNodes[3].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#prepend html element (single elm)', 7, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = myNodeList.prepend( elementToMove[0] );
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.firstChild.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].firstChild, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#prepend html element (multiple elms)', 21, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = myNodeList.prepend(elementsToMove);
	
	strictEqual(returnNodeList, myNodeList, 'Same nodelist returned');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes;
			
		equal(childNodes[0].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[0].innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(childNodes[1].nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(childNodes[1].innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].childNodes[0], elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].childNodes[1], elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#prepend empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.prepend('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.prepend(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.prepend(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.prepend(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').prepend('<b></b>')[0].childNodes.length, 2, 'Node with no parent');
});

test('glow.NodeList#prepend on detatched elements & non-elements', 10, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = childNodeList.prepend('<span>Hello</span>');
	
	strictEqual(returnNodeList, childNodeList, 'Same nodelist returned');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, '#text', 'Correct Node');
	equal(childNodeList[2].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[3].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 5, 'Correct length');
	
	equal(childNodeList[0].firstChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[2].firstChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[4].firstChild.innerHTML, 'Hello', 'Span added');
});

module('glow.NodeList#appendTo', {setup:setup, teardown:teardown});

test('glow.NodeList#appendTo html string (single elm)', 8, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>'),
		returnNodeList;
		
	equal(typeof myNodeList.appendTo, 'function', 'glow.NodeList#appendTo is a function');
	
	returnNodeList = myNodeList.appendTo('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.lastChild.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#appendTo html string (multiple elm)', 19, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>World<!-- comment --><span>Foobar</span>'),
		returnNodeList;
		
	returnNodeList = myNodeList.appendTo('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 16, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes,
			len = childNodes.length;
		
		equal(childNodes[len-4].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[len-3].nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(childNodes[len-2].nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(childNodes[len-1].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#appendTo html element (single elm)', 9, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = elementToMove.appendTo(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementToMove, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.lastChild.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].lastChild, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#appendTo html element (multiple elms)', 23, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = elementsToMove.appendTo(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementsToMove, 'New nodelist returned');
	equal(returnNodeList.length, 8, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes,
			len = childNodes.length;
			
		equal(childNodes[len-2].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[len-2].innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(childNodes[len-1].nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(childNodes[len-1].innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].childNodes[ myNodeList[0].childNodes.length-2 ], elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].lastChild, elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#appendTo empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.appendTo('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.appendTo(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.appendTo(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.appendTo(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	ok(new glow.NodeList('<span>hey</span>').appendTo('<b></b>')[0].parentNode, 'Node with no parent');
});

test('glow.NodeList#appendTo on detatched elements & non-elements', 11, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = new glow.NodeList('<span>Hello</span>').appendTo(childNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	equal(returnNodeList.length, 3, 'Clones included');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, '#text', 'Correct Node');
	equal(childNodeList[2].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[3].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 5, 'Correct length');
	
	equal(childNodeList[0].lastChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[2].lastChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[4].lastChild.innerHTML, 'Hello', 'Span added');
});

module('glow.NodeList#prependTo', {setup:setup, teardown:teardown});

test('glow.NodeList#prependTo html string (single elm)', 8, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>'),
		returnNodeList;
		
	equal(typeof myNodeList.prependTo, 'function', 'glow.NodeList#prependTo is a function');
	
	returnNodeList = myNodeList.prependTo('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.firstChild.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#prependTo html string (multiple elm)', 19, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>World<!-- comment --><span>Foobar</span>'),
		returnNodeList;
		
	returnNodeList = myNodeList.prependTo('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 16, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes;
		
		equal(childNodes[0].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[1].nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(childNodes[2].nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(childNodes[3].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#prependTo html element (single elm)', 9, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = elementToMove.prependTo(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementToMove, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.firstChild.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].firstChild, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#prependTo html element (multiple elms)', 23, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = elementsToMove.prependTo(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementsToMove, 'New nodelist returned');
	equal(returnNodeList.length, 8, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	equal( new glow.NodeList('span.elementToMove2').length, 4, '4 elements with class "elementToMove2"' );
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		var childNodes = this.childNodes,
			len = childNodes.length;
			
		equal(childNodes[0].nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(childNodes[0].innerHTML, 'toMove', 'Span 1 in elm #' + (i+1) + ' has correct innerHTML');
		equal(childNodes[1].nodeName, 'SPAN', 'Span 2 in elm #' + (i+1) + ' created');
		equal(childNodes[1].innerHTML, 'toMove2', 'Span 2 in elm #' + (i+1) + ' has correct innerHTML');
	});
	
	strictEqual( myNodeList[0].firstChild, elementsToMove[0], 'Element moved' );
	strictEqual( myNodeList[0].childNodes[1], elementsToMove[1], 'Element moved' );
});

test('glow.NodeList#prependTo empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.prependTo('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.prependTo(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.prependTo(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.prependTo(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	ok(new glow.NodeList('<span>hey</span>').prependTo('<b></b>')[0].parentNode, 'Node with no parent');
});

test('glow.NodeList#prependTo on detatched elements & non-elements', 11, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = new glow.NodeList('<span>Hello</span>').prependTo(childNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	equal(returnNodeList.length, 3, 'Clones included');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, '#text', 'Correct Node');
	equal(childNodeList[2].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[3].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 5, 'Correct length');
	
	equal(childNodeList[0].firstChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[2].firstChild.innerHTML, 'Hello', 'Span added');
	equal(childNodeList[4].firstChild.innerHTML, 'Hello', 'Span added');
});

module('glow.NodeList#insertAfter', {setup:setup, teardown:teardown});

test('glow.NodeList#insertAfter html string (single elm)', 8, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>'),
		returnNodeList;
		
	equal(typeof myNodeList.insertAfter, 'function', 'glow.NodeList#insertAfter is a function');
	
	returnNodeList = myNodeList.insertAfter('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.nextSibling.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#insertAfter html string (multiple elm)', 19, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>World<!-- comment --><span>Foobar</span>'),
		returnNodeList;
		
	returnNodeList = myNodeList.insertAfter('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 16, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.nextSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nextSibling.nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(this.nextSibling.nextSibling.nextSibling.nextSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#insertAfter html element (single elm)', 9, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = elementToMove.insertAfter(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementToMove, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.nextSibling.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].nextSibling, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#insertAfter html element (multiple elms)', 23, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = elementsToMove.insertAfter(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementsToMove, 'New nodelist returned');
	equal(returnNodeList.length, 8, 'Clones included');
	
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

test('glow.NodeList#insertAfter empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.insertAfter('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.insertAfter(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.insertAfter(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.insertAfter(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').insertAfter('<b></b>')[0].innerHTML, 'hey', 'Node with no parent');
});

test('glow.NodeList#insertAfter on detatched elements & non-elements', 13, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = new glow.NodeList('<span>Hello</span>').insertAfter(childNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	equal(returnNodeList.length, 5, 'Clones included');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[1].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[2].nodeName, '#text', 'Correct Node');
	equal(childNodeList[3].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[4].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[5].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[6].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[7].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[8].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[9].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList.length, 10, 'Correct length');
});

module('glow.NodeList#insertBefore', {setup:setup, teardown:teardown});

test('glow.NodeList#insertBefore html string (single elm)', 8, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>'),
		returnNodeList;
		
	equal(typeof myNodeList.insertBefore, 'function', 'glow.NodeList#insertBefore is a function');
	
	returnNodeList = myNodeList.insertBefore('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.previousSibling.innerHTML, 'Hello', 'Span #' + (i+1) + ' created');
	});
});

test('glow.NodeList#insertBefore html string (multiple elm)', 19, function() {
	var myNodeList = new glow.NodeList('<span>Hello</span>World<!-- comment --><span>Foobar</span>'),
		returnNodeList;
		
	returnNodeList = myNodeList.insertBefore('#twoInnerDivs div, #twoInnerEms em');
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, myNodeList, 'New nodelist returned');
	equal(returnNodeList.length, 16, 'Clones included');
	
	new glow.NodeList('#twoInnerDivs div, #twoInnerEms em').each(function(i) {
		equal(this.previousSibling.previousSibling.previousSibling.previousSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
		equal(this.previousSibling.previousSibling.previousSibling.nodeType, 3, 'Text node in elm #' + (i+1) + ' created');
		equal(this.previousSibling.previousSibling.nodeType, 8, 'Comment node in elm #' + (i+1) + ' created');
		equal(this.previousSibling.nodeName, 'SPAN', 'Span 1 in elm #' + (i+1) + ' created');
	});
});

test('glow.NodeList#insertBefore html element (single elm)', 9, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementToMove = new glow.NodeList('span.elementToMove'),
		returnNodeList;

	returnNodeList = elementToMove.insertBefore(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementToMove, 'New nodelist returned');
	equal(returnNodeList.length, 4, 'Clones included');
	
	equal( new glow.NodeList('span.elementToMove').length, 4, '4 elements with class "elementToMove"' );
	
	myNodeList.each(function(i) {
		equal(this.previousSibling.innerHTML, 'toMove', 'Span #' + (i+1) + ' created');
	});
	
	strictEqual( myNodeList[0].previousSibling, elementToMove[0], 'Element moved' );
});

test('glow.NodeList#insertBefore html element (multiple elms)', 23, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		elementsToMove = new glow.NodeList('span.elementToMove, span.elementToMove2'),
		returnNodeList;

	returnNodeList = elementsToMove.insertBefore(myNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	notEqual(returnNodeList, elementsToMove, 'New nodelist returned');
	equal(returnNodeList.length, 8, 'Clones included');
	
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

test('glow.NodeList#insertBefore empty lists', 5, function() {
	var emptyList = new glow.NodeList(),
		populatedList = new glow.NodeList('#innerDiv1');
	
	equal(emptyList.insertBefore('<span></span>').constructor, glow.NodeList, 'Empty nodelist');
	equal(populatedList.insertBefore(undefined)[0].innerHTML, 'D', 'Undefined param results in no change to nodelist');
	equal(populatedList.insertBefore(null)[0].innerHTML, 'D', 'Null param results in no change to nodelist');
	equal(populatedList.insertBefore(emptyList)[0].innerHTML, 'D', 'Empty nodelist param results in no change to nodelist');
	equal(new glow.NodeList('<span>hey</span>').insertBefore('<b></b>')[0].innerHTML, 'hey', 'Node with no parent');
});

test('glow.NodeList#insertBefore on detatched elements & non-elements', 13, function() {
	var myNodeList = new glow.NodeList('<div><div></div>Hello<div></div><!--comment--><div></div></div>'),
		childNodeList,
		returnNodeList;
	
	// get child nodes of nodelist, including text and comment
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	returnNodeList = new glow.NodeList('<span>Hello</span>').insertBefore(childNodeList);
	
	equal(returnNodeList.constructor, glow.NodeList, 'Nodelist returned');
	equal(returnNodeList.length, 5, 'Clones included');
	
	// refresh child nodelist
	childNodeList = new glow.NodeList( myNodeList[0].childNodes );
	
	equal(childNodeList[0].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[1].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[2].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[3].nodeName, '#text', 'Correct Node');
	equal(childNodeList[4].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[5].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList[6].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[7].nodeName, '#comment', 'Correct Node');
	equal(childNodeList[8].nodeName, 'SPAN', 'Correct Node');
	equal(childNodeList[9].nodeName, 'DIV', 'Correct Node');
	equal(childNodeList.length, 10, 'Correct length');
});