Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype;

	/**
		@name glow.dom.NodeList#parent
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

			for (; i < length; i++) {
				ret[ri++] = this[i].parentNode;
			}
				
			return r.get(unique(ret));
	};
	/**
		@name glow.dom.NodeList#prev
		@function
		@description Gets the previous sibling element for each node as a new NodeList.

		@returns {glow.dom.NodeList}

			A new NodeList containing the previous sibling elements.

		@example
			// gets the elements before #myLink (if there is one)
			var previous = glow.dom.get("#myLink").previous();
	*/
	NodeListProto.prev = function() {
		return getNextOrPrev(this, "previous");
	};
	
	/**
		@name glow.dom.NodeList#next
		@function
		@description Gets the next sibling element for each node as a new NodeList.

		@returns {glow.dom.NodeList}

			A new NodeList containing the next sibling elements.

		@example
			// gets the element following #myLink (if there is one)
			var next = glow.dom.get("#myLink").next();
	*/
	NodeListProto.next = function(property, value) {
		return getNextOrPrev(this, "next");	
	};
	
	
	/**
	@name glow.dom.get
	@function
	@description Returns a {@link glow.dom.NodeList NodeList} from CSS selectors and/or Elements.

	@param {String | String[] | Element | Element[] | glow.dom.NodeList} nodespec+ One or more CSS selector strings, Elements or {@link glow.dom.NodeList NodeLists}.

		Will also accept arrays of these types, or any combinations thereof.

		Supported CSS selectors:

		<ul>
			<li>Universal selector "*".</li>
			<li>Type selector "div"</li>
			<li>Class selector ".myClass"</li>
			<li>ID selector "#myDiv"</li>
			<li>Child selector "ul > li"</li>
			<li>Grouping "div, p"</li>
		</ul>

	@returns {glow.dom.NodeList}

	@example
		// Nodelist with all links in element with id "nav"
		var myNodeList = glow.dom.get("#nav a");

	@example
		// NodeList containing the nodes passed in
		var myNodeList = glow.dom.get(someNode, anotherNode);

	@example
		// NodeList containing elements in the first form
		var myNodeList = glow.dom.get(document.forms[0].elements);
	*/
	NodeListProto.get = function(property, value) {};
	
	
	
	/**
		@name glow.dom.NodeList#ancestors
		@function
		@description Gets the unique ancestor nodes of each node as a new NodeList.

		@returns {glow.dom.NodeList}
			Returns NodeList

			@example
			// get ancestor elements for anchor elements 
			var ancestors = glow.dom.get("a").ancestors();
	*/
	NodeListProto.ancestors = function() {
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
				
		return r.get(unique(ret));
	};
	
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
		return r.get(ret);	
	};
	
	/**
		@name glow.NodeList#contains
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
	NodeListProto.contains = function(property, value) {};
	

	
});