/**
	@name glow.widgets.Menu
	@class
	@augments glow.widgets.Overlay
	@description An overlay with default drop-down selection behaviour.
	@param {Object} opts
			Zero or more of the following as properties of an object:
			@param {Number|String} [opts.width=400] Width of the menu
				Default of 400px gives a content width of 360px in the default template
			@param {Number|String} [opts.height=auto] Height of the menu
				Default of auto, content larger than this will cause scrollable behaviour
			@param [String] [opts.class] Class name of the menu
			@param {String} [opts.id] ID name of the menu
			
**/

/* Events ************************** */
		/**
			@name glow.widgets.Menu#event:show
			@event
			@description Fired when the menu is about to appear on the screen, before any animation.

				At this	point you can access the content of the menu and make changes 
				before it is shown to the user. If you prevent the default action of this
				event (by returning false or calling event.preventDefault) the menu 
				will not show.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Menu#event:afterShow
			@event
			@description Fired when the menu is visible to the user and any 'show' animation is complete

				This event is ideal to assign focus to a particular part of	the menu.
				If you want to change content of the menu before it appears, see the 
				'show' event.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Menu#event:hide
			@event
			@description Fired when the menu is about to hide

				If you prevent the default action of this event (by returning false or 
				calling event.preventDefault) the menu will not hide.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Menu#event:afterHide
			@event
			@description Fired when the menu has fully hidden, after any hiding animation has completed
			@param {glow.events.Event} event Event Object
		*/