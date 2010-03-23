Glow.provide(function(glow) {
	var OverlayProto, undefined;
	
	/**
		@name glow.ui.Overlay
		@class
		@augments glow.ui
		@description A container element displayed on top of the other page content
		@param {selector|NodeList|String} content
			the element that contains the contents of the overlay. If not in the document, you must append it to the document before calling show().

		@param {object} [opts]
			@param {number} [opts.zIndex="9991"] The z-index to set on the overlay.
				If the overlay is modal, the zIndex of the mask will be set to one less than the value of this attribute.
			@param {function|selector|NodeList} [opts.hideFilter] Exclude elements from hiding.
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
	
	function Overlay(content, opts) {
		//call the base class's constructor
		this.base = Overlay.base.call(this, 'overlay');
		
		this.init(opts);
		this.attach(content, this.opts);
	}
	glow.util.extend(Overlay, glow.ui.Widget);
	
	OverlayProto = Overlay.prototype;
	
	OverlayProto.init = function(opts) {
		this.base.init.call(this, opts);
		
		var defaults = {
			zIndex: 9991
		};
		
		this.opts = glow.util.apply(defaults, opts);
		
		/**
			@name glow.ui.Overlay#visible
			@description True if the overlay is showing.
				This is a read-only property to check the state of the overlay.
			@type boolean
		*/
		this.visible = false;
	}
	
	OverlayProto.attach = function(content, opts) {
		this.base.attach.call(this, content, opts);
		
		this.container.css('z-index', this.opts.zIndex);
	}
	
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
		@description Fired when the overlay is visible to the user and any delay or 'show' animation is complete.

			This event is ideal to assign focus to a particular part of	the overlay.
			If you want to change content of the overlay before it appears, see the 
			'show' event.
			
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Overlay#event:hide
		@event
		@description Fired when the overlay is about to hide.

			If you prevent the default action of this event (by returning false or 
			calling event.preventDefault) the overlay will not hide.
			
		@param {glow.events.Event} event Event Object
	*/
		
	/**
		@name glow.ui.Overlay#event:afterHide
		@event
		@description Fired when the overlay has fully hidden, after any delay or hiding animation has completed.
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Overlay#setAnim
		@function
		@description Set the animation to use when showing and/or hiding the overlay.
		@param {glow.Anim|null|undefined} showAnim The animation to use for showing this overlay.
		Passing null will remove any previously set animation and indicate no opening animation should be used. Passing undefined will leave any previously set animation unchanged.
		@param {glow.Anim|null|undefined} [hideAnim] The animation to use for closing this overlay.
		Passing null will remove any previously set animation and indicate no closing animation should be used. Passing undefined will indicate the default animation should be used: the reverse of the show animation, if one was set.
	*/
	OverlayProto.setAnim = function() { // (showAnim, hideAnim) could be word, like "fade"
	}
	
	/**
		@name glow.ui.Overlay#show
		@function
		@param {object} [opts]
			@param {number} [opts.delay=0] The delay before the overlay is shown.
				By default, the overlay will show immediately. Specify a number value of microseconds to delay showing. The event "afterShow" will be called after any delay and animation.
			@param {object} [opts.anim] The animation to use when the overlay is shown.
				By default, no animation will be used. Provide an animation object to show the overlay with an effect. The event "afterShow" will be called after any animation and delay.
		@description Displays the overlay after an optional delay period and animation.

		@returns this
	*/
	OverlayProto.show = function() {
		var e = new glow.events.Event();
		this.fire('show', e);
		
		if (!e.defaultPrevented()) {
			this.visible = true;
			this.container.state.addClass('visible');
		}
	}
	
	/**
		@name glow.ui.Overlay#hide
		@function
		@param {object} [opts]
			@param {number} [opts.delay=0] The delay before the overlay is hidden.
				By default, the overlay will hide immediately. Specify a number value of microseconds to delay hiding.  The event "afterHide" will be called after any delay and animation.
			@param {object} [opts.anim] The animation to use when the overlay is shown.
				By default, no animation will be used. Provide an animation object to show the overlay with an effect. The event "afterHide" will be called after any animation and delay.
		@description Hides the overlay after an optional delay period and animation

		@returns this
	*/
	OverlayProto.hide = function() {
		var e = new glow.events.Event();
		this.fire('hide', e);
		
		if (!e.defaultPrevented()) {
			this.visible = false;
			this.container.state.removeClass('visible');
		}
	}

	
	// export
	glow.ui = glow.ui || {};
	glow.ui.Overlay = Overlay;
});