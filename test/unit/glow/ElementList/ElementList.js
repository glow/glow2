function byId(id) {
	return document.getElementById(id);
}

module('ElementList creation');

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

test('ElementList creation via html string', 3, function() {
	var myElementList = new glow.ElementList('<div id="stringDiv1"></div><div id="stringDiv2"></div>');
	
	equal(myElementList[0] && myElementList[0].id, 'stringDiv1', 'Item 0 as expected (added via string)');
	equal(myElementList[1] && myElementList[1].id, 'stringDiv2', 'Item 1 as expected');
	equal(myElementList.length, 2, 'Length populated');
});