Glow.provide(function(glow) {
	var undefined, CarouselProto;
	
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
			
			@param {selector} [opts.titleBox] Treat an element as the title box for each item.
				This is a selector which points to an element within each carousel item. That
				element will moved out of the carousel and shown beneath the carousel item
				when it is in the spotlight.
			
				These move independently of the carousel, fading in & out rather than
				scrolling.
				
				By default, title boxes are not used.
			
			@param {string} [opts.className] Class name to add to the container.
			
			@param {string} [opts.id]  Id to add to the container.
				
		@example
			// This creates a carousel out of HTML like...
			// <ol id="carouselItems">
			//   <li>
			//     <a href="anotherpage.html">
			//       <img width="200" height="200" src="img.jpg" alt="" />
			//	   </a>
			//     <div class="furtherInfo">This is item 1</div>
			//   </li>
			//   ...more list items like above...
			var myCarousel = new glow.ui.Carousel('#carouselItems', {
				loop: true,
				paging: true,
				titleBox: 'div.furtherInfo'
			}).on('choose', function(e) {
				// follow the link when the item's selected
				window.location = e.item.get('a').prop('href');
				return false;
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
					spotlightSize: 6
				}).addPageNav('belowCenter').on('choose', function(e) {
					fullImage.prop( 'src', e.item.get('a').prop('href') );
					return false;
				});
	*/
	function Carousel(itemContainer, opts) {};
	glow.util.extend(Carousel, glow.ui.Widget);
	CarouselProto = Carousel.prototype;
	
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
	
	/**
		@name glow.ui.Carousel#addPageNav
		@function
		@description Add page navigation to the carousel.
			The page navigation show the user which position they are viewing
			within the carousel.
		
		@param {string|selector|HTMLElement} position The position of the paging navigation.
			This can be a CSS selector pointing to an element, or one of the following
			shortcuts:
		
			<dl>
				<dt>belowLast</dt>
				<dd>Display the nav beneath the last spotlight item</dd>
				<dt>belowNext</dt>
				<dd>Display the nav beneath the next button</dd>
				<dt>belowCenter</dt>
				<dd>Display the nav beneath the carousel, centred</dd>
				<dt>aboveLast</dt>
				<dd>Display the nav above the last spotlight item</dd>
				<dt>aboveNext</dt>
				<dd>Display the nav above the next button</dd>
				<dt>aboveCenter</dt>
				<dd>Display the nav above the carousel, centred</dd>
			</dl>
			
		@param {boolean} [showNumbers=false] Display as numbers rather than blocks.
		
		@returns this
		
		@example
			new glow.ui.Carousel('#carouselContainer').addPageNav('belowLast', true);
	*/
	CarouselProto.addPageNav = function(position, showNumbers) {};
	
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
		
		@param {boolean} [animate=true] Transition to the item.
			If false, the carousel will switch to the new index.
		
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