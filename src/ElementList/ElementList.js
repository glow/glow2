Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		var ElementListProto, undefined,
			// vars to aid compression
			document = window.document;
		
		/**
			@name glow.ElementList
			@constructor
			@description An array-like collection of DOM Elements
				It is recommended to create an ElementList using {@link glow},
				but you can also use this constructor.
				
			@param {string | glow.ElementList | HTMLElement | HTMLElement[]} elms Items to populate the ElementList with.
				This parameter will be passed to {@link glow.ElementList#push}
				
			@example
				// empty ElementList
				var myElementList = new glow.ElementList();

			@example
				// using glow to return a ElementList then chaining methods
				glow("p").addClass("eg").append("<b>Hello!</b>");
			
			@see <a href="../furtherinfo/creatingelementlists/">Creating ElementLists</a>
			@see <a href="../furtherinfo/workingwithelementlists/">Working with ElementLists</a>
			@see {@link glow.XmlElementList XmlElementList} - An XML-specific ElementList
		*/
		function ElementList(elms) {
			// call push if we've been given elements
			elms && this.push(elms);
		}
		ElementListProto = ElementList.prototype;
		
		/**
			@name glow.ElementList#length
			@type Number
			@description Number of elements in the ElementList
			@example
				// get the number of paragraphs on the page
				glow('p').length;
		*/
		ElementListProto.length = 0;
		
		/**
			@name glow.ElementList#_strToNodes
			@private
			@function
			@description Converts a string to an array of nodes
			
			@param {string} str HTML string
			
			@returns {Node[]} Array of nodes (including text / comment nodes)
		*/
		ElementListProto._strToNodes = (function() {
			var	tmpDiv = document.createElement("div"),
				// these wraps are in the format [depth to children, opening html, closing html]
				tableWrap = [1, '<table>', '</table>'],
				emptyWrap = [0, '', ''],
				// webkit won't accept <link> elms to be the only child of an element,
				// it steals them and hides them in the head for some reason. Using
				// broken html fixes it for some reason
				paddingWrap = [1, 'b<div>', '</div>'],
				trWrap = [3, '<table><tbody><tr>', '</tr></tbody></table>'],
				wraps = {
					caption: tableWrap,
					thead: tableWrap,
					th: trWrap,
					colgroup: tableWrap,
					tbody: tableWrap,
					tr: [2, '<table><tbody>', '</tbody></table>'],
					td: trWrap,
					tfoot: tableWrap,
					option: [1, '<select>', '</select>'],
					legend: [1, '<fieldset>', '</fieldset>'],
					link: paddingWrap,
					script: paddingWrap,
					style: paddingWrap
				};
			
			function strToNodes(str) {
				var r = [],
					tagName = ( /^\s*<([^\s>]+)/.exec(str) || [] )[1],
					// This matches str content with potential elements that cannot
					// be a child of <div>.  elmFilter declared at top of page.
					wrap = wraps[tagName] || emptyWrap, 
					nodeDepth = wrap[0],
					childElm = tmpDiv,
					rLen = 0;
				
				// Create the new element using the node tree contents available in filteredElm.
				childElm.innerHTML = (wrap[1] + str + wrap[2]);
				
				// Strip newElement down to just the required elements' parent
				while(nodeDepth--) {
					childElm = childElm.lastChild;
				}
				
				// pull nodes out of child
				while (childElm.firstChild) {
					r[rLen++] = childElm.removeChild(childElm.firstChild);
				}
				return r;
			}
			
			return strToNodes;
		})();
		
		// takes a collection and returns an array
		function collectionToArray(collection) {
			var i   = collection.length,
				arr = [];
				
			while (i--) {
				arr[i] = collection[i];
			}
			
			return arr;
		}
		
		var arrayPush = Array.prototype.push;
		
		/**
			@name glow.ElementList#push
			@function
			@description Adds elements to the ElementList
			
			@param {string | HTMLElement | HTMLElement[] | glow.ElementList} elements Element(s) to add to the ElementList
				Strings will be treated as CSS selectors / HTML strings.
			
			@returns {glow.ElementList}
			
			@example
				myElementList.push('<div>Foo</div>').push('h1');
		*/
		ElementListProto.push = function(elements) {
			if (typeof elements == 'string') {
				// if the string begins <, treat it as html, otherwise it's a selector
				if (elements.charAt(0) == '<') {
					elements = this._strToNodes(elements);
				} else {
					elements = glow._sizzle(elements)
				}
				arrayPush.apply(this, elements);
			}
			else if (elements.nodeType || elements.window) {
				this[0] = elements;
				this.length = 1;
			}
			else if (elements.length !== undefined) {
				if (elements.constructor != Array) {
					// convert array-like objects into an array
					elements = collectionToArray(elements);
				}
				arrayPush.apply(this, elements);
			}
			/*!debug*/
			else {
				glow.debug.warn('glow.ElementList#push: Ignoring incorrect argument type, failing silently');
			}
			/*gubed!*/

			return this;
		};
		
		/**
			@name glow.ElementList#eq
			@function
			@description Compares the ElementList to another
				Returns true if both ElementLists contain the same items in the same order
			
			@param {HTMLElement | HTMLElement[] | glow.ElementList} elementList The ElementList to compare to.
				If an HTMLElement or array of HTMLElements is provided, it will
				be converted into an ElementList
			
			@returns {boolean}
			
			@example
			// the following returns true
			glow('#blah').eq( document.getElementById('blah') );
		*/
		ElementListProto.eq = function(elementList) {};
		
		/**
			@name glow.ElementList#slice
			@function
			@description Get a section of an ElementList
				Operates in the same way as a string / array's slice method
			
			@param {number} start Start index
				If negative, it specifies a position measured from the end of the list
			
			@param {number} [end] End index
				By default, this is the end of the list. A negative end specifies
				a position measured from the end of the list.
			
			@returns {glow.ElementList} A new sliced ElementList
			
			@example
			var myElementList = glow("<div></div><p></p>");
			myElementList.slice(1, 2); // selects the paragraph
			myElementList.slice(-1); // same thing, selects the paragraph
		*/
		ElementListProto.slice = function(start, end) {};
		
		/**
			@name glow.ElementList#sort
			@function
			@description Sort the elements in the list
			
			@param {Function} [func] Function to determine sort order
				This function will be passed 2 elements (elementA, elementB). The function
				should return a number less than 0 to sort elementA lower than elementB
				and greater than 0 to sort elementA higher than elementB.
				
				If none is provided, elements will be sorted in document order
			
			@returns {glow.ElementList} A new sorted ElementList
			
			@example
			//get links in alphabetical (well, lexicographical) order
			var links = glow("a").sort(function(elementA, elementB) {
				return glow(elementA).text() < glow(elementB).text() ? -1 : 1;
			})
		*/
		ElementListProto.sort = function(func) {};
		
		/**
			@name glow.ElementList#item
			@function
			@description Get a single item from the list as an ElementList
				Negative numbers can be used to get items from the end of the
				list.
			
			@param {number} index The numeric index of the node to return.
			
			@returns {glow.ElementList} A new ElementList containing a single item
			
			@example
				// get the html from the fourth element
				myElementList.item(3).html();
				
			@example
				// add a class name to the last item
				myElementList.item(-1).addClass('last');
		*/
		ElementListProto.item = function(index) {};
		
		/**
			@name glow.ElementList#each
			@function
			@description Calls a function for each item in the list.
			
			@param {Function} callback The function to run for each node.
				The function will be passed a single argument representing
				the index of the current item in the ElementList.
				
				Inside the function 'this' refers to the HTMLElement.
				
				Returning false from this function stops subsequent itterations
			
			@returns {glow.ElementList}
			
			@example
				// add "link number: x" to each link, where x is the index of the link
				glow("a").each(function(i) {
					glow(this).append('<span> link number: ' + i + '</span>');
				});
			@example
				// breaking out of an each loop
				glow("a").each(function(i) {
					// do stuff
					if ( glow(this).hasClass('whatever') ) {
						// we don't want to process any more links
						return false;
					}
				});
		*/
		ElementListProto.each = function(callback) {};
		
		/**
			@name glow.ElementList#filter
			@function
			@description Filter the ElementList
			 
			@param {Function|string} test Filter test
				If a string is provided, it is used in a call to {@link glow.ElementList#is ElementList#is}.
				
				If a function is provided it will be passed a single argument
				representing the index of the current item in the ElementList.
				
				Inside the function 'this' refers to the HTMLElement.
				Return true to keep the element, or false to remove it.
			 
			@returns {glow.ElementList} A new ElementList containing the filtered nodes
			 
			@example
				// return images with a width greater than 320
				glow("img").filter(function () {
					return glow(this).width() > 320;
				});
			
			@example
				// Get items that don't have an alt attribute
				myElementList.filter(':not([href])');
		*/
		ElementListProto.filter = function(test) {};

		
		/**
			@name glow.ElementList#is
			@function
			@description Tests if an element in the list matches CSS selector
				Returns true if at least one element in the list matches
				the selector.

			@param {string} selector CSS selector
			
			@returns {boolean}
			
			@example
				if ( myElementList.is(':visible') ) {
					// ...
				}
		*/
		ElementListProto.is = function(selector) {};
		
		// export
		glow.ElementList = ElementList;
	}
});