Glow.provide(function(glow) {
	var undefined,
		WidgetProto;

	/**
		@name glow.ui.Widget
		@constructor
		@extends glow.events.Target
		
		@description An abstract Widget class
			The Widget class serves as a base class that provides a shared framework on which other,
			more specific, widgets can be implemented. While it is possible to create an instance
			of this generic widget, it is more likely that your widget class will extend this class.
			
			Your widget constructor should call the base constructor, and should end in a call to _init.
			
		@param {string} name The name of this widget.
			This is added to class names in the generated DOM nodes that wrap the widget interface.
			
		@param {object} [opts]
			@param {string} [opts.className] Class name to add to the container.
			@param {string} [opts.id]  Id to add to the container.
			
		@example
			function MyWidget(opts) {
				// set up your widget...
				// call the base constructor, passing in the name and the options
				glow.ui.Widget.call(this, 'MyWidget', opts);
				
				// start init
				this._init();
			}
			glow.util.extend(MyWidget, glow.ui.Widget);
	*/
	
	function Widget(name, opts) {
		/*!debug*/
			if (arguments.length < 1 || arguments.length > 2) {
				glow.debug.warn('[wrong count] glow.ui.Widget expects 1 or 2 arguments, not '+arguments.length+'.');
			}
			if (typeof arguments[0] !== 'string') {
				glow.debug.warn('[wrong type] glow.ui.Widget expects argument 1 to be of type string, not '+typeof arguments[0]+'.');
			}
		/*gubed!*/
		
		this._name = name;
		this._locale = 'en'; // todo: default should come from i18n module
		this.phase = 'constructed';
		this._observers = [];
		this._opts = opts || {};
	}
	glow.util.extend(Widget, glow.events.Target); // Widget is a Target
	WidgetProto = Widget.prototype;
	/**
		@name glow.ui.Widget#_locale
		@protected
		@type string
		@description The locale of the widget
	*/
	/**
		@name glow.ui.Widget#_name
		@protected
		@type string
		@description The name of the widget.
			This is the first argument passed into the constructor.
	*/
	/**
		@name glow.ui.Widget#_stateElm
		@protected
		@type glow.NodeList
		@description The wrapper element that contains the state class
	*/
	/**
		@name glow.ui.Widget#_themeElm
		@protected
		@type glow.NodeList
		@description The wrapper element that contains the theme class
	*/
	/**
		@name glow.ui.Widget#_opts
		@protected
		@type Object
		@description The option object passed into the constructor
	*/
	/**
		@name glow.ui.Widget#_disabled
		@protected
		@type boolean
		@description Is the widget disabled?
			This is read-only
	*/
	WidgetProto._disabled = false;
	/**
		@name glow.ui.Widget#_observers
		@protected
		@type object[]
		@description Objects (usually widgets & dehaviours) observing this Widget
	*/
	
	/**
		@name glow.ui.Widget#phase
		@type string
		@description The phase within the lifecycle of the widget.
			Will be one of the following:
			
			<dl>
				<dt>constructed</dt>
				<dd>The widget has been constructed but not yet initialised</dd>
				<dt>initialised</dt>
				<dd>The widget has been initialised but not yet build</dd>
				<dt>built</dt>
				<dd>The widget has been built but not yet bound</dd>
				<dt>ready</dt>
				<dd>The widget is in a fully usable state</dd>
				<dt>destroyed</dt>
				<dd>The widget has been destroyed</dd>
			</dl>
			
			Usually, init, build & bind are done in the constructor, so
			you may only interact with a widget that is either 'ready' or 'destroyed'.
	*/
	/**
		@name glow.ui.Widget#container
		@type glow.NodeList
		@description The outermost wrapper element of the widget.
	*/
	/**
		@name glow.ui.Widget#content
		@type glow.NodeList
		@description The content element of the widget
			This is inside various wrapper elements used to track the state of
			the widget.
	*/
	
	function syncListener(e) {
		// handle notifications about changes to the disabled state
		if (e.disabled !== undefined) {
			this.disabled(e.disabled);
		}
		else if (e.destroy) {
			this.destroy();
		}
	}
	
	/**
		@name glow.ui.Widget#_tie
		@protected
		@function
		@description Specify a group of widgets that should stay in _sync with this one.
			These synced widgets can listen for a '_sync' event on themselves, defining their own handler for the provided event.
			The disabled and destroy methods automatically synchronize with their synced child widgets.
		
		@param {glow.ui.Widget} ... Child widgets to synchronize with.
		
		@example
			function MyWidget() {
				this.value = 0; // initially
				
				// this widget handles notifications of new values
				// from other widgets it is syced to
				var that = this;
				this.on('_sync', function(e) {
					if (typeof e.newValue !== undefined) {
						that.value = e.newValue;
					}
				});	
			}
			glow.util.extend(MyWidget, glow.ui.Widget); // MyWidget extends the Base Widget
			
			MyWidget.prototype.setValue = function(n) {
				this.value = n;
				
				// this widget notifies about changes to its value
				this._sync({newValue: this.value});
			}
			
			// widgets b and c will all be notified when a's value changes
			var a = new MyWidget('A');
			var b = new MyWidget('B');
			var c = new MyWidget('C');
			
			a._tie(b, c);
			
			a.setValue(1); // a, b, and c all have a value of 1 now
	 */
	WidgetProto._tie = function(/*...*/) {
		/*!debug*/
			if (arguments.length === 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#_tie expects at least 1 argument, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var newObservers = Array.prototype.slice.call(arguments),
			i = newObservers.length;
		
		// add a default _sync listener to react to disabled and destroy
		while (i--) {
			newObservers[i].on('_sync', syncListener);
		}
		
		this._observers = this._observers.concat(newObservers);
		
		return this;
	}

	/**
		@developer
		@name glow.ui.Widget#_sync
		@method
		@param {object} [changes] Key/value collection of new information. Will be added to the listeners' event.
		@description Tell all widgets synced with this widget about any changes.
	 */
	WidgetProto._sync = function(changes) { // public shortcut to fire _notify
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#_sync expects 1 or fewer arguments, not '+arguments.length+'.');
			}
			
			if (arguments.length && typeof changes !== 'object') {
				glow.debug.warn('[wrong type] glow.ui.Widget#_sync expects argument 1 to be of type object, not '+(typeof changes)+'.');
			}
		/*gubed!*/
		
		glow.events.fire( this._observers, '_sync', changes || {} );
		
		return this;
	}

	/**
		@name glow.ui.Widget#disabled
		@function
		@description Enable/disable the Widget, or get the disabled state
			If other widgets are synced with this one, they will become disabled too.
			
		@param {boolean} [newState] Disable the focusable?
			'false' will enable a disabled focusable.
		
		@example
			var a = new MyWidget();
			var b = new MyWidget();
			var c = new MyWidget();
			
			c._tie(a, b);
			
			c.disabled(true); // a, b, and c are now disabled
	 */
	WidgetProto.disabled = function(newState) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#disabled expects 0 or 1 argument, not ' + arguments.length + '.');
			}
		/*gubed!*/
		
		// geting
		if (newState === undefined) {
			return this._disabled;
		}
		
		// setting
		newState = !!newState;
		if ( newState !== this._disabled && !this.fire('disabled', {disabled:newState}).defaultPrevented() ) {
			this._sync({
				disabled: newState
			});
			this._stateElm[newState ? 'addClass' : 'removeClass']('disabled');
			this._disabled = !!newState;
		}
		return this;
	}

	/**
		@name glow.ui.Widget#_init
		@protected
		@function
		@description Initialise the widget.
			This is similar to the constructor, but for code that you may need to run
			again.
			
			You init function should call the base _init, and end in a call to _build on your widget.
		
		@example
			MyWidget.prototype._init = function() {
				// set properties here
				
				// call base _init
				glow.ui.Widget.prototype._init.call(this);
				// call _build
				this._build();
			}
		
	 */
	WidgetProto._init = function() {
		this.phase = 'initialised';
	}

	/**
		@name glow.ui.Widget#_build
		@protected
		@function
		@description Build the html structure for this widget.
			All actions relating to wrapping, creating & moving elements should be
			done in this method. The base method creates the container, theme & state elements.
			
			Adding behaviour to these elements should be handed in {@link glow.ui.Widget#_bind}.
			
			You Widget's _build method should call the base build method and end in a call to _bind.
		
		@param {selector|HTMLElement|NodeList} [content] Content element for the widget.
			This will be wrapped in container, theme & state elements. By default this is
			an empty div.
			
		@example
			MyWidget.prototype._build = function() {
				// create some content
				var content = glow('<p>Hello!</p>');
				// call the base build
				glow.ui.Widget.prototype._build.call(this, content);
				// call _bind
				this._bind();
			}
	 */
	WidgetProto._build = function(content) {
		/*!debug*/
			if (arguments.length > 1) {
				glow.debug.warn('[wrong count] glow.ui.Widget#_build expects 0-1 argument, not '+arguments.length+'.');
			}
		/*gubed!*/
		
		var container,
			name = this._name,
			opts = this._opts;
		
		content = this.content = glow(content || '<div></div>');
		
		/*!debug*/
			if (content.length < 1) {
				glow.debug.warn('[error] glow.ui.Widget#_build expects a content node to attach to. The given "content" argument was empty or not found.');
			}
		/*gubed!*/
		
		container = this.container = glow('' +
			'<div class="glowCSSVERSION-' + name + '">' +
				'<div class="' + name + '-theme">' +
					'<div class="' + name + '-state"></div>' +
				'</div>' +
			'</div>' +
		'');
		
		content.addClass(name + '-content').wrap(container);
		this._stateElm = content.parent();
		this._themeElm = this._stateElm.parent();
		
		if (opts.className) {
			container.addClass(opts.className);
		}
		if (opts.id) {
			container[0].id = opts.id;
		}
		
		this.phase = 'built';
	}
	
	/**
		@developer
		@name glow.ui.Widget#_bind
		@function
		@description Add behaviour to elements created in {@link glow.ui.Widget#_build _build}.
			Your _bind method should call the base _bind and may end in a call
			to _updateUi for initial positioning etc.
			
		@example
			MyWidget.prototype._bind = function() {
				// add some behaviour
				this.content.on('click', function() {
					alert('Hello!');
				});
				// call base _bind
				glow.ui.Widget.prototype._bind.call(this);
			}
	 */
	WidgetProto._bind = function() {
		this.phase = 'ready';
	}

	/**
		@name glow.ui.Widget#_updateUi
		@function
		@description Cause any functionality that deals with visual layout or UI display to update.
			This function should be overwritten by Widgets that need to update or redraw. For example,
			you may use this method to reposition or reorder elements.
			
			This is a convention only, the base method does nothing.
		
		@example
			MyWidget.prototype.updateUi = function() {
				// update the UI
			}
			
	 */
	WidgetProto._updateUi = function() {}

	/**
		@developer
		@name glow.ui.Widget#destroy
		@function
		@description Cause any functionality that deals with removing and deleting this widget to run.
			By default the container and all it's contents are removed.
		@fires glow.ui.Widget#event:destroy
	 */
	WidgetProto.destroy = function() {
		/*!debug*/
			if (arguments.length !== 0) {
				glow.debug.warn('[wrong count] glow.ui.Widget#destroy expects 0 arguments, not '+arguments.length+'.');
			}
		/*gubed!*/
		if ( !this.fire('destroy').defaultPrevented() ) {
			this._sync({
				destroy: 1
			});
			glow.events.removeAllListeners( [this] );
			this.container.destroy();
			this.phase = 'destroyed';
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
		@name glow.ui.Widget#event:destroy
		@event
		@description Fired when destroy is called on this widget.
		@see glow.ui.Widget#destroy
	 */

	// export
	glow.ui.Widget = Widget;
});