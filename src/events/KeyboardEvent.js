Glow.provide(function(glow) {
	var document = window.document,
		undefined,
        keyboardEventProto;
	
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
    
    glow.util.extend(KeyboardEvent, glow.events.Event, {
        /** 
            @name glow.events.KeyboardEvent#key
            @type {string}
            @description The key pressed
				This is a string representing the key pressed.
				
				Alphanumeric keys are represented by 0-9 and A-Z uppercase. Other values include:
				
				<dl>
					<dt>esc</dt>
					<dd>Escape key</dd>
				</dl>
                
            @example
                var keys = glow.events.KeyboardEvent.keys;
                switch (event.key) {
                    case 'esc':
                        // do stuff
                        break;
                    case 'shift':
                        // do stuff
                        break;
                }
        */
        key: undefined,
        /** 
            @name glow.events.KeyboardEvent#keyChar
            @type {string}
            @description The string of the key pressed
                This is only available for 'keypress' events.
                
            @example
                // prevent non-numbers being entered
                return !isNaN( Number(event.keyChar) );
        */
        keyChar: undefined
    });
	
	/**
		@name glow.events.KeyboardEvent.keys
		@namespace
		@description Constants for keys.
	*/
	
	// export
	glow.events.KeyboardEvent = KeyboardEvent;
});