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
			
			@param {boolean | number} [opts.step=1] Number of items to move at a time.
				If true, the step will be the same size as the spotlight.
			@param {boolean} [opts.loop=false] Loop the carousel from the last item to the first.
			@param {boolean} [opts.page=false] Keep pages in sync by adding space to the end of the carousel.
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
			
			if (!container || glow(container).length === 0) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - "'+container+'" is not a valid element specifier for the container.');
			}
			
			if (opts && opts.spotlight && opts.step && opts.spotlight < opts.step && opts.step !== true) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + opts.step +') cannot be greater than opts.spotlight ('+ opts.spotlight + ').');
			}
			
			if (opts && opts.spotlight && opts.step && opts.page && opts.spotlight !== opts.step && opts.step !== true) {
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + opts.step +') cannot be different than opts.spotlight ('+ opts.spotlight + ') if opts.page is true.');
			}
		/*gubed!*/
		
		var that = this;
		
		opts = glow.util.apply({
			duration: 0.2,
			tween: 'easeBoth',
			step: 1,
			loop: false,
			page: false, // add a gap?
			axis: 'x'    // either 'x' or 'y'
		}, opts || {});

		glow.ui.Widget.call(this, 'CarouselPane', opts);
		
		
		if (glow(container).length > 0) { this._init(container, opts); }
	};
	
	glow.util.extend(CarouselPane, glow.ui.Widget);     // CarouselPane is a Widget
	glow.util.extend(CarouselPane, glow.events.Target); // CarouselPane is a Target
	CarouselPaneProto = CarouselPane.prototype;         // shortcut
	
	
	
	/**
		Tracks the order and location of all items, including cloned items.
		@private
		@constructor
		@param {glow.NodeList} nodeList The real items to track.
	 */
	function ItemList(nodeList) {
		var thisMeta;
		
		this.range = {min: 0, max: 0};
		this.items = {};
		this.meta = {};
		
		for (var i = 0, leni = nodeList.length; i < leni; i++) {
			this.addItem(i, nodeList.item(i));
		}
	}
	
	ItemList.prototype.addItem = function(index, item, meta) {/*debug*///console.log('ItemList.prototype.addItem('+index+')');
		this.range.min = Math.min(this.range.min, index);
		this.range.max = Math.max(this.range.max, index);
		
		this.items[index] = item;
		this.meta[index] = meta || {};
	}
	
	ItemList.prototype.addMeta = function(index, meta) {/*debug*///console.log('ItemList.prototype.addMeta('+index+', '+meta.offset+')');
		if (this.meta[index]) {
			this.meta[index] = glow.util.apply(this.meta[index], meta);
		}
	}
	
	ItemList.prototype.place = function(top, left) {
		// TODO styleName = this._geom[1]
		for (var p in this.items) {
			if (top !== undefined ) this.items[p].css('top', top);
			this.items[p].css('left', (left === undefined)? this.meta[p].offset : left);
		}
	}
	
	ItemList.prototype.dump = function(c) {
		if (typeof console !== 'undefined') {
			for (var i = c._itemList.range.min, maxi = c._itemList.range.max; i <= maxi; i++) {
				if (c._itemList.meta[i]) {
					console.log('>> '+ i + ': ' + (c._itemList.meta[i].isClone? 'clone':'real') + ' at ' + c._itemList.meta[i].offset + ' ' + c._itemList.items[i][0].children[0].alt);
				}
				else {
					console.log('>> '+ i + ': ' + c._itemList.meta[i]);
				}
			}
		}
	}
	
	ItemList.prototype.swap = function(index1, index2) { /*debug*///console.log('ItemList.prototype.swap('+index1+', '+index2+')');
		this.items[index1].css('left', this.meta[index2].offset);
		this.items[index2].css('left', this.meta[index1].offset);
	}
	
	CarouselPaneProto._init = function(container) { /*debug*///console.log('CarouselPaneProto._init');
		WidgetProto._init.call(this);
		
		// used value vs configured value (they may not be the same). Might be set to spotlight capacity, in _build.
		this._step = this._opts.step;
		
		this._geom = (this._opts.axis === 'y')? ['height', 'top'] : ['width', 'left'];
		
		/**
			@name glow.ui.CarouselPane#stage
			@type glow.NodeList
			@description The container passed in to the constructor for glow.ui.CarouselPane.
		*/
		this.stage = glow(container).item(0);

		this._focusable = this.stage.focusable( {children: '> .carousel-item', loop: true, setFocus: true} );
		
		
		// what would have been the "content" of this widget, is named "viewport"
		this._viewport = glow('<div class="CarouselPane-viewport"></div>');
		glow(this.stage).wrap(this._viewport);
		
		/**
			@name glow.ui.CarouselPane#items
			@type glow.NodeList
			@description Carousel items.
				This is the same as `myCarouselPane.stage.children()`
		*/
		this.items = this.stage.children();
		this._itemList = new ItemList(this.items);
		
		if (this._opts.spotlight > this.items.length) {
			/*!debug*/
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.spotlight (' + this._opts.spotlight +') cannot be greater than the number of items ('+ this.items.length + ').');
			/*gubed!*/
			this._opts.spotlight = this.items.length;
		}
		
		// track what the offset of the current leftmost spotlighted item is
		this._index = 0;
		
		this._build();
	}
	
	CarouselPaneProto._build = function() { /*debug*///console.log('CarouselPaneProto._build');
		WidgetProto._build.call(this, this._viewport, this._opts);
		
		this.stage.css({
			margin: 0,
			listStyleType: 'none' // useful when content is a list
		});

		this.items.css( {position:'absolute', 'z-index':2} );
		this._itemDimensions = getDimensions(this.items); // get this *after* setting position to absolute
		this.items.css({
			margin: 0,
			width: this._itemDimensions.innerWidth,
			height: this._itemDimensions.innerHeight
		});

		this._wingSize = Math.ceil(this.items.length * this._itemDimensions[this._geom[0]] * 1.5);

		this._viewport.css({
			overflow: 'scroll',
			overflowX: 'hidden', // hide scroll bars
			overflowY: 'hidden',
			position: 'relative',
			padding: 0,
			margin: 0,
			width: this._opts.axis === 'x'? '100%' : this._itemDimensions.width,
			height: this._opts.axis === 'y'? '100%' : this._itemDimensions.height
		});
		
		/**
			@private
			@name glow.ui.CarouselPane#_spot
			@type Object
			@description Information about the spotlight area.
		*/
		this._spot = CarouselPane._getSpot(this._viewport.width(), this.items, this._itemDimensions, this._opts);
		
		/**
			@private
			@name glow.ui.CarouselPane#_step
			@type number
			@description How far to move when going next or prev.
		*/
		if (this._opts.step === true) {
			this._step = this._spot.capacity;
		}
		else if (this._opts.step > this._spot.capacity) {
			/*!debug*/
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + this._opts.step +') cannot be greater than the calculated spotlight ('+ this._spot.capacity + ').');
			/*gubed!*/
			
			this._step = this._spot.capacity;
		}

		if (this._opts.page && this._step !== this._spot.capacity) {
			/*!debug*/
				glow.debug.warn('[invalid configuration] glow.ui.CarouselPane - opts.step (' + this._opts.step +') cannot be different than the spotlight ('+ this._spot.capacity + ') when opts.page is true.');
			/*gubed!*/
			
			this._step = this._spot.capacity;
		}
		
		/**
			@private
			@name glow.ui.CarouselPane#_gap
			@type Object
			@description Information about the gap at the end of the items.
			@property size
			@property count
		*/
		this._gap = getGap(this);
		
		this.stage.css({width: this.stage.width() + this._wingSize * 2}); // [wing][stage[spot]stage][wing]
		
		layout.call(this);
		
		this._bind();
		
		calculateIndex.call(this);
	}
	
	/**
		@private
		@name getGap
		@description Calculate the size of the empty space at the end of the items
			which may be required to enforce paging.
		@param {glow.ui.CarouselPane} carouselPane
	 */
	function getGap(carouselPane) { /*debug*///console.log('getGap()');
		var gap = { size: 0, count: 0 },
			danglingItemCount = carouselPane.items.length % carouselPane._step;
	
		if (carouselPane._opts.page && carouselPane._step > 1) {
			gap.count = danglingItemCount? carouselPane._spot.capacity - danglingItemCount : 0;
			gap.size = gap.count * carouselPane._itemDimensions[carouselPane._geom[0]];
		}
	
		return gap;
	}
	
	CarouselPaneProto._bind = function() { /*debug*///console.log('CarouselPaneProto._bind');
		var that = this;
		
		WidgetProto._bind.call(this);
		
		this._resizeHandler = function(e) {
			that.updateUi();
		}
		glow(window).on('resize', this._resizeHandler);
		
		this._recentActive = null;
		this._childActivateHandler = function(e) { // keep a ref so we can detach it in destroy
			var itemNumber = e.itemIndex,
				indexes = that.spotlightIndexes(true),
				isVisible = (' '+indexes.join(' ')+' ').indexOf(' '+itemNumber+' ') > -1;

			if (itemNumber !== undefined && !isVisible) {
				that.moveTo(itemNumber, {jump: true});
				this._index = itemNumber;
			}
		}
		that._focusable.on('childActivate', this._childActivateHandler);
	}
	
	CarouselPaneProto.updateUi = function() { /*debug*///console.log('updateUi');
		WidgetProto._updateUi.call(this);
		
		this.stage.css({width: this._viewport.width() + this._wingSize * 2, height: '100%'});
		this._spot = CarouselPane._getSpot(this._viewport.width(), this.items, this._itemDimensions, this._opts);
		
		if (this._opts.step === true) {
			this._step = this._spot.capacity;
		}
		
		layout.call(this);
		
		this._index = 0;
		this.fire('updateUi', {});
	}
	
	/**
		@name glow.ui.CarouselPane#moveStop
		@function
		@description Stop moving the carousel.
			The current animation will end, leaving the carousel
			in step. Note that this is asynchronous: expect this method
			to return before the carousel actually stops.
			
		@returns this
	*/
	CarouselPaneProto.moveStop = function() { /*debug*///console.log('moveStop()');
		// set temporary flag to signal the next animation in the timeline to stop
		this._gliderBrake = true;
	}
	
	/**
		@name glow.ui.CarouselPane#moveStart
		@function
		@description Start moving the carousel in a particular direction.
		
		@param {boolean} [backwards=false] True to move backwards, otherwise move forwards.
		
		@returns this
		@see glow.ui.CarouselPane#moveStop
		
		@example
			nextBtn.on('mousedown', function() {
				myCarouselPane.moveStart();
			}).on('mouseup', function() {
				myCarouselPane.moveStop();
			});
	*/
	CarouselPaneProto.moveStart = function(backwards) { /*debug*///console.log('moveStart('+backwards+')');
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.moveStart - too many arguments, must be 1 or 0, not '+arguments.length+'.');
				return;
			}
		/*gubed!*/
		
		var step = (backwards? -1 : 1) * this._step,
			carouselPane = this;
		
		if (!carouselPane._inMotion) {
			carouselPane._gliderBrake = false;
			
			carouselPane.moveTo(
				carouselPane._index + step,
				{
					callback: function() {
						if (!carouselPane._gliderBrake) {
							if ( // if looping or if there's room to go in the given direction 
								carouselPane._opts.loop ||
								( (backwards && carouselPane._index > 0) || (!backwards && carouselPane._index + carouselPane._spot.capacity < carouselPane.items.length) )
							) {
								if (carouselPane._step === 1) {
									glide.call(carouselPane, backwards);
								}
								else {
									carouselPane.moveStart(backwards); // recursive
								}
							}
						}
					}
				}
			);
		}
		
		return carouselPane;
	}
	
	/**
		@name glow.ui.CarouselPane#moveToggle
		@function
		@description If this CarouselPane is currently moving via moveStart, will call moveStop,
		otherwise will call moveStart.
		@param {boolean} [backwards=false] When calling moveStart, move backwards?
		@returns this
	 */
	CarouselPaneProto.moveToggle = function(backwards) { /*debug*///console.log('moveToggle()');
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.moveToggle - too many arguments, must be 1 or 0, not '+arguments.length+'.');
				return;
			}
		/*gubed!*/
		
		if (this._inMotion && !this._gliderBrake) {
			this.moveStop();
		}
		else {
			this.moveStart(backwards);
		}
		
		return this;
	}
	
	/**
		@private
		@name glide
		@function
		@description Move this using an animation that is continuous, with a linear tween.
		@param {boolean} backwards Glide in a previous-direction?
	 */
	var glide = function(backwards) { /*debug*///console.log('glide('+backwards+')');
		var dir = (backwards? -1 : 1),
			moves = [],
			offset = this.content[0].scrollLeft, // from where is the move starting?
			amount = this._itemDimensions[this._geom[0]], // how many pixels are we moving by?
			from,
			to,
			that = this,
			moveAnim,
			// when to loop back to where we started?
			wrapAt = offset + (backwards? -this._index * amount : (this.items.length - this._index) * amount);
		
		swap.call(this, 'back');

		for (var i = 0, leni = this.items.length; i < leni; i += this._step) {
			// calculate the start and end points of the next move
			from = offset + dir * i * amount;
			to   = offset + dir * (i + this._step) * amount;

			if ( (backwards && from === wrapAt) || (!backwards && to === wrapAt) ) {
				offset -= dir * this.items.length * amount; // wrap
			}

			moveAnim = this.content.anim(
				this._opts.duration,
				{scrollLeft: [from, to]},
				{tween: 'linear', startNow: false}
			)
			.on('start', function() {
				indexMoveTo.call(that);
					
				if ( that.fire('move', { moveBy: dir, currentIndex: that._index }).defaultPrevented() ) {
					glideStop.call(that);
				}
			})
			.on('complete', function() {
				that._index += dir; // assumes move amount will be +/- 1

 				if (
 					that._gliderBrake
 					||
 					( !that._opts.loop && (that._index + that._spot.capacity === that.items.length || that._index === 0) )
 				) {
 					glideStop.call(that);
 					that.fire( 'afterMove', {currentIndex: that._index} );
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
	
	/**
		@private
		@name indexMoveTo
		@function
		@description Calculate what the new index would be and set this._index to that.
		@param {number} index The destination index.
		@returns this._index
		@example
			// items.length is 3
			var newIndex = indexMoveTo(10);
			// newIndex is 1
	 */
	function indexMoveTo(index) {
		if (index !== undefined) { this._index = index; }
		
		// force index to be a number from 0 to items.length
		this._index = this._index % this.items.length;
		while (this._index < 0) { this._index += this.items.length; }
		
		return this._index;
	}
	
	/**
		@private
		@name indexMoveBy
		@function
		@description Calculate what the new index would be and set this._index to that.
		@param {number} delta The amount to change the index by, can be positive or negative.
		@returns this._index
		@example
			// items.length is 3
			// currentIndex is 1
			var newIndex = indexMoveBy(100);
			// newIndex is 2
	 */
	function indexMoveBy(delta) {
		return indexMoveTo.call(this, this._index += delta);
	}
	
	/**
		@private
		@name glideStop
		@description Reset this CarouselPane after a glide is finished.
	 */
	function glideStop() { /*debug*///console.log('glideStop()');
		this._glider.stop();
		this._glider.destroy();
		
		this._inMotion = false;
		this._index = calculateIndex.call(this); // where did we end up?
		
		// in case our clones are showing
		jump.call(this);
		swap.call(this);
	}
	
	/**
		@name glow.ui.CarouselPane#spotlightIndexes
		@function
		@description Gets an array of spotlighted indexes.
			These are the indexes of the nodes within {@link glow.ui.CarouselPane#items}.
			Only item indexes currently visible in the spotlight will be included.
		@private-param {boolean} _real Return only indexes of real items, regardless of what clones are visible.
		@returns {number[]}
	*/
	CarouselPaneProto.spotlightIndexes = function(_real) { /*debug*///console.log('CarouselPaneProto.spotlightIndexes()');
		var indexes = [],
			findex = calculateIndex.call(this),
			index,
			maxi = (this._opts.loop)? this._spot.capacity : Math.min(this._spot.capacity, this.items.length);
		
		// takes into account gaps and wraps
		for (var i = 0; i < maxi; i++) {
			index = _real? (findex + i) : (findex + i)%(this.items.length + this._gap.count);
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
		Only items currently visible in the spotlight will be included.
		@returns {glow.NodeList}
	*/
	CarouselPaneProto.spotlightItems = function() { /*debug*///console.log('CarouselPaneProto.spotlightItems()');
		var items = glow(),
			indexes = this.spotlightIndexes();
		
		// takes into account gaps and wraps
		for (var i = 0, leni = indexes.length; i < leni; i++) {
			items[i] = this.items[ indexes[i] ];
		}
		
		return items;
	}
	
	/**
		@private
		@name calculateIndex
		@function
		@description Calculate the index of the leftmost item in the spotlight.
		@returns {number}
	 */
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
		
		@param opts
		@param {undefined|string} opts.tween If undefined, use the default animation,
		if empty string then no animation, if non-empty string then use the named tween.
		@privateParam {Function} opts.callback Called when move animation is complete.
		@privateParam {boolean} opts.jump Move without animation and without events.
		
		@returns this
	*/
	CarouselPaneProto.moveTo = function(itemIndex, opts) { /*debug*///glow.debug.log('moveTo('+itemIndex+')');
		var willMove, // trying to move to the same place we already are?
			destination, // in pixels
			tween,
			anim;
		
		if (this._inMotion) {
			return false;
		}
		opts = opts || {};
		
		// will the last item be in the spotlight?
		if (!this._opts.loop && itemIndex > this.items.length - this._spot.capacity) {
			// if opts.page is on then allow a gap at the end, otherwise don't include gap
			itemIndex = this.items.length - this._spot.capacity + (this._opts.page? this._gap.count : 0);
		}
		else if (!this._opts.loop && itemIndex < 0) {
			itemIndex = 0;
		}

		willMove = ( itemIndex !== this._index && canGo.call(this, itemIndex) );
		
		// move event
		if (!opts.jump) { // don't fire move event for jumps
			var e = new glow.events.Event({
				currentIndex: this._index,
				moveBy: (this._index < itemIndex)? (itemIndex - this._index) : (-Math.abs(this._index - itemIndex))
			});
			
			if ( willMove && this.fire('move', e).defaultPrevented() ) {
				return this;
			}
			else {
				itemIndex = this._index + e.moveBy;
			}
		}

		// force items to stay in step when opts.page is on
		if (this._opts.page) {
			itemIndex = Math.floor(itemIndex / this._step) * this._step;
		}
		
		// invalid itemIndex value?
		if (itemIndex > this.items.length + this._step || itemIndex < 0 - this._step) { // moving more than 1 step
			/*!debug*/
				glow.debug.warn('[wrong value]  glow.ui.CarouselPane#moveTo - Trying to moveTo an item ('+itemIndex+') that is more than 1 step (' + this._step +' items) away is not possible.');
			/*gubed!*/
			itemIndex = this._index + (this._index < itemIndex)? -this._step : this._step;
		}

		destination = this._wingSize + itemIndex * this._itemDimensions.width;

		swap.call(this, 'back');
		
		tween = opts.tween || this._opts.tween;
		
		var that = this;
		if (opts.jump === true || tween === '') { // jump
			this.content[0].scrollLeft = destination;
			
			this._index = itemIndex;
			// in case our clones are showing
			jump.call(this);
			swap.call(this);
			
			// force index to be a number from 0 to items.length
			this._index = this._index % (this.items.length  + this._gap.count);
			
			if (tween !== null && willMove) {
				this.fire('afterMove', {currentIndex: this._index});
			}
			
			this._inMotion = false;
		}
		else if (willMove) {
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
			
			this._index = itemIndex;
			
			
			anim.on('complete', function() {
				that._inMotion = false;
				
				// in case our clones are showing
				jump.call(that);
				swap.call(that);
				
				// force index to be a number from 0 to items.length
				that._index = that._index % (that.items.length  + that._gap.count);
				
				that.fire('afterMove', {currentIndex: that._index});
				
				if (opts.callback) {
					opts.callback();
				}
			});
		}
		
		return this;
	}
	
	function afterMoveTo(carouselPane, itemIndex) {
	
	}
	
	/**
		@private
		@function
		@name jump
		@description Quickly move forward or back to a new set of items that look the same as
		the current set of items.
	 */
	function jump() { /*debug*///console.log('jump()');
		if (this._index < 0) {
			this.moveTo(this.items.length + this._gap.count + this._index, {jump: true});
		}
		else if (this._index >= this.items.length) {
			this.moveTo(this._index - (this.items.length + this._gap.count), {jump: true});
		}
	}
	
	/**
		Move real items to stand-in for any clones that are in the spotlight, or
		put the real items back again.
		@name swap
		@private
		@param {boolean} back If a truthy value, will move the real items back.
	 */
	function swap(back) { /*debug*///console.log('swap('+back+')');
		var swapItemIndex;
		
		if (back) {
			this._itemList.place();
		}
		else {
			for (var i = 0, leni = this._spot.capacity - this._gap.count; i < leni; i++) {
				swapItemIndex = (this._index + i);
				if (swapItemIndex >= this.items.length) { // a clone needs to have a real item swapped-in
					this._itemList.swap(swapItemIndex, swapItemIndex % this.items.length);
				}
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
		this.moveTo(this._index + amount);
		return this;
	}
	
	/**
		@name glow.ui.CarouselPane#next
		@function
		@description Move forward by the step.
		@returns this
	*/
	CarouselPaneProto.next = function() { /*debug*///console.log('next()');
		this.moveTo(this._index + this._step);
		return this;
	}
	
	/**
		@name glow.ui.CarouselPane#prev
		@function
		@description Move backward by the step.
		@returns this
	*/
	CarouselPaneProto.prev = function() { /*debug*///console.log('prev()');
		this.moveTo(this._index - this._step);
		return this;
	}
	
	/**
		@private
		@name canGo
		@description Determine if the CarouselPane can go to the desired index.
		@param {number} itemIndex The desired index.
		@returns {boolean}
	 */
	function canGo(itemIndex) { /*debug*///console.log('canGo('+itemIndex+')');
		if (this._opts.loop) { return true; }
		
		// too far prev
		if (itemIndex < 0) {
			return false;
		}

		// too far next
		if (itemIndex - this._step >= this.items.length - this._spot.capacity ) {
			return false;
		}
		return true;
	}
	
	/**
		@private
		@name getDimensions
		@description Calculate the max height and width of all the items.
		@param {glow.NodeList} items
		@returns {Object} With properties `width` and 'height`.
	 */
	function getDimensions(items) {
		var el,
			maxInnerWidth = 0,
			maxInnerHeight = 0,
			maxWidth = 0,
			maxHeight = 0,
			margin = 0,
			marginRight = 0,
			marginLeft = 0,
			marginTop = 0,
			marginBottom = 0;
			
		items.each(function() {
			el = glow(this);
			maxHeight = Math.max(this.offsetHeight, maxHeight);
			maxWidth = Math.max(this.offsetWidth, maxWidth);
			maxInnerWidth = Math.max(el.width(), maxInnerWidth);
			maxInnerHeight = Math.max(el.height(), maxInnerHeight);
			marginRight = Math.max(autoToValue(el.css('margin-right')), marginRight);
			marginLeft = Math.max(autoToValue(el.css('margin-left')), marginLeft);
			marginTop = Math.max(autoToValue(el.css('margin-top')), marginTop);
			marginBottom = Math.max(autoToValue(el.css('margin-bottom')), marginBottom);
		});
		
		// simulate margin collapsing. see: http://www.howtocreate.co.uk/tutorials/css/margincollapsing
		margin = Math.max(marginLeft, marginRight); // the larger of: the largest left matgin and the largest right margin
		return { width: maxWidth+margin, height: maxHeight+marginTop+marginBottom, innerWidth: maxInnerWidth, innerHeight: maxInnerHeight, marginLeft: marginLeft, marginRight: marginRight, marginTop: marginTop, marginBottom: marginBottom };
	}
	
	function autoToValue(v) {
		if (v === 'auto') return 0;
		else return parseInt(v);
	}
	
	/**
		@private
		@name _getSpot
		@description Calculate the bounds for the spotlighted area, within the viewport.
		@private
	 */
	CarouselPane._getSpot = function(viewportWidth, items, itemDimensions, opts) {/*debug*///console.log('CarouselPane._getSpot()');
		var spot = { capacity: 0, top: 0, left: 0, width: 0, height: 0, offset: { top: 0, right: 0, bottom: 0, left: 0 } },
			opts = opts || {}
		
		if (!itemDimensions) { itemDimensions = getDimensions(items); }
		
		if (opts.axis = 'x') {
			if (items.length === 0) {
				spot.capacity = 0;
			}
			else if (opts.spotlight) {
				if (opts.spotlight > items.length) {
					throw new Error('spotlight cannot be larger than item count.');
				}
				spot.capacity = opts.spotlight;
			}
			else {
				spot.capacity = Math.floor( viewportWidth / itemDimensions.width );
			}

			if (spot.capacity > items.length) {
				spot.capacity = items.length;
			}

			spot.width = spot.capacity * itemDimensions.width + Math.min(itemDimensions.marginLeft, itemDimensions.marginRight);
			spot.height = itemDimensions.height
			
			spot.offset.left = Math.floor( (viewportWidth - spot.width) / 2 );
			spot.offset.right = viewportWidth - (spot.offset.left + spot.width);
		}
		else {
			throw Error('y axis (vertical) not yet implemented');
		}
		
		return spot;
	}
	
	function getPosition(itemIndex) { /*debug*///console.log('getPosition('+itemIndex+')');
		position = { top: 0, left: 0 };
		
		// TODO: memoise?
		var size = this._itemDimensions.width,
			offset = this._spot.offset.left + this._wingSize + this._itemDimensions.marginLeft,
			gap = 0;
			
			if (this._opts.page && itemIndex < 0) {
				gap = -(1 + Math.floor( Math.abs(itemIndex+this._gap.count) / this.items.length)) * this._gap.count * size;
			}
			else if (this._opts.page && itemIndex >= this.items.length) {
				gap = Math.floor(itemIndex / this.items.length) * this._gap.count * size;
			}

			position.left = offset + (itemIndex * size) + gap;
			position.top = this._itemDimensions.marginTop;

			return position;
	}
	
	function layout() {/*debug*///console.log('layout()');
		var clone,
			cloneOffset;
					
		this.content[0].scrollLeft = this._wingSize;

		for (var i = 0, leni = this.items.length; i < leni; i++) {
			// items were already added in ItemList constructor, just add meta now
			this._itemList.addMeta(i, {offset:getPosition.call(this, i).left, isClone:false});
		}
		
		if (this._opts.loop) { // send in the clones
			this.stage.get('.carousel-clone').remove(); // kill any old clones
			
			// how many sets of clones (on each side) are needed to fill the off-spotlight portions of the stage?
			var repsMax =  1 + Math.ceil(this._spot.offset.left / (this._itemDimensions.width*this.items.length + this._gap.size));	

			for (var reps = 1; reps <= repsMax; reps++) {
				i = this.items.length;
				while (i--) {
 					// add clones to prev side
 					clone = this.items.item(i).copy();
 					clone.removeClass('carousel-item').addClass('carousel-clone').css({ 'z-index': 1, margin: 0 });
					
 					cloneOffset = getPosition.call(this, 0 - (reps * this.items.length - i)).left;
 					this._itemList.addItem(0 - (reps * this.items.length - i), clone, {isClone:true, offset:cloneOffset});
 					this.stage[0].appendChild(clone[0]);
					
 					// add clones to next side
 					clone = clone.copy();
 					cloneOffset = getPosition.call(this, reps*this.items.length + i).left;
 					this._itemList.addItem(reps*this.items.length + i + this._gap.count, clone, {isClone:true, offset:cloneOffset});
					this.stage[0].appendChild(clone[0]);
 				}
 			}
		}
		
		this.items.addClass('carousel-item');
		// apply positioning to all items and clones
 		this._itemList.place(this._itemDimensions.marginTop, undefined);
	}
	
	CarouselPaneProto.destroy = function() {
		this.stage.get('.carousel-clone').remove();
		glow(window).detach('resize', this._resizeHandler);
		glow(this.items).detach('childActivate', this._childActivateHandler);
		WidgetProto.destroy.call(this);
	};
//TODO	
	/**
		@name glow.ui.Carousel#event:select
		@event
		@description Fires when a carousel item is selected.
			Items are selected by clicking, or pressing enter when a child is in the spotlight.
		
			Canceling this event prevents the default click/key action.
		
		@param {glow.events.Event} event Event Object
		@param {glow.NodeList} event.item Item selected
		@param {number} event.itemIndex The index of the selected item in {@link glow.ui.Carousel#items}.
	*/
	
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