Brew.provide(function($) {
	var readyQueue = [],
		blockersActive = 0,
		processingReadyQueue = false,
		allReady,
		readyBlockers = $._readyBlockers = {};

	/*debug*///log.info('overwriting Brew ready with $.ready');
	$.ready = function (f) { /*debug*///log.info('$.ready()');
		if (allReady) {
			f();
		}
		else {
			readyQueue.push(f);
		}
		return $;
	};

	$._addReadyBlock = function(name) { /*debug*///log.info('_addReadyBlock('+name+')');
		if (typeof readyBlockers[name] === 'undefined') { readyBlockers[name] = 0; }
		readyBlockers[name]++;
		allReady = false;
		blockersActive++; /*debug*///log.info('  &#187; blockersActive '+blockersActive+'.');
		return $;
	}

	$._removeReadyBlock = function(name) { /*debug*///log.info('_removeReadyBlock('+name+')');
		if (readyBlockers[name]) {
			readyBlockers[name]--;
			blockersActive--;  /*debug*///log.info('  &#187; blockersActive '+blockersActive+'.');
			// if we're out of blockers
			if (!blockersActive) {
				// call our queue
				allReady = true;
				runReadyQueue();
			}
		}
		return $;
	}

	function runReadyQueue() { /*debug*///log.info('runReadyQueue()');
		// if we're already processing the queue, just exit, the other instance will take care of it
		if (processingReadyQueue) { return; }

		/*debug*///log.info('readyQueue: '+readyQueue.length);
		processingReadyQueue = true;
		while (readyQueue.length) {
			var callback = readyQueue.shift();
			/*debug*///log.info('callback: '+callback);
			callback($);

			// check if the previous function has created a blocker
			if (blockersActive) { break; }
		}
		processingReadyQueue = false;
	}

	// wait for other modules to load
	if ($.loaded) {
		$._addReadyBlock('brew_load');
		$.loaded(function() {
			$._removeReadyBlock('brew_load');
		})
	}
	// hook into jQuery's dom ready
	$._addReadyBlock('brew_domReady');
	$(function() {
		$._removeReadyBlock('brew_domReady');
	})
});