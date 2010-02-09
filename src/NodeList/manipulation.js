Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype,
		document = window.document,
		undefined;
	
	// create a fragment and insert a set of nodes into it
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
	// after: 1 for #(insert)after, 0 for #(insert)before
	// insert: 1 for #insert(After|Before), 0 for #(after|before)
	function afterAndBefore(after, insert) {
		return function(elements) {
			var toAddList,
				toAddToList,
				fragmentToAdd,
				nextFragmentToAdd,
				item,
				itemParent;
			
			if (!this.length) { return this; }
			
			// normalise 'elements'
			// if we're dealing with append/prepend then strings are always treated as HTML strings
			if (!insert && typeof elements === 'string') {
				elements = new glow.NodeList( glow.NodeList._strToNodes(elements) );
			}
			else {
				elements = new glow.NodeList(elements);
			}
			
			// set the element we're going to add to, and the elements we're going to add
			if (insert) {
				toAddToList = elements;
				toAddList = new glow.NodeList(this);
			}
			else {
				toAddToList = this;
				toAddList = elements;
			}
			
			nextFragmentToAdd = createFragment(toAddList);
			
			for (var i = 0, leni = toAddToList.length, lasti = leni - 1; i < leni; i++) {
				item = toAddToList[i];
				fragmentToAdd = nextFragmentToAdd;
				
				// we can only append after if the element has a parent right?
				if (itemParent = item.parentNode) {
					if (i !== lasti) { // if not the last item
						nextFragmentToAdd = fragmentToAdd.cloneNode(true);
						insert && toAddList.push(nextFragmentToAdd.childNodes);
					}
					itemParent.insertBefore(fragmentToAdd, after ? item.nextSibling : item);
				}
			}
			
			return insert ? toAddList : toAddToList;
		}
	}
	
	// generate the #append, #appendTo, #prepend and #prependTo methods
	// append: 1 for #append(To), 0 for #prepend(To)
	// to: 1 for #(append|prepend)To, 0 for #(append|prepend)
	function appendAndPrepend(append, to) {
		return function(elements) {
			var toAddList,
				toAddToList,
				fragmentToAdd,
				nextFragmentToAdd,
				item;
			
			if (!this.length) { return this; }
			
			// normalise 'elements'
			// if we're dealing with append/prepend then strings are always treated as HTML strings
			if (!to && typeof elements === 'string') {
				elements = new glow.NodeList( glow.NodeList._strToNodes(elements) );
			}
			else {
				elements = new glow.NodeList(elements);
			}
				
			// set the element we're going to add to, and the elements we're going to add
			if (to) {
				toAddToList = elements;
				toAddList = new glow.NodeList(this);
			}
			else {
				toAddToList = this;
				toAddList = elements;
			}
			
			nextFragmentToAdd = createFragment(toAddList);
			
			for (var i = 0, leni = toAddToList.length, lasti = leni - 1; i < leni; i++) {
				item = toAddToList[i];
				fragmentToAdd = nextFragmentToAdd;
				
				// avoid trying to append to non-elements
				if (item.nodeType === 1) {
					if (i !== lasti) { // if not the last item
						nextFragmentToAdd = fragmentToAdd.cloneNode(true);
						// add the clones to the return element for appendTo / prependTo
						to && toAddList.push(nextFragmentToAdd.childNodes);
					}
					item.insertBefore(fragmentToAdd, append ? null : item.firstChild);
				}
			}
			
			return to ? toAddList : toAddToList;
		}
	}
	
	/**
		@name glow.NodeList#after
		@function
		@description Insert node(s) after each node in this NodeList.
			If there is more than one node in this NodeList, 'nodes'
			will be inserted after the first element and clones will be
			inserted after each subsequent element.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Node(s) to insert
			Strings will be treated as HTML strings.
		
		@returns {glow.NodeList} Original NodeList
		
		@example
			// adds a paragraph after each heading
			glow('h1, h2, h3').after('<p>That was a nice heading.</p>');
	*/
	NodeListProto.after = afterAndBefore(1);
	
	/**
		@name glow.NodeList#before
		@function
		@description Insert node(s) before each node in this NodeList.
			If there is more than one node in this NodeList, 'nodes'
			will be inserted before the first element and clones will be
			inserted before each subsequent element.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Node(s) to insert
			Strings will be treated as HTML strings.
		
		@returns {glow.NodeList} Original NodeList
		
		@example
			// adds a div before each paragraph
			glow('p').before('<div>Here comes a paragraph!</div>');
	*/
	NodeListProto.before = afterAndBefore(0);
	
	/**
		@name glow.NodeList#append
		@function
		@description Appends node to each node in this NodeList.
			If there is more than one node in this NodeList, then the given nodes
			are appended to the first node and clones are appended to the other
			nodes.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Nodes(s) to append
			Strings will be treated as HTML strings.
		
		@returns {glow.NodeList} Original NodeList
		
		@example
			// ends every paragraph with '...'
			glow('p').append('<span>...</span>');
	*/
	NodeListProto.append = appendAndPrepend(1);
	
	/**
		@name glow.NodeList#prepend
		@function
		@description Prepends nodes to each node in this NodeList.
			If there is more than one node in this NodeList, then the given nodes
			are prepended to the first node and clones are prepended to the other
			nodes.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Nodes(s) to prepend
			Strings will be treated as HTML strings.
		
		@returns {glow.NodeList} Original NodeList
		
		@example
			// prepends every paragraph with 'Paragraph: '
			glow('p').prepend('<span>Paragraph: </span>');
	*/
	NodeListProto.prepend = appendAndPrepend(0);
	
	/**
		@name glow.NodeList#appendTo
		@function
		@description Appends nodes in this NodeList to given node(s)
			If appending to more than one node, the NodeList is appended
			to the first node and clones are appended to the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} node Node(s) to append to.
			Strings will be treated as CSS selectors or HTML strings.
		
		@returns {glow.NodeList} The appended nodes.
		
		@example
			// appends '...' to every paragraph
			glow('<span>...</span>').appendTo('p');
	*/
	NodeListProto.appendTo = appendAndPrepend(1, 1);

	/**
		@name glow.NodeList#prependTo
		@function
		@description Prepends nodes in this NodeList to given node(s)
			If prepending to more than one node, the NodeList is prepended
			to the first node and clones are prepended to the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} node Node(s) to prepend to
			Strings will be treated as CSS selectors or HTML strings.
		
		@returns {glow.NodeList} The prepended nodes.
		
		@example
			// prepends 'Paragraph: ' to every paragraph
			glow('<span>Paragraph: </span>').prependTo('p');
	*/
	NodeListProto.prependTo = appendAndPrepend(0, 1);
	
	/**
		@name glow.NodeList#insertAfter
		@function
		@description Insert this NodeList after the given nodes
			If inserting after more than one node, the NodeList is inserted
			after the first node and clones are inserted after the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Node(s) to insert after
			Strings will be treated as CSS selectors.
			
		@returns {glow.NodeList} Inserted nodes.
		
		@example
			// adds a paragraph after each heading
			glow('<p>HAI!</p>').insertAfter('h1, h2, h3');
	*/
	NodeListProto.insertAfter = afterAndBefore(1, 1);
	
	/**
		@name glow.NodeList#insertBefore
		@function
		@description Insert this NodeList before the given nodes
			If inserting before more than one node, the NodeList is inserted
			before the first node and clones are inserted before the others.
			
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} nodes Node(s) to insert before
			Strings will be treated as CSS selectors.
			
		@returns {glow.NodeList} Inserted nodes.
		
		@example
			// adds a div before each paragraph
			glow('<div>Here comes a paragraph!</div>').insertBefore('p');
	*/
	NodeListProto.insertBefore = afterAndBefore(0, 1);
	
	/**
		@name glow.NodeList#destroy
		@function
		@description Removes each element from the document
			The element, attached listeners & attached data will be
			destroyed to free up memory.
			
			Detroyed elements may not be reused in some browsers.
			
		@returns {glow.NodeList} An empty NodeList
		
		@example
			// destroy all links in the document
			glow("a").destroy();
	*/
	var tmpDiv = document.createElement('div');
	
	NodeListProto.destroy = function() {
		glow.NodeList._destroyData(this);
		this.appendTo(tmpDiv);
		tmpDiv.innerHTML = '';
		return new glow.NodeList();
	};
	
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
	NodeListProto.remove = function() {
		var parent,
			node,
			i = this.length;
		
		while (i--) {
			node = this[i];
			if (parent = node.parentNode) {
				parent.removeChild(node);
			}
		}
		
		return this;
	};
	
	/**
		@name glow.NodeList#empty
		@function
		@description Removes the nodes' contents

		@returns {glow.NodeList} Original nodes

		@example
			// remove the contents of all textareas
			glow("textarea").empty();
	*/
	// TODO: is this shortcut worth doing?
	NodeListProto.empty = glow.env.ie ?
		// When you clean an element out using innerHTML it destroys its inner text nodes in IE8 and below
		// Here's an alternative method for IE:
		function() {
			var i = this.length, node, child;
			
			while (i--) {
				node = this[i];
				while (child = node.firstChild) {
					node.removeChild(child);
				}
			}
			
			return this;
		} :
		// method for most browsers
		function() {
			var i = this.length;
			
			while (i--) {
				this[i].innerHTML = '';
			}
			
			return this;
		}

	/**
		@name glow.NodeList#replaceWith
		@function
		@description Replace elements with another
		
		@param {string | HTMLElement | HTMLElement[] | glow.NodeList} elements Element(s) to insert into the document
			If there is more than one element in the NodeList, then the given elements
			replace the first element, clones are appended to the other	elements.
			
		@returns {glow.NodeList} The replaced elements
			Call {@link glow.NodeList#destroy destroy} on these if you
			no longer need them.
	*/
	NodeListProto.replaceWith = function(elements) {
		return this.after(elements).remove();
	};
	
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
	// get first child element node of an element, otherwise undefined
	function getFirstChildElm(parent) {					
		for (var child = parent.firstChild; child; child = child.nextSibling) {
			if (child.nodeType == 1) {
				return child;
			}			
		}			
		return undefined;			
	}
	
	NodeListProto.wrap = function(wrapper) {
		// normalise input
		wrapper = new glow.NodeList(wrapper);
		
		// escape if the wraper is non-existant or not an element
		if (!wrapper[0] || wrapper[0].nodeType != 1) {
			return this;
		}
		
		var toWrap,
			toWrapTarget,
			firstChildElm;
		
		for (var i = 0, leni = this.length; i<leni; i++) {
			toWrap = this[i];
			// get target element to insert toWrap in
			toWrapTarget = wrapper[0];
			
			while (toWrapTarget) {
				firstChildElm = getFirstChildElm(toWrapTarget);
					
				if (!firstChildElm) {
					break;
				}
				toWrapTarget = firstChildElm;
			}
			
			if (toWrap.parentNode) {						
				wrapper.insertBefore(toWrap);													
			}
			
			// If wrapping multiple nodes, we need to take a clean copy of the wrapping nodes
			if (i != leni-1) {
				wrapper = wrapper.clone();
			}
			
			toWrapTarget.appendChild(toWrap);
		}
		
		return this;
	};
	
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
	NodeListProto.unwrap = function() {
		var parentToRemove,
			childNodes,
			// get unique parents
			parentsToRemove = this.parent();
		
		for (var i = 0, leni = parentsToRemove.length; i < leni; i++) {				
			parentToRemove = parentsToRemove.slice(i, i+1);
			// make sure we get all children, including text nodes
			childNodes = new glow.NodeList( parentToRemove[0].childNodes );
			
			// if the item we're removing has no new parent (i.e. is not in document), then we just remove the child and destroy the old parent
			if (!parentToRemove[0].parentNode){
				childNodes.remove();
				parentToRemove.destroy();
			}
			else {
				childNodes.insertBefore(parentToRemove);
				parentToRemove.destroy();							
			}
		}
		return this;
	};
	
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
		var nodes = [],
			i = this.length;
		
		while (i--) {
			nodes[i] = this[i].cloneNode(true);
			
			glow.events._copyEvent(this[i], nodes[i]);
			glow.NodeList._copyData(this[i], nodes[i]);
			
		}
		
		return new glow.NodeList(nodes);
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
	NodeListProto.copy = function() {
		var nodes = [],
			i = this.length;
		
		while (i--) {
			nodes[i] = this[i].cloneNode(true);
		}
		
		return new glow.NodeList(nodes);
	};
	
	/**
		@name glow.NodeList#html
		@function
		@description Gets / sets HTML content
			Either gets content of the first element, or sets the content
			for all elements in the list
			
		@param {String} [htmlString] String to set as the HTML of elements
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
	NodeListProto.html = function(htmlString) {
		// getting
		if (!arguments.length) {
			return this[0] ? this[0].innerHTML : '';
		}
		
		// setting
		var i = this.length,
			node;
		
		// normalise the string
		htmlString = htmlString ? String(htmlString): '';
		
		while (i--) {
			node = this[i];
			if (node.nodeType == 1) {
				try {
					// this has a habit of failing in IE for some elements
					node.innerHTML = htmlString;
				}
				catch (e) {
					new glow.NodeList(node).empty().append(htmlString);
				}
			}
		}
		
		return this;
	};
	
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
	NodeListProto.text = function(textString) {
		var firstNode = this[0],
			i = this.length,
			node;
		
		// getting
		if (!arguments.length) {
			// get the text by checking a load of properties in priority order
			return firstNode ?
				firstNode.textContent ||
				firstNode.innerText ||
				firstNode.nodeValue || '' // nodeValue for comment & text nodes
				: '';
		}
		
		// setting
		// normalise the string
		textString = textString ? String(textString): '';
		
		this.empty();
		while (i--) {
			node = this[i];
			if (node.nodeType == 1) {
				node.appendChild( document.createTextNode(textString) );
			}
			else {
				node.nodeValue = textString;
			}
		}
		
		return this;
	};
});