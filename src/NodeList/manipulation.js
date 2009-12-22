Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype;
	
	// create a fragment from a collection of nodes
	function createFragment(nodes) {
		var fragment = document.createDocumentFragment(),
			i = 0,
			node;
		
		while ( node = nodes[i++] ) {
			fragment.appendChild(node);
		}
		
		return fragment;
	}
	
	// generate the #before and #after methods
	// 1 for #after, 0 for #before
	function insertElms(after) {
		return function(elements) {
			if (!this.length) { return this; }
	
			var toAdd,
				toAddNext = createFragment( new glow.NodeList(elements) ),
				item,
				itemParent;
			
			for (var i = 0, leni = this.length, lasti = leni - 1; i<leni; i++) {
				item = this[i];
				toAdd = toAddNext;
				
				// we can only append after if the element has a parent right?
				if ( itemParent = item.parentNode ) {
					if (i != lasti) { // if not the last item
						toAddNext = toAdd.cloneNode(true);
					}
					itemParent.insertBefore(toAdd, after ? item.nextSibling : item);
				}
			}
			
			return this;
		}
	}
	
	/**
		@name glow.NodeList#after
		@function
		@description Inserts nodes after each nodes.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Node(s) to insert
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
			
			If there is more than one node in the NodeList, 'nodes'
			will be inserted after the first element and clones will be
			inserted after each subsequent element.
		
		@returns {glow.NodeList} Original element list
		
		@example
			// adds a paragraph after each heading
			glow('h1, h2, h3').after('<p>...</p>');
	*/
	NodeListProto.after = insertElms(1);
	
	/**
		@name glow.NodeList#before
		@function
		@description Inserts elements before each element.
			If there is more than one element in the NodeList, the elements
			will be inserted before the first element and clones will be
			inserted before each subsequent element.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to insert
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} Original element list
		
		@example
			// adds a div before each paragraph
			glow('p').before('<div>Here comes a paragraph!</div>');
	*/
	NodeListProto.before = insertElms(0);
	
	/**
		@name glow.NodeList#append
		@function
		@description Appends elements to each element in the list
			If there is more than one element in the NodeList, then the given elements
			are appended to the first element and clones are appended to the other
			elements.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to append
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} Original element list
		
		@example
			// ends every paragraph with '...'
			glow('p').append('<span>...</span>');
	*/
	NodeListProto.append = function(elements) {};
	
	/**
		@name glow.NodeList#prepend
		@function
		@description Prepends elements to each element in the list
			If there is more than one element in the NodeList, then the given elements
			are prepended to the first element and clones are prepended to the other
			elements.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to prepend
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} Original element list
		
		@example
			// prepends every paragraph with 'Paragraph: '
			glow('p').prepend('<span>Paragraph: </span>');
	*/
	NodeListProto.prepend = function(elements) {};
	
	/**
		@name glow.NodeList#appendTo
		@function
		@description Append to another element(s)
			If appending to more than one element, the NodeList is appended
			to the first element and clones are appended to the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to append to
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} The appended elements
			This includes clones if clones were made.
		
		@example
			// appends '...' to every paragraph
			glow('<span>...</span>').appendTo('p');
	*/
	NodeListProto.appendTo = function(elements) {};

	/**
		@name glow.NodeList#prependTo
		@function
		@description Prepend to another element(s)
			If prepending to more than one element, the NodeList is prepended
			to the first element and clones are prepended to the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to prepend to
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} The prepended elements
			This includes clones if clones were made.
		
		@example
			// prepends 'Paragraph: ' to every paragraph
			glow('<span>Paragraph: </span>').prependTo('p');
	*/
	NodeListProto.prependTo = function(elements) {};
	
	/**
		@name glow.NodeList#insertAfter
		@function
		@description Insert the NodeList after other elements
			If inserting after more than one element, the NodeList is inserted
			after the first element and clones are inserted after the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to insert after
			Strings will be treated as CSS selectors.
			
		@returns {glow.NodeList} Inserted elements
			This includes clones if clones were made.
		
		@example
			// adds a paragraph after each heading
			glow('<p>HAI!</p>').insertAfter('h1, h2, h3');
	*/
	NodeListProto.insertAfter = function(elements) {};
	
	/**
		@name glow.NodeList#insertBefore
		@function
		@description Insert the NodeList before other elements
			If inserting before more than one element, the NodeList is inserted
			before the first element and clones are inserted before the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to insert before
			Strings will be treated as CSS selectors.
			
		@returns {glow.NodeList} Inserted elements
			This includes clones if clones were made.
		
		@example
			// adds a div before each paragraph
			glow('<div>Here comes a paragraph!</div>').insertBefore('p');
	*/
	NodeListProto.insertBefore = function(elements) {};
	
	/**
		@name glow.NodeList#destroy
		@function
		@description Removes each element from the document
			The element, attached listeners & attached data will be
			destroyed to free up memory.
			
		@returns {glow.NodeList} An empty NodeList
		
		@example
			// destroy all links in the document
			glow("a").destroy();
	*/
	NodeListProto.destroy = function() {};
	
	/**
		@name glow.NodeList#remove
		@function
		@description Removes each element from the document
			If you no longer need the elements, consider using
			{@link glow.NodeList#destroy destroy}
			
		@returns {glow.NodeList} The removed elements

		@example
			// take all the links out of a document
			glow("a").remove();
	*/
	NodeListProto.remove = function() {};
	
	/**
		@name glow.NodeList#empty
		@function
		@description Removes the elements' contents

		@returns {glow.NodeList} Original elements

		@example
			// remove the contents of all textareas
			glow("textarea").empty();
	*/
	NodeListProto.empty = function() {};

	/**
		@name glow.NodeList#replaceWith
		@function
		@description Replace elements with another
		
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to insert into the document
			If there is more than one element in the NodeList, then the given elements
			replace the first element, clones are appended to the other	elements.
			
		@returns {glow.NodeList} The replaced elements
			Call {@link glow.NodeList#destroy destroy} on these if you
			no longer need them
	*/
	NodeListProto.replaceWith = function(elements) {};
	
	/**
		@name glow.NodeList#wrap
		@function
		@description Wraps the given NodeList with the specified element(s).
			The given NodeList items will always be placed in the first
			child element that contains no further elements.
			
			Each item in a given NodeList will be wrapped individually.
		
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} wrapper Element to use as a wrapper
			Strings will be treated as HTML strings if they begin with <, else
			they'll be treated as a CSS selector.
		
		@returns {glow.NodeList} The NodeList with new wrapper parents
			
		@example
			// <span id="mySpan">Hello</span>
			glow("#mySpan").wrap("<div><p></p></div>");
			// Makes:
			// <div>
			//     <p>
			//         <span id="mySpan">Hello</span>
			//     </p>
			// </div>
			
	*/
	NodeListProto.wrap = function(wrapper) {};
	
	/**
		@name glow.NodeList#unwrap
		@function
		@description Removes the parent of each item in the list
		
		@returns {glow.NodeList} The now unwrapped elements
		
		@example
			// Before: <div><p><span id="mySpan">Hello</span></p></div>
			// unwrap the given element
			glow("#mySpan").unwrap();
			// After: <div><span id="mySpan">Hello</span></div>
	*/
	NodeListProto.unwrap = function() {};
	
	/**
		@name glow.NodeList#clone
		@function
		@description Clones each node in the NodeList, along with data & event listeners
		
		@returns {glow.NodeList}
			Returns a new NodeList containing clones of all the nodes in
			the NodeList
		
		@example
			// get a copy of all heading elements
			var myClones = glow.get("h1, h2, h3, h4, h5, h6").clone();
	*/
	
	NodeListProto.clone = function() {
		return new glow.NodeList(
			createFragment(this).cloneNode(true).childNodes
		)
	};
	
	/**
		@name glow.NodeList#copy
		@function
		@description Copies each node in the NodeList, excluding data & event listeners
		
		@returns {glow.NodeList}
			Returns a new NodeList containing copies of all the nodes in
			the NodeList
		
		@example
			// get a copy of all heading elements
			var myCopies = glow.get("h1, h2, h3, h4, h5, h6").copy();
	*/
	NodeListProto.copy = function() {};
	
	/**
		@name glow.NodeList#html
		@function
		@description Gets / sets HTML content
			Either gets content of the first element, or sets the content
			for all elements in the list
			
		@param {String} [html] String to set as the HTML of elements
			If omitted, the html for the first element in the list is
			returned.
		
		@returns {glow.NodeList | string}
			Returns the original NodeList when setting,
			or the HTML content when getting.
			
		@example
			// get the html in #footer
			var footerContents = glow("#footer").html();
			
		@example
			// set a new footer
			glow("#footer").html("<strong>Hello World!</strong>");
	*/
	NodeListProto.html = function(html) {};
	
	/**
		@name glow.NodeList#text
		@function
		@description Gets / set the text content
			Either gets content of the first element, or sets the content
			for all elements in the list
		
		@param {String} [text] String to set as the text of elements
			If omitted, the test for the first element in the list is
			returned.
		
		@returns {glow.NodeList | String}
			Returns the original NodeList when setting,
			or the text content when getting.

		@example
			// set text
			var div = glow("<div></div>").text("Fun & games!");
			// <div>Func &amp; games!</div>
			
		@example
			// get text
			var mainHeading = glow('#mainHeading').text();
	*/
	NodeListProto.text = function(text) {};
});