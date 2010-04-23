Glow.provide(function(glow) {
	var undefined, CarouselProto;
	
	/**
		@name glow.ui.Carousel
		@class
		@extends glow.ui.Widget (happy for this to change depending on what's best for the implementation)
		@description Create a payne of elements that scroll from one to another.
			This is a component of (TODO: names of widgets that use this).
			
		@param {glow.NodeList|selector|HTMLElement} container Container of the carousel items.
			The direct children of this item will be treated as carousel items. They will
			be positioned next to eacho ther horizontally.
			
			Each item takes up the same horizontal space, equal to the width of the largest
			item (including padding and border) + the largest of its horizontal margins (as set in CSS).
			
			The height of the container will be equal to the height of the largest item (including
			padding and border) + the total of its vertical margins.
			
		@param {object} [opts] Options
			@param {number} [opts.duration=0.2] Duration of scrolling animations in seconds.
			@param {string|function} [opts.tween='easeBoth'] Tween to use for animations.
				This can be a property name of {@link glow.tweens} or a tweening function.
			
			@param {boolean|number} [opts.paging=false] Move a whole page at a time.
				If 'true', the page size will be the spotlight size, but you
				can also set this to be an explicit number of items. Space will
				be added to the end of the carousel so pages stay in sync.
				
				If 'false' or 1, the carousel moves one item at a time.
			@param {boolean} [opts.loop=false] Loop the carousel from the last item to the first.
			
			@param {number} [opts.spotlightSize] The number of items to treat as main spotlighted items.
				A carousel may be wide enough to display 2 whole items, but setting
				this to 1 will result in the spotlight item sitting in the middle, with
				half of the previous item appearing before, and half the next item
				appearing after.
				
				By default, this is the largest number of whole items that can exist in
				the width of the container, allowing room for next & previous buttons.
				Any remaining width will be used to partially show the previous/next item
				beneath the next & previous buttons.
				
			@param {string} [opts.pageNav] The position of the paging navigation.
				By default, no page navigation is displayed.
			
				TODO: waiting for clarification from style guide
				
			@param {string} [opts.className] Class name to add to the container.
			@param {string} [opts.id]  Id to add to the container.
				
		@example
			var myCarousel = new glow.ui.Carousel('#carouselItems', {
				loop: true,
				paging: true
			});
	*/
	function Carousel(container, opts) {};
	glow.util.extend(Carousel, glow.ui.Widget);
	CarouselProto = Carousel.prototype;
	
	/**
		@name glow.ui.Carousel#items
		@type glow.NodeList
		@description Carousel items.
	*/
	
	/**
		@name glow.ui.Carousel#spotlightItems
		@function
		@description Get the currently spotlighted items.
		
		@returns {glow.NodeList}
	*/
	CarouselProto.spotlightItems = function() {};
	
	/**
		@name glow.ui.Carousel#spotlightIndexes
		@function
		@description Gets an array of spotlighted indexes.
			These are the indexes of the nodes within {@link glow.ui.Carousel#items}.
		
		@returns {number[]}
	*/
	CarouselProto.spotlightIndexes = function() {};
	
	/**
		@name glow.ui.Carousel#moveTo
		@function
		@description Move the items so a given index is in the spotlight.
		
		@param {number} itemIndex Item index to move to.
		
		@returns this
	*/
	CarouselProto.moveTo = function() {};
	
	/**
		@name glow.ui.Carousel#next
		@function
		@description Move to the next page/item
		
		@returns this
	*/
	CarouselProto.next = function() {};
	
	/**
		@name glow.ui.Carousel#prev
		@function
		@description Move to the previous page/item
		
		@returns this
	*/
	CarouselProto.prev = function() {};
	
	/**
		@name glow.ui.Carousel#destroy
		@function
		@description Remove listeners and styles from this instance.
			Carousel items will not be destroyed.
			
		@returns undefined
	*/
	CarouselProto.destroy = function() {};
	
	/**
		@name glow.ui.Carousel#event:choose
		@event
		@description Fires when a carousel item is chosen.
			Items are chosen by clicking, or pressing enter when a child is in the spotlight.
		
			Canceling this event prevents the default click/key action.
		
		@param {glow.events.Event} event Event Object
		@param {glow.NodeList} event.item Item chosen
		@param {number} event.itemIndex The index of the chosen item in {@link glow.ui.Carousel#items}.
	*/
	
	/**
		@name glow.ui.Carousel#event:move
		@event
		@description Fires when the carousel is about to move.
			Canceling this event prevents the carousel from moving.
			
			This will fire for repeated move actions. Ie, this will fire many times
			after #start is called.
		
		@param {glow.events.Event} event Event Object
		@param {number} event.currentIndex Index of the current leftmost item.
		@param {number} event.moveBy The number of items the Carousel will move by.
			This is undefined for 'sliding' moves where the destination isn't known.
			
			This value can be overwritten, resulting in the carousel moving a different amount.
			The carousel step will still be respected.
			
		@example
			// double the amount a carousel will move by
			myCarousel.on('move', function(e) {
				e.moveBy *= 2;
			});
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