	/**
		@name glow.ui.Menu
		@class
		@description A list of keyboard navigatable options.
		@param {String|NodeList|Selector} [container] Container element to be used for menu.
		@param {Object} opts
				Zero or more of the following as properties of an object:
				@param {Number|String} [opts.width=400] Width of the menu
					Default of 400px gives a content width of 360px in the default template
				@param {Number|String} [opts.height=auto] Height of the menu
					Default of auto, content larger than this will cause scrollable behaviour
				@param {Boolean} [opts.activeOnShow=true] Should the first suggestion automatically be active when the suggestion list appears?
				@param {String|NodeList|Selector} [opts.menuItems] Location or selector of elements to be used as manu items.  If unset, the child elements of the container element will be used.
				@param {function} [opts.keyBehaviour] Use to change the default behaviour of keyboard controls.  To change, provide current item & key that was pressed. // WIP, this may become a FocusManager
	**/

	/**
		@name glow.ui.Menu#addItems
		@function
		@description Adds additional items to the menu from a specified origin.
		@type {glow.widgets.Menu}
		@param {String|NodeList} Nodes to add to menu.
		@returns The instance of the widget.
		@example
			//add the list items found within an unordered list
			var myMenu = new glow.ui.Menu("#menu");
			myMenu.addItems("ul#secondary-menu li");
	*/
	

	

	/**
		@name glow.ui.Menu#event:show
		@event
		@description Fired when the menu is about to appear on the screen, before any animation.

			At this	point you can access the content of the menu and make changes 
			before it is shown to the user. If you prevent the default action of this
			event (by returning false or calling event.preventDefault) the menu 
			will not show.
			
		@param {glow.events.Event} event Event Object
	*/
		
	/**
		@name glow.ui.Menu#event:afterShow
		@event
		@description Fired when the menu is visible to the user and any 'show' animation is complete

			This event is ideal to assign focus to a particular part of	the menu.
			If you want to change content of the menu before it appears, see the 
			'show' event.
			
		@param {glow.events.Event} event Event Object
	*/
		
	/**
		@name glow.ui.Menu#event:hide
		@event
		@description Fired when the menu is about to hide

			If you prevent the default action of this event (by returning false or 
			calling event.preventDefault) the menu will not hide.
			
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Menu#event:afterHide
		@event
		@description Fired when the menu has fully hidden, after any hiding animation has completed
		@param {glow.events.Event} event Event Object
	*/
		
	/**
		@name glow.ui.Menu#event:itemSelect
		@event
		@description Fired whenever an item is selected.
	*/
	
	/**
		@name glow.ui.Menu#event:highlight
		@event
		@description Fired whenever an item is hovered over
	*/