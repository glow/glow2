
Brew.provide(function(brew) {
	var ua = navigator.userAgent.toLowerCase();
	
	brew.env = function(){
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
		
	brew._readyBlockers = {};

	brew.ready = function (f) { /*debug*/console.log('core brew.ready()');
		if (this.isReady) {
			f();
		}
		else {
			readyQueue.push(f);
		}
		return brew;
	};
	
	brew.onDomReady = function(f) {
		//just run function if already ready
		if (brew.isDomReady) {
			f();
		}
		else {
			domReadyQueue.push(f);
		}
	};
	
	brew._addReadyBlock = function(name) {
		if (name in brew._readyBlockers) {
			throw new Error("Blocker '" + name +"' already exists");
		}
		brew._readyBlockers[name] = true;
		brew.isReady = false;
		blockersActive++;
		return brew;
	}
		
	brew._removeReadyBlock = function(name) {
		if (brew._readyBlockers[name]) {
			brew._readyBlockers[name] = false;
			blockersActive--;
			// if we're out of blockers
			if (!blockersActive) {
				// call our queue
				brew.isReady = true;
				runReadyQueue();
			}
		}
		return brew;
	}
	
	function runDomReadyQueue() {
		brew.isDomReady = true;
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
			(readyQueue.shift())(brew);
			
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
	var bindReady = function() {
		//don't do this stuff if the dom is already ready
		if (brew.isDomReady) { return; }
		brew._addReadyBlock('brew_domReady'); // wait for dom to be ready
		
		function onReady() { /*debug*///console.log('onReady()');
			runReadyQueue();
			brew._removeReadyBlock('brew_domReady');
			document.readyState == 'complete';
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
		else if (brew.env.webkit < 525.13 && document.readyState) { // like pre Safari 3.1
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
			throw new Error('Unable to bind brew ready listener to document.');
		}
	};

	brew.notSupported = ( // here are the browsers we don't support
		brew.env.ie < 6 ||
		(brew.env.gecko < 1.9 && !/^1\.8\.1/.test(brew.env.version)) ||
		brew.env.opera < 9 ||
		brew.env.webkit < 412
	);
	// deprecated
	brew.isSupported = !brew.notSupported;
	
	// block 'ready' if browser isn't supported
	if (brew.notSupported) {
		brew._addReadyBlock('brew_browserSupport');
	}
	
	bindReady();
});

Brew.complete('core', '1.0.0');