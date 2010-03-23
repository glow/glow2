Glow.provide(function(glow) {
	var undefined;

/**
	@name glow.ui.Widget
	@constructor
	@param {string} name The name of this widget.
	This is added to class names in the generated DOM nodes that wrap the widget interface.
	@extends glow.events.Target
	@description The Widget class serves as a base class that provides a shared framework on which other, more specific, widgets can be implemented. While it is possible to create an instance of this generic widget, it is more likely that your widget class will extend this class.
	@example
	
		function MyWidget() {
			this.value = 0;
			this.disabled = false;
			
			//call the base class's constructor
			this.base = arguments.callee.base.call(this, 'mywidget');
		}
		glow.util.extend(MyWidget, glow.ui.Widget);
	
	@property {boolean} rendered (read-only) Set to true when a widget's render stage is complete.
	@property {boolean} destroyed (read-only) Set to true when a widget's destroy stage is complete.
	@property {glow.NodeList} container (read-only) The outermost wrapper element added by glow.ui.Widget.
	The wrapper's purpose is to maintain state and theme information. If you wish to move your widget you must move your
	widget's container, otherwise you will lose all state and theme information along with their associated styles.
	@property {glow.NodeList} content (read-only) The first child element inside the wrapper elements added by glow.ui.Widget.
	This is often passed into the widget's constructor, and refers to an existing element on the page.
	The intent of this element is to hold the content of your widget.
	@property {boolean} disabled (read-only) Set to true when a widget becomes disabled.
	@property {boolean} localeName (read-only) Set to the name of the locale when that is changed.
 */
	var Widget = function(name) {
		/*!debug*/
			if (arguments.length !== 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget expects 1 argument, not '+arguments.length+'.');
			}
			else if (typeof arguments[0] !== 'string') {
				glow.debug.warn('[wrong type] glow.ui.Widget expects argument 1 to be of type string, not '+typeof arguments[0]+'.');
			}
		/*gubed!*/
		
		this.name = name;
		this.rendered = false;
		this.destroyed = false;
		this.disabled = false;
		this.localeName = (this.localeName || 'en'); // todo: default should come from i18n module
		
		// constructor called from subclass? return reference back to the superclasses prototype
		if (this.constructor !== Widget) { return this.constructor.base.prototype; }
	}
	glow.util.extend(Widget, glow.events.Target); // Widget is a Target

/**
	@developer
	@name glow.ui.Widget#tie
	@method
	@param {glow.ui.Widget} ... Child widgets to synchronize with.
	@description Specify a group of widgets that should stay in sync with this one.
	These synced widgets can listen for a `sync` event on themselves, defining their own handler for the provided event.
	The disabled and locale methods automatically synchronize with their synced child widgets.
	@example
		function MyWidget() {
			this.value = 0; // initially
			
			// this widget handles notifications of new values
			// from other widgets it is syced to
			var that = this;
			this.on('sync', function(e) {
				if (typeof e.newValue !== undefined) {
					that.value = e.newValue;
				}
			});	
		}
		glow.util.extend(MyWidget, glow.ui.Widget); // MyWidget extends the Base Widget
		
		MyWidget.prototype.setValue = function(n) {
			this.value = n;
			
			// this widget notifies about changes to its value
			this.sync({newValue: this.value});
		}
		
		// widgets b and c will all be notified when a's value changes
		var a = new MyWidget('A');
		var b = new MyWidget('B');
		var c = new MyWidget('C');
		
		a.tie(b, c);
		
		a.setValue(1); // a, b, and c all have a value of 1 now
 */
	Widget.prototype.tie = function(/*...*/) {
		/*!debug*/
			if (arguments.length === 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#tie expects at least 1 argument, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var observers = Array.prototype.slice.call(arguments);
		
		var i = observers.length;
		while (i--) {
			(function (observer) {
				glow.events.addListeners([observer], 'sync', function(e) {
					// handle notifications about changes to the disabled state
					if (e.disabled !== undefined) {
						observer.fire('disable', e);
						if (!e.defaultPrevented()) { applyDisable.call(observer, e.disabled); observer.fire('_notify', e); }
					}
					
					// handle notifications about changes to the localeName
					if (e.localeName !== undefined) {
						observer.fire('locale', e);
						if (!e.defaultPrevented()) { observer.localeName = e.localeName; observer.fire('_notify', e); }
					}
				});
			})(observers[i]);
		}
		
		// notify all synced observers when this receives a sync event
		this.on('_notify', function(e) { glow.events.fire(observers, 'sync', e); });
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#sync
	@method
	@param {object} [changes] Key/value collection of new information. Will be added to the listeners' event.
	@description Tell all widgets synced with this widget about any changes.
 */
	Widget.prototype.sync = function(changes) { // public shortcut to fire _notify
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#sync expects 1 or fewer arguments, not '+arguments.length+'.');
			}
			
			if (arguments.length && typeof changes !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.Widget#sync expects argument 1 to be of type object, not '+(typeof changes)+'.');
			}
		/*gubed!*/
		
		changes = changes || {};
		
		// _notify should only be used internally
		this.fire( '_notify', new glow.events.Event(changes) );
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#disable
	@method
	@description Sets the disabled property of this widget to true and fires the disable event.
	If other widgets are synced with this one, they will become disabled too.
	@param {boolean} [state=true] 
	@see glow.ui.Widget#enable
	
	@example
		var a = new MyWidget();
		var b = new MyWidget();
		var c = new MyWidget();
		
		c.tie(a, b);
		
		c.disable(); // a, b, and c are now disabled
 */
	Widget.prototype.disable = function(_b) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#disable expects 1 or fewer arguments, not '+arguments.length+'.');
			}
			
			if (arguments.length && typeof _b !== 'boolean') {
				glow.debug.warn('[wrong type] glow.ui.Widget#disable expects argument 1 to be of type boolean, not '+(typeof changes)+'.');
			}
		/*gubed!*/
		
		var e,
			disabled = (typeof _b === 'boolean')? _b : true;
		
		e = new glow.events.Event({disabled: disabled});
		this.fire('disable', e);
		
		// notify observing widgets about this change
		if (!e.defaultPrevented()) {
			applyDisable.call(this, e.disabled);
			this.fire('_notify', e);
		}
		
		return this;
	}
	
	function applyDisable(disabledState) {
		if (this.attached && this.container) {
			if (disabledState) { 
				this.container.get('.glowCSSVERSION-' + this.name + '-state').addClass('disabled');
			}
			else {
				this.container.get('.glowCSSVERSION-' + this.name + '-state').removeClass('disabled');
			}
		}

		this.disabled = disabledState;
	}

/**
	@developer
	@name glow.ui.Widget#enable
	@method
	@description Sets the disabled property of this widget to false and fires the disable event.
	If other widgets are synced with this one, they will become enabled too.
	
	@see glow.ui.Widget#disable
	
	@example
		var a = new MyWidget();
		var b = new MyWidget();
		var c = new MyWidget();
		
		c.tie(a, b);
		
		c.enable(); // a, b, and c are now enabled
 */
	Widget.prototype.enable = function() {
		/*!debug*/
			if (arguments.length > 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#enable expects 0 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		this.disable(false);
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#locale
	@method
	@param {string} localeName
	@description Sets the locale name of this module and fires the locale event.
	If other widgets are synced with this one, they will have their locale changed too.
	
	@example
		myWidget.locale('cy');
 */
	Widget.prototype.locale = function(localeName) {
		/*!debug*/
			if (arguments.length !== 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#locale expects 1 argument, not '+arguments.length+'.');
			}
			
			if (typeof localeName !== 'string') {
				glow.debug.warn('[wrong type] glow.ui.Widget#locale expects argument 1 to be of type string, not '+(typeof changes)+'.');
			}
		/*gubed!*/
		
		var e;
		
		this.localeName = localeName;
		
		e = new glow.events.Event({localeName: this.localeName});
		this.fire('locale', e);
		
		// notify observing widgets about this change
		if (!e.defaultPrevented()) { this.fire('_notify', e); }
		
		return this;
	}
/**
	@developer
	@name glow.ui.Widget#init
	@function
	@param {object} [opts]
	@description Augment this method with your own functionality that deals with configuring and intializing this widget.
	@fires glow.ui.Widget#event:init
	@example
		function MyWidget(opts) {
			this.init(opts);
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.ui.Widget);
		
		MyWidget.prototype.init = function(opts) {
		
			// do your own initializing stuff here
			
			// call the base class's init
			this.constructor.base.prototype.init.apply(this, opts);
		}
	
	@example
		function MyWidget(opts) {
			this.on('init', function(e) {
				// do your own initializing stuff
			});
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.ui.Widget);
 */
	Widget.prototype.init = function(opts) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#init expects 1 or fewer arguments, not '+arguments.length+'.');
			}
			
			if (arguments.length && typeof opts !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.Widget#init expects argument 1 to be of type object, not '+(typeof changes)+'.');
			}
		/*gubed!*/
		
		var e;
		
		e = new glow.events.Event({opts: (opts || {})});
		this.fire('init', e);
		
		if (!e.defaultPrevented()) { this.initialized = true; }
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#attach
	@function
	@description Augment this method with your own functionality that deals with binding to any HTML elements used by this widget.
	@param {selector|HTMLElement|NodeList} container
	@param {object} [opts]
	@param {string} [opts.addClass] Class name to add to the generated DOM nodes that wrap this widget.
	@param {string} [opts.addId]  Id to add to the generated DOM nodes that wrap this widget.
 */
	Widget.prototype.attach = function(content, opts) {
		/*!debug*/
			if (arguments.length < 1 || arguments.length > 2) {
				glow.debug.warn('[wrong count] glow.ui.Widget#attach expects 1 or 2 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var e,
			opts = opts || {};
		
		this.content = new glow.NodeList(content);
		
		/*!debug*/
			if (this.content.length < 1) {
				glow.debug.warn('[error] glow.ui.Widget#attach expects a content node to attach to. The given `content` argument was empty or not found.');
			}
		/*gubed!*/
		
		e = new glow.events.Event();
		this.fire('attach', e);
		
		if (!e.defaultPrevented()) {
			this.content.addClass('glowCSSVERSION-' + this.name + '-content');
			this.content.wrap('<div class="glowCSSVERSION-' + this.name + '-container"><div class="glowCSSVERSION-' + this.name + '-theme"><div class="glowCSSVERSION-' + this.name + '-state"></div></div></div>');
			this.container = this.content.parent('.' + 'glowCSSVERSION-' + this.name + '-container'); // NodeList#wrap should return the wrapper?
			
			this.container.state = this.container.get('.glowCSSVERSION-' + this.name + '-state').item(0);
			this.container.theme = this.container.get('.glowCSSVERSION-' + this.name + '-theme').item(0);
			
			// in case we were disabled before we were attached
			if (this.disabled) { this.disabled(true); }
			
			this.attached = true;
			
			if (opts.addClass !== undefined) { this.container.addClass(opts.addClass); }
			if (opts.addId !== undefined) { this.container[0].id = opts.addId; }
		}
		else {
			delete this.content;
		}
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#render
	@function
	@description Cause any functionality that deals with visual layout or UI display to run.
	Note that unlike the bind phase, which would normally happen only once, the render phase may happen multiple times, for example whenever the disabled state changes.
	@fires glow.ui.Widget#event:render
	
	@example
		function MyWidget() {
			this.render();
			
			//call the base class's constructor
			this.base = arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.ui.Widget);
		
		MyWidget.prototype.render = function() {
		
			// do your own rendering stuff here
			
			//call the base class's render
			this.base.render.apply(this);
		}
	@example
		function MyWidget() {
			this.on('render', function(e) {
				// do your own rendering stuff here
			});
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.ui.Widget);
		
 */
	Widget.prototype.render = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#render expects 0 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var e;
		
		e = new glow.events.Event();
		this.fire('render', e);
		
		if (!e.defaultPrevented()) { this.rendered = true; }
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#destroy
	@function
	@description Cause any functionality that deals with removing and deleting this widget to run.
	By default the container and all it's contents are removed.
	@fires glow.ui.Widget#event:destroy
 */
	Widget.prototype.destroy = function(opts) {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#destroy expects 0 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var e;
		opts = opts || {};
		
		e = new glow.events.Event();
		this.fire('destroy', e);
		
		if (!e.defaultPrevented()) {
			this.container.destroy()
			this.destroyed = true;
		}
		
		return this;
	}

/**
	@developer
	@name glow.ui.Widget#event:disable
	@event
	@description Fired after the disabled property is changed via the {@link glow.ui.Widget#disable} or {@link glow.ui.Widget#enable} method.
	This includes widgets that are changed as a result of being synced to this one.
 */

/**
	@developer
	@name glow.ui.Widget#event:locale
	@event
	@description Fired after the locale name is changed via the {@link glow.ui.Widget#locale locale} method.
	This includes widgets that are changed as a result of being synced to this one.
 */


/**
	@developer
	@name glow.ui.Widget#event:init
	@event
	@description Fired when init is called on this widget.
	@see glow.ui.Widget#init
 */

/**
	@developer
	@name glow.ui.Widget#event:bind
	@event
	@description Fired when bind is called on this widget.
	@see glow.ui.Widget#render
 */

/**
	@developer
	@name glow.ui.Widget#event:render
	@event
	@description Fired when render is called on this widget.
	@see glow.ui.Widget#bind
 */

/**
	@developer
	@name glow.ui.Widget#event:destroy
	@event
	@description Fired when destroy is called on this widget.
	@see glow.ui.Widget#destroy
 */

	// export
	glow.ui = {} || glow.ui;
	glow.ui.Widget = Widget;
});