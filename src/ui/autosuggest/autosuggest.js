Glow.provide(function(glow) {
	var undefined, AutoSuggestProto;
	
	/**
		@name glow.ui.AutoSuggest
		@extends glow.ui.Widget
		@constructor
		@description Create a menu that displays results filtered by a search term
			This widget can be easily linked to a text input via {@link glow.ui.AutoSuggest#linkToInput}
			so results will be filtered by text entered by the user. This appears as a list of selectable
			items below the input element (optional) which dynamically updates based on what
			has been typed so far.
		
		@param {Object} [opts] Options				
			@param {number} [opts.maxHeight] Apply a maximum height to the results list
				This does not impact the number of results, the user will be able to
				scroll to get to further results.
				
				By default, no maximum is imposed.
			@param {number} [opts.maxResults] Limit the number of results to display
			@param {number} [opts.minLength=3] Minimum number of chars before search is executed
				This prevents searching being performed until a specified amount of chars
				have been entered.
			@param {function} [opts.formatItem] Given the matched data item, return HTML or NodeList.
				The first param to your function will be the matched item from your data list. Use
				this to create an HTML output (either a {@link glow.NodeList NodeList} or string of HTML).
				
				By default, the matched item (or its 'name' property) will be displayed.
			@param {boolean} [opts.caseSensitive=false] Whether case is important when matching suggestions.
			@param {function} [opts.filter] Provide a custom function to filter the dataset for results
				This is a shortcut to setting {@link glow.ui.AutoSuggest#filter AutoSuggest#filter}.
		
		@example
			// Make an input auto-complete from an array of tags for a recipe database
			glow.ui.AutoSuggest()
				.data(['Vegetarian', 'Soup', 'Sandwich', 'Wheat-free', 'Organic', 'etc etc'])
				.linkToInput('#recipeTags');
	
		@example
			// A username auto-complete
			
			// The data url returns a JSON object like [{name='JaffaTheCake', fullName:'Jake Archibald', photo:'JaffaTheCake.jpg'}, ...]
			glow.ui.AutoSuggest({
				// Format the results like <img src="JaffaTheCake.jpg" alt=""> Jake Archibald (JaffaTheCake)
				formatItem: function(data) {
					return '<img src="' + data.photo + '" alt=""> ' + data.fullName + ' (' + data.name + ')';
				}
			}).data('userSearch.php?usernamePartial={val}').linkToInput('#username');
			
		@example
			// An AutoSuggest embedded in the page, rather than in an overlay
			var myAutoSuggest = glow.ui.AutoSuggest()
				.data('recipe.php?ingredients={val}')
				.linkToInput('#username', {
					// don't use an overlay, we'll add the autosuggest to the document outselves
					useOverlay: false
				});
			
			// add the results into the document
			myAutoSuggest.container.appendTo('#results');
			
		@example
			// Getting the data from another domain, via JSONP
			glow.ui.AutoSuggest().linkToInput('#flickrSearch')
				.data(function(val, callback) {
					// TODO, change this once glow.net.* is complete
					getDataFromOtherDomain(url).on('load', function(data) {
						callback(data);
					});
				});
			
		@example
			// Make an input suggest from an array of program names, where the
			// whole string is searched rather than just the start
			glow.ui.AutoSuggest({
				filter: function(item, val) {
					return item.indexOf(val) !== -1;
				}
			}).data(
				['Doctor Who', 'Eastenders', 'The Thick of it', 'etc etc']
			).linkToInput('#programSearch');
	*/
	function AutoSuggest(opts) {};
	
	glow.util.extend(AutoSuggest, glow.widgets.Widget);
	AutoSuggestProto = AutoSuggest.prototype;
		
	/**
		@name glow.widgets.AutoSuggest#input
		@type glow.NodeList
		@description Refers to the input element to which this is linked to, or an empty NodeList.
	*/
	AutoSuggestProto.input = glow();
	
	/**
		@name glow.widgets.AutoSuggest#filter
		@type function
		@description The function used to filter the dataset for results
			Overwrite this to change the filtering behaviour.
		
			Your function will be passed 2 arguments, an item from the dataset and the term entered by the user, return
			true to confirm a match.
		  
			The default filter will return items where the search term matches the start of their 'name'
			property. If the dataset is simply an array of strings, that string will be used instead of the 'name' property
		
		@example
			// Search the name property for strings that contain val
			myAutoSuggest.filter = function(item, val) {
				return item.name.indexOf(val) !== -1;
			};
			
		@example
			// Search the tags property for strings that contain val surrounded by pipe chars
			// item.tags is like: |hello|world|foo|bar|
			myAutoSuggest.filter = function(item, val) {
				return item.tags.indexOf('|' + val + '|') !== -1;
			};
	*/
	AutoSuggestProto.filter = function(item, val) {};
		
	/**
		@name glow.widgets.AutoSuggest#data
		@function
		@description Set the data or datasource to search
			This give the AutoSuggest the data to search, or the means to fetch
			the data to search.
			
		@param {string|string[]|Object[]|function} data Data or datasource
		
			<p><strong>URL</strong></p>
			
			A URL on the same domain can be provided, eg 'results.json?search={val}', where {val} is replaced
			with the search term. If {val} is used, the URL if fetched on each search, otherwide it is only fetched
			once on the first search. The URL must return a JSON object in the following string[] or Object[] formats.
			
			<p><strong>JSON</strong></p>
			
			An Array of strings can be provided, where each string is an object that can be matched.
			
			An Array of Objects can be provided, each object is an object that can be matched. By default
			the 'name' property of these objects is searched to determine a match, but {@link glow.widgets.AutoSuggest#filter filter} can
			be used to change this.
			
			<p><strong>Function</strong></p>
			
			A function can be provided, this is passed 2 params, the first is the search string, the 2nd is
			a callback.
			
			Once your data has arrived, call the callback passing in your data as the first
			param, or call the callback with no params to continue with the previous dataset. Until the
			callback is called, the AutoSuggest remains in a 'loading' state.
			
			Your function will be called multiple times, ensure you cancel any existing
			requests before starting a new one.
			
		@example
			// providing a URL
			myAutoSuggest.data('/search?text={val}');
			
		@example
			// providing an array of program names
			myAutoSuggest.data( ['Doctor Who', 'Eastenders', 'The Thick of it', 'etc etc'] );
			
		@example
			// providing an object of user data
			myAutoSuggest.data([
				{name='JaffaTheCake', fullName:'Jake Archibald', photo:'JaffaTheCake.jpg'},
				{name='Bobby', fullName:'Robert Cackpeas', photo:'Bobby.jpg'}
				...
			]);
			
		@example
			// Getting the data via jsonp
			// TODO: update this for new glow.net
			
			var request;
			myAutoSuggest.data(function(val, callback) {
				// abort previous request
				request && request.abort();
				
				glow.net.loadScript('http://blah.com/data?callback={callback}&val=' + val)
					.on('load', function(data) {
						callback(data);
					})
			});
	*/
	AutoSuggestProto.data = function(data) {};
});