// start-source: core/ready.js
Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		var ua = navigator.userAgent.toLowerCase();
		
		glow.env = function(){
			var nanArray = [0, NaN],
				opera = (/opera[\s\/]([\w\.]+)/.exec(ua) || nanArray)[1],
				ie = opera ? NaN : (/msie ([\w\.]+)/.exec(ua) || nanArray)[1],
				gecko = (/rv:([\w\.]+).*gecko\//.exec(ua) || nanArray)[1],
				webkit = (/applewebkit\/([\w\.]+)/.exec(ua) || nanArray)[1],
				khtml = (/khtml\/([\w\.]+)/.exec(ua) || nanArray)[1];

			return {
				gecko: parseFloat(gecko),
				ie: parseFloat(ie),
				opera: parseFloat(opera),
				webkit: parseFloat(webkit),
				khtml: parseFloat(khtml),
				version: ie || gecko || webkit || opera || khtml,
				standardsMode : document.compatMode != 'BackCompat' && (!ie || ie >= 6)
			}
		}();
			
		var readyQueue = [],
			domReadyQueue = [],
			blockersActive = 0,
			processingReadyQueue = false;
			
		glow._readyBlockers = {};
	
		glow.ready = function (f) { /*debug*///console.log('core glow.ready()');
			if (this.isReady) {
				f();
			}
			else {
				readyQueue.push(f);
			}
			return glow;
		};
		
		glow.onDomReady = function(f) {
			//just run function if already ready
			if (glow.isDomReady) {
				f();
			}
			else {
				domReadyQueue.push(f);
			}
		};
		
		glow._addReadyBlock = function(name) {
			if (name in glow._readyBlockers) {
				throw new Error("Blocker '" + name +"' already exists");
			}
			glow._readyBlockers[name] = true;
			glow.isReady = false;
			blockersActive++;
			return glow;
		}
			
		glow._removeReadyBlock = function(name) {
			if (glow._readyBlockers[name]) {
				glow._readyBlockers[name] = false;
				blockersActive--;
				// if we're out of blockers
				if (!blockersActive) {
					// call our queue
					glow.isReady = true;
					runReadyQueue();
				}
			}
			return glow;
		}
		
		function runDomReadyQueue() {
			glow.isDomReady = true;
			// run all functions in the array
			for (var i = 0, len = domReadyQueue.length; i < len; i++) {
				domReadyQueue[i]();
			}
		}
	
		function runReadyQueue() { /*debug*///console.log('runReadyQueue()');
			// if we're already processing the queue, just exit, the other instance will take care of it
			if (processingReadyQueue) { return; }
			
			processingReadyQueue = true;
			while (readyQueue.length) {
				(readyQueue.shift())(glow);
				
				// check if the previous function has created a blocker
				if (blockersActive) { break; }
			}
			processingReadyQueue = false;
		}
		
		/**
			@private
			@function
			@name bindReady
			@description Add listener to document to detect when page is ready.
		 */
		function bindReady() {
			//don't do this stuff if the dom is already ready
			if (glow.isDomReady) { return; }
			glow._addReadyBlock('glow_domReady'); // wait for dom to be ready
			
			function onReady() { /*debug*///console.log('onReady()');
				runReadyQueue();
				glow._removeReadyBlock('glow_domReady');
				document.readyState = 'complete';
			}
					
			if (document.readyState == 'complete') { // already here!
				onReady();
			}
			else if (document.attachEvent) { // like IE
				// might be an iframe...
				document.attachEvent(
					'onreadystatechange',
					function() {
						if (document.readyState == 'complete') {
							document.detachEvent('onreadystatechange', arguments.callee);
							onReady();
						}
					}
				);
				
				// not an iframe...
				if (document.documentElement.doScroll && window == top) {
					(function() {
						try {
							document.documentElement.doScroll('left');
						}
						catch(error) {
							setTimeout(arguments.callee, 0);
							return;
						}
				
						// and execute any waiting functions
						onReady();
					})();
				}
			}
			else if (glow.env.webkit < 525.13 && document.readyState) { // like pre Safari 3.1
				(function() {
					if ( /loaded|complete/.test(document.readyState) ) {
						onReady();
					}
					else {
						setTimeout(arguments.callee, 0);
					}
				})();
			}
			else if (document.addEventListener) { // like Mozilla, Opera and recent webkit
				document.addEventListener( 
					'DOMContentLoaded',
					function(){
						document.removeEventListener('DOMContentLoaded', arguments.callee, false);
						onReady();
					},
					false
				);
			}
			else {
				throw new Error('Unable to bind glow ready listener to document.');
			}
		}
	
		glow.notSupported = ( // here are the browsers we don't support
			glow.env.ie < 6 ||
			(glow.env.gecko < 1.9 && !/^1\.8\.1/.test(env.version)) ||
			glow.env.opera < 9 ||
			glow.env.webkit < 412
		);
		// deprecated
		glow.isSupported = !glow.notSupported;
		
		// block 'ready' if browser isn't supported
		if (glow.notSupported) {
			glow._addReadyBlock('glow_browserSupport');
		}
		
		bindReady();
	}
});
// end-source: core/ready.js