Glow.provide(function(glow) {
	var undefined, CarouselWindowProto;
	
	/**
		@name glow.ui.CarouselWindow
		@class
		@extends glow.ui.Behaviour (or Widget, depends on implementation)
		@description Create a 'window' of elements that scroll from one to another.
			This is a component of (TODO: names of widgets that use this).
			
		@param {glow.NodeList|selector|HTMLElement} container Container of the carousel items.
			The direct children of this item will be treated as carousel items. They will
			be positioned next to eachother horizontally.
			
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
			@param {number} [opts.paddingItems=0] Number of empty spaces to add onto the end of the carousel.
				An empty space is the width of the other carousel items.
			
				Spaces don't exist as physical HTML elements, but simply a gap from the last item
				to the end.
				
				These are used in combination with opts.step and opts.loop to ensure 'pages'
				don't get out of sync.
			
			@param {number} [opts.activeItems] The number of interactive items in the carousel.
				TODO: Not happy with the name of this, any better ideas?
				
				A carousel way be wide enough to display 2 whole items, but setting
				this to 1 will result in the active item sitting in the middle, with
				half of the previous item appearing before, and half the next item
				appearing after.
				
				By default, this is the largest number of whole items that can exist in
				the width of the container. Any remaining width will be used to partially
				show the previous/next item.
				
			@param {boolean} [opts.slide=false] Slide the carousel continuiously?
				TODO: Waiting for exact behaviour of this from designers
				
				This will only apply to scrolling via #start & will be like the
				swooshing behaviour we have in Glow 1.
				
		@example
			new glow.ui.CarouselWindow('#carouselItems', {
				duration: 0.4,
				step: 2,
				loop: true
			});
	*/
	function CarouselWindow(container, opts) {};
	glow.util.extend(CarouselWindow, glow.ui.Behaviour);
	CarouselWindowProto = CarouselWindow.prototype;
	
	/**
		@name glow.ui.CarouselWindow#_offsetLeft
		@type number
		@description The number of pixels from the left of the container to the first active item.
			This will be used by the main Carousel class to determine the width of the
			previous button.
	*/
	
	/**
		@name glow.ui.CarouselWindow#_offsetRight
		@type number
		@description The number of pixels from the right of the container to the last active item.
			This will be used by the main Carousel class to determine the width of the
			next button.
			
			This will be different from #_offsetLeft when the width of the
			container - the total of the active items is an odd number.
	*/
	
	/**
		@name glow.ui.CarouselWindow#container
		@type glow.NodeList
		@description CarouselWindow container element
	*/
	
	/**
		@name glow.ui.CarouselWindow#items
		@type glow.NodeList
		@description Carousel items.
			This is the same as `myCarouselWindow.container.children()`
	*/
	
	/**
		@name glow.ui.CarouselWindow#getVisibleItems
		@function
		@description Get the active items curerntly in view.
		
		@returns {glow.NodeList}
	*/
	CarouselWindowProto.getVisibleItems = function() {};
	
	/**
		@name glow.ui.CarouselWindow#getVisibleIndexes
		@function
		@description Gets an array of visible indexes.
			These are the indexes of the nodes within {@link glow.ui.CarouselWindow#items}.
		
		@returns {number[]}
	*/
	CarouselWindowProto.getVisibleIndexes = function() {};
	
	/**
		@name glow.ui.CarouselWindow#moveTo
		@function
		@description Move the items so a given index is the leftmost active item.
			This method respects the carousel's limits and its step. If it's
			not possible to move the item so it's the leftmost item, it will
			be placed as close to the left as possible.
		
		@param {number} itemIndex Item index to move to.
		
		@returns this
	*/
	CarouselWindowProto.moveTo = function() {};
	
	/**
		@name glow.ui.CarouselWindow#moveBy
		@function
		@description Move by a number of items.
		
		@param {number} amount Amount and direction to move.
			Negative numbers will move backwards, positive number will move
			forwards.
			
			This method respects the carousel's limits and its step. If it's
			not possible to move the item so it's the leftmost item, it will
			be placed as close to the left as possible.
		
		@returns this
	*/
	CarouselWindowProto.moveBy = function() {};
	
	/**
		@name glow.ui.CarouselWindow#moveStart
		@function
		@description Start moving the carousel in a particular direction.
			If opts.slide is false this has the effect of calling
			moveBy(opts.step) or moveBy(-opts.step) continually.
			
			TODO: get clarification of opts.slide.
		
		@param {boolean} [backwards=false] Move backwards?
		
		@returns this
		
		@example
			nextBtn.on('mousedown', function() {
				myCarouselWindow.moveStart();
			}).on('mouseup', function() {
				myCarouselWindow.moveStop();
			});
	*/
	CarouselWindowProto.moveStart = function() {};
	
	/**
		@name glow.ui.CarouselWindow#moveStop
		@function
		@description Stop moving the carousel.
			The current animation will end, leaving the carousel
			in step.
			
		@returns this
	*/
	CarouselWindowProto.moveStop = function() {};
	
	/**
		@name glow.ui.CarouselWindow#destroy
		@function
		@description Remove listeners and styles from this instance.
			HTML elements will not be destroyed.
			
		@returns undefined
	*/
	CarouselWindowProto.moveStop = function() {};
	
	/**
		TODO: this behaviour is in Focusable, CarouselWindow just needs to pass the event through
		@name glow.ui.CarouselWindow#event:choose
		@event
		@description Fires when a carousel item is chosen.
			Items are chosen by clicking, or pressing enter when a child is active.
		
			Canceling this event prevents the default click/key action.
		
		@param {glow.events.Event} event Event Object
		@param {glow.NodeList} event.item Item chosen
		@param {number} event.itemIndex The index of the chosen item in {@link glow.ui.CarouselWindow#items}.
	*/
	
	/**
		@name glow.ui.CarouselWindow#event:move
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
			myCarouselWindow.on('move', function(e) {
				e.moveBy *= 2;
			});
	*/
	
	/**
		@name glow.ui.CarouselWindow#event:afterMove
		@event
		@description Fires when the carousel has finished moving.
			Canceling this event prevents the carousel from moving.
			
			This will not fire for repeated move actions. Ie, after #start is
			called this will not fire until the carousel reached an end point
			or when it comes to rest after #stop is called.
			
		@param {glow.events.Event} event Event Object
			
		@example
			// double the amount a carousel will move by
			myCarouselWindow.on('afterMove', function(e) {
				// show content related to this.getVisibleIitems()[0]
			});
	*/
	
	// EXPORT
	glow.ui.CarouselWindow = CarouselWindow;
});