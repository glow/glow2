/**
	@name brew
	@namespace
	@version @VERSION@
	@description A stub used by the BBC Brew loader for the jQuery library.
	@see http://jquery.com/
*/
var Brew;
(function(){
	if (!Brew) { // loading packages via user SCRIPT tags?
		var win = window,
			$;

		Brew = {
			provide: function(f) {
				f($);
			},
			complete: function(n, version) {
				$._bVersion = version;
			}
		};

		$ = win.$ = win.jQuery = function(selector, context) {
			return new $.fn.init(selector, context);
		};
		$.UID = 'brew' + Math.floor(Math.random() * (1<<30));
	}
})();



Brew.provide(function(brew) {
	/*!debug*/
	/*!include:glowbug.js*/
	if (typeof glowbug != 'undefined') { brew.debug = glowbug; }
	/*gubed!*/
});