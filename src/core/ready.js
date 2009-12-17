// start-source: core/ready.js
/*debug*///log.info('executing core/ready.js');
Glow.provide(
	function(glow) {
		var readyQueue = [],
			domReadyQueue = [],
			blockersActive = 0,
			processingReadyQueue = false;
			
		glow._readyBlockers = {};
		
 		/*debug*///log.info('overwriting Glow ready with glow.ready');	
		glow.ready = function (f) { /*debug*///log.info('glow.ready()');
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
		
		glow._addReadyBlock = function(name) { /*debug*///log.info('_addReadyBlock('+name+')');
			if (typeof glow._readyBlockers[name] === 'undefined') { glow._readyBlockers[name] = 0; }
			glow._readyBlockers[name]++;
			glow.isReady = false;
			blockersActive++; /*debug*///log.info('  &#187; blockersActive '+blockersActive+'.');
			return glow;
		}
			
		glow._removeReadyBlock = function(name) { /*debug*///log.info('_removeReadyBlock('+name+')');
			if (glow._readyBlockers[name]) {
				glow._readyBlockers[name]--;
				blockersActive--;  /*debug*///log.info('  &#187; blockersActive '+blockersActive+'.');
				// if we're out of blockers
				if (!blockersActive) {
					// call our queue
					glow.isReady = true;
					runReadyQueue();
				}
			}
			return glow;
		}
		
		// add blockers for any packages that started loading before core (this package) was built
		for (var i = 0, len = glow._build.loading.length; i < len; i++) {
			glow._addReadyBlock('glow_loading_'+glow._build.loading[i]);
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
		function bindReady() { /*debug*///log.info('bindReady()');
			//don't do this stuff if the dom is already ready
			if (glow.isDomReady) { return; }
			glow._addReadyBlock('glow_domReady'); // wait for dom to be ready
			
			function onReady() { /*debug*///log.info('onReady()');
				runReadyQueue();
				glow._removeReadyBlock('glow_domReady');
			}
					
			if (document.readyState == 'complete') { // already here!
				 /*debug*///log.info('already complete');
				onReady();
			}
			else if (glow.env.ie && document.attachEvent) { /*debug*///log.info('bindready() - document.attachEvent');
				// like IE
				
				// not an iframe...
				if (document.documentElement.doScroll && window == top) {
					(function() {  /*debug*///log.info('doScroll');
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
				else {
					// an iframe...
					document.attachEvent(
						'onreadystatechange',
						function() { /*debug*///log.info('onreadystatechange');
							if (document.readyState == 'complete') {
								document.detachEvent('onreadystatechange', arguments.callee);
								onReady();
							}
						}
					);
				}
			}
			else if (document.readyState) { /*debug*///log.info('bindready() - document.readyState');
				// like pre Safari
				(function() { /*debug*///log.info('loaded|complete');
					if ( /loaded|complete/.test(document.readyState) ) {
						onReady();
					}
					else {
						setTimeout(arguments.callee, 0);
					}
				})();
			}
			else if (document.addEventListener) {/*debug*///log.info('bindready() - document.addEventListener');
				// like Mozilla, Opera and recent webkit
				document.addEventListener( 
					'DOMContentLoaded',
					function(){ /*debug*///log.info('glow DOMContentLoaded');
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
);
// end-source: core/ready.js