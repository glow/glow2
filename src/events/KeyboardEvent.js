Glow.provide(function(glow) {
	var document = window.document,
		undefined,
        keyboardEventProto,
		$env = glow.env,
		// the keyCode for the last keydown (returned to undefined on keyup)
		activeKey,
		// the charCode for the last keypress (returned to undefined on keyup & keydown)
		activeChar,
		DomEvent = glow.events.DomEvent,
		_callListeners = glow.events._callListeners,
		_getPrivateEventKey = glow.events._getPrivateEventKey,
		// object of event names & listeners, eg:
		// {
		//    eventId: [
		//        2, // the number of glow listeners added for this node
		//        keydownListener,
		//        keypressListener,
		//        keyupListener
		//    ]
		// }
		// This lets us remove these DOM listeners from the node when the glow listeners reaches zero
		eventKeysRegistered = {}; 
	
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
		if (activeChar) {
			this.keyChar = String.fromCharCode(activeChar);
		}
		DomEvent.call(this, nativeEvent);
	}
    
    glow.util.extend(KeyboardEvent, DomEvent, {
        /** 
            @name glow.events.KeyboardEvent#key
            @type {string}
            @description The key pressed
				This is a string representing the key pressed.
				
				Alphanumeric keys are represented by 0-9 and A-Z uppercase. Other safe cross-browser values are:
				
				<dl>
					<li>backspace</li>
					<li>tab</li>
					<li>return</li>
					<li>shift</li>
					<li>alt</li>
					<li>escape</li>
					<li>space</li>
					<li>pageup</li>
					<li>pagedown</li>
					<li>end</li>
					<li>home</li>
					<li>left</li>
					<li>up</li>
					<li>right</li>
					<li>down</li>
					<li>insert</li>
					<li>delete</li>
					<li>;</li>
					<li>=</li>
					<li>-</li>
					<li>f1</li>
					<li>f2</li>
					<li>f3</li>
					<li>f4</li>
					<li>f5</li>
					<li>f6</li>
					<li>f7</li>
					<li>f8</li>
					<li>f9</li>
					<li>f10</li>
					<li>f11</li>
					<li>f12</li>
					<li>numlock</li>
					<li>scrolllock</li>
					<li>pause</li>
					<li>,</li>
					<li>.</li>
					<li>/</li>
					<li>[</li>
					<li>\</li>
					<li>]</li>
				</dl>
				
				Some keys may trigger actions in your browser and operating system, some
				are not cancelable.
                
            @example
				glow(document).on('keypress', function(event) {
					switch (event.key) {
						case 'up':
							// do stuff
							break;
						case 'down':
							// do stuff
							break;
					}
				});
        */
        key: '',
        /** 
            @name glow.events.KeyboardEvent#keyChar
            @type {string}
            @description The character entered.
                This is only available during 'keypress' events.
                
                If the user presses shift and 1, event.key will be "1", but event.keyChar
                will be "!".
                
            @example
                // only allow numbers to be entered into the ageInput field
				glow('#ageInput').on('keypress', function(event) {
					return !isNaN( Number(event.keyChar) );
				});
        */
        keyChar: ''
    });
	
	// add a dom listener
	function addListener(elm, name, callback) {
		if (elm.addEventListener) { // like DOM2 browsers	
			elm.addEventListener(name, callback, false);
		}
		else if (elm.attachEvent) { // like IE
			elm.attachEvent('on' + name, callback);
		}
	}
	
	// remove a dom listener
	function removeListener(elm, name, callback) {
		if (elm.removeEventListener) { // like DOM2 browsers	
			elm.removeEventListener(name, callback, false);
		}
		else if (elm.detachEvent) { // like IE
			elm.detachEvent('on' + name, callback);
		}
	}
	
	// takes a keyCode from a keydown listener and returns true if the browser will also fire a keypress
	function expectKeypress(keyCode, defaultPrevented) {
		var keyName;
		
		// for browsers that fire keypress for the majority of keys
		if ($env.gecko || $env.opera) {
			return !noKeyPress[keyCode];
		}
		
		// for browsers that only fire keypress for printable chars
		keyName = keyCodeToId(keyCode);
		
		// is this a printable char?
		if (keyName.length === 1 && !noKeyPress[keyCode]) {
			// webkit doesn't fire keypress if the keydown has been prevented
			return !($env.webkit && defaultPrevented);
		}
		return false;
	}
	
	// Add the key listeners for firing glow's normalised key events.
	// returns an entry for eventKeysRegistered
	function addDomKeyListeners(attachTo) {
		var keydownHandler, keypressHandler, keyupHandler,
			// Even though the user may only be interested in one key event, we need all 3 listeners to normalise any of them
			// hash of which keys are down, keyed by keyCode
			keysDown = {};
		
		keydownHandler = function(nativeEvent) {
			var keyCode = nativeEvent.keyCode,
				preventDefault,
				preventDefaultKeyPress;
			
			// some browsers repeat this event while a key is held down, we don't want to do that
			if ( !keysDown[keyCode] ) {
				activeKey = keyCode;
				activeChar = undefined;
				preventDefault = _callListeners( attachTo, 'keydown', new KeyboardEvent(nativeEvent) ).defaultPrevented();
				keysDown[keyCode] = true;
			}
			// we want to fire a keyPress event here if the browser isn't going to fire one itself
			if ( !expectKeypress(keyCode, preventDefault) ) {
				preventDefaultKeyPress = _callListeners( attachTo, 'keypress', new KeyboardEvent(nativeEvent) ).defaultPrevented();
			}
			// return false if either the keydown or fake keypress event was cancelled
			return !(preventDefault || preventDefaultKeyPress);
		};
		
		keypressHandler = function(nativeEvent) {
			// some browsers store the charCode in .charCode, some in .keyCode
			activeChar = nativeEvent.charCode || nativeEvent.keyCode;
			// some browsers fire this event for non-printable chars, look at the previous keydown and see if we're expecting a printable char
			if ( keyCodeToId(activeKey).length > 1 ) {
				// non-printable chars have an ID length greater than 1
				activeChar = undefined;
			}
			var preventDefault = _callListeners( attachTo, 'keypress', new KeyboardEvent(nativeEvent) ).defaultPrevented();
			return !preventDefault;
		};
		
		keyupHandler = function(nativeEvent) {
			var keyCode = nativeEvent.keyCode,
				preventDefault;
				
			activeKey = keyCode;
			activeChar = undefined;
			preventDefault = _callListeners( attachTo, 'keyup', new KeyboardEvent(nativeEvent) ).defaultPrevented();
			keysDown[keyCode] = false;
			activeKey = undefined;
			return !preventDefault;
		};
		
		// add listeners to the dom
		addListener(attachTo, 'keydown',  keydownHandler);
		addListener(attachTo, 'keypress', keypressHandler);
		addListener(attachTo, 'keyup',    keyupHandler);
		
		return [1, keydownHandler, keypressHandler, keyupHandler];
	}
	
	/**
		@name glow.events._addKeyListener
		@private
		@function
		@description Add listener for a key event fired by the browser.
		@see glow.NodeList#on
	*/
	glow.events._addKeyListener = function(nodeList, name, callback, thisVal) {
		var i = nodeList.length,
			attachTo,
			eventKey;
		
		// will add a unique id to this node, if there is not one already
		glow.events.addListeners(nodeList, name, callback, thisVal);
	
		while (i--) {
			attachTo = nodeList[i];

			// get the ID for this event
			eventKey = _getPrivateEventKey(attachTo);
			
			// if we've already attached DOM listeners for this, don't add them again
			if ( eventKeysRegistered[eventKey] ) {
				eventKeysRegistered[eventKey][0]++;
				continue;
			}
			else {
				eventKeysRegistered[eventKey] = addDomKeyListeners(attachTo);
			}
		}
	}
	
	/**
		Remove listener for an event fired by the browser.
		@private
		@name glow.events._removeKeyListener
		@see glow.NodeList#detach
		@function
	*/
	glow.events._removeKeyListener = function(nodeList, name, callback) {
		var i = nodeList.length,
			attachTo,
			eventKey,
			eventRegistry;
		
		// remove the glow events
		glow.events.removeListeners(nodeList, name, callback);
		
		while (i--) {
			attachTo = nodeList[i];
			
			// get the ID for this event
			eventKey = _getPrivateEventKey(attachTo);
			eventRegistry = eventKeysRegistered[eventKey];
			// exist if there are no key events registered for this node
			if ( !eventRegistry ) {
				return;
			}
			if ( --eventRegistry[0] === 0 ) {
				// our glow listener count is zero, we have no need for the dom listeners anymore
				removeListener( attachTo, 'keydown',   eventRegistry[1] );
				removeListener( attachTo, 'keypress',  eventRegistry[2] );
				removeListener( attachTo, 'keyup',     eventRegistry[3] );
				eventKeysRegistered[eventKey] = undefined;
			}
		}
	}
	
	// convert a keyCode to a string name for that key
	function keyCodeToId(keyCode) {
		// key codes for 0-9 A-Z are the same as their char codes
		if ( (keyCode >= keyCodeA && keyCode <= keyCodeZ) || (keyCode >= keyCode0 && keyCode <= keyCode9) ) {
			return String.fromCharCode(keyCode).toLowerCase();
		}
		return keyIds[keyCode] || 'unknown' + keyCode;
	}
	
	// keyCode to key name translation
	var keyCodeA = 'A'.charCodeAt(0),
		keyCodeZ = 'Z'.charCodeAt(0),
		keyCode0 = '0'.charCodeAt(0),
		keyCode9 = '9'.charCodeAt(0),
		// key codes for non-alphanumeric keys
		keyIds = {
			8: 'backspace',
			9: 'tab',
			13: 'return',
			16: 'shift',
			17: 'control',
			18: 'alt',
			19: 'pause',
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
			44: 'printscreen', // Only fires keyup in firefox, IE. Doesn't fire in webkit, opera.
			45: 'insert',
			46: 'delete',
			59: ';',
			61: '=',
			91: 'meta',
			93: 'menu', // no keycode in opera, doesn't fire in Chrome
			
			// these are number pad numbers, but Opera doesn't distinguish them from normal number keys so we normalise on that
				96: '0', 
				97: '1',
				98: '2',
				99: '3',
				100: '4',
				101: '5',
				102: '6',
				103: '7',
				104: '8',
				105: '9',
				106: '*', // opera fires 2 keypress events
				107: '+', // opera fires 2 keypress events
				109: '-', // opera sees - as insert
				110: '.', // opera sees this as n
				111: '/',
			// end of numpad
			
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
			144: 'numlock',
			145: 'scrolllock',
			188: ',',
			189: '-',
			190: '.',
			191: '/',
			192: "'",
			219: '[',
			220: '\\',
			221: ']',
			222: '#', // opera sees # key as 3. Pah.
			223: '`',
			224: 'meta', // same as [ in opera
			226: '\\' // this key appears on a US layout in webkit windows
		},
		noKeyPress = {};
	
	// corrections for particular browsers :(
	if ($env.gecko) {
		keyIds[107] = '=';
		
		noKeyPress = {
			16: 1,  // shift
			17: 1,  // control
			18: 1,  // alt
			144: 1, // numlock
			145: 1  // scrolllock
		};
	}
	else if ($env.opera) {
		keyIds[42] = '*';
		keyIds[43] = '+';
		keyIds[47] = '/';
		keyIds[222] = "'";
		keyIds[192] = '`';
		
		noKeyPress = {
			16: 1,  // shift
			17: 1,  // control
			18: 1   // alt
		};
	}
	else if ($env.webkit || $env.ie) {
		keyIds[186] = ';';
		keyIds[187] = '=';
	}
	
	// export
	glow.events.KeyboardEvent = KeyboardEvent;
});