// Ideas:
// Restricting tests to certain libraries / tests
// Graphing with error margins
// Save previous result

// Namespace
(function(){
	/**
	@name woosh
	@namespace
	@description For creating speed tests
	*/
	var woosh = {};
	
	window.woosh = woosh;
})();

// woosh.libs
(function(){
	/**
	@name woosh.libs
	@type {Object}
	@description Libraries available to the system.
		Feel free to add additional libraries. Values are arrays of
		files that need to be included to use the library.
		
		Paths must be relative to whoosh.js.
	*/
	var libs = {
		'dojo-132': ['libs/dojo-132.js'],
		'jq-132': ['libs/jq-132.js'],
		'moo-122': ['libs/moo-122.js'],
		'proto-1603': ['libs/proto-1603.js'],
		'yui-270': ['libs/yui-270.js'],
		'yui-300': ['libs/yui-300.js'],
		'puredom': ['libs/puredom.js'],
		'glow-170': ['libs/glow-170/core/core.debug.js', 'libs/glow-170/widgets/widgets.debug.js', 'libs/glow-170/widgets/widgets.debug.css']
	}
	
	window.woosh.libs = libs;
})();

// woosh._root
(function(){
	/**
	@name woosh._root
	@type {String}
	@private
	@description Path to woosh repo root
	*/
	var scripts = document.getElementsByTagName('script'),
		lastScript = scripts[scripts.length - 1];
		
	// eval any contents of the script
	try {
		eval(lastScript.innerHTML);
	} catch(e) {}
	
	window.woosh._root = lastScript.src.replace('woosh.js', '');
})();

// woosh._utils
(function(){
	/**
	@name woosh._utils
	@namespace
	@private
	@description Some basic util functions
	*/
	var utils = {
		/**
		@name woosh._utils.urlEncode
		@function
		@description Converts an object into a query string
		
		@returns {Object}
		
		@example
			woosh._utils.urlEncode({
				hello: 'world',
				foo: ['bar', 'bunz']
			});
			
			// returns 'hello=world&foo=bar&foo=bunz'
		*/
		urlEncode: function (obj) {
			var parts = [],
				partsLen = 0,
				val, i, len;
		
			for (var key in obj) {
				val = obj[key];
				
				if (typeof val == 'string') {
					val = [val];
				}
				for(i = 0, len = val.length; i < len; i++) {
					parts[partsLen++] = key + '=' + encodeURIComponent( val[i] );
				}
			}
			
			return parts.join('&');
		},
		/**
		@name woosh._utils.urlDecode
		@function
		@description Converts a urlencoded string into an object of arrays
		
		@returns {Object}
		
		@example
			woosh._utils.urlDecode('hello=world&foo=bar&foo=bunz');
			
			// returns:
			// {
			//    hello: ['world'],
			//    foo: ['bar', 'bunz']
			// }
		*/
		urlDecode: function (text) {
			var result = {},
				keyValues = text.split(/[&;]/);
		
			var thisPair, key, value;
		
			for(var i = 0, len = keyValues.length; i < len; i++) {
				thisPair = keyValues[i].split('=');
				key   = decodeURIComponent( thisPair[0] );
				value = decodeURIComponent( thisPair[1] );
				
				if (!key) {
					continue;
				}
				else if ( result[key] ) {
					result[key].push(value);
				}
				else {
					result[key] = [value];
				}
			}
			return result;
		},
		loadAssets: function(/* files */) {
			var files = arguments;
			if (files) {
				for (var i = 0, len = files.length; i < len; i++) {
					if (files[i].slice(-3) == '.js') {
						document.write('<script type="text/javascript" src="' + woosh._root + files[i] + '"></scr' + 'ipt>');
					}
					else if (files[i].slice(-4) == '.css') {
						//document.write('<link rel="stylesheet" type="text/css" src="' + woosh._root + files[i] + '">');
						document.write('<style type="text/css">@import "' + woosh._root + files[i] + '";</style>')
					}
				}
			}
		},
		/**
		@name woosh._utils.constructorName
		@description Gets the constructor name for a function
		
		@param {Object} obj Object to get the constructor name for
		
		@returns {string} Constructor name
		*/
		constructorName: function(obj) {
			if (obj.constructor.name) {
				return obj.constructor.name;
			} else {
				var constructorStr = obj.constructor.toString();
				return constructorStr.slice( constructorStr.indexOf('function ') + 9, constructorStr.indexOf('(') );
			}
		},
		/**
		@name woosh._utils.extend
		@function
		@description Copies the prototype of one object to another.
			The 'subclass' can also access the 'base class' via subclass.base
			
		@param {Function} sub Class which inherits properties.
		@param {Function} base Class to inherit from.
		@param {Object} additionalProperties An object of properties and methods to add to the subclass.
		*/
		extend: function(sub, base, additionalProperties) {
			var f = function () {}, p;
			f.prototype = base.prototype;
			p = new f();
			sub.prototype = p;
			p.constructor = sub;
			sub.base = base;
			if (additionalProperties) {
				woosh._utils.apply(sub.prototype, additionalProperties);
			}
		},
		/**
		@name woosh._utils.apply
		@function
		@description Copies properties from one object to another

		@param {Object} destination Destination object
		@param {Object} source Properties of this object will be copied onto the destination

		@returns {Object}
		*/
		apply: function(destination, source) {
			for (var i in source) {
				if ( source.hasOwnProperty(i) ) {
					destination[i] = source[i];
				}
			}
			return destination;
		}
	}
	
	window.woosh._utils = utils;
})();

