testHelper = {
	getVersion: function() {
		var version = testHelper.conf.version;
		return version; 
	}
	,
	getBase: function() {
		var base = testHelper.conf.base + '/' + testHelper.getFrom() + '/';
		return base;
	}
	,
	getFrom: function() {
		var from = testHelper.conf.from;
		return from;
	}
	,
	addScript: function(scriptName, w) { /*debug*///console.log('addScript('+scriptName+')');
		var version = testHelper.getVersion(),
			base = testHelper.getBase();
		
		if (typeof w == 'undefined') { w = window; };

		w.document.write('<script src="' + base + version + '/' + scriptName + '" type="text/javascript"><'+'/script>')
	}
	,
	getScriptTagsBySrc: function(src, w) {
		if (!w) { w = window; }
		var scriptTags = w.document.getElementsByTagName('script');
		var found = [];
		for (var i = 0, len = scriptTags.length; i < len; i++) {
			if ( scriptTags[i].src.indexOf(src) > -1 ) {
				found.push(scriptTags[i]);
			}
		}
		return found;
	}
	,
	addFrame: function(src, callback) {
		var iframe = document.createElement('IFRAME'),
			name = "iframe_" +(new Date()).getTime();
			
		iframe.width = "1px";
		iframe.height = "1px";
		iframe.style.border = 'none';
		iframe.id = name; // prevent Safari from caching iframe data.
		iframe.src= src+'?nocache='+new Date().getTime();
		
		document.body.appendChild(iframe);
		
		if (frames[frames.length-1].name != name) frames[frames.length-1].name = name;
		frames[frames.length-1].log = log;
	
		if (callback) {
			if (!window.callbacks) { window.callbacks = {}; }					
			window.callbacks[name] = callback;
		}
		
		return name;
	}
	,
	removeFrame: function(frameId) {
		var frameElm = document.getElementById(frameId);
		frameElm.parentNode.removeChild(frameElm);
	}
};

// base can be augmented from the get params. Like: ?from=build or ?from=packages
testHelper.configure = function(opts) { /*debug*///console.log('testHelper.configure('+opts.toSource()+')');
	var pair,
		name,
		value,
		params = (window.location || { search: '', protocol: 'file:' }).search.slice(1).split('&');
	
	if (testHelper.confDefaults) {
		for (var key in testHelper.confDefaults) {
			if (testHelper.confDefaults.hasOwnProperty(key)) {
				testHelper.conf[key] = testHelper.confDefaults[key];
			}
		}
	}
		
	if (opts) {
		for (var key in opts) {
			if (opts.hasOwnProperty(key)) {
				testHelper.conf[key] = opts[key];
			}
		}
	}
	
	for (var i = 0; i < params.length; i++) {
		params[i] = decodeURIComponent(params[i]);
		
		pair = params[i].split('=', 2);
		name = decodeURIComponent(pair[0]);
		value = (pair.length==2)
			? decodeURIComponent(pair[1])
			: name;
		
		testHelper.conf[name] = value;
	}
}
testHelper.confDefaults = {
	from: 'packages',
	version: 'src'
};

testHelper.conf = window.testConf || {};

// read the 'base' parameter from our own script tag
// this is needed to get meta.js into the page before addScript is called
(function() {
	var scripts = document.getElementsByTagName('script');
	for (var i = scripts.length-1; i >= 0; i--) {
		// does this script tag look like it is pointing to gloader?
		var src = scripts[i].getAttribute('src');
		
		if (/testhelper\.js\?base=(.+)/.test(src)) {
			testHelper.conf.base = RegExp.$1;
		}
	}
})();

testHelper.configure();

// sets the version, only called when base is not built
function meta(opts) { /*debug*///console.log('meta('+opts.toSource()+')');
	testHelper.conf.version = opts.version;
	testHelper.conf.buildDate = opts.buildDate;
}		

if (testHelper.conf.from !== 'packages') {
	// this will call our meta() function
	document.write('<script src="' + testHelper.getBase() + '/meta.js" type="text/javascript"><'+'/script>');
}

// hooks into runall?
if (window.parent && parent.Harness && window.QUnit) {
	parent.Harness.attach(window.name, QUnit);
}

// display configuration details
window.onload = function() {
	var showVersion = document.getElementById('glow-version');
	
	if (showVersion) {
		showVersion.innerHTML = 'Test configuration: base: ' + testHelper.conf.base + '; version: ' + testHelper.conf.version+ '; build date: ' + testHelper.conf.buildDate;
	}
}