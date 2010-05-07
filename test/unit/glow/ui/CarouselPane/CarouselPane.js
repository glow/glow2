module('ui/CarouselPane');

		
(function() {
	
	test('ui/CarouselPane:API', 16, function() {
		equal(typeof glow.ui, 'object', 'glow.ui is defined.');
		equal(typeof glow.ui.CarouselPane, 'function', 'glow.ui.CarouselPane is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype._init, 'function', 'glow.ui.CarouselPane#_init is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype._build, 'function', 'glow.ui.CarouselPane#_build is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype._bind, 'function', 'glow.ui.CarouselPane#_bind is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.destroy, 'function', 'glow.ui.CarouselPane#destroy is defined.');
 		
 		equal(typeof glow.ui.CarouselPane.prototype.updateUi, 'function', 'glow.ui.CarouselPane#updateUi is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.moveStart, 'function', 'glow.ui.CarouselPane#moveStart is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.moveStop, 'function', 'glow.ui.CarouselPane#moveStop is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.spotlightIndexes, 'function', 'glow.ui.CarouselPane#spotlightIndexes is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.spotlightItems, 'function', 'glow.ui.CarouselPane#spotlightItems is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.moveTo, 'function', 'glow.ui.CarouselPane#moveTo is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.moveBy, 'function', 'glow.ui.CarouselPane#moveBy is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.next, 'function', 'glow.ui.CarouselPane#next is defined.');
 		equal(typeof glow.ui.CarouselPane.prototype.prev, 'function', 'glow.ui.CarouselPane#prev is defined.');
 		
 		equal(typeof glow.ui.CarouselPane._getSpot, 'function', 'CarouselPane._getSpot is defined.');
 	});
 	
 	test('ui/CarouselPane:constructor', 1, function() {
 		var myCarouselPane = new glow.ui.CarouselPane();
 		equal(typeof myCarouselPane, 'object', 'glow.ui.CarouselPane instance is defined with no options.');
	});
	
	test('ui/CarouselPane:constructorOptions', 1, function() {
 		var myCarouselPane = new glow.ui.CarouselPane('dontExist');
 		equal(typeof myCarouselPane, 'object', 'glow.ui.CarouselPane instance is defined with invalid selector.');
	});
	
	test('ui/CarouselPane:noitems', 2, function() {
 		var myCarouselPane = new glow.ui.CarouselPane('#testElmsContainer0');
 		equal(typeof myCarouselPane.items, 'object', 'glow.ui.CarouselPane#items is defined when no elements.');
 		equal(myCarouselPane.items.length, 0, 'glow.ui.CarouselPane#items length is 0 when no elements.');
	});
	
	test('ui/CarouselPane:items', 2, function() {
 		var myCarouselPane = new glow.ui.CarouselPane('#testElmsContainer1');
 		equal(typeof myCarouselPane.items, 'object', 'glow.ui.CarouselPane#items is defined.');
 		equal(myCarouselPane.items.length, 2, 'glow.ui.CarouselPane#items length is 2 (doesnt include non-elements).');
	});
	
})();