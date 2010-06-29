/**
	@name glow.flash
	@namespace
	@description Methods for detecting and embedding Flash
*/
Glow.provide(function(glow) {
	var undefined,
		flash = {},
		ActiveX = window.ActiveXObject,
		widthHeightStr = ' width="100%" height="100%"',
		flashMimeType = 'application/x-shockwave-flash',
		nonIeFlashHtml = '<object type="' + flashMimeType + '"' + widthHeightStr + '></object>',
		util = glow.util,
		apply = util.apply,
		// these are populated on the first call to glow.flash.installed
		cachedVersionDetails,
		cachedVersionString;

	/**
		@private
		@function
		@description Is the flash plugin installed and active?
			This only works for non-IE browsers (as in, not activex)

		@returns {boolean}
	 */
	function flashPluginInstalled() {
		var nav = navigator,
			plugins = nav.plugins,
			mimeTypes = nav.mimeTypes,
			flashMimeNav;

		if ( plugins && plugins['Shockwave Flash'] ) {
			// this catches Safari, which indicates Flash is installed even when it's disabled.
			// basically, if Flash exists in navigator.mimeTypes, ensure it's enabled
			return !( mimeTypes && (flashMimeNav = mimeTypes[flashMimeType]) && !flashMimeNav.enabledPlugin );
		}
		return false;
	}

	/**
		@private
		@function
		@descrption Gets the installed version & populates cachedVersionDetails & cachedVersionString
		@returns {number[]} An array of version numbers, so 10.0.32.18 would be [10, 0, 32, 18]
	 */
	// this function only runs once per page. Thanks to swfobject for some of the ideas used here.
	function getVersionDetails() {
		var flashInstance,
			versionString,
			i;

		cachedVersionDetails = [];
		cachedVersionString = '';

		// for IE
		if (ActiveX) {
			// this may be null if activeX disabled, hence default object
			try {
				flashInstance = new ActiveX('ShockwaveFlash.ShockwaveFlash');
			}
			catch (e) {}
			flashInstance = flashInstance || {};
		}
		else {
			// we use flashPluginInstalled to avoid adding a flash movie to the page which triggers "Oi! You want a plugin?" browser messages.
			// The flash movie needs to go onto the body before it correctly reports version info.
			flashInstance = flashPluginInstalled() ? glow(nonIeFlashHtml).prependTo(document.body)[0] : {};
		}

		if (flashInstance.GetVariable && (versionString = flashInstance.GetVariable('$version')) ) {
			cachedVersionString = versionString.split(' ')[1].replace(/,/g, '.');
			cachedVersionDetails = cachedVersionString.split('.');

			// convert parts to numbers
			i = cachedVersionDetails.length;

			while (i--) {
				cachedVersionDetails[i] = cachedVersionDetails[i] - 0;
			}

			// remove it from the document if we added it
			flashInstance.parentNode && glow(flashInstance).destroy();
		}

		return cachedVersionDetails;
	}

	/**
		@private
		@function
		@param {object} params Name-value object of params
		@returns {string} String of param elements
	 */
	function createParamStr(params) {
		var paramStr = '';

		for (var paramName in params) {
			if ( params.hasOwnProperty(paramName) ) {
				paramStr += util.interpolate('<param name="{name}" value="{value}">', {
					name: paramName,
					value: params[paramName]
				}, {
					escapeHtml: true
				});
			}
		}

		return paramStr;
	}

	/**
		@name glow.flash.installed
		@type function
		@description Gets the version string, or checks the user has a particular version.
		
		@param {string|number} [assertMin] Check the user has this version (or later) installed.
		
		@example
			var installedVersion = glow.flash.installed();
		
		@example
			if ( glow.flash.installed(10.1) ) {
				// etc
			}
	*/
	function installed(assertMin) {
		/*!debug*/
			if (!document.body) {
				glow.debug.warn('glow.flash cannot be used before <body>');
			}
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.flash.installed expects 0 or 1 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/

		var installedVersion = cachedVersionDetails || getVersionDetails(),
			assertMinParts,
			partNum;

		if (assertMin === undefined) {
			return cachedVersionString;
		}

		// normalise to an array of version parts
		assertMinParts = (typeof assertMin === 'number') ? [assertMin] : assertMin.split('.');

		/*!debug*/
			var i = assertMinParts.length;
			while (i--) {
				if ( isNaN(assertMinParts[i]) ) {
					glow.debug.warn('[wrong format] glow.flash Version must be in format number, number.number or number.number.number');
				}
			}
		/*gubed!*/

		for (var i = 0, len = assertMinParts.length; i < len; i++) {
			partNum = assertMinParts[i]-0;
			if ( installedVersion[i] != partNum ) {
				return installedVersion[i] > partNum;
			}
		}

		return true;
	}
	flash.installed = installed;

	/**
		@name glow.flash.create
		@function
		@description Create a flash movie to embed.
			By default the movie will take on the dimensions of the parent element. Either set a height on the parent
	 		element, or set a height on the flash movie (see examples).

	 	@param {string} swfUrl Url of the movie.
		@param {string|number} minVer The minimum required version of the Flash plugin for this movie.
			The Flash plugin has a version numbering scheme comprising of major,
			minor and release numbers.
			
			This param can be a string with the major number only, major plus
			minor numbers, or full three-part version number, e.g. '9', '9.1',
			'6.0.55' are all valid values.
		@param {Object} [opts] Options
			@param {Object} [opts.params] Flash-specific key-value parameters.
				For example quality, wmode, bgcolor.
			@param {Object|string} [opts.flashVars] Values to send into the Flash movie.
				This can be an object of key-value pairs or a url-encoded string.
			@param {NodeList|string|HTMLElement} [opts.alt] Alternate content to display if embedding fails.
				Embedding fails if the user does not have the correct version of the Flash plugin.
				
				By default, this is `You need to install the latest version of Flash to play this content. &lt;a href="http://get.adobe.com/flashplayer/"&gt;Download the Flash player now.&lt;/a&gt;.`
		
		@returns {glow.NodeList} NodeList containing flash movie or alternate content.
		
		@example
			// embed a movie into a container
			glow.flash.create('whatever.swf', 10).appendTo('#movieContainer');
			
		@example
			// embed a movie, specifying width, height, flashvars & alternate content
			glow.flash.create('game.swf', 9, {
				flashVars: {
					startLevel: 0,
					timer: 300
				},
				alt: 'Games on this site require Flash 9. <a href="http://get.adobe.com/flashplayer/">Get Flash</a>'
			}).width(512).height(360).appendTo('#movieContainer');
			
		@example
			// embed a movie, replacing the content of an element
			glow.flash.create('whatever.swf', 10, {
				// Remove the current #movieContainer content, but set it as alt content
				alt: glow('#movieContainer').children().remove()
			}).appendTo('#movieContainer');
	*/
	function create(swfUrl, minVer, opts) {
		opts = apply({
			flashVars: '',
			alt: 'You need to install the latest version of Flash to play this content. <a href="http://get.adobe.com/flashplayer/">Download the Flash player now.</a>.'
		}, opts);

		var flashNodeList,
			flashVars = opts.flashVars,
			alt = opts.alt,
			// shallow-clone the param object incase the uses re-uses it
			params = apply({}, opts.params);

		// is version correct?
		if ( !installed(minVer) ) {
			if (typeof alt == 'string') {
				alt = glow.NodeList._strToNodes(alt);
			}
			return glow(alt);
		}

		// set flash vars as param
		if (typeof flashVars == 'object') {
			flashVars = util.encodeUrl(flashVars);
		}
		params.flashvars = flashVars;

		// create flash elements
		// for IE...
		if (ActiveX) {
			params.movie = swfUrl;
			flashNodeList = glow('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + widthHeightStr + '>' + createParamStr(params) + '</object>');
		}
		// for others...
		else {
			flashNodeList = glow(nonIeFlashHtml).append( createParamStr(params) ).attr('data', swfUrl);
		}

		return flashNodeList;
	}
	flash.create = create;

	// export
	glow.flash = flash;
});