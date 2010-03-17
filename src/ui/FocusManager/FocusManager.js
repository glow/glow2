	/**
		@name glow.ui.FocusManager
		@class
		@augments glow.ui
		@description A component for creating focussable widgets
		@param {selector|NodeList|String} content
			the element that contains the contents of the overlay. If this is
			in the document it will be moved to document.body.
		@param {object} opts
			Zero or more of the following as properties of an object:
			@param {Boolean} [opts.modality=1] The modality of the focussable object.
			@param {String|NodeList|selector} [opts.parentItem]
			@param {function} [opts.keyboardControls]
			@param {boolean} [opts.focusActive] Sets whether focus is given on activation.
	*/
	
	/**
		@name glow.ui.FocusManager#event:itemClicked
		@event
		@description Fired when an item in the focussed object has been clicked.
		@returns The item clicked
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.FocusManager#activate
		@function
		@description Adds the listener events to the focussable object.
		@returns this
	*/
	
	/**
		@name glow.ui.FocusManager#deactivate
		@function
		@description Removes the listener events on the focussable object.
		@returns this
	*/
	
	