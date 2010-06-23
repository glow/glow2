/**
	@name glow.embed
	@namespace
	@description Embed media
*/
Glow.provide(function(glow) {
	var undefined,
		embed = {};
	
	/**
		@name glow.embed.flash
		@function
		@description Create a flash movie to embed.
		
	 	@param {string} swfUrl Url of the movie.
		@param {string|number} The minimum required version of the Flash plugin for this movie.
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
			glow.embed.flash('whatever.swf', 10).appendTo('#movieContainer');
			
		@example
			// embed a movie, specifying width, height, flashvars & alternate content
			glow.embed.flash('game.swf', 9, {
				flashVars: {
					startLevel: 0,
					timer: 300
				},
				alt: 'Games on this site require Flash 9. <a href="http://get.adobe.com/flashplayer/">Get Flash</a>'
			}).width(512).height(360).appendTo('#movieContainer');
			
		@example
			// embed a movie, replacing the content of an element
			glow.embed.flash('whatever.swf', 10, {
				// Remove the current #movieContainer content, but set it as alt content
				alt: glow('#movieContainer').children().remove()
			}).appendTo('#movieContainer');
	*/

	// export
	glow.embed = embed;
});