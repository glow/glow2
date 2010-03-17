module('glow.ui.Widget base class');

		
(function() {
	
	test('API', function() {			
        expect(15);	
	
		equal(typeof glow.ui, 'object', 'glow.ui is defined.');
		equal(typeof glow.ui.Widget, 'function', 'glow.ui.Widget is defined.');
		equal(typeof glow.ui.Widget.prototype.init, 'function', 'glow.ui.Widget#init is defined.');
		equal(typeof glow.ui.Widget.prototype.attach, 'function', 'glow.ui.Widget#attach is defined.');
		equal(typeof glow.ui.Widget.prototype.render, 'function', 'glow.ui.Widget#render is defined.');
		equal(typeof glow.ui.Widget.prototype.destroy, 'function', 'glow.ui.Widget#destroy is defined.');
		
		equal(typeof glow.ui.Widget.prototype.enable, 'function', 'glow.ui.Widget#enable is defined.');
		equal(typeof glow.ui.Widget.prototype.disable, 'function', 'glow.ui.Widget#disable is defined.');
		equal(typeof glow.ui.Widget.prototype.locale, 'function', 'glow.ui.Widget#locale is defined.');
		
		var myWidget;
		try {
			myWidget = new glow.ui.Widget('testname');
		}
		catch(ignored) {}
		
		equal(typeof myWidget, 'object', 'glow.ui.Widget instance is defined.');
		equal(myWidget.name, 'testname', 'glow.ui.Widget#name is defined.');
		equal(myWidget.rendered, false, 'glow.ui.Widget#rendered is defined.');
		equal(myWidget.destroyed, false, 'glow.ui.Widget#destroyed is defined.');
		equal(myWidget.disabled, false, 'glow.ui.Widget#disabled is defined.');
		equal(typeof myWidget.localeName, 'string', 'glow.ui.Widget#localeName is defined.');
	});
	
	// extend the base Widget...
	function MyWidget(value, opts) {
		this.base = MyWidget.base.call(this, 'mywidget');
		var value = value;
		
		this.on('init', function(e) {
			this.initCallback = e.opts.initCallback;
			this.attachCallback = e.opts.attachCallback;
			this.renderCallback = e.opts.renderCallback;
			this.syncCallback = e.opts.syncCallback;
			
			if (this.initCallback) { this.initCallback(); }
		});
		
		this.on('attach', function(e) {
			if (this.attachCallback) { this.attachCallback(); }
		});
		
		this.on('render', function(e) {
			if (this.renderCallback) { this.renderCallback(); }
		});
		
		this.on('sync', function(e) {
			if (e.newValue !== undefined) { this.value = e.newValue; }
			if (this.syncCallback) { this.syncCallback(); }
		});
		
		this.init(opts);
		this.attach(glow('<p></p>'), opts);
		this.render();
	}
	glow.util.extend(MyWidget, glow.ui.Widget);
		
	test('Extend', function() {
		var myWidget;
		try {
			myWidget = new MyWidget();
		}
		catch(ignored) {}
		
		expect(9);
		
		equal(typeof myWidget, 'object', 'MyWidget instance is defined.');
		equal(myWidget.name, 'mywidget', 'MyWidget#name is defined.');
		
		equal(typeof myWidget.init, 'function', 'glow.ui.Widget#init is defined.');
		equal(typeof myWidget.attach, 'function', 'glow.ui.Widget#attach is defined.');
		equal(typeof myWidget.render, 'function', 'glow.ui.Widget#render is defined.');
		equal(typeof myWidget.destroy, 'function', 'glow.ui.Widget#destroy is defined.');
		
		equal(typeof myWidget.enable, 'function', 'glow.ui.Widget#enable is defined.');
		equal(typeof myWidget.disable, 'function', 'glow.ui.Widget#disable is defined.');
		equal(typeof myWidget.locale, 'function', 'glow.ui.Widget#locale is defined.');
	});
	
	test('Attach', function() {
		var myWidget = new MyWidget(7, {addClass: 'addedClass', addId: 'addedId'});
		
		expect(5);
		
		equal(typeof myWidget.container, 'object', 'MyWidget container is defined.');
		equal(typeof myWidget.content, 'object', 'MyWidget content is defined.');
		
		equal(myWidget.container.hasClass('glow-mywidget-container'), true, 'MyWidget container has class glow-mywidget-container.');
		
		equal(myWidget.container.hasClass('addedClass'), true, 'MyWidget container has added class.');
		equal(myWidget.container[0].id, 'addedId', 'MyWidget container has added id.');
	});
	
	test('Tie and sync', function() {
		var syncCallback = function() {
			ok(true, 'Sync event fired.');
			equal(this.value, 3, 'Can sync new value.');
		}
		
		expect(2);
		
		var w1 = new MyWidget(1),
			w2 = new MyWidget(2, {syncCallback: syncCallback});
		
		w1.tie(w2);
		
		w1.value = 3;
		w1.sync({newValue: 3});
	});
	
	test('tie() locale(), disable() and enable()', function() {
		var w1 = new MyWidget(),
		w2 = new MyWidget(),
		w3 = new MyWidget(),
		w4 = new MyWidget();
		
		w1.tie(w2, w3);
		w3.tie(w4);
		
  /* like this:
  
    w1
     \____
       \  \
        w2 w3
            \
             w4
  */
		w3.disable();
		
		expect(9);
		
		equal(w1.disabled && w2.disabled, false, 'w1 and w2 disabled is not affected by w3.disable().');
		equal(w3.disabled, true, 'w3 is disabled by w3.disable().');
		equal(w4.disabled, true, 'widgets tied to w3 are disabled by w3.disable().');
		
		w3.enable();
		equal(w3.disabled && w4.disabled, false, 'w3 and w4 enabled by w3.enable().');
		
		w1.disable();
		equal(w1.disabled && w2.disabled && w3.disabled && w4.disabled, true, 'w1, w2, w3 and w4 disabled by w1.disable().');
		
		w1.locale('foo-BAR');
		equal(w1.localeName, 'foo-BAR', 'w1 locale set by w1.locale().');
		equal(w2.localeName, 'foo-BAR', 'w2 locale set by w1.locale().');
		equal(w3.localeName, 'foo-BAR', 'w3 locale set by w1.locale().');
		equal(w4.localeName, 'foo-BAR', 'w4 locale set by w1.locale().');
	});
	
	test('Events', function() {
		var initCallback = function() {
			ok(true, 'Init event fired.');
		}
		
		var attachCallback = function() {
			ok(true, 'Attach event fired.');
		}
		
		var renderCallback = function() {
			ok(true, 'Render event fired.');
		}
		
		expect(3);
		var myWidget = new MyWidget(1, {initCallback: initCallback, attachCallback: attachCallback, renderCallback: renderCallback});
	});
})();