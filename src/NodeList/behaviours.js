Glow.provide(function(glow) {
	var NodeList = glow.NodeList,
		NodeListProto = NodeList.prototype,
		undefined;
	
	/**
		@name glow.NodeList#focusable
		@function
		@extends glow.ui.Behaviour
		@description Manage a focusable element, or group of elements
			This method is a shortcut to {@link glow.ui.Focusable} and requires
			the 'ui' package to be loaded.
			
			The first item in the NodeList is treated as the focusable's container.
			An error is thrown if the first item in the NodeList is not an element.
		
			This can be used to create a single focus point for a set
			of focusable elements. Eg, a menu can have a single tab stop,
			and the arrow keys can be used to cycle through menu items.
			
			This means the user doesn't have to tab through every item in the
			menu to get to the next set of focusable items.
			
			The FocusManager can also be used to make a element 'modal', ensuring
			focus doesn't go to elements outside it.
		
		@param {object} [opts] Options
			The same options as the {@link glow.ui.Focusable} constructor
			
		@returns {glow.ui.Focusable}
	*/
	NodeListProto.focusable = function(opts) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.NodeList#focusable expects 0 or 1 argument, not ' + arguments.length + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.NodeList#focusable expects object as "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		return new glow.ui.Focusable(this, opts);
	};
});