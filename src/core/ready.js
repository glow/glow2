// start-source: core/ready.js
Glow.provide({
	version: 'src',
	builder: function(glow) {
		var ua = navigator.userAgent.toLowerCase();
		
		glow.env = function(){
			var nanArray = [0, NaN],
				opera = (/opera[\s\/]([\w\.]+)/.exec(ua) || nanArray)[1],
				ie = opera ? NaN : (/msie ([\w\.]+)/.exec(ua) || nanArray)[1],
				gecko = (/rv:([\w\.]+).*gecko\//.exec(ua) || nanArray)[1],
				webkit = (/applewebkit\/([\w\.]+)/.exec(ua) || nanArray)[1],
				khtml = (/khtml\/([\w\.]+)/.exec(ua) || nanArray)[1],
				toNum = parseFloat;

			return {
				gecko   : toNum(gecko),
				ie      : toNum(ie),
				opera   : toNum(opera),
				webkit  : toNum(webkit),
				khtml   : toNum(khtml),
				version : ie || gecko || webkit || opera || khtml,
				standardsMode : document.compatMode != "BackCompat" && (!ie || ie >= 6)
			}
		}();
			
		var readyQueue = [],
			domReadyQueue = [],
			blockersActive = 0,
			processingReadyQueue = false;
			
		glow._readyBlockers = {};
	
		glow.ready = function (f) { /*debug*///console.log('glow.ready()');
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
			if (this.isDomReady) {
				f();
			} else {
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
			if (processingReadyQueue) return;
			processingReadyQueue = true;
			while (readyQueue.length) {
				(readyQueue.shift())();
				
				// check if the previous function has created a blocker
				if (blockersActive) {
					break;
				}
			}
			processingReadyQueue = false;
		}

	
//// watch for document to complete
		(function() {
			function glowReady() { /*debug*///console.log('glowReady()');
				runDomReadyQueue();
				glow._removeReadyBlock('glow_domReady');
				document.readyState == 'complete';
			}
			
			//don't do this stuff if the dom is already ready
			if (glow.isDomReady) { return; }
			
			glow._addReadyBlock('glow_domReady'); // wait for dom to be ready
			
			if (document.readyState == 'complete') { // already here!
				glowReady();
			}
			else if ( document.attachEvent ) { // like IE
				// might be an iframe...
				document.attachEvent(
					'onreadystatechange',
					function() {
						if (document.readyState === 'complete') {
							document.detachEvent('onreadystatechange', arguments.callee);
							glowReady();
						}
					}
				);
				
				// not an iframe...
				if (document.documentElement.doScroll && window == window.top ) {
					(function() {
						try {
							document.documentElement.doScroll('left');
						} catch( error ) {
							setTimeout( arguments.callee, 0 );
							return;
						}
				
						// and execute any waiting functions
						glowReady();
					})();
				}
			}
			if (glow.env.webkit < 525.13 && document.readyState) { // like pre Safari 3.1
				var f = function(){
					if ( /loaded|complete/.test(document.readyState) ) {
						glowReady();
					} else {
						setTimeout(f, 0);
					}
				};
				f();
			}
			else if (document.addEventListener) { // like Mozilla, Opera and recent webkit
				document.addEventListener( 
					'DOMContentLoaded',
					function(){
						document.removeEventListener('DOMContentLoaded', arguments.callee, false);
						glowReady();
					},
					false
				);
			}
			else {
				// TODO throw an error?
			}
		})();
////
	
		// TODO for v2 we should switch this to 'notSupported' as it's a blacklist
		glow.isSupported = !(
			//here are the browsers we don't support
			glow.env.ie < 6 ||
			(glow.env.gecko < 1.9 && !/^1\.8\.1/.test(env.version)) ||
			glow.env.opera < 9 ||
			glow.env.webkit < 412
		);
		// block 'ready' if browser isn't supported
		if (!glow.isSupported) {
			glow._addReadyBlock("glow_browserSupport");
		}
	}
});
// end-source: core/ready.js