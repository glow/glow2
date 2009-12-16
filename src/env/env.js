Glow.provide({version: '@SRC@', builder:function(glow) {
	/**
		@name glow.env
		@namespace
		@description Information about the browser and characteristics
	*/
	
	// parse the useragent string, setting NaN if match isn't found
	var ua = navigator.userAgent.toLowerCase(),
		nanArray = [0, NaN],
		opera  = (/opera[\s\/]([\w\.]+)/.exec(ua) || nanArray)[1],
		ie     = opera ? NaN : (/msie ([\w\.]+)/.exec(ua) || nanArray)[1],
		gecko  = (/rv:([\w\.]+).*gecko\//.exec(ua) || nanArray)[1],
		webkit = (/applewebkit\/([\w\.]+)/.exec(ua) || nanArray)[1],
		khtml  = (/khtml\/([\w\.]+)/.exec(ua) || nanArray)[1],
		toNumber = parseFloat,
		env = {};
	
	/**
		@name glow.env.gecko
		@type number
		@description Gecko version number to one decimal place (eg 1.9) or NaN on non-gecko browsers.
			The most popular browser using the Gecko engine is Firefox.
		
		@see <a href="http://en.wikipedia.org/wiki/Gecko_(layout_engine)#Usage">Versions of Gecko used by browsers</a>
		
		@example
			if (glow.env.gecko < 1.9) {
				// runs in Firefox 2 and other browsers that use Gecko earlier than 1.9
			}
	*/
	env.gecko = toNumber(gecko);
	
	/**
		@name glow.env.ie
		@type number
		
		@description IE version number to one decimal place (eg 6.0) or NaN on non-IE browsers.
			This number will also be populated for browser based on IE's trident engine
			
		@example
			if (glow.env.ie < 9) {
				// runs in IE pre-9.0
				glow('#content').css('background', 'deadmoomin.png');
			}
	*/
	env.ie = toNumber(ie);
	
	/**
		@name glow.env.opera
		@type number
		
		@description Opera version number to one decimal place (eg 10.0) or NaN on non-Opera browsers.
		
		@example
			if (glow.env.opera < 10) {
				// runs in Opera pre-10.0
			}
	*/
	env.opera = toNumber(opera);
	
	/**
		@name glow.env.webkit
		@type number
		
		@description Webkit version number to one decimal place (eg 531.9) or NaN on non-Webkit browsers.
			Safari and Google Chrome are the most popular browsers using Webkit.
			
		@see <a href="http://en.wikipedia.org/wiki/Safari_version_history#Release_history">Versions of Webkit used by Safari</a>
		@see <a href="http://en.wikipedia.org/wiki/Google_Chrome#Release_history">Versions of Webkit used by Google Chrome</a>
			
		@example
			if (glow.env.webkit < 526) {
				// runs in Safari pre-4.0, and Chrome pre-1.0
			}
	*/
	env.webkit = toNumber(webkit);

	/**
		@name glow.env.khtml
		@type number
		
		@description KHTML version number to one decimal place or NaN on non-KHTML browsers.
			Konqueror is the most popular browsers using KHTML.
	*/
	env.khtml = toNumber(khtml);
	
	/**
		@name glow.env.standardsMode
		@type boolean
		@description True if the browser reports itself to be in 'standards mode'
			Otherwise, the browser is in 'quirks mode'
			
		@see <a href="http://en.wikipedia.org/wiki/Quirks_mode">Quirks Mode vs Standards Mode</a>
	*/
	env.standardsMode = document.compatMode != "BackCompat" && (!env.ie || env.ie >= 6);
	
	/**
		@name glow.env.version
		@type string
		@description Version number of the browser in use as a string.
			This caters for version numbers that aren't 'real' numbers, like "7b" or "1.9.1"
	*/
	env.version = ie || gecko || webkit || opera || khtml || '';
	
	// export
	glow.env = env;
}});