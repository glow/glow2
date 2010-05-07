Glow.provide(function(glow) {
	var undefined,
		AutoSuggestProto = glow.ui.AutoSuggest.prototype;
	
	/**
		@name glow.ui.AutoSuggest#bindOpts
		@type Object
		@description The options object passed into #bindInput, with defaults added.
	*/
	
	/**
		@name glow.ui.AutoSuggest#input
		@type glow.NodeList
		@description Refers to the input element to which this is linked to, or an empty NodeList.
			Link an input to an AutoSuggest using {@link glow.ui.AutoSuggest#bindInput bindInput}.
	*/
	AutoSuggestProto.input = glow();
	
	/**
		@name glow.ui.AutoSuggest#overlay
		@type glow.ui.Overlay
		@description The overlay linked to this autosuggest.
			The Overlay is created when {@link glow.ui.AutoSuggest#bindInput bindInput} is
			called.
	*/
	
	/**
		@name glow.ui.AutoSuggest#_inputPress
		@private
		@function
		@description Listener for input's keypress event.
			'this' is the AutoSuggest.
			
			Needed to make this pseudo-private so we could remove the listener later
	*/
	function inputPress(e) {
		var autoSuggest = this,
			input = autoSuggest.input,
			delim = autoSuggest._bindOpts.delim,
			focusable = autoSuggest.focusable,
			childrenLength;
			
		// we only care about printable chars and keys that modify input
		if ( e.keyChar || e.key === 'delete' || e.key === 'backspace' ) {
			// look out for printable chars going into the input
			clearTimeout(autoSuggest._inputTimeout);
			
			autoSuggest._inputTimeout = setTimeout(function() {
				var val = input.val(),
					lastDelimPos,
					caretPos;
				
				// deal with delims
				if (delim) {
					caretPos = getCaretPosition(autoSuggest);
					// get the text before the caret
					val = val.slice(0, caretPos);
					// is there a delimiter before the caret?
					lastDelimPos = val.lastIndexOf(delim);
					// if so, ignore the bits before the caret
					if (lastDelimPos !== -1) {
						val = val.slice( val.lastIndexOf(delim) + delim.length );
					}
				}
				
				val = glow.util.trim(val);
				autoSuggest.find(val);
			}, autoSuggest._bindOpts.delay * 1000);
		}
		else {
			switch (e.key) {
				case 'escape':
					autoSuggest.hide();
					deleteSelectedText(autoSuggest);
					return false;
				case 'up':
				case 'down':
					if ( !focusable._opts.activateFirst && !focusable.active() && (childrenLength = autoSuggest.content.children().length) ) {
						// if the focusable isn't active, activate the first/last item
						focusable.active(e.key == 'up' ? childrenLength - 1 : 0);
						e.stopPropagation();
						return false;
					}
			}
		}
	}
	AutoSuggestProto._inputPress = inputPress;
	
	/**
		@name glow.ui.AutoSuggest#_inputBlur
		@private
		@function
		@description Listener for input's blur event.
			'this' is the AutoSuggest.
			
			Needed to make this pseudo-private so we could remove the listener later
	*/
	function inputBlur() {
		this.hide();
	}
	AutoSuggestProto._inputBlur = inputBlur;
	
	/**
		@name glow.ui.AutoSuggest#_inputDeact
		@private
		@function
		@description Listener for input's beforedeactivate event.
			'this' is the AutoSuggest.
			
			Prevents IE from bluring the input element when the autosuggest is clicked.
			
			Needed to make this pseudo-private so we could remove the listener later
	*/
	function inputDeact(e) {
		if ( this.container.contains( e.related ) ) {
			return false;
		}
	}
	AutoSuggestProto._inputDeact = inputDeact;
	
	/**
		@private
		@function
		@description Listener for AutoSuggest's select event if opts.autoComplete is true
			This creates the autoComplete behaviour.
			'this' is the AutoSuggest.
	*/
	function completeSelectListener(event) {
		completeInput(this.hide(), event.item.name);
		makeSelection(this, this.input.val().length);
	}
	
	/**
		@private
		@function
		@description Listener for focusable's childActivate event if opts.autoComplete is true.
			This updates the text as the user cycles through items.
		
			'this' is the AutoSuggest
	*/
	function focusablechildActivate(event) {
		if (event.method == 'hover') { return; }
		completeInput(this, event.item.data('as_data').name, true);
	}
	
	/**
		@private
		@function
		@description Autocomplete value in the input.
		@param {glow.ui.AutoSuggest} autoSuggest
		@param {string} newVal Value to complete to
		@param {boolean} [select=false] Highlight the completed portion?
			This is used while cycling through values
	*/
	function completeInput(autoSuggest, newVal, select) {
		deleteSelectedText(autoSuggest);
		
		var input = autoSuggest.input,
			oldVal = input.val(),
			caretPos = getCaretPosition(autoSuggest),
			rangeStart = caretPos,
			rangeEnd = newVal.length,
			delim = autoSuggest._bindOpts.delim,
			lastDelimPos,
			firstValPart = '';
		
		// we don't want to overwrite the whole thing if we're using delimiters
		if (delim) {
			lastDelimPos = oldVal.slice(0, caretPos).lastIndexOf(delim);
			if (lastDelimPos !== -1) {
				firstValPart = oldVal.slice(0, lastDelimPos) + delim + ' ';
			}
			newVal = firstValPart + newVal + delim + ' ';
			rangeEnd = newVal.length;
			newVal += oldVal.slice(caretPos);
		}
		
		input.val(newVal);
		select && makeSelection(autoSuggest, rangeStart, rangeEnd);
	}
	
	
	/**
		@private
		@function
		@description Make a selection in the bound input
		
		@param {glow.ui.AutoSuggest} autoSuggest
		@param {number} start Start point of the selection
		@param {number} [end=start] End point of the selection
	*/
	function makeSelection(autoSuggest, start, end) {
		end = (end === undefined) ? start : end;
		
		var inputElm = autoSuggest.input[0],
			character = 'character',
			range;

		if (!window.opera && inputElm.createTextRange) { // IE
			range = inputElm.createTextRange();
			range.moveStart(character, start);
			range.moveEnd(character, end - inputElm.value.length);
			range.select();
		}
		else { // moz, saf, opera
			inputElm.select();
			inputElm.selectionStart = start;
			inputElm.selectionEnd = end;
		}
	}
	
	/**
		@private
		@function
		@description Get the caret position within the input
	*/
	function getCaretPosition(autoSuggest) {
		var inputElm = autoSuggest.input[0],
			r;
		
		if (document.selection) { // IE
			range = document.selection.createRange();
			range.collapse();
			range.setEndPoint( 'StartToStart', inputElm.createTextRange() );
			r = range.text.length;
		}
		else { // moz, saf, opera
			r = inputElm.selectionStart;
		}
		
		return r;
	}
	
	/**
		@private
		@function
		@description Delete the currently selected text in the input.
			This is used when esc is pressed and in focusablechildActivate
	*/
	function deleteSelectedText(autoSuggest) {
		var inputElm = autoSuggest.input[0],
			val = inputElm.value,
			selectionStart;
		
		if (document.selection) { // IE
			document.selection.createRange().text = '';
		}
		else { // others
			selectionStart = inputElm.selectionStart;
			inputElm.value = val.slice(0, selectionStart) + val.slice(inputElm.selectionEnd);
			inputElm.selectionStart = selectionStart;
		}
	}
	
	/**
		@name glow.ui.AutoSuggest#_showOverlay
		@private
		@function
		@description Shows the overlay, if one is attached.
			Also positions the overlay according to options set.
	*/
	AutoSuggestProto._showOverlay = function() {
		var overlay = this.overlay,
			autoSuggestOpts = this._opts,
			bindOpts = this._bindOpts,
			input = this.input,
			inputOffset;
		
		if (!overlay) { return; }
		
		if (!autoSuggestOpts.width) {
			this.container.width( input[0].offsetWidth );
		}
		
		if (bindOpts.autoPosition) {
			inputOffset = input.offset();
			overlay.container.css({
				top: inputOffset.top + input[0].offsetHeight,
				left: inputOffset.left
			})
		}
		
		overlay.show();
	}
	
	/**
		@name glow.ui.AutoSuggest#_hideOverlay
		@private
		@function
		@description Hide the overlay, if one is attached.
	*/
	AutoSuggestProto._hideOverlay = function() {
		var overlay = this.overlay;
		overlay && overlay.hide();
	}
	
	/**
		@name glow.ui.AutoSuggest#bindInput
		@function
		@description Link this autosuggest to a text input.
			This triggers {@link glow.ui.AutoSuggest#find} when the value in
			the input changes.
			
			The AutoSuggest is placed in an Overlay beneath the input and displayed
			when results are found.
			
			If the input loses focus, or esc is pressed,
			the Overlay will be hidden and results cleared.
			
		@param {selector|glow.NodeList|HTMLElement} input Test input element
		
		@param {Object} [opts] Options
		@param {selector|glow.NodeList} [opts.appendTo] Add the AutoSuggest somewhere in the document rather than an {@link glow.ui.Overlay Overlay}
			By default, the AutoSuggest will be wrapped in an {@link glow.ui.Overlay Overlay} and
			appended to the document's body.
		@param {boolean} [opts.autoPosition=true] Place the overlay beneath the input
			If false, you need to position the overlay's container manually. It's
			recommended to do this as part of the Overlay's show event, so the
			position is updated each time it appears.
		@param {boolean} [opts.autoComplete=true] Update the input when an item is highlighted & selected.
			This will complete the typed text with the result matched.
			
			You can create custom actions by listening for the
			{@link glow.ui.AutoSuggest#event:select 'select' event}
		@param {string} [opts.delim] Delimiting char(s) for selections.
			When defined, the input text will be treated as multiple values,
			separated by this string (with surrounding spaces ignored).
		@param {number} [opts.delay=0.5] How many seconds to delay before searching.
			This prevents searches being made on each key press, instead it
			waits for the input to be idle for a given number of seconds.
		@param {string} [opts.anim] Animate the Overlay when it shows/hides.
			This can be any parameter accepted by {@link glow.ui.Overlay#setAnim Overlay#setAnim}.
			
		@returns this
	*/
	AutoSuggestProto.bindInput = function(input, opts) {
		/*!debug*/
			if (arguments.length < 1 || arguments.length > 2) {
				glow.debug.warn('[wrong count] glow.ui.AutoSuggest#bindInput expects 1 or 2 arguments, not ' + arguments.length + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.AutoSuggest#bindInput expects object as "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		var bindOpts = this._bindOpts = glow.util.apply({
				autoPosition: true,
				autoComplete: true,
				delay: 0.5
			}, opts || {} ),
			appendTo = bindOpts.appendTo,
			container = this.container,
			overlay,
			autoSuggestOpts = this._opts;
			
		// if autocomplete isn't turned off, the browser doesn't let
		// us hear about up & down arrow presses
		this.input = glow(input).attr('autocomplete', 'off')
			.on('keypress', inputPress, this)
			.on('blur', inputBlur, this)
			.on('beforedeactivate', inputDeact, this);
		
		if (bindOpts.autoComplete) {
			this.on('select', completeSelectListener, this)
				.focusable.on('childActivate', focusablechildActivate, this);
		}
		
		// add to document, or...
		if (appendTo) {
			glow(appendTo).append(container);
		}
		// ...make overlay
		else {
			this.overlay = overlay = new glow.ui.Overlay(container);
			overlay.container.appendTo(document.body);
			
			bindOpts.anim && overlay.setAnim(bindOpts.anim);
			
			this._tie(overlay);
		}
		
		return this;
	};
});