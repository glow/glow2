
/**
	@name glow.events
	@namespace
	@description Native browser and custom events
 */

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		glow.events.addListeners = function () {
			

		};
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
		/**
		@name glow.events.fire
		@function
		@param {Object[]} items      Array of objects to add listeners to
		@param {String}   eventName  Name of the event to fire
		@param {glow.events.Event|Object} [Event]  Event object to pass into listeners.
		       You can provide a simple object of key / value pairs which will
		       be added as properties of a glow.events.Event instance.
		
		@description Convenience method to fire events on multiple items at once.
		       If you're wanting to fire events on a single object, use its
		       'on' method.
	       */
		glow.events.fire = function () {
			

		};
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
		/**
		@name glow.events.removeAllListeners
		@function
		@param {Object[]} items  Items to remove events from
		    
		@description Removes all listeners attached to a given object.
			Yhis removes not only listeners you added, but listeners others
			added too. For this reason it should only be used as part of a cleanup
			operation on objects that are about to be destroyed.
			   
			Glow will call this by default on its own classes like NodeList and
			widgets.
		   */
		glow.events.removeAllListeners = function () {
			

		};
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		       glow.lang.extend(Ball, glow.events.Target, {
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
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		glow.events.Target.extend = function () {
			

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
		
		/**
		@name glow.events.Target#removeListener
		@function
		@param {String}   eventName  Name of the event to listen for
		@param {Function} callback   Callback to detach
		
		@description Remove an event listener
		
		@returns this
		
		@example
		       function showListener() {
			       // ...
		       }
		       
		       // add listener
		       myObj.on('show', showListener);
		       
		       // remove listener
		       myObj.removeListener('show', showListener);
		       
		@example
		       // note the following WILL NOT WORK
		       
		       // add listener
		       myObj.on('show', function() {
			       alert('hi');
		       });
		       
		       // remove listener
		       myObj.removeListener('show', function() {
			       alert('hi');
		       });
		       
		       // this is because both callbacks are different function instances
		       // YUI do it more like this:
		       
		       // add listener
		       var listenerHandle = myObj.on('show', function() {
			       alert('hi');
		       });
		       
		       // remove listener
		       listenerHandle.remove();
		       
		       // the problem here is we lose chaining
	       */
		
		/**
		@name glow.events.Target#fire
		@function
		@param {String} eventName Name of the event to fire
		@param {glow.events.Event|Object} [Event] Event object to pass into listeners.
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
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		       glow.lang.extend(RocketEvent, glow.events.Event, {
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
		*/
		glow.events.Event = function ( obj ) {
			if( obj ) {
				glow.lang.apply( this, obj );
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
		@name glow.events.Event#pageX
		@type Number
		@description The horizontal position of the mouse pointer in the page in pixels.
		
			<p><em>Only available for mouse events.</em></p>
		*/
		
		/**
		@name glow.events.Event#pageY
		@type Number
		@description The vertical position of the mouse pointer in the page in pixels.
		
			<p><em>Only available for mouse events.</em></p>
		*/
		
		/**
		@name glow.events.Event#button
		@type Number
		@description  A number representing which button was pressed.
		
			<p><em>Only available for mouse events.</em></p>
			
			0 for the left button, 1 for the middle button or 2 for the right button.
		*/

		/**
		@name glow.events.Event#relatedTarget
		@type Element
		@description The element that the mouse has come from or is going to.
		
			<p><em>Only available for mouse over/out events.</em></p>
		*/
		
		/**
		@name glow.events.Event#wheelDelta
		@type Number
		@description The number of clicks up (positive) or down (negative) that the user moved the wheel.
		
			<p><em>Only available for mouse wheel events.</em></p>
		*/
		
		/**
		@name glow.events.Event#ctrlKey
		@type Boolean
		@description Whether the ctrl key was pressed during the key event.
		
			<p><em>Only available for keyboard events.</em></p>
		*/
		
		/**
		@name glow.events.Event#shiftKey
		@type Boolean
		@description  Whether the shift key was pressed during the key event.
		
			<p><em>Only available for keyboard events.</em></p>
		*/
		
		/**
		@name glow.events.Event#altKey
		@type Boolean
		@description Whether the alt key was pressed during the key event.
		
			<p><em>Only available for keyboard events.</em></p>
		*/
		
		/**
		@name glow.events.Event#capsLock 			
		@type Boolean | Undefined
		@description Whether caps-lock was on during the key event
		
			<p><em>Only available for keyboard events.</em></p>
		
			If the key is not alphabetic, this property will be undefined 
			as it is not possible to tell if caps-lock is on in this scenario.
		*/
		
		/**
		@name glow.events.Event#keyCode
		@type Number
		@description An integer number represention of the keyboard key that was pressed.
		
			<p><em>Only available for keyboard events.</em></p>
		*/
		
		/**
		@name glow.events.Event#key
		@type String | Undefined
		@description  A short identifier for the key for special keys.
		
			<p><em>Only available for keyboard events.</em></p>
			
			If the key was not a special key this property will be undefined.
			
			See the list of key identifiers in {@link glow.events.addKeyListener}
		*/
		
		/**
		@name glow.events.Event#charCode
		@type Number | Undefined
		@description The unicode character code for a printable character.
		
			<p><em>Only available for keyboard events.</em></p>
			
			This will be undefined if the key was not a printable character.
		*/
		
		/**
		@name glow.events.Event#chr
		@type String
		@description A printable character string.
		
			<p><em>Only available for keyboard events.</em></p>
			
			The string of the key that was pressed, for example 'j' or 's'.
			
			This will be undefined if the key was not a printable character.
		*/
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		};
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
	}
});

//-----------------------------------------------------------------

Glow.provide({
	version: 'src',
	builder: function(glow) {
		glow.events = glow.events || {};
		
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
		
		//cleanup to avoid mem leaks in IE
		if (glow.env.ie < 8 || glow.env.webkit < 500) {
			r.addListener(window, "unload", clearEvents);
		}
	}
});