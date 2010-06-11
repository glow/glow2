Glow.provide(function(glow) {
	var undefined,
		CarouselProto,
		Widget = glow.ui.Widget,
		WidgetProto = Widget.prototype;
	
	/**
		@name glow.ui.Carousel
		@class
		@extends glow.ui.Widget
		@description Create a pane of elements that scroll from one to another.
			
		@param {glow.NodeList|selector|HTMLElement} itemContainer Container of the carousel items.
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
			
			@param {boolean|number} [opts.page=false] Move a whole page at a time.
				If 'true', the page size will be the spotlight size, but you
				can also set this to be an explicit number of items. Space will
				be added to the end of the carousel so pages stay in sync.
				
				If 'false' or 1, the carousel moves one item at a time.
				
			@param {boolean} [opts.loop=false] Loop the carousel from the last item to the first.
			
			@param {number} [opts.spotlight] The number of items to treat as main spotlighted items.
				A carousel may be wide enough to display 2 whole items, but setting
				this to 1 will result in the spotlight item sitting in the middle, with
				half of the previous item appearing before, and half the next item
				appearing after.
				
				By default, this is the largest number of whole items that can exist in
				the width of the container, allowing room for next & previous buttons.
				Any remaining width will be used to partially show the previous/next item
				beneath the next & previous buttons.
				
		@example
			// This creates a carousel out of HTML like...
			// <ol id="carouselItems">
			//   <li>
			//     <a href="anotherpage.html">
			//       <img width="200" height="200" src="img.jpg" alt="" />
			//	   </a>
			//   </li>
			//   ...more list items like above...
			var myCarousel = new glow.ui.Carousel('#carouselItems', {
				loop: true,
				page: true,
			});
			
		@example
			// Make a carousel of thumbnails, which show the full image when clicked.
			// Carousel items look like this...
			// <li>
			//   <a href="fullimage.jpg">
			//     <img src="thumbnail.jpg" width="100" height="100" alt="whatever" />
			//   </a>
			// </li>
			var fullImage = glow('#fullImage'),
				myCarousel = new glow.ui.Carousel('#carouselItems', {
					spotlight: 6
				}).addPageNav('belowCenter').on('select', function(e) {
					fullImage.prop( 'src', e.item.get('a').prop('href') );
					return false;
				});
	*/
	function Carousel(itemContainer, opts) {
		var spot;
		
		Widget.call(this, 'Carousel', opts);
		
		opts = this._opts;
		
		// convert the options for CarouselPane
		if (opts.page) {
			opts.step = opts.page;
			opts.page = true;
		}
		
		this.itemContainer = itemContainer = glow(itemContainer).item(0);
		
		// see if we're going to get enough room for our prev/next buttons
		spot = glow.ui.CarouselPane._getSpot(
			itemContainer.parent().width(),
			itemContainer.children().css('position', 'absolute'),
			0,
			opts
		);
		
		// enfore our minimum back/fwd button size
		if (spot.offset.left < 50) {
			opts.spotlight = spot.capacity - 1;
		}
		
		this._init();
	};
	glow.util.extend(Carousel, glow.ui.Widget);
	CarouselProto = Carousel.prototype;
	
	/**
		@name glow.ui.Carousel#_pane
		@type glow.ui.CarouselPane
		@description The carousel pane used by this Carousel
	*/
	
	/**
		@name glow.ui.Carousel#_prevBtn
		@type glow.NodeList
		@description Element acting as back button
	*/
	/**
		@name glow.ui.Carousel#_nextBtn
		@type glow.NodeList
		@description Element acting as next button
	*/
	
	/**
		@name glow.ui.Carousel#items
		@type glow.NodeList
		@description Carousel items.
	*/
	
	/**
		@name glow.ui.Carousel#itemContainer
		@type glow.NodeList
		@description Parent element of the carousel items.
	*/
	
	// life cycle methods
	CarouselProto._init = function () {
		WidgetProto._init.call(this);
		this._build();
	};
	
	CarouselProto._build = function () {
		var content,
			itemContainer = this.itemContainer,
			pane,
			items,
			spot;
		
		WidgetProto._build.call( this, itemContainer.wrap('<div></div>').parent() );
		content = this.content;
		
		pane = this._pane = new glow.ui.CarouselPane(itemContainer, this._opts);
		spot = pane._spot
		items = this.items = pane.items;
		this.itemContainer = pane.itemContainer;
		
		pane.moveTo(0, {
			tween: null
		});
		
		// add next & prev buttons, autosizing them
		this._prevBtn = glow('<div class="Carousel-prev"><div class="Carousel-btnIcon"></div></div>').prependTo(content).css({
			width: spot.offset.left,
			height: spot.height
		});
		this._nextBtn = glow('<div class="Carousel-next"><div class="Carousel-btnIcon"></div></div>').prependTo(content).css({
			width: spot.offset.right,
			height: spot.height
		});
		
		updateButtons(this);
		
		this._bind();
	};
	
	/**
		@private
		@function
		@description Update the enabled / disabled state of the buttons.
	*/
	function updateButtons(carousel) {
		// buttons are always active for a looping carousel
		if (carousel._opts.loop) {
			return;
		}
		
		var indexes = carousel.spotlightIndexes(),
			lastIndex = indexes[indexes.length - 1],
			lastItemIndex = carousel.items.length - 1;

		// add or remove the disabled class from the buttons
		carousel._prevBtn[ (indexes[0] === 0) ? 'addClass' : 'removeClass' ]('Carousel-prev-disabled');
		carousel._nextBtn[ (lastIndex === lastItemIndex) ? 'addClass' : 'removeClass' ]('Carousel-next-disabled');
	}
	
	/**
		@private
		@function
		@description Listener for CarouselPane's 'select' event.
			'this' is the Carousel
	*/
	function paneSelect(event) {
		this.fire('select', event);
	}
	
	/**
		@private
		@function
		@description Listener for CarouselPane's 'move' event.
			'this' is the Carousel
	*/
	function paneMove(event) {
		var pane = this._pane;
		
		if ( !this.fire('move', event).defaultPrevented() ) {
			this._updateNav( (pane._index + event.moveBy) % this.items.length / pane._step );
		}
	}
	
	/**
		@private
		@function
		@description Listener for CarouselPane's 'afterMove' event.
			'this' is the Carousel
	*/
	function paneAfterMove(event) {
		if ( !this.fire('afterMove', event).defaultPrevented() ) {
			updateButtons(this);
		}
	}
	
	/**
		@private
		@function
		@description Listener for back button's 'mousedown' event.
			'this' is the Carousel
	*/
	function prevMouseDown(event) {
		if (event.button === 0) {
			this._pane.moveStart(true);
			return false;
		}
	}
	
	/**
		@private
		@function
		@description Listener for fwd button's 'mousedown' event.
			'this' is the Carousel
	*/
	function nextMouseDown(event) {
		if (event.button === 0) {
			this._pane.moveStart();
			return false;
		}
	}
	
	/**
		@private
		@function
		@description Stop the pane moving.
			This is used as a listener for various mouse events on the
			back & forward buttons.
			
			`this` is the Carousel.
	*/
	function paneMoveStop() {
		this._pane.moveStop();
	}
	
	CarouselProto._bind = function () {
		var pane = this._pane,
			carousel = this;
		
		this._tie(pane);
		
		pane.on('select', paneSelect, this)
			.on('afterMove', paneAfterMove, this)
			.on('move', paneMove, this);
		
		this._prevBtn.on('mousedown', prevMouseDown, this)
			.on('mouseup', paneMoveStop, this)
			.on('mouseleave', paneMoveStop, this);
		
		this._nextBtn.on('mousedown', nextMouseDown, this)
			.on('mouseup', paneMoveStop, this)
			.on('mouseleave', paneMoveStop, this);
		
		WidgetProto._bind.call(this);
	};
	
	/**
		@name glow.ui.Carousel#spotlightItems
		@function
		@description Get the currently spotlighted items.
		
		@returns {glow.NodeList}
	*/
	CarouselProto.spotlightItems = function() {
		return this._pane.spotlightItems();
	};
	
	/**
		@name glow.ui.Carousel#spotlightIndexes
		@function
		@description Gets an array of spotlighted indexes.
			These are the indexes of the nodes within {@link glow.ui.Carousel#items}.
		
		@returns {number[]}
	*/
	CarouselProto.spotlightIndexes = function() {
		return this._pane.spotlightIndexes();
	};
	
	/**
		@name glow.ui.Carousel#moveTo
		@function
		@description Move the items so a given index is in the spotlight.
		
		@param {number} itemIndex Item index to move to.
		
		@param {boolean} [animate=true] Transition to the item.
			If false, the carousel will switch to the new index.
		
		@returns this
	*/
	CarouselProto.moveTo = function(itemIndex, animate) {
		this._pane.moveTo(itemIndex, animate);
		return this;
	};
	
	/**
		@private
		@function
		@decription Creates the prev & next functions
		@param {number} direction Either 1 or -1
	*/
	function prevNext(direction) {
		return function() {
			this._pane.moveBy(this._pane._step * direction);
			return this;
		}
	}
	
	/**
		@name glow.ui.Carousel#next
		@function
		@description Move to the next page/item
		
		@returns this
	*/
	CarouselProto.next = prevNext(1);
	
	/**
		@name glow.ui.Carousel#prev
		@function
		@description Move to the previous page/item
		
		@returns this
	*/
	CarouselProto.prev = prevNext(-1);
	
	/**
		@name glow.ui.Carousel#destroy
		@function
		@description Remove listeners and styles from this instance.
			Carousel items will not be destroyed.
			
		@returns undefined
	*/
	CarouselProto.destroy = function() {
		// Move the pane outside our widget
		this._pane.container.insertBefore(this.container);
		WidgetProto.destroy.call(this);
	};
	
	/*
		@name glow.ui.Carousel#updateUi
		@function
		@description Refresh the carousel after moving/adding/removing items.
			You can edit the items within the carousel using NodeLists such
			as {@link glow.ui.Carousel#itemContainer}.
			
		@example
			// Add a new carousel item
			myCarousel.itemContainer.append('<li>New Item</li>');
			// Move the new item into position & update page nav etc...
			myCarousel.updateUi();
			
		@returns this
	*/
	// TODO: populate #items here & check back & fwd button sizes
	
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
		@name glow.ui.Carousel#event:move
		@event
		@description Fires when the carousel is about to move.
			Canceling this event prevents the carousel from moving.
			
			This will fire for repeated move actions. Ie, this will fire many times
			while the mouse button is held on one of the arrows.
		
		@param {glow.events.Event} event Event Object
		@param {number} event.moveBy The number of items we're moving by.
			This will be positive for forward movements and negative for backward
			movements.
		
			You can get the current index via `myCarousel.spotlightIndexes()[0]`.
	*/
	
	/**
		@name glow.ui.Carousel#event:afterMove
		@event
		@description Fires when the carousel has finished moving.
			Canceling this event prevents the carousel from moving.
			
			This will not fire for repeated move actions. Ie, after #start is
			called this will not fire until the carousel reached an end point
			or when it comes to rest after #stop is called.
			
		@param {glow.events.Event} event Event Object
			
		@example
			// double the amount a carousel will move by
			myCarousel.on('afterMove', function(e) {
				// show content related to this.spotlightIitems()[0]
			});
	*/
	
	// EXPORT
	glow.ui.Carousel = Carousel;
});