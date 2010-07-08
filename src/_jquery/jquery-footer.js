Glow.provide(function(lib) {
	// copy jQuery properties to our lib
	$.extend( lib, $.noConflict(true) );
});