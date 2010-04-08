module('glow.ui.Widget base class');

		
(function() {
	
	test('API', 12, function() {
		
		equal(typeof glow.ui, 'object', 'glow.ui is defined.');
		equal(typeof glow.ui.Widget, 'function', 'glow.ui.Widget is defined.');
		equal(typeof glow.ui.Widget.prototype._init, 'function', 'glow.ui.Widget#_init is defined.');
		equal(typeof glow.ui.Widget.prototype._build, 'function', 'glow.ui.Widget#_build is defined.');
		equal(typeof glow.ui.Widget.prototype._bind, 'function', 'glow.ui.Widget#_bind is defined.');
		equal(typeof glow.ui.Widget.prototype._updateUi, 'function', 'glow.ui.Widget#_updateUi is defined.');
		equal(typeof glow.ui.Widget.prototype.destroy, 'function', 'glow.ui.Widget#destroy is defined.');
		equal(typeof glow.ui.Widget.prototype.disabled, 'function', 'glow.ui.Widget#disabled is defined.');
		
		var myWidget = new glow.ui.Widget('testname');
		
		equal(typeof myWidget, 'object', 'glow.ui.Widget instance is defined.');
		equal(myWidget._name, 'testname', 'glow.ui.Widget#_name is defined.');
		equal(myWidget.phase, 'constructed', 'glow.ui.Widget#phase is set.');
		equal(typeof myWidget._locale, 'string', 'glow.ui.Widget#_locale is defined.');
	});
	
	// extend the base Widget...
	function MyWidget(value, opts) {
		MyWidget.base.call(this, 'mywidget');
	
		this.on('_sync', function(e) {
			if (e.newValue !== undefined) { this.value = e.newValue; }
			if (opts && opts.syncCallback) { opts.syncCallback(); }
		});
		
		this._init(opts);
		this._build('<p></p>', opts);
		this._bind();
		this._updateUi();
	}
	glow.util.extend(MyWidget, glow.ui.Widget);
		
	test('Extend', 8, function() {
		var myWidget = new MyWidget();
		
		equal(typeof myWidget, 'object', 'MyWidget instance is defined.');
		equal(myWidget._name, 'mywidget', 'MyWidget#_name is defined.');
		
		equal(typeof glow.ui.Widget.prototype._init, 'function', 'glow.ui.Widget#_init is defined.');
		equal(typeof glow.ui.Widget.prototype._build, 'function', 'glow.ui.Widget#_build is defined.');
		equal(typeof glow.ui.Widget.prototype._bind, 'function', 'glow.ui.Widget#_bind is defined.');
		equal(typeof glow.ui.Widget.prototype._updateUi, 'function', 'glow.ui.Widget#_updateUi is defined.');
		equal(typeof glow.ui.Widget.prototype.destroy, 'function', 'glow.ui.Widget#destroy is defined.');
		equal(typeof glow.ui.Widget.prototype.disabled, 'function', 'glow.ui.Widget#disabled is defined.');
	});
	
	test('_build', 5, function() {
		var myWidget = new MyWidget(7, {
			className: 'addedClass',
			id: 'addedId'
		});
		
		equal(typeof myWidget.container, 'object', 'MyWidget container is defined.');
		equal(typeof myWidget.content, 'object', 'MyWidget content is defined.');
		
		console.log(myWidget.container);
		
		equal(myWidget.container.hasClass('glowCSSVERSION-mywidget-container'), true, 'MyWidget container has class glow-mywidget-container.');
		
		equal(myWidget.container.hasClass('addedClass'), true, 'MyWidget container has added class.');
		equal(myWidget.container[0].id, 'addedId', 'MyWidget container has added id.');
	});
	
	test('Tie and sync', 2, function() {
		var syncCallback = function() {
			ok(true, 'Sync event fired.');
			equal(w2.value, 3, 'Can sync new value.');
		}
		
		var w1 = new MyWidget(1),
			w2 = new MyWidget(2, {syncCallback: syncCallback});
		
		w1._tie(w2);
		
		w1.value = 3;
		w1._sync({newValue: 3});
	});
	
	test('tie() locale(), disable() and enable()', 5, function() {
		var w1 = new MyWidget(),
		w2 = new MyWidget(),
		w3 = new MyWidget(),
		w4 = new MyWidget();
		
		w1._tie(w2, w3);
		w3._tie(w4);
		
		/* like this:
		
		  w1
		   \____
			 \  \
			  w2 w3
				  \
				   w4
		*/
		w3.disabled(true);
		
		equal(w1.disabled() || w2.disabled(), false, 'w1 and w2 disabled is not affected by w3.disable().');
		equal(w3.disabled(), true, 'w3 is disabled by w3.disabled(true).');
		equal(w4.disabled(), true, 'widgets tied to w3 are disabled by w3.disabled(true).');
		
		w3.disabled(false);
		equal(w3.disabled() || w4.disabled(), false, 'w3 and w4 enabled by w3.disabled(false).');
		
		w1.disabled(true);
		equal(w1.disabled() && w2.disabled() && w3.disabled() && w4.disabled(), true, 'w1, w2, w3 and w4 disabled by w1.disabled(true).');
		
	});
})();