Glow.provide(function(glow) {
	var document = window.document,
		undef = undefined,
		domEventHandlers = [], // like: domEventHandlers[uniqueId][eventName].count, domEventHandlers[uniqueId][eventName].callback
		// shortcuts to aim compression
		events = glow.events,
		_callListeners = events._callListeners,
		_getPrivateEventKey = events._getPrivateEventKey;
	
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
		this.source = e.target || e.srcElement;
		
		// some rare cases crop up in Firefox where the source is a text node
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
	
	glow.util.extend(DomEvent, events.Event, {
		// no docs for this as it simply adds DOM behaviour to glow.events.Event#preventDefault
		preventDefault: function() {
			var nativeEvent = this.nativeEvent;
			if (nativeEvent) {
				nativeEvent.preventDefault && nativeEvent.preventDefault();
				nativeEvent.returnValue = false;
			}
			// call the original method
			events.Event.prototype.preventDefault.call(this);
		}
	});
	
	/**
		Add listener for an event fired by the browser.
		@private
		@name glow.events._addDomEventListener
		@see glow.NodeList#on
		@function
	*/
	events._addDomEventListener = function(nodeList, eventName) {
		var i = nodeList.length, // TODO: should we check that this nodeList is deduped?
			attachTo,
			id;
	
		while (i--) {
			attachTo = nodeList[i];

			id = _getPrivateEventKey(attachTo);

			// check if there is already a handler for this kind of event attached
			// to this node (which will run all associated callbacks in Glow)
			if (!domEventHandlers[id]) { domEventHandlers[id] = {}; }

			if (domEventHandlers[id][eventName] && domEventHandlers[id][eventName].count > 0) { // already have handler in place
				domEventHandlers[id][eventName].count++;
				continue;
			}

			// no bridge in place yet
			domEventHandlers[id][eventName] = { count:1 };
			
			// attach a handler to tell Glow to run all the associated callbacks
			(function(attachTo) {
				var handler = domHandle(attachTo, eventName);
				
				if (attachTo.addEventListener) { // like DOM2 browsers	
					attachTo.addEventListener(handler.domName, handler, (eventName === 'focus' || eventName === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				}
				else if (attachTo.attachEvent) { // like IE
					alert(handler.domName);
					attachTo.attachEvent('on' + handler.domName, handler);
				}
				// older browsers?
				
				domEventHandlers[id][eventName].callback = handler;
			})(attachTo);
		}
	}
	
	function domHandle(attachTo, eventName) {
		var handler;
		
		if (eventName === 'mouseenter' || eventName === 'mouseleave') {
			// mousenter and mouseleave handle their own delegation as its non-standard
			handler = function(nativeEvent) {
				var domEvent = new DomEvent(nativeEvent),
					container,
					selector,
					elementsToTest = _getDelegateMatches(attachTo, eventName, domEvent);
				
				// add this element to the delegates
				elementsToTest.push( [attachTo] );
				
				for (var i = 0, leni = elementsToTest.length; i < leni; i++) {
					container = elementsToTest[i][0];
					selector = elementsToTest[i][1];
					
					if (!new glow.NodeList(container).contains(domEvent.related)) {
						_callListeners(attachTo, selector ? eventName + '/' + selector : eventName, domEvent, container); // fire() returns result of callback
					}
				}
				return !domEvent.defaultPrevented();
			};
			
			handler.domName = (eventName === 'mouseenter') ? 'mouseover' : 'mouseout';
		}
		else {
			handler = function(nativeEvent) {
				var domEvent = new DomEvent(nativeEvent);
				events._callDomListeners(attachTo, eventName, domEvent); // fire() returns result of callback
				
				return !domEvent.defaultPrevented();
			};
			
			if (glow.env.ie) { // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				if (eventName === 'focus') {
					handler.domName = 'focusin';
				}
				else if (eventName === 'blur') {
					handler.domName = 'focusout';
				}
				handler.domName = eventName;
			}
			else {
				handler.domName = eventName;
			}
		}
		
		return handler;
	}
	
	
	/**
		Remove listener for an event fired by the browser.
		@private
		@name glow.events._removeDomEventListener
		@see glow.NodeList#detach
		@function
	*/
	events._removeDomEventListener = function(nodeList, eventName) {
		var i = nodeList.length,
			attachTo,
			id,
			bridge,
			handler;
			
		while (i--) {
			attachTo = nodeList[i];
			
			// skip if there is no bridge for this kind of event attached
			id = _getPrivateEventKey(attachTo);
			if (!domEventHandlers[id] && !domEventHandlers[id][eventName]) { continue; }

			bridge = domEventHandlers[id][eventName];
			
			// one less listener associated with this event
			if ( --bridge.count === 0) {
				// no more listeners associated with this event
				handler = bridge.callback;
				
				if (attachTo.removeEventListener) { // like DOM2 browsers	
					attachTo.removeEventListener(handler.domName, handler, (eventName === 'focus' || eventName === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				}
				else if (attachTo.detachEvent) { // like IE
					attachTo.detachEvent('on' + handler.domName, handler);
				}
				domEventHandlers[id][eventName] = undefined;
			}
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

	/*
		The following is a proposal for dealing with event delegation without
		multiple bridges. This allows us to have only one listener per element per event
		therefore only one search for delegates per event.
	*/
	
	// structure:
	// delegates[eventId][eventName][selector] = number of delegates listening for that selector (for that event on that element)
	var delegates = {}
	
	/**
		@name glow.events._registerDelegate
		@private
		@function
		@description Register a delegated event
			This allows selectors for a given element & eventName to be retrieved later
		
		@param {glow.NodeList} nodeList Elements to register
		@param {string} eventName
		@param {string} selector Selector to match for the delegate
	*/
	events._registerDelegate = function(nodeList, eventName, selector) {
		var id,
			i = nodeList.length,
			delegatesForEvent;
		
		while (i--) {
			id = _getPrivateEventKey( nodeList[i] );
			delegates[id] = delegates[id] || {};
			delegatesForEvent = delegates[id][eventName] = delegates[id][eventName] || {};
			// increment the count or set it to 1
			delegatesForEvent[selector] = delegatesForEvent[selector] + 1 || 1;
		}
	};
	
	/**
		@name glow.events._unregisterDelegate
		@private
		@function
		@description Unregister a delegated event
		
		@param {glow.NodeList} nodeList Elements to unregister
		@param {string} eventName
		@param {string} selector Selector to match for the delegate
	*/
	events._unregisterDelegate = function(nodeList, eventName, selector) {
		var id,
			selectorCounts,
			i = nodeList.length;
		
		while (i--) {
			id = _getPrivateEventKey( nodeList[i] );
			if ( !delegates[id] || !( selectorCounts = delegates[id][eventName] ) ) { continue; }
			
			// either decrement the count or delete the entry
			if ( selectorCounts[selector] && --selectorCounts[selector] === 0 ) {
				delete selectorCounts[selector];
			}
		}
	};
	
	/**
		@name glow.events._getDelegateMatches
		@private
		@function
		@description Get the elements which qualify for a delegated event
		
		@param {HTMLElement} element Element the listener is attached to
		@param {string} eventName
		@param {glow.events.DomEvent} event DOM event for the original event
			The events source will be used as a place to start searching
			
		@returns {Array[]} An array of arrays like [matchedNode, selectorMatched]
	*/
	var _getDelegateMatches = events._getDelegateMatches = function(element, eventName, event) {
		var id = _getPrivateEventKey(element),
			selectorCounts,
			selector,
			node,
			r = [];
		
		// call delegated listeners
		if ( delegates[id] && ( selectorCounts = delegates[id][eventName] ) ) {
			for (selector in selectorCounts) {
				node = event.source
				// if the source matches the selector
				while (node) {
					if (glow._sizzle.matches( selector, [node] ).length) {
						r.push( [node, selector] );
					}
					
					if (node === element) { break; } // don't check parents above the attachTo
					node = node.parentNode;
				}
			}
		}
		
		return r;
	}
	
	/**
		@name glow.events._callDomListeners
		@private
		@function
		@description Call delegated listeners and normal listeners for an event
			Events that don't bubble (like mouseenter and mouseleave) need
			to handle their own delegation rather than use this.
		
		@param {HTMLElement} element Element to fire event on
		@param {string} eventName
		@param {glow.events.DomEvent} event
			
		@returns {glow.events.DomEvent} Original event passed in
	*/
	events._callDomListeners = function(element, eventName, event) {
		var delegateMatches = _getDelegateMatches(element, eventName, event);
		
		// call delegated listeners
		for (var i = 0, leni = delegateMatches.length; i < leni; i++) {
			_callListeners( element, eventName + '/' + delegateMatches[i][1], event, delegateMatches[i][0] );
		}
		
		// call non-delegated listeners
		_callListeners(element, eventName, event);
		
		return event;
	}
	
	// export
	events.DomEvent = DomEvent;
});