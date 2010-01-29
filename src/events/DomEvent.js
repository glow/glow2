Glow.provide(function(glow) {
	var document = window.document,
		undef = undefined,
		domEventHandlers = [];
	
	/** 
		@name glow.events.DomEvent
		@constructor
		@extends glow.events.Event
		
		@param {Event|string} nativeEvent A native browser event read properties from, or the name of a native event.
		
		@param {Object} [properties] Properties to add to the Event instance.
		   Each key-value pair in the object will be added to the Event as
		   properties
		
		@description Describes a DOM event that occurred
		   You don't need to create instances of this class if you're simply
		   listening to events. One will be provided as the first argument
		   in your callback.
	*/
	function DomEvent(e, properties) {
		/** 
			@name glow.events.DomEvent#nativeEvent
			@type {Event | MouseEvent | UIEvent}
			@description The native event object provided by the browser.
		 */
		 this.nativeEvent = e;
		
		/** 
			@name glow.events.DomEvent#type
			@type {string}
			@description The native type of the event, like 'click' or 'keydown'.
		 */
		this.type = e.type;
		
		/** 
			@name glow.events.DomEvent#source
			@type {HTMLElement}
			@description The element that the event originated from.
				For example, you could attach a listener to an <ol> element to listen for
				clicks. If the user clicked on an <li> the source property would be the
				<li> element, and {@link glow.DomEvent#attachedTo attachedTo} would be
				the <ol>.
		*/
		if (e.target) { this.source = e.target; } // like FF
		else if (e.srcElement) { this.source = e.srcElement; } // like IE
		if (this.source && this.source.nodeType !== 1) {
			this.source = this.source.parentNode;
		}
		
		/** 
			@name glow.events.DomEvent#related
			@type {HTMLElement}
			@description A related HTMLElement
				For mouseover / mouseenter events, this will refer to the previous element
				the mouse was over.
				
				For mouseout / mouseleave events, this will refer to the element the mouse
				is now over.
		*/
		this.related = e.relatedTarget || (this.type == 'mouseover' ? e.fromElement : e.toElement);
		
		/** 
			@name glow.events.DomEvent#shiftKey
			@type {boolean | undefined}
			@description Was the shift key pressed during the event?
		*/
		this.shiftKey = (e.shiftKey === undef)? undef : !!e.shiftKey;
		
		/** 
			@name glow.events.DomEvent#altKey
			@type {boolean | undefined}
			@description Was the alt key pressed during the event?
		*/
		this.altKey = (e.altKey === undef)? undef : !!e.altKey;
		
		/** 
			@name glow.events.DomEvent#ctrlKey
			@type {boolean | undefined}
			@description Was the ctrl key pressed during the event?
		*/
		this.ctrlKey = (e.ctrlKey === undef)? undef : !!e.ctrlKey;
		
		/**
			@name glow.events.DomEvent#button
			@type {number | undefined}
			@description A number representing which button was pressed.
				0 for the left button, 1 for the middle button or 2 for the right button.
		*/
		this.button = glow.env.ie ? (e.button & 1 ? 0 : e.button & 2 ? 2 : 1) : e.button;
		
		/** 
			@name glow.events.DomEvent#mouseTop
			@type {number}
			@description The vertical position of the mouse pointer in the page in pixels.
		*/
		/** 
			@name glow.events.DomEvent#mouseLeft
			@type {number}
			@description The horizontal position of the mouse pointer in the page in pixels.
		*/
		if (e.pageX !== undef || e.pageY !== undef) {
			this.mouseTop = e.pageY;
			this.mouseLeft = e.pageX;
		}
		else if (e.clientX !== undef || e.clientY !== undef) {
			this.mouseTop = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			this.mouseLeft = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		}
		
		/** 
			@name glow.events.DomEvent#wheelData
			@type {number}
			@description The number of clicks the mouse wheel moved.
				Up values are positive, down values are negative.
		*/
		if (this.type == 'mousewheel') {
			// this works in latest opera, but have read that it needs to be switched in direction
			// if there was an opera bug, I can't find which version it was fixed in
			this.wheelDelta =
				e.wheelDelta ? e.wheelDelta / 120 :
				e.detail ? - e.detail / 3 :
				0;
		}
		
		for (var key in properties) {
			this[key] = properties[key];
		}
	}
	
	glow.util.apply(DomEvent.prototype, glow.events.Event.prototype); // DomEvent extends Event
	
	/**
		Add listener for an event fired by the browser.
		@private
		@name glow.events._addDomEventListener
		@see glow.NodeList#on
		@function
	*/
	glow.events._addDomEventListener = function(nodeList, name, callback, thisVal) {
		var i = nodeList.length, // TODO: should we check that this nodeList is deduped?
			attachTo,
			id,
			isWindow;
	
		while (i-- && nodeList[i]) {
			attachTo = nodeList[i];

			//isWindow = (attachTo.window && (attachTo.open !== undef));

			//if ( attachTo.nodeType !== 1 && !isWindow ) { continue; }
			
			// will add a unique id to this node, if there is not one already
			glow.events.addListeners([attachTo], name, callback, thisVal || attachTo);

			// check if there is already a handler for this kind of event attached
			// to this node (which will run all associated callbacks in Glow)
			id = glow.events._getPrivateEventKey(attachTo);
			if (!domEventHandlers[id]) { domEventHandlers[id] = {}; }
			
			if (domEventHandlers[id][name]) { continue; }
			domEventHandlers[id][name] = true;
			
			// attach a handler to tell Glow to run all the associated callbacks
			(function(attachTo) {
				var handler = function(nativeEvent) {
					var domEvent = new glow.events.DomEvent(nativeEvent);
					var result = glow.events._callListeners(attachTo, name, domEvent); // fire() returns result of callback
					
					if (typeof result === 'boolean') { return result; }
					else { return !domEvent.defaultPrevented(); }
				};
				
				if (attachTo.addEventListener) { // like DOM2 browsers	
					attachTo.addEventListener(name, handler, (name === 'focus' || name === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				}
				else if (attachTo.attachEvent) { // like IE
					if (name === 'focus')  attachTo.attachEvent('onfocusin', handler); // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
					else if (name === 'blur') attachTo.attachEvent('onfocusout', handler); // cause that's how IE rolls...
					attachTo.attachEvent('on' + name, handler);
				}
				else { // legacy browsers?
					attachTo['on' + name] = handler; // TODO preserve existing handler?
				}
			})(attachTo); // get a reference to this particular attachTo value
		}
	}

// see: http://developer.yahoo.com/yui/3/event/#eventsimulation
// see: http://developer.yahoo.com/yui/docs/YAHOO.util.UserAction.html
// 	function simulateDomEvent(nodeList, domEvent) {
// 		var i = nodeList.length,
// 			eventName = domEvent.type,
// 			nativeEvent,
// 			node,
// 			fire;
// 		
// 		if (document.createEvent) {
// 			var nativeEvent = document.createEvent('MouseEvent'); // see: 
// 			nativeEvent.initEvent(eventName, true, true);
// 			
// 			fire = function(el) {
// 				return !el.dispatchEvent(nativeEvent);
// 			}
// 		}
// 		else {
// 			fire = function(el) {
// 				var nativeEvent = document.createEventObject(); 
// 				return el.fireEvent('on'+eventName, nativeEvent);
// 			}
// 		}
// 		
// 		while (i--) {
// 			node = nodeList[i];
// 			if (node.nodeType !== 1) { continue; }
// 			fire(node);
// 		}
// 	}

	/** 
		@name glow.events.KeyboardEvent
		@constructor
		@extends glow.events.Event
		
		@param {Event} nativeEvent A native browser event read properties from
		
		@param {Object} [properties] Properties to add to the Event instance.
		   Each key-value pair in the object will be added to the Event as
		   properties
		
		@description Describes a keyboard event that occurred
		   You don't need to create instances of this class if you're simply
		   listening to events. One will be provided as the first argument
		   in your callback.
	*/
	
	/** 
		@name glow.events.KeyboardEvent#key
		@type {number}
		@description A number representing the key pressed
			Constants for these numbers can be found in
			{@link glow.KeyboardEvent.keys}.
			
			This is only available for 'keyup' and 'keydown' events
			
		@example
			var keys = glow.events.KeyboardEvent.keys;
			switch (event.key) {
				case keys.ESC:
					// do stuff
					break;
				case keys.SHIFT:
					// do stuff
					break;
			}
	*/
	
	/** 
		@name glow.events.KeyboardEvent#keyChar
		@type {string}
		@description The string of the key pressed
			This is only available for 'char' events.
			
		@example
			// prevent non-numbers being entered
			return !isNaN( Number(event.keyChar) );
	*/
	
	/**
		@name glow.events.KeyboardEvent.keys
		@namespace
		@description Constants for keys.
			// I can't be arsed to write all these out, but it'll have properties like ESC, SHIFT, A, B, C etc etc
	*/
	
	// export
	glow.events.DomEvent = DomEvent;
});