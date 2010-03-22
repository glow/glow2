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
			
			By default, items where the search term matches the start of the item
			(or its 'name' property) will be returned. You can change the
			filtering behaviour via {@link glow.ui.AutoSuggest#setFilter setFilter}.
			
			The matched item (or its 'name' property) will be displayed with the matching
			portion underlined. You can change the output via {@link glow.ui.AutoSuggest#setFormat setFormat}
		
		@param {Object} [opts] Options				
			@param {number} [opts.maxHeight] Apply a maximum height to the results list
				This does not impact the number of results, the user will be able to
				scroll to get to further results.
				
				By default, no maximum is imposed.
			@param {number} [opts.width] Apply a width to the results list
				By default, the AutoSuggest is the full width of its containing element,
				or the with of the input it's linked to.
			@param {number} [opts.maxResults] Limit the number of results to display
			@param {number} [opts.minLength=3] Minimum number of chars before search is executed
				This prevents searching being performed until a specified amount of chars
				have been entered.
			@param {boolean} [opts.caseSensitive=false] Whether case is important when matching suggestions.
		
		@example
			// Make an input auto-complete from an array of tags for a recipe database
			glow.ui.AutoSuggest()
				.data(['Vegetarian', 'Soup', 'Sandwich', 'Wheat-free', 'Organic', 'etc etc'])
				.linkToInput('#recipeTags');
			
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
			// Make an input suggest from an array of program names, where the
			// whole string is searched rather than just the start
			// When the item is clicked, we go to a url
			glow.ui.AutoSuggest().setFilter(function(item, val) {
				return item.name.indexOf(val) !== -1;
			}).data([
				{name: 'Doctor Who', url: '...'},
				{name: 'Eastenders', url: '...'},
				{name: 'The Thick Of It', url: '...'},
				// ...
			]).linkToInput('#programSearch').on('select', function(event) {
				location.href = event.selected.url;
			});
	*/
	function AutoSuggest(opts) {};
	
	glow.util.extend(AutoSuggest, glow.ui.Widget);
	AutoSuggestProto = AutoSuggest.prototype;
		
	/**
		@name glow.ui.AutoSuggest#input
		@type glow.NodeList
		@description Refers to the input element to which this is linked to, or an empty NodeList.
			Link an input to an AutoSuggest using {@link glow.ui.AutoSuggest#linkInput linkInput}
	*/
	AutoSuggestProto.input = glow();
	
	/**
		@name glow.ui.AutoSuggest#overlay
		@type glow.ui.Overlay
		@description The overlay linked to this autosuggest
			The Overlay is created when {@link glow.ui.AutoSuggest#linkInput linkInput} is
			called.
	*/
	
	/**
		@name glow.ui.AutoSuggest#setFilter
		@function
		@description Set the function used to filter the dataset for results
			Overwrite this to change the filtering behaviour.
		
		@param {function} filter Filter function.
			Your function will be passed 2 arguments, an item from the dataset and the term entered by the user, return
			true to confirm a match.
		  
			The default filter will return items where the search term matches the start of their 'name'
			property. If the dataset is simply an array of strings, that string will be used instead of the 'name' property
		
		@example
			// Search the name property for strings that contain val
			myAutoSuggest.setFilter(function(item, val) {
				return item.name.indexOf(val) !== -1;
			});
			
		@example
			// Search the tags property for strings that contain val surrounded by pipe chars
			// item.tags is like: |hello|world|foo|bar|
			myAutoSuggest.setFilter(function(item, val) {
				return item.tags.indexOf('|' + val + '|') !== -1;
			});
			
		@return this
	*/
	AutoSuggestProto.setFilter = function(filter) {};
	
	/**
		@name glow.ui.AutoSuggest#setFormat
		@function
		@description Control how matches are output.
			
		@param {function} formatter Function to generate output
			The first param to your function will be the matched item from your data list.
			The second param is the search value.
			
			Return an HTML string or glow.NodeList to display this item in the results
			list.
			
		@returns this
		
		@example
			// A username auto-complete
			
			// The data url returns a JSON object like [{name='JaffaTheCake', fullName:'Jake Archibald', photo:'JaffaTheCake.jpg'}, ...]
			glow.ui.AutoSuggest().setFormat(function() {
				// Format the results like <img src="JaffaTheCake.jpg" alt=""> Jake Archibald (JaffaTheCake)
				return '<img src="' + data.photo + '" alt=""> ' + data.fullName + ' (' + data.name + ')';
			}).data('userSearch.php?usernamePartial={val}').linkToInput('#username');
	*/
	AutoSuggestProto.setFormat = function(formatter) {};
		
	/**
		@name glow.ui.AutoSuggest#data
		@function
		@description Set the data or datasource to search
			This give the AutoSuggest the data to search, or the means to fetch
			the data to search.
			
		@param {string|string[]|Object[]|function} data Data or datasource
		
			<p><strong>URL</strong></p>
			
			A URL on the same domain can be provided, eg 'results.json?search={val}', where {val} is replaced
			with the search term. If {val} is used, the URL if fetched on each search, otherwide it is only fetched
			once on the first search. The URL must return a JSON object in the following string[] or Object[] formats.
			
			<p><strong>string[] or Object[] dataset</strong></p>
			
			An Array of strings can be provided, where each string is an object that can be matched.
			
			An Array of Objects can be provided, each object is an object that can be matched. By default
			the 'name' property of these objects is searched to determine a match, but {@link glow.ui.AutoSuggest#filter filter} can
			be used to change this.
			
			<p><strong>function</strong></p>
			
			A function can be provided, this is passed two arguments, the first is the search string, the 2nd is
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
			
		@returns this
	*/
	AutoSuggestProto.data = function(data) {};
	
	/**
		@name glow.ui.AutoSuggest#linkInput
		@function
		@description Link this autosuggest to a text input
			This triggers {@link glow.ui.AutoSuggest#find} when the value in
			the input changes.
			
			The AutoSuggest is placed in an Overlay beneath the input and displayed
			when results are found.
			
			If the input loses focus, or esc is pressed,
			the Overlay will be hidden and results cleared.
			
		@param {selector|glow.NodeList|HTMLElement} input Test input element
		
		@param {Object} [opts] Options
		@param {selector|glow.NodeList} [opts.appendTo] Add the AutoSuggest somewhere in the document rather than an {@link glow.ui.Overlay Overlay}
			If true, the AutoSuggest will be wrapped in an {@link glow.ui.Overlay Overlay} and
			appended to the document's body.
		
			If false, you need to add the {@link glow.ui.AutoSuggest#container AutoSuggest's container}
			to the document manually.
		@param {boolean} [opts.autoPosition=true] Place the overlay beneath the input
			If false, you need to position the overlay's container manually. It's
			recommended to do this as part of the Overlay's show event, so the
			position is updated each time it appears.
		@param {boolean} [opts.completeOnChoose=true] Update the input when an item is selected.
			This will complete the typed text with the result matched.
			
			You can create custom actions by listening for the
			{@link glow.ui.AutoSuggest#event:choose 'choose' event}
		@param {string} [opts.delim] Delimiting char for selections.
			When defined, the input text will be treated as multiple values,
			separated by this string (with surrounding spaces ignored).
		@param {number} [opts.delay=1.5] How many seconds to delay before searching.
			This prevents searches being made on each key press, instead it
			waits for the input to be idle for a given number of seconds.
			
		@returns this
	*/
	AutoSuggestProto.linkInput = function(input, opts) {};
	
	/**
		@name glow.ui.AutoSuggest#find
		@function
		@description Search the datasource for a given string
			This fetches results from the datasource and displays them. This
			may be an asyncrounous action if data needs to be fetched from
			the server.
		
		@param {string} str String to search for
			{@link glow.ui.AutoSuggest#filter AutoSuggest#filter} is used
			to determine whether results match or not.
			
		@returns this
	*/
	AutoSuggestProto.find = function(str) {};
	
	/**
		@name glow.ui.AutoSuggest#hide
		@function
		@description Clear the results so the AutoSuggest is no longer visible
			
		@returns this
	*/
	AutoSuggestProto.hide = function() {};
	
	/**
		@name glow.ui.AutoSuggest#event:data
		@event
		@description Fired when the dataset changes
			This can be the result of calling {@link glow.ui.AutoSuggest#data data} or
			new data has been fetched from the server.
			
			You can use this event to intercept and transform data into the
			correct JSON format.
			
			Cancel this event to ignore the new dataset, and continue
			with the current one.
		@param {glow.events.Event} event Event Object
		@param {*} event.dataset The new dataset
			You can modify / overwrite this property to alter the dataset
			
		@example
			myAutoSuggest.data('data.xml?search={val}').on('data', function(event) {
				// the data we get back is XML, we transform it to JSON
				// Note: xmlToJson is not a function defined by Glow
				event.data = xmlToJson( event.data );
			});
	*/
	
	/**
		@name glow.ui.AutoSuggest#event:results
		@event
		@description Fired when the dataset has been filtered but before HTML is output
			You can use this event to sort the dataset and/or add additional items
			
			Cancelling this event is equivalent to setting event.results to an
			empty array.
		@param {glow.events.Event} event Event Object
		@param {string[]|Object[]} event.results The filtered dataset
			You can modify / overwrite this property to alter the results
			
		@example
			myAutoSuggest.on('results', function(event) {
				// sort results by an 'author' property
				event.results = event.results.sort(function(a, b) {
					return a.author > b.author ? 1 : -1;
				});
				
				// Add a 'More...' item to the data set
				event.results.push( {name:'More...'} );
				
				// Behaviour will be added into the 'select' listener to handle what
				// happens when 'More...' is selected
			});
	*/
	
	/**
		@name glow.ui.AutoSuggest#event:choose
		@event
		@description Fired when an item in the AutoSuggest is chosen
			You can use this event to react to the user interacting with
			the AutoSuggest
			
			Cancel this event to prevent the default click action.
		@param {glow.events.Event} event Event Object
		@param {string|Object} event.item The item in the dataset that was selected
		@param {glow.NodeList} event.element The element in the AutoSuggest that was selected
			
		@example
			myAutoSuggest.on('choose', function(event) {
				// this assumes our data objects have a 'url' property
				loaction.href = event.selected.url;
			});
	*/
	
	/**
		@name glow.ui.AutoSuggest#event:find
		@event
		@description Fired when a search starts
			Cancel this event to prevent the search
		
		@param {glow.events.Event} event Event Object
		@param {string} event.val The search string
	*/
});