// woosh.Test
(function() {
	/**
	@name woosh.Test
	@constructor
	@description A test to be run
	
	@param {number} loopCount Number of times to run the test
		Tests that run longer have less margin for error.
	
	@param {Function} test The test to run.
		The instance of {@link woosh.Test} will be the first param
		
	@example
		woosh.Test(1000, function() {
			// do stuff
		});
	*/
	function Test(loopCount, testFunc) {
		if ( !(this instanceof Test) ) {
			return new Test(loopCount, testFunc);
		}
		
		this._loopCount = loopCount;
		this._testFunc  = testFunc;
	}
	
	var undefined;
	
	woosh._utils.extend(Test, {}, {
		// what kind of unit should the results be measured in
		_unit: 'ms',
		// what is the result?
		_result: undefined,
		// are high results good?
		_highestIsBest: false,
		// errors are held
		_error: null,
		// the function containing the test actions
		_testFunc: null,
		// times to loop testFunc
		_loopCount: null,
		// start the test running, onComplete (optional) called when all itterations have ran
		_run: function(onComplete) {
			try {
				var i = this._loopCount,
					returnVal,
					duration,
					start = new Date();
			
				while (i--) {
					returnVal = this._testFunc(this);
				}
				
				duration = new Date() - start;
				this._result = this._result || duration;
			} catch (e) {
				this._error = e;
			}
			this._returnVal = returnVal;
			onComplete && onComplete();
		},
		/**
		@name woosh.Test#result
		@function
		@description Change the result of the test.
			By default, the result is the time the test took to run in milliseconds,
			however, you may want your test to measure something else like
			frames-per-second. You can achieve that using this method.
		
		@param {Number} result The result value as a number
		@param {String} [unit='ms'] The unit for the result
		@param {Boolean} [highestIsBest=false] Treat high numbers as better than low numbers?

		@returns {woosh.Test}
		
		@example
			woosh.Test(loopCount, function() {				
				// set the result manually to a different set of units
				this.result(123, 'fps', true);
				
				return // a value (this will be checked against the results of other tests)
			})
		*/
		result: function(result, unit, highestIsBest) {
			this._result = result - 0;
			this._unit = unit || this._unit;
			this._highestIsBest = !!highestIsBest;
			return this;
		}
	});
	
	window.woosh.Test = Test;
})();

// woosh.AsyncTest
(function() {
	/**
	@name woosh.AsyncTest
	@constructor
	@extends woosh.Test
	@description Like {@link woosh.Test}, but allows async tests.
		This test waits for {@link woosh.AsyncTest#endTest} to be
		called before the test is complete.
	
	@param {number} loopCount Number of times to run the test
		Tests that run longer have less margin for error.
	
	@param {Function} test The test to run.
		The instance of {@link woosh.AsyncTest} will be the first param
		
	@example
		woosh.AsyncTest(1000, function() {
			// do stuff
			
			this.endTest(returnVal);
		});
	*/
	function AsyncTest(loopCount, testFunc) {
		if ( !(this instanceof AsyncTest) ) {
			return new AsyncTest(loopCount, testFunc);
		}
		
		woosh.Test.apply(this, arguments);
		this._super = woosh.Test.prototype;
	}
	
	woosh._utils.extend(AsyncTest, woosh.Test);
	var asyncTestProto = AsyncTest.prototype;

	/**
	@name woosh.AsyncTest#endTest
	@function
	@description Must be called within an async test to end the test
	
	@param {Object} returnVal The value to return.
		In sync tests you can simply return a value, but here you must provide
		the return value here.
	*/
	asyncTestProto.endTest = function(returnVal) {
		this._returnVal = returnVal;
		this._onEndTest();
	};
	
	(function(){
		var oldErrorListener;
		
		function complete(test, onComplete) {
			window.onerror = test._oldErrorListener;
			test._onEndTest = function() {};
			onComplete();
		};
		
		// run the test in an async way. onComplete is called when test is complete
		asyncTestProto._run = function(onComplete) {
			try {
				var i = this._loopCount,
					testFunc = this._testFunc,
					test = this,
					start;
				
				this._oldErrorListener = window.onerror;
				
				// not using addEventListener / attachEvent, we get more information (msg) this way:
				window.onerror = function(msg) {
					if (test._oldErrorListener) {
						test._oldErrorListener.apply(this, arguments);
					}
					test._error = new Error(msg);
					complete(test, onComplete);
				}
				
				this._onEndTest = function() {
					if (--i) {
						test._testFunc(test);
					} else {
						test._result = test._result || ( new Date() - start );
						complete(test, onComplete);
					}
				}
				
				start = new Date();
				test._testFunc(test);
			} catch (e) {
				this._error = e;
				complete(test, onComplete);
			}
		};
	})();
	
	// overidden by woosh.AsyncTest#_run
	asyncTestProto._onEndTest = function() {};
	
	// export
	window.woosh.AsyncTest = AsyncTest;
})();

