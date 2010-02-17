if (!window.Glow) { // loading packages via user SCRIPT tags?
	window.Glow = {
		provide: function(f) {
			f(glow);
		},
		complete: function(n, version) {
			glow.version = version;
		}
	};
	
	window.glow = function() {
		return glow._coreFunc.apply(this, arguments);
	};
	
	glow.load = function() {
		throw new Error('Method load() is not available without glow.js');
	}
}


Glow.provide(function(glow) {
	/*!debug*/
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
	/*gubed!*/
	
	/**
		@name glow._coreFunc
		@private
		@function
		@description This function is called when glow is called as a function
			The implementation of glow(blah) is defined here.
			
		@param {Object} Argument passed to new nodelist
		
		@returns {glow.NodeList}
	*/
	glow._coreFunc = function(nodeListContents) {
		return new glow.NodeList(nodeListContents);
	}
});
