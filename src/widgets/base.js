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
	@property {boolean} initialized
	@property {boolean} rendered
	@property {boolean} destroyed
	@property {boolean} disabled
	@property {string} localeName A string identifying the locale of this widget.
	
 */
	var Widget = function(conf) {
		this.initialized = false;
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
					if (e.disabled !== undefined) { observer.disabled = !!e.disabled; observer.fire('disabledChanged', e); }
					
					// handle notifications about changes to the localeName
					if (e.localeName !== undefined) { observer.localeName = e.localeName; observer.fire('localeChanged', e); }
				});
			})(observers[i]);
		}
		
		// notify all synced observers when this receives a sync event
		this.on('sync', function(e) { glow.events.fire(observers, 'notify', e); });
		
		return this;
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
	@name glow.widgets.Widget#disable
	@method
	@description Sets the disabled property of this widget to true and fires the disabledChanged event.
	If other widgets are synced with this one, they will become disabled too.
	
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
		var e;
		
		this.disabled = (typeof _b === 'boolean')? _b : true;
		
		e = new glow.events.Event({disabled: this.disabled});
		this.fire('disabledChanged', e);
		
		// notify observing widgets about this change
		if (!e.defaultPrevented()) { this.fire('sync', e); }
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#enable
	@method
	@description Sets the disabled property of this widget to false and fires the disabledChanged event.
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
	@description Sets the locale name of this module and fires the localeChanged event
	If other widgets are synced with this one, they will have their locale changed too.
	
	@see glow.widgets.Widget#sync
	
	@example
		myWidget.locale('cy');
 */
	Widget.prototype.locale = function(localeName) {
		var e;
		
		this.localeName = localeName;
		
		e = new glow.events.Event({localeName: this.localeName});
		this.fire('localeChanged', e);
		
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
	@fires glow.widgets.Widget#event:initialized
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
		
		this.initialized = true;
		e = new glow.events.Event({opts: opts});
		this.fire('initialized', e);
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#render
	@function
	@description Cause any functionality that deals with visual layout or UI display to run.
	@fires glow.widgets.Widget#event:rendered
	
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
		
		this.rendered = true;
		e = new glow.events.Event();
		this.fire('rendered', e);
		
		return this;
	}

/**
	@developer
	@name glow.widgets.Widget#destroy
	@function
	@description Cause any functionality that deals with removing and deleting this widget to run.
	@fires glow.widgets.Widget#event:destroyed
 */
	Widget.prototype.destroy = function() {
		var e;
		
		this.destroyed = true;
		e = new glow.events.Event();
		this.fire('destroyed', e);
		
		return this;
	}


/**
	@developer
	@name glow.widgets.Widget#event:disabledChanged
	@event
	@description Fired after the disabled property is changed via the {@link glow.widgets.Widget#disable disable} or {@link glow.widgets.Widget#enable enable} method.
	This includes widgets that are changed as a result of being synced to this one.
 */

/**
	@developer
	@name glow.widgets.Widget#event:localeChanged
	@event
	@description Fired after the locale name is changed via the {@link glow.widgets.Widget#locale locale} method.
	This includes widgets that are changed as a result of being synced to this one.
 */

/**
	@developer
	@name glow.widgets.Widget#event:initialized
	@event
	@description Fired after this widget is initialized.
	@see glow.widgets.Widget#init
 */

/**
	@developer
	@name glow.widgets.Widget#event:rendered
	@event
	@description Fired after this widget is rendered.
	@see glow.widgets.Widget#render
 */

/**
	@developer
	@name glow.widgets.Widget#event:destroyed
	@event
	@description Fired after this widget is destroyed.
	@see glow.widgets.Widget#destroy
 */

	// export
	glow.widgets = {} || glow.widgets;
	glow.widgets.Widget = Widget;
});