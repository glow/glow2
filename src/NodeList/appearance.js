Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype,
		doc = document,
		/*
		PrivateVar: cssRegex
			For matching CSS selectors
		*/
		cssRegex = {
			tagName: /^(\w+|\*)/,
			combinator: /^\s*([>]?)\s*/,
				//safari 1.3 is a bit dim when it comes to unicode stuff, only dot matches them (not even \S), so some negative lookalheads are needed
				classNameOrId: (glow.env.webkit < 417) ? new RegExp("^([\\.#])((?:(?![\\.#\\[:\\s\\\\]).|\\\\.)+)") : /^([\.#])((?:[^\.#\[:\\\s]+|\\.)+)/
			},
			//for escaping strings in regex
		regexEscape = /([$^\\\/()|?+*\[\]{}.-])/g,

		/*
		PrivateVar: cssCache
			Cache of arrays representing an execution path for css selectors
		*/
		cssCache = {},
		/*
		PrivateVar: usesYAxis
			regex for detecting which css properties need to be calculated relative to the y axis
		*/
		usesYAxis = /height|top/,
		colorRegex = /^rgb\(([\d\.]+)(%?),\s*([\d\.]+)(%?),\s*([\d\.]+)(%?)/i,
		cssPropRegex = /^(?:(width|height)|(border-(top|bottom|left|right)-width))$/,
		hasUnits = /width|height|top$|bottom$|left$|right$|spacing$|indent$|font-size/,
		//append gets set to a function below
		placeholderElm,
		//getByTagName gets get to a function below
		getByTagName,
		win = window,
		doc = document,
		docBody,
		docElm,
		// true if properties of a dom node are cloned when the node is cloned (eg, true in IE)
		nodePropertiesCloned,
		// used to convert divs to strings
		tmpDiv = doc.createElement("div"),
		/*
		PrivateVars: tableArray, elmFilter
			Used in private function stringToNodes to capture any 
			elements that cannot be a childNode of <div>.
			Each entry in JSON responds to an element.
			First array value is how deep the element will be created in a node tree.
			Second array value is the beginning of the node tree.
			Third array value is the end of the node tree.
		*/
			tableArray = [1, '<table>', '</table>'],
			emptyArray = [0, '', ''],
			// webkit won't accept <link> elms to be the only child of an element,
			// it steals them and hides them in the head for some reason. Using
			// broken html fixes it for some reason
			paddingElmArray = glow.env.webkit < 526 ? [0, '', '</div>', true] : [1, 'b<div>', '</div>'],
			trArray = [3, '<table><tbody><tr>', '</tr></tbody></table>'],
			elmWraps = {
				caption: tableArray,
				thead: tableArray,
				th: trArray,
				colgroup: tableArray,
				tbody: tableArray,
				tr: [2, '<table><tbody>', '</tbody></table>'],
				td: trArray,
				tfoot: tableArray,
				option: [1, '<select>', '</select>'],
				legend: [1, '<fieldset>', '</fieldset>'],
				link: paddingElmArray,
				script: paddingElmArray,
				style: paddingElmArray
			};;
	
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
	
	
	NodeListProto.css = function(prop, val) {
		var that = this,
				thisStyle,
				i = 0,
				len = that.length,
				originalProp = prop;

				if (prop.constructor === Object) { // set multiple values
					for (style in prop) {
						this.css(style, prop[style]);
					}
					return that;
				}
				else if (val != undefined) { //set one CSS value
					prop = toStyleProp(prop);
					for (; i < len; i++) {
						thisStyle = that[i].style;
						
						if (typeof val == "number" && hasUnits.test(originalProp)) {
							val = val.toString() + "px";
						}
						if (prop == "opacity" && glow.env.ie) {
							//in IE the element needs hasLayout for opacity to work
							thisStyle.zoom = "1";
							if (val === "") {
								thisStyle.filter = "";
							} else {
								thisStyle.filter = "alpha(opacity=" + Math.round(Number(val, 10) * 100) + ")";
							}
						} else {
							thisStyle[prop] = val;
						}
					}
					return that;
				} else { //getting stuff
					if (!len) { return; }
					return getCssValue(that[0], prop);
				}	
	};
	/*
		PrivateMethod: toStyleProp
			Converts a css property name into its javascript name, such as "background-color" to "backgroundColor".

		Arguments:
			prop - (String) CSS Property name

		Returns:
			String, javascript style property name
		*/
	function toStyleProp(prop) {
			if (prop == "float") {
				return glow.env.ie ? "styleFloat" : "cssFloat";
			}
			return glow.util.replace(prop, /-(\w)/g, function(match, p1) {
				return p1.toUpperCase();
			});
	}
	/*
		PrivateMethod: getCssValue
			Get a computed css property

		Arguments:
			elm - element
			prop - css property or array of properties to add together

		Returns:
			String, value
		*/
		function getCssValue(elm, prop) {
			var r, //return value
				total = 0,
				i = 0,
				propLen = prop.length,
				compStyle = doc.defaultView && (doc.defaultView.getComputedStyle(elm, null) || doc.defaultView.getComputedStyle),
				elmCurrentStyle = elm.currentStyle,
				oldDisplay,
				match,
				propTest = prop.push || cssPropRegex.exec(prop) || [];


			if (prop.push) { //multiple properties, add them up
				for (; i < propLen; i++) {
					total += parseInt( getCssValue(elm, prop[i]), 10 ) || 0;
				}
				return total + "px";
			}
			
			if (propTest[1]) { // is width / height
				if (!isVisible(elm)) { //element may be display: none
					return tempBlock(elm, function() {
						return getElmDimension(elm, propTest[1]) + "px";
					});
				}
				return getElmDimension(elm, propTest[1]) + "px";
			}
			else if (propTest[2] //is border-*-width
				&& glow.env.ie
				&& getCssValue(elm, "border-" + propTest[3] + "-style") == "none"
			) {
				return "0";
			}
			else if (compStyle) { //W3 Method
				//this returns computed values
				if (typeof compStyle == "function") {
					//safari returns null for compStyle when element is display:none

					oldDisplay = elm.style.display;
					r = tempBlock(elm, function() {
						if (prop == "display") { //get true value for display, since we've just fudged it
							elm.style.display = oldDisplay;
							if (!doc.defaultView.getComputedStyle(elm, null)) {
								return "none";
							}
							elm.style.display = "block";
						}
						return getCssValue(elm, prop);
					});
				} else {
					// assume equal horizontal margins in safari 3
					// http://bugs.webkit.org/show_bug.cgi?id=13343
					// The above bug doesn't appear to be closed, but it works fine in Safari 4
					if (glow.env.webkit > 500 && glow.env.webkit < 526 && prop == 'margin-right' && compStyle.getPropertyValue('position') != 'absolute') {
						prop = 'margin-left';
					}
					r = compStyle.getPropertyValue(prop);
				}
			} else if (elmCurrentStyle) { //IE method
				if (prop == "opacity") {
					match = /alpha\(opacity=([^\)]+)\)/.exec(elmCurrentStyle.filter);
					return match ? String(parseInt(match[1], 10) / 100) : "1";
				}
				//this returns cascaded values so needs fixing
				r = String(elmCurrentStyle[toStyleProp(prop)]);
				if (/^-?[\d\.]+(?!px)[%a-z]+$/i.test(r) && prop != "font-size") {
					r = getPixelValue(elm, r, usesYAxis.test(prop)) + "px";
				}
			}
			//some results need post processing
			if (prop.indexOf("color") != -1) { //deal with colour values
				r = normaliseCssColor(r).toString();
			} else if (r.indexOf("url") == 0) { //some browsers put quotes around the url, get rid
				r = r.replace(/\"/g,"");
			}
			return r;
		}
	/*
		PrivateMethod: isVisible
			Is the element visible?
		*/
		function isVisible(elm) {
			//this is a bit of a guess, if there's a better way to do this I'm interested!
			return elm.offsetWidth ||
				elm.offsetHeight;
		}
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
	NodeListProto.height = function(height) {
		if (height == undefined) {
					return getElmDimension(this[0], "height");
				}
				setElmsSize(this, height, "height");
				return this;	
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
		if (width == undefined) {
					return getElmDimension(this[0], "width");
				}
				setElmsSize(this, width, "width");
				return this;
	};
	/*
		PrivateMethod: normaliseCssColor
			Converts a CSS colour into "rgb(255, 255, 255)" or "transparent" format
		*/

		function normaliseCssColor(val) {
			if (/^(transparent|rgba\(0, ?0, ?0, ?0\))$/.test(val)) { return 'transparent'; }
			var match, //tmp regex match holder
				r, g, b, //final colour vals
				hex, //tmp hex holder
				mathRound = Math.round,
				parseIntFunc = parseInt,
				parseFloatFunc = parseFloat;

			if (match = colorRegex.exec(val)) { //rgb() format, cater for percentages
				r = match[2] ? mathRound(((parseFloatFunc(match[1]) / 100) * 255)) : parseIntFunc(match[1]);
				g = match[4] ? mathRound(((parseFloatFunc(match[3]) / 100) * 255)) : parseIntFunc(match[3]);
				b = match[6] ? mathRound(((parseFloatFunc(match[5]) / 100) * 255)) : parseIntFunc(match[5]);
			} else {
				if (typeof val == "number") {
					hex = val;
				} else if (val.charAt(0) == "#") {
					if (val.length == "4") { //deal with #fff shortcut
						val = "#" + val.charAt(1) + val.charAt(1) + val.charAt(2) + val.charAt(2) + val.charAt(3) + val.charAt(3);
					}
					hex = parseIntFunc(val.slice(1), 16);
				} else {
					hex = htmlColorNames[val];
				}

				r = (hex) >> 16;
				g = (hex & 0x00ff00) >> 8;
				b = (hex & 0x0000ff);
			}

			val = new String("rgb(" + r + ", " + g + ", " + b + ")");
			val.r = r;
			val.g = g;
			val.b = b;
			return val;
		}
	/*
		PrivateMethod: getElmDimension
			Gets the size of an element as an integer, not including padding or border
		*/
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
		function getElmDimension(elm, cssProp /* (width|height) */) {
			var r, // val to return
				docElmOrBody = glow.env.standardsMode ? docElm : docBody,
				isWidth = (cssProp == "width"),
				cssPropCaps = isWidth ? "Width" : "Height",
				cssBorderPadding;

			if (elm.window) { // is window
				r = glow.env.webkit < 522.11 ? (isWidth ? elm.innerWidth				: elm.innerHeight) :
					glow.env.webkit			? (isWidth ? docBody.clientWidth		: elm.innerHeight) :
					glow.env.opera < 9.5		? (isWidth ? docBody.clientWidth		: docBody.clientHeight) :
					/* else */			  (isWidth ? docElmOrBody.clientWidth	: docElmOrBody.clientHeight);

			}
			else if (elm.getElementById) { // is document
				// we previously checked offsetWidth & clientWidth here
				// but they returned values too large in IE6 scrollWidth seems enough
				r = Math.max(
					docBody["scroll" + cssPropCaps],
					docElm["scroll" + cssPropCaps]
				)
			}
			else {
				// get an array of css borders & padding
				cssBorderPadding = isWidth ? horizontalBorderPadding : verticalBorderPadding;
				r = elm['offset' + cssPropCaps] - parseInt( getCssValue(elm, cssBorderPadding) );
			}
			return r;
		}
		
	/*
		PrivateMethod: setElmsSize
			Set element's size

		Arguments:
			elms - (<NodeList>) Elements
			val - (Mixed) Set element height / width. In px unless stated
			type - (String) "height" or "width"

		Returns:
			Nowt.
		*/
		function setElmsSize(elms, val, type) {
			if (typeof val == "number" || /\d$/.test(val)) {
				val += "px";
			}
			for (var i = 0, len = elms.length; i < len; i++) {
				elms[i].style[type] = val;
			}
		}
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
	NodeListProto.hide = function() {return this};
	
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
	NodeListProto.show = function() {return this};

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
	NodeListProto.offset = function() {return this};
	
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
	NodeListProto.position = function() {return this};
});