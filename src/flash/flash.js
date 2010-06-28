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
		nonIeFlashHtml = '<object type="application/x-shockwave-flash"' + widthHeightStr + '></object>',
		util = glow.util,
		apply = util.apply,
		// these are populated on the first call to glow.flash.installed
		cachedVersionDetails,
		cachedVersionString;

	/**
		@private
		@function
		@descrption Gets the installed version & populates cachedVersionDetails & cachedVersionString
		@returns {number[]} An array of 3 version numbers, so 10.0.0 would be [10, 0, 0]
	 */
	// this function only runs once per page. Thanks to swfobject for some of the ideas used here.
	function getVersionDetails() {
		var flashInstance,
			versionString,
			i;

		// todo: ensure document.body is present

		cachedVersionDetails = [];
		cachedVersionString = '';

		// for IE
		if (ActiveX) {
			flashInstance = new ActiveX('ShockwaveFlash.ShockwaveFlash');
		}
		else {
			// this needs to go onto the body before it works correctly
			flashInstance = glow(nonIeFlashHtml).prependTo(document.body)[0];
		}

		if (flashInstance && (versionString = flashInstance.GetVariable('$version')) ) {
			cachedVersionString = versionString.split(' ')[1].replace(/,/g, '.');
			cachedVersionDetails = cachedVersionString.split('.').slice(0, 3);

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
		// Todo: gubeds

		var installedVersion = cachedVersionDetails || getVersionDetails(),
			assertMinParts;

		if (assertMin === undefined) {
			return cachedVersionString;
		}

		// normalise to an array of version parts
		assertMinParts = (typeof assertMin === 'number') ? [assertMin] : assertMin.split('.');

		// todo: check the format of assertMinParts

		for (var i = 0, len = assertMinParts.length; i < len; i++) {
			if ( installedVersion[i] < assertMinParts[i]-0 ) {
				return false;
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
				
				By default, this is a message asking the user to update their Flash player.
		
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
		// todo: cater for leaks in IE

		opts = apply({
			flashVars: '',
			// todo: get the official default for this. Special mesage for iOS?
			alt: 'This Flash movie requires Flash ' + minVer + '. <a href="http://get.adobe.com/flashplayer/">Get Flash</a>.'
		}, opts);

		var flashNodeList,
			param,
			flashVars = opts.flashVars,
			// shallow-clone the param object incase the uses re-uses it
			params = apply({
				movie:swfUrl
			}, opts.params);

		// is version correct?
		if ( !installed(minVer) ) {
			return glow(opts.alt);
		}

		// create flash elements
		// for IE...
		if (ActiveX) {
			flashNodeList = glow('<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + widthHeightStr + '></object>');
		}
		// for others...
		else {
			flashNodeList = glow(nonIeFlashHtml);
		}

		// add flash vars
		if (typeof flashVars == 'object') {
			flashVars = util.urlEncode(flashVars);
		}
		params.flashvars = flashVars;

		// add params
		for (var paramName in params) {
			if ( params.hasOwnProperty(paramName) ) {
				param = document.createElement('param');
				param.name = paramName;
				param.value = params[paramName];
				flashNodeList[0].appendChild(param);
			}
		}

		return flashNodeList//.attr('data', swfUrl);
	}
	flash.create = create;

	// export
	glow.flash = flash;
});