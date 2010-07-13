Brew.provide( function($) {
	$.bar = $.bar || {};
	
	$.order = $.order || [];
	$.order.push('bar');
	
	$.bar.bibble = function() {
	};
});


Brew.complete('bar', '1.0.0');