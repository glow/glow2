Glow.provide(function(glow) {
	var OverlayProto,
		WidgetProto = glow.ui.Widget.prototype,
		idCounter = 0,
		undefined,
		instances = {}; // like {uid: overlayInstance}
	
	
	var vis = {
		SHOWING: 2,
		SHOWN: 1,
		HIDING: -1,
		HIDDEN: -2
	};
	
	
	/**
		@name glow.ui.Overlay
		@class
		@augments glow.ui
		@description A container element displayed on top of the other page content
		@param {selector|NodeList|String|boolean} content
			the element that contains the contents of the overlay. If not in the document, you must append it to the document before calling show().

		@param {object} [opts]
			@param {function|selector|NodeList|boolean} [opts.hideWhenShown] Select which things to hide whenevr the overlay is in a shown state.
			By default all `object` and `embed` elements will be hidden, in browsers that cannot properly layer those elements, whenever any overlay is shown.
			Set this option to a false value to cause the overlay to never hide any elements, or set it to a bespoke selector, NodeList
			or a function that returns a NodeList which will be used instead.
		@example
			var myOverlay = new glow.ui.Overlay(
				glow(
					'<div>' +
					'  <p>Your Story has been saved.</p>' +
					'</div>'
				).appendTo(document.body)
			);
			
			glow('#save-story-button').on('click', function() {
				myOverlay.show();
			});
	 */
	
	function Overlay(content, opts) {
		/*!debug*/
			if (arguments.length < 1 || content === undefined) {
				glow.debug.warn('[wrong type] glow.ui.Overlay expects "content" argument to be defined, not ' + typeof content + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.Overlay expects object as "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		var that = this,
			ua;
		
		opts = glow.util.apply({ }, opts);
		
		//call the base class's constructor
		Overlay.base.call(this, 'overlay', opts);
		
		this.uid = 'overlayId_' + glow.UID + '_' + (++idCounter);
		instances[this.uid] = this; // useful for modal overlays?
		
		this._init(opts);
		this._build(content);
		this._bind();
	}
	glow.util.extend(Overlay, glow.ui.Widget);
	
	OverlayProto = Overlay.prototype;
	
	OverlayProto._init = function() {
		WidgetProto._init.call(this);
		
		/**
			@name glow.ui.Overlay#shown
			@description True if the overlay is shown.
				This is a read-only property to check the state of the overlay.
			@type boolean
		*/
		this.shown = false;
		
		return this;
	}
	
	OverlayProto.destroy = function() {
		WidgetProto.destroy.call(this);
		
		delete instances[this.uid];
	}
	
	OverlayProto._build = function(content) {
		var that = this;
		
		WidgetProto._build.call(this, content);
		
		/*!debug*/
			if (this.content.length < 1) {
				glow.debug.warn('[ivalid argument] glow.ui.Overlay expects "content" argument to refer to an element that exists, no elements found for the content argument provided.');
			}
		/*gubed!*/
		
		// some browsers need to hide Flash when the overlay is shown (like non-mac opera and gecko 1.9 or less)
		if (this._opts.hideWhenShown === undefined) { // need to make our own flash handler
			ua = navigator.userAgent; // like ﻿"... rv:1.9.0.5) gecko ..."
			/**
				A function that returns a NodeList containing all elements that need to be hidden.
				@name glow.ui.Overlay#_whatToHide
				@private
				@returns {glow.NodeList} Elements that need to be hidden when the overlay is shown.
			 */
			this._whatToHide = (
				glow.env.opera && !/macintosh/i.test(ua)
				|| /rv:1\.9\.0.*\bgecko\//i.test(ua)
				|| glow.env.webkit && !/macintosh/i.test(ua)
			)?
				function() {
					return glow('object, embed')/*.filter(function() {
						return !that.container.contains(this); // don't hide elements that are inside the overlay
					});*/
				}
				: function() { return glow(); }
		}
		else { // user provides their own info about what to hide
			if (!this._opts.hideWhenShown) { // a value that is false
				this._whatToHide = function() { return glow(); }
			}
			else if (typeof this._opts.hideWhenShown === 'function') { // a function
				this._whatToHide = this._opts.hideWhenShown;
			}
			else if (this._opts.hideWhenShown.length !== undefined) { // nodelist or string?
				this._whatToHide = function() { return glow('*').filter(this._opts.hideWhenShown); }
			}
		}
		
		//add IE iframe hack if needed, wrap content in an iFrame to prevent certain elements below from showing through
		if (glow.env.ie) {
			this._iframe = glow('<iframe src="javascript:\'\'" style="display:block;width:100%;height:1000px;margin:0;padding:0;border:none;position:absolute;top:0;left:0;filter:alpha(opacity=0);"></iframe>')
			this._iframe.css('z-index', 0);
			
			this._iframe.insertBefore(this.content);
		}
		
		this.content
			.css('position', 'relative')
			.css('z-index', 1)
			.css('top', 0)
			.css('left', 0);

		return this;
	}
	
	/**
		@name glow.ui.Overlay#hideFlash
		@method
		@description Hides all Flash elements on the page, outside of the overlay.
		This should only be neccessary on older browsers that cannot properly display
		overlay content on top of Flash elements. On those browsers Glow will automatically
		call this method for you in the onshow event, and will automatically call
		showFlash for you in the afterhide event.
	 */
	OverlayProto.hideFlash = function() { /*debug*///console.log('hideFlash');
		var toHide,
			that = this,
			hidBy = '';
			
		toHide = this._whatToHide();
		
		// multiple overlays may hide the same element
		// flash elements keep track of which overlays have hidden them
		// trying to hide a flash element more than once does nothing
		for (var i = 0, leni = toHide.length; i < leni; i++) {
			hidBy = (toHide.item(i).data('overlayHidBy') || '');
			
			if (hidBy === '') {
				toHide.item(i).data('overlayOrigVisibility', toHide.item(i).css('visibility'));
				toHide.item(i).css('visibility', 'hidden');
			}
			if (hidBy.indexOf('['+this.uid+']') === -1) {
				toHide.item(i).data('overlayHidBy', hidBy + '['+this.uid+']');
			}
		}
		
		// things were hidden, make sure they get shown again
		if (toHide.length && !that._doShowFlash) { // do this only once
			that._doShowFlash = true;
			that.on('afterHide', function() { /*debug*///console.log('callback');
				that.showFlash();
			});
		}
		
		this._hiddenElements = toHide;
	}
	
	/**
		@name glow.ui.Overlay#showFlash
		@method
		@description Hides all Flash elements on the page, outside of the overlay.
		If a Flash element has been hidden by more than one overlay, you must call
		showFlash once for each time it was hidden before the Flash will finally appear.
	 */
	OverlayProto.showFlash = function() { /*debug*///console.log('showFlash');
		var hidBy = '';
		
		if (!this._hiddenElements || this._hiddenElements.length === 0) { // this overlay has not hidden anything?
			return;
		}
		
		var toShow = this._hiddenElements;
		
		for (var i = 0, leni = toShow.length; i < leni; i++) {
			hidBy = (toShow.item(i).data('overlayHidBy') || '');
			
			if (hidBy.indexOf('['+this.uid+']') > -1) { // I hid this
				hidBy = hidBy.replace('['+this.uid+']', ''); // remove me from the list of hiders
				toShow.item(i).data('overlayHidBy', hidBy);
			}
			
			if (hidBy == '') { // no hiders lefts
				toShow.item(i).css( 'visibility', toShow.item(i).data('overlayOrigVisibility') );
			}
		}
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
		@description Fired when the overlay is showing to the user and any delay or 'show' animation is complete.

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
	
	// animations that can be referred to in setAnim by string.
	// Each is an array of 2 item, one function to put the Overlay in an initial state
	// for this animation, and one for the animation itself
	var anims = {
		slide: [
			function(overlay) {
				overlay.container.height(0);
			},
			function(isShow, callback) {
				var anim,
					container = this.container;
					
				if (isShow) {
					anim = container.slideOpen(0.5).data('glow_slideOpen');
				}
				else {
					anim = container.slideShut(0.5).data('glow_slideShut');
				}
				
				anim.on('complete', callback);
			}
		],
		fade: [
			function(overlay) {
				overlay.container.css('opacity', 0);
			},
			function(isShow, callback) {
				var anim,
					container = this.container;
					
				if (isShow) {
					anim = container.fadeIn(0.5).data('glow_fadeIn');
				}
				else {
					anim = container.fadeOut(0.5).data('glow_fadeOut');
				}
				
				anim.on('complete', callback);
			}
		]
	}
	
	/**
		@name glow.ui.Overlay#setAnim
		@function
		@description Set the animation to use when showing and hiding this overlay.
		@param {string|Array|Function|null} anim Anim to use.
			At its simplest, this can be the string 'slide' or 'fade', to give
			the overlay a fading/sliding animation.
		
			If this value is an animation definition, in the form of an array of
			arguments to pass to the {@link glow.Anim} constructor, those values
			will be used to create the show animation. The hide animation will
			then be the reverse of the show. This is the easiest option if you
			intend your show and hide animations to simply reverse one another.
			
			Alternatively, if you need more control over your show and hide
			animations, you can provide a function.	This function will be called
			whenever the overlay has its show or hide method invoked, and will
			be provided a boolean (true meaning it's being shown, false meaning
			it's being hidden), and a callback. You can then manage the animations
			yourself within that function, and then invoke the callback when
			either animation is complete. In your function, 'this' refers to the
			overlay.
			
			Passing null will delete any previously set animation.
		
		@returns this
	*/
	OverlayProto.setAnim = function(anim) {
		if (anim === null) {
			delete this._animDef;
			delete this._animator;
		}
		else if (typeof anim === 'string') {
			anims[anim][0](this);
			this._animator = anims[anim][1];
		}
		else if (typeof anim === 'function') {
			this._animator = anim;
		}
		else {
			this._animDef = anim;
			this._animDef[2] = this._animDef[2] || {};
			this._animDef[2].destroyOnComplete = false;
		}
		
		return this;
	}
	
	/**
		@name glow.ui.Overlay#show
		@function
		@param {number} [delay=0] The delay before the overlay is shown.
			By default, the overlay will show immediately. Specify a number of seconds to delay showing.
			The event "afterShow" will be called after any delay and animation.
		@description Displays the overlay after an optional delay period and animation.

		@returns this
	*/
	OverlayProto.show = function(delay) {
		//if (this.shown) { /*debug*///console.log('show ignored');
		//	return this;
		//}
		var that = this;
		
		if ( !this.fire('show').defaultPrevented() ) {
			if (this._timer) {
				clearTimeout(this._timer);
			}
			
			if (delay) {
				this._timer = setTimeout(function() {
					show.call(that);
				}, delay * 1000);
			}
			else {
				show.call(that);
			}
		}
		
		return this;
	}
	
	function show() { /*debug*///console.log('show() curently '+this.state);
		var that = this;
		
		// already being shown?
		if (this.state === vis.SHOWING || this.state === vis.SHOWN) {
			return;
		}
		
		setShown(that, true);
		
		if (this._whatToHide) { this.hideFlash(); }
		
		if (this._animator) {
			that.state = vis.SHOWING;
			this._animator.call(this, true, function() { afterShow.call(that); });
		}
		else if (this._animDef) {
			if (this._anim) { // is hiding?
				this.state = vis.SHOWING;
				this._anim.reverse();
			}
			else { // is hidden?
				this.state = vis.SHOWING;
				
				// this same anim is reused (by reversing it) for showing and hiding
				this._anim = this.container.anim(this._animDef[0], this._animDef[1], this._animDef[2]);
				this._anim.on('complete', function() {
					
					if (that.state === vis.SHOWING) {
						setShown(that, true);
						afterShow.call(that);
					} 
					else if (that.state === vis.HIDING) {
						setShown(that, false);
						afterHide.call(that);
					}
				});
			}
			
			this._anim.start();
		}
		else {
			afterShow.call(this);
		}
	}
	
	function afterShow() { /*debug*///console.log('after show');
		this.state = vis.SHOWN;
		this.fire('afterShow');
	}
	
	/**
		@private
		@function
		@description Set the shown state & add/remove a class from the state element
	*/
	function setShown(overlay, shownState) {
		var stateElm = overlay._stateElm;
		
		overlay.shown = shownState;
		
		if (shownState) {
			stateElm.removeClass('hidden');
			stateElm.addClass('shown');
		}
		else {
			stateElm.removeClass('shown');
			stateElm.addClass('hidden');
		}
	}
	
	function hide() { /*debug*///console.log('hide() curently '+this.state);
		var that = this;
		
		if (this.state === vis.HIDING || this.state === vis.HIDDEN) {
			return;
		}
		
		if (this._animator) { // provided by user
			this._animator.call(this, false, function() {
				setShown(that, false);
				afterHide.call(that);
			});
		}
		else if (this._anim) { // generated by overlay
			this.state = vis.HIDING;
			this._anim.reverse();
			this._anim.start();
		}
		else { // no animation
			setShown(that, false);
			afterHide.call(this);
		}
	}
	
	function afterHide() { /*debug*///console.log('after hide');
		this.state = vis.HIDDEN;
		this.fire('afterHide');
	}
	
	/**
		@name glow.ui.Overlay#hide
		@function
		@param {number} [delay=0] The delay before the overlay is shown.
			By default, the overlay will show immediately. Specify a number of seconds to delay showing.
			The event "afterShow" will be called after any delay and animation.
		@description Hides the overlay after an optional delay period and animation

		@returns this
	*/
	OverlayProto.hide = function(delay) {
		//if (!this.shown) { /*debug*///console.log('hide ignored');
		//	return this;
		//}
		
		var that = this;
		
		if ( !this.fire('hide').defaultPrevented() ) {
			if (this._timer) {
				clearTimeout(this._timer);
			}
			
			if (delay) {
				this._timer = setTimeout(function() {
					hide.call(that);
				}, delay * 1000);
			}
			else {
				hide.call(that);
			}
		}
		
		return this;
	}

	// export
	glow.ui = glow.ui || {};
	glow.ui.Overlay = Overlay;
});