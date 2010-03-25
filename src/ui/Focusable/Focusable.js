Glow.provide(function(glow) {
	var undefined, FocusableProto;
	
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
			
			If an item out-of-view is activated, the browser will scroll
			that item into view.
			
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
			@param {function|string} [opts.keyboardNav='updownleftright'] Alter the default keyboard behaviour.
				If 'leftright', the left & right arrow keys trigger {@link glow.ui.Focusable#next Focusable#next}
				and {@link glow.ui.Focusable#prev Focusable#prev} respectively. If 'updown', the up & down
				arrow keys trigger {@link glow.ui.Focusable#next Focusable#next}
				and {@link glow.ui.Focusable#prev Focusable#prev} respectively. 'leftrightupdown' is
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
			@param {string} [opts.activeClassName='active'] Class name to give the active element.
			@param {boolean} [opts.activateOnHover=false] Activate items on hover?
			@param {boolean} [opts.loop=false] Loop from the last child item to the first (and vice-versa)?
				When this is true, calling {@link glow.ui.Focusable#next Focusable#next} when
				the last focusable item is active will activate the first.
				
		@example
			// A collection of buttons
			glow('#toolbar').focusable({
				children: 'a.button'
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
	function Focusable(container, opts) {};
	glow.util.extend(Focusable, glow.ui.Behaviour);
	FocusableProto = Focusable.prototype;
	
	// NOTE: https://developer.mozilla.org/En/DOM/Element.scrollIntoView may be useful
	
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
			This will be undefined if no child is active
	*/
	
	/**
		@name glow.ui.Focusable#children
		@type glow.NodeList
		@description NodeList of child items that are managed by this Focusable.
	*/
	FocusableProto.children = glow();
	
	/**
		@name glow.ui.Focusable#modal
		@function
		@description Get/set modality
			When a Focusable is modal it cannot be deactivated, focus cannot
			be given to elements outside of it until modal set to false.
			
		@param {boolean} val New modal value
		
		@returns this when setting, true/false when getting
	*/
	FocusableProto.modal = function(val) {};
	
	/**
		@name glow.ui.Focusable#activate
		@function
		@description Activate the Focusable or a particular child item
			A Focusable will be activated automatically when it receieves focus.
		
		@param {number|glow.NodeList} [itemToActivate] Item to activate.
			Numbers will be treated as an index of {@link glow.ui.FocusManager#children children}
			
			By default, the previous item activated will be reactivated. Otherwise
			the first child will be activated.
		
		@returns this
	*/
	FocusableProto.activate = function(itemToActivate) {};
	
	/**
		@name glow.ui.Focusable#deactivate
		@function
		@description Deactivate the Focusable
			This will also deactivate any active child item
		@returns this
	*/
	FocusableProto.deactivate = function() {};
	
	/**
		@name glow.ui.Focusable#next
		@function
		@description Activate next child item
		@returns this
	*/
	FocusableProto.next = function() {};
	
	/**
		@name glow.ui.Focusable#prev
		@function
		@description Activate previous child item
		@returns this
	*/
	FocusableProto.prev = function() {};
	
	/**
		@name glow.ui.Focusable#disable
		@function
		@description Disable/enable the Focusable
			When the Focusable is disabled, it (and its child items) cannot
			be activated or receive focus.
		@returns this
	*/
	// TODO: can we inherit this from somewhere?
	// Also, should change this method name to match ui.Widget
	
	/**
		@name glow.ui.Focusable#destroy
		@function
		@description Destroy the Focusable
			This removes all focusable behaviour from the continer
			and child items.
			
			The elements themselves will not be destroyed.
		@returns this
	*/
	// TODO: can we inherit this?
	
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