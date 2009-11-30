// First param is the library name, as defined in woosh.libs
woosh.addTests('jq-132', {
	// You can provide a test as a function:
	"Create 100 elements": function() {
		$('#testContainer').html( new Array(101).join('<div></div>') );
		// return something that may suggest the test ran properly
		return $('#testContainer div').length;
	},
	// You can provide tests as a Test, where the first param is number of loops
	"Create 100 elements looped": woosh.Test(100, function(test) {
		$('#testContainer').html( new Array(101).join('<div></div>') );
		return $('#testContainer div').length;
		// Here you can also change the result to something differnet than time
		// Eg, you could record and set the framerate of an animation, then:
		//
		// test.result(35, 'fps', true);
		//
		// The final param tells woosh to treat high numbers as best
	}),
	// woosh also lets you create async tests:
	"Create 100 elements async": woosh.AsyncTest(1, function(test) {
		var elmsLeftToCreate = 100,
			testContainer = $('#testContainer').empty();
		
		function createElm() {
			$('<div></div>').appendTo(testContainer);
			if (--elmsLeftToCreate) {
				setTimeout(createElm, 0);
			} else {
				// end the async test and pass in a return value
				test.endTest( $('#testContainer div').length );
			}
		}
		
		setTimeout(createElm, 0);
	})
});