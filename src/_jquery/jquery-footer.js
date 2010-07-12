Brew.provide(function(stub) {
	// copy jQuery properties to our stub
	$.extend( stub, $.noConflict(true) );
});