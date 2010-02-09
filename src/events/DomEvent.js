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
	
	glow.util.extend(DomEvent, glow.events.Event); // DomEvent extends Event

	// need to keep track of the original callback provided by the user and the
	// callback we replaced it with when dealing with simulated events (like mouseenter).
	// this is so we know which callback to remove later when the user askd to detach their original
	var simulatedCallbacks = []; // like: [[callback, handler], [callback, handler]]
	//like: simulatedCallbacks[uniqueId][simulatedEventName] = [[callback, simulatedCallback]];

	function getSimulatedCallbackFromOriginal(id, eventName, originalCallback) {
		var callbacks = simulatedCallbacks[id];
		if (callbacks) { callbacks = callbacks[eventName]; }
		
		if (callbacks) {
			for (var i = 0, leni = callbacks.length; i < leni; i++) {
				if (callbacks[i][0] === originalCallback) {
					return callbacks[i][1];
				}
			}
		}
	}
	
	// replace callback for simulated events (like mouseenter) with a more cross-browsery one
	function simulate(eventName, attachTo, id, callback) {	
		var simulatedCallback;
		
		simulatedCallback = getSimulatedCallbackFromOriginal(id, eventName, callback); // we've already made a simulated event on this item
		
		if (!simulatedCallback) {
			// simulate this event
			if (eventName === 'mouseenter') {
				// on mouseover...
				simulatedCallback = function(e) {
					if (!new glow.NodeList(attachTo).contains(e.related)) {
						callback.call(attachTo);
					}
				};
			}
			else if (eventName === 'mouseleave') {
				// on mouseout...
				simulatedCallback = function(e) {						
					if (e.related != attachTo && new glow.NodeList(e.related).contains(attachTo)) {
						callback.call(attachTo);
					}
				};
			}
			else { throw "Unsupported simulated event: "+eventName; }
		
			if (!simulatedCallbacks[id]) { simulatedCallbacks[id] = {}; }
			if (!simulatedCallbacks[id][eventName]) { simulatedCallbacks[id][eventName] = []; }
			simulatedCallbacks[id][eventName].push([callback, simulatedCallback]); // keep track of what we've replaced
		}
		
		return simulatedCallback;
	}
	
	
	
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
			bridge,
			simulated;
	
		while (i-- && nodeList[i]) {
			attachTo = nodeList[i];
			id = glow.events._getPrivateEventKey(attachTo);
			
			if (name === 'mouseenter') {
				name = 'mouseover';
				callback = simulate('mouseenter', attachTo, id, callback);
			}
			else if (name === 'mouseleave') {
				name = 'mouseout';
				callback = simulate('mouseleave', attachTo, id, callback);
			}

			// will add a unique id to this node, if there is not one already
			glow.events.addListeners([attachTo], name, callback, (thisVal || attachTo));

			// check if there is already a bridge handler for this kind of event attached
			// to this node (which will run all associated callbacks in Glow)
			if (!domEventHandlers[id]) { domEventHandlers[id] = {}; }
			
			if (domEventHandlers[id][name] && domEventHandlers[id][name].count > 0) { // already have bridge in place
				domEventHandlers[id][name].count++;
				continue;
			}
			
			// no bridge in place yet
			bridge =
			domEventHandlers[id][name] = { callback: null, count:1 };
			
			// attach a handler to tell Glow to run all the associated callbacks
			(function(attachTo) {
				bridge.callback = function(nativeEvent) {
					var domEvent = new glow.events.DomEvent(nativeEvent);
					var result = glow.events._callListeners(attachTo, name, domEvent); // fire() returns result of callback
					
					if (typeof result === 'boolean') { return result; }
					else { return !domEvent.defaultPrevented(); }
				};
				
				if (attachTo.addEventListener) { // like DOM2 browsers	
					attachTo.addEventListener(name, bridge.callback, (name === 'focus' || name === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
				}
				else if (attachTo.attachEvent) { // like IE
					if (name === 'focus')  attachTo.attachEvent('onfocusin', bridge.callback); // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
					else if (name === 'blur') attachTo.attachEvent('onfocusout', bridge.callback); // cause that's how IE rolls...
					attachTo.attachEvent('on' + name, bridge.callback);
				}
				// older browsers?
			})(attachTo);
		}
	}
	
	/**
		Remove listener for an event fired by the browser.
		@private
		@name glow.events._removeDomEventListener
		@see glow.NodeList#detach
		@function
	*/
	glow.events._removeDomEventListener = function(nodeList, name, callback) {
		var i = nodeList.length, // TODO: should we check that this nodeList is deduped?
			attachTo,
			id,
			handler;
			
		while (i-- && nodeList[i]) {
			attachTo = nodeList[i];
			
			// skip if there is no bridge for this kind of event attached
			id = glow.events._getPrivateEventKey(attachTo);
			if (!domEventHandlers[id] && !domEventHandlers[id][name]) { continue; }
			
			// is this callback for a simulated event, and thus one of the ones we replaced?
			// need to get that replacement callback again, so we can remove it
			if (name === 'mouseenter') {
				callback = getSimulatedCallbackFromOriginal(id, name, callback);
				name = 'mouseover';
			}
			else if (name === 'mouseleave') {
				callback = getSimulatedCallbackFromOriginal(id, name, callback);
				name = 'mouseout';
			}
			
			glow.events.removeListeners([attachTo], name, callback);

			if (domEventHandlers[id][name].count > 0) {
				domEventHandlers[id][name].count--; // one less listener associated with this event
		
				if (domEventHandlers[id][name].count === 0) {  // no more listeners associated with this event
					// detach bridge handler to tell Glow to run all the associated callbacks
					handler = domEventHandlers[id][name].callback;
					
					if (attachTo.removeEventListener) { // like DOM2 browsers	
						attachTo.removeEventListener(name, handler, (name === 'focus' || name === 'blur')); // run in bubbling phase except for focus and blur, see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
					}
					else if (attachTo.detachEvent) { // like IE
						if (name === 'focus')  attachTo.detachEvent('onfocusin', handler); // see: http://www.quirksmode.org/blog/archives/2008/04/delegating_the.html
						else if (name === 'blur') attachTo.detachEvent('onfocusout', handler); // cause that's how IE rolls...
						attachTo.detachEvent('on' + name, handler);
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