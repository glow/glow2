/**
		@name Glow
		@function
		@param {String} version The version of glow you wish to use.
		@description Create an instance of glow.
		@returns An ember.
 */
var Glow = function(version) {
	/**
		@private
		@name resolveVersion
		@function
	 */
	var resolveVersion = function(version) {
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
	
	var injectJs = function(src) { /*debug*///console.log('injectJs("'+src+'")');
		// inserting a script node causes the file to load asynchronously
		var headElement = document.getElementsByTagName('head')[0];
		var scriptElement = document.createElement('script');
		scriptElement.type = 'text/javascript';
		scriptElement.src = src;
		scriptElement.className = "Glow";
		headElement.appendChild(scriptElement);
	}
	
	/**
		@name glow
		@namespace
		@description A JavaScript library that's somewhat nifty.
	 */
	var glow = {
		version: resolveVersion(version),
		onloaded: function(){},
		onready: function(){},
		base: '',
		waitingFor: {},
		packages: {}
	};
	
	/**
		@name glow.load
		@function
		@param {String} ... One or more package names.
		@description Add modules to your glow.
	 */
	glow.load = function() {
		for (var i = 0, len = arguments.length; i < len; i++) {
			var packageName = arguments[i];
			
			// if the package is already loading or loaded, don't load it again
			if (glow.packages[packageName] === undefined) { // undefined means it was never loaded
				glow.packages[packageName] = false; // false means we're waiting on it
				
				injectJs(glow.base + glow.version + '/' + packageName + '.js');
			}
			else {
				glow.waitingFor[packageName] = true;
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
	glow.loaded = function(onLoadCallback) {
		glow.onloaded = onLoadCallback;
		// TODO
		return glow;
	}
	
	/**
		@name glow.ready
		@function
		@param {Function} onReadyCallback Called when all the packages load and the DOM is available.
		@description Do something when all the packages load and the DOM is ready.
	 */
	glow.ready = function(onReadyCallback) {
		glow.onready = onReadyCallback;
		// TODO
		return glow;
	}
	
	// TODO many instances of the same version should refer to the same object
	Glow.instances[glow.version] = glow;
	
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
	
	def.builder(glow);
}

/**
	@name Glow.complete
	@function
	@param {Object} packageDef
	@param {String} packageDef.packageName The name of the package that is now complete.
	@param {Number} packageDef.version The version of the package that is now complete.
	@description Tell the instance that onloaded can run.
 */
Glow.complete = function(def) {  /*debug*///console.log('Glow.complete("'+def.toSource()+'")');
	var glow = Glow.instances[def.version];
	
	glow.packages[def.packageName] = true; // true means it's loaded
	
	// stop waiting for this package
	delete glow.waitingFor[def.packageName];
	
	// are we done waiting yet?
	var waitCount = 0;
	for (var p in glow.waitingFor) { waitCount++; }
	
	if (waitCount == 0) { glow.onloaded(glow); }
}