// woosh._LibraryTests & woosh.addTests
(function() {
	/**
	@name woosh._LibraryTests
	@constructor
	@private
	@description A set of tests to run against a library
	
	@param {Object} tests Obj of functions / woosh.Test instances
		Keys beginning $ have special meaning.
		
	*/
	
	function LibraryTests(tests) {
		/**
		@name woosh._LibraryTests#tests
		@type {Object}
		@description Tests keyed by name
		*/
		this.tests = {};
		/**
		@name woosh._LibraryTests#testNames
		@type {String[]}
		@description Array of test names
		*/
		this.testNames = [];
		/**
		@name woosh._LibraryTests#_prevTestName
		@private
		@type {String}
		@description Name of the previously run test
		*/
		this._prevTestName = undefined;
		
		// populate this.tests, converting functions into woosh.Test instances
		for (var testName in tests) {
			if ( tests.hasOwnProperty(testName) ) {
				if (testName.charAt(0) == '$') {
					switch ( testName.slice(1) ) {
						case 'preTest':
							this.preTest = tests[testName];
							break;
					}
				}
				else {
					this.tests[testName] = (typeof tests[testName] == 'function') ?
						new woosh.Test(1, tests[testName]) :
						tests[testName];
						
					this.testNames.push(testName);
				}
			}
		}
	}
	
	LibraryTests.prototype = {
		/**
		@name woosh._LibraryTests#preTest
		@function
		@description Called before each test.
			Overridden by constructor 'tests' param, used to
			teardown / prepare of next test.
			
		@param {String} lastTestName Name of last test.
			Will be undefined for first test.
			
		@param {String} nextTestName Name of next test.
		*/
		preTest: function(lastTestName, nextTestName) {},
		/**
		@name woosh._LibraryTests#run
		@function
		@description Run a particular test.
			{@link woosh._LibraryTests#preTest} will be called before the test.
			
		@param {String} testName Name of test to run.
		@param {Function} onTestComplete Function to run when test complete
			Test name is passed as the 1st param.
			Test is passed in as the 2nd param.
			
		*/
		run: function(testName, onTestComplete) {
			var test = this.tests[testName],
				libraryTests = this;
			
			this.preTest(this._prevTestName, testName);
			test._run(function() {
				libraryTests._prevTestName = testName;
				// signal the test is complete
				onTestComplete(testName, test);
			});
		}
	};
	
	/**
	@name woosh.addTests
	@function
	@description Add a set of tests for a particular framework
	
	@param {string} libraryName Library to include for these tests.
		String must be a property name within {@link woosh.libs})
	
	@param {Object} Object of tests to add for this framework.
		Tests can either be functions, or instances of {@link woosh.Test} /
		{@link woosh.AsyncTest}. The instance of the test will be passed
		in as the first param of the function.
		
		Keys beginning "$" are considered special:
		
		'$preTest': This will be called before each test,
					2 params will be passed in, the name of
					the previous test and the name of the next. If your test
					is looping, $preTest will still only run once.
		
	@example
		woosh.addTests("glow-170", {
			'$preTest': function(prevTest, nextTest) {
				resetTestHtml();
			},
			'mySimpleTest': function() {
				// do some stuff
				return // a value (this will be checked against the results of other tests)
			},
			'myComplexTest': woosh.Test(loopCount, function(test) {				
				// set the result manually to a different set of units
				test.result(123, 'fps', true);
				
				return // a value (this will be checked against the results of other tests)
			}),
			'myAsyncTest': woosh.AsyncTest(loopCount, function(test) {				
				// do something async
				
				// return the result (this will be checked against the results of other tests)
				test.endTest(returnVal);
			})
		});
	*/
	
	function addTests(libraryName, tests) {
		if (woosh._pageMode == 'conducting') {
			if (libsAdded[libraryName]) {
				throw new Error('A test for "' + libraryName + '" has already been added.');
			}
			libsToConduct.push(libraryName);
			libsAdded[libraryName] = true;
		}
		else if (woosh._pageMode == 'testing') {
			// only create the test set if we're testing this library in this frame
			if (libraryName == woosh._libraryToTest) {
				if (woosh._libraryTests) {
					throw new Error('Library tests already been defined for this page');
				}
				/**
				@name woosh._libraryTests
				@type {woosh._LibraryTests}
				@description The library tests for this frame to test
				*/
				woosh._libraryTests = new LibraryTests(tests);
			}
		}
		return woosh;
	}
	/**
	@name woosh._libsToConduct
	@type {String[]}
	@description Library names that should be conducted when
		{@link woosh._pageMode} is 'conducting'
	*/
	var libsToConduct = [],
		libsAdded = {};
	
	
	window.woosh.addTests = addTests;
	window.woosh._LibraryTests = LibraryTests;
	window.woosh._libsToConduct = libsToConduct;
})();

