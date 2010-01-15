
/**
	@name glow.events
	@namespace
	@description Native browser and custom events
 */

//-----------------------------------------------------------------

Glow.provide(function(glow) {
	glow.events = glow.events || {};
		
	/* storage variables */
	var r = {};
	var eventListeners = {};
	var eventid = 1;
	var objid = 1;
	var psuedoPrivateEventKey = '__eventId' + glow.UID;
	var psuedoPreventDefaultKey = psuedoPrivateEventKey + 'PreventDefault';
	var psuedoStopPropagationKey = psuedoPrivateEventKey + 'StopPropagation';
	
		
	/**
	@name glow.events.addListeners
	@function
	@param {Object[]} attachTo Array of objects to add listeners to
	@param {String} name Name of the event to listen for
	@param {Function} callback Function to call when the event fires.
		The callback is passed a single event object. The type of this
		object depends on the event (see documentation for the event
		you're listening to).
	@param {Object} [thisVal] Value of 'this' within the callback.
		By default, this is the object being listened to.
		 
	@description Convenience method to add listeners to many objects at once.
		If you're wanting to add a listener to a single object, use its
		'on' method.
	*/
	glow.events.addListeners = function (attachTo, name, callback, thisVal) {
		var listenerIds = [],
			i = attachTo.length,
			objIdent,
			listener,
			eventsOnObject,
			currentListeners;
	
		//attach the event for each element, return an array of listener ids
		while (i--) {
			objIdent = attachTo[i][psuedoPrivateEventKey];
			if (!objIdent){
				objIdent = attachTo[i][psuedoPrivateEventKey] = objid++;
			}
					
			listener = [ callback, thisVal || attachTo[i] ];
			eventsOnObject = eventListeners[objIdent];
			if(!eventsOnObject){
				eventsOnObject = eventListeners[objIdent] = {};
			}
					
			currentListeners = eventsOnObject[name];
			if(!currentListeners){
				currentListeners = eventsOnObject[name] = [listener];
			}
			else{
				currentListeners[currentListeners.length] = listener;
			}							
		}
	};
	
	// see: http://www.quirksmode.org/dom/events/
	
	/**
	Add listener for an event fired by the browser.
	@private
	@name glow.events._addDomEventListener
	@function
	*/
	glow.events._addDomEventListener = function(nodeList, name, callback, thisVal) {
		var i = nodeList.length,
			attachTo,
			fire,
			domEvent;
		
		name = (name || '').toLowerCase();
		
		while (i--) {
			attachTo = nodeList[i];
			
			if (attachTo.nodeType !== 1 ) { continue; }
			
			if (!thisVal) { thisVal = attachTo; } // in the callback, what is `this`?
			
			glow.events.addListeners([attachTo], name, callback, thisVal);
			
			fire = function(nativeEvent) { // in closure: name
				domEvent = new glow.events.DomEvent(nativeEvent, {name: name});
				glow.events.fire([attachTo], name, domEvent); // fire() returns result of callback
				return !domEvent.defaultPrevented();
			};
			
			if (attachTo.addEventListener) { // like DOM2 browsers
				attachTo.addEventListener(name, fire, false);
			}
			else if (attachTo.attachEvent) { // like IE
				attachTo.attachEvent('on' + name, fire);
			}
			else { // legacy browsers?
				attachTo['on' + name] = fire; // TODO preserve existing handler
			}
		}
	}
	
	function callDomEvent(nodeList, domEvent) {
		var i = nodeList.length,
			eventName = domEvent.name,
			nativeEvent,
			node,
			fire;
		
		if (document.createEvent) {
			var nativeEvent = document.createEvent('MouseEvent'); // see: 
			nativeEvent.initEvent(eventName, true, true);
			
			fire = function(el) {
				return !el.dispatchEvent(nativeEvent);
			}
		}
		else {
			fire = function(el) {
				var nativeEvent = document.createEventObject(); 
				return el.fireEvent('on'+eventName, nativeEvent);
			}
		}
		
		while (i--) {
			node = nodeList[i];
			if (node.nodeType !== 1) { continue; }
			fire(node);
			
		}
	}
	
	/**
	@name glow.events.fire
	@function
	@param {Object[]} items      Array of objects to add listeners to
	@param {String}   eventName  Name of the event to fire
	@param {glow.events.Event|Object} [event] Event object to pass into listeners.
       You can provide a simple object of key / value pairs which will
       be added as properties of a glow.events.Event instance.
		
	@description Convenience method to fire events on multiple items at once.
		If you're wanting to fire events on a single object, use its
		'fire' method.
	*/
		
	glow.events.fire = function (items, eventName, event) {
		if (! event) {
			event = new glow.events.Event();
		}
		else if ( event.constructor === Object ) {
			event = new glow.events.Event( event )
		}
		
		// call events on DomElements fired from programatically
		if (event.constructor === glow.events.DomEvent && !event.nativeEvent) {
			callDomEvent(items, event);
		}

		for(var i = 0, len = items.length; i < len; i++) {
			callListeners(items[i], eventName, event);
		}
			
		return event;
			
	};

	/**
	 * Private method to callListeners
	 *
	 * */
	
	function callListeners(item, eventName, event) {
		var objIdent = item[psuedoPrivateEventKey],
			listenersForEvent,
			returnVal;			
		
		if (!objIdent){
			return event;
		}
			
		if (!eventListeners[objIdent]){
			return false;
		}
			
		listenersForEvent = eventListeners[objIdent][eventName];
			
		if (!listenersForEvent){
			return event;
		}
			
		listenersForEvent = listenersForEvent.slice(0);
			
		for (var i = 0, len = listenersForEvent.length; i < len; i++){
			returnVal = listenersForEvent[i][0].call(listenersForEvent[i][1], event);
			if (returnVal === false){
				event.preventDefault();
			}
		}
			
		return event;

	}
		
		
	/**
	@name glow.events.removeAllListeners
	@function
	@param {Object[]} items  Items to remove events from		    
	@description Removes all listeners attached to a given object.
		This removes not only listeners you added, but listeners others
		added too. For this reason it should only be used as part of a cleanup
		operation on objects that are about to be destroyed.
			   
		Glow will call this by default on its own classes like NodeList and
		widgets.
	*/
	
	glow.events.removeAllListeners = function (items) {
		for(var i = 0, len = items.length; i < len; i++){
			var objIdent = items[i][psuedoPrivateEventKey];
			if(!objIdent){
					return false;
			}
			else{
					delete ( eventListeners[objIdent] );
			}
		}

		return true;
	};


	/**
	@name glow.events.removeListeners
	@function
	@param {Object[]} item Item to remove events from
	@param {String} eventName Name of the event to remove
	@param {Function} callback callback
	@decription Removes listeners for given object, with the given name with the given thisVal.
		Glow will call this by default on its own classes like NodeList and
		widgets.
	*/
	
	glow.events.removeListeners = function (item, eventName, callback) {
		for(var i = 0, len = item.length; i < len; i++){	
			var objIdent = item[i][psuedoPrivateEventKey],
				listenersForEvent;
				
			if(!objIdent){
				return false;
			}
			
			if(!eventListeners[objIdent]){
				return false;
			}
		
			listenersForEvent = eventListeners[objIdent][eventName];
			if(!listenersForEvent){
				return false;
			}			
							
			for(var i = 0, len = listenersForEvent.length; i < len; i++){						
				if(listenersForEvent[i][0] == callback){
					listenersForEvent.splice(i, 1);
					break;
				}
		
			}
					
		}
		
		return true;			
	};
	
	/**
	@name glow.events.getListeners
	@function
	@param {Object[]} item  Item to find events for
	@decription Returns a list of listeners attached for the given item.

	*/	
	glow.events.getListeners = function(item){
		for(var i = 0, len = item.length; i < len; i++){
			var objIdent = item[i][psuedoPrivateEventKey];
			if(!objIdent){
					console.log("this far");
					return false;
			}
			else{
					// todo: need to return listeners in a sensible format
					return eventListeners[objIdent];
					
			}
		}

	
		return false;
	};
	
	/**
	@name glow.events.hasListener
	@function
	@param {Object[]} item  Item to find events for
	@param {String}   eventName  Name of the event to match
	@decription Returns true if an event is found for the item supplied
	
	*/
	
	glow.events.hasListener = function (item, eventName) {
		for(var i = 0, len = item.length; i < len; i++){	
			var objIdent = item[i][psuedoPrivateEventKey],
				listenersForEvent;
				
			if(!objIdent){
				return false;
			}
			
			if(!eventListeners[objIdent]){
				return false;
			}
		
			listenersForEvent = eventListeners[objIdent][eventName];
			if(!listenersForEvent){
				return false;
			}
			else{
				return true;							
			}					
		}
		
		return false;			
	};
	
	/**
	@name glow.events.Target
	@class
	@description An object that can have event listeners and fire events.
		This is a base class for objects that can fire events. You can
		extend this class to make your own objects have 'on' and 'fire'
		methods.
		
	@example
		// Ball is our constructor
		function Ball() {
	     // ...
		 }
		       
		// make Ball inherit from Target
		glow.util.extend(Ball, glow.events.Target, {
			// additional methods for Ball here, eg:
			bowl: function() {
				// ...
			}
		});
		       
		// now instances of Ball can receive event listeners
		var myBall = new Ball();
		myBall.on('bounce', function() {
			alert('BOING!');
		});
		       
		// and events can be fired from Ball instances
		    myBall.fire('bounce');
	    */
	
	glow.events.Target = function () {
			
	};

		
	/**
	@name glow.events.Target.extend
	@function
	@param {Object} obj Object to add methods to
		
	@description Convenience method to add Target instance methods onto an object.
		If you want to add events to a class, extend glow.events.Target instead.
		       
	@example
		// myApplication is a singleton
		var myApplication = {};
		       
		glow.events.Target.extend(myApplication);
		       
		// now myApplication can fire events...
		myApplication.fire('load');
		       
		// and other objects can listen for those events
		myApplication.on('load', function(e) {
			alert('App loaded');
		});
	*/
	
	glow.events.Target.extend = function (obj) {
		glow.util.apply( obj, glow.events.Target.prototype );
	};
		
	/**
	@name glow.events.Target#on
	@function
	@param {String}   eventName  Name of the event to listen for
	@param {Function} callback   Function to call when the event fires.
		The callback is passed a single event object. The type of this
		object depends on the event (see documentation for the event
		you're listening to).
	@param {Object}   [thisVal]  Value of 'this' within the callback.
		By default, this is the object being listened to.
		
	@description Listen for an event
		
	@returns this
		
	@example
		myObj.on('show', function() {
		    // do stuff
		});
	*/
	
	glow.events.Target.prototype.on = function(eventName, callback, thisVal) {
		glow.events.addListeners([this], eventName, callback, thisVal);
	}
		
	/**
	@name glow.events.Target#detach
	@function
	@param {String}   eventName  Name of the event to listen for
	@param {Function} callback   Callback to detach
	@param {Object}   [thisVal]  Value of 'this' within the callback.
		By default, this is the object being listened to.
	@description Remove an event listener
		
	@returns this
		
	@example
		function showListener() {
		    // ...
		}
		       
		// add listener
		myObj.on('show', showListener);
		       
		// remove listener
		myObj.detach('show', showListener);
		       
	@example
		// note the following WILL NOT WORK
		       
		// add listener
		myObj.on('show', function() {
		    alert('hi');
		});
		       
		// remove listener
		myObj.detach('show', function() {
			alert('hi');
		});
		       
		// this is because both callbacks are different function instances
		// YUI do it more like this:
		       
		// add listener
		var listenerHandle = myObj.on('show', function() {
			alert('hi');
		});
		       
		// remove listener
		listenerHandle.detach();
		       
		// the problem here is we lose chaining
	*/
		
	glow.events.Target.prototype.detach = function(eventName, callback) {
		glow.events.removeListeners(this, eventName, callback);
	}
		
	/**
	@name glow.events.Target#fire
	@function
	@param {String} eventName Name of the event to fire
	@param {glow.events.Event|Object} [event] Event object to pass into listeners.
		    You can provide a simple object of key / value pairs which will
		    be added as properties of a glow.events.Event instance.
		
	@description Fire an event
		
	@returns glow.events.Event
		
	@example
		myObj.fire('show');
		       
	@example
		// adding properties to the event object
		myBall.fire('bounce', {
		    velocity: 30
		});
	       
	@example
		// BallBounceEvent extends glow.events.Event but has extra methods
		myBall.fire( 'bounce', new BallBounceEvent(myBall) );
	*/
	
	glow.events.Target.prototype.fire = function(eventName, event) {			
		return callListeners(this, eventName, event);
	}
		
	/**
	@name glow.events.Event
	@class
	@param {Object} [properties] Properties to add to the Event instance.
		Each key-value pair in the object will be added to the Event as
		properties
	       
	@description Describes an event that occurred
		You don't need to create instances of this class if you're simply
		listening to events. One will be provided as the first argument
		in your callback.
	       
	@example
		// creating a simple event object
		var event = new glow.events.Event({
			velocity: 50,
			direction: 180
		});
		       
		// 'velocity' and 'direction' are simple made-up properties
		// you may want to add to your event object
		       
	@example
		// inheriting from glow.events.Event to make a more
		// specialised event object
		       
		function RocketEvent() {
		// ...
		}
		       
		// inherit from glow.events.Event
		glow.util.extend(RocketEvent, glow.events.Event, {
			getVector: function() {
				return // ...
			}
		});
		       
		// firing the event
		rocketInstance.fire( 'landingGearDown', new RocketEvent() );
		       
		// how a user would listen to the event
		rocketInstance.on('landingGearDown', function(rocketEvent) {
			var vector = rocketEvent.getVector();
		});
	*/
		
	glow.events.Event = function ( obj ) {			
		if(obj) {
			glow.util.apply(this, obj);
		}
	};
		
	/**
	@name glow.events.Event#attachedTo
	@type {Object}
	@description The object the listener was attached to.
		If null, this value will be populated by {@link glow.events.Target#fire}
	*/
		
	/**
	@name glow.events.Event#source
	@type Element
	@description The actual object/element that the event originated from.
			
		For example, you could attach a listener to an 'ol' element to 
		listen for clicks. If the user clicked on an 'li' the source property 
		would be the 'li' element, and 'attachedTo' would be the 'ol'.
	*/
		

		
	/**
	@name glow.events.Event#preventDefault
	@function
	@description Prevent the default action of the event.
		Eg, if the click event on a link is cancelled, the link
		is not followed.
		       
		Returning false from an event listener has the same effect
		as calling this function.
		       
		For custom events, it's down to whatever fired the event
		to decide what to do in this case. See {@link glow.events.Event#defaultPrevented defaultPrevented}
		       
	@example
		myLinks.on('click', function(event) {
			event.preventDefault();
		});
		       
		// same as...
		       
		myLinks.on('click', function(event) {
			return false;
		});
	*/
	
	glow.events.Event.prototype.preventDefault = function () {	
		if (this[psuedoPreventDefaultKey]) { return; }
		this[psuedoPreventDefaultKey] = true;
		if (this.nativeEvent && this.nativeEvent.preventDefault) {
			this.nativeEvent.preventDefault();
			this.nativeEvent.returnValue = false;
				
		}			
	};

		
	/**
	@name glow.events.Event#defaultPrevented
	@function
	@description Has the default been prevented for this event?
		This should be used by whatever fires the event to determine if it should
		carry out of the default action.
		
	@returns {Boolean} Returns true if {@link glow.events.Event#preventDefault preventDefault} has been called for this event.
		
	@example
		// fire the 'show' event
		// read if the default action has been prevented
		if ( overlayInstance.fire('show').defaultPrevented() == false ) {
		    // go ahead and show
		}
	*/
	
	glow.events.Event.prototype.defaultPrevented = function () {
		return !! this[psuedoPreventDefaultKey];
	};

		
	/**
	@name glow.events.Event#stopPropagation
	@function
	@description Stops the event propagating. 
		
		For DOM events, this stops the event bubbling up through event 
		listeners added to parent elements. The event object is marked as
		having had propagation stopped (see 
		{@link glow.events.Event#propagationStopped propagationStopped}).
		
	@example
		// catch all click events that are not links
		glow.events.addListener(
			document,
			'click',
			function () { alert('document clicked'); }
		);

		glow.events.addListener(
			'a',
			'click',
			function (e) { e.stopPropagation(); }
		);
	*/
	
	glow.events.Event.prototype.stopPropagation = function () {			
		if (this[psuedoStopPropagationKey]) { return; }
		this[psuedoStopPropagationKey] = true;
		var e = this.nativeEvent;
		if (e) {
			e.cancelBubble = true;
			if (e.stopPropagation) { e.stopPropagation(); }
		}
	};

		
	/**
	@name glow.events.Event#propagationStopped
	@function
	@description Tests if propagation has been stopped for this event.
		
	@returns {Boolean}		
		True if event propagation has been prevented.

	*/
	
	glow.events.Event.prototype.propagationStopped = function () {
		return !! this[psuedoStopPropagationKey];
	};
		
});