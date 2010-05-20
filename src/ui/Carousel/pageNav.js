Glow.provide(function(glow) {
	var undefined,
		CarouselProto = glow.ui.Carousel.prototype;

	/**
		@name glow.ui.Carousel#_pageNav
		@type glow.NodeList
		@description Element containing pageNav blocks
	*/
	/**
		@name glow.ui.Carousel#_pageNavOpts
		@type Object
		@description Options for the page nav.
			Same as the opts arg for #addPageNav
	*/
	
	/**
		@name glow.ui.Carousel#addPageNav
		@function
		@description Add page navigation to the carousel.
			The page navigation show the user which position they are viewing
			within the carousel.
		
		@param {Object} [opts] Options object.
		@param {string|selector|HTMLElement} [opts.position='belowLast'] The position of the page navigation.
			This can be a CSS selector pointing to an element, or one of the following
			shortcuts:
		
			<dl>
				<dt>belowLast</dt>
				<dd>Display the nav beneath the last spotlight item</dd>
				<dt>belowNext</dt>
				<dd>Display the nav beneath the next button</dd>
				<dt>belowMiddle</dt>
				<dd>Display the nav beneath the carousel, centred</dd>
				<dt>aboveLast</dt>
				<dd>Display the nav above the last spotlight item</dd>
				<dt>aboveNext</dt>
				<dd>Display the nav above the next button</dd>
				<dt>aboveMiddle</dt>
				<dd>Display the nav above the carousel, centred</dd>
			</dl>
			
		@param {boolean} [opts.useNumbers=false] Display as numbers rather than blocks.
		
		@returns this
		
		@example
			new glow.ui.Carousel('#carouselContainer').addPageNav({
				position: 'belowMiddle',
				useNumbers: true
			});
	*/
	CarouselProto.addPageNav = function(opts) {
		opts = glow.util.apply({
			position: 'belowLast'
		}, opts);
		
		var className = 'Carousel-pageNav';
		
		if (opts.useNumbers) {
			className += 'Numbers';
		}
		
		this._pageNav = glow('<div class="' + className + '"></div>')
			.delegate('click', 'div', pageNavClick, this);
		
		this._pageNavOpts = opts;
		
		initPageNav(this);
		
		return this;
	};
	
	/**
		@private
		@function
		@description Listener for one of the page buttons being clicked.
			'this' is the carousel
	*/
	function pageNavClick(event) {
		var targetPage = ( glow(event.attachedTo).text() - 1 ) * this._pane._step;
		this.moveTo(targetPage);
	}
	
	/**
		@private
		@function
		@description Calculate the number of pages this carousel has
	*/
	function getNumberOfPages(carousel) {
		var pane = carousel._pane,
			itemsLength = carousel.items.length,
			step = pane._step;
		
		if (carousel._opts.loop) {
			r = Math.ceil( itemsLength / step );
		}
		else {
			r = 1 + Math.ceil( (itemsLength - pane._spot.capacity) / step );
		}
		
		// this can be less than one if there's less than 1 page worth or items
		return Math.max(r, 0);
	}
	
	/**
		@private
		@function
		@description Position & populate the page nav.
			Its position may need refreshed after updating the carousel ui.
	*/
	function initPageNav(carousel) {
		var pageNav = carousel._pageNav,
			position = carousel._pageNavOpts.position,
			positionY = position.slice(0,5),
			positionX = position.slice(5),
			pane = carousel._pane,
			numberOfPages = getNumberOfPages(carousel),
			htmlStr = '',
			itemTitles = carousel._itemTitles;
		
		// either append or prepend the page nav, depending on option
		carousel.container[ (positionY === 'below') ? 'append' : 'prepend' ](pageNav);
		
		// position in the center for Middle positions, otherwise right
		pageNav.css('text-align', (positionX == 'Middle') ? 'center' : 'right');
		
		// cater for 'belowNext' when we have title boxes
		if (position === 'belowNext' && itemTitles) {
			// move up by the height of the title boxes (negative margin-top)
			pageNav.width( carousel._nextBtn.width() ).css( 'margin-top', parseInt( pageNav.css('margin-top') ) - itemTitles.height() );
		}
		// move it under the last item for *Last positions
		else if (positionX === 'Last') {
			pageNav.css( 'margin-right', carousel._nextBtn.width() )
		}
		
		// build the html string
		do {
			htmlStr = '<div>' + numberOfPages + '</div>' + htmlStr;
		} while (--numberOfPages);
		
		pageNav.html(htmlStr);
		carousel._updateNav( pane._index / pane._step );
	}
	
	/**
		@name glow.ui.Carousel#_updateNav
		@function
		@description Activate a particular item on the pageNav
		
		@param {number} indexToActivate
	*/
	CarouselProto._updateNav = function(indexToActivate) {
		if (this._pageNav) {
			var activeClassName = 'active';
			
			this._pageNav.children()
				.removeClass(activeClassName)
				.item(indexToActivate).addClass(activeClassName);	
		}
	}
});