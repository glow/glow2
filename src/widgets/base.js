Glow.provide(function(glow) {
	var undefined;

/**
	@name glow.widgets.Widget
	@constructor
	@extends glow.events.Target
	@description The Widget class serves as a base class that provides a shared framework on which other, more specific, widgets can be implemented. While it is possible to create an instance of this generic widget, it is more likely that your widget class will extend this class.
	@example
		function MyWidget() {
			this.value = 0;
			this.disabled = false;
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.widgets.Widget);
	@property {boolean} initialized (read-only) Set to true when a widget's init stage is complete.
	@property {boolean} bound (read-only) Set to true when a widget's bind stage is complete.
	@property {boolean} rendered (read-only) Set to true when a widget's render stage is complete.
	@property {boolean} destroyed (read-only) Set to true when a widget's destroy stage is complete.
	@property {glow.NodeList} container (read-only) The outermost wrapper element added by glow.widgets.Widget.
	The wrapper's purpose is to maintain state and theme information. If you wish to move your widget you must move your
	widget's container, otherwise you will lose all state and theme information along with their associated styles.
	@property {glow.NodeList} content (read-only) The first child element inside the wrapper elements added by glow.widgets.Widget.
	This is often passed into the widget's constructor, and refers to an existing element on the page.
	The intent of this element is to hold the content of your widget.
	@property {boolean} disabled (read-only) Set to true when a widget becomes disabled.
	@property {boolean} localeName (read-only) Set to the name of the locale when that is changed.
 */
	var Widget = function(conf) {
		this.initialized = false;
		this.bound = false;
		this.rendered = false;
		this.destroyed = false;
		this.disabled = false;
		this.localeName = (this.localeName || 'en'); // todo: default should come from i18n module
	}
	glow.util.extend(Widget, glow.events.Target); // Widget is a Target

/**
	@developer
	@name glow.widgets.Widget#sync
	@method
	@param {glow.widgets.Widget} ... Child widgets to synchronize with.
	@description Specify a group of widgets that should stay in sync with this one.
	These synced widgets can listen for a `notify` event on themselves, defining their own handler for the provided event.
	The disabled and locale methods automatically synchronize with their synced child widgets.
	@example
		function MyWidget() {
			this.value = 0; // initially
			
			// this widget handles notifications of new values
			// from other widgets it is syced to
			var that = this;
			this.on('notify', function(e) {
				if (typeof e.newValue !== undefined) {
					that.value = e.newValue;
				}
			});	
		}
		glow.util.extend(MyWidget, glow.widgets.Widget); // MyWidget extends the Base Widget
		
		MyWidget.prototype.setValue = function(n) {
			this.value = n;
			
			// this widget notifies about changes to its value
			this.notify({newValue: this.value});
		}
		
		// widgets b and c will all be notified when a's value changes
		var a = new MyWidget('A');
		var b = new MyWidget('B');
		var c = new MyWidget('C');
		
		a.sync(b, c);
		
		a.setValue(1); // a, b, and c all have a value of 1 now
 */
	Widget.prototype.sync = function() {
		var observers = Array.prototype.slice.call(arguments);
		
		var i = observers.length;
		while (i--) {
			(function (observer) {
				glow.events.addListeners([observer], 'notify', function(e) {
					// handle notifications about changes to the disabled state
					if (e.disabled !== undefined) {
						observer.fire('disable', e);
						if (!e.defaultPrevented()) { applyDisabled.call(observer, e.disabled); observer.fire('sync', e); }
					}
					
					// handle notifications about changes to the localeName
					if (e.localeName !== undefined) {
						observer.fire('locale', e);
						if (!e.defaultPrevented()) { observer.localeName = e.localeName; observer.fire('sync', e); }
					}
				});
			})(observers[i]);
		}
		
		// notify all synced observers when this receives a sync event
		this.on('sync', function(e) { glow.events.fire(observers, 'notify', e); });
		
		return this;
	}
	
	function applySync(e) {
	
	}

/**
	@developer
	@name glow.widgets.Widget#notify
	@method
	@param {object} changes Key/value collection of new information. Will be added to the listeners' event.
	@description Tell all widgets synced with this widget about any changes.
	@see glow.widgets.Widget#sync
 */
	Widget.prototype.notify = function(changes) { // shortcut?
		this.fire( 'sync', new glow.events.Event(changes) );
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#disabled
	@method
	@description Sets the disabled property of this widget to true and fires the disable event.
	If other widgets are synced with this one, they will become disabled too.
	@param {boolean} [state=true] 
	@see glow.widgets.Widget#enable
	@see glow.widgets.Widget#sync
	
	@example
		var a = new MyWidget();
		var b = new MyWidget();
		var c = new MyWidget();
		
		c.sync(a, b);
		
		c.disable(); // a, b, and c are now disabled
 */
	Widget.prototype.disable = function(_b) {
		var e,
			disabled = (typeof _b === 'boolean')? _b : true;
		
		e = new glow.events.Event({disabled: disabled});
		this.fire('disable', e);
		
		// notify observing widgets about this change
		if (!e.defaultPrevented()) {
			applyDisabled.call(this, e.disabled);
			this.fire('sync', e);
		}
		
		return this;
	}
	
	function applyDisabled(disabledState) {
		if (disabledState) { 
			this.container.get('.glow-' + this.name + '-theme').addClass('disabled');
		}
		else { this.container.get('.glow-' + this.name + '-theme').removeClass('disabled'); }
		
		this.disabled = disabledState;
	}

/**
	@developer
	@name glow.widgets.Widget#enable
	@method
	@description Sets the disabled property of this widget to false and fires the disable event.
	If other widgets are synced with this one, they will become enabled too.
	
	@see glow.widgets.Widget#disable
	@see glow.widgets.Widget#sync
	@see glow.widgets.Widget#render
	
	@example
		var a = new MyWidget();
		var b = new MyWidget();
		var c = new MyWidget();
		
		c.sync(a, b);
		
		c.enable(); // a, b, and c are now enabled
 */
	Widget.prototype.enable = function() {
		this.disable(false);
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#locale
	@method
	@param {string} localeName
	@description Sets the locale name of this module and fires the locale event
	If other widgets are synced with this one, they will have their locale changed too.
	
	@see glow.widgets.Widget#sync
	
	@example
		myWidget.locale('cy');
 */
	Widget.prototype.locale = function(localeName) {
		var e;
		
		this.localeName = localeName;
		
		e = new glow.events.Event({localeName: this.localeName});
		this.fire('locale', e);
		
		// notify observing widgets about this change
		if (!e.defaultPrevented()) { this.fire('sync', e); }
		
		return this;
	}
/**
	@developer
	@name glow.widgets.Widget#init
	@function
	@param {object} opts
	@description Augment this method with your own functionality that deals with configuring and intializing this widget.
	@fires glow.widgets.Widget#event:init
	@example
		function MyWidget(opts) {
			this.init(opts);
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.widgets.Widget);
		
		MyWidget.prototype.init = function(opts) {
		
			// do your own initializing stuff here
			
			// call the base class's init
			this.constructor.base.prototype.init.apply(this, opts);
		}
	
	@example
		function MyWidget(opts) {
			this.on('initialized', function(e) {
				// do your own initializing stuff
			});
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.widgets.Widget);
 */
	Widget.prototype.init = function(opts) {
		var e;
		
		e = new glow.events.Event({opts: (opts || {})});
		this.fire('init', e);
		
		if (!e.defaultPrevented()) { this.initialized = true; }
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#bind
	@function
	@description Augment this method with your own functionality that deals with binding to any HTML elements used by this widget.
	@param {selector|HTMLElement|NodeList} container
	@fires glow.widgets.Widget#event:bind
 */
	Widget.prototype.bind = function(content) {
		var e;
		
		this.content = new glow.NodeList(content);
		this.content.wrap('<div class="glow-' + this.name + '-container"><div class="glow-' + this.name + '-theme"><div class="glow-' + this.name + '-state"></div></div></div>');
		this.container = this.content.parent('.' + 'glow-' + this.name + '-container');
		
		e = new glow.events.Event();
		this.fire('bind', e);
		
		if (!e.defaultPrevented()) {
			this.bound = true;
			
			// todo: unwrap?
		}
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#render
	@function
	@description Cause any functionality that deals with visual layout or UI display to run.
	Note that unlike the bind phase, which would normally happen only once, the render phase may happen multiple times, for example whenever the disabled state changes.
	@fires glow.widgets.Widget#event:render
	
	@example
		function MyWidget() {
			this.render();
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.widgets.Widget);
		
		MyWidget.prototype.render = function() {
		
			// do your own rendering stuff here
			
			//call the base class's render
			this.constructor.base.prototype.render.apply(this);
		}
	@example
		function MyWidget() {
			this.on('rendered', function(e) {
				// do your own rendering stuff here
			});
			
			//call the base class's constructor
			arguments.callee.base.apply(this, arguments);
		}
		glow.util.extend(MyWidget, glow.widgets.Widget);
		
 */
	Widget.prototype.render = function(cascade) {
		var e;
		
		e = new glow.events.Event();
		this.fire('render', e);
		
		if (!e.defaultPrevented()) { this.rendered = true; }
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#destroy
	@function
	@description Cause any functionality that deals with removing and deleting this widget to run.
	@fires glow.widgets.Widget#event:destroy
 */
	Widget.prototype.destroy = function() {
		var e;
		
		e = new glow.events.Event();
		this.fire('destroy', e);
		
		if (!e.defaultPrevented()) { this.destroyed = true; }
		
		return this;
	}


/**
	@developer
	@name glow.widgets.Widget#event:disable
	@event
	@description Fired after the disabled property is changed via the {@link glow.widgets.Widget#disable} or {@link glow.widgets.Widget#enable} method.
	This includes widgets that are changed as a result of being synced to this one.
 */

/**
	@developer
	@name glow.widgets.Widget#event:locale
	@event
	@description Fired after the locale name is changed via the {@link glow.widgets.Widget#locale locale} method.
	This includes widgets that are changed as a result of being synced to this one.
 */


/**
	@developer
	@name glow.widgets.Widget#event:init
	@event
	@description Fired when init is called on this widget.
	@see glow.widgets.Widget#init
 */

/**
	@developer
	@name glow.widgets.Widget#event:bind
	@event
	@description Fired when bind is called on this widget.
	@see glow.widgets.Widget#render
 */

/**
	@developer
	@name glow.widgets.Widget#event:render
	@event
	@description Fired when render is called on this widget.
	@see glow.widgets.Widget#bind
 */

/**
	@developer
	@name glow.widgets.Widget#event:destroy
	@event
	@description Fired when destroy is called on this widget.
	@see glow.widgets.Widget#destroy
 */

	// export
	glow.widgets = {} || glow.widgets;
	glow.widgets.Widget = Widget;
});