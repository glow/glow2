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
		_packageStatus: {},    // track which packages are already done. like: {packageName: (undefined|false|true)}
		_buildQueue: {},       // when packages complete they go here. like: {packageName: [builders]}
		_buildQueueCache: []   // as builders are provided we stash them here
	};
	
	var undefined; // local, which we know is truly undefined
	
	/**
		@name glow.load
		@function
		@param {String} ... One or more package names.
		@description Include packages, which will rovide some modules to your glow.
	 */
	glow.load = function(/*...*/) { /*debug*///console.log('glow.load('+Array.prototype.join.call(arguments, ', ')+')');
		var map,
			packageName;
		
		map = _getMap(glow.version);
		
		for (var i = 0, li = arguments.length; i < li; i++) {
			packageName = arguments[i];
			
			// package is not built yet
			if (glow._packageStatus[packageName] === undefined) {
				glow._packageStatus[packageName] = false; // add a placeholder for it
				
				// the package files were not added to the page yet
				if (!glow._buildQueue[packageName]) {
					glow._buildQueue[packageName] = []; // add a placeholder for them
					
					// add the files required for this package to the page
					if (map.files[packageName]) {
						_injectFiles(map.files[packageName]);
					}
				}
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
	
	glow._tryBuildAll = function() { /*debug*///console.log('glow._tryBuildAll()');
		var depends = ['core', 'more', 'widgets'], // the order in which to build TODO: should be in the map
			packageName,
			builder;
		
		// if any requested packages are not yet complete, we can skip building
		for (var p in glow._buildQueue) {
			if (glow._buildQueue[p].length == 0) { // _buildQueue is only given builders when it is complete
				return false;
			}
		}
		
		// all packages have all their builders, now we can build them in the right order
		for (var i = 0, li = depends.length; i < li; i++) {
			packageName = depends[i];
			if (glow._buildQueue[packageName]) {
				for (var j = 0, lj = glow._buildQueue[packageName].length; j < lj; j++) {
					builder = glow._buildQueue[packageName][j];
					builder(glow);
				}
			}
			glow._packageStatus[packageName] = true; // indicate that it's now been added to glow
		}
		
		return true;
	}
	
	/**
		@name _runCallbacks
		@private
		@function
		@description Try to run any pending 'onloaded' callbacks.
	 */
	glow._runCallbacks = function() { /*debug*///console.log('glow._runCallbacks() ' + glow.onloaded.length);
		//if there are no onloaded callbacks in the list, do nothing
		if (glow.onloaded.length == 0) { return; }
		
		// if there are any packages that are still not built, do nothing
		for (var p in glow._packageStatus) {
			if (!glow._packageStatus[p]) {
				return
			}
		}

		// run and remove each available onloaded callback
		while (glow.onloaded.length) {
			var f = glow.onloaded.shift();
			f(glow);
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
			matchThis = version + '.';
		
		var i = versions.length;
		while (--i > -1) {
			if ( ( versions[i] + '.').indexOf(matchThis) == 0 ) {
				return versions[i];
			}
		}
		
		// src version is special, use it to refer to your working copy of glow
		if (version == '@SRC@') { return '@SRC@'; }
		
		throw new Error('Version "'+version+'" does not exist');
	}
	
	/**
		@name _injectFiles
		@private
		@function
		@param {string} packageFiles Like 'packageName:file1.js,file2.js,file3.css'
		@description Parse out filenames and inject them into the page.
	 */
	function _injectFiles(packageFiles) { /*debug*///console.log('_injectfiles("'+packageFiles+'")');
		var filename;
			
		for (var i = 0, li = packageFiles.length; i < li; i++) {
			filename = packageFiles[i];
			
			if (/\.js$/.test(filename)) {
				_injectJs(_makePath(glow.version, filename));
			}
			else if (/\.css$/.test(filename)) {
				_injectCss(_makePath(glow.version, filename));
			}
		}
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
		@name _injectCss
		@private
		@function
		@description Start asynchronously loading an external css file.
	 */
	function _injectCss(src) { /*debug*///console.log('_injectCss("'+src+'")');
		if (src === undefined) { throw new Error('Glow-_injectCss requires a "src" argument.'); }

		var headElement = document.getElementsByTagName('head')[0];
		var link = document.createElement('link');
		link.href = src;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		link.className = 'gloaded async';
		headElement.appendChild(link);
	}
	
	/**
		@name _makePath
		@private
		@function
		@description Build a path to a package file from the package properties.
	 */
	function _makePath(version, filename) { /*debug*///console.log('_makePath("'+version+', '"+filename+")');
		version = (version == '@SRC@')? 'src' : version;
		return glow.base + version + '/' + filename;
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
	
	/**
		@name _getMap
		@private
		@function
		@description Find the file map for a given version.
		@param {string} version Resolved identifier, like '2.0.0'.
		@returns {object} A map of package names to files list.
	 */
	function _getMap(version) { /*debug*///console.log('_getMap("'+version+'")');
		var versions = Glow.versions,
			files = Glow.files,
			map,
			versionFound;
		
		var i = versions.length;
		while (--i > -1) {
			if (files[versions[i]]) { map = files[versions[i]]; }
			if (versions[i] == version) { versionFound = true; }
			if (versionFound && map) return map;
		}
		
		throw new Error('No files are defined for version "' + version + '".');
	}
	
	Glow.instances[glow.version] = glow;
	
	// we always load core
	glow.load('core');
	
	return glow;
}

// versions must be in order: newest to latest
// like 'version:filesOffset'
Glow.versions = ['2.0.0', '@SRC@'];
Glow.files = {
	'2.0.0': {
		packages: ['core', 'widgets'],
		files: {
			core: ['core.js'],
			widgets: ['widgets.js', 'widgets.css']
		}
	}
};
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
		glow._buildQueueCache.push(def.builder);
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
Glow.complete = function(def) { /*debug*///console.log('Glow.complete("'+def.packageName+'")');
	var glow = Glow.instances[def.version];
	
	// flush builder cache into the queue
	glow._buildQueue[def.packageName] = glow._buildQueueCache;
	glow._buildQueueCache = [];
	
	// try to build the queue
	if (glow._tryBuildAll()) {
		glow._runCallbacks();
	}
}
