Glow.provide(function(glow) {
	/**
	@name glow.events
	@namespace
	@description Handling custom events
	*/
	var events = {};
		
	/* storage variables */
	
	var eventListeners = {}, 
		eventId = 1, /* TODO: camelCase */
		objIdCounter = 1, 
		eventKey = '__eventId' + glow.UID; 
		
	
	/**
	@name glow.events.addListeners
	@function
	@param {Object[]} attachTo Array of objects to add listeners to.
	@param {string} name Name of the event to listen for.
		Event names are case sensitive.
	@param {function} callback Function to call when the event is fired.
		The callback will be passed a single event object. The type of this
		object depends on the event (see documentation for the event
		you're listening to).
	@param {Object} [thisVal] Value of 'this' within the callback.
		By default, this is the object being listened to.
	@see glow.events.Target#fire
	@description Convenience method to add listeners to many objects at once.
		If you want to add a listener to a single object, use its
		'on' method.
	*/
	events.addListeners = function (attachTo, name, callback, thisVal) {
		var listenerIds = [],
			objIdent,
			listener,
			eventsOnObject,
			currentListeners;
	
		//attach the event for each element, return an array of listener ids
		var i = attachTo.length;
		while (i--) {
			objIdent = attachTo[i][eventKey];
			if (!objIdent){
				objIdent = attachTo[i][eventKey] = objIdCounter++;
			}
					
			listener = [ callback, thisVal ];
			eventsOnObject = eventListeners[objIdent];
			if(!eventsOnObject){
				eventsOnObject = eventListeners[objIdent] = {};
			}
					
			currentListeners = eventsOnObject[name];
			if(!currentListeners){
				eventsOnObject[name] = [listener];
			}
			else{
				currentListeners[currentListeners.length] = listener;
			}							
		}
		return events;
	};
	
	events._getPrivateEventKey = function(node) {
		if (!node[eventKey]) {
			node[eventKey] = objid++;
		}
		
		return node[eventKey];
	}
	
	/**
	@name glow.events.fire
	@function
	@param {Object[]} items      Array of objects to add listeners to
	@param {string}   eventName  Name of the event to fire
	@param {glow.events.Event|Object} [event] Event object to pass into listeners.
       You can provide a simple object of key-value pairs which will
       be added as properties on the glow.events.Event instance.
		
	@description Convenience method to fire events on multiple items at once.
		If you want to fire events on a single object, use its
		'fire' method.
	*/
		
	events.fire = function (items, eventName, event) {
		if (! event) {
			event = new events.Event();
		}
		else if ( event.constructor === Object ) {
			event = new events.Event( event )
		}
		
		// for loop, because order matters!
		for(var i = 0, len = items.length; i < len; i++) { 
			callListeners(items[i], eventName, event);
		}
			
		return event;
	};

	
	/**
	 @name glow.events-callListeners
	 @private
	*/
	function callListeners(item, eventName, event, thisVal) {
		var objIdent = item[eventKey],
			listenersForEvent,
			returnedVal;			

		if (!objIdent || !eventListeners[objIdent]) {
			return event;
		}
				
		listenersForEvent = eventListeners[objIdent][eventName];
			
		if (!listenersForEvent) {
			return event;
		}
		// Slice to make sure we get a unique copy.
		listenersForEvent = listenersForEvent.slice(0);
		for (var i = 0, len = listenersForEvent.length; i < len; i++){
			returnVal = listenersForEvent[i][0].call((listenersForEvent[i][1] || thisVal || item), event);
			if (returnVal === false){
				event.preventDefault();
			}
		}
			
		return event;
	}
	events._callListeners = callListeners;
		
		
	/**
	@name glow.events.removeAllListeners
	@function
	@param {Object[]} items Items to remove events from		    
	@description Removes all listeners attached to a given object.
		This removes not only listeners you added, but listeners others
		added too. For this reason it should only be used as part of a cleanup
		operation on objects that are about to be destroyed.
	*/
	
	events.removeAllListeners = function (items) {
		var objIdent,
		i = items.length;		
		
		while(i--){
			
			objIdent = items[i][eventKey];
			
			if (!objIdent) {
				return false;
			}
			else {
				delete eventListeners[objIdent];
			}
		}

		return true;
	};


	/**
	@name glow.events.removeListeners
	@function
	@param {Object[]} items Items to remove events from.
	@param {string} eventName Name of the event to remove.
	@param {function} callback A reference to the original callback used when the listener was added.
	@decription Removes listeners for an event.
	*/
	events.removeListeners = function (item, eventName, callback) { /* TODO: items! */
		var objIdent,
			listenersForEvent,
			i = item.length;
		
	
		while(i--){
			
			objIdent = item[i][eventKey];
				
			if(!objIdent || !eventListeners[objIdent]){
				return events;
			}
			
		
			listenersForEvent = eventListeners[objIdent][eventName];
			if(!listenersForEvent){
				return events;
			}
			
			// for loop, because order matters
			for(var j = 0, lenj = listenersForEvent.length; j < lenj; j++){						
				if (listenersForEvent[j][0] === callback){
					listenersForEvent.splice(j, 1);
					break;
				}
		
			}
		}
		
		return events;			
	};
	
	/**
		Copies the events from one nodelist to another
		@private
		@name glow.events._copyEvent
		@see glow.NodeList#clone
		@function
	*/
	events._copyEvent = function(from, to){
		var listenersToCopy,
		i = [from].length,
		listenersForEvent,
		name,
		callback,
		thisVal;
		
		while(i--){
			
			var objIdent = [from][i][eventKey];
			
			listenersForEvent = eventListeners[objIdent];
			
				
			if(!objIdent){
					
				return false;
			}
			else{
				for ( var eventName in eventListeners[objIdent] ) {
					name = eventName;
					callback = eventListeners[objIdent][eventName][0][0];
					thisVal = eventListeners[objIdent][eventName][0][1];
				}				
				events._addDomEventListener([to], name, callback, thisVal);
		}
	
		return;
		}
		
	}
	///**
	//@name glow.events.getListeners
	//@function
	//@param {Object[]} item Item to find events for
	//@decription Returns a list of listeners attached for the given item.
	//
	//*/	
	//glow.events.getListeners = function(item){
	//	var objIdent; 
	//	for (var i = 0, len = item.length; i < len; i++) {
	//		
	//		objIdent = item[i][eventKey];
	//		
	//		if (!objIdent) {
	//			return false;
	//		}
	//		else {
	//			// todo: need to return listeners in a sensible format
	//			return eventListeners[objIdent];
	//		}
	//	}
	//
	//
	//	return false;
	//};
	//
	///**
	//@name glow.events.hasListener
	//@function
	//@param {Object[]} item  Item to find events for
	//@param {String}   eventName  Name of the event to match
	//@decription Returns true if an event is found for the item supplied
	//
	//*/
	//
	//glow.events.hasListener = function (item, eventName) {
	//	var objIdent,
	//		listenersForEvent;
	//		
	//	for (var i = 0, len = item.length; i < len; i++) {	
	//		objIdent = item[i][eventKey];
	//			
	//		if (!objIdent || !eventListeners[objIdent]) {
	//			return false;
	//		}
	//				
	//		listenersForEvent = eventListeners[objIdent][eventName];
	//		if (!listenersForEvent) {
	//			return false;
	//		}
	//		else {
	//			return true;							
	//		}					
	//	}
	//	
	//	return false;			
	//};
	
	/**
	@name glow.events.Target
	@class
	@description An object that can have event listeners and fire events.
		Extend this class to make your own objects have 'on' and 'fire'
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
	
	events.Target = function () {
			
	};
	var targetProto = events.Target.prototype;
		
	/**
	@name glow.events.Target.extend
	@function
	@param {Object} obj Object to add Target instance methods to.
		
	@description Convenience method to add Target instance methods onto an object.
		If you want to add Target methods to a class, extend glow.events.Target instead.
		       
	@example
		var myApplication = {};
		       
		glow.events.Target.extend(myApplication);
		       
		// now myApplication can fire events...
		myApplication.fire('load');
		       
		// and other objects can listen for those events
		myApplication.on('load', function(e) {
			alert('App loaded');
		});
	*/
	
	events.Target.extend = function (obj) {
		glow.util.apply( obj, glow.events.Target.prototype );
	};
		
	/**
	@name glow.events.Target#on
	@function
	@param {string} eventName Name of the event to listen for.
	@param {function} callback Function to call when the event fires.
		The callback is passed a single event object. The type of this
		object depends on the event (see documentation for the event
		you're listening to).
	@param {Object} [thisVal] Value of 'this' within the callback.
		By default, this is the object being listened to.
		
	@description Listen for an event
		
	@returns this
		
	@example
		myObj.on('show', function() {
		    // do stuff
		});
	*/
	
	targetProto.on = function(eventName, callback, thisVal) {
		glow.events.addListeners([this], eventName, callback, thisVal);
		return this;
	}
		
	/**
	@name glow.events.Target#detach
	@function
	@param {string} eventName Name of the event to remove.
	@param {function} callback Callback to detach.
	@param {Object} [thisVal] Value of 'this' within the callback.
		By default, this is the object being listened to.
	@description Remove an event listener.
		
	@returns this Target object
		
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
	
	*/
		
	targetProto.detach = function(eventName, callback) {
		glow.events.removeListeners(this, eventName, callback);
		return this;
	}
		
	/**
	@name glow.events.Target#fire
	@function
	@param {string} eventName Name of the event to fire.
	@param {glow.events.Event|Object} [event] Event object to pass into listeners.
		    You can provide a simple object of key-value pairs which will
		    be added as properties of a glow.events.Event instance.
		
	@description Fire an event.
		
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
	
	targetProto.fire = function(eventName, event) {			
		return callListeners(this, eventName, event);
	}
		
	/**
	@name glow.events.Event
	@class
	@param {Object} [properties] Properties to add to the Event instance.
		Each key-value pair in the object will be added to the Event as
		properties.
	       
	@description Describes an event that occurred.
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
		
	events.Event = function(obj) {			
		if (obj) {
			glow.util.apply(this, obj);
		}
	};
	var eventProto = events.Event.prototype;
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
	
	eventProto.preventDefault = function () {	
		this._defaultPrevented = true;		
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
	
	eventProto.defaultPrevented = function () {
		return this._defaultPrevented;
	};

	
	/* Export */
	glow.events = events;
});