Glow.provide(function(glow) {
	var document = window.document,
		undef = undefined,
		domEventHandlers = []; // like: domEventHandlers[uniqueId][eventName].count, domEventHandlers[uniqueId][eventName].callback
	
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
		if (this.source && this.source.nodeType !== 1) { // like a textNode
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
	
	glow.util.extend(DomEvent, glow.events.Event); // DomEvent extends Event

	
	/**
		Add listener for an event fired by the browser.
		@private
		@name glow.events._addDomEventListener
		@see glow.NodeList#on
		@function
	*/
	glow.events._addDomEventListener = function(nodeList, eventName, callback, thisVal, selector) {
		var i = nodeList.length, // TODO: should we check that this nodeList is deduped?
			attachTo,
			id,
			eId = eventName + (selector? '/'+selector : '');
	
		while (i-- && nodeList[i]) {
			attachTo = nodeList[i];

			// will add a unique id to this node, if there is not one already
			glow.events.addListeners([attachTo], eventName, callback, thisVal);
			id = glow.events._getPrivateEventKey(attachTo);

			// check if there is already a handler for this kind of event attached
			// to this node (which will run all associated callbacks in Glow)
			if (!domEventHandlers[id]) { domEventHandlers[id] = {}; }

			if (domEventHandlers[id][eId] && domEventHandlers[id][eId].count > 0) { // already have handler in place
				domEventHandlers[id][eId].count++;
				continue;
			}

			// no bridge in place yet
			domEventHandlers[id][eId] = { callback: null, count:1 };
			
			// attach a handler to tell Glow to run all the associated callbacks
			(function(attachTo) {
				var handler = domHandle(attachTo, eventName, selector);
				
				if (attachTo.addEventListener) { // like DOM2 browsers	
					attachTo.addEventListener(handler.domName, handler, (eventName === 'focus' || eventName === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				}
				else if (attachTo.attachEvent) { // like IE
					if (eventName === 'focus')  attachTo.attachEvent('onfocusin', handler); // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
					else if (eventName === 'blur') attachTo.attachEvent('onfocusout', handler); // cause that's how IE rolls...
					attachTo.attachEvent('on' + handler.domName, handler);
				}
				// older browsers?
				
				domEventHandlers[id][eId].callback = handler;
			})(attachTo);
		}
	}
	
	function domHandle(attachTo, eventName, selector) {
		var handler;
		
		if (eventName === 'mouseenter') {
			handler = function(nativeEvent, node) {
				var e = new glow.events.DomEvent(nativeEvent),
					container = node || attachTo;
				
				if (!new glow.NodeList(container).contains(e.related)) {
					var result = glow.events._callListeners(attachTo, eventName, e, node),
						prevented = result.defaultPrevented();
				
					if (typeof prevented === 'boolean') {
						if (prevented) {
							if (nativeEvent.preventDefault) { nativeEvent.preventDefault(); } // like FF
							else { nativeEvent.returnValue = false; } // like IE
						}
						return !prevented;
					}
				}
			};
			
			if (selector) {
				handler = delegate(attachTo, eventName, selector, handler);
			}
			
			handler.domName = 'mouseover';
		}
		else if (eventName === 'mouseleave') {
			handler = function(nativeEvent, node) {
				var e = new glow.events.DomEvent(nativeEvent),
					container = node || attachTo;
					
				if (!new glow.NodeList(container).contains(e.related)) {
					var result = glow.events._callListeners(attachTo, eventName, e, node),
						prevented = result.defaultPrevented();
				
					if (typeof prevented === 'boolean') {
						if (prevented) {
							if (nativeEvent.preventDefault) { nativeEvent.preventDefault(); } // like FF
							else { nativeEvent.returnValue = false; } // like IE
						}
						return !prevented;
					}
				}
			};
			
			if (selector) {
				handler = delegate(attachTo, eventName, selector, handler);
			}
			
			handler.domName = 'mouseout';
		}
		else {
			handler = function(nativeEvent, node) {
				var domEvent = new glow.events.DomEvent(nativeEvent),
					result = glow.events._callListeners(attachTo, eventName, domEvent, node), // fire() returns an event object			
					prevented = result.defaultPrevented();

				if (typeof prevented === 'boolean') {
					if (prevented) {
						if (nativeEvent.preventDefault) { nativeEvent.preventDefault(); } // like FF
						else { nativeEvent.returnValue = false; } // like IE
					}
					return !prevented;
				}
			};
			
			if (selector) {
				handler = delegate(attachTo, eventName, selector, handler);
			}
			
			handler.domName = eventName;
		}
		
		return handler;
	}
	
	// wraps a handler in code to detect delegation
	function delegate(attachTo, eventName, selector, handler) {
	
		return function(nativeEvent) { //console.log('dispatched, selector is: '+selector);
			var e = new glow.events.DomEvent(nativeEvent);
				node = e.source;
			
			// if the source matches the selector
			while (node) {
				if (!!glow._sizzle.matches(selector, [node]).length) {
					// the wrapped handler is called here, pass in the node that matched so it can be used as `this`
					var result = handler(nativeEvent, node);
					return result;
					//
				}
				
				if (node === attachTo) { break; } // don't check parents above the attachTo
				
				node = node.parentNode;
			}
		};
	}
	
	/**
		Remove listener for an event fired by the browser.
		@private
		@name glow.events._removeDomEventListener
		@see glow.NodeList#detach
		@function
	*/
	glow.events._removeDomEventListener = function(nodeList, eventName, callback, selector) {
		var i = nodeList.length, // TODO: should we check that this nodeList is deduped?
			attachTo,
			id,
			eId = eventName + (selector? '/'+selector : ''),
			bridge,
			handler;
			
		while (i-- && nodeList[i]) {
			attachTo = nodeList[i];
			
			// skip if there is no bridge for this kind of event attached
			id = glow.events._getPrivateEventKey(attachTo);
			if (!domEventHandlers[id] && !domEventHandlers[id][eId]) { continue; }
			
			glow.events.removeListeners([attachTo], eventName, callback);

			bridge = domEventHandlers[id][eId]
			
			if (bridge.count > 0) {
				bridge.count--; // one less listener associated with this event
		
				if (bridge.count === 0) {  // no more listeners associated with this event
					// detach bridge handler to tell Glow to run all the associated callbacks
					
					handler = bridge.callback;
														
					if (attachTo.removeEventListener) { // like DOM2 browsers	
						attachTo.removeEventListener(handler.domName, handler, (eventName === 'focus' || eventName === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
					}
					else if (attachTo.detachEvent) { // like IE
						if (eventName === 'focus')  attachTo.detachEvent('onfocusin', handler); // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
						else if (eventName === 'blur') attachTo.detachEvent('onfocusout', handler); // cause that's how IE rolls...
						attachTo.detachEvent('on' + handler.domName, handler);
					}
				}
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
	
	// export
	glow.events.DomEvent = DomEvent;
});