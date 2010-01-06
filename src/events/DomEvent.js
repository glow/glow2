Glow.provide(function(glow) {
	var document = window.document,
		undefined;
	
	/** 
		@name glow.events.DomEvent
		@constructor
		@extends glow.events.Event
		
		@param {Event} nativeEvent A native browser event read properties from
		
		@param {Object} [properties] Properties to add to the Event instance.
		   Each key-value pair in the object will be added to the Event as
		   properties
		
		@description Describes a DOM event that occurred
		   You don't need to create instances of this class if you're simply
		   listening to events. One will be provided as the first argument
		   in your callback.
	*/
	function DomEvent(nativeEvent, properties) {}
	var DomEventProto = DomEvent.prototype;
	
	/** 
		@name glow.events.DomEvent#altKey
		@type {boolean}
		@description Was the alt key pressed during the event?
	*/
	
	/**
		@name glow.events.DomEvent#button
		@type {number}
		@description A number representing which button was pressed.
			0 for the left button, 1 for the middle button or 2 for the right button.
	*/
	
	/** 
		@name glow.events.DomEvent#ctrlKey
		@type {boolean}
		@description Was the ctrl key pressed during the event?
	*/
	
	/** 
		@name glow.events.DomEvent#mouseLeft
		@type {number}
		@description The horizontal position of the mouse pointer in the page in pixels.
	*/
	
	/** 
		@name glow.events.DomEvent#mouseTop
		@type {number}
		@description The vertical position of the mouse pointer in the page in pixels.
	*/
	
	/** 
		@name glow.events.DomEvent#related
		@type {HTMLElement}
		@description A related HTMLElement
			For mouseover / mouseenter events, this will refer to the previous element
			the mouse was over.
			
			For mouseout / mouseleave events, this will refer to the element the mouse
			is now over.
	*/
	
	/** 
		@name glow.events.DomEvent#shiftKey
		@type {boolean}
		@description Was the shift key pressed during the event?
	*/
	
	/** 
		@name glow.events.DomEvent#source
		@type {HTMLElement}
		@description The element that the event originated from.
			For example, you could attach a listener to an <ol> element to listen for
			clicks. If the user clicked on an <li> the source property would be the
			<li> element, and {@link glow.DomEvent#attachedTo attachedTo} would be
			the <ol>.
	*/
	
	/** 
		@name glow.events.DomEvent#wheelData
		@type {number}
		@description The number of clicks the mouse wheel moved.
			Up values are positive, down values are negative.
	*/
	
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