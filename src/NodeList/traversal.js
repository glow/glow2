Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype
	/*
		PrivateVar: ucheck
			Used by unique(), increased by 1 on each use
		*/
		,	ucheck = 1
	/*
		PrivateVar: ucheckPropName
			This is the property name used by unique checks
		*/

	, ucheckPropName = "_unique" + glow.UID;
	/*
		PrivateMethod: unique
			Get an array of nodes without duplicate nodes from an array of nodes.

		Arguments:
			aNodes - (Array|<NodeList>)

		Returns:
			An array of nodes without duplicates.
		*/
		//worth checking if it's an XML document?
		if (glow.env.ie) {
			var unique = function(aNodes) {
				if (aNodes.length == 1) { return aNodes; }

				//remove duplicates
				var r = [],
					ri = 0,
					i = 0;

				for (; aNodes[i]; i++) {
					if (aNodes[i].getAttribute(ucheckPropName) != ucheck && aNodes[i].nodeType == 1) {
						r[ri++] = aNodes[i];
					}
					aNodes[i].setAttribute(ucheckPropName, ucheck);
				}
				for (i=0; aNodes[i]; i++) {
					aNodes[i].removeAttribute(ucheckPropName);
				}
				ucheck++;
				return r;
			}
		} else {
			var unique = function(aNodes) {
				if (aNodes.length == 1) { return aNodes; }

				//remove duplicates
				var r = [],
					ri = 0,
					i = 0;

				for (; aNodes[i]; i++) {
					if (aNodes[i][ucheckPropName] != ucheck && aNodes[i].nodeType == 1) {
						r[ri++] = aNodes[i];
					}
					aNodes[i][ucheckPropName] = ucheck;
				}
				ucheck++;
				return r;
			}
		};
	/**
	@name glow.NodeList#parent
	@function
	@description Gets the unique parent nodes of each node as a new NodeList.
	@param {string | HTMLElement | NodeList} [search] Search value
		If provided, will seek the next parent element until a match is found
	@returns {glow.NodeList}

		Returns a new NodeList containing the parent nodes, with
		duplicates removed

	@example
		// elements which contain links
		var parents = glow.dom.get("a").parent();
	*/
	NodeListProto.parent = function(search) {
		var ret = [],
			ri = 0,
			i = this.length,
			node;
			
		while (i--) {				
			node = this[i];
			if (node.nodeType == 1) {
				if(search){						
					while(node = node.parentNode){											
						if (glow._sizzle.filter(search, [node]).length) {
							ret[ri++] = node;							
							break;
						}							
					}
				}
			
				else if(node = node.parentNode){
						ret[ri++] = node;						
				}

			}

		}
				
		return new glow.NodeList(unique(ret));			
	};
	
	/* Private method for prev() and next() */
	function getNextOrPrev(nodelist, dir, search) {
		var ret = [],
			ri = 0,
			node,
			i = 0,
			length = nodelist.length;

		while (i < length) {			
			node = nodelist[i];			
			if(search){
				while (node = node[dir + 'Sibling']) {					
					if (node.nodeType == 1 && node.nodeName != '!') {						
						if (glow._sizzle.filter(search, [node]).length) {
							ret[ri++] = node;							
							break;
						}					
					}					
				}
			}
			else{
				while (node = node[dir + 'Sibling']) {					
					if (node.nodeType == 1 && node.nodeName != '!') {
							ret[ri++] = node;							
							 break;					
					}					
				}	
			}
		i++;
		}
		return new glow.NodeList(ret);
	}
	
	/**
	@name glow.NodeList#prev
	@function
	@description Gets the previous sibling element for each node in the ElementList.
		If a filter is provided, the previous item that matches the filter is returned, or
		none if no match is found.
	@param {string | HTMLElement | NodeList} [search] Search value
		If provided, will seek the previous sibling element until a match is found
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
	NodeListProto.prev = function(search) {
		return getNextOrPrev(this, 'previous', search);
	};
	
	/**
	@name glow.NodeList#next
	@function
	@description Gets the next sibling element for each node in the ElementList.
		If a filter is provided, the next item that matches the filter is returned, or
		none if no match is found.
	@param {string | HTMLElement | NodeList} [search] Search value
		If provided, will seek the next sibling element until a match is found
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
	NodeListProto.next = function(search) {
		return getNextOrPrev(this, 'next', search);	
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
		var ret = [],
			i = this.length;

		while (i--) {			
			glow._sizzle(selector, this[i], ret);
			
		}
		// need to remove uniqueSorts because they're slow. Replace with own method for unique.
		return new glow.NodeList(unique(ret));
	};
	
	
	
	/**
	@name glow.NodeList#ancestors
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
			node;
					
		while (i < length) {
			node = this[i].parentNode;
					
			while (node && node.nodeType == 1) {							
				ret[ri++] = node;
				node = node.parentNode;
			}								
		i++;
		}
		if(filter){
            ret = new glow.NodeList(ret);
			ret = ret.filter(filter);
		}
		return new glow.NodeList(unique(ret));
	};
	
	/*
		Private method to get the child elements for an html node (used by children())
	*/
		function getChildElms(node) {
			var r = [],
				childNodes = node.childNodes,
				i = 0,
				ri = 0;
			
			for (; childNodes[i]; i++) {
				if (childNodes[i].nodeType == 1 && childNodes[i].nodeName != '!') {
					r[ri++] = childNodes[i];
				}
			}
			return r;
		}
	
	/**
	@name glow.NodeList#children
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
			i = this.length;
				
		while(i--) {
			ret = ret.concat( getChildElms(this[i]) );
		}
		return new glow.NodeList(ret);	
	};
	
	/**
	@name glow.NodeList#contains
	@function
	@description Find if this NodeList contains the given element
		
	@param {string | HTMLELement | NodeList} Single element to check for

	@returns {boolean}
		myElementList.contains(elm)
		// Returns true if an element in myElementList contains elm, or IS elm.
	*/
	NodeListProto.contains = function(elm) {
		var i = 0,
			node = new glow.NodeList(elm)[0],
			length = this.length,
			newNodes,
			toTest;

		// missing some nodes? Return false
		if ( !node || !this.length ) {
			return false;
		}
	
		if (this[0].compareDocumentPosition) { //w3 method
			while (i < length) {
				//break out if the two are teh same
				if(this[i] == node){
					break;
				}
				//check against bitwise to see if node is contained in this
				else if (!(this[i].compareDocumentPosition(node) & 16)) {								
					return false;
				}
			i++;
			}
		}
		else if(node.contains){					
			for (; i < length; i++) {
				if ( !( this[i].contains( node  ) ) ) {
					return false;
				}
			}
		}				
		else { //manual method for last chance corale
			while (i < length) {
				toTest = node;
				while (toTest = toTest.parentNode) {
					if (this[i] == toTest) { break; }
				}
				if (!toTest) {
					return false;
				}
			i++;
			}
		}
			
		return true;
	};
});