/**
	@name glow
	@namespace
	@version @VERSION@
	@description The glow library namespace
		The library can also be used as a function, which is a shortcut to
		{@link glow.NodeList}.
		
	@example
		var links = glow('a');
		// is the same as
		var links = new glow.NodeList('a');
*/
var Glow;
(function(){
	if (!Glow) { // loading packages via user SCRIPT tags?
		var win = window,
			$;

		Glow = {
			provide: function(f) {
				f($);
			},
			complete: function(n, version) {
				$._gVersion = version;
			}
		};

		$ = win.$ = win.jQuery = function(selector, context) {
			return new $.fn.init(selector, context);
		};
		$.UID = 'glow' + Math.floor(Math.random() * (1<<30));
	}
})();



Glow.provide(function(glow) {
	/*!debug*/
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { glow.debug = glowbug; }
	/*gubed!*/
});