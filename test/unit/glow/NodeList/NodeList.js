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

test('NodeList creation via array / collection / NodeList', 9, function() {
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