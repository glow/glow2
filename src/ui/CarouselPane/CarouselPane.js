Glow.provide(function(glow) {
	var undefined,
		CarouselPaneProto,
		WidgetProto = glow.ui.Widget.prototype;
	
	/**
		@name glow.ui.CarouselPane
		@class
		@extends glow.ui.Widget
		@description Create a pane of elements that scroll from one to another.
			This is a component of Carousel.
			
		@param {glow.NodeList|selector|HTMLElement} container Container of the carousel items.
			The direct children of this item will be treated as carousel items. They will
			be positioned next to each other horizontally.
			
			Each item takes up the same horizontal space, equal to the width of the largest
			item (including padding and border) + the largest of its horizontal margins (as set in CSS).
			
			The height of the container will be equal to the height of the largest item (including
			padding and border) + the total of its vertical margins.
			
		@param {object} [opts] Options
			@param {number} [opts.duration=0.2] Duration of scrolling animations in seconds.
			@param {string|function} [opts.tween='easeBoth'] Tween to use for animations.
				This can be a property name of {@link glow.tweens} or a tweening function.
			
			@param {number} [opts.step=1] Number of items to move at a time.
			@param {boolean} [opts.loop=false] Loop the carousel from the last item to the first.
			@param {boolean} [opts.page] Keep pages in sync by adding space to the end of the carousel.
				Spaces don't exist as physical HTML elements, but simply a gap from the last item
				to the end.
			
			@param {number} [opts.spotlight] The number of items to treat as main spotlighted items.
				A carousel may be wide enough to display 2 whole items, but setting
				this to 1 will result in the spotlight item sitting in the middle, with
				half of the previous item appearing before, and half the next item
				appearing after.
				
				By default, this is the largest number of whole items that can exist in
				the width of the container. Any remaining width will be used to partially
				show the previous/next item.
				
			@param {boolean} [opts.glide=false] Slide the carousel continuiously?
				This is initiated by the {@link glow.ui.CarouselPane#moveStart}
				function and is only valid for carousels where the step is set to 1.
				
		@example
			new glow.ui.CarouselPane('#carouselItems', {
				duration: 0.4,
				step: 2,
				loop: true
			});
	*/
	function CarouselPane(container, opts) {
		/*!debug*/
			if (!container) {
				glow.debug.warn('[wrong count] glow.ui.CarouselPane - argument "container" is required.');
				return;
			}
			if (opts && opts.spotlight && opts.step && opts.spotlight < opts.step) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + opts.step +') cannot be greater than opts.spotlight ('+ opts.spotlight + ').');
			}
			if (opts && opts.spotlight && opts.step && opts.page && opts.spotlight !== opts.step) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + opts.step +') cannot be different than opts.spotlight ('+ opts.spotlight + ') if opts.page is true.');
			}
		
			if (glow(container).length === 0) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - "'+container+'" is not a valid element specifier for the container.');
				return;
			}
		/*gubed!*/
		
		var that = this;
		
		opts = glow.util.apply({
			duration: 0.2,
			tween: 'easeBoth',
			step: 1,
			loop: false,
			glide: false,
			page: false, // add a gap?
			axis: 'x'    // either 'x' or 'y'
		}, opts || {});
		
		// TODO move to bind?
		this._resizeHandler = function(e) {
			that.updateUi();
		}
		
		if (opts.loop === false && opts.step !== 1) {
			opts.page = true;
		}
		
		if (opts.page) {
			opts.spotlight = opts.step;
		}

		glow.ui.Widget.call(this, 'CarouselPane', opts);
		this._init(container, opts);
	};
	
	glow.util.extend(CarouselPane, glow.ui.Widget);     // CarouselPane is a Widget
	glow.util.extend(CarouselPane, glow.events.Target); // CarouselPane is a Target
	CarouselPaneProto = CarouselPane.prototype;         // shortcut
	
	CarouselPaneProto._init = function(container) {  /*debug*///console.log('CarouselPaneProto._init');
		WidgetProto._init.call(this);
		
		// used value vs configured value (they may not be the same).
		this._step = this._opts.step;
		
		this._geom = (this._opts.axis === 'y')? ['height', 'top'] : ['width', 'left'];
		
		if (!this.stage) {
			this.stage = glow(container).item(0);
			
			this._viewport = glow('<div class="CarouselPane-viewport"></div>');
			glow(this.stage).wrap(this._viewport);
		}
		
		/**
			@name glow.ui.CarouselPane#items
			@type glow.NodeList
			@description Carousel items.
				This is the same as `myCarouselPane.stage.children()`
		*/
		this.items = this.stage.children();
		
		if (this._opts.spotlight > this.items.length) {
			/*!debug*/
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.spotlight (' + this._opts.spotlight +') cannot be greater than the number of items ('+ this.items.length + ').');
			/*gubed!*/
			this._opts.spotlight = this.items.length;
		}
		
		this.index = 0;
		
		this._build();
	}
	
	CarouselPaneProto._build = function() { /*debug*///console.log('CarouselPaneProto._build');
		WidgetProto._build.call(this, this._viewport, this._opts);
		
		for (var i = 0, leni = this.items.length; i < leni; i++) {
			this.items.item(i).css({position: 'absolute', 'z-index': 2});
		}
		
		this._itemDimensions = getDimensions(this.items);

		this._wingSize = Math.ceil(this.items.length * this._itemDimensions[this._geom[0]] * 1.5);
		
		this._viewport.css({
			overflow: 'scroll',
			overflowX: 'hidden', // hide scroll bars
			overflowY: 'hidden',
			position: 'relative',
			padding: 0,
			margin: 0,
			width: this._opts.axis === 'x'? '100%' : this._itemDimensions.width,
			height:  this._opts.axis === 'y'? '100%' : this._itemDimensions.height
		});
		
		this.stage.css({
			margin: 0,
			listStyleType: 'none' // useful when content is a list
		});
		
		/**
			@private
			@name glow.ui.CarouselPane#_spot
			@type Object
			@description Information about the spotlight area.
		*/
		this._spot = CarouselPane._getSpot(this._viewport.width(), this.items, this._itemDimensions, this._opts);
		this._gap = getGap.apply(this);
		if (this._opts.step === true) {
			this._step = this._spot.capacity;
		}
		else if (this._opts.step > this._spot.capacity) {
			/*!debug*/
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + this._opts.step +') cannot be greater than the calculated spotlight ('+ this._spot.capacity + ').');
			/*gubed!*/
			
			this._step = this._spot.capacity;
			this._gap = getGap.apply(this); 
		}
		
		this.stage.css({width: this.stage.width() + this._wingSize * 2, height: 100}); // [wing][stage[spot]stage][wing]
		
		for (var i = 0, leni = this.items.length; i < leni; i++) {
			this.items.item(i).css({position: 'absolute', 'z-index': 2, width: this._itemDimensions.width, height: this._itemDimensions.height});
		}
		layout.call(this);		
		this._bind();
		
		calculateIndex.call(this);
	}
	
	
	function getGap() { /*debug*///console.log('getGap()');
		var gap = { size: 0, count: 0 };
	
		if (this._opts.page) {
			gap.count = 
				this._spot.capacity -
				(
					this.items.length -
					Math.floor(this.items.length / this._step) * this._step
				);
			
			gap.size = gap.count * this._itemDimensions[this._geom[0]];
		}
	
		return gap;
	}
	
	CarouselPaneProto._bind = function() { /*debug*///console.log('CarouselPaneProto._bind');
		WidgetProto._bind.call(this);
		
		glow(window).on('resize', this._resizeHandler);
	}
	
	CarouselPaneProto.updateUi = function() { /*debug*///console.log('updateUi');
		WidgetProto._updateUi.call(this);
		
		
		this.stage.css({width: this._viewport.width() + this._wingSize * 2, height: '100%'});
		this._spot = CarouselPane._getSpot(this._viewport.width(), this.items, this._itemDimensions, this._opts);
		
		if (this._opts.step === true) {
			this._step = this._spot.capacity;
		}
		
		layout.call(this);
		
		this.index = 0;
		this.fire('updateUi', {});
	}
	
	/**
		@name glow.ui.CarouselPane#moveStop
		@function
		@description Stop moving the carousel.
			The current animation will end, leaving the carousel
			in step.
			
		@returns this
	*/
	CarouselPaneProto.moveStop = function() {
		// set temporary flag to signal the next animation in the timeline to stop
		// note that this is asynchronous: it is almost certain that this method
		// will return before the carousel actually stops
		this._gliderBrake = true;
	}
	
	/**
		@name glow.ui.CarouselPane#moveStart
		@function
		@description Start moving the carousel in a particular direction.
			If opts.slide is false this has the effect of calling
			moveBy(opts.step) or moveBy(-opts.step) continually.
			
			TODO: get clarification of opts.slide.
		
		@param {boolean} [backwards=false] Move backwards?
		
		@returns this
		
		@example
			nextBtn.on('mousedown', function() {
				myCarouselPane.moveStart();
			}).on('mouseup', function() {
				myCarouselPane.moveStop();
			});
	*/
	CarouselPaneProto.moveStart = function(backwards) { /*debug*///console.log('moveStart('+backwards+')');
		if (this._inMotion) {
			return false;
		}
		
		if (this._step !== 1) {
			throw new Error('Cannot call moveStart when step is not 1.');
		}
		
		var step = (backwards? -1 : 1),
			that = this;
		
		this._gliderBrake = false;
		this.moveTo(this.index+step, {callback: function() {
			if (!that._gliderBrake) {
				if (
					that._opts.loop ||
					( (backwards && that.index > 0) || (!backwards && that.index < that.items.length-1) )
				) {
					glide.call(that, backwards);
				}
			}
		}});
		
		return this;
	}
	
	/**
		Move continuously using a linear tween.
		@private
	 */
	var glide = function(backwards) { /*debug*///console.log('glide('+backwards+')');
		var dir = (backwards? -1 : 1),
			moves = [],
			offset = this.content[0].scrollLeft,
			amount = this._itemDimensions[this._geom[0]],
			from,
			to,
			that = this,
			moveAnim,
			wrapAt = offset + (backwards? -this.index * amount : (this.items.length-this.index) * amount);
		
		swap.call(this, 'back');
		
		for (var i = 0, leni = this.items.length; i < leni; i += this._step) {
			from = offset + dir * i * amount;
			to = offset + dir * (i + this._step) * amount;

			if ((backwards && from === wrapAt) || (!backwards && to === wrapAt)) {
				offset -= dir * this.items.length * amount;
			}
			
			moveAnim = that.content.anim(
				that._opts.duration,
				{scrollLeft: [from, to]},
				{tween: 'linear'}
			)
			.on('start', function() {
				indexMoveTo.call(that);
					
				if ( that.fire('move', { moveBy: dir, currentIndex: that.index }).defaultPrevented() ) {
					glideStop.call(that);
				}
			})
			.on('complete', function() {
				that.index += dir;
				if (that._gliderBrake || (!that._opts.loop && (that.index === that.items.length-1 || that.index === 0) ) ) {
					glideStop.call(that);
					that.fire('afterMove', {currentIndex: that.index});
				}
			});
			
			moves.push(moveAnim);
		}
		
		this._glider = new glow.anim.Timeline({loop: true});
		glow.anim.Timeline.prototype.track.apply(this._glider, moves);
		this._inMotion = true;
		this._gliderBrake = false;
		this._glider.start();
	}
	
	function indexMoveTo(index) {
		if (index !== undefined) { this.index = index; }
		
		// force index to be a number from 0 to items.length
		this.index = this.index % this.items.length;
		this.index = (this.index < 0)? this.index + this.items.length : this.index;
		
		return this.index;
	}
	
	function indexMoveBy(delta) {
		indexMoveTo.call(this, this.index += delta);
		
		return this.index;
	}
	
	function glideStop() {
		this._glider.stop();
		this._glider.destroy();
		
		this._inMotion = false;
		this.index = calculateIndex.call(this);
		jump.call(this);
		swap.call(this);
	}
	
	/**
		@name glow.ui.CarouselPane#spotlightIndexes
		@function
		@description Gets an array of spotlighted indexes.
			These are the indexes of the nodes within {@link glow.ui.CarouselPane#items}.
		
		@returns {number[]}
	*/
	CarouselPaneProto.spotlightIndexes = function() { /*debug*///console.log('CarouselPaneProto.spotlightIndexes()');
		var indexes = [],
			findex = calculateIndex.call(this),
			index,
			maxi = this._spot.capacity;
		
		// takes into account gaps and wraps
		for (var i = 0; i < maxi; i++) {
			index = (findex + i)%(this.items.length + this._gap.count);
			// skip gaps
			if (index >= this.items.length || index < 0) {
				continue; // or maybe keep gaps? index = NaN;
			}
			indexes.push(index);
		}		
		return indexes;
	}
	
	/**
		@name glow.ui.CarouselPane#spotlightItems
		@function
		@description Get the currently spotlighted items.
		
		@returns {glow.NodeList}
	*/
	CarouselPaneProto.spotlightItems = function() { /*debug*///console.log('CarouselPaneProto.spotlightItems()');
		var items = glow(),
			indexes = this.spotlightIndexes();
		
		// takes into account gaps and wraps
		for (var i = 0, leni = indexes.length; i < leni; i++) {
			items.push(this.items[indexes[i]]);
		}
		
		return items;
	}
	
	// calculate the index of the leftmost item in the spotlight
	function calculateIndex() {
		var cindex = this.content[0].scrollLeft - (this._wingSize +this._spot.offset.left);
		
		cindex += this._spot.offset.left;
		cindex /= this._itemDimensions.width;
		
		return cindex;
	}
	
	/**
		@name glow.ui.CarouselPane#moveTo
		@function
		@description Move the items so a given index is the leftmost active item.
			This method respects the carousel's limits and its step. If it's
			not possible to move the item so it's the leftmost item of the spotlight, it will
			be placed as close to the left as possible.
		
		@param {number} itemIndex Item index to move to.
		
		@returns this
	*/
	/*?
		@param {undefined|null|string} opts.tween If undefined, use the default animation,
		if null then no animation, if a string then use the named tween.
	 */
	CarouselPaneProto.moveTo = function(itemIndex, opts) { /*debug*///console.log('moveTo('+itemIndex+')');
		if (this._inMotion) {
			return false;
		}
		opts = opts || {};
		
		if (opts.tween !== null) { // don't announce jumps
			var e = new glow.events.Event({
				currentIndex: this.index,
				moveBy: (this.index < itemIndex)? (itemIndex - this.index) : (-Math.abs(this.index - itemIndex))
			});
			if ( this.fire('move', e).defaultPrevented() ) {
				return this;
			}
			else {
				itemIndex = this.index + e.moveBy;
			}
		}
		
		// invalid itemIndex value?
		if (itemIndex > this.items.length + this._step || itemIndex < 0 - this._step) { // moving more than 1 step
			/*!debug*/
				glow.debug.warn('[wrong value]  glow.ui.CarouselPane#moveTo - Trying to moveTo an item ('+itemIndex+') that is more than 1 step (' + this._step +' items) away is not possible now.');
			/*gubed!*/
			itemIndex = this.index + (this.index < itemIndex)? -this._step : this._step;
		}

		var destination = this._wingSize + this.container[0].scrollLeft + itemIndex * this._itemDimensions.width,
			anim;
	
		swap.call(this, 'back');
		if (opts.tween === null) {
			this.content[0].scrollLeft = destination;
			this.index = itemIndex;
			
			this._inMotion = false;
		}
		else if (canGo.call(this, itemIndex)) {
			this._inMotion = true;
			
			anim = this.content.anim(
				this._opts.duration,
				{
					scrollLeft: destination
				},
				{
					tween: opts.tween || this._opts.tween
				}
			);
			this.index = itemIndex;
			
			var that = this;

			anim.on('complete', function() {

				that._inMotion = false;
				
				jump.call(that);
				swap.call(that);
				
				// force index to be a number from 0 to items.length
				that.index = that.index % (that.items.length  + that._gap.count);
				
				that.fire('afterMove', {currentIndex: that.index});
				if (opts.callback) { opts.callback(); }
			});
		}
		
		return this;
	}
	
	/**
		@private
		@function
		@name jump
		@description Quickly move forward or back to a new set of items that look the same as
		the current set of items.
	 */
	function jump() {
		if (this.index < 0) {
			this.moveTo(this.items.length + this._gap.count + this.index, {tween: null});
		}
		else if (this.index >= this.items.length) {
			this.moveTo(this.index - (this.items.length + this._gap.count), {tween: null});
		}
	}
	
	/**
		Move real items to stand-in for any clones that are in the spotlight, or
		put the real items back again.
		@name swap
		@private
		@param {boolean} back If not a falsey value, will move the real items back.
	 */
	function swap(back) {
		var styleName = this._geom[1],
			offset = this._spot.offset.left + this._wingSize,
			amount = this._itemDimensions[this._geom[0]],
			swapper = null;
		
		if (back) {
			for (var i = 0, leni = this.items.length; i < leni; i++) {
				var backTo;
			var swapBacker = this.items.item(i)
			backTo = swapBacker.data('carousel-position')
				if (backTo !== undefined) {
					swapBacker.css(styleName, offset + backTo * amount);
				}
			}
			return;
		}
		
		for (var i = 0, leni = this._spot.capacity - this._gap.count; i < leni; i++) {
			if (this.index + i >= this.items.length) {
				var swapperPos = (this.index + i)%this.items.length;
				swapper = this.items.item(swapperPos);
				swapper.data('carousel-position', swapperPos);
				var swapTo = offset +((this.index + i +this._gap.count)*amount);
				swapper.css(styleName, swapTo);
			}
		}
	}
	
	/**
		@name glow.ui.CarouselPane#moveBy
		@function
		@description Move by a number of items.
		
		@param {number} amount Amount and direction to move.
			Negative numbers will move backwards, positive number will move
			forwards.
			
			This method respects the carousel's limits and its step. If it's
			not possible to move the item so it's the leftmost item of the spotlight, it will
			be placed as close to the left as possible.
		
		@returns this
	*/
	CarouselPaneProto.moveBy = function(amount) { /*debug*///console.log('moveBy('+amount+')');
		this.moveTo(this.index + amount);
		return this;
	}
	
	/**
		@name glow.ui.CarouselPane#next
		@function
		@description Move forward by the step.
		@returns this
	*/
	CarouselPaneProto.next = function() { /*debug*///console.log('next()');
		this.moveTo(this.index + this._step);
		return this;
	}
	
	/**
		@name glow.ui.CarouselPane#prev
		@function
		@description Move backward by the step.
		@returns this
	*/
	CarouselPaneProto.prev = function() { /*debug*///console.log('prev()');
		this.moveTo(this.index - this._step);
		return this;
	}
	
	// can the carousel go to that index?
	function canGo(itemIndex) {
		if (this._opts.loop) { return true; }
		
		// too far prev
		if (itemIndex < 0) { return false; }
		
		// too far next
		if (itemIndex - this._step >= this.items.length - this._spot.capacity ) { return false; }
		
		return true;
	}
	
	/**
		Calculate the bounds to use for every item in the carousel.
		@private
	 */
	function getDimensions(items) {
		var el,
			maxWidth = 0,
			maxHeight = 0;
			
		items.each(function() {
			maxHeight = Math.max(this.offsetHeight, maxHeight);
			maxWidth = Math.max(this.offsetWidth,  maxWidth);
		});
		
		return { width: maxWidth, height: maxHeight };
	}
	
	/**
		Calculate the bounds for the spotlighted area, within the viewport.
		@private
	 */
	CarouselPane._getSpot = function(viewportWidth, items, itemDimensions, opts) {/*debug*///console.log('CarouselPane._getSpot()');
		var spot = { capacity: 0, top: 0, left: 0, width: 0, height: 0, offset: { top: 0, right: 0, bottom: 0, left: 0 } },
			opts = opts || {}
		
		if (!itemDimensions) { itemDimensions = getDimensions(items); }
		
		if (opts.axis = 'x') {
			if (opts.spotlight) {
				if (opts.spotlight > items.length) {
					throw new Error('spotlight cannot be larger than item count.');
				}
				spot.capacity = opts.spotlight;
			}
			else {
				spot.capacity = Math.floor( viewportWidth / itemDimensions.width );
			}
		

			spot.width = spot.capacity * itemDimensions.width;
			spot.height = itemDimensions.height
			
			spot.offset.left = Math.floor( (viewportWidth - spot.width) / 2 );
			spot.offset.right = viewportWidth - (spot.offset.left + spot.width);
		}
		else {
			throw Error('y axis (vertical) not yet implemented');
		}
		
		return spot;
	}
	
	function layout() {
		var clone;
		
		var styleName = this._geom[1],
			amount = this._itemDimensions[this._geom[0]],
			offset = this._spot.offset.left + this._wingSize;
			this.content[0].scrollLeft = this._wingSize;
		
		for (var i = 0, leni = this.items.length; i < leni; i++) {
			this.items.item(i).css(styleName, offset + i * amount);
		}
		
		if (this._opts.loop) {
			// kill any old clones
			this.stage.get('.clone').remove();
			
			for (var i = 0, leni = this.items.length; i < leni; i++) {
				// under clones are visible when the real item gets swapped out
				clone = this.items.item(i).copy();
				this.stage[0].appendChild(clone[0]); // TODO
				clone.css(styleName, offset + i * amount);
				clone.addClass('clone');
				clone.css('z-index', 9);
			}
			
			// how many sets of clones (on each side) are needed to fill the off-spotlight portions of the stage?
			var repsMax =  1 + Math.ceil(this._spot.offset.left / (this._itemDimensions.width*this.items.length + this._gap.size));
			
			for (var reps = 1; reps <= repsMax; reps++) {
				i = this.items.length;
				while (i--) {
					// add clones to prev side
					clone = this.items.item(i).copy();
					this.stage[0].appendChild(clone[0]); // TODO
					clone.css(styleName, offset - reps*this._gap.size - (reps*this.items.length - i) * amount);
					clone.addClass('clone');
					clone.css('z-index', 1);
					
					// add clones to next side
					clone = clone.copy();
					this.stage[0].appendChild(clone[0]);
					clone.css(styleName, offset + reps*this._gap.size + (reps*this.items.length + i) * amount);
					clone.css('z-index', 1);
				}
			}
		}
	}
	
	CarouselPaneProto.destroy = function() {
		// TODO remove added node data?
		// TODO remove cloned items?
		glow(window).detach('resize', this._resizeHandler);
		WidgetProto.destroy.call(this);
	};
	
	/**
		@name glow.ui.CarouselPane#event:move
		@event
		@description Fires when the carousel is about to move.
			Canceling this event prevents the carousel from moving.
			
			This will fire for repeated move actions. Ie, this will fire many times
			after #start is called.
		
		@param {glow.events.Event} e Event Object
		@param {number} e.currentIndex Index of the current leftmost item.
		@param {number} e.moveBy The number of items the Carousel will move by.
			This is undefined for 'sliding' moves where the destination isn't known.
			
			This value can be overwritten, resulting in the carousel moving a different amount.
			The carousel step will still be respected.
			
		@example
			// double the amount a carousel will move by
			myCarouselPane.on('move', function(e) {
				e.moveBy *= 2;
			});
	*/

	/**
		@name glow.ui.CarouselPane#event:afterMove
		@event
		@description Fires when the carousel has finished moving.
			Canceling this event prevents the carousel from moving.
			
			This will not fire for repeated move actions. Ie, after #start is
			called this will not fire until the carousel reached an end point
			or when it comes to rest after #stop is called.
			
		@param {glow.events.Event} e Event Object
		@param {number} e.currentIndex Index of the current leftmost item.
			
		@example
			// double the amount a carousel will move by
			myCarouselPane.on('afterMove', function(e) {
				// show content related to this.spotlightItems()[0]
			});
	*/
	
	// EXPORT
	glow.ui.CarouselPane = CarouselPane;
});