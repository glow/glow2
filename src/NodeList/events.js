Glow.provide(function(glow) {
	var NodeListProto = glow.NodeList.prototype,
		document = window.document,
		undefined;
	
	var domEventNames =
		' mouseover mousemove mouseout mousedown click mouseup dblclick' +
		' focus blur change select submit reset scroll ';
	var windowEventNames = ' load unload resize ';
	var keyEventNames = ' keypress keydown keyup ';
	
	/**
		@name glow.NodeList#on
		@function
		@description Listen for an event.
		   This will listen for a particular event on each dom node
		   in the NodeList.
		   
		   If you're listening to many children of a particular item,
		   you may get better performance from {@link glow.NodeList#delegate}.
		
		@param {String} eventName Name of the event to listen for.
		   This can be any regular DOM event ('click', 'mouseover' etc) or
		   a special event of NodeList.
		   
		@param {Function} callback Function to call when the event fires.
		   The callback is passed a single event object. The type of this
		   object is {@link glow.DomEvent} unless otherwise stated.
		   
		@param {Object} [thisVal] Value of 'this' within the callback.
		   By default, this is the dom node being listened to.
		
		@returns this
		
		@example
		   glow.get('#testLink').on('click', function(domEvent) {
			   // do stuff
			   
			   // if you want to cancel the default action (following the link)...
			   return false;
		   });
	*/
	NodeListProto.on = function(name, callback, thisVal) {
		var name = (name || '').toLowerCase(),
			attachTo,
			capturingMode = true,
			isDomEvent = (domEventNames.indexOf(' ' + name + ' ') > -1),
			isKeyEvent = (keyEventNames.indexOf(' ' + name + ' ') > -1),
			isWindowEvent = (windowEventNames.indexOf(' ' + name + ' ') > -1);
			
		if (isDomEvent) {
			glow.events._addDomEventListener(this, name, callback, thisVal);
		}
		else if (isKeyEvent) {
			// todo
		}
		else{
			glow.events.addListeners(this, name, callback, thisVal);
		}
		
		return this;
	}
	
	/**
		@name glow.NodeList#detatch
		@function
		@description Detatch a listener from elements
		   This will detatch the listener from each dom node in the NodeList.
		
		@param {String} eventName Name of the event to detatch the listener from
		   
		@param {Function} callback Listener callback to detatch
		
		@returns this
		
		@example
			function clickListener(domEvent) {
				// ...
			}
			
			// adding listeners
			glow.get('a').on('click', clickListener);
			
			// removing listeners
			glow.get('a').detatch('click', clickListener);
	*/
	NodeListProto.detatch = function(eventName, callback) {}
	
	/**
		@name glow.NodeList#delegate
		@function
		@description Listen for an event occurring on child elements matching a selector.
			'delegate' will catch events which occur on matching items created after
			the listener was added. 
		
		@param {String} eventName Name of the event to listen for.
			This can be any regular DOM event ('click', 'mouseover' etc) or
			a special event of NodeList.
		
		@param {String} selector CSS selector of child elements to listen for events on
			For example, if you were wanting to hear events from links, this
			would be 'a'.
		
		@param {Function} callback Function to call when the event fires.
			The callback is passed a single event object. The type of this
			object is {@link glow.DomEvent} unless otherwise stated.
		
		@param {Object} [thisVal] Value of 'this' within the callback.
			By default, this is the dom node matched by 'selector'.
		
		@returns this
		
		@example
			// Using 'on' to catch clicks on links in a list
			glow.get('#nav a').on('click', function() {
				// do stuff
			});
			
			// The above adds a listener to each link, any links created later
			// will not have this listener, so we won't hear about them.
			
			// Using 'delegate' to catch clicks on links in a list
			glow.get('#nav').delegate('click', 'a', function() {
				// do stuff
			});
			
			// The above only adds one listener to #nav which tracks clicks
			// to any links within. This includes elements created after 'delegate'
			// was called.
		
		@example
			// Using delegate to change class names on table rows so :hover
			// behaviour can be emulated in IE6
			glow.get('#contactData').delegate('mouseover', 'tr', function() {
				glow.get(this).addClass('hover');
			});
			
			glow.get('#contactData').delegate('mouseout', 'tr', function() {
				glow.get(this).removeClass('hover');
			});
	*/
	NodeListProto.delegate = function(eventName, selector, callback, thisVal) {}
	
	/**
		@name glow.NodeList#detatchDelegate
		@function
		@description Detatch a delegated listener from elements
		   This will detatch the listener from each dom node in the NodeList.
		
		@param {String} eventName Name of the event to detatch the listener from
		
		@param {String} selector CSS selector of child elements the listener is listening to
		
		@param {Function} callback Listener callback to detatch
		
		@returns this
		
		@example
			function clickListener(domEvent) {
				// ...
			}
			
			// adding listeners
			glow.get('#nav').delegate('click', 'a', clickListener);
			
			// removing listeners
			glow.get('#nav').detatchDelegate('click', 'a', clickListener);
	*/
	NodeListProto.detatchDelegate = function(eventName, selector, callback) {}
	
	/**
		@name glow.NodeList#fire
		@function
		@param {String} eventName Name of the event to fire
		@param {glow.events.Event} [event] Event object to pass into listeners.
		   You can provide a simple object of key / value pairs which will
		   be added as properties of a glow.events.Event instance.
		
		@description Fire an event on dom nodes within the NodeList
		   Note, this will only trigger event listeners to be called, it won't
		   for example, move the mouse or click a link on the page.
		
		@returns glow.events.Event
		
		@example
		   glow.get('#testLink').on('click', function() {
			   alert('Link clicked!');
		   });
		   
		   // The following causes 'Link clicked!' to be alerted, but doesn't
		   // cause the browser to follow the link
		   glow.get('#testLink').fire('click');
	*/
	NodeListProto.fire = function(eventName, event) {}
	
	/**
		@name glow.NodeList#event:mouseenter
		@event
		@description Fires when the mouse enters the element specifically, does not bubble
		
		@param {glow.events.DomEvent} event Event Object
	*/
	
	/**
		@name glow.NodeList#event:mouseleave
		@event
		@description Fires when the mouse leaves the element specifically, does not bubble
		
		@param {glow.events.DomEvent} event Event Object
	*/
	
	/**
		@name glow.NodeList#event:keydown
		@event
		@description Fires when the user presses a key
			Only fires if the element has focus, listen for this event on
			the document to catch all keydowns.
			
			keydown will only fire once, when the user presses the key.
			
			The order of events is keydown, char*, keyup. Char will only fire
			if the element that has focus can receive character input, and may
			fire many times if the user holds the key down.
		
		@param {glow.events.KeyboardEvent} event Event Object
	*/
	
	/**
		@name glow.NodeList#event:keyChar
		@event
		@description Fires when the user enters a character into an element using the keyboard
			
			The order of events is keydown, char*, keyup. Char will only fire
			if the element that has focus can receive character input, and may
			fire many times if the user holds the key down.
		
		@param {glow.events.KeyboardEvent} event Event Object
	*/
	
	/**
		@name glow.NodeList#event:keyup
		@event
		@description Fires when the user releases a key
			Only fires if the element has focus, listen for this event on
			the document to catch all keyups.
		
			The order of events is keydown, char*, keyup. Char will only fire
			if the element that has focus can receive character input, and may
			fire many times if the user holds the key down.
		
		@param {glow.events.KeyboardEvent} event Event Object
	*/
});