Glow.provide(function(glow) {
	var undefined, AutoSuggestProto,
		Widget = glow.ui.Widget,
		WidgetProto = Widget.prototype,
		// this is used for HTML escaping in _format and checking max-height
		tmpDiv = glow('<div></div>'),
		supportsMaxHeight;
	
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
				or the width of the input it's linked to if autoPositioning.
			@param {number} [opts.maxResults] Limit the number of results to display
			@param {number} [opts.minLength=3] Minimum number of chars before search is executed
				This prevents searching being performed until a specified amount of chars
				have been entered.
			@param {boolean} [opts.caseSensitive=false] Whether case is important when matching suggestions.
				If false, the value passed to the filter will be made lowercase, a custom filter
				must also lowercase the property it checks.
			@param {boolean} [opts.activateFirst=true] Activate the first item when results appear?
				If false, results with be shown with no active item.
			@param {function|string} [opts.keyboardNav='arrow-y'] Alter the default keyboard behaviour.
				This is the same as keyboardNav in {@link glow.ui.Focusable}.
		
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
			new glow.ui.AutoSuggest().setFilter(function(item, val) {
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
	function AutoSuggest(opts) {		
		this._opts = opts = glow.util.apply({
			minLength: 3,
			keyboardNav: 'arrows-y',
			activateFirst: true
		}, opts || {});

		Widget.call(this, 'AutoSuggest', opts);
		this._init();
	};
	
	glow.util.extend(AutoSuggest, Widget);
	AutoSuggestProto = AutoSuggest.prototype;
	
	/**
		@name glow.ui.AutoSuggest#_opts
		@type Object
		@description Options provided to the constructor with defaults added
	*/
	
	/**
		@name glow.ui.AutoSuggest#_loading
		@type boolean
		@description True if the autosuggest is waiting for data.
			This happens when getting data is async, has been requested but not returned.
	*/
	
	/**
		@name glow.ui.AutoSuggest#_pendingFind
		@type string
		@description Pending search string.
			This is populated if find is called while the autoSuggest is _loading
	*/
	
	/**
		@name glow.ui.AutoSuggest#_data
		@type Object[]
		@description Array of objects, the current datasource for this AutoSuggest
	*/
	AutoSuggestProto._data = [];
	
	/**
		@name glow.ui.AutoSuggest#_dataFunc
		@type function
		@description Function used for fetching data (potentially) async
	*/
	
	/**
		@name glow.ui.AutoSuggest#_filter
		@type function
		@description The current filter function
	*/
	AutoSuggestProto._filter = function(val, caseSensitive) {
		var nameStart = this.name.slice(0, val.length);
		nameStart = caseSensitive ? nameStart : nameStart.toLowerCase();
		
		return nameStart === val;
	};
	
	/**
		@name glow.ui.AutoSuggest#_format
		@type function
		@description The current format function
	*/
	AutoSuggestProto._format = function(result, val) {
		var text = tmpDiv.text(result.name).html(),
			valStart = text.toLowerCase().indexOf( val.toLowerCase() ),
			valEnd = valStart + val.length;
		
		// wrap the selected portion in <strong>
		// This would be so much easier if it weren't for case sensitivity
		if (valStart !== -1) {
			text = text.slice(0, valStart) + '<strong>' + text.slice(valStart, valEnd) + '</strong>' + text.slice(valEnd)
		}
		
		return text;
	};
	
	/**
		@name glow.ui.AutoSuggest#focusable
		@type glow.ui.Focusable
		@description The focusable linked to this autosuggest.
	*/
	
	// Widget lifecycle phases
	AutoSuggestProto._init = function() {
		WidgetProto._init.call(this);
		// call _build
		this._build();
	}
	
	AutoSuggestProto._build = function() {
		WidgetProto._build.call(this, '<ul></ul>', this._opts);
		
		var opts = this._opts,
			width = opts.width,
			maxHeight = opts.maxHeight,
			content = this.content;
		
		this.focusable = content.focusable({
			children: '> li',
			keyboardNav: this._opts.keyboardNav,
			setFocus: false,
			activateOnHover: true
		});
		
		width && this.container.width(width);
		maxHeight && content.css('max-height', maxHeight);
		
		// call _build
		this._bind();
	}
	
	/**
		@private
		@function
		@description Select listener for the focusable.
			'this' is the AutoSuggest
	*/
	function focusableSelectListener(e) {
		return !this.fire('select', {
			li: e.item,
			item: e.item.data('as_data')
		}).defaultPrevented();
	}
	
	function returnFalse() { return false; }
	
	AutoSuggestProto._bind = function() {
		var focusable = this.focusable.on('select', focusableSelectListener, this);
		this._tie(focusable);
		
		// prevent 
		this.container.on('mousedown', returnFalse);
		
		WidgetProto._bind.call(this);
	}
	
	/**
		@name glow.ui.AutoSuggest#setFilter
		@function
		@description Set the function used to filter the dataset for results
			Overwrite this to change the filtering behaviour.
		
		@param {function} filter Filter function.
			Your function will be passed 2 arguments, the term entered by the user,
			and if the search should be case sensitive. Return true to confirm a match.
			
			'this' will be the item in the dataset to check.
			
			If the search is case-insensitive, the term entered by the user is automatically
			lowercased.
		  
			The default filter will return items where the search term matches the start of their 'name'
			property. If the dataset is simply an array of strings, that string will be used instead of the 'name' property
		
		@example
			// Search the name property for strings that contain val
			myAutoSuggest.setFilter(function(val, caseSensitive) {
				var name = caseSensitive ? this.name : this.name.toLowerCase();
				return name.indexOf(val) !== -1;
			});
			
		@example
			// Search the tags property for strings that contain val surrounded by pipe chars
			// this.tags is like: |hello|world|foo|bar|
			myAutoSuggest.setFilter(function(val, caseSensitive) {
				var tags = caseSensitive ? this.tags : this.tags.toLowerCase();
				return tags.indexOf('|' + val + '|') !== -1;
			});
			
		@return this
	*/
	AutoSuggestProto.setFilter = function(filter) {
		this._filter = filter;
		return this;
	};
	
	/**
		@name glow.ui.AutoSuggest#setFormat
		@function
		@description Control how matches are output.
			
		@param {function} formatter Function to generate output
			The first param to your function will be the matched item from your data list.
			The second param is the search value.
			
			Return an HTML string or glow.NodeList to display this item in the results
			list. Ensure you escape any content you don't want treated as HTML.
			
		@returns this
		
		@example
			// A username auto-complete
			
			// The data url returns a JSON object like [{name='JaffaTheCake', fullName:'Jake Archibald', photo:'JaffaTheCake.jpg'}, ...]
			glow.ui.AutoSuggest().setFormat(function() {
				// Format the results like <img src="JaffaTheCake.jpg" alt=""> Jake Archibald (JaffaTheCake)
				return '<img src="' + data.photo + '" alt=""> ' + data.fullName + ' (' + data.name + ')';
			}).data('userSearch.php?usernamePartial={val}').linkToInput('#username');
	*/
	AutoSuggestProto.setFormat = function(formatter) {
		this._format = formatter;
		return this;
	};
	
	/**
		@private
		@function
		@description Process the data into an acceptable format for #_data
	*/
	function populateData(autoSuggest, data) {
		var i,
			tmpData,
			event = autoSuggest.fire('data', {data:data});

		if ( !event.defaultPrevented() ) {
			// a listener may have altered the data
			data = event.data;
			
			// if it's an XHR response, convert it to json
			if (data instanceof glow.net.Response) {
				data = data.json();
			}
			
			if (typeof data[0] === 'string') {
				tmpData = [];
				i = data.length;
				while (i--) {
					tmpData[i] = { name: data[i] };
				}
				data = tmpData;
			}
			autoSuggest._data = data;
		}
	}
	
	// class to use when loading data, used in setDataFunction
	var loadingClass = 'glowCSSVERSION-AutoSuggest-loading';
	
	/**
		@private
		@function
		@description Create _dataFunc based on a custom function.
		@param {glow.ui.AutoSuggest} autoSuggest Instance
		@param {function} func Data fetching function provided by the user via #data
	*/
	function setDataFunction(autoSuggest, func) {
		// create a new function for fetching data
		autoSuggest._dataFunc = function(val) {
			var input = autoSuggest.input;
			
			// put us in the loading state and call the user's function
			autoSuggest._loading = true;
			input.addClass(loadingClass);
			
			// call the user's function, providing a callback
			func.call(this, val, function(data) {
				var pendingFind = autoSuggest._pendingFind;
				autoSuggest._loading = false;
				input.removeClass(loadingClass);
				// populate data if we've been given some
				data && populateData(autoSuggest, data);
				if (pendingFind) {
					performFind(autoSuggest, pendingFind);
					autoSuggest._pendingFind = undefined;
				}
			});
		}
	}
	
	/**
		@private
		@function
		@description Creates a data function to load a single url once.
	*/
	function singleLoadUrl(url) {
		var dataFetched,
			currentRequest;
		
		return function(val, callback) {
			// if we've already fetched the data, just call back & return
			if (dataFetched) {
				return callback();
			}
			
			// if we've already sent a request off, just let that one continue
			if ( !currentRequest ) {				
				currentRequest = glow.net.get(url).on('load', function(response) {
					// set data for quick retrieval later
					dataFetched = 1;
					callback(response);
				});
			}
		}
	}
	
	/**
		@private
		@function
		@description Creates a data function to load from a url each time a search is made.
	*/
	function multiLoadUrl(url) {
		var currentRequest;
		
		return function(val, callback) {
			var processedUrl = glow.util.interpolate(url, {val:val});
			
			// abort any current request
			currentRequest && currentRequest.abort();
			currentRequest = glow.net.get(processedUrl).on('load', function(response) {
				callback(response);
			});
		}
	}
	
	/**
		@name glow.ui.AutoSuggest#data
		@function
		@description Set the data or datasource to search
			This give the AutoSuggest the data to search, or the means to fetch
			the data to search.
			
		@param {string|string[]|Object[]|glow.net.Response|function} data Data or datasource
		
			<p><strong>String URL</strong></p>
			
			A URL on the same domain can be provided, eg 'results.json?search={val}', where {val} is replaced
			with the search term. If {val} is used, the URL if fetched on each search, otherwide it is only fetched
			once on the first search.
			
			The result is a {@link glow.net.Response}, by default this is decoded as json. Use
			the 'data' event to convert your incomming data from other types (such as XML).
			
			<p><strong>glow.net.Response</strong></p>
			
			This will be treated as a json response and decoded to string[] or Object[], see below.
			
			<p><strong>string[] or Object[] dataset</strong></p>
			
			An Array of strings can be provided. Each string will be converted to {name: theString}, leaving
			you with an array of objects.
			
			An Array of Objects can be provided, each object is an object that can be matched. By default
			the 'name' property of these objects is searched to determine a match, but {@link glow.ui.AutoSuggest#filter filter} can
			be used to change this.
			
			<p><strong>function</strong></p>
			
			A function can be provided, this is passed two arguments, the first is the search string, the 2nd is
			a callback.
			
			'this' inside the function refers to the AutoSuggest instance.
			
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
	AutoSuggestProto.data = function(data) {
		if (typeof data === 'string') {
			// look for urls without {val}, they get their data once & once only
			if (data.indexOf('{val}') == -1) {
				// replace data with function
				data = singleLoadUrl(data);
			}
			// look for urls with {val}, they get their data on each search
			else {
				// replace data with function
				data = multiLoadUrl(data);
			}
		}
		
		if (typeof data === 'function') {
			setDataFunction(this, data);
		}
		else if (data.push) {
			// clear any data functions set
			this._dataFunc = undefined;
			populateData(this, data);
		}
		
		return this;
	};
	
	/**
		@private
		@function
		@description Generate the output of a find
			
		@param {glow.ui.AutoSuggest} autoSuggest
		@param {Object[]} results Array of filtered results
		@param {string} val The search string
	*/
	function generateOutput(autoSuggest, results, val) {
		var content = autoSuggest.content,
			resultsLen = results.length,
			i = resultsLen,
			listItem,
			itemContent,
			opts = autoSuggest._opts,
			focusable = autoSuggest.focusable,
			maxHeight = opts.maxHeight
		
		focusable.active(false);
		
		// if we've got an overlay, we don't bother clearing the list,
		// just hide the overlay to let it animate away nicely
		if ( !resultsLen && autoSuggest.overlay ) {
			autoSuggest._hideOverlay();
			return;
		}
		
		// remove any current results
		content.children().destroy();
		
		while (i--) {
			itemContent = autoSuggest._format( results[i], val );
			listItem = glow('<li class="AutoSuggest-item"></li>')
				.data( 'as_data', results[i] )
				.prependTo(content);
			
			// append HTML or nodes
			(typeof itemContent === 'string') ?
				listItem.html(itemContent) :
				listItem.append(itemContent);
		}
		
		// fake maxHeight for IE6
		if ( supportsMaxHeight === undefined ) {
			supportsMaxHeight = (tmpDiv[0].style.maxHeight !== undefined);
		}
		if ( !supportsMaxHeight ) {
			content.height('auto');
			
			if (content.height() > maxHeight) {
				content.height(maxHeight);
			}
		}
		
		// Activate the focusable if we have results
		if (resultsLen) {
			resultsLen && opts.activateFirst && focusable.active(true);
			// show & position our overlay
			autoSuggest._showOverlay();
		}
		else {
			autoSuggest._hideOverlay();
		}
	}
	
	/**
		@private
		@function
		@description Performs the find operation without calling _dataFunc.
			Or checking _loading or string length. These are done in #find.
			
		@param {glow.ui.AutoSuggest} autoSuggest
		@param {string} str The search string
	*/
	function performFind(autoSuggest, str) {
		var filteredResults = [],
			filteredResultsLen = 0,
			data = autoSuggest._data,
			findEvent = autoSuggest.fire('find', {val: str}),
			resultsEvent,
			caseSensitive = autoSuggest._opts.caseSensitive;
		
		if ( !findEvent.defaultPrevented() ) {
			// pick up any changes a listener has made to the find string
			str = findEvent.val;
			
			str = caseSensitive ? str : str.toLowerCase();
			
			// start filtering the data
			for (var i = 0, len = data.length; i < len; i++) {
				if ( autoSuggest._filter.call(data[i], str, caseSensitive) ) {
					filteredResults[ filteredResultsLen++ ] = data[i];
					
					// break if we have enough results now
					if (filteredResultsLen === autoSuggest._opts.maxResults) {
						break;
					}
				}
			}
			
			// fire result event
			resultsEvent = autoSuggest.fire('results', {results: filteredResults});
			
			if ( resultsEvent.defaultPrevented() ) {
				filteredResults = [];
			}
			else {
				// pick up any changes a listener has made to the results
				filteredResults = resultsEvent.results
			}
			
			// output results
			generateOutput(autoSuggest, filteredResults, findEvent.val);
		}
	}
	
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
	AutoSuggestProto.find = function(str) {
		if (str.length >= this._opts.minLength) {
			// refresh/load data if there's a function
			this._dataFunc && this._dataFunc(str);
			
			// can't find if we're loading...
			if (this._loading) {
				// leave it here, _dataFunc will pick it up and call performFind later
				this._pendingFind = str;
			}
			else {
				performFind(this, str);
			}
		}
		else {
			this.hide();
		}
		return this;
	};
	
	/**
		@name glow.ui.AutoSuggest#hide
		@function
		@description Clear the results so the AutoSuggest is no longer visible
			
		@returns this
	*/
	AutoSuggestProto.hide = function() {
		// generating empty output does the trick
		generateOutput(this, [], '');
		return this;
	};
	
	/**
		@name glow.ui.AutoSuggest#destroy
		@function
		@description Destroy the AutoSuggest.
			Removes all events that cause the AutoSuggest to run. The input
			element will remain on the page.
	*/
	AutoSuggestProto.destroy = function() {
		this._data = undefined;
		
		// remove events from the input
		this.input.detach('keypress', this._inputPress)
			.detach('blur', this._inputBlur)
			.detach('onbeforedeactivate', this._inputDeact);
		
		WidgetProto.destroy.call(this);
	};
	
	/**
		@name glow.ui.AutoSuggest#disabled
		@function
		@description Enable/disable the AutoSuggest, or get the disabled state
			When the AutoSuggest is disabled it is not shown.
			
		@param {boolean} [newState] Disable the AutoSuggest?
			'false' will enable a disabled AutoSuggest.
		
		@returns {glow.ui.AutoSuggest|boolean}
			Returns boolean when getting, AutoSuggest when setting
	*/
	
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
		@param {*} event.data The new dataset
			You can modify / overwrite this property to alter the dataset.
			
			The type of this object depends on the data source and other listeners
			which may have overwritten / changed the original data.
			
		@example
			myAutoSuggest.data('data.xml?search={val}').on('data', function(event) {
				// When providing a url to .data(), event.data is a glow.net.response object 
				// Note: xmlToJson is not a function defined by Glow
				event.data = xmlToJson( event.data.xml() );
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
		@name glow.ui.AutoSuggest#event:select
		@event
		@description Fired when an item in the AutoSuggest is selected.
			You can use this event to react to the user interacting with
			the AutoSuggest
			
			Cancel this event to prevent the default click action.
		@param {glow.events.Event} event Event Object
		@param {string|Object} event.item The item in the dataset that was selected
		@param {glow.NodeList} event.li The list item in the AutoSuggest that was selected
			
		@example
			myAutoSuggest.on('select', function(event) {
				// this assumes our data objects have a 'url' property
				loaction.href = event.item.url;
			});
	*/
	
	/**
		@name glow.ui.AutoSuggest#event:find
		@event
		@description Fired when a search starts.
			Cancel this event to prevent the search.
		
		@param {glow.events.Event} event Event Object.
		@param {string} event.val The search string.
			You can set this to another value if you wish.
	*/
	
	// EXPORT
	glow.ui.AutoSuggest = AutoSuggest;
});