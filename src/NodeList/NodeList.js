Glow.provide(function(glow) {
	var NodeListProto, undefined,
		// shortcuts to aid compression
		document = window.document,
		arraySlice = Array.prototype.slice,
		arrayPush = Array.prototype.push;
	
	/**
		@name glow.NodeList
		@constructor
		@description An array-like collection of DOM Nodes
			It is recommended to create an NodeList using {@link glow},
			but you can also use this constructor.
			
		@param {string | glow.NodeList | Node | Node[]} contents Items to populate the NodeList with.
			This parameter will be passed to {@link glow.NodeList#push}
			
		@example
			// empty NodeList
			var myNodeList = new glow.NodeList();

		@example
			// using glow to return a NodeList then chaining methods
			glow("p").addClass("eg").append("<b>Hello!</b>");
		
		@see <a href="../furtherinfo/creatingnodelists/">Creating NodeLists</a>
		@see <a href="../furtherinfo/workingwithnodelists/">Working with NodeLists</a>
		@see {@link glow.XmlNodeList XmlNodeList} - An XML-specific NodeList
	*/
	function NodeList(contents) {
		// call push if we've been given stuff to add
		contents && this.push(contents);
	}
	NodeListProto = NodeList.prototype;
	
	/**
		@name glow.NodeList#length
		@type Number
		@description Number of nodes in the NodeList
		@example
			// get the number of paragraphs on the page
			glow('p').length;
	*/
	NodeListProto.length = 0;
	
	/**
		@name glow.NodeList#_strToNodes
		@private
		@function
		@description Converts a string to an array of nodes
		
		@param {string} str HTML string
		
		@returns {Node[]} Array of nodes (including text / comment nodes)
	*/
	NodeListProto._strToNodes = (function() {
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
				option: [1, '<select multiple="multiple">', '</select>'],
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
				exceptTbody,
				rLen = 0,
				firstChild;
			
			// Create the new element using the node tree contents available in filteredElm.
			childElm.innerHTML = (wrap[1] + str + wrap[2]);
			
			// Strip newElement down to just the required elements' parent
			while(nodeDepth--) {
				childElm = childElm.lastChild;
			}
			
			// pull nodes out of child
			if (wrap == tableWrap && str.indexOf('<tbody') == -1) {
				// IE7 (and earlier) sometimes gives us a <tbody> even though we didn't ask for one
				while (firstChild = childElm.firstChild) {
					if (firstChild.nodeName != 'TBODY') {
						r[rLen++] = firstChild;
					}
					childElm.removeChild(firstChild);
				}
			} else {
				while (firstChild = childElm.firstChild) {
					r[rLen++] = childElm.removeChild(firstChild);
				}
			}
			
			return r;
		}
		
		return strToNodes;
	})();
	
	// takes a collection and returns an array
	var collectionToArray = function(collection) {
		return arraySlice.call(collection, 0);
	};
	
	try {
		// look out for an IE bug
		arraySlice.call( document.documentElement.childNodes, 0 );
	}
	catch(e) {
		collectionToArray = function(collection) {
			// We can't use this trick on IE collections that are com-based, like HTMLCollections
			// Thankfully they don't have a constructor, so that's how we detect those
			if (collection instanceof Object) {
				return arraySlice.call(collection, 0);
			}
			var i   = collection.length,
				arr = [];
				
			while (i--) {
				arr[i] = collection[i];
			}
			return arr;
		}
	}
	
	/**
		@name glow.NodeList#push
		@function
		@description Adds nodes to the NodeList
		
		@param {string | Node | Node[] | glow.NodeList} nodes Node(s) to add to the NodeList
			Strings will be treated as CSS selectors / HTML strings.
		
		@returns {glow.NodeList}
		
		@example
			myNodeList.push('<div>Foo</div>').push('h1');
	*/
	NodeListProto.push = function(nodes) {
		if (typeof nodes == 'string') {
			// if the string begins <, treat it as html, otherwise it's a selector
			if (nodes.charAt(0) == '<') {
				nodes = this._strToNodes(nodes);
			} else {
				nodes = glow._sizzle(nodes)
			}
			arrayPush.apply(this, nodes);
		}
		else if (nodes.nodeType || nodes.window) {
			if (this.length) {
				arrayPush.call(this, nodes);
			} else {
				this[0] = nodes;
				this.length = 1;
			}
		}
		else if (nodes.length !== undefined) {
			if (nodes.constructor != Array) {
				// convert array-like objects into an array
				nodes = collectionToArray(nodes);
			}
			arrayPush.apply(this, nodes);
		}
		/*!debug*/
		else {
			glow.debug.warn('glow.NodeList#push: Ignoring incorrect argument type, failing silently');
		}
		/*gubed!*/

		return this;
	};
	
	/**
		@name glow.NodeList#eq
		@function
		@description Compares the NodeList to another
			Returns true if both NodeLists contain the same items in the same order
		
		@param {string | Node | Node[] | glow.NodeList} nodeList The NodeList to compare to.
			If the parameter isn't a NodeList, it'll be used to create
			a new NodeList first.
		
		@returns {boolean}
		
		@see {@link glow.NodeList#is} for testing if a NodeList item matches a selector
		
		@example
			// the following returns true
			glow('#blah').eq( document.getElementById('blah') );
	*/
	NodeListProto.eq = function(nodeList) {
		var len = this.length,
			i = len;
		
		// normalise param to NodeList
		if ( !(nodeList instanceof NodeList) ) {
			nodeList = new NodeList(nodeList);
		}
		
		// quickly return false if lengths are different
		if (len != nodeList.length) {
			return false;
		}
		
		// loop through and return false on inequality
		while (i--) {
			if (this[i] != nodeList[i]) {
				return false;
			}
		}
		
		return true;
	};
	
	/**
		@name glow.NodeList#slice
		@function
		@description Get a section of an NodeList
			Operates in the same way as a string / array's slice method
		
		@param {number} start Start index
			If negative, it specifies a position measured from the end of the list
		
		@param {number} [end] End index
			By default, this is the end of the list. A negative end specifies
			a position measured from the end of the list.
		
		@returns {glow.NodeList} A new sliced NodeList
		
		@example
		var myNodeList = glow("<div></div><p></p>");
		myNodeList.slice(1, 2); // selects the paragraph
		myNodeList.slice(-1); // same thing, selects the paragraph
	*/
	NodeListProto.slice = function(/*start, end*/) {
		return new NodeList( arraySlice.apply(this, arguments) );
	};
	
	/**
		@name glow.NodeList#sort
		@function
		@description Sort the elements in the list.
			Items will already be in document order if a CSS selector
			was used to fetch them.
		
		@param {Function} [func] Function to determine sort order
			This function will be passed 2 elements (elementA, elementB). The function
			should return a number less than 0 to sort elementA lower than elementB
			and greater than 0 to sort elementA higher than elementB.
			
			If no function is provided, elements will be sorted in document order.
		
		@returns {glow.NodeList} A new sorted NodeList
		
		@example
			//get links in alphabetical (well, lexicographical) order
			var links = glow("a").sort(function(elementA, elementB) {
				return glow(elementA).text() < glow(elementB).text() ? -1 : 1;
			})
	*/
	NodeListProto.sort = function(func) {
		var items = collectionToArray(this),
			sortedElms = func ? items.sort(func) : glow._sizzle.uniqueSort(items);
		
		return new NodeList(sortedElms);
	};
	
	/**
		@name glow.NodeList#item
		@function
		@description Get a single item from the list as an NodeList
			Negative numbers can be used to get items from the end of the
			list.
		
		@param {number} index The numeric index of the node to return.
		
		@returns {glow.NodeList} A new NodeList containing a single item
		
		@example
			// get the html from the fourth element
			myNodeList.item(3).html();
			
		@example
			// add a class name to the last item
			myNodeList.item(-1).addClass('last');
	*/
	NodeListProto.item = function(index) {
		// TODO: test which of these methods is faster (use the current one unless significantly slower)
		return this.slice(index, (index + 1) || this.length);
		// return new NodeList( index < 0 ? this[this.length + index] : this[index] );
	};
	
	/**
		@name glow.NodeList#each
		@function
		@description Calls a function for each item in the list.
		
		@param {Function} callback The function to run for each node.
			The function will be passed a single argument representing
			the index of the current item in the NodeList.
			
			Inside the function 'this' refers to the Node.
			
			Returning false from this function stops subsequent itterations
		
		@returns {glow.NodeList}
		
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
	NodeListProto.each = function(callback) {
		/*!debug*/
			if (typeof callback != 'function') {
				glow.debug.error('Incorrect param in glow.NodeList#each. Expected "function", got ' + typeof callback);
			}
		/*gubed!*/
		for (var i = 0, len = this.length; i<len; i++) {
			if ( callback.call(this[i], i, this) === false ) {
				break;
			}
		}
		return this;
	};
	
	/**
		@name glow.NodeList#filter
		@function
		@description Filter the NodeList
		 
		@param {Function|string} test Filter test
			If a string is provided, it is used in a call to {@link glow.NodeList#is NodeList#is}.
			
			If a function is provided it will be passed a single argument
			representing the index of the current item in the NodeList.
			
			Inside the function 'this' refers to the Node.
			Return true to keep the element, or false to remove it.
		 
		@returns {glow.NodeList} A new NodeList containing the filtered nodes
		 
		@example
			// return images with a width greater than 320
			glow("img").filter(function () {
				return glow(this).width() > 320;
			});
		
		@example
			// Get items that don't have an alt attribute
			myNodeList.filter(':not([href])');
	*/
	NodeListProto.filter = function(test) {
		/*!debug*/
			if ( !/^(function|string)$/.test(typeof test) ) {
				glow.debug.error('Incorrect param in glow.NodeList#filter. Expected function/string, got ' + typeof test);
			}
		/*gubed!*/
		var r = [],
			ri = 0;
		
		if (typeof test == 'string') {
			r = glow._sizzle.matches(test, this);
			
		}
		else {	
			for (var i = 0, len = this.length; i<len; i++) {
				if ( test.call(this[i], i, this) ) {
					r[ri++] = this[i];
				}
			}
		}
		
		return new NodeList(r);
	};

	
	/**
		@name glow.NodeList#is
		@function
		@description Tests if the first element matches a CSS selector

		@param {string} selector CSS selector
		
		@returns {boolean}
		
		@example
			if ( myNodeList.is(':visible') ) {
				// ...
			}
	*/
	NodeListProto.is = function(selector) {
		if ( !this[0] ) {
			return false;
		}
		return !!glow._sizzle.matches(selector, [this[0]]).length;
	};
	
	// export
	glow.NodeList = NodeList;
});