(function() {
	module('glow.ui.Overlay');
	
	test('Basic overlay creation', function() {			
        expect(4);	
		
		// set up
		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'myOverlay'});
		
		equal(typeof myOverlay, 'object', 'myOverlay exists' );
		
		myOverlay.init();
		
		equal(glow(".glowCSSVERSION-overlay-container").length, 1, 'A container element has been created for the overlay.');
		equal(glow(".glowCSSVERSION-overlay-content").length, 1, 'A content element has been created for the overlay.');
		equal(glow(".glowCSSVERSION-overlay-content")[0].id, 'div2', 'A container element has been created for the overlay.');
		
		// tear down
		myOverlay.content.removeClass('glowCSSVERSION-overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content).removeClass('glowCSSVERSION-overlay-content');
	});

 	test('Check inherited base methods', function() {			
         expect(3);	
 		
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2');
 		
 		equal(typeof myOverlay.disable, 'function', 'The disable function is inherited.');
 		equal(typeof myOverlay.enable, 'function', 'The enable function is inherited.');
 		equal(typeof myOverlay.locale, 'function', 'The locale function is inherited.');
 		
 		// tear down
 		myOverlay.content.removeClass('glowCSSVERSION-overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content).removeClass('glowCSSVERSION-overlay-content');
 	});
 	
 	test('Check API', function() {			
         expect(3);	
 		
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'testOverlay'});
 		
 		equal(typeof myOverlay.show, 'function', 'The show function is defined.');
 		equal(typeof myOverlay.setAnim, 'function', 'The setAnim function is defined.');
 		equal(typeof myOverlay.hide, 'function', 'The hide function is defined.');
 		
 		// tear down
 		myOverlay.content.removeClass('glowCSSVERSION-overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content);
 	});
 	
 	test('show and hide', function() {
 		var rval;
 		
        expect(12);	
 		
 		// set up
 		var myOverlay = new glow.ui.Overlay('#div2', {addId: 'testOverlay'});
 		
 		// initially
 		equal(myOverlay.container.state.hasClass('visible'), false, 'An unshown overlay does not have a visible class.');
 		equal(myOverlay.visible, false, 'An unshown overlay has a false `visible` property.');
 		
 		// show
 		rval = myOverlay.show();
 		equal(myOverlay, rval, 'The show method returns a reference to `this`.');
 		
 		equal(myOverlay.container.state.hasClass('visible'), true, 'A shown overlay has a visible class.');
		equal(myOverlay.visible, true, 'An shown overlay has a true `visible` property.');
		
 		// hide
 		rval = myOverlay.hide();
 		equal(myOverlay, rval, 'The hide method returns a reference to `this`.');
 		
 		equal(myOverlay.container.state.hasClass('visible'), false, 'An hidden overlay does not have a visible class.');
 		equal(myOverlay.visible, false, 'An hidden overlay has a false `visible` property.');
 		
 		//preventing show
 		myOverlay.on('show', function(e) { return false; });
 		
 		myOverlay.show();
 		
 		equal(myOverlay.container.state.hasClass('visible'), false, 'An hidden overlay does not have a visible class.');
 		equal(myOverlay.visible, false, 'An hidden overlay has a false `visible` property.');
 		
 		// preventing hide
 		myOverlay.container.state.addClass('visible');
 		myOverlay.visible = true;
 		
 		myOverlay.on('hide', function(e) { return false; });
 		
 		myOverlay.hide();
 		
 		equal(myOverlay.container.state.hasClass('visible'), true, 'A shown overlay has a visible class.');
		equal(myOverlay.visible, true, 'An shown overlay has a true `visible` property.');
		
 		// tear down
 		myOverlay.content.removeClass('glowCSSVERSION-overlay-content');
 		myOverlay.container.replaceWith(myOverlay.content);
 	});
 	
 })();