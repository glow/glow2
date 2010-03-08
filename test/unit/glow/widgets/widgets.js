module('glow.widgets base class');
// mock, for testing only
	i18n = {
		en: {
			LABEL_TITLE: 'My Widget',
			LABEL_UP:   'Increase.',
			LABEL_DOWN: 'Decrease.'
		},
		pirate: {
			LABEL_TITLE: 'Me Jolly Widget, Ahoy!',
			LABEL_UP:   'Up ye go, Arr!',
			LABEL_DOWN: 'Down ye go, Arr!'
		}
	};
	i18n.getLocalPack = function(locale) {
		if (!i18n[locale]) { locale = 'en'; }
		return i18n[locale];
	}
	i18n.getLocaleName = function() {
		// find locale name from html tag attribute
		return 'en';
	}

	

		
		/**
			@constructor
			@param {HTMLElement} container
			@param {object} [opts]
		 */
		function Label(content, opts) {
			this.name = 'label';
			
			this.on('init', function(e) {
				this.caption = e.opts.caption;
				this.captions = i18n.getLocalPack(i18n.getLocaleName());
			});
			
			this.on('bind', function(e) {
				if (opts.className !== undefined) { this.container.addClass(opts.className); }
			});
			
			this.on('render', function(e) {
				this.content.html(this.captions[this.caption]);
			});
			
			this.on('locale', function(e) {
				this.captions = i18n.getLocalPack(e.localeName);
				if (this.rendered) { this.render(); }
			});
			
			this.init(opts);
			this.bind(content);
			this.render();
		}
		glow.util.extend(Label, glow.widgets.Widget);
		
		/**
			@constructor
			@param {number} startValue
			@param {HTMLElement} container
			@param {object} [opts]
		 */
		function Counter(startValue, content, opts) {
			this.name = 'counter';
			this.label = new Label(document.createElement('DIV'), opts);
				
			this.sync(this.label);
			
			this.on('init', function(e) {
				this._value = (e.opts.startValue !== undefined)? e.opts.startValue : (this._value !== undefined)? this._value : startValue;
				this._delta = (e.opts.delta !== undefined)? e.opts.delta : (this._delta !== undefined)? this._delta : 1;
				
				this.label.init(e.opts);
			});
			
			this.on('bind', function(e) {
				this.display = new glow.NodeList(document.createElement('DIV'));
				this.display.addClass('display');
				this.content.append(this.display);
				
				var that = this;
				this.label.container.on('click', function(e) {
					if (that.disabled) { return; }
					that.value(that._value += that._delta);
				});
				this.content.append(this.label.container);
			});
			
			this.on('render', function(e) {
				this.displayValue();
				
				this.label.render();
			});
			
			this.init(opts);
			this.bind(content);
			this.render();
		}
		glow.util.extend(Counter, glow.widgets.Widget);
		
		Counter.prototype.displayValue = function() {
			this.display.html('' + this._value);
		}
		
		Counter.prototype.value = function(n) {
			this._value = 0 + n;
			this.displayValue();
		}
		
//// example ////

		// example of a Label widget by itself
		// example of passing in id and className
		var theTitle = new Label('#title', {className: 'titular', caption: 'LABEL_TITLE'});
		
		// example of a compound widget that contains a Label widget
		var myWidget = new Counter(0, '#counter', {delta: +6, caption: 'LABEL_UP'});
		
		myWidget.label.sync(theTitle); // keep the title synced with the widget label?
		
		


	test('Checks locale', function() {			
        expect(2);	
	
		ok( (glow(".glow-label-state div").html() == "Increase."), 'Locale text is en');
		myWidget.locale('pirate');
		ok( (glow(".glow-label-state div").html() == "Up ye go, Arr!"), 'Locale text is pirate');
		myWidget.locale('en');

	});
	
	test('Checks enabled/disable', function() {			
        expect(2);	
		myWidget.disable();
		ok( glow(".glow-counter-container .disabled"), 'Disabled state found' );
		myWidget.enable();
		ok( glow(".glow-counter-container .disabled").length == 0, 'Disabled state removed' );
	});
	
	test('Checks syncing', function() {			
        expect(3);	
		ok( glow(".glow-label-container #title").html() == 'My Widget', 'Synced title widget is set to en' );
		myWidget.locale('pirate');
		ok( glow(".glow-label-container #title").html() == 'Me Jolly Widget, Ahoy!', 'Synced title widget is changed to pirate' );
		
		myWidget.disable();
		ok( glow(".glow-label-container .disabled").length== 2, 'Disabled state added to synced widget' );
		
		
		//cleanup
		glow('.glow-label-container, .glow-counter-container').remove();
	});

	
	

		
	