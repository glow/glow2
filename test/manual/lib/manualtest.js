(function() {
	window.manualTests = {};
	
	// output the source for a given script element
	function revealSrcFor(scriptElm) {
		// filter code so it can be safely displayed
		var code = getSource( scriptElm ),
			preElement = document.createElement("pre");
		
		// TODO move this stuff into a stylesheet?
		preElement.style.border = '1px solid #ccc';
		preElement.style.padding = '10px';
		preElement.style.maxHeight = '200px';
		preElement.style.overflow = 'auto';
		
		preElement.className = "src";
		preElement.innerHTML = "<code>" + code + "<\/code>";
		scriptElm.parentNode.insertBefore(preElement, scriptElm);
	}
	
	// gets the source for a given script element, tidies it up, returns an html string
	function getSource( scriptElm ) {
		var code = scriptElm.innerHTML;
		
		// trim empty lines at start & end
		code = code.replace("// <![CDATA[", "").replace("// ]]>", "").replace(/^(\s*\n\r?)*|(\n\r?\s*)*$/g, '');
		
		// match the initial spacing of the first line, so we can shift it left
		var initialWhiteSpaceRe = new RegExp("^" + code.match(/^\s*/)[0], "mg");
		
		code = code.replace(initialWhiteSpaceRe, '')
			.replace("// <![CDATA[", "").replace("// ]]>", "")
			// simple html encoding
			.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
			// tabs to spaces
			.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
			// change newlines to <br />
			.replace(/\n\r?/g, "<br />");
			
		return code;
	}
	
	/**
		@name manualTests.showSrc
		@function
		@description Outputs script elements with a given class so they can be read
		
		@param {String} [className=showSrc] Only show scripts with this classname
	*/
	manualTests.showSrc = function(className) {
		var classNamePadded = ' ' + (className || 'showSrc') + ' ';
		
		var scriptElms = document.getElementsByTagName('script'),
			i = scriptElms.length;
		
		while (i--) {
			// does the script element have the class name?
			if ( (' ' + scriptElms[i].className + ' ').indexOf(classNamePadded) != -1 ) {
				revealSrcFor(scriptElms[i]);
			}
		}
	}
})();

// manual test reporting - see docs for 'module' for full example
(function() {
	var currentList;
	
	/**
		@name ManualTestResult
		@constructor
		@description Instances of this are passed into the callback passed into {@link test}
		
		@param {string} name Test name
		@param {HTMLElement} li List item element
	*/
	function ManualTestResult(name, li) {
		this.name = name;
		this.li = li;
	}
	
	/**
		@name ManualTestResult#ok
		@function
		@description Conditionally pass the test
		
		@param {boolean} pass Passes the test if true, otherwise fails
		@param {string|object} [msg] Message to include in results.
			Objects will be converted into name-value pairs
	*/
	ManualTestResult.prototype.ok = function(pass, msg) {
		msg = msg || '';
		
		var obj, isFirst = true;
		
		this.li.className = pass ? 'pass' : 'fail';
		
		if (msg.constructor === Object) {
			obj = msg;
			msg = '';
			
			for (var prop in obj) {
				if (!isFirst) {
					msg += ', '
				}
				msg += prop + ': ' + obj[prop];
				isFirst = false;
			}
		}
		
		this.li.innerHTML = this.name + (msg ? ' - ' + msg.toString() : '');
	};
	
	/**
		@name ManualTestResult#pass
		@function
		@description Pass the test
		
		@param {string|object} [msg] Message to include in results
	*/
	ManualTestResult.prototype.pass = function(msg) {
		this.ok(true, msg);
	};
	
	/**
		@name ManualTestResult#fail
		@function
		@description Fail the test
		
		@param {string|object} [msg] Message to include in results
	*/
	ManualTestResult.prototype.fail = function(msg) {
		this.ok(false, msg);
	};
	
	
	/**
		@name module
		@function
		@description Create a new test module.
			You should have one module per testarea
		
		@param {string} name Module name
		
		@example
			module('Window Events');
		
			test('Window resize can be detected', function(result) {
				window.resizeCounter = 0;
				glow.ready(function() {
					new glow.NodeList(window).on('resize', function(e) {
						resizeCounter++;
						result.pass({
							"resizeCounter": resizeCounter
						});
					})
				});
			});
			
			// a two-part test
			
			var mouseoverResult = test('Mouseover can be detected');
			
			test('Mouseover related element can be detected', function(result) {
				new glow.NodeList('#mouse-test').on('mouseover', function(e) {
					result.pass()
					mouseoverResult.ok(e.related && e.related.id === 'mouse-around')
				})
			})
	*/
	function module(name) {
		var ol = document.createElement('ol'),
			scripts = document.getElementsByTagName('script'),
			currentScript = scripts[scripts.length - 1];
			
		currentScript.parentNode.insertBefore(ol, currentScript);
		currentList = ol;
	}
	
	/**
		@name test
		@function
		@description Create a new test
			You need to call {@link module} before creating your first test.
			
			See {@link module} for examples.
		
		@param {string} name Test name
		@param {function} [callback] Function which creates the test.
			This callback is passed an instance of ManualTestResult as the first param.
			Use this to set the result of the test.
			
		@returns {ManualTestResult} result Use this to set the result of the test (an instance is also passed into the callback).
	*/
	function test(name, callback) {
		var li = document.createElement('li'),
			result = new ManualTestResult(name, li);
		
		li.innerHTML = name;
		currentList.appendChild(li);
		callback && callback(result);
		
		return result;
	}
	
	// exports
	window.module = module;
	window.test = test;
})();

// include glow on the page
// (function() {
// 	var glowSrc =  conf.base + (conf.version == '@SRC@'? 'src' : conf.version) + '/glow.js';
// 	
// 	document.write(
// 		'<'+'script type="text/javascript" src="' + glowSrc + '"> \
// 		<' + '/script>'
// 	);
// })();