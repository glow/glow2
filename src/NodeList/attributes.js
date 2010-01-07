Glow.provide(function(glow) {
	var undef,
		NodeListProto = glow.NodeList.prototype
	
	/**
		@private
		@name glow.NodeList-dom0PropertyMapping
		@description Mapping of HTML attribute names to DOM0 property names.
	*/
	, dom0PropertyMapping = { // keys must be lowercase
		'class'     : 'className',
		'for'       : 'htmlFor',
		'maxlength' : 'maxLength'
	}
	
	/**
		@private
		@name glow.NodeList-dataPropName
		@type String
		@description The property name added to the DomElement by the NodeList#data method.
	*/
	, dataPropName = '_uniqueData' + glow.UID
	
	/**
		@private
		@name glow.NodeList-dataIndex
		@type String
		@description The value of the dataPropName added by the NodeList#data method.
	*/
	, dataIndex = 1 // must be a truthy value
		
	/**
		@private
		@name glow.NodeList-dataCache
		@type Object
		@description Holds the data used by the NodeList#data method.
		
		The structure is like:
		[
			{
				myKey: "my data"
			}
		]
	*/
	, dataCache = [];
			
	/**
	@name glow.NodeList#addClass
	@function
	@description Adds a class to each node.

	@param {string} name The name of the class to add.

	@returns {glow.NodeList}

	@example
		glow("#login a").addClass("highlight");
	*/
	NodeListProto.addClass = function(name) {
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#addClass() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#addClass() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		for (var i = 0, leni = this.length; i < leni; i++) {
			if (this[i].nodeType === 1) {
				_addClass(this[i], name);
			}
		}
		
		return this;
	};
	
	function _addClass(el, name) { // TODO: handle classnames separated by non-space characters?
		if ((' ' + el.className + ' ').indexOf(' ' + name + ' ') === -1) {
			el.className += ((el.className)? ' ' : '') + name;
		}
	}
	
	/**
	@name glow.NodeList#attr
	@function
	@description Gets or sets attributes.

		When getting an attribute, it is retrieved from the first
		node in this NodeList. Setting attributes applies the change
		to each element in this NodeList.

		To set an attribute, pass in the name as the first
		parameter and the value as a second parameter.

		To set multiple attributes in one call, pass in an object of
		name/value pairs as a single parameter.

		For browsers that don't support manipulating attributes
		using the DOM, this method will try to do the right thing
		(i.e. don't expect the semantics of this method to be
		consistent across browsers as this is not possible with
		currently supported browsers).

	@param {string | Object} name The name of the attribute, or an object of name/value pairs
	@param {string} [value] The value to set the attribute to.

	@returns {string | undefined | glow.NodeList}

		When setting attributes this method returns its own NodeList, otherwise
		returns the attribute value. The attribute name is always treated as
		case-insensitive. When getting, the returned value will be of type string unless
		that particular attribute was never set and there is no default value, in which
		case the returned value will be an empty string.

	@example
		var myNodeList = glow(".myImgClass");

		// get an attribute
		myNodeList.attr("class");

		// set an attribute
		myNodeList.attr("class", "anotherImgClass");

		// set multiple attributes
		myNodeList.attr({
		  src: "a.png",
		  alt: "Cat jumping through a field"
		});
	 */
	 // see: http://tobielangel.com/2007/1/11/attribute-nightmare-in-ie/
	NodeListProto.attr = function(/*arguments*/) {
		var args = arguments,
			argsLen = arguments.length,
			thisLen = this.length,
			name = keyvals = args[0], // using this API: attr(name) or attr({key: val}) ?
			dom0Property = '',
			el,
			node;
		
		/*!debug*/
			if (arguments.length === 2 && typeof arguments[0] !== 'string') { throw new Error('Method NodeList#attr(name, value) expects name to be of type string.'); }
			if (arguments.length === 1 && (typeof arguments[0] !== 'string' && arguments[0].constructor !== Object)) { throw new Error('Method NodeList#attr() expects argument1 to be of type string or an instance of Object.'); }
			if (arguments.length === 0 ||  arguments.length > 2) { throw new Error('Method NodeList#attr() expects 1 or 2 arguments.'); }
		/*gubed!*/
		
		if (this.length === 0) { // is this an empty nodelist?
			return (argsLen > 1)? this : undef;
		}
		
		if (typeof keyvals === 'object') {
			for (name in keyvals) { // SETting value from {name: value} object
				if (!keyvals.hasOwnProperty(name)) { continue; }
				
				// in IE6 and IE7 the attribute name needs to be translated into dom property name
				if (glow.env.ie < 8) {
					dom0Property = dom0PropertyMapping[name.toLowerCase()];
				}
				
				var i = thisLen;
				while (i--) {
					el = this[i];
					
					if (el.nodeType === 1) {
						if (dom0Property) {
							el[dom0Property] = keyvals[name];
						}
						else {
							el.setAttribute(name, keyvals[name], 0); // IE flags, 0: case-insensitive
						}
					}
				}
			}
			
			return this;
		}
		else {
			el = this[0];
				
			if (el.nodeType !== 1) { 
				return (argsLen > 1)? this : undef;
			}

			if (argsLen === 1) { // GETting value from name
				if (el.attributes[name]) { // in IE el.getAttributeNode sometimes returns unspecified default values so we look for specified attributes if we can
					return (!el.attributes[name].specified)? '' : el.attributes[name].value;
				}
				else if (el.getAttributeNode) { // in IE getAttribute() does not always work so we use getAttributeNode if we can
					node = el.getAttributeNode(name, 0);
					return (node === null)? '' : node.value;
				}
				else {
					value = el.getAttribute(name, 0, 2); // IE flags, 0: case-insensitive, 2: as string
					return (value === null)? '' : value;
				}	
			}
			else { // SETting a single value like attr(name, value), normalize to an keyval object
				if (glow.env.ie < 8) {
					dom0Property = dom0PropertyMapping[name.toLowerCase()] || '';
				}
				
				if (dom0Property !== '') {
					el[dom0Property] = args[1];
				}
				else {
					el.setAttribute(name, args[1], 0); // IE flags, 0: case-insensitive
				}
				return this;
			}
		}
	};
		
	/**
	@name glow.NodeList#data
	@function
	@description Use this to safely attach arbitrary data to any DOM Element.
	
	This method is useful when you wish to avoid memory leaks that are possible when adding your own data directly to DOM Elements.
	
	When called with no arguments, will return glow's entire data store for the first node in this NodeList.
	
	Otherwise, when given a name, will return the associated value from the first node in this NodeList.
	
	When given both a name and a value, will store that data on every node in this NodeList.
	
	Optionally you can pass in a single object composed of multiple name, value pairs.
	
	@param {string|Object} [key] The name of the value in glow's data store.
	@param {Object} [value] The the value you wish to associate with the given name.
	@see glow.NodeList#removeData
	@example
	
	glow("p").data("tea", "milky");
	var colour = glow("p").data("tea"); // milky
	@returns {Object} When setting a value this method can be chained, as in that case it will return itself.
	@see glow.NodeList#removeData
	*/
	NodeListProto.data = function (key, val) { /*debug*///console.log("data("+key+", "+val+")");
		var args = arguments;
		
		/*!debug*/
			if (arguments.length === 2 && typeof arguments[0] !== 'string') { throw new Error('Method NodeList#data(name, value) expects name to be of type string.'); }
			if (arguments.length === 1 && (typeof arguments[0] !== 'string' && arguments[0].constructor !== Object)) { throw new Error('Method NodeList#data() expects argument1 to be of type string or an instance of Object.'); }
			if (arguments.length > 2) { throw new Error('Method NodeList#data() expects 0, 1 or 2 arguments.'); }
		/*gubed!*/
		
		if (typeof key === 'object') { // setting many values
			for (var prop in key) { this.data(prop, key[prop]); }
			return this; // chainable with ({key: val}) signature
		}
		
		var index,
			elm;
			// uses private scoped variables: dataCache, dataPropName, dataIndex
		
		switch (args.length) {
			case 0: // getting entire cache from first node
				if (this[0] === undef) { return undef; }
				index = this[0][dataPropName] || dataIndex++;
				return dataCache[index] || (dataCache[index] = {}); // create a new cache when reading entire cache
			case 1:  // getting val from first node
				if (this[0] === undef) { return undef; }
				index = this[0][dataPropName]; // don't create a new cache when reading just a specific val
				return index? dataCache[index][key] : undef;
			case 2: // setting key:val on every node
				// TODO - need to defend against reserved words being used as keys?
				for (var i = this.length; i--;) {
					elm = this[i];
					if (elm.nodeType !== 1) { continue; }
					
					if ( !(index = elm[dataPropName]) ) { // assumes index is always > 0
						index = dataIndex++;
						
						elm[dataPropName] = index;
						dataCache[index] = {};
					}
					dataCache[index][key] = val;
				}
				
				return this; // chainable with (key, val) signature
		}
	};
	
	/**
	@name glow.NodeList#hasAttr
	@function
	@description Does the node have a particular attribute?
		
		The first node in this NodeList is tested.
		
	@param {string} name The name of the attribute to test for.

	@returns {boolean|undefined} Returns undefined if the first node is not an element,
	or if the NodeList is empty, otherwise returns true/false to indicate if that attribute exists
	on the first element.

	@example
		if ( glow("#myImg").hasAttr("alt") ){
			// ...
		}
	*/
	NodeListProto.hasAttr = function(name) {
		var el;
		
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#hasAttr() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#hasAttr() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		el = this[0];
		
		if (this.length && el.nodeType === 1) {
			if (el.attributes[name]) { // is an object in  IE, or else: undefined in IE < 8, null in IE 8
				return !!el.attributes[name].specified;
			}
			
			if (el.hasAttribute) { return el.hasAttribute(name); } // like FF, Safari, etc
			else { return el.attributes[name] !== undef; } // like IE7
		}
	};
	
	/**
	@name glow.NodeList#hasClass
	@function
	@description Does the node have a particular class?

		The first node in this NodeList is tested.

	@param {string} name The name of the class to test for.

	@returns {boolean}

	@example
		if ( glow("#myInput").hasClass("errored") ){
			// ...
		}
	*/
	NodeListProto.hasClass = function (name) {
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#hasClass() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#hasClass() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		if (this.length && this[0].nodeType === 1) {
			return ( (' ' + this[0].className + ' ').indexOf(' ' + name + ' ') > -1 );
		}
	};
	
	/**
	@name glow.NodeList#prop
	@function
	@description Gets or sets node properties.
	
		This function gets / sets node properties, to get attributes,
		see {@link glow.NodeList#attr NodeList#attr}.
		
		When getting a property, it is retrieved from the first
		node in this NodeList. Setting properties to each element in
		this NodeList.
		
		To set multiple properties in one call, pass in an object of
		name/value pairs.
		
	@param {string | Object} name The name of the property, or an object of name/value pairs
	@param {string} [value] The value to set the property to.

	@returns {string | glow.NodeList}

		When setting properties it returns the NodeList, otherwise
		returns the property value.

	@example
		var myNodeList = glow("#formElement");

		// get the node name
		myNodeList.prop("nodeName");

		// set a property
		myNodeList.prop("_secretValue", 10);

		// set multiple properties
		myNodeList.prop({
			checked: true,
			_secretValue: 10
		});
	*/
	NodeListProto.prop = function(name, val) {
		var hash = name,
			argsLen = arguments.length;
		
		/*!debug*/
			if (arguments.length === 1 && (typeof name !== 'string' && name.constructor !== Object)) { throw new Error('Method NodeList#prop(arg1) expects argument 1 to be of type string or an instance of Object.'); }
			if (arguments.length === 2 && typeof name !== 'string') { throw new Error('Method NodeList#prop(name) expects name to be of type string.'); }
			if (arguments.length === 0 || arguments.length > 2) { throw new Error('Method NodeList#prop() expects 1 or 2 arguments.'); }
		/*gubed!*/
		
		if (this.length === 0) return;
		
		if (argsLen === 2 && typeof name === 'string') {
			for (var i = 0, ilen = this.length; i < ilen; i++) {
				if (this[i].nodeType === 1) { this[i][name] = val; }
			}
			return this;
		}
		else if (argsLen === 1 && hash.constructor === Object) {
			for (var key in hash) {
				for (var i = 0, ilen = this.length; i < ilen; i++) {
					if (this[i].nodeType === 1) { this[i][key] = hash[key]; }
				}
			}
			return this;
		}
		else if (argsLen === 1 && typeof name === 'string') {
			if (this[0].nodeType === 1) { return this[0][name]; }
		}
		else {
			throw new Error('Invalid parameters.');
		}
	};
	
	/**
	@name glow.NodeList#removeAttr
	@function
	@description Removes an attribute from each node.

	@param {string} name The name of the attribute to remove.

	@returns {glow.NodeList}

	@example
		glow("a").removeAttr("target");
	*/
	NodeListProto.removeAttr = function (name) {
		var dom0Property;
		
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#removeAttr() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#removeAttr() expects argument 1 to be of type string.'); }
		/*gubed!*/
	
		for (var i = 0, leni = this.length; i < leni; i++) {
			if (this[i].nodeType === 1) {
				if (glow.env.ie < 8) {
					if ( (dom0Property = dom0PropertyMapping[name.toLowerCase()]) ) {
						this[i][dom0Property] = '';
					}
				}
				
				if (this[i].removeAttribute) this[i].removeAttribute(name);
			}
		}
		return this;
	};
	
	/**
	@name glow.NodeList#removeClass
	@function
	@description Removes a class from each node.

	@param {string} name The name of the class to remove.

	@returns {glow.NodeList}

	@example
		glow("#footer #login a").removeClass("highlight");
	*/
	NodeListProto.removeClass = function(name) {
		var oldClasses = [],
			newClasses = [];
		
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#removeClass() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#removeClass() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		for (var i = 0, leni = this.length; i < leni; i++) {
			_removeClass(this[i], name)
		}
		return this;
	};
	
	function _removeClass(HtmlElement, name) {
		var oldClasses = (HtmlElement.className||'').split(' '),
			newClasses = [];
			
		for (var i = 0, leni = oldClasses.length; i < leni; i++) {
			if (oldClasses[i] && oldClasses[i] !== name) {
				newClasses.push(oldClasses[i]);
			}
		}
		HtmlElement.className = (newClasses.length)? newClasses.join(' ') : '';
	}
	
	/**
	@name glow.NodeList#removeData
	@function
	@description Removes data previously added by {@link glow.NodeList#data} from each node in this NodeList.
	
	When called with no arguments, will delete glow's entire data store for each node in this NodeList.
	
	Otherwise, when given a name, will delete the associated value from each node in this NodeList.
	
	@param {string} [key] The name of the value in glow's data store.
	@see glow.NodeList#data
	*/
	NodeListProto.removeData = function(key) {
		var elm,
			i = this.length,
			index;
			// uses private scoped variables: dataCache, dataPropName
		
		/*!debug*/
			if (arguments.length > 1) { throw new Error('Method NodeList#removeData() expects 0 or 1 arguments.'); }
			if (arguments.length === 1 && typeof arguments[0] !== 'string') { throw new Error('Method NodeList#removeData() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		while (i--) {
			elm = this[i];
			index = elm[dataPropName];
			
			if (index !== undef) {
				switch (arguments.length) {
					case 0:
						dataCache[index] = undef;
						elm[dataPropName] = undef;
						try {
							delete elm[dataPropName]; // IE 6 goes wobbly here
						}
						catch(e) { // remove expando from IE 6
							elm.removeAttribute && elm.removeAttribute(dataPropName);
						}
						break;
					case 1:
						dataCache[index][key] = undef;
						delete dataCache[index][key];
						break;
				}
			}
		}
		
		return this; // chainable
	};
	
	/**
	@name glow.NodeList#toggleClass
	@function
	@description Toggles a class on each node.

	@param {string} name The name of the class to toggle.

	@returns {glow.NodeList}

	@example
		glow(".onOffSwitch").toggleClass("on");
	 */
	NodeListProto.toggleClass = function(name) {
		/*!debug*/
			if (arguments.length !== 1) { throw new Error('Method NodeList#toggleClass() expects 1 argument.'); }
			if (typeof arguments[0] !== 'string') { throw new Error('Method NodeList#toggleClass() expects argument 1 to be of type string.'); }
		/*gubed!*/
		
		for (var i = 0, leni = this.length; i < leni; i++) {
			if (this[i].nodeType === 1) {
				if ( (' ' + this[i].className + ' ').indexOf(' ' + name + ' ') > -1 ) {
					_removeClass(this[i], name);
				}
				else {
					_addClass(this[i], name);
				}
			}
		}
		
		return this;
	};
});