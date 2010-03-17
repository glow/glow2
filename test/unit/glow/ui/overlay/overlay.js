module('glow.ui.Overlay');
	
      
	test('Basic overlay creation', function() {			
        expect(2);	
				
		var myOverlay = new glow.ui.Overlay('<div>Hello world!</div>');
							
		ok( (myOverlay), 'myOverlay exists' );

        ok(glow("#glow-ui-overlay-container").length == 1, 'A container element has been created')


	});

	test('Check inherited base methods', function() {			
        expect(1);	
				
		var myOverlay = new glow.ui.Overlay('<div>Hello world!</div>');
							
		ok( (myOverlay), 'myOverlay exists' );

        myOverlay.disable();

        myOverlay.enabled();

        myOverlay.locale('pirate');

      

	});