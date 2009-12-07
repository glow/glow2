Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		/**
			@name glow.dom
			@namespace
			@description Accessing and manipulating the DOM
		*/
		var dom = {};
		
		// export
		glow.dom = dom;
	}
});