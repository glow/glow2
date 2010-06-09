Glow.provide(function(glow) {
	var NodeList = glow.NodeList,
		NodeListProto = NodeList.prototype,
		win = window,
		document = win.document,	
		getComputedStyle = document.defaultView && document.defaultView.getComputedStyle,
		// regex for toStyleProp
		dashAlphaRe = /-(\w)/g,
		// regex for getCssValue
		isNumberButNotPx = /^-?[\d\.]+(?!px)[%a-z]+$/i,
		ieOpacityRe = /alpha\(opacity=([^\)]+)\)/,
		// regex for #css
		hasUnits = /width|height|top$|bottom$|left$|right$|spacing$|indent$|font-size/;
	
	// replace function for toStyleProp
	function toStylePropReplace(match, p1) {
		return p1.toUpperCase();
	}
	
	/**
		@private
		@function
		@description Converts a css property name into its javascript name.
			Such as "background-color" to "backgroundColor".
		@param {string} prop CSS Property name.
		@returns {string}
	*/
	function toStyleProp(prop) {
		if (prop == 'float') {
			return glow.env.ie ? 'styleFloat' : 'cssFloat';
		}
		return prop.replace(dashAlphaRe, toStylePropReplace);
	}
	
	/**
		@private
		@function
		@description Get a total value of multiple CSS properties
		@param {HTMLElement} elm
		@param {string[]} props CSS properties to get the total value of
		@returns {number}
	*/
	function getTotalCssValue(elm, props) {
		var total = 0,
			i = props.length;
			
		while (i--) {
			total += parseFloatFunc(
				getCssValue( elm, props[i] )
			) || 0;
		}
		
		return total;
	}
	
	/**
		@private
		@function
		@description Get a computed css property
		@param {HTMLElement} elm
		@param {string} prop CSS property to get the value of
		@returns {string}
	*/
	function getCssValue(elm, prop) {
		var defaultView = elm.ownerDocument.defaultView,
			computedStyle,
			r,
			currentStyle,
			oldDisplay,
			match;
		
		if (getComputedStyle) { // the W3 way
			computedStyle = defaultView.getComputedStyle(elm, null);
			
			// http://bugs.webkit.org/show_bug.cgi?id=13343
			// Webkit fails to get margin-right for rendered elements.
			// margin-right is measured from the right of the element to the right of the parent
			if (glow.env.webkit && prop === 'margin-right') {
				oldDisplay = elm.style.display;
				elm.style.display = 'none';
				r = computedStyle[prop];
				elm.style.display = oldDisplay;
			}
			else {
				r = computedStyle.getPropertyValue(prop);
			}
		}
		else if (currentStyle = elm.currentStyle) { // the IE<9 way
			if (prop === 'opacity') { // opacity, the IE way
				match = ieOpacityRe.exec(currentStyle.filter);
				return match ? String(parseInt(match[1], 10) / 100) || '1' : '1';
			}
			// catch border-*-width. IE gets this wrong if the border style is none
			else if (
				prop.indexOf('border') === 0 &&
				prop.slice(-5) === 'width' &&
				getCssValue(elm, 'border-style') === 'none') {
				
				return '0px';
			}
			
			r = currentStyle[ toStyleProp(prop) ];
			
			// font-size gives us incorrect values when put through getPixelValue, avoid
			if (isNumberButNotPx.test(r) && prop != 'font-size') {
				r = getPixelValue( elm, r, prop.indexOf('height') >= 0 || prop.indexOf('top') >= 0 ) + 'px';
			}
		}
		
		// post-process return value
		if (prop === 'opacity') {
			r = r || '1';
		}
		else if (prop.indexOf('color') != -1) { //deal with colour values
			r = NodeList._parseColor(r).toString();
		}
		
		return r;
	}
	
	// vars used in _parseColor
	var mathRound = Math.round,
		parseIntFunc = parseInt,
		parseFloatFunc = parseFloat,
		htmlColorNames = {
			black:   0x000000,
			silver:  0xc0c0c0,
			gray:    0x808080,
			white:   0xffffff,
			maroon:  0x800000,
			red:     0xff0000,
			purple:  0x800080,
			fuchsia: 0xff00ff,
			green:   0x008000,
			lime:    0x00ff00,
			olive:   0x808000,
			yellow:  0xffff00,
			navy:    0x000080,
			blue:    0x0000ff,
			teal:    0x008080,
			aqua:    0x00ffff,
			orange:  0xffa500
		},
		// match a string like rgba(10%, 10%, 10%, 0.5) where the % and alpha parts are optional
		colorRegex = /^rgba?\(([\d\.]+)(%?),\s*([\d\.]+)(%?),\s*([\d\.]+)(%?)(?:,\s*([\d\.]+))?/i,
		transColorRegex = /^(transparent|rgba\(0, ?0, ?0, ?0\))$/,
		wordCharRegex = /\w/g;
	
	/**
		@name glow.NodeList._parseColor
		@private
		@function
		@description Convert a CSS colour string into a normalised format
		@returns {string} String in format rgb(0, 0, 0)
			Returned string also has r, g & b number properties
	*/
	NodeList._parseColor = function (val) {
		if ( transColorRegex.test(val) ) {
			return 'rgba(0, 0, 0, 0)';
		}
		
		var match, //tmp regex match holder
			r, g, b, a, //final colour vals
			hex; //tmp hex holder

		if ( match = colorRegex.exec(val) ) { //rgb() format, cater for percentages
			r = match[2] ? mathRound( parseFloatFunc(match[1]) * 2.55 ) : parseIntFunc(match[1]);
			g = match[4] ? mathRound( parseFloatFunc(match[3]) * 2.55 ) : parseIntFunc(match[3]);
			b = match[6] ? mathRound( parseFloatFunc(match[5]) * 2.55 ) : parseIntFunc(match[5]);
			a = parseFloatFunc( match[7] || '1' );
		} else {
			if (typeof val == 'number') {
				hex = val;
			}
			else if (val.charAt(0) == '#') {
				if (val.length === 4) { //deal with #fff shortcut
					val = val.replace(wordCharRegex, '$&$&');
				}
				hex = parseIntFunc(val.slice(1), 16);
			}
			else {
				hex = htmlColorNames[val];
			}

			r = (hex) >> 16;
			g = (hex & 0x00ff00) >> 8;
			b = (hex & 0x0000ff);
			a = 1;
		}

		val = new String('rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')');
		val.r = r;
		val.g = g;
		val.b = b;
		val.a = a;
		return val;
	}
	
	// vars for generateWidthAndHeight
	var horizontalBorderPadding = [
			'border-left-width',
			'border-right-width',
			'padding-left',
			'padding-right'
		],
		verticalBorderPadding = [
			'border-top-width',
			'border-bottom-width',
			'padding-top',
			'padding-bottom'
		];
	
	/**
		@private
		@function
		@description Get width or height of an element width/height.
		@param {HTMLElement} elm Element to measure.
		@param {string} 'Width' or 'Height'.
	*/
	function getDimension(elm, cssProp) {
		// exit if there's no element, or it isn't an Element, window or document
		if ( !elm || elm.nodeType === 3 || elm.nodeType === 8 ) {
			return 0;
		}
		
		var r,
			document = elm.ownerDocument || elm.document || elm,
			docElm = document.documentElement,
			docBody = document.body,
			docElmOrBody = glow.env.standardsMode ? docElm : docBody,
			isWidth = (cssProp == 'Width'),
			cssBorderPadding;

		if (elm.window) { // is window
			r = glow.env.webkit ? (isWidth ? docBody.clientWidth : elm.innerHeight) :
				/* else */        docElmOrBody['client' + cssProp];
		}
		else if (elm.getElementById) { // is document
			// we previously checked offsetWidth & clientWidth here
			// but they returned values too large in IE6
			r = Math.max(
				docBody['scroll' + cssProp],
				docElm['scroll' + cssProp]
			)
		}
		else {
			// get an array of css borders & padding
			cssBorderPadding = isWidth ? horizontalBorderPadding : verticalBorderPadding;
			r = elm['offset' + cssProp] - getTotalCssValue(elm, cssBorderPadding);
		}
		return r;
	}
	
	/**
		@private
		@function
		@description Converts a relative value into an absolute pixel value.
			Only works in IE with Dimension value (not stuff like relative font-size).
			Based on some Dean Edwards' code
		
		@param {HTMLElement} element Used to calculate relative values
		@param {string} value Relative value
		@param {boolean} useYAxis Calulate relative values to the y axis rather than x
		@returns number
	*/
	function getPixelValue(element, value, useYAxis) {
		// Remember the original values
		var axisPos = useYAxis ? 'top' : 'left',
			axisPosUpper = useYAxis ? 'Top' : 'Left',
			elmStyle = element.style,
			positionVal = elmStyle[axisPos],
			runtimePositionVal = element.runtimeStyle[axisPos],
			r;
			
		// copy to the runtime type to prevent changes to the display
		element.runtimeStyle[axisPos] = element.currentStyle[axisPos];
			// set value to left / top
		elmStyle[axisPos] = value;
		// get the pixel value
		r = elmStyle['pixel' + axisPosUpper];
			
		// revert values
		elmStyle[axisPos] = positionVal;
		element.runtimeStyle[axisPos] = runtimePositionVal;
			
		return r;
	}
	
	/**
	@name glow.NodeList#css
	@function
	@description Get / set a CSS property value
		
	@param {string | Object} property The CSS property name, or object of property-value pairs to set
		
	@param {string | number} [value] The value to apply
		Number values will be treated as 'px' unless the CSS property
		accepts a unitless value.
		
		If value is omitted, the value for the given property will be returned
			
	@returns {glow.NodeList | string} Returns the NodeList when setting value, or the CSS value when getting values.
		CSS values are strings. For instance, "height" will return
		"25px" for an element 25 pixels high. You can use
		parseInt to convert these values.
		
	@example
		// get value from first node
		glow('#subNav').css('display');
		
	@example
		// set left padding to 10px on all nodes
		glow('#subNav li').css('padding-left', '2em');
		
	@example
		// where appropriate, px is assumed when no unit is passed
		glow('#mainPromo').css('margin-top', 300);
		
	@example
		// set multiple CSS values at once
		// NOTE: Property names containing a hyphen such as font-weight must be quoted
		glow('#myDiv').css({
			'font-weight': 'bold',
			'padding'	 : '10px',
			'color'		 : '#00cc99'
		});
	*/
	NodeListProto.css = function(prop, val) {
		var thisStyle,
			i = this.length,
			styleProp,
			style,
			firstItem = this[0];

		if (prop.constructor === Object) { // set multiple values
			for (style in prop) {
				this.css( style, prop[style] );
			}
			return this;
		}
		else if (val !== undefined) { //set one CSS value
			styleProp = toStyleProp(prop);
			while (i--) {
				if (this[i].nodeType === 1) {
					thisStyle = this[i].style;
						
					if ( !isNaN(val) && hasUnits.test(prop) ) {
						val += 'px';
					}
					
					if (prop === 'opacity' && glow.env.ie) {
						val = parseFloatFunc(val);
						//in IE the element needs hasLayout for opacity to work
						thisStyle.zoom = '1';
						thisStyle.filter = (val !== 1) ?
							'alpha(opacity=' + mathRound(val * 100) + ')' :
							'';
					}
					else {
						thisStyle[styleProp] = val;
					}
				}
			}
			return this;
		}
		else { //getting stuff
			if (prop === 'width' || prop === 'height') {
				return this[prop]() + 'px';
			}
			return (firstItem && firstItem.nodeType === 1) ? getCssValue(firstItem, prop) : '';
		}	
	};
	
	/**
	@name glow.NodeList#height
	@function
	@description Gets / set element height
		Return value does not include the padding or border of the element in
		browsers supporting the correct box model.
			
		You can use this to easily get the height of the document or
		window, see example below.
		
	@param {Number} [height] New height in pixels for each element in the list
		If ommited, the height of the first element is returned
		
	@returns {glow.NodeList | number}
		Height of first element, or original NodeList when setting heights.
		
	@example
		// get the height of #myDiv
		glow("#myDiv").height();
		
	@example
		// set the height of list items in #myList to 200 pixels
		glow("#myList > li").height(200);
		
	@example
		// get the height of the document
		glow(document).height();
		
	@example
		// get the height of the window
		glow(win).height();
	*/
	NodeListProto.height = function(height) {
		if (height === undefined) {
			return getDimension(this[0], 'Height');
		}
		return this.css('height', height);	
	};
	
	/**
	@name glow.NodeList#width
	@function
	@description Gets / set element width
		Return value does not include the padding or border of the element in
		browsers supporting the correct box model.
			
		You can use this to easily get the width of the document or
		window, see example below.
		
	@param {Number} [width] New width in pixels for each element in the list
		If ommited, the width of the first element is returned
		
	@returns {glow.NodeList | number}
		width of first element, or original NodeList when setting widths.
		
	@example
		// get the width of #myDiv
		glow("#myDiv").width();
		
	@example
		// set the width of list items in #myList to 200 pixels
		glow("#myList > li").width(200);
		
	@example
		// get the width of the document
		glow(document).width();
		
	@example
		// get the width of the window
		glow(window).width();
	*/
	NodeListProto.width = function(width) {
		if (width === undefined) {
			return getDimension(this[0], 'Width');
		}
		return this.css('width', width);
	};
	
	/**
	@name glow.NodeList#scrollLeft
	@function
	@description Gets/sets the number of pixels the element has scrolled horizontally
		To get/set the scroll position of the window, use this method on
		a nodelist containing the window object.
			
	@param {Number} [val] New left scroll position
		Omit this to get the current scroll position
			
	@returns {glow.NodeList | number}
		Current scrollLeft value, or NodeList when setting scroll position.
			
	@example
		// get the scroll left value of #myDiv
		var scrollPos = glow('#myDiv').scrollLeft();
		// scrollPos is a number, eg: 45

	@example
		// set the scroll left value of #myDiv to 20
		glow('#myDiv').scrollLeft(20);

	@example
		// get the scrollLeft of the window
		glow(window).scrollLeft();
		// scrollPos is a number, eg: 45
	*/
	NodeListProto.scrollLeft = function(val) {
		return scrollOffset(this, true, val);	
	};
	
	/**
	@name glow.NodeList#scrollTop
	@function
	@description Gets/sets the number of pixels the element has scrolled vertically
		To get/set the scroll position of the window, use this method on
		a nodelist containing the window object.
		
	@param {Number} [val] New top scroll position
		Omit this to get the current scroll position
			
	@returns {glow.NodeList | number}
		Current scrollTop value, or NodeList when setting scroll position.

	@example
		// get the scroll top value of #myDiv
		var scrollPos = glow("#myDiv").scrollTop();
		// scrollPos is a number, eg: 45

	@example
		// set the scroll top value of #myDiv to 20
		glow("#myDiv").scrollTop(20);

	@example
		// get the scrollTop of the window
		glow(window).scrollTop();
		// scrollPos is a number, eg: 45
	*/
	NodeListProto.scrollTop = function(val) {
		return scrollOffset(this, false, val);	
	};
	/**
	@name glow.dom-getScrollOffset
	@private
	@description Get the scrollTop / scrollLeft of a particular element
	@param {Element} elm Element (or window object) to get the scroll position of
	@param {Boolean} isLeft True if we're dealing with left scrolling, otherwise top
	*/
	function getScrollOffset(elm, isLeft) {
		var r,			
			scrollProp = 'scroll' + (isLeft ? 'Left' : 'Top');
			
		// are we dealing with the window object or the document object?
		if (elm.window) {
			// get the scroll of the documentElement or the pageX/Yoffset
			// - some browsers use one but not the other
			r = elm.document.documentElement[scrollProp]
				|| (isLeft ? elm.pageXOffset : elm.pageYOffset)
				|| 0;
		} else {
			r = elm[scrollProp];
		}
		return r;
	}
		
	/**
	@name glow.dom-setScrollOffset
	@private
	@description Set the scrollTop / scrollLeft of a particular element
	@param {Element} elm Element (or window object) to get the scroll position of
	@param {Boolean} isLeft True if we're dealing with left scrolling, otherwise top
	@param {Number} newVal New scroll value
	*/
	function setScrollOffset(elm, isLeft, newVal) {
	// are we dealing with the window object or the document object?
		if (elm.window) {
			// we need to get whichever value we're not setting
			elm.scrollTo(
				isLeft  ? newVal : getScrollOffset(elm, true),
				!isLeft ? newVal : getScrollOffset(elm, false)
			);
		} else {
			elm['scroll' + (isLeft ? 'Left' : 'Top')] = newVal;
		}
	}
	
	/**
	@name glow.dom-scrollOffset
	@private
	@description Set/get the scrollTop / scrollLeft of a NodeList
	@param {glow.dom.NodeList} nodeList Elements to get / set the position of
	@param {Boolean} isLeft True if we're dealing with left scrolling, otherwise top
	@param {Number} [val] Val to set (if not provided, we'll get the value)
	@returns NodeList for sets, Number for gets
	*/
	function scrollOffset(nodeList, isLeft, val) {
		var i = nodeList.length;
			
		if (val !== undefined) {
			while (i--) {
				setScrollOffset(nodeList[i], isLeft, val);
			}
			return nodeList;
		} else {
			return getScrollOffset(nodeList[0], isLeft);
		}
	}
	/**
	@name glow.NodeList#hide
	@function
	@description Hides all items in the NodeList.
		
	@returns {glow.NodeList}
		
	@example
		// Hides all list items within #myList
		glow("#myList li").hide();
	*/
	NodeListProto.hide = function() {
		return this.css('display', 'none').css('visibility', 'hidden');	
	};
	
	/**
	@name glow.NodeList#show
	@function
	@description Shows all hidden items in the NodeList.
		
	@returns {glow.NodeList}
		
	@example
		// Show element with ID myDiv
		glow("#myDiv").show();
			
	@example
		// Show all list items within #myList
		glow("#myList li").show();
	*/
	NodeListProto.show = function() {
		var i = this.length,
			currItem,
			itemStyle;
			
		while (i--) {
			/* Create a NodeList for the current item */
			currItem = new glow.NodeList(this[i]);
			itemStyle = currItem[0].style;
			if (currItem.css('display') == 'none') {
				itemStyle.display = '';
				itemStyle.visibility = 'visible';
				/* If display is still none, set to block */
				if (currItem.css('display') == 'none') {
					itemStyle.display = 'block';
				}
			}	
		}
		return this;	
	};

	/**
	@name glow.NodeList#offset
	@function
	@description Gets the offset from the top left of the document.
		If the NodeList contains multiple items, the offset of the
		first item is returned.
			
	@returns {Object}
		Returns an object with "top" & "left" properties in pixels
			
	@example
		glow("#myDiv").offset().top
	*/
	NodeListProto.offset = function() {
		if ( !this[0] || this[0].nodeType !== 1) {
			return {top: 0, left: 0};
		}
		
		// http://weblogs.asp.net/bleroy/archive/2008/01/29/getting-absolute-coordinates-from-a-dom-element.aspx - great bit of research, most bugfixes identified here (and also jquery trac)
		var elm = this[0],
			doc = elm.ownerDocument,
			docElm = doc.documentElement,
			window = doc.defaultView || doc.parentWindow,
			docScrollPos = {
				x: getScrollOffset(window, true),
				y: getScrollOffset(window, false)
			};

		//this is simple(r) if we can use 'getBoundingClientRect'
		// Sorry but the sooper dooper simple(r) way is not accurate in Safari 4
		if (!glow.env.webkit && elm.getBoundingClientRect) {
			var rect = elm.getBoundingClientRect();
			
			return {
				top: Math.floor(rect.top)
					/*
					 getBoundingClientRect is realive to top left of
					 the viewport, so we need to sort out scrolling offset
					*/
					+ docScrollPos.y
					/*
					IE adds the html element's border to the value. We can
					deduct this value using client(Top|Left). However, if
					the user has done html{border:0} clientTop will still
					report a 2px border in IE quirksmode so offset will be off by 2.
					Hopefully this is an edge case but we may have to revisit this
					in future
					*/
					- docElm.clientTop,

				left: Math.floor(rect.left) //see above for docs on all this stuff
					+ docScrollPos.x
					- docElm.clientLeft
			};
		}
		else { //damnit, let's go the long way around
			var top = elm.offsetTop,
				left = elm.offsetLeft,
				originalElm = elm,
				nodeNameLower,
				docBody = document.body,
				//does the parent chain contain a position:fixed element
				involvesFixedElement = false,
				offsetParentBeforeBody = elm;

			//add up all the offset positions
			while (elm = elm.offsetParent) {
				left += elm.offsetLeft;
				top += elm.offsetTop;

				//if css position is fixed, we need to add in the scroll offset too, catch it here
				if (getCssValue(elm, 'position') == 'fixed') {
					involvesFixedElement = true;
				}

				//gecko & webkit (safari 3) don't add on the border for positioned items
				if (glow.env.gecko || glow.env.webkit > 500) {
					left += parseInt(getCssValue(elm, 'border-left-width')) || 0;
					top  += parseInt(getCssValue(elm, 'border-top-width'))  || 0;
				}
				
				//we need the offset parent (before body) later
				if (elm.nodeName.toLowerCase() != 'body') {
					offsetParentBeforeBody = elm;
				}
			}

			//deduct all the scroll offsets
			elm = originalElm;
			
			while ((elm = elm.parentNode) && (elm != docBody) && (elm != docElm)) {
				left -= elm.scrollLeft;
				top -= elm.scrollTop;

				//FIXES
				//gecko doesn't add the border of contained elements to the offset (overflow!=visible)
				if (glow.env.gecko && getCssValue(elm, 'overflow') != 'visible') {
					left += parseInt(getCssValue(elm, 'border-left-width'));
					top += parseInt(getCssValue(elm, 'border-top-width'));
				}
			}

			//if we found a fixed position element we need to add the scroll offsets
			if (involvesFixedElement) {
				left += docScrollPos.x;
				top += docScrollPos.y;
			}

			//FIXES
			// Gecko - non-absolutely positioned elements that are direct children of body get the body offset counted twice
			if (
				(glow.env.gecko && getCssValue(offsetParentBeforeBody, 'position') != 'absolute')
			) {
				left -= docBody.offsetLeft;
				top -= docBody.offsetTop;
			}

			return {left:left, top:top};
		}
	};
	
	/**
	@name glow.NodeList#position
	@function
	@description Get the top & left position of an element relative to its positioned parent
		This is useful if you want to make a position:static element position:absolute
		and retain the original position of the element
			
	@returns {Object}
		An object with 'top' and 'left' number properties
		
	@example
		// get the top distance from the positioned parent
		glow("#elm").position().top
	*/
	NodeListProto.position = function() {
		var positionedParent = new glow.NodeList( getPositionedParent(this[0]) ),
			hasPositionedParent = !!positionedParent[0],
					
			// element margins to deduct
			marginLeft = parseInt( this.css('margin-left') ) || 0,
			marginTop  = parseInt( this.css('margin-top')  ) || 0,
					
			// offset parent borders to deduct, set to zero if there's no positioned parent
			positionedParentBorderLeft = ( hasPositionedParent && parseInt( positionedParent.css('border-left-width') ) ) || 0,
			positionedParentBorderTop  = ( hasPositionedParent && parseInt( positionedParent.css('border-top-width')  ) ) || 0,
					
			// element offsets
		elOffset = this.offset(),
		positionedParentOffset = hasPositionedParent ? positionedParent.offset() : {top: 0, left: 0};
				
		return {
			left: elOffset.left - positionedParentOffset.left - marginLeft - positionedParentBorderLeft,
			top:  elOffset.top  - positionedParentOffset.top  - marginTop  - positionedParentBorderTop
		}	
	};
	/*
		Get the 'real' positioned parent for an element, otherwise return null.
	*/
	function getPositionedParent(elm) {
		var offsetParent = elm.offsetParent,
		docElm = document.documentElement;
			
		// get the real positioned parent
		// IE places elements with hasLayout in the offsetParent chain even if they're position:static
		// Also, <body> and <html> can appear in the offsetParent chain, but we don't want to return them if they're position:static
		while (offsetParent && new glow.NodeList(offsetParent).css('position') == 'static') {	
			offsetParent = offsetParent.offsetParent;
		}
			
		// sometimes the <html> element doesn't appear in the offsetParent chain, even if it has position:relative
		if (!offsetParent && new glow.NodeList(docElm).css('position') != 'static') {
			offsetParent = docElm;
		}
			
		return offsetParent || null;
	}
});