(function() {
	module('glow.ui.Overlay');
	
	test('Basic overlay creation', function() {			
        expect(4);	
		
		// set up
		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'myOverlay'});
		
		equal(typeof myOverlay, 'object', 'myOverlay exists' );
		equal(glow(".glowCSSVERSION-overlay").length, 1, 'A container element has been created for the overlay.');
		equal(glow(".overlay-content").length, 1, 'A content element has been created for the overlay.');
		equal(glow(".overlay-content")[0].id, 'div2', 'A container element has been created for the overlay.');
		
		// tear down
		myOverlay.content.removeClass('overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content).removeClass('overlay-content');
	});

 	test('Check inherited base methods', 1, function() {			
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2');
 		
 		equal(typeof myOverlay.disabled, 'function', 'The disabled function is inherited.');
 		
 		// tear down
 		myOverlay.content.removeClass('overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content).removeClass('overlay-content');
 	});
 	
 	test('Check API', function() {			
         expect(3);	
 		
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'testOverlay'});
 		
 		equal(typeof myOverlay.show, 'function', 'The show function is defined.');
 		equal(typeof myOverlay.setAnim, 'function', 'The setAnim function is defined.');
 		equal(typeof myOverlay.hide, 'function', 'The hide function is defined.');
 		
 		// tear down
 		myOverlay.content.removeClass('overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content);
 	});
 	
 	test('show and hide', function() {
 		var rval;
 		
        expect(12);	
 		
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'testOverlay'});
 		
 		// initially
 		equal(myOverlay._stateElm.hasClass('shown'), false, 'An unshown overlay does not have a shown class.');
 		equal(myOverlay.shown, false, 'An unshown overlay has a false `shown` property.');
 		
 		// show
 		rval = myOverlay.show();
 		equal(myOverlay, rval, 'The show method returns a reference to `this`.');
 		
 		equal(myOverlay._stateElm.hasClass('shown'), true, 'A shown overlay has a shown class.');
		equal(myOverlay.shown, true, 'An shown overlay has a true `shown` property.');
		
 		// hide
 		rval = myOverlay.hide();
 		equal(myOverlay, rval, 'The hide method returns a reference to `this`.');
 		
 		equal(myOverlay._stateElm.hasClass('shown'), false, 'An hidden overlay does not have a shown class.');
 		equal(myOverlay.shown, false, 'An hidden overlay has a false `shown` property.');
 		
 		//preventing show
 		myOverlay.on('show', function(e) { return false; });
 		
 		myOverlay.show();
 		
 		equal(myOverlay._stateElm.hasClass('shown'), false, 'An hidden overlay does not have a shown class.');
 		equal(myOverlay.shown, false, 'An hidden overlay has a false `shown` property.');
 		
 		// preventing hide
 		myOverlay._stateElm.addClass('shown');
 		myOverlay.shown = true;
 		
 		myOverlay.on('hide', function(e) { return false; });
 		
 		myOverlay.hide();
 		
 		equal(myOverlay._stateElm.hasClass('shown'), true, 'A shown overlay has a shown class.');
		equal(myOverlay.shown, true, 'An shown overlay has a true `shown` property.');
		
 		// tear down
 		myOverlay.content.removeClass('overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content);
 	});
 	
 })();