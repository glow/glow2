function byId(id) {
	return document.getElementById(id);
}

module('glow.NodeList.attr');

test('API', 11, function() {
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
