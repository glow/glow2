Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype;
	
	/**
		@name glow.NodeList#parent
		@function
		@description Gets the unique parent nodes of each node as a new NodeList.
		The given nodelist will always be placed in the first element with no child elements.

		@returns {glow.dom.NodeList}

			Returns a new NodeList containing the parent nodes, with
			duplicates removed

		@example
			// elements which contain links
			var parents = glow.dom.get("a").parent();
	*/
	NodeListProto.parent = function() {
		var ret = [],
			ri = 0,
			i = 0,
			length = this.length;

			while (i < length) {
				if(this[i].parentNode && this[i].parentNode.nodeType == 1){
					ret[ri++] = this[i].parentNode;
				}
			i++;
			}
				
			return new glow.NodeList(glow._sizzle.uniqueSort(ret));
			
			
			
	};
	
	/*
		PrivateMethod: getNextOrPrev
			This gets the next / previous sibling element of each node in a nodeset
			and returns the new nodeset.
	*/
	function getNextOrPrev(nodelist, dir /* "next" or "previous" */) {
		var ret = [],
			ri = 0,
			nextTmp,
			i = 0,
			length = nodelist.length;

		while (i < length) {
			nextTmp = nodelist[i];
			while (nextTmp = nextTmp[dir + "Sibling"]) {
				if (nextTmp.nodeType == 1 && nextTmp.nodeName != "!") {
					ret[ri++] = nextTmp;
					break;
				}
			}
		i++;
		}
		return new glow.NodeList(ret);
	}
	
	/**
		@name glow.ElementList#prev
		@function
		@description Gets the previous sibling element for each node in the ElementList.
			If a filter is provided, the previous item that matches the filter is returned, or
			none if no match is found.
		@param {Function|string} [filter] Filter test
			If a string is provided, it is used in a call to {@link glow.ElementList#is ElementList#is}.
			If a function is provided it will be passed 2 arguments, the index of the current item,
			and the ElementList being itterated over.
			Inside the function 'this' refers to the HTMLElement.
			Return true to keep the node, or false to remove it.
		@returns {glow.ElementList}
			A new ElementList containing the previous sibling elements that match the (optional)
			filter.
		@example
			// gets the element before #myLink (if there is one)
			var next = glow.get("#myLink").prev();
		@example
			// get the previous sibling link element before #skipLink
			glow.get('#skipLink').prev('a')
	*/
	NodeListProto.prev = function(filter) {
		return getNextOrPrev(this, "previous");
	};
	
	/**
		@name glow.ElementList#next
		@function
		@description Gets the next sibling element for each node in the ElementList.
			If a filter is provided, the next item that matches the filter is returned, or
			none if no match is found.
		@param {Function|string} [filter] Filter test
			If a string is provided, it is used in a call to {@link glow.ElementList#is ElementList#is}.
			If a function is provided it will be passed 2 arguments, the index of the current item,
			and the ElementList being itterated over.
			Inside the function 'this' refers to the HTMLElement.
			Return true to keep the node, or false to remove it.
		@returns {glow.ElementList}
			A new ElementList containing the next sibling elements that match the (optional)
			filter.
		@example
			// gets the element following #myLink (if there is one)
			var next = glow.get("#myLink").next();
		@example
			// get the next sibling link element after #skipLink
			glow.get('#skipLink').next('a')
	*/
	NodeListProto.next = function(filter) {
		return getNextOrPrev(this, "next");	
	};
	
	
	/**
	@name glow.NodeList#get
	@function
	@description Gets decendents of nodes that match a CSS selector.

	@param {String} selector CSS selector

	@returns {glow.NodeList}
		Returns a new NodeList containing matched elements

	@example
		// create a new NodeList
		var myNodeList = glow.dom.create("<div><a href='s.html'>Link</a></div>");

		// get 'a' tags that are decendants of the NodeList nodes
		myNewNodeList = myNodeList.get("a");
	*/
	NodeListProto.get = function(selector) {
		var ret = new glow.NodeList(),
			i = 0,
			length = this.length;
		
		while (i < length) {					
			ret.push(glow._sizzle(selector, this[i]));
			i++;
		}
		return new glow.NodeList(ret);
	};
	
	
	
	/**
		@name glow.dom.NodeList#ancestors
		@function
		@description Gets the unique ancestor nodes of each node as a new NodeList.
		@param {Function|string} [filter] Filter test
			If a string is provided, it is used in a call to {@link glow.ElementList#is ElementList#is}.
			If a function is provided it will be passed 2 arguments, the index of the current item,
			and the ElementList being itterated over.
			Inside the function 'this' refers to the HTMLElement.
			Return true to keep the node, or false to remove it.
		@returns {glow.dom.NodeList}
			Returns NodeList

			@example
			// get ancestor elements for anchor elements 
			var ancestors = glow.dom.get("a").ancestors();
	*/
	NodeListProto.ancestors = function(filter) {
		var ret = [],
			ri = 0,
			i = 0,
			length = this.length,
			elm;
					
		while (i < length) {
			elm = this[i].parentNode;
					
			while (elm && elm.nodeType == 1) {							
					ret[ri++] = elm;
					elm = elm.parentNode;
			}								
			i++;
		}
		if(filter){
			ret.filter(filter);
		}
		return new glow.NodeList(glow._sizzle.uniqueSort(ret));
	};
	
	/*
			Get the child elements for an html node
		*/
		function getChildElms(node) {
			var r = [],
				childNodes = node.childNodes,
				i = 0,
				ri = 0;
			
			for (; childNodes[i]; i++) {
				if (childNodes[i].nodeType == 1 && childNodes[i].nodeName != "!") {
					r[ri++] = childNodes[i];
				}
			}
			return r;
		}
	
	/**
		@name glow.dom.NodeList#children
		@function
		@description Gets the child elements of each node as a new NodeList.

		@returns {glow.dom.NodeList}

			Returns a new NodeList containing all the child nodes
				
		@example
			// get all list items
			var items = glow.dom.get("ul, ol").children();
	*/
	NodeListProto.children = function() {
		var ret = [],
			ri = 0,
			i = 0,
			n = 0,
			length = this.length,
			childTmp;
				
			for (; i < length; i++) {
				ret = ret.concat( getChildElms(this[i]) );
			}
		return new glow.NodeList(ret);	
	};
	
	/**
		@name glow.NodeList#contains
		@function
		@description Find if a NodeList contains the given element
		
		@param {string | Object} Element to check for
		
		
			If value is omitted, the value for the given property will be returned
			
		@returns {glow.dom.NodeList}

			Returns a new NodeList containing all the child nodes
	*/
	NodeListProto.contains = function(element) {
		
		return false;
		
	};
		

	
});