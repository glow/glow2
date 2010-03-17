	/**
		@name glow.ui.Overlay
		@class
		@augments glow.ui
		@description A container element displayed on top of the other page content
		@param {selector|NodeList|String} content
			the element that contains the contents of the overlay. If not in the document, you must append it to the document before calling show().

		@param {object} opts
			Zero or more of the following as properties of an object:
			@param {Boolean} [opts.closeOnMaskClick=true] if true then listens for a click event on the mask and hides when it fires
			@param {Number} [opts.zIndex="9991"] The z-index to set on the overlay
				If the overlay is modal, the zIndex of the mask will be set to one less than the value of this attribute.
			@param {function|selector|NodeList} [opts.hideFilter] Exclude elements from hiding
				When provided this function is run for every element that may be hidden. This includes windowed
				Flash movies if an intersection with the overlay is found.
		@example
			var overlay = new glow.ui.Overlay(
				glow(
					'<div>' +
					'  <p>Your Story has been saved.</p>' +
					'</div>'
				)
			);
			overlay.show();
		*/
		
		

	/**
		@name glow.ui.Overlay#event:show
		@event
		@description Fired when the overlay is about to appear on the screen, before any animation.

			At this	point you can access the content of the overlay and make changes 
			before it is shown to the user. If you prevent the default action of this
			event (by returning false or calling event.preventDefault) the overlay 
			will not show.
			
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Overlay#event:afterShow
		@event
		@description Fired when the overlay is visible to the user and any delay or 'show' animation is complete

			This event is ideal to assign focus to a particular part of	the overlay.
			If you want to change content of the overlay before it appears, see the 
			'show' event.
			
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Overlay#event:hide
		@event
		@description Fired when the overlay is about to hide

			If you prevent the default action of this event (by returning false or 
			calling event.preventDefault) the overlay will not hide.
			
		@param {glow.events.Event} event Event Object
	*/
		
	/**
		@name glow.ui.Overlay#event:afterHide
		@event
		@description Fired when the overlay has fully hidden, after any delay or hiding animation has completed
		@param {glow.events.Event} event Event Object
	*/
		
		
		
	/**
		@name glow.ui.Overlay#visible
		@description True if the overlay is showing.
			This is a read-only property to check the state of the overlay.
		@type Boolean
	*/
		
	
	/**
		@name glow.ui.Overlay#setPosition
		@function
		@description Change or recalculate the position of the overlay
			Call with parameters to
			change the position of the overlay or call without parameters to recalculate
			the position of the overlay. You may need to call this without parameters
			if relative positions become invalid.

		@param {Number|String} [x]
			distance of overlay from the left of the viewport. If the unit is a percentage
			then 0% is aligned to the left of the viewport, 100% is aligned to the right of viewport and 50% is centered.
		@param {Number|String} [y]
			distance of overlay from the top of the viewport. If the unit is a percentage
			then 0% is aligned to the left of the viewport, 100% is aligned to the right of viewport and 50% is centered.

		@returns this
	*/
	
	
	/**
		@name glow.ui.Overlay#show
		@function
		@param {object} opts
			Zero or more of the following as properties of an object:
			@param {Number} [opts.delay=0] The delay before the overlay is shown
				By default, the overlay will show immediately. Specify a number value of seconds to delay showing. The event "afterShow" will be called after any delay and animation.
			@param {Object} [opts.anim] The animation to use when the overlay is shown
				Bu default, no animation will be used. Provide an animation object to show the overlay with an effect. The event "afterShow" will be called after any animation and delay.
		@description Displays the overlay after an optional delay period and animation

		@returns this
	*/
	
	/**
		@name glow.ui.Overlay#hide
		@function
		@param {object} opts
			Zero or more of the following as properties of an object:
			@param {Number} [opts.delay=0] The delay before the overlay is hidden
				By default, the overlay will hide immediately. Specify a number value of seconds to delay hiding.  The event "afterHide" will be called after any delay and animation.
			@param {Object} [opts.anim] The animation to use when the overlay is shown
				Bu default, no animation will be used. Provide an animation object to show the overlay with an effect. The event "afterHide" will be called after any animation and delay.
		@description Hides the overlay after an optional delay period and animation

		@returns this
	*/
	
	