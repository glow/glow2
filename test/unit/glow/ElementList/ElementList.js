function byId(id) {
	return document.getElementById(id);
}

module('glow.ElementList creation');

test('Empty ElementList creation', 4, function() {
	equal(typeof glow.ElementList, 'function', 'glow.ElementList is function');
	
	var myElementList = new glow.ElementList();
	
	equal(myElementList.constructor, glow.ElementList, 'Correct constructor');
	ok(myElementList instanceof glow.ElementList, 'Correct instanceof');
	strictEqual(myElementList[0], undefined, 'No items in new list');
});

test('ElementList creation via selector', 4, function() {
	var myElementList = new glow.ElementList('#twoInnerDivs div, #twoInnerEms em:first-child');
	
	equal(myElementList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myElementList[1], byId('innerDiv2'), 'Item 1 as expected');
	equal(myElementList[2], byId('innerEm1'),  'Item 2 as expected');
	equal(myElementList.length, 3, 'Length populated');
});

test('ElementList creation via html element', 6, function() {
	var myElementList = new glow.ElementList( byId('innerDiv1') );
	
	equal(myElementList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myElementList.length, 1, 'Length populated');
	
	myElementList = new glow.ElementList(window);
	
	equal(myElementList[0], window, 'Item 0 as expected');
	equal(myElementList.length, 1, 'Length populated');
	
	myElementList = new glow.ElementList(document);
	
	equal(myElementList[0], document, 'Item 0 as expected');
	equal(myElementList.length, 1, 'Length populated');
});

test('ElementList creation via array / collection / ElementList', 9, function() {
	var elms = [ byId('innerDiv1'), byId('innerDiv2') ],
		myElementList = new glow.ElementList(elms);
	
	equal(myElementList[0], byId('innerDiv1'), 'Item 0 as expected (added via array)');
	equal(myElementList[1], byId('innerDiv2'), 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
	
	myElementList = new glow.ElementList( byId('twoInnerEms').getElementsByTagName('em') );
	
	equal(myElementList[0], byId('innerEm1'), 'Item 0 as expected (added via collection)');
	equal(myElementList[1], byId('innerEm2'), 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
	
	myElementList = new glow.ElementList(myElementList);
	
	equal(myElementList[0], byId('innerEm1'), 'Item 0 as expected (added via ElementList)');
	equal(myElementList[1], byId('innerEm2'), 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
});

test('ElementList creation via html string', 33, function() {
	var myElementList = new glow.ElementList('<div id="aNewNode1">test</div><div id="aNewNode2">test</div>');
	
	equal(myElementList[0] && myElementList[0].id, 'aNewNode1', 'Item 0 as expected (added via string)');
	equal(myElementList[1] && myElementList[1].id, 'aNewNode2', 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
	
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
		myElementList = new glow.ElementList(elmStr);
		equal(myElementList[0] && myElementList[0].nodeName.toLowerCase(), elmToTest, 'Item 0 as expected');
		equal(myElementList.length, 1, 'Length populated');
	}
	
	// some edge cases
	
	// IE7 likes to add tbodys when we don't want them, so we remove them
	// Let's make sure we're not removing them when we DO want them
	myElementList = new glow.ElementList('<caption></caption><tbody></tbody>');
	equal(myElementList[0] && myElementList[0].nodeName.toLowerCase(), 'caption', 'Item 0 as expected (caption and tbody combo)');
	equal(myElementList[1] && myElementList[1].nodeName.toLowerCase(), 'tbody', 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
	
	// do we get to keep text nodes?
	myElementList = new glow.ElementList('<span>Hello</span> World');
	equal(myElementList[0] && myElementList[0].nodeName.toLowerCase(), 'span', 'Item 0 as expected (span and text combo)');
	equal(myElementList[1] && myElementList[1].nodeValue, ' World', 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
});

module('glow.ElementList#push');
// ElementList uses this function so it's already been tested above

test('Multiple pushes', 7, function() {
	var myElementList = new glow.ElementList();
	
	strictEqual(myElementList[0], undefined, 'Item 0 as expected (empty ElementList)');
	equal(myElementList.length, 0, 'Length populated');
	
	myElementList.push('#innerDiv1');
	
	equal(myElementList[0], byId('innerDiv1'), 'Item 0 as expected (pushed innerDiv1 via selector)');
	equal(myElementList.length, 1, 'Length updated');
	
	myElementList.push( byId('innerDiv2') );
	
	equal(myElementList[0], byId('innerDiv1'), 'Item 0 as expected');
	equal(myElementList[1], byId('innerDiv2'), 'Item 1 as expected (pushed innerDiv2 as node)');
	equal(myElementList.length, 2, 'Length updated');
});