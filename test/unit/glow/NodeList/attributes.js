function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList.attr');

test('glow.NodeList.attr API', 11, function() {
	ok(glow.NodeList.prototype, 'glow.NodeList.prototype is defined.');
	
	equal(typeof glow.NodeList.prototype.addClass, 'function', 'glow.NodeList.prototye.addClass is a function.');
	equal(typeof glow.NodeList.prototype.attr, 'function', 'glow.NodeList.prototye.attr is a function.');
	equal(typeof glow.NodeList.prototype.data, 'function', 'glow.NodeList.prototye.data is a function.');
	equal(typeof glow.NodeList.prototype.hasAttr, 'function', 'glow.NodeList.prototye.hasAttr is a function.');
	equal(typeof glow.NodeList.prototype.hasClass, 'function', 'glow.NodeList.prototye.hasClass is a function.');
	equal(typeof glow.NodeList.prototype.prop, 'function', 'glow.NodeList.prototye.prop is a function.');
	equal(typeof glow.NodeList.prototype.removeAttr, 'function', 'glow.NodeList.prototye.removeAttr is a function.');
	equal(typeof glow.NodeList.prototype.removeClass, 'function', 'glow.NodeList.prototye.removeClass is a function.');
	equal(typeof glow.NodeList.prototype.removeData, 'function', 'glow.NodeList.prototye.removeData is a function.');
	equal(typeof glow.NodeList.prototype.toggleClass, 'function', 'glow.NodeList.prototye.toggleClass is a function.');
});

test('glow.NodeList.attr addClass', 4, function() {
	var stash = document.getElementById('testElmsContainer').innerHTML;
	
	var myNodeList = new glow.NodeList('<p id="p1"></p>text<span class="existingClass"></span><!-- comment -->');
	
	myNodeList.addClass('newClass');
	
	equal(myNodeList[0].className, 'newClass', 'First element, with no class, gets new class.');
	equal(myNodeList[1].className, undefined, 'Text does not get new class.');
	equal(myNodeList[2].className, 'existingClass newClass', 'Second element, with an existing class, gets new class added.');
	equal(myNodeList[3].className, undefined, 'Comment does not get new class.');
	
	document.getElementById('testElmsContainer').innerHTML = stash;
});
