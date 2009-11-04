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
		throw new Error('Version "'+version+'"does not exist');
	}
	
	/**
		@name glow
		@namespace
		@description A JavaScript library that's somewhat nifty.
	 */
	var glow = {
		version: resolveVersion(version),
		onloaded: function(){},
		onready: function(){}
	};
	
	/**
		@name glow.load
		@function
		@param {String} ... One or more package names.
		@description Add modules to your glow.
	 */
	glow.load = function() {
		// TODO
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
	
	return glow;
}

// must be in order: newest to latest
Glow.versions = ['2.0.0'];