Glow.provide(function(glow) {
	var undefined, FocusableProto,
		// array of focusable instances
		focusables = [],
		// the focused element
		focused,
		// we use this to track the modal focusable, also to ensure there's only one
		modalFocusable,
		documentNodeList = glow(document);
	
	// keep track of what element has focus
	documentNodeList.on('blur', function(event) {
		focused = undefined;
		if (focusables.length) {
			// activate focusables on a timeout so we pick up a possible subsequent
			// focus event
			setTimeout(deactivateAllIfBlurred, 0);
		}
	}).on('focus', function(event) {
		if ( modalFocusable && !modalFocusable.container.contains(event.source) ) {
			// refocus either the active child or container
			( modalFocusable.activeChild[0] || modalFocusable.container[0] ).focus();
			return false;
		}
		focused = event.source;
		activateFocusables();
	});
	
	/**
		@private
		@function
		@description Deactivate all our focusables if nothing has focus
	*/
	function deactivateAllIfBlurred() {
		// if nothing has focus, deactivate our focusables
		!focused &&	activateFocusables();
	}
	
	/**
		@private
		@function
		@description React to a change in focus
	*/
	function activateFocusables() {
		// taking a copy of the array in case any destroy
		var instances = focusables.slice(0),
			i = instances.length;
		
		while (i--) {
			// activate / deactivate the focusable depending on where focus is.
			// This calls active(), passing in either the element focused (within the Focusable container) or false.
			// The 2 mentions of 'focused' is deliberate.
			instances[i].active( focused && instances[i].container.contains(focused) && focused );
		}
	}
	
	/**
		@private
		@function
		@description Update the children property for a focusable
	*/
	function updateChildren(focusable) {
		focusable.children = focusable.container.get( focusable._opts.children );
		
		// remove focusable items from the tab flow, we're going to conrol this with tab keys
		glow(focusable.children).push(focusable.container).prop('tabIndex', -1);
	}
	
	/**
		@private
		@function
		@description Create the default key handler functions
	*/
	function createKeyHandler(useLeftRight, useUpDown) {
		return function(event) {
			// listen for keypresses, react, and return false if the key was used
			switch (event.key) {
				case 'up':
					return !( useUpDown    && this.prev() );
				case 'left':
					return !( useLeftRight && this.prev() );
				case 'down':
					return !( useUpDown    && this.next() );
				case 'right':
					return !( useLeftRight && this.next() );
			}
		}
	}
	
	/**
		@private
		@description The default key handler functions
	*/
	var keyHandlers = {
		'arrows'  : createKeyHandler(1, 1),
		'arrows-x': createKeyHandler(1, 0),
		'arrows-y': createKeyHandler(0, 1)
	}
	
	/**
		@private
		@function
		@description Hover listener
			Used to focus items on hover.
			'this' is the Focusable.
	*/
	function hoverListener(event) {
		// set the _activeMethod so this can be passed onto the event
		this._activeMethod = 'hover';
		this.active(event.source);
		this._activeMethod = undefined;
	}
	
	/**
		@private
		@function
		@description Set _activeMethod to a value and call another function.
			This allows the _activeMethod to be passed to the event.
	*/
	function activeMethodWrap(focusable, methodName, func) {
		return function() {
			var returnVal;
			
			focusable._activeMethod = methodName;
			returnVal = func.apply(this, arguments);
			focusable._activeMethod = undefined;
			return returnVal;
		}
	}
	
	/**
		@name glow.ui.Focusable
		@class
		@extends glow.ui.Behaviour
		@description Manage a focusable element, or group of elements
			This can be used to create a single focus point for a set
			of focusable elements. Eg, a menu can have a single tab stop,
			and the arrow keys can be used to cycle through menu items.
			
			This means the user doesn't have to tab through every item in the
			menu to get to the next set of focusable items.
			
			The FocusManager can also be used to make a element 'modal', ensuring
			focus doesn't go to elements outside it.
			
			The aim of this behaviour is to make it easier to conform to
			<a href="http://www.w3.org/TR/2009/WD-wai-aria-practices-20091215/#keyboard">
				ARIA best practices for keyboard navigation
			</a>
			
		@param {glow.NodeList|string} container Parent focusable element of the group
			If tabindex isn't set on this element, it will be given tabindex="0",
			allowing the element to be focused using the tab key.
		@param {object} [opts] Options
			@param {string} [opts.children] Selector for child items that can be active
				These can be cycled through using the arrow keys when the Focusable
				or one of its children is active (usually when it has focus).
			@param {function|string} [opts.keyboardNav='arrows'] Alter the default keyboard behaviour.
				If 'arrows-x', the left & right arrow keys trigger {@link glow.ui.Focusable#next Focusable#next}
				and {@link glow.ui.Focusable#prev Focusable#prev} respectively. If 'arrows-y', the up & down
				arrow keys trigger {@link glow.ui.Focusable#next Focusable#next}
				and {@link glow.ui.Focusable#prev Focusable#prev} respectively. 'arrows' is
				a combination of the two.
				
				If a function is provided, it will be passed a {@link glow.events.KeyboardEvent} object.
				Use {@link glow.ui.Focusable#next Focusable#next},
				{@link glow.ui.Focusable#prev Focusable#prev} or
				{@link glow.ui.Focusable#activate Focusable#activate} to react to the
				key event.
				
				'this' inside this function refers to the Focusable.
			@param {boolean} [opts.setFocus=true] Sets whether focus is given to the active element.
				You need to set this to false if you want focus to remain in another
				element.
			@param {string} [opts.activeChildClass='active'] Class name to give the active child element.
			@param {boolean} [opts.activateOnHover=false] Activate items on hover?
			@param {boolean} [opts.loop=false] Loop from the last child item to the first (and vice-versa)?
				When this is true, calling {@link glow.ui.Focusable#next Focusable#next} when
				the last focusable item is active will activate the first.
				
		@example
			// A collection of buttons
			glow('#toolbar').focusable({
				children: '> li.button'
			});
			
			// The #toolbar now appears in tab order.
			// Once focused, the left & right arrow keys navigate between
			// buttons.
			
		@example
			// A modal dialog
			var dialog = glow('#dialog').hide();
			var focusable = dialog.focusable();
			
			glow('#openDialog').on('click', function() {
				dialog.show();
				focusable.modal(true);
			});
			
			glow('#closeDialog').on('click', function() {
				dialog.hide();
				focusable.modal(false);
			});
	*/
	function Focusable(container, opts) {
		/*!debug*/
			if (arguments.length > 2) {
				glow.debug.warn('[wrong count] glow.ui.Focusable expects 1 or 2 arguments, not ' + arguments.length + '.');
			}
			if (opts !== undefined && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.Focusable expects object for "opts" argument, not ' + typeof opts + '.');
			}
		/*gubed!*/
		
		var keyboardNav;
		
		opts = this._opts = glow.util.apply({
			children: '',
			keyboardNav: 'arrows',
			setFocus: true,
			activeChildClass: 'active'
			// commented as undefined is falsey enough
			//activateOnHover: false,
			//loop: false
		}, opts || {});
		
		this.container = glow(container);
		keyboardNav = opts.keyboardNav;
		
		// build the keyhander, using presets or provided function
		this._keyHandler = activeMethodWrap(this, 'key',
			(typeof keyboardNav === 'string' ? keyHandlers[keyboardNav] : keyboardNav)
		);
		
		/*!debug*/
			if ( !this.container[0] ) {
				glow.debug.warn('[wrong value] glow.ui.Focusable - No container found');
			}
			if (typeof this._keyHandler != 'function') {
				glow.debug.warn('[wrong value] glow.ui.Focusable - unexpected value for opts.keyboardNav');
			}
			if (typeof opts.children != 'string') {
				glow.debug.warn('[wrong type] glow.ui.Focusable expects CSS string for "opts.children" argument, not ' + typeof opts.children + '.');
			}
		/*gubed!*/
		
		// populate #children
		updateChildren(this);
		
		// create initial focal point, container or first child
		( this.children[0] || this.container[0] ).tabIndex = 0;
		
		// Add listener for activateOnHover
		if (opts.activateOnHover) {
			this.container.on('mouseover', hoverListener, this);
		}
		
		// listen for clicks
		this.container.on('click', clickChooseListener, this);
		
		// add to our array of focusables
		focusables.push(this);
	};
	glow.util.extend(Focusable, glow.ui.Behaviour);
	FocusableProto = Focusable.prototype;
	
	/**
		@name glow.ui.Focusable#_opts
		@type boolean
		@description Option object used in construction
	*/
	/**
		@name glow.ui.Focusable#_active
		@type boolean
		@description True/false to indicate if the Focusable is active
	*/
	FocusableProto._active = false;
	/**
		@name glow.ui.Focusable#_modal
		@type boolean
		@description True/false to indicate if the Focusable is modal
	*/
	FocusableProto._modal = false;
	/**
		@name glow.ui.Focusable#_disabled
		@type boolean
		@description True/false to indicate if the Focusable is enabled
	*/
	FocusableProto._disabled = false;
	/**
		@name glow.ui.Focusable#_lastActiveChild
		@type HTMLElement
		@description Stores the last value of #activeChild while the focusable is inactive
	*/
	/**
		@name glow.ui.Focusable#_keyHandler
		@type function
		@description Key handler function
	*/
	/**
		@name glow.ui.Focusable#_activeMethod
		@type string
		@description The last method used to activate a child element
	*/
	/**
		@name glow.ui.Focusable#activeChild
		@type glow.NodeList
		@description The active child item.
			This will be an empty NodeList if no child is active
	*/
	FocusableProto.activeChild = glow();
	/**
		@name glow.ui.Focusable#activeIndex
		@type number
		@description The index of the active child item in {@link glow.ui.Focusable#children}.
			This will be undefined if no child is active.
	*/
	/**
		@name glow.ui.Focusable#container
		@type glow.NodeList
		@description Focusable container
	*/
	/**
		@name glow.ui.Focusable#children
		@type glow.NodeList
		@description NodeList of child items that are managed by this Focusable.
			This will be an empty nodelist if the focusable has no children
	*/
	FocusableProto.children = glow();
	
	/**
		@name glow.ui.Focusable#modal
		@function
		@description Get/set modality
			When a Focusable is modal it cannot be deactivated, focus cannot
			be given to elements outside of it until modal set to false.
			
		@param {boolean} setModal New modal value
		
		@returns this when setting, true/false when getting
	*/
	FocusableProto.modal = function(setModal) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Focusable#modal expects 0 or 1 argument, not ' + arguments.length + '.');
			}
		/*gubed!*/
		
		if (setModal === undefined) {
			return this._modal;
		}
		
		if (!this._disabled) {
			// Activate the modal if it isn't modal already
			if (setModal && !this._modal) {
				// Ensure we're not going to get a deadlock with another focusable
				if (modalFocusable) {
					modalFocusable.modal(false);
				}
				modalFocusable = this;
				this.active(true);
			}
			// switch modal off, if this focusable is modal
			else if (!setModal && this._modal) {
				modalFocusable = undefined;
			}
			
			this._modal = !!setModal;
		}
		return this;
	};
	
	/**
		@private
		@function
		@description Focus the active child or container if focusing is enabled
	*/
	function focusActive(focusable) {
		if (focusable._opts.setFocus) {
			( focusable.activeChild[0] || focusable.container[0] ).focus();
		}
	}
	
	/**
		@private
		@function
		@description Update activeChild and activeIndex according to an index.
	*/
	function activateChildIndex(focusable, index) {
		var children = focusable.children,
			childrenLen = children.length,
			prevActiveChild = focusable.activeChild[0],
			activeChildClass = focusable._opts.activeChildClass;
		
		// take the current active item out of the tab order
		if (prevActiveChild) {
			prevActiveChild.tabIndex = -1;
			glow(prevActiveChild).removeClass(activeChildClass);
		}
		
		// ensure the index is within children range
		if (focusable._opts.loop) {
			index = index % childrenLen;
			if (index < 0) {
				index = childrenLen + index;
			}
		}
		else {
			index = Math.max( Math.min(index, childrenLen - 1), 0);
		}
		
		
		focusable.activeIndex = index;
		focusable.activeChild = glow( children[index] );
		
		// put the current active item into the tab order
		focusable.activeChild[0].tabIndex = 0;
		focusable.activeChild.addClass(activeChildClass);
	}
	
	/**
		@private
		@function
		@description Update activeChild and activeIndex according to an element
			Will also activate if child is inside one of the focusable's children.
			If child isn't inside any of the Focusable's children, orChild will be used instead
	*/
	function activateChildElm(focusable, child, orChild) {
		var i,
			children = focusable.children,
			prevActiveChild = focusable.activeChild[0],
			firstChild = children[0];
		
		// just exit if there are no child items
		if ( !firstChild ) {
			return;
		}
		
		child = glow(child).item(0);
		
		// do we have an active child to re-enable?
		if ( child[0] ) {
			i = children.length;
			
			// see if it's in the current child set
			while (i--) {
				if ( glow( children[i] ).contains(child) ) {
					activateChildIndex(focusable, i);
					return;
				}
			}
			
			// if we failed to select a child & one wasn't already active, fall back
			if ( !focusable.activeChild[0] ) {
				return activateChildElm( focusable, orChild || firstChild );
			}
		}
	}
	
	/**
		@private
		@function
		@description Deactivate the focusable
	*/
	function deactivate(focusable) {
		if ( focusable.fire('deactivate').defaultPrevented() ) {
			return;
		}
		
		// remove active class
		focusable.activeChild.removeClass(focusable._opts.activeChildClass);
		
		// store focusable so we can reactivate it later
		focusable._lastActiveChild = focusable.activeChild[0];
		
		// blur the active element
		( focusable.activeChild[0] || focusable.container[0] ).blur();
		
		focusable.activeIndex = undefined;
		
		// reset to empty nodelist
		focusable.activeChild = FocusableProto.activeChild;
		focusable._active = false;
		
		// remove listeners
		documentNodeList.detach('keypress', focusable._keyHandler).detach('keydown', keyChooseListener);
		
		// allow the container to receive focus in case the child elements change
		focusable.container.prop('tabIndex', 0);
	}
	
	/**
		@private
		@function
		@description Activate the focusable
	*/
	function activate(focusable, toActivate) {
		var _active = focusable._active,
			previousActiveChild = focusable.activeChild[0];
		
		// if currently inactive...
		if (!_active) {
			if ( focusable.fire('activate').defaultPrevented() ) {
				return;
			}
			updateChildren(focusable);
			focusable._active = true;
			// start listening to the keyboard
			documentNodeList.on('keypress', focusable._keyHandler, focusable).on('keydown', keyChooseListener, focusable);
		}
		
		// simply activating
		if (toActivate === true) {
			// we don't care if we're already active
			if (_active) { return; }
			// focus the last active child, first child, or container
			activateChildElm( focusable, focusable._lastActiveChild || focusable.children[0] );
		}
		// activating by index
		else if (typeof toActivate === 'number') {
			activateChildIndex(focusable, toActivate);
		}
		// activating by element
		else if (toActivate) {
			activateChildElm(focusable, toActivate, focusable._lastActiveChild);
		}
		
		// have we changed child focus?
		if ( previousActiveChild !== focusable.activeChild[0] ) {
			focusable.fire('childActivate', {
				item: focusable.activeChild,
				itemIndex: focusable.activeIndex,
				method: focusable._activeMethod || 'api'
			});
		}
		
		focusActive(focusable);
	}
	
	/**
		@name glow.ui.Focusable#active
		@function
		@description Get/set the active state of the Focusable
			Call without arguments to get the active state. Call with
			arguments to set the active element.
			
			A Focusable will be activated automatically when it receieves focus.
		
		@param {number|glow.NodeList|boolean} [toActivate] Item to activate.
			Numbers will be treated as an index of {@link glow.ui.FocusManager#children children}
			
			'true' will activate the container, but none of the children.
			
			'false' will deactivate the container and any active child
		
		@returns {glow.ui.Focusable|boolean}
			Returns boolean when getting, Focusable when setting
	*/
	FocusableProto.active = function(toActivate) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Focusable#active expects 0 or 1 argument, not ' + arguments.length + '.');
			}
		/*gubed!*/
		
		var _active = this._active;
		
		// getting
		if (toActivate === undefined) {
			return _active;
		}
		
		// setting
		if (!this._disabled) {
			// deactivating
			if (toActivate === false) {
				if (!this._modal && _active) {
					deactivate(this);
				}
			}
			// activating
			else {
				activate(this, toActivate)
			}
		}
		return this;
	};
	
	/**
		@private
		@function
		@description Generates #next and #prev
	*/
	function nextPrev(amount) {
		return function() {
			/*!debug*/
				if (arguments.length > 1) {
					glow.debug.warn('[wrong count] glow.ui.Focusable#' + (amount > 0 ? 'next' : 'prev') + ' expects 0 arguments, not ' + arguments.length + '.');
				}
			/*gubed!*/
			
			if (this._active) {
				this.active( this.activeIndex + amount );
			}
			return this;
		}
	}
	
	/**
		@name glow.ui.Focusable#next
		@function
		@description Activate next child item.
			Has no effect on an inactive Focusable.
		@returns this
	*/
	FocusableProto.next = nextPrev(1);
	
	/**
		@name glow.ui.Focusable#prev
		@function
		@description Activate previous child item
			Has no effect on an inactive Focusable.
		@returns this
	*/
	FocusableProto.prev = nextPrev(-1);
	
	/**
		@name glow.ui.Focusable#disabled
		@function
		@description Enable/disable the Focusable, or get the disabled state
			When the Focusable is disabled, it (and its child items) cannot
			be activated or receive focus.
			
		@param {boolean} [newState] Disable the focusable?
			'false' will enable a disabled focusable.
		
		@returns {glow.ui.Focusable|boolean}
			Returns boolean when getting, Focusable when setting
	*/
	FocusableProto.disabled = function(newState) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Focusable#disabled expects 0 or 1 argument, not ' + arguments.length + '.');
			}
		/*gubed!*/
		
		// geting
		if (newState === undefined) {
			return this._disabled;
		}
		
		// setting
		if (newState) {
			this.active(false);
			this._disabled = !!newState;
		}
		else {
			this._disabled = !!newState;
			
			// reactivate it if it were modal
			if (this._modal) {
				this.active(true);
			}
		}
		return this;
	}
	
	/**
		@name glow.ui.Focusable#destroy
		@function
		@description Destroy the Focusable
			This removes all focusable behaviour from the continer
			and child items.
			
			The elements themselves will not be destroyed.
		@returns this
	*/
	FocusableProto.destroy = function() {
		var i = focusables.length;
		
		glow.events.removeAllListeners( [this] );
		
		this.modal(false).active(false).container
			// remove listeners
			.detach('mouseover', hoverListener)
			.detach('click', clickChooseListener)
			// remove from tab order
			.prop('tabIndex', -1);
			
		this.container = undefined;
		
		// remove this focusable from the static array
		while (i--) {
			if (focusables[i] === this) {
				focusables.splice(i, 1);
				break;
			}
		}
	}
	
	/**
		@name glow.ui.Focusable#event:choose
		@event
		@description Fires when a child of the Focusable is chosen
			Items are chosen by clicking, or pressing enter when a child is active.
		
			Cancelling this event prevents the default click/key action.
		
		@param {glow.events.Event} event Event Object
		@param {glow.NodeList} event.item Item chosen
		@param {number} event.itemIndex The index of the chosen item in {@link glow.ui.Focusable#children}.
	*/
	
	/**
		@private
		@function
		@description
			Listens for click selections on the Focusable
			'this' is the Focusable.
	*/
	function clickChooseListener() {
		if ( this.activeChild[0] ) {
			return !this.fire('choose', {
				item: this.activeChild,
				itemIndex: this.activeIndex
			}).defaultPrevented();
		}
	}
	
	/**
		@private
		@function
		@description
			Same as above, but for keys
			'this' is the Focusable.
	*/
	function keyChooseListener(event) {
		if (event.key === 'return') {
			return clickChooseListener.call(this);
		}
	}
	
	/**
		@name glow.ui.Focusable#event:activate
		@event
		@description Fires when the Focusable becomes active
			Cancelling this event prevents the Focusable being actived
		
		@param {glow.events.Event} event Event Object
	*/
	
	/**
		@name glow.ui.Focusable#event:childActivate
		@event
		@description Fires when a child item of the Focusable becomes active
			Cancelling this event prevents the child item being actived
		
		@param {glow.events.Event} event Event Object
		@param {glow.NodeList} event.item Item activated.
		@param {number} event.itemIndex The index of the activated item in {@link glow.ui.Focusable#children}.
		@param {string} event.method Either 'key', 'hover' or 'api' depending on how the item was activated.
			This allows you to react to activations only if activated via a certain method
	*/
	
	/**
		@name glow.ui.Focusable#event:deactivate
		@event
		@description Fires when the Focusable becomes deactive
			Cancelling this event prevents the Focusable being deactived
		
		@param {glow.events.Event} event Event Object
	*/
	
	// EXPORT
	glow.ui.Focusable = Focusable;
});