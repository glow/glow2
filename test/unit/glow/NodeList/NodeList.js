function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList creation');

test('Empty NodeList creation', 4, function() {
	equal(typeof glow.NodeList, 'function', 'glow.NodeList is function');
	
	var myNodeList = new glow.NodeList();
	
	equal(myNodeList.constructor, glow.NodeList, 'Correct constructor');
	ok(myNodeList instanceof glow.NodeList, 'Correct instanceof');
	strictEqual(myNodeList[0], undefined, 'No items in new list');
});

test('NodeList creation via selector', 4, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em:first-child');
	
	equal(myNodeList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myNodeList[1], byId('innerDiv2'), 'Item 1 as expected');
	equal(myNodeList[2], byId('innerEm1'),  'Item 2 as expected');
	equal(myNodeList.length, 3, 'Length populated');
});

test('NodeList creation via html element', 6, function() {
	var myNodeList = new glow.NodeList( byId('innerDiv1') );
	
	equal(myNodeList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myNodeList.length, 1, 'Length populated');
	
	myNodeList = new glow.NodeList(window);
	
	equal(myNodeList[0], window, 'Item 0 as expected');
	equal(myNodeList.length, 1, 'Length populated');
	
	myNodeList = new glow.NodeList(document);
	
	equal(myNodeList[0], document, 'Item 0 as expected');
	equal(myNodeList.length, 1, 'Length populated');
});

