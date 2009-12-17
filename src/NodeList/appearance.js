Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype;
	
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
			glow("#subNav").css("display");
		
		@example
			// set left padding to 10px on all nodes
			glow("#subNav li").css("padding-left", "2em");
		
		@example
			// where appropriate, px is assumed when no unit is passed
			glow("#mainPromo").css("margin-top", 300);
		
		@example
			// set multiple CSS values at once
			// NOTE: Property names containing a hyphen such as font-weight must be quoted
			glow("#myDiv").css({
				'font-weight': 'bold',
				'padding'	 : '10px',
				'color'		 : '#00cc99'
			});
	*/
	NodeListProto.css = function(property, value) {};
	
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
			glow(window).height();
	*/
	NodeListProto.height = function(height) {};
	
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
	NodeListProto.width = function(width) {};
	
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
			var scrollPos = glow("#myDiv").scrollLeft();
			// scrollPos is a number, eg: 45

		@example
			// set the scroll left value of #myDiv to 20
			glow("#myDiv").scrollLeft(20);

		@example
			// get the scrollLeft of the window
			glow(window).scrollLeft();
			// scrollPos is a number, eg: 45
	*/
	NodeListProto.scrollLeft = function(val) {};
	
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
	NodeListProto.scrollTop = function(val) {};
	
	/**
		@name glow.NodeList#hide
		@function
		@description Hides all items in the NodeList.
		
		@returns {glow.NodeList}
		
		@example
			// Hides all list items within #myList
			glow("#myList li").hide();
	*/
	NodeListProto.hide = function() {};
	
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
	NodeListProto.show = function() {};

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
	NodeListProto.offset = function() {};
	
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
	NodeListProto.position = function() {};
});