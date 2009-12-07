Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		/**
			@name glow.dom
			@namespace
			@description Accessing and manipulating the DOM
		*/
		var dom = {},
			ElementListProto;
		
		/**
			@name glow.dom.ElementList
			@constructor
			@description An array-like collection of DOM Elements
				It is recommended to create an ElementList using {@link glow},
				but you can also use this constructor to create an empty ElementList,
				or look at elements in another frame.
				
			@example
				// empty ElementList
				var myElementList = new glow.dom.ElementList();

			@example
				// using glow to return a ElementList then chaining methods
				glow("p").addClass("eg").append("<b>Hello!</b>");
			
			@see <a href="../furtherinfo/creatingelementlists/">Creating ElementLists</a>
			@see <a href="../furtherinfo/workingwithelementlists/">Working with ElementLists</a>
			@see {@link glow.dom.XmlElementList XmlElementList} - An XML-specific ElementList
		*/
		function ElementList() {}
		ElementListProto = ElementList.prototype;
		
		/**
			@name glow.dom.ElementList#length
			@type Number
			@description Number of elements in the ElementList
			@example
				// get the number of paragraphs on the page
				glow('p').length;
		*/
		ElementListProto.length = 0;
		
		/**
			@name glow.dom.ElementList#eq
			@function
			@description Compares the ElementList to another
				Returns true if both ElementLists contain the same items in the same order
			
			@param {HTMLElement | HTMLElement[] | glow.dom.ElementList} elementList The ElementList to compare to.
				If an HTMLElement or array of HTMLElements is provided, it will
				be converted into an ElementList
			
			@returns {boolean}
			
			@example
			// the following returns true
			glow('#blah').eq( document.getElementById('blah') );
		*/
		ElementListProto.eq = function(elementList) {};
		
		/**
			@name glow.dom.ElementList#push
			@function
			@description Adds elements to the ElementList
			
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to add to the ElementList
				Strings will be treated as CSS selectors / HTML strings.
			
			@returns {glow.dom.ElementList}
			
			@example
				myElementList.push('<div>Foo</div>').push('h1');
		*/
		ElementListProto.push = function(elements) {};
		
		/**
			@name glow.dom.ElementList#slice
			@function
			@description Get a section of an ElementList
				Operates in the same way as a string / array's slice method
			
			@param {number} start Start index
				If negative, it specifies a position measured from the end of the list
			
			@param {number} [end] End index
				By default, this is the end of the list. A negative end specifies
				a position measured from the end of the list.
			
			@returns {glow.dom.ElementList} A new sliced ElementList
			
			@example
			var myElementList = glow("<div></div><p></p>");
			myElementList.slice(1, 2); // selects the paragraph
			myElementList.slice(-1); // same thing, selects the paragraph
		*/
		ElementListProto.slice = function(start, end) {};
		
		/**
			@name glow.dom.ElementList#sort
			@function
			@description Sort the elements in the list
			
			@param {Function} [func] Function to determine sort order
				This function will be passed 2 elements (elementA, elementB). The function
				should return a number less than 0 to sort elementA lower than elementB
				and greater than 0 to sort elementA higher than elementB.
				
				If none is provided, elements will be sorted in document order
			
			@returns {glow.dom.ElementList} A new sorted ElementList
			
			@example
			//get links in alphabetical (well, lexicographical) order
			var links = glow("a").sort(function(elementA, elementB) {
				return glow(elementA).text() < glow(elementB).text() ? -1 : 1;
			})
		*/
		ElementListProto.sort = function(func) {};
		
		/**
			@name glow.dom.ElementList#item
			@function
			@description Get a single item from the list as an ElementList
				Negative numbers can be used to get items from the end of the
				list.
			
			@param {number} index The numeric index of the node to return.
			
			@returns {glow.dom.ElementList} A new ElementList containing a single item
			
			@example
				// get the html from the fourth element
				myElementList.item(3).html();
				
			@example
				// add a class name to the last item
				myElementList.item(-1).addClass('last');
		*/
		ElementListProto.item = function(index) {};
		
		/**
			@name glow.dom.ElementList#each
			@function
			@description Calls a function for each item in the list.
			
			@param {Function} callback The function to run for each node.
				The function will be passed a single argument representing
				the index of the current item in the ElementList.
				
				Inside the function 'this' refers to the HTMLElement.
				
				Returning false from this function stops subsequent itterations
			
			@returns {glow.dom.ElementList}
			
			@example
				// add "link number: x" to each link, where x is the index of the link
				glow("a").each(function(i) {
					glow(this).append(' link number: ' + i);
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
			@name glow.dom.ElementList#filter
			@function
			@description Filter the ElementList
			 
			@param {Function|string} test Filter test
				If a string is provided, it is used in a call to {@link glow.dom.ElementList#is ElementList#is}.
				
				If a function is provided it will be passed a single argument
				representing the index of the current item in the ElementList.
				
				Inside the function 'this' refers to the HTMLElement.
				Return true to keep the element, or false to remove it.
			 
			@returns {glow.dom.ElementList} A new ElementList containing the filtered nodes
			 
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
			@name glow.dom.ElementList#is
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
		dom.ElementList = ElementList;
		glow.dom = dom;
	}
});