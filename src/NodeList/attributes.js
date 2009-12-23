Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype;
	
	/**
		@private
		@name glow.NodeList-dom0BooleanAttribute
		@description The HTML attributes names that should be converted from true/false
		to ATTRIBUTENAME/undefined (i.e. boolean attributes like checked="checked").
	*/
	var dom0BooleanAttribute = {
		checked  : true,
		disabled : true
	};
	
	/**
		@private
		@name glow.NodeList-dom0PropertyMapping
		@description Mapping of HTML attribute names to DOM0 property names.
	*/
	var dom0PropertyMapping = {
		checked     : 'checked',
		'class'     : 'className',
		disabled    : 'disabled',
		'for'       : 'htmlFor',
		maxlength   : 'maxLength'
	};
			
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
		for (var i = 0, leni = this.length; i < leni; i++) {
			if (this[i].nodeType !== 1) { continue; } // ignore non-elements
			
			if ((' ' + this[i].className + ' ').indexOf(' ' + name + ' ') === -1) {
				this[i].className += ((this[i].className)? ' ' : '') + name;
			}
		}
		return this;
	};
	
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
		case the returned value will be undefined.

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
	NodeListProto.attr = function(/*arguments*/) {
		var that = this,           // assist compressor
			args = arguments,      // assist compressor
			argsLen = args.length, // assist compressor
			
			keyvals = args[0],     // using this API: attr({key: val})
			
			name = args[0],        // or using this API: attr(name, value)
			value = args[1];

		if (that.length === 0) { return argsLen > 1 ? that : undefined; }
		
		// setting multiple attributes
		if (typeof keyvals === 'object') {
			for (var key in keyvals) {
				if (keyvals.hasOwnProperty(key)) { that.attr(key, keyvals[key]); } // recursive
			}
			return that;
		}
		
		// passed a name and value, setting an attribute on every node
		if (argsLen > 1) {
			// in IE6 and IE7 the attribute name needs to be translated into dom property name
			if (glow.env.ie < 8 && dom0PropertyMapping[name]) { name = dom0PropertyMapping[name]; }
			
			for (var i = 0, leni = that.length; i < leni; i++) {
				if (that[i].nodeType === 1) { that[i].setAttribute(name, value, 0); }
			}
			
			return that;
		}
		
		// getting the first node's attribute value
		if (dom0PropertyMapping[name]) { // attribute name needs to be translated into dom property name
			// in ie, 0: case-insensitive, 2: as string
			value = that[0].getAttribute(dom0PropertyMapping[name], 0, 2);
			
			if (dom0BooleanAttribute[name]) {
				return value ? name : undefined;
			}
			else if (dom0AttributeMappings[name]) {
				return dom0AttributeMappings[name](value);
			}
			
			return value;
		}
		else {
			if (glow.env.ie < 8) { // IE6 and IE7 return wrong things for undefined attribues via getAttribute()
				if (that[0].getAttributeNode(name, 0) === null) { return undefined; }
			}
			
			// in IE, 0: case-insensitive, 2: as string
			return that[0].getAttribute(name, 0, 2);
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
	
	@param {string|Object} [name] The name of the value in glow's data store.
	@param {Object} [value] The the value you wish to associate with the given name.
	@see glow.NodeList#removeData
	@example
	
	glow("p").data("tea", "milky");
	var colour = glow("p").data("tea"); // milky
	@returns {Object} When setting a value this method can be chained, as in that case it will return itself.
	*/
	NodeListProto.data = function(name, value) {
	};
	
	/**
	@name glow.NodeList#hasAttr
	@function
	@description Does the node have a particular attribute?
		
		The first node in this NodeList is tested.
		
	@param {string} name The name of the attribute to test for.

	@returns {boolean}

	@example
		if ( glow("#myImg").hasAttr("alt") ){
			// ...
		}
	*/
	NodeListProto.hasAttr = function(name) {
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
	NodeListProto.hasClass = function(name) {
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
	NodeListProto.prop = function(name, value) {
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
	NodeListProto.removeAttr = function(name) {
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
	NodeListProto.removeClass = function(name) {};
	
	/**
	@name glow.NodeList#removeData
	@function
	@description Removes data previously added by {@link glow.NodeList#data} from each node in this NodeList.
	
	When called with no arguments, will delete glow's entire data store for each node in this NodeList.
	
	Otherwise, when given a name, will delete the associated value from each node in this NodeList.
	
	@param {string} [name] The name of the value in glow's data store.
	*/
	NodeListProto.removeData = function(name) {
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
	};
});