// woosh._TestSetRunner
(function() {
	var undefined;
	
	/**
	@name woosh._TestSetRunner
	@constructor
	@private
	@description Helper to run and analyse a set of tests of the same name (but against different libraries)
	
	@param {Object} libraryTests Obj of woosh._LibraryTests instances keyed by library name
		
	*/
	function TestSetRunner(libraryTests) {
		this.libraryTests = libraryTests;
		this.libraryNames = [];
		var i = 0;
		
		// gather library names
		for (var key in libraryTests) {
			this.libraryNames[i++] = key;
		}
	}
	
	woosh._utils.extend(TestSetRunner, {}, {
		/**
		@name woosh._TestSetRunner#libraryTests
		@type {Object}
		@description Obj of woosh._LibraryTests instances keyed by library name
		*/
		libraryTests: {},
		/**
		@name woosh._TestSetRunner#libraryNames
		@type {string[]}
		@description Array of library names to test
		*/
		libraryNames: [],
		/**
		@name woosh._TestSetRunner#loopsEqual
		@type {boolean}
		@description Were the loop counts of all tests equal?
			Only available after all tests have ran
		*/
		loopsEqual: null,
		/**
		@name woosh._TestSetRunner#returnValsEqual
		@type {boolean}
		@description Were the return values of all tests equal?
			Only available after all tests have ran
		*/
		returnValsEqual: null,
		/**
		@name woosh._TestSetRunner#unitsEqual
		@type {boolean}
		@description Were the units of all tests equal?
			Only available after all tests have ran
		*/
		unitsEqual: null,
		/**
		@name woosh._TestSetRunner#typesEqual
		@type {boolean}
		@description Were the types of all tests equal?
			Only available after all tests have ran
		*/
		typesEqual: null,
		/**
		@name woosh._TestSetRunner#maxResult
		@type {number}
		@description The maximum result from the tests
			Only available after all tests have ran
		*/
		maxResult: null,
		/**
		@name woosh._TestSetRunner#minResult
		@type {number}
		@description The minimum result from the tests
			Only available after all tests have ran
		*/
		minResult: null,
		/**
		@name woosh._TestSetRunner#highestIsBest
		@type {boolean}
		@description Is the highest result best?
			Only available after all tests have ran
		*/
		highestIsBest: null,
		/**
		@name woosh._TestSetRunner#lastTestsRan
		@type {object}
		@description The last tests ran, keyed by library name
		*/
		lastTestsRan: {},
		/**
		@name woosh._TestSetRunner#run
		@function
		@description Run the test of tests
		
		@param {string} testName Name of test to run
		
		@param {Function} onTestComplete Callback for when a test completes
			Passed 2 params, the name of the library the test ran for & the test instance
			
		@param {Function} onComplete Callback for when all tests in the set complete
			
		*/
		run: function(testName, onTestComplete, onComplete) {
			var libIndex = -1,
				currentLibName,
				currentLibraryTests,
				test,
				tests = [],
				testSetRunner = this;
			
			this.lastTestsRan = {};
			
			function testComplete() {
				onTestComplete.call(testSetRunner, currentLibName, test);
				setTimeout(function() {
					runNextTest();
				}, 300);
			}
			
			function runNextTest() {
				// get the frame for the next library
				currentLibName = testSetRunner.libraryNames[ ++libIndex ];
				currentLibraryTests = testSetRunner.libraryTests[currentLibName];
				
				// if there's none, then we're done!
				if (currentLibraryTests) {
					// else let's get the test
					test = currentLibraryTests.tests[testName];
					testSetRunner.lastTestsRan[currentLibName] = test;
					if (test) {
						tests.push(test);
						currentLibraryTests.run(testName, testComplete);
					} else {
						// maybe this test is missing for this library? Move on
						testComplete();
					}
				} else {
					testSetRunner._analyseResults(tests);
					onComplete.call(testSetRunner);
				}
			}
			
			runNextTest();
		},
		/**
		@name woosh._TestSetRunner#_analyseResults
		@function
		@private
		@description Looks at the results of a set of tests and populate values
		
		@param {woosh.Test[]} tests Array of tests to analyse
			
		*/
		_analyseResults: function(tests) {
			var firstLoopCount, loopsEqual = true,
				firstReturnVal, returnValsEqual = true,
				firstUnit, unitsEqual = true,
				firstType, typesEqual = true,
				results = [],
				resultsLen = 0,
				maxResult,
				minResult,
				highestIsBest,
				test;
			
			for (var i = 0, len = tests.length; i<len; i++) {
				test = tests[i];				
				if (i === 0) {
					highestIsBest = test._highestIsBest;
					firstLoopCount = test._loopCount;
					firstReturnVal = test._returnVal;
					firstUnit = test._unit;
					firstType = woosh._utils.constructorName(test);
				}
				if (test._result !== undefined && !test._error) {
					// remember the result
					results[resultsLen++] = test._result;
					// check the values are the same as first
					if (i !== 0) {
						loopsEqual = loopsEqual && (firstLoopCount == test._loopCount);
						returnValsEqual = returnValsEqual && (firstReturnVal == test._returnVal);
						unitsEqual = unitsEqual && (firstUnit == test._unit);
						typesEqual = typesEqual && ( firstType == woosh._utils.constructorName(test) );
					}
				}
			}
			maxResult = Math.max.apply(Math, results);
			minResult = Math.min.apply(Math, results);
			
			// set properties
			this.loopsEqual = loopsEqual;
			this.returnValsEqual = returnValsEqual;
			this.unitsEqual = unitsEqual;
			this.typesEqual = typesEqual;
			this.maxResult = maxResult;
			this.minResult = minResult;
			this.highestIsBest = highestIsBest;
		}
	});
	woosh._TestSetRunner = TestSetRunner;
})();
// woosh._TestFrame
(function() {	
	/**
	@name woosh._TestFrame
	@constructor
	@private
	@description An iframe for testing a particular library
	
	@param {String} libraryName Library to include for these tests.
		String must be a property name within {@link woosh.libs}
		
	@param {Function} onReady A function to call when the TestFrame is ready to use
		'this' in onReady will be the TestFrame
		
	*/
	
	function TestFrame(libraryName, onReady) {
		var iframe = document.createElement('iframe'),
			testFrame = this,
			queryString = woosh._utils.urlEncode({
				lib: libraryName
			});
			
		iframe.className = 'wooshCreated';
		
		function iframeonload() {
			/**
			@name woosh._TestFrame#window
			@type {Window}
			@description The window object of the frame
			*/
			testFrame.window = iframe.contentWindow;
			/**
			@name woosh._TestFrame#libraryTests
			@type {woosh._LibraryTests}
			@description The library tests created in this frame
			*/
			testFrame.libraryTests = testFrame.window.woosh._libraryTests;
			onReady.call(testFrame);
		}
		
		if (iframe.attachEvent) {
			iframe.attachEvent('onload', iframeonload);
		} else {
			iframe.onload = iframeonload;
		}
		
		
		iframe.src = window.location.href.replace(window.location.search, '').replace(/#.*$/, '') + '?notest&' + queryString;
		document.getElementById('wooshOutput').appendChild(iframe);
	}
	
	window.woosh._TestFrame = TestFrame;
})();

// woosh._Conductor
(function() {
	/**
	@name woosh._Conductor
	@constructor
	@private
	@description Runs {@link woosh._LibraryTests} in a series of {@link woosh._TestFrame}s.
	
	@param {String[]} libraryNames Names of libraries to be tested.
	
	@param {Function} onReady A function to call when the Conductor is ready to use.
	*/
	function Conductor(libraryNames, onReady) {
		var numOfFramesWaiting = libraryNames.length,
			conductor = this;
			
		/**
		@name woosh._Conductor#libraryNames
		@type {String[]}
		@description Library names being tested
		*/
		this.libraryNames = libraryNames;
		
		/**
		@name woosh._Conductor#_testSetRunner
		@type {woosh._TestSetRunner}
		@description Runner for the test sets
		*/
		this._testSetRunner = undefined;
		
		/**
		@name woosh._Conductor#_currentTestIndex
		@private
		@type {Number}
		@description Index number for the current test.
			Is -1 before tests have started.
		*/
		this._currentTestIndex = -1;
		
		/**
		@name woosh._Conductor#_testFrames
		@private
		@type {Object}
		@description Object of {@link woosh._TestFrame}s
			The key is the name of the library being tested in the frame.
		*/
		this._testFrames = {};
		
		// call onReady when all frames have loaded
		function testFrameReady() {
			if ( !--numOfFramesWaiting ) {
				/**
				@name woosh._Conductor#testNames
				@type {String[]}
				@description Names of tests to run
				*/
				// get test names from first library's tests
				conductor.testNames = conductor._testFrames[ libraryNames[0] ].libraryTests.testNames;
				
				var libraryTests = {};
				// create the testset
				for (var i = 0, len = libraryNames.length; i<len; i++) {
					libraryTests[ libraryNames[i] ] = conductor._testFrames[ libraryNames[i] ].libraryTests;
				}
				
				conductor._testSetRunner = new woosh._TestSetRunner(libraryTests);
				onReady.call(conductor);
			}
		}
		
		for (var i = 0, len = libraryNames.length; i < len; i++) {
			this._testFrames[ libraryNames[i] ] = new woosh._TestFrame(libraryNames[i], testFrameReady);
		}
	}
	
	Conductor.prototype = {
		/**
		@name woosh._Conductor#start
		@function
		@description Start running tests
		*/
		start: function() {
			this.onStart();
			
			var testIndex = -1,
				currentTestName,
				conductor = this;
			
			// called when all tests of a given name are complete
			function testSetComplete() {
				conductor.onTestSetComplete(currentTestName, conductor._testSetRunner);
				runNextTestPerFrame();
			}
			
			// called when a test completes (once per library)
			function testComplete(libraryName, test) {
				conductor.onTestComplete(libraryName, currentTestName, test);
			}
			
			function runNextTestPerFrame() {
				currentTestName = conductor.testNames[ ++testIndex ];	
				
				if (currentTestName) {
					conductor._testSetRunner.run(currentTestName, testComplete, testSetComplete);
				} else {
					// we're done!
					conductor.onAllTestsComplete.call(conductor);
				}
			}
			
			runNextTestPerFrame();
		},
		/**
		@name woosh._Conductor#onStart
		@function
		@description Called when testing start
		*/
		onStart: function() {},
		/**
		@name woosh._Conductor#onTestComplete
		@function
		@description Called when the same test name is completed in each {@link woosh._TestFrame}
		
		@param {String} testName The name of the test completed
		
		@param {Object} testSetRunner The {@link woosh._TestSetRunner} used to run the tests
		*/
		onTestSetComplete: function(testName, testSetRunner) {},
		/**
		@name woosh._Conductor#onTestResult
		@function
		@description Called when a test completes for a particular library
		
		@param {String} libraryName The name of the library the test was completed for
		
		@param {String} testName The name of the test completed
		
		@param {woosh.Test} test Completed test
			Will be udefined if the test was missing
		*/
		onTestComplete: function(libraryName, testName, test) {},
		/**
		@name woosh._Conductor#onAllTestsComplete
		@function
		@description Called when all queued tests have completed
		*/
		onAllTestsComplete: function() {}
	};
	
	window.woosh._Conductor = Conductor;
})();

// woosh._views
(function() {
	/**
	@name woosh._views
	@namespace
	@private
	@description Constructors for visual output of test results
	*/
	woosh._views = {};
})();

// woosh._views.Table
(function() {
	var tableHeading = '<th></th>',
		tableCell = '<td></td>',
		ratingCellColours = [
			[238, 87, 87],
			[255, 254, 129],
			[198, 231, 70]
		],
		ratingTextColours = [
			[113, 9, 9],
			[120, 119, 8],
			[94, 116, 11]
		];
	
	// builds the skeleton of a results table
	function createResultsTable(libsLen, testsLen) {
		var tmpDiv = document.createElement('div'),
			tableStr = '<table class="wooshTable"><thead>',
			resultRowStr;
		
		// add headers for library names to go in	
		tableStr += '<tr><th>Tests</th>' + ( new Array(libsLen+1).join(tableHeading) ) + '</tr>';
		tableStr += '</thead><tbody>';
		// add result rows
		resultRowStr = '<tr>' + tableHeading + new Array(libsLen+1).join(tableCell) + '</tr>';
		tableStr += new Array(testsLen+1).join(resultRowStr);
		tableStr += '</tbody></table>';
		
		tmpDiv.innerHTML = tableStr;
		
		return tmpDiv.firstChild;
	}
	
	/**
	@name woosh._views.Table
	@constructor
	@private
	@description Create a dynamically updating table to display results
	
	@param {woosh._Conductor} conductor Test conductor to get results from
	*/
	function Table(conductor) {
		/**
		@name woosh._views.Table#conductor
		@type {woosh._Conductor}
		@description The instance conducting the test
		*/
		this.conductor = conductor;
		
		/**
		@name woosh._views.Table#element
		@type {HTMLElement}
		@description Table element that can be appended to the document
		*/
		this.element = createResultsTable(conductor.libraryNames.length, conductor.testNames.length);
		
		/**
		@name woosh._views.Table#_testRows
		@type {Object}
		@description Object of table rows keyed on test name
		*/
		this._testRows = {};
		
		/**
		@name woosh._views.Table#_libColIndex
		@type {Object}
		@description Column index for a library, keyed on library name
		*/
		this._libColIndex = {};
		
		/**
		@name woosh._views.Table#_nextResultCell
		@type {HTMLElement}
		@description The next cell to write to
		*/
		this._nextResultCell = undefined;
		
		this._initAndIndex();
		this._attachListeners();
	}
	
	Table.prototype = {
		/**
		@name woosh._views.Table#initAndIndex
		@function
		@private
		@description Populate the headings and index row element on {@link woosh._views.Table#_testRows}
		*/
		_initAndIndex: function() {
			var libRowCells = this.element.firstChild.firstChild.childNodes,
				testRows = this.element.childNodes[1].childNodes,
				testNames = this.conductor.testNames,
				libraryNames = this.conductor.libraryNames;
			
			// headings
			for (var i = 0, len = libraryNames.length; i < len; i++) {
				this._libColIndex[ libraryNames[i] ] = i+1;
				libRowCells[i+1].appendChild( document.createTextNode( libraryNames[i] ) );
			}
			// rows
			for (var i = 0, len = testNames.length; i < len; i++) {
				this._testRows[ testNames[i] ] = testRows[i];
				testRows[i].firstChild.appendChild( document.createTextNode( testNames[i] ) );
				// TODO: delegate this event
				// Click the table heading to make the info toggle
				testRows[i].firstChild.onclick = function() {
					var tableRow = this.parentNode;
					if (tableRow.className == 'fullInfo') {
						tableRow.className = '';
					}
					else {
						tableRow.className = 'fullInfo';
					}
				}
			}
			// get first cell to write to
			this._nextResultCell = testRows[0].childNodes[1];
		},
		/**
		@name woosh._views.Table#_attachListeners
		@function
		@private
		@description Hook up with the conductor
		*/
		_attachListeners: function() {
			// TODO: replace this with a better event listening system
			var oldOnTestComplete = this.conductor.onTestComplete,
				_addResults,
				table = this;
				
			this.conductor.onTestComplete = function(libraryName, testName, test) {
				oldOnTestComplete.apply(this, arguments);
				table._addResult(libraryName, testName, test);
			}
			
			this.conductor.onTestSetComplete = function(testName, testSetRunner) {
				table._checkResults(testName, testSetRunner);
			}
		},
		/**
		@name woosh._views.Table#_addResult
		@function
		@private
		@description Add a result to the table in the position of the cursor
		
		@param {string} libraryName 
		@param {string} testName 
		@param {woosh.Test} test 
		*/
		_addResult: function(libraryName, testName, test) {
			var resultText,
				infoNode,
				infoDefs = {},
				dt, dd,
				resultRow = this._testRows[testName],
				resultCell = resultRow.childNodes[ this._libColIndex[libraryName] ];
			
			if (test && test._error) {
				resultText = 'Error';
				resultCell.className += ' error';
				infoNode = document.createElement('div');
				infoNode.appendChild( document.createTextNode(test._error.message) )
			}
			else if (test) {
				resultText = test._result + test._unit;
				infoDefs = {
					'Loop Count': test._loopCount,
					'Return Value': test._returnVal,
					'Test Type': woosh._utils.constructorName(test)
				};
				infoNode = document.createElement('dl');
				for (var key in infoDefs) {
					dt = document.createElement('dt');
					dd = document.createElement('dd');
					dt.appendChild( document.createTextNode(key) );
					dd.appendChild( document.createTextNode( infoDefs[key] ) );
					infoNode.appendChild(dt);
					infoNode.appendChild(dd);
				}
			}
			else {
				resultCell.className += ' noTest';
				resultText = 'No test found';
			}
			
			resultCell.appendChild( document.createTextNode(resultText) );
			
			if (infoNode) {
				infoNode.className = 'info';
				resultCell.appendChild(infoNode);
			}
		},
		/**
		@name woosh._views.Table#_checkResults
		@function
		@private
		@description Checks a set of results for a particular test, updates the table with warnings etc
		 
		@param {string} testName 
		@param {woosh._TestSetRunner} testSetRunner Data about the tests that ran
		*/
		_checkResults: function(testName, testSetRunner) {
			var resultRow = this._testRows[testName],
				testNameCell = resultRow.firstChild,
				infoNode,
				warningMsg = '',
				tests = testSetRunner.lastTestsRan,
				test,
				testCell,
				resultPercent,
				cellBg,
				cellText,
				placeInGradient,
				resultDifference;

			for (var libraryName in tests) {
				test = tests[libraryName];
				if (!test || test._error) {
					continue;
				}
				testCell = resultRow.childNodes[ this._libColIndex[libraryName] ];
				
				resultDifference = testSetRunner.maxResult - testSetRunner.minResult;
				
				if (resultDifference === 0) {
					resultPercent = 0;
				} else {
					resultPercent = ( (test._result - testSetRunner.minResult) / (testSetRunner.maxResult - testSetRunner.minResult) );
				}
				
				// flip the result if low results are good
				if (!testSetRunner.highestIsBest) {
					resultPercent = 1 - resultPercent;
				}
				
				cellBg = {};
				cellText = {};
				
				if (resultPercent > 0.5) {
					placeInGradient = (resultPercent - 0.5) * 2;
					cellBg = {
						r: Math.round( ((ratingCellColours[2][0] - ratingCellColours[1][0]) * placeInGradient) + ratingCellColours[1][0] ),
						g: Math.round( ((ratingCellColours[2][1] - ratingCellColours[1][1]) * placeInGradient) + ratingCellColours[1][1] ),
						b: Math.round( ((ratingCellColours[2][2] - ratingCellColours[1][2]) * placeInGradient) + ratingCellColours[1][2] )
					}
					cellText = {
						r: Math.round( ((ratingTextColours[2][0] - ratingTextColours[1][0]) * placeInGradient) + ratingTextColours[1][0] ),
						g: Math.round( ((ratingTextColours[2][1] - ratingTextColours[1][1]) * placeInGradient) + ratingTextColours[1][1] ),
						b: Math.round( ((ratingTextColours[2][2] - ratingTextColours[1][2]) * placeInGradient) + ratingTextColours[1][2] )
					}
				} else {
					placeInGradient = resultPercent * 2;
					
					cellBg = {
						r: Math.round( ((ratingCellColours[1][0] - ratingCellColours[0][0]) * placeInGradient) + ratingCellColours[0][0] ),
						g: Math.round( ((ratingCellColours[1][1] - ratingCellColours[0][1]) * placeInGradient) + ratingCellColours[0][1] ),
						b: Math.round( ((ratingCellColours[1][2] - ratingCellColours[0][2]) * placeInGradient) + ratingCellColours[0][2] )
					}
					cellText = {
						r: Math.round( ((ratingTextColours[1][0] - ratingTextColours[0][0]) * placeInGradient) + ratingTextColours[0][0] ),
						g: Math.round( ((ratingTextColours[1][1] - ratingTextColours[0][1]) * placeInGradient) + ratingTextColours[0][1] ),
						b: Math.round( ((ratingTextColours[1][2] - ratingTextColours[0][2]) * placeInGradient) + ratingTextColours[0][2] )
					}
				}
				
				testCell.style.backgroundColor = 'rgb(' + cellBg.r + ',' + cellBg.g + ',' + cellBg.b + ')';
				testCell.style.color = 'rgb(' + cellText.r + ',' + cellText.g + ',' + cellText.b + ')';
				
				if (test._result === testSetRunner.maxResult || test._result === testSetRunner.minResult) {
					testCell.style.fontWeight = 'bold';
				}
			}
			if ( !(testSetRunner.loopsEqual && testSetRunner.returnValsEqual && testSetRunner.unitsEqual && testSetRunner.typesEqual) ) {
				!testSetRunner.loopsEqual && 		(warningMsg += ' Tests have differing loop counts.');
				!testSetRunner.returnValsEqual &&	(warningMsg += ' Tests have differing return values.');
				!testSetRunner.unitsEqual && 		(warningMsg += ' Test results are of differing units.');
				!testSetRunner.typesEqual &&		(warningMsg += ' Tests are of differing types.');
				infoNode = document.createElement('div');
				infoNode.className = 'info';
				infoNode.appendChild( document.createTextNode(warningMsg) );
				testNameCell.appendChild(infoNode);
				testNameCell.className += ' mismatch';
			}
		}
	}
	
	woosh._views.Table = Table;
})();

// woosh._buildOutputInterface
(function() {
	/**
	@name woosh._buildOutputInterface
	@function
	@private
	@description Builds the output interface to display to the user
	*/
	var wooshOutput;
	
	function buildOutputInterface() {
		wooshOutput = document.getElementById('wooshOutput');
		
		if (!wooshOutput) {
			return;
		}
		wooshOutput.innerHTML = '<div id="wooshBanner"><h1>' + document.title + '</h1></div><div id="wooshCommands"></div><div id="wooshViewOutput"><div>';
		
		var a = document.createElement('a');
		a.href = '#';
		a.id = 'startLink';
		a.className = 'wooshButton';
		a.innerHTML = 'Start';
		a.onclick = function() {
			woosh._conductor.start();
			this.style.visibility = 'hidden';
			return false;
		}
		
		document.getElementById('wooshCommands').appendChild(a);
	}
	
	woosh._buildOutputInterface = buildOutputInterface;
})();

// page setup
(function() {
	/**
	@name woosh._pageMode
	@type {String}
	@private
	@description The mode the page is running in.
		'conducting':  Will create frames for libraries to be tested
		   'testing':  Will load a library onto the page and create a LibraryTests object
	*/
	woosh._pageMode = 'conducting';

	// set this frame / window up
	var query = woosh._utils.urlDecode( window.location.search.slice(1) );
	
	if ( query.lib ) {
		// Ok, we're running tests against a library
		// we need to load a particular library
		woosh._pageMode = 'testing';
		woosh._utils.loadAssets.apply( this, woosh.libs[ query.lib[0] ] );
		/**
		@name woosh._libraryToTest
		@private
		@type {String}
		@description Name of the library being tested in this frame
		*/
		woosh._libraryToTest = query.lib[0];
	}
	else if (window.QUnit) {
		// we're in a unit test, don't do anything until we're asked
		return;
	}
	else {
		// We're running tests in iframes and displaying the results
		// load our CSS
		woosh._utils.loadAssets('assets/style.css');
		var oldOnload = window.onload || function() {};
		
		window.onload = function() {
			oldOnload.call(this, arguments);
			
			// build the interface
			woosh._buildOutputInterface();
			
			/**
			@name woosh._conductor
			@type {woosh._Conductor}
			@private
			@description The conductor for this page
			*/
			// create our tests
			woosh._conductor = new woosh._Conductor(woosh._libsToConduct, function() {
				var table = new woosh._views.Table(woosh._conductor);
				document.getElementById('wooshViewOutput').appendChild(table.element);
			});
		};
	}
})();