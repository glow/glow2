// start-source: widgets.js

/**
	@name glow.widgets
	@namespace
 */
		 
Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.widgets = glow.widgets || {};
		
		/**
			@name glow.widgets.Panel
			@constructor
		 */
		glow.widgets.Panel = function() {
		};
		
		glow.loaded(function() {
			glow.widgets.toArray = glow.lang.toArray;
		});
	}
});

// end-source: widgets.js