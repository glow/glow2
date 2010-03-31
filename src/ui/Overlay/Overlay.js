Glow.provide(function(glow) {
	var OverlayProto,
		idCounter = 0,
		undefined,
		instances = {}; // like {uid: overlayInstance}

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
		
		this.uid = 'overlayId_' + glow.UID + '_' + (++idCounter);
		instances[this.uid] = this;
		
		this.lastState = -1; // enforce that states always alternate, -1 for hidden, +1 for shown
		
		opts = opts || {};
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
			@name glow.ui.Overlay#showing
			@description True if the overlay is showing.
				This is a read-only property to check the state of the overlay.
			@type boolean
		*/
		this.showing = false;
		
		return this;
	}
	
	OverlayProto.destroy = function() {
		this.base.destroy.call(this);
		
		delete instances[this.uid];
	}
	
	OverlayProto.attach = function(content, opts) {
		this.base.attach.call(this, content, opts);
		
		this.container.css('z-index', this.opts.zIndex);
// TODO: should the iframe always be added? would make styling more consistent across browsers
		//add IE iframe hack if needed, wrap content in an iFrame to prevent certain elements below from showing through
		if (glow.env.ie < 7) { /*debug*///console.log('created iframe');
			this._iframe = glow('<iframe src="javascript:\'\'" style="display:block;width:100%;height:1000px;margin:0;padding:0;border:none;position:absolute;top:0;left:0;filter:alpha(opacity=0);"></iframe>')
			this._iframe.css('z-index', 0);
			
			this._iframe.insertBefore(this.content);
			this.content
				.css('z-index', 1)
				.css('position', 'relative')
				.css('top', 0)
				.css('left', 0);
		}
		
		this.container.css('z-index', this.opts.zIndex);
		
		return this;
	}
	
	/**
		@name glow.ui.Overlay#hideFlash
		@method
		@description Calculates, based on the current position of this overlay, if it
		intersects with any Flash elements on the page. Any intersected Flash elements are then hidden and
		any previously hidden Flash elements that are no longer intersected will be shown.
		
		Note that all Flash elements hidden this way will automatically be reshown
		immediately after the overlay's afterHide event is fired.
	 */
	OverlayProto.hideFlash = function() { /*debug*///console.log('hideFlash');
		
		var toHide = glow(),
			that = this;
			
		toHide.push(
			glow('object, embed').filter(function() {
				return isWindowedFlash.call(this, that);
			})
		);
		
		// filter out the elements that are inside this overlay
		toHide = toHide.filter(function() {
			return !that.container.contains(this);
		});
		
		// multiple overlays may try to hide the same element
		// but only the first attempt should actually hide it
		for (var i = 0, leni = toHide.length; i < leni; i++) {
			toHide.item(i).data('overlayHideCount', (toHide.item(i).data('overlayHideCount') || 0) + 1);

			if (toHide.item(i).data('overlayHideCount') == 1) {
				toHide.item(i).data('overlayOrigVisibility', toHide.item(i).css('visibility'));
				toHide.item(i).css('visibility', 'hidden');
			}
		}
		
		this._hiddenElements = toHide;
	}
	
	var flashUrlTest = /.swf($|\?)/i,
		wmodeTest = /<param\s+(?:[^>]*(?:name=["'?]\bwmode["'?][\s\/>]|\bvalue=["'?](?:opaque|transparent)["'?][\s\/>])[^>]*){2}/i;
	
	OverlayProto.showFlash = function() {
		if (!this._hiddenElements || this._hiddenElements.length === 0) {
			return;
		}
		
		var toHide = this._hiddenElements;
		
		for (var i = 0, leni = toHide.length; i < leni; i++) {
			toHide.item(i).data(
				'overlayHideCount',
				Math.max(0, toHide.item(i).data('overlayHideCount') - 1)
			);
			
			if (toHide.item(i).data('overlayHideCount') == 0) {
				toHide.item(i).css( 'visibility', toHide.item(i).data('overlayOrigVisibility') );
			}
		}
	}
	
	function isWindowedFlash(overlay) {
		var that = this, wmode;
		//we need to use getAttribute here because Opera & Safari don't copy the data to properties
		if (
			(that.getAttribute("type") == "application/x-shockwave-flash" ||
			flashUrlTest.test(that.getAttribute("data") || that.getAttribute("src") || "") ||
			(that.getAttribute("classid") || "").toLowerCase() == "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000")
		) {
			wmode = that.getAttribute("wmode");

			return (that.nodeName == "OBJECT" && !wmodeTest.test(that.innerHTML)) ||
				(that.nodeName != "OBJECT" && wmode != "transparent" && wmode != "opaque");

		}
		return false;
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
	
	/**
		@name glow.ui.Overlay#setAnim
		@function
		@description Set the animation to use when showing and hiding this overlay.
		@param {Array|Function|null} anim If this value is an animation definition, in the form of an array of arguments to pass to 
		the {@link glow.Anim} constructor, those values will be used to create the show animation. The hide animation will then be the 
		reverse of the show. This is the easiest option if you intend your show and hide animations to simply reverse one another.
		
		Alternatively, if you need more control over your show and hide animations, you can provide a function.
		This function will be called whenever the overlay has its show or hide
		method invoked, and will be provided a boolean (true meaning it's being shown, false meaning it's
		being hidden), and a callback. You can then manage the animations yourself within that function, and then invoke the
		callback when either animation is complete.
		
		Passing null will delete any previously set animation.
	*/
	OverlayProto.setAnim = function(anim) { //todo: could be word, like "fade", or a function
		if (anim === null) {
			delete this._animDef;
			delete this._animator;
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
		if (this.showing) { /*debug*///console.log('show ignored');
			return;
		}
		
		delay = (delay || 0) * 1000;

		var e = new glow.events.Event(),
			that = this;
			
		this.fire('show', e);
		
		if (!e.defaultPrevented()) {
			if (this._timer) {
				clearTimeout(this._timer);
			}
			
			this._timer = setTimeout(
				function() { show.call(that); }
				,
				delay
			);
		}
		
		return this;
	}
	
	function show() {
		var that = this;
		
		this.showing = true;
		this.container.state.addClass('showing');
		
		if (this._animator) {
			this._animator.call(this, true, function() { afterShow.call(that); });
		}
		else if (this._animDef) {
			if (this._anim) {
				this._anim.reverse();
			}
			else {
				this._anim = this.container.anim(this._animDef[0], this._animDef[1], this._animDef[2]);
				this._anim.on('complete', function() {
					if (that._anim.reversed) {
						if (that.lastState === 1) {
							that.lastState = -that.lastState;
							afterHide.call(that);
						}
					}
					else {
						if (that.lastState === -1) {
							that.lastState = -that.lastState;
							afterShow.call(that);
						}
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
		this.fire('afterShow');
	}
	
	function hide() {
		this.showing = false;
		this.container.state.removeClass('showing');
		
		if (this._animator) {
			this._animator.call(this, false, function() { afterHide.call(that); });
		}
		else if (this._anim) {
			this._anim.reverse();
			this._anim.start();
		}
		else {
			afterHide.call(this);
		}
	}
	
	function afterHide() { /*debug*///console.log('after hide');
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
		if (!this.showing) { /*debug*///console.log('hide ignored');
			return;
		}
		
		delay = (delay || 0) * 1000;
		
		var e = new glow.events.Event()
			that = this;
			
		this.fire('hide', e);
		
		if (!e.defaultPrevented()) {
			if (this._timer) {
				clearTimeout(this._timer);
			}
			
			this._timer = setTimeout(
				function() { hide.call(that); }
				,
				delay
			);
		}
		
		return this;
	}
	
//	function intersects(nodeList) {
//		var i = nodeList.length;		
//	}

	// export
	glow.ui = glow.ui || {};
	glow.ui.Overlay = Overlay;
});