Glow.provide({
	version: '@SRC@',
	builder: function(glow) {
		var dom = glow.dom,
			ElementListProto = dom.ElementList.prototype;
		
		/**
			@name glow.dom.ElementList#after
			@function
			@description Inserts elements after each element.
				If there is more than one element in the list, the elements
				will be inserted after the first element and clones will be
				inserted after each subsequent element.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to insert
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} Original element list
			
			@example
				// adds a paragraph after each heading
				glow('h1, h2, h3').after('<p>...</p>');
		*/
		ElementListProto.after = function(elements) {};
		
		/**
			@name glow.dom.ElementList#before
			@function
			@description Inserts elements before each element.
				If there is more than one element in the ElementList, the elements
				will be inserted before the first element and clones will be
				inserted before each subsequent element.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to insert
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} Original element list
			
			@example
				// adds a div before each paragraph
				glow('p').before('<div>Here comes a paragraph!</div>');
		*/
		ElementListProto.before = function(elements) {};
		
		/**
			@name glow.dom.ElementList#append
			@function
			@description Appends elements to each element in the list
				If there is more than one element in the ElementList, then the given elements
				are appended to the first element and clones are appended to the other
				elements.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to append
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} Original element list
			
			@example
				// ends every paragraph with '...'
				glow('p').append('<span>...</span>');
		*/
		ElementListProto.append = function(elements) {};
		
		/**
			@name glow.dom.ElementList#prepend
			@function
			@description Prepends elements to each element in the list
				If there is more than one element in the ElementList, then the given elements
				are prepended to the first element and clones are prepended to the other
				elements.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to prepend
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} Original element list
			
			@example
				// prepends every paragraph with 'Paragraph: '
				glow('p').prepend('<span>Paragraph: </span>');
		*/
		ElementListProto.prepend = function(elements) {};
		
		/**
			@name glow.dom.ElementList#appendTo
			@function
			@description Append to another element(s)
				If appending to more than one element, the ElementList is appended
				to the first element and clones are appended to the others.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to append to
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} The appended elements
				This includes clones if clones were made.
			
			@example
				// appends '...' to every paragraph
				glow('<span>...</span>').appendTo('p');
		*/
		ElementListProto.appendTo = function(elements) {};

		/**
			@name glow.dom.ElementList#prependTo
			@function
			@description Prepend to another element(s)
				If prepending to more than one element, the ElementList is prepended
				to the first element and clones are prepended to the others.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to prepend to
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} The prepended elements
				This includes clones if clones were made.
			
			@example
				// prepends 'Paragraph: ' to every paragraph
				glow('<span>Paragraph: </span>').prependTo('p');
		*/
		ElementListProto.prependTo = function(elements) {};
		
		/**
			@name glow.dom.ElementList#insertAfter
			@function
			@description Insert the ElementList after other elements
				If inserting after more than one element, the ElementList is inserted
				after the first element and clones are inserted after the others.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to insert after
				Strings will be treated as CSS selectors.
				
			@returns {glow.dom.ElementList} Inserted elements
				This includes clones if clones were made.
			
			@example
				// adds a paragraph after each heading
				glow('<p>HAI!</p>').insertAfter('h1, h2, h3');
		*/
		ElementListProto.insertAfter = function(elements) {};
		
		/**
			@name glow.dom.ElementList#insertBefore
			@function
			@description Insert the ElementList before other elements
				If inserting before more than one element, the ElementList is inserted
				before the first element and clones are inserted before the others.
				
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to insert before
				Strings will be treated as CSS selectors.
				
			@returns {glow.dom.ElementList} Inserted elements
				This includes clones if clones were made.
			
			@example
				// adds a div before each paragraph
				glow('<div>Here comes a paragraph!</div>').insertBefore('p');
		*/
		ElementListProto.insertBefore = function(elements) {};
		
		/**
			@name glow.dom.ElementList#destroy
			@function
			@description Removes each element from the document
				The element, attached listeners & attached data will be
				destroyed to free up memory.
				
			@returns {glow.dom.ElementList} An empty ElementList
			
			@example
				// destroy all links in the document
				glow("a").destroy();
		*/
		ElementListProto.destroy = function() {};
		
		/**
			@name glow.dom.ElementList#remove
			@function
			@description Removes each element from the document
				If you no longer need the elements, consider using
				{@link glow.dom.ElementList#destroy destroy}
				
			@returns {glow.dom.ElementList} The removed elements

			@example
				// take all the links out of a document
				glow("a").remove();
		*/
		ElementListProto.remove = function() {};
		
		/**
			@name glow.dom.ElementList#empty
			@function
			@description Removes the elements' contents

			@returns {glow.dom.ElementList} Original elements

			@example
				// remove the contents of all textareas
				glow("textarea").empty();
		*/
		ElementListProto.empty = function() {};

		/**
			@name glow.dom.ElementList#replaceWith
			@function
			@description Replace elements with another
			
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} elements Element(s) to insert into the document
				If there is more than one element in the ElementList, then the given elements
				replace the first element, clones are appended to the other	elements.
				
			@returns {glow.dom.ElementList} The replaced elements
				Call {@link glow.dom.ElementList#destroy destroy} on these if you
				no longer need them
		*/
		ElementListProto.replaceWith = function(elements) {};
		
		/**
			@name glow.dom.ElementList#wrap
			@function
			@description Wraps the given ElementList with the specified element(s).
				The given ElementList items will always be placed in the first
				child element that contains no further elements.
				
				Each item in a given ElementList will be wrapped individually.
			
			@param {string | HTMLElement | HTMLElement[] | glow.dom.ElementList} wrapper Element to use as a wrapper
				Strings will be treated as HTML strings if they begin with <, else
				they'll be treated as a CSS selector.
			
			@returns {glow.dom.ElementList} The ElementList with new wrapper parents
				
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
		ElementListProto.wrap = function(wrapper) {};
		
		/**
			@name glow.dom.ElementList#unwrap
			@function
			@description Removes the parent of each item in the list
			
			@returns {glow.dom.ElementList} The now unwrapped elements
			
			@example
				// Before: <div><p><span id="mySpan">Hello</span></p></div>
				// unwrap the given element
				glow("#mySpan").unwrap();
				// After: <div><span id="mySpan">Hello</span></div>
		*/
		ElementListProto.unwrap = function() {};
		
		/**
			@name glow.dom.ElementList#clone
			@function
			@description Clones each element in the ElementList
			
			@param {Boolean} [elementsOnly=false] Just clone elements?
				By default, events and data will also be cloned, setting this to true prevents this
			
			@returns {glow.dom.ElementList} New ElementList of the clones
			
			@example
				// get a copy of all heading elements
				var myClones = glow("h1, h2, h3, h4, h5, h6").clone();
		*/
		ElementListProto.clone = function() {};
		
		/**
			@name glow.dom.ElementList#html
			@function
			@description Gets / sets HTML content
				Either gets content of the first element, or sets the content
				for all elements in the list
				
			@param {String} [html] String to set as the HTML of elements
				If omitted, the html for the first element in the list is
				returned.
			
			@returns {glow.dom.ElementList | string}
				Returns the original ElementList when setting,
				or the HTML content when getting.
				
			@example
				// get the html in #footer
				var footerContents = glow("#footer").html();
				
			@example
				// set a new footer
				glow("#footer").html("<strong>Hello World!</strong>");
		*/
		ElementListProto.html = function(html) {};
		
		/**
			@name glow.dom.ElementList#text
			@function
			@description Gets / set the text content
				Either gets content of the first element, or sets the content
				for all elements in the list
			
			@param {String} [text] String to set as the text of elements
				If omitted, the test for the first element in the list is
				returned.
			
			@returns {glow.dom.ElementList | String}
				Returns the original ElementList when setting,
				or the text content when getting.

			@example
				// set text
				var div = glow("<div></div>").text("Fun & games!");
				// <div>Func &amp; games!</div>
				
			@example
				// get text
				var mainHeading = glow('#mainHeading').text();
		*/
		ElementListProto.text = function(text) {};
		
	}
});