// track when document is ready, must run before the page is finished loading
if (!document.readyState) {
	document.readyState = 'loading';
	
	if (document.attachEvent) { // like IE
		document.attachEvent('onreadystatechange',
			function() {
				if (document.readyState == 'complete') {
					document.detachEvent('onreadystatechange', arguments.callee);
				}
			}
		);
	}
	else if (document.addEventListener) { // like Mozilla, Opera and recent webkit
		document.addEventListener('DOMContentLoaded',
			function () {
				document.removeEventListener('DOMContentLoaded', arguments.callee, false);
				document.readyState = 'complete';
			},
			false
		);
	}
}

(function() {
	var glowMap;
	
	/**
		@public
		@name Glow
		@constructor
		@description Factory for creating instances of the Glow JavaScript Library.
		@param {string} [version]
		@param {object} [opts]
		@param {string} [opts.base] The path to the base folder, in which the Glow versions are kept.
		@param {boolean} [opts.debug] Have all filenames modified to point to debug versions.
		@param {object} [opts.map] Use your own file map.
	 */
	window.Glow = function(version, opts) { /*debug*///report('new Glow("'+Array.prototype.join.call(arguments, '", "')+'")');
		var glowInstance;
		
		opts = opts || {};
		
		var debug = (opts.debug)? '.debug' : '';

		glowMap = {
			versions: ['2.0.0', '@'+'SRC@'],
			'2.0.0': {
				'core':    ['core'+debug+'.js'],
				'widgets': ['core', 'widgets'+debug+'.js', 'widgets'+debug+'.css']
			}
		};
		
		if (opts.map) { glowMap = opts.map; }
		
		version = getVersion(version); /*debug*///report('Version is "'+version+'"');
		
		if (Glow._build.instances[version]) { /*debug*///report('instance for "'+version+'" already exists.');
			return Glow._build.instances[version];
		}
		
		// opts.base should be formatted like a directory
		if (opts.base && opts.base.charAt(opts.base.length-1) !== '/') {
			opts.base += '/';
		}
		
		glowInstance = new glow(version, opts.base)
		Glow._build.instances[version] = glowInstance;
		
 		glowInstance.load('core'); // core is always loaded;
 		
		return glowInstance;
	}
	
	/**
		@private
		@name getVersion
		@function
		@param {string} version A (possibly imprecise) version identifier, like "2".
		@description Find the most recent, available version of glow that matches.
	 */
	var getVersion = function(version) { /*debug*///report('getVersion("'+version+'")');
		var versions = glowMap.versions,
			matchThis = version + '.';
		
		// TODO: an empty version means: the very latest version
		
		var i = versions.length;
		while (--i > -1) {
			if ( ( versions[i] + '.').indexOf(matchThis) === 0 ) {
				return versions[i];
			}
		}
		
		// src version is special, use it to refer to your working copy of glow
		if (version == '@'+'SRC@') { return 'src'; }
	
		throw new Error('Version "'+version+'" does not exist');
	}
	
	/**
		@private
		@name getMap
		@function
		@description Find the file map for a given version.
		@param {string} version Resolved identifier, like '2.0.0'.
		@returns {object} A map of package names to files list.
	 */
	var getMap = function(version, debug) { /*debug*///report('getMap("'+version+'")');
		var versions = glowMap.versions,
			map = null,
			versionFound = false;
		
		var i = versions.length;
		while (--i > -1) {
			if (glowMap[versions[i]]) { map = glowMap[versions[i]]; }
			if (versions[i] === version) { versionFound = true; }
			if (versionFound && map) { return map; }
		}
		
		throw new Error('No map available for version "' + version + '".');
	}
	
	/**
		@private
		@name injectJs
		@function
		@description Start asynchronously loading an external JavaScript file.
	 */
	var injectJs = function(src) { /*debug*///report('injectJs("'+src+'")');
		var head,
			script;
		
		head = document.getElementsByTagName('head')[0];
		script = document.createElement('script');
		script.src = src;
		script.type = 'text/javascript';
		
		head.appendChild(script);
	}
	
	/**
		@private
		@name injectCss
		@function
		@description Start asynchronously loading an external CSS file.
	 */
	var injectCss = function(src) { /*debug*///report('injectCss("'+src+'")');
		var head,
			link;
			
		head = document.getElementsByTagName('head')[0];
		link = document.createElement('link');
		link.href = src;
		link.type = 'text/css';
		link.rel = 'stylesheet';
		
		head.insertBefore(link, head.firstChild);
	}
	
	/** @private */
	Glow._build = {
		provided: [], // provided but not yet complete
		instances: {} // built
	}
	
	/**
		@private
		@name Glow.provide
		@function
		@param {function} builder A function to run, given an instance of glow, and will add a feature to glow.
		@description Provide a builder function to Glow as part of a package.
	 */
	Glow.provide = function(builder) { /*debug*///report('Glow.provide('+typeof builder+')');
		Glow._build.provided.push(builder);
	}
	
	/**
		@private
		@name Glow.complete
		@function
		@param {string} name The name of the completed package.
		@param {string} version The version of the completed package.
		@description Signals that no more builder functions will be provided by this package.
	 */
	Glow.complete = function(name, version) { /*debug*///report('complete('+name+', '+version+')');
		var glow,
			loaded,
			builders;

		// now that we have the name and version we can move the builders out of provided cache
		glow = Glow._build.instances[version];
		if (!glow) { /*debug*///report('Cannot complete, unnknown version of glow: '+version);
			throw new Error('Cannot complete, unnknown version of glow: '+version);
		}
		glow._build.builders[name] = Glow._build.provided;
		Glow._build.provided = [];

		// shortcuts
		loaded   = glow._build.loaded;
		builders = glow._build.builders;
		
		// try to build packages, in the same order they were loaded
		for (var i = 0; i < loaded.length; i++) { // loaded.length may change during loop
			if (!builders[loaded[i]]) { /*debug*///report(loaded[i]+' has no builders.');
				break;
			}
			
			// run the builders for this package in the same order they were loaded
			for (var j = 0, jlen = builders[loaded[i]].length; j < jlen; j++) { /*debug*///report('running builder '+j+ ' for '+loaded[i]+' version '+glow.version);
				builders[loaded[i]][j](glow); // builder will modify glow
			}
			
			// remove this package from the loaded and builders list, now that it's built
			builders[loaded[i]] = undefined;
			loaded.splice(i, 1);
			i--;
		}
		
		// try to run onLoaded callbacks
		glow._release();
	}
	
	/**
		@name glow
		@static
		@class
		@description An instance of the Glow library. Returned by calling new Glow().
		@property {string} version
		@property {string} base
	 */
	var glow = function(version, base) { /*debug*///report('new glow("'+Array.prototype.join.call(arguments, '", "')+'")');
		this.version = version;
		this.base = base || '';
		this.map = getMap(version);
		this._build = {
			loaded: [],    // names of packages requested but not yet built, in same order as requested.
			builders: {},  // completed but not yet built (waiting on dependencies). Like _build.builders[packageName]: [function, function, ...].
			history: {},   // names of every package ever loaded for this instance
			callbacks: []
		};
	}
	
	/**
		@public
		@name glow#load
		@function
		@description Add a package to this instance of the Glow library.
		@param {string[]} ... The names of 1 or more packages to add.
	 */
	glow.prototype.load = function() { /*debug*///report('glow.load("'+Array.prototype.join.call(arguments, '", "')+'") for version '+this.version);
		var name = '',
			src,
			depends;
		
		for (var i = 0, len = arguments.length; i < len; i++) {
			name = arguments[i];
			
			if (this._build.history[name]) { /*debug*///report('already loaded package "'+name+'" for version '+this.version+', skipping.');
				continue;
			}
			
			this._build.history[name] = true;
			
			// packages have dependencies, listed in the map: a single js file, css files, or even other packages
			depends = this.map[name]; /*debug*///report('depends for '+name+' '+this.version+': "'+depends.join('", "')+'"');
			for (var j = 0, lenj = depends.length; j < lenj; j++) {
				
				if (depends[j].slice(-3) === '.js') { /*debug*///report('dependent js: "'+depends[j]+'"');
					src = this.base + this.version + '/' + depends[j];
					this._build.loaded.push(name);
					injectJs(src);
				}
				else if (depends[j].slice(-4) === '.css') { /*debug*///report('dependent css "'+depends[j]+'"');
					src = this.base + this.version + '/' + depends[j];
					injectCss(src);
				}
				else { /*debug*///report('dependent package: "'+depends[j]+'"');
					this.load(depends[j]); // recursively load dependency packages
				}
			}
		}
		
		return this;
	};
	
	/**
		@public
		@name glow#loaded
		@function
		@param {function} onLoadCallback Called when all the packages load.
		@description Do something when all the packages load.
	 */
	glow.prototype.loaded = function(onLoadCallback) { /*debug*///report('glow.loaded('+typeof onLoadCallback+') for version '+this.version);
		if (this._addReadyBlock) { this._addReadyBlock('glow_loading'); }
		
		this._build.callbacks.push(onLoadCallback);
	
		this._release();
		
		return this;
	}
	
	/**
		@private
		@name glow#_release
		@function
		@description If all loaded packages are now built, then run the onLoaded callbacks.
	 */
	glow.prototype._release = function() { /*debug*///report('glow._release("'+this.version+'")');
		var callback;
		
		if (this._build.loaded.length !== 0) { /*debug*///report('waiting for '+this._build.loaded.length+' to finish.');
			return;
		}
		/*debug*///report('running loaded callbacks for version "'+this.version+'"');
		
		// run and remove each available _onloaded callback
		while (this._build.callbacks.length) {
			callback = this._build.callbacks.shift();
			callback(this);
		}
		
		if (this._removeReadyBlock) { this._removeReadyBlock('glow_loading'); }
	}
	
	/**
		@name glow#ready
		@function
		@param {function} onReadyCallback Called when all the packages load and the DOM is available.
		@description Do something when all the packages load and the DOM is ready.
	 */
	glow.prototype.ready = function(onReadyCallback) { /*debug*///report('(ember) glow#ready('+typeof onReadyCallback+') for version '+this.version+'. There are '+this._build.loaded.length+' loaded packages waiting to be built.');
		this.loaded(function(glow) {
			glow.ready( function() { onReadyCallback(glow); } );
		});

		return this;
	}
})();