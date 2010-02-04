Glow.provide(function(glow) {
	var document = window.document,
		undefined,
        keyboardEventProto,
		// the keyCode for the last keydown (returned to undefined on keyup)
		activeKey,
		// the charCode for the last keypress (returned to undefined on keyup & keydown)
		activeChar,
		DomEvent = glow.events.DomEvent;
	
	function keyCodeToId(keyCode) {
		// key codes for 0-9 A-Z are the same as their char codes
		if ( (keyCode >= keyCodeA && keyCode <= keyCodeZ) || (keyCode >= keyCode0 && keyCode <= keyCode9) ) {
			return String.fromCharCode(keyCode).toLowerCase();
		}
		return keyIds[keyCode]
	}
	
	/** 
		@name glow.events.KeyboardEvent
		@constructor
		@extends glow.events.DomEvent
		
		@param {Event} nativeEvent A native browser event read properties from
		
		@param {Object} [properties] Properties to add to the Event instance.
		   Each key-value pair in the object will be added to the Event as
		   properties
		
		@description Describes a keyboard event that occurred
		   You don't need to create instances of this class if you're simply
		   listening to events. One will be provided as the first argument
		   in your callback.
	*/
	function KeyboardEvent(nativeEvent) {
		if (activeKey) {
			this.key = keyCodeToId(activeKey);
		}
		DomEvent.call(this, nativeEvent);
	}
    
    glow.util.extend(KeyboardEvent, DomEvent, {
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
            @description The character entered.
                This is only available for 'keypress' events.
                
            @example
                // prevent non-numbers being entered
                return !isNaN( Number(event.keyChar) );
        */
        keyChar: undefined
    });
	
	
	var eventKeysRegistered = {};  // stores which event keys we've added listeners for
	
	function addListener(elm, name, callback) {
		if (elm.addEventListener) { // like DOM2 browsers	
			elm.addEventListener(name, callback, false);
		}
		else if (elm.attachEvent) { // like IE
			elm.attachEvent('on' + name, callback);
		}
	}
	
	// takes a keyCode from a keydown listener and returns true if the browser will also fire a keypress
	function expectKeypress(keyCode) {
		if (glow.env.gecko) {
			return true;
		}
		
		var keyName = keyCodeToId(keyCode);
		
		if (keyName.length === 1) {
			return true;
		}
		return false;
	}
	
	/**
		@name glow.events._addKeyEventListener
		@private
		@function
		@description Add listener for a key event fired by the browser.
		@see glow.NodeList#on
		
	*/
	glow.events._addKeyEventListener = function(nodeList, name, callback, thisVal) {
		var i = nodeList.length,
			attachTo,
			id;
		
		// will add a unique id to this node, if there is not one already
		glow.events.addListeners(nodeList, name, callback, thisVal || attachTo);
	
		while (i--) {
			attachTo = nodeList[i];

			// get the ID for this event
			id = glow.events._getPrivateEventKey(attachTo);
			
			// if we've already attached DOM listeners for this, don't add them again
			if (eventKeysRegistered[id]) {
				continue;
			}
			
			eventKeysRegistered[id] = true;
			
			// Even though the user may only be interested in one key event, we need all 3 listeners to normalise any of them
			(function(attachTo) {
				// hash of which keys are down, keyed by keyCode
				var keysDown = {};
				
				addListener(attachTo, 'keydown', function(nativeEvent) {
					var keyCode = nativeEvent.keyCode;
					
					// some browsers repeat this event while a key is held down, we don't want to do that
					if ( !keysDown[keyCode] ) {
						activeKey = keyCode;
						activeChar = undefined;
						glow.events._callListeners( attachTo, 'keydown', new KeyboardEvent(nativeEvent) );
						keysDown[keyCode] = true;
					}
					// we want to fire a keyPress event here for non-printable chars
					if ( !expectKeypress(keyCode) ) {
						glow.events._callListeners( attachTo, 'keypress', new KeyboardEvent(nativeEvent) );
					}
				});
				
				addListener(attachTo, 'keypress', function(nativeEvent) {
					glow.events._callListeners( attachTo, 'keypress', new KeyboardEvent(nativeEvent) );
					activeChar = nativeEvent.charCode || nativeEvent.keyCode;
				});
				
				addListener(attachTo, 'keyup', function(nativeEvent) {
					glow.events._callListeners( attachTo, 'keyup', new KeyboardEvent(nativeEvent) );
					keysDown[nativeEvent.keyCode] = false;
					activeKey = undefined;
					activeChar = undefined;
				});
			})(attachTo); // get a reference to this particular attachTo value
		}
	}
	
	var keyCodeA = 'A'.charCodeAt(0),
		keyCodeZ = 'Z'.charCodeAt(0),
		keyCode0 = '0'.charCodeAt(0),
		keyCode9 = '9'.charCodeAt(0),
		// key codes for non-alphanumeric keys
		keyIds = {
			8: 'backspace',
			9: 'tab',
			13: 'return',
			14: 'enter',
			16: 'shift',
			17: 'control',
			18: 'alt',
			20: 'capslock',
			27: 'escape',
			32: 'space',
			33: 'pageup',
			34: 'pagedown',
			35: 'end',
			36: 'home',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			44: 'printscreen',
			45: 'insert',
			46: 'delete',
			59: ';',
			61: '=',
			93: 'menu',
			96: 'numpad0',
			97: 'numpad1',
			98: 'numpad2',
			99: 'numpad3',
			100: 'numpad4',
			101: 'numpad5',
			102: 'numpad6',
			103: 'numpad7',
			104: 'numpad8',
			105: 'numpad9',
			106: '*',
			107: '+',
			109: '-',
			110: '.',
			111: '/',
			112: 'f1',
			113: 'f2',
			114: 'f3',
			115: 'f4',
			116: 'f5',
			117: 'f6',
			118: 'f7',
			119: 'f8',
			120: 'f9',
			121: 'f10',
			122: 'f11',
			123: 'f12',
			124: 'f13',
			125: 'f14',
			126: 'f15',
			127: 'f16',
			128: 'f17',
			129: 'f18',
			130: 'f19',
			131: 'f20',
			132: 'f21',
			133: 'f22',
			134: 'f23',
			135: 'f24',
			144: 'numlock',
			145: 'scrolllock',
			188: ',',
			190: '.',
			191: '/',
			192: "'",
			219: '[',
			220: '\\',
			221: ']',
			222: '#',
			224: 'meta'
		};
	
	// export
	glow.events.KeyboardEvent = KeyboardEvent;
});