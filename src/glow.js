//// run before the page is finished loading
	if (!document.readyState) {
		document.readyState = 'loading';
		
		if (document.attachEvent) { // like IE
			document.attachEvent(
				'onreadystatechange',
				function() {
					if (document.readyState == 'complete') {
						document.detachEvent('onreadystatechange', arguments.callee);
					}
				}
			);
		}
		else if (document.addEventListener) { // like Mozilla, Opera and recent webkit
			document.addEventListener(
				'DOMContentLoaded',
				function () {
					document.removeEventListener('DOMContentLoaded', arguments.callee, false);
					document.readyState = 'complete';
				},
				false
			);
		}
	}
////

/**
		@name Glow
		@function
		@param {String} [version] The version of glow you wish to use.
		@param {Object} [opts] Configure your glow instance.
		@param {String} [opts.base] The file path to the folder conatining your glow packages.
		@description Factory function used to create glow instances.
		@returns An ember.
 */
var Glow = function(version, opts) {
	opts = opts || {};
	
	/**
		@name glow
		@namespace
		@description A JavaScript library that's somewhat nifty.
	 */
	var glow = {
		version: _resolveVersion(version),
		onloaded: [],
		base: opts.base || '',
		packages: {}             // packageName: loadState
	};
	
	Glow.STATE = {
		injected:  1,
		completed: 2,
		loaded:    3,
		readied:   4
	};
	
	var undefined; // local, which we know is truly undefined
	
	/**
		@name glow.load
		@function
		@param {String} ... One or more package names.
		@description Include packages, which will rovide some modules to your glow.
	 */
	glow.load = function() { /*debug*///console.log('glow.load()');
		for (var i = 0, len = arguments.length; i < len; i++) {
			var packageName = arguments[i];
			
			if (!glow.packages[packageName]) glow.packages[packageName] = 0;
			
			// if the package is already injected don't inject it again
			if (glow.packages[packageName] < Glow.STATE.injected) {
				glow.packages[packageName] = Glow.STATE.injected;
				_injectJs(glow.base + glow.version + '/' + packageName + '.js');
			}
		}
		
		return glow;
	}
	
	/**
		@name glow.loaded
		@function
		@param {Function} onLoadCallback Called when all the packages load.
		@description Do something when all the packages load.
	 */
	glow.loaded = function(onLoadCallback) { /*debug*///console.log('glow.loaded('+onLoadCallback+')');
		if (typeof onLoadCallback != 'function') { throw new Error('glow.loaded requires a "onLoadCallback" to be a function.'); }
		
		glow.onloaded.push(onLoadCallback);
	
		glow._runCallbacks();
		
		return glow;
	}
	
	// TODO can this function be moved to a more sensible place?
	/**
		@name _runCallbacks
		@private
		@function
		@description Try to run any pending 'onloaded' callbacks.
	 */
	glow._runCallbacks = function() { /*debug*///console.log('glow._runCallbacks()');
		//if there are no onloaded callbacks in the list, do nothing
		if (glow.onloaded.length == 0) { return; }
		var notCompleted = 0;
		for (var p in glow.packages) {
			if (glow.packages[p] < Glow.STATE.completed) {
				notCompleted++;
				break;
			}
		}
		// if there are any packages that are less than complete, do nothing
		if (notCompleted == 0) {
			// run and remove each available onloaded callback
			while (glow.onloaded.length) {
				var f = glow.onloaded.shift();
				f(glow);
			}
		}
	}
	
	/**
		@name glow.ready
		@function
		@param {Function} onReadyCallback Called when all the packages load and the DOM is available.
		@description Do something when all the packages load and the DOM is ready.
	 */
	glow.ready = function(onReadyCallback) { /*debug*///console.log('ember glow.ready()');
		glow.loaded(function(glow) {
			glow.ready( function() { onReadyCallback(glow); } );
		});
		
		return glow;
	}
	
	/**
		@name _resolveVersion
		@private
		@function
		@param {string} version A (possibly imprecise) version identifier, like "2".
		@description Find the most recent, available version of glow that matches.
	 */
	function _resolveVersion(version) {
		// TODO: an empty version means: the very latest version
		
		var versions = Glow.versions,
			matchThis = '^' + version + '.';
		
		var i = versions.length;
		while (--i > -1) {
			if ( ('^' + versions[i] + '.').indexOf(matchThis) == 0 ) {
				return versions[i];
			}
		}
		
		// version 'src' is special, use to refer to a working copy of glow
		if (version == 'src') { return 'src'; }
		
		throw new Error('Version "'+version+'"does not exist');
	}
	
	/**
		@name _injectJs
		@private
		@function
		@description Start asynchronously loading an external js file.
	 */
	function _injectJs(src) { /*debug*///console.log('_injectJs("'+src+'")');
		if (src === undefined) { throw new Error('Glow-_injectJs requires a "src" argument.'); }
		
		var headElement = document.getElementsByTagName('head')[0];
		var scriptElement = document.createElement('script');
		scriptElement.type = 'text/javascript';
		scriptElement.src = src;
		scriptElement.className = 'Glow-injected';
		headElement.appendChild(scriptElement);
	}
	
	/**
		@name _findBase
		@private
		@function
		@description Guess what the base filepath is to the package files.
	 */
	function _findBase() { /*debug*///console.log('_injectJs("'+src+'")');
		// TODO
		throw new Error('Glow-_findBase is not implemented yet.');
	}
	
	// TODO many instances of the same version should refer to the same object
	Glow.instances[glow.version] = glow;
	
	// we always load core
	glow.load('core');
	
	return glow;
}

// must be in order: newest to latest
Glow.versions = ['2.0.0'];
Glow.instances = {};

/**
	@name Glow.provide
	@function
	@param {Object} def Definition of the code to build.
	@description provide some code to a Glow module.
 */
Glow.provide = function(def) { /*debug*///console.log('Glow.provide("'+def.toSource()+'")');
	if ( !Glow.instances[def.version] ) {
		// TODO handle unrequested code here
	}
	var glow = Glow.instances[def.version];
	if (def.builder) {
		def.builder(glow);
	}
	else {
		throw new Error('Glow.provide requires a builder().');
	}
}

/**
	@name Glow.complete
	@function
	@param {Object} packageDef
	@param {String} packageDef.packageName The name of the package that is now complete.
	@param {Number} packageDef.version The version of the package that is now complete.
	@description Tell the instance that onloaded can run.
 */
Glow.complete = function(def) {  /*debug*///console.log('Glow.complete("'+def.packageName+'")');
	var glow = Glow.instances[def.version];
	
	glow.packages[def.packageName] = Glow.STATE.completed;
	
	glow._runCallbacks();
}
