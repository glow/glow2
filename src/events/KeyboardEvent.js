Glow.provide(function(glow) {
	var document = window.document,
		undefined;
	
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
	function KeyboardEvent() {}
	
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
	*/
	
	// export
	glow.events.KeyboardEvent = KeyboardEvent;
});