test('NodeList creation via array / collection / NodeList', 12, function() {
	var elms = [ byId('innerDiv1'), byId('innerDiv2') ],
		myNodeList = new glow.NodeList(elms);
	
	equal(myNodeList[0], byId('innerDiv1'), 'Item 0 as expected (added via array)');
	equal(myNodeList[1], byId('innerDiv2'), 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
	
	myNodeList = new glow.NodeList( byId('twoInnerEms').getElementsByTagName('em') );
	
	equal(myNodeList[0], byId('innerEm1'), 'Item 0 as expected (added via collection)');
	equal(myNodeList[1], byId('innerEm2'), 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
	
	myNodeList = new glow.NodeList(myNodeList);
	
	equal(myNodeList[0], byId('innerEm1'), 'Item 0 as expected (added via NodeList)');
	equal(myNodeList[1], byId('innerEm2'), 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
	
	myNodeList = new glow.NodeList( byId('elmWithConstructor').getElementsByTagName('div') );
	ok(myNodeList.length, 'Elements found (trying to trip IE up with constructor)');
	
	(function(){
		myNodeList = new glow.NodeList(arguments);
	
		equal(myNodeList[0], byId('innerEm1'), 'Item 0 as expected (added via arguments)');
		equal(myNodeList.length, 1, 'Length populated');
	})( byId('innerEm1') );
});

test('NodeList creation via html string', 33, function() {
	var myNodeList = new glow.NodeList('<div id="aNewNode1">test</div><div id="aNewNode2">test</div>');
	
	equal(myNodeList[0] && myNodeList[0].id, 'aNewNode1', 'Item 0 as expected (added via string)');
	equal(myNodeList[1] && myNodeList[1].id, 'aNewNode2', 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
	
	var elmsToTest = [
			'caption', 'thead', 'th', 'tr', 'td', 'tfoot', 'option',
			'legend', 'script', 'style'
		],
		unaryElmsToTest = [
			'link', 'colgroup'
		],
		allElmsToTest = elmsToTest.concat(unaryElmsToTest),
		elmToTest,
		elmStr;
		
	for (var i = 0, len = allElmsToTest.length; i<len; i++) {
		elmToTest = allElmsToTest[i];
		
		if (i < elmsToTest.length) {
			elmStr = '<' + elmToTest + '></' + elmToTest + '>';
		}
		else {
			elmStr = '<' + elmToTest + ' />';
		}
		myNodeList = new glow.NodeList(elmStr);
		equal(myNodeList[0] && myNodeList[0].nodeName.toLowerCase(), elmToTest, 'Item 0 as expected');
		equal(myNodeList.length, 1, 'Length populated');
	}
	
	// some edge cases
	
	// IE7 likes to add tbodys when we don't want them, so we remove them
	// Let's make sure we're not removing them when we DO want them
	myNodeList = new glow.NodeList('<caption></caption><tbody></tbody>');
	equal(myNodeList[0] && myNodeList[0].nodeName.toLowerCase(), 'caption', 'Item 0 as expected (caption and tbody combo)');
	equal(myNodeList[1] && myNodeList[1].nodeName.toLowerCase(), 'tbody', 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
	
	// do we get to keep text nodes?
	myNodeList = new glow.NodeList('<span>Hello</span> World');
	equal(myNodeList[0] && myNodeList[0].nodeName.toLowerCase(), 'span', 'Item 0 as expected (span and text combo)');
	equal(myNodeList[1] && myNodeList[1].nodeValue, ' World', 'Item 1 as expected');
	equal(myNodeList.length, 2, 'Length populated');
});

module('glow.NodeList#push');
// NodeList uses this function so it's already been tested above

test('Multiple pushes', 7, function() {
	var myNodeList = new glow.NodeList();
	
	strictEqual(myNodeList[0], undefined, 'Item 0 as expected (empty NodeList)');
	equal(myNodeList.length, 0, 'Length populated');
	
	myNodeList.push('#innerDiv1');
	
	equal(myNodeList[0], byId('innerDiv1'), 'Item 0 as expected (pushed innerDiv1 via selector)');
	equal(myNodeList.length, 1, 'Length updated');
	
	myNodeList.push( byId('innerDiv2') );
	
	equal(myNodeList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myNodeList[1], byId('innerDiv2'), 'Item 1 as expected (pushed innerDiv2 as node)');
	equal(myNodeList.length, 2, 'Length updated');
});

module('glow.NodeList#eq');

test('glow.NodeList#eq with NodeList arg', 8, function() {
	var nodeListOne = new glow.NodeList(),
		nodeListTwo = new glow.NodeList();
	
	equal(typeof nodeListOne.eq, 'function', 'glow.NodeList#eq is function');
	
	strictEqual(nodeListOne.eq(nodeListTwo), true, 'Empty nodelists are equal');
	
	nodeListOne = new glow.NodeList('#innerDiv1, #innerDiv2');
	nodeListTwo = new glow.NodeList( byId('innerDiv1') ).push( byId('innerDiv2') );
	
	strictEqual(nodeListOne.eq(nodeListTwo), true, 'Populated nodeslists are equal');
	
	nodeListOne = new glow.NodeList('#innerDiv1');
	nodeListTwo = new glow.NodeList( byId('innerDiv1') ).push( byId('innerDiv2') );
	
	strictEqual(nodeListOne.eq(nodeListTwo), false, 'NodeLists that share some elements are not equal');
	strictEqual(nodeListTwo.eq(nodeListOne), false, 'NodeLists that share some elements are not equal (reversed)');
	
	nodeListOne = new glow.NodeList('#innerDiv1, #innerEm1');
	nodeListTwo = new glow.NodeList('#innerDiv1, #innerEm2');
	
	strictEqual(nodeListOne.eq(nodeListTwo), false, 'Unequal lists with same length');
	
	nodeListOne = new glow.NodeList('#innerDiv1');
	nodeListTwo = new glow.NodeList();
	
	strictEqual(nodeListOne.eq(nodeListTwo), false, 'Populated NodeLists are not equal to empty ones');
	strictEqual(nodeListTwo.eq(nodeListOne), false, 'Empty NodeLists are not equal to populated ones');
});

test('glow.NodeList#eq with NodeList arg', 4, function() {
	var myNodeList = new glow.NodeList('#innerDiv1');
	
	strictEqual(myNodeList.eq( byId('innerDiv1') ), true, 'NodeList equals same node');
	strictEqual(myNodeList.eq( byId('innerDiv2') ), false, 'NodeList not equal to different node');
	
	myNodeList = new glow.NodeList('#innerDiv1, #innerDiv2');
	strictEqual(myNodeList.eq( [byId('innerDiv1'), byId('innerDiv2')] ), true, 'NodeList equals array of equal nodes');
	strictEqual(myNodeList.eq( [byId('innerDiv1'), byId('innerEm2')] ), false, 'NodeList not equal to array of unequal nodes');
});

module('glow.NodeList#slice');

test('glow.NodeList#slice', 16, function() {
	// nodelist of 4 elements
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	
	equal(typeof myNodeList.slice, 'function', 'glow.NodeList#slice is function');
	
	equal(myNodeList.slice(0).constructor, glow.NodeList, 'slice returns NodeList');
	ok(myNodeList.slice(0) != myNodeList, 'slice returns new NodeList');
	ok(myNodeList.slice(0).eq(myNodeList), 'slice(0) has no effect');
	
	ok(myNodeList.slice(0, 0).eq( new glow.NodeList() ), 'slice(0, 0) returns empty NodeList');
	ok(myNodeList.slice(1, 1).eq( new glow.NodeList() ), 'slice(1, 1) returns empty NodeList');
	ok(myNodeList.slice(-1, -1).eq( new glow.NodeList() ), 'slice(-1, -1) returns empty NodeList');
	
	ok(myNodeList.slice(1).eq( [ myNodeList[1], myNodeList[2], myNodeList[3] ] ), 'slice(1) correct');
	ok(myNodeList.slice(2).eq( [ myNodeList[2], myNodeList[3] ] ), 'slice(2) correct');
	ok(myNodeList.slice(-1).eq( [ myNodeList[3] ] ), 'slice(-1) correct');
	ok(myNodeList.slice(-2).eq( [ myNodeList[2], myNodeList[3] ] ), 'slice(-2) correct');
	ok(myNodeList.slice(1, 2).eq( [ myNodeList[1] ] ), 'slice(1, 2) correct');
	ok(myNodeList.slice(1, 3).eq( [ myNodeList[1], myNodeList[2] ] ), 'slice(1, 3) correct');
	ok(myNodeList.slice(-3, -1).eq( [ myNodeList[1], myNodeList[2] ] ), 'slice(-3, -1) correct');
	ok(myNodeList.slice(1, -1).eq( [ myNodeList[1], myNodeList[2] ] ), 'slice(1, -1) correct');
	ok(myNodeList.slice(-3, 3).eq( [ myNodeList[1], myNodeList[2] ] ), 'slice(-3, 3) correct');
});

module('glow.NodeList#sort');

// these tests are minimal when a function isn't given as Sizzle does all the hard work, and has its own tests
test('glow.NodeList#sort', 4, function() {
	var myNodeList = new glow.NodeList( [ byId('innerEm2'), byId('innerEm1'), byId('innerDiv2'), byId('innerDiv1') ] );
	
	equal(typeof myNodeList.sort, 'function', 'glow.NodeList#sort is function');
	
	ok(myNodeList.sort().eq( [ byId('innerDiv1'), byId('innerDiv2'), byId('innerEm1'), byId('innerEm2') ] ), 'sort without args orders by document order');
	ok(myNodeList.sort() != myNodeList, 'sort returns new NodeList');
	
	myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	
	function lex(elementA, elementB) {
		return elementA.innerHTML < elementB.innerHTML ? -1 : 1;
	}
	
	ok(myNodeList.sort(lex).eq( [ byId('innerEm2'), byId('innerEm1'), byId('innerDiv2'), byId('innerDiv1') ] ), 'sort with function');
	
});

module('glow.NodeList#item');

test('glow.NodeList#item', 9, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em');
	
	equal(typeof myNodeList.item, 'function', 'glow.NodeList#item is function');
	
	equal(myNodeList.item(0).constructor, glow.NodeList, 'returns NodeList');
	notEqual(myNodeList.item(0), myNodeList, 'returns new NodeList');
	
	ok(myNodeList.item(0).eq( myNodeList[0] ), 'item(0)');
	ok(myNodeList.item(1).eq( myNodeList[1] ), 'item(1)');
	ok(myNodeList.item(-1).eq( myNodeList[3] ), 'item(-1)');
	ok(myNodeList.item(-2).eq( myNodeList[2] ), 'item(-2)');
	ok(myNodeList.item(300).eq( [] ), 'item(300) returns empty list');
	ok(myNodeList.item(-300).eq( [] ), 'item(-300) returns empty list');
});

module('glow.NodeList#each');

test('glow.NodeList#each', 3, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		log = [];
	
	equal(typeof myNodeList.each, 'function', 'glow.NodeList#each is function');
	equal(myNodeList.each( function(){} ), myNodeList, 'returns same nodelist');
	
	myNodeList.each(function(i, list) {
		log.push( [this.innerHTML, i, list == myNodeList] );
	});
	
	deepEqual(log, [
		['D', 0, true],
		['C', 1, true],
		['B', 2, true],
		['A', 3, true]
	], 'each called correct number of times with correct params')
});

test('breaking out of the loop', 2, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		log = [],
		returnedNodeList;
	
	returnedNodeList = myNodeList.each(function(i, list) {
		log.push( [this.innerHTML, i, list == myNodeList] );
		if (i == 1) {
			return false;
		}
	});
	
	equal(returnedNodeList, myNodeList, 'returns same nodelist');
	
	deepEqual(log, [
		['D', 0, true],
		['C', 1, true]
	], 'was able to break out of the each loop')
});

module('glow.NodeList#filter');

test('function arg', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		filterLog = [],
		eachLog = [],
		returnedNodeList;
	
	equal(typeof myNodeList.filter, 'function', 'glow.NodeList#filter is function');
	equal(myNodeList.filter( function(){} ).constructor, glow.NodeList, 'returns nodelist');
	notEqual(myNodeList.filter( function(){} ), myNodeList, 'returns new nodelist');
	ok(myNodeList.filter( function(){} ).eq([]), 'empty filter returns empty nodelist');
	
	myNodeList.each(function(i, list) {
		eachLog.push( [this.innerHTML, i, list == myNodeList] );
	});
	
	returnedNodeList = myNodeList.filter(function(i, list) {
		filterLog.push( [this.innerHTML, i, list == myNodeList] );
		// filter out elements without innerHTML of C or B
		return /^[CB]$/.test(this.innerHTML);
	});
	
	deepEqual(eachLog, filterLog, 'Same loop & args as each()');
	
	ok(returnedNodeList.eq('#innerDiv2, #innerEm1'), 'Filtered the nodes');
});

test('string arg', 6, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		returnedNodeList;
	
	equal(myNodeList.filter('em').constructor, glow.NodeList, 'returns nodelist');
	notEqual(myNodeList.filter('em'), myNodeList, 'returns new nodelist');
	ok(myNodeList.filter('*').eq(myNodeList), '* returns same nodes');
	ok(myNodeList.filter('').eq([]), 'empty string returns no nodes');
	
	returnedNodeList = myNodeList.filter('em');
	
	ok(returnedNodeList.eq('#innerEm1, #innerEm2'), 'Filtered the nodes');
	
	myNodeList = new glow.NodeList( byId('elmWithTextNodes').childNodes );
	ok(myNodeList.filter('span').eq( byId('elmWithTextNodes').childNodes[1] ), 'Copes with text nodes');
});

module('glow.NodeList#is');

// these tests are simple because Sizzle does most of the work, they have their own tests
test('glow.NodeList#is', 8, function() {
	var myNodeList = new glow.NodeList('#twoInnerDivs div, #twoInnerEms em'),
		emptyNodeList = new glow.NodeList();
	
	equal(typeof myNodeList.is, 'function', 'glow.NodeList#is is function');
	
	strictEqual(myNodeList.is('#innerDiv1'), true, 'Picks up ID on first item');
	strictEqual(myNodeList.is('#innerEm1'), false, 'Only operates on first item');
	strictEqual(myNodeList.item(0).is('div'), true, 'Works with tag name');
	strictEqual(myNodeList.item(0).is('em'), false, 'Works with tag name');
	strictEqual(myNodeList.item(1).is('#twoInnerDivs div'), true, 'Works with deep searching');
	strictEqual(myNodeList.item(1).is('#twoInnerEms div'), false, 'Works with deep searching');
	strictEqual(emptyNodeList.is('div'), false, 'Handles empty NodeLists');
});