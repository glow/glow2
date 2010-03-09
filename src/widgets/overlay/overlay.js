/**
		@name glow.widgets.Overlay
		@class
		@description A container element displayed on top of the other page content

		<div class="info">Widgets must be called in a <code>glow.ready()</code> call.</div>
		@see <a href="../furtherinfo/widgets/overlay/">Overlay user guide</a>

		@param {selector|Element|glow.dom.NodeList} content
			the element that contains the contents of the overlay. If this is
			in the document it will be moved to document.body.

		@param {Object} opts
			Zero or more of the following as properties of an object:
			@param {Boolean} [opts.modal="false"] Is the overlay modal?
				If true then a default Mask will be created if one is not provided.
			@param {glow.widgets.Mask} [opts.mask] Mask to use for modal overlays
				used to indicate to the user that the overlay is modal. If provided then the modal property is set to true.
			@param {Boolean} [opts.closeOnMaskClick="true"] if true then listens for a click event on the mask and hides when it fires
			@param {String|Function} [opts.anim="null"] A transition for showing / hiding the panel
				Can be "fade" or "slide", or a function which returns a glow.anim.Animation or glow.anim.Timeline.
				The function is passed the overlay as the first parameter, and 'true' if the overlay is showing, 'false' if it's hiding.
			@param {Number} [opts.zIndex="9991"] The z-index to set on the overlay
				If the overlay is modal, the zIndex of the mask will be set to one less than the value of this attribute.
			@param {Boolean} [opts.autoPosition="true"] Position the overlay relative to the viewport
				If true, the overlay will be positioned to the viewport according to the x & y
				options. If false, you will have to set the position manually by setting the left / top css styles of the
				container property.
			@param {Number|String} [opts.x="50%"] Distance of overlay from the left of the viewport
				If the unit is a percentage	then 0% is aligned to the left of
				the viewport, 100% is aligned to the right of viewport and 50%
				is centered.
			@param {Number|String} [opts.y="50%"] Distance of overlay from the top of the viewport
				If the unit is a percentage	then 0% is aligned to the left of
				the viewport, 100% is aligned to the right of viewport and 50%
				is centered.
			@param {String} [opts.ariaRole] The aria role of the overlay.
				This is used for accessibility purposes. No role is defined by default.
			@param {Object} [opts.ariaProperties] Key-value pairs of aria properties and values
				These are applied to the overlay container for accessibility purposes.
				By default the overlay is a polite live area.
			@param {selector|Element|glow.dom.NodeList} [opts.returnTo] Element to give focus to when the overlay closes
				For accessibility purposes you may want to set an element to give focus to when the overlay closes.
				This meanss devices which present data to the user by the cursor position (such as screen readers)
				will be sent somewhere useful.
			@param {Boolean} [opts.hideWindowedFlash=true] Hide windowed Flash movies?
				When set to true, any Flash movie without wmode "transparent" or "opaque" will be hidden when
				the overlay shows. This is because they always appear on top of other elements on the page. Flash
				movies inside the overlay are excluded from hiding.
			@param {selector|Element|glow.dom.NodeList} [opts.hideWhileShown] Elements to hide while the overlay is shown
				This is useful for hiding page elements which always appear on top of other page elements.
				Flash movies can be handled easier using the hideWindowedFlash option.
			@param {Function} [opts.hideFilter] Exclude elements from hiding
				When provided this function is run for every element that may be hidden. This includes windowed
				Flash movies if 'hideWindowedFlash' is true, and any matches for 'hideWhileShown'. In the function,
				'this' refers to the element. Return false to prevent this element being hidden.
			@param {Boolean} [opts.focusOnShow=false] Give the overlay keyboard focus when it appears?
				Use 'returnTo' to specify where to send focus when the overlay closes
			@param {String} [opts.id] Value for the Overlay container's ID attribute
			@param {String} [opts.className] Values for the Overlay container's class attribute.
			@param {Boolean} [opts.closeOnEsc=false] Close the overlay when the ESC key is pressed
				The overlay needs to have focus for the ESC key to close.

		@example
			var overlay = new glow.widgets.Overlay(
				glow.dom.create(
					'<div>' +
					'  <p>Your Story has been saved.</p>' +
					'</div>'
				)
			);
			overlay.show();
		*/
		/**
			@name glow.widgets.Overlay#event:show
			@event
			@description Fired when the overlay is about to appear on the screen, before any animation.

				At this	point you can access the content of the overlay and make changes 
				before it is shown to the user. If you prevent the default action of this
				event (by returning false or calling event.preventDefault) the overlay 
				will not show.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Overlay#event:afterShow
			@event
			@description Fired when the overlay is visible to the user and any 'show' animation is complete

				This event is ideal to assign focus to a particular part of	the overlay.
				If you want to change content of the overlay before it appears, see the 
				'show' event.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Overlay#event:hide
			@event
			@description Fired when the overlay is about to hide

				If you prevent the default action of this event (by returning false or 
				calling event.preventDefault) the overlay will not hide.
			
			@param {glow.events.Event} event Event Object
		*/
		/**
			@name glow.widgets.Overlay#event:afterHide
			@event
			@description Fired when the overlay has fully hidden, after any hiding animation has completed
			@param {glow.events.Event} event Event Object
		*/