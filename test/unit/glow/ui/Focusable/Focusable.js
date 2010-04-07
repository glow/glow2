module('glow.ui.Focusable - no children');

test('construction & basic destruction', 10, function() {
	var elm = glow('#elementToTest1');
	
	equal(typeof glow.ui.Focusable, 'function', 'glow.ui.Focusable exists');
	equal(typeof elm.focusable, 'function', 'NodeList shortcut exists');
	
	var focusable = new glow.ui.Focusable(elm);
	
	equal(focusable.constructor, glow.ui.Focusable, 'Has correct constructor');
	ok(focusable instanceof glow.ui.Behaviour, 'Is instance of Behaviour');
	ok(focusable.container.eq(elm), 'container set');
	
	equal(typeof focusable.destroy, 'function', '#destroy exists');
	focusable.destroy();
	
	focusable = glow.ui.Focusable(elm);
	equal(focusable.constructor, glow.ui.Focusable, 'Has correct constructor without new');
	ok(focusable.container.eq(elm), 'container set');
	focusable.destroy();
	
	focusable = elm.focusable();
	equal(focusable.constructor, glow.ui.Focusable, 'Has correct constructor via NodeList');
	ok(focusable.container.eq(elm), 'container set');
	focusable.destroy();
});

test('activating', 7, function() {
	var elm1 = glow('#elementToTest3'),
		focusable = elm1.focusable(),
		focusListener = function(event) {
			ok(event.source === elm1[0], 'Focus event fired on correct source');
		},
		blurListener = function(event) {
			ok(event.source === elm1[0], 'Blur event fired on correct source');
		};
	
	glow(document).on('focus', focusListener);
	glow(document).on('blur', blurListener);
	
	equal(typeof focusable.active, 'function', '#active exists');
	strictEqual(focusable.active(), false, 'Not active at start');
	ok(focusable.active(true) === focusable, '#active returns this');
	strictEqual(focusable.active(), true, 'Now active');
	focusable.active(false);
	strictEqual(focusable.active(), false, 'Inactive again');
	
	glow(document).detach('focus', focusListener);
	glow(document).detach('blur', blurListener);
	
	focusable.destroy();
});

test('modal', 8, function() {
	var elm1 = glow('#elementToTest3'),
		focusable = elm1.focusable(),
		activeElm,
		focusListener = function(event) {
			if ( !event.defaultPrevented() ) {
				activeElm = event.source;
			}
		},
		blurListener = function(event) {
			activeElm = undefined;
		};
	
	glow(document).on('focus', focusListener);
	glow(document).on('blur', blurListener);
	
	equal(typeof focusable.modal, 'function', '#modal exists');
	strictEqual(focusable.modal(), false, 'Not modal at start');
	ok(focusable.modal(true) === focusable, '#modal returns this');
	strictEqual(focusable.active(), true, 'Now active');
	strictEqual(focusable.modal(), true, 'Now modal');
	
	focusable.active(false);
	strictEqual(focusable.active(), true, 'Still active');
	ok(elm1.eq(activeElm), 'Still has focus');
	
	focusable.modal(true);
	glow('#canHaveFocus')[0].focus();
	ok(elm1.eq(activeElm), 'Still has focus 2');
	
	glow(document).detach('focus', focusListener);
	glow(document).detach('blur', blurListener);

	focusable.destroy();
});

module('glow.ui.Focusable - children');

test('Basic activating', 4, function() {
	var elm1 = glow('#elementToTest1'),
		focusable = elm1.focusable({ children: '> li' }),
		activeElm,
		focusListener = function(event) {
			if ( !event.defaultPrevented() ) {
				activeElm = event.source;
			}
		},
		blurListener = function(event) {
			activeElm = undefined;
		};
	
	glow(document).on('focus', focusListener);
	glow(document).on('blur', blurListener);
	
	ok(focusable.children.eq( glow('#elementToTest1 > li') ), '#children set');
	
	focusable.active(true);
	
	ok( glow('#elementToTest1 > li').item(0).eq(activeElm), 'First list item is active' );
	strictEqual(focusable.active(), true, 'Now active');
	ok( glow('#elementToTest1 > li').item(0).eq( focusable.activeChild ), '#activeChild set correctly' );
	
	glow(document).detach('focus', focusListener);
	glow(document).detach('blur', blurListener);
	
	activeElm && activeElm.blur();
	focusable.destroy();
});

test('next & prev', 19, function() {
	var elm1 = glow('#elementToTest1'),
		focusable = elm1.focusable({ children: '> li' }),
		activeElm,
		focusListener = function(event) {
			if ( !event.defaultPrevented() ) {
				activeElm = event.source;
			}
		},
		blurListener = function(event) {
			activeElm = undefined;
		};
	
	glow(document).on('focus', focusListener);
	glow(document).on('blur', blurListener);
	
	ok(focusable.children.eq( glow('#elementToTest1 > li') ), '#children set');
	
	focusable.active(true);
	ok( glow('#elementToTest1 > li').item(0).eq(activeElm), 'First list item is active' );
	strictEqual(focusable.active(), true, 'Now active');
	ok( glow('#elementToTest1 > li').item(0).eq( focusable.activeChild ), '#activeChild set correctly' );
	ok( glow('#elementToTest1 .active').eq( focusable.activeChild ), 'Class names set correctly' );
	
	equal(typeof focusable.next, 'function', '#next exists');
	equal(typeof focusable.prev, 'function', '#prev exists');
	
	focusable.next().next().next();
	
	ok( glow('#elementToTest1 > li').item(3).eq(activeElm), 'Fourth list item is active' );
	ok( glow('#elementToTest1 > li').item(3).eq( focusable.activeChild ), '#activeChild set correctly 2' );
	ok( glow('#elementToTest1 .active').eq( focusable.activeChild ), 'Class names set correctly 2' );
	
	focusable.prev().prev();
	
	ok( glow('#elementToTest1 > li').item(1).eq(activeElm), 'Second list item is active' );
	ok( glow('#elementToTest1 > li').item(1).eq( focusable.activeChild ), '#activeChild set correctly 3' );
	ok( glow('#elementToTest1 .active').eq( focusable.activeChild ), 'Class names set correctly 3' );
	
	focusable.next().next().next().next().next();
	
	ok( glow('#elementToTest1 > li').item(3).eq(activeElm), 'Fourth list item is active, didn\'t loop' );
	ok( glow('#elementToTest1 > li').item(3).eq( focusable.activeChild ), '#activeChild set correctly 4' );
	ok( glow('#elementToTest1 .active').eq( focusable.activeChild ), 'Class names set correctly 4' );
	
	focusable.prev().prev().prev().prev().prev();
	
	ok( glow('#elementToTest1 > li').item(0).eq(activeElm), 'First list item is active, didn\'t loop' );
	ok( glow('#elementToTest1 > li').item(0).eq( focusable.activeChild ), '#activeChild set correctly 5' );
	ok( glow('#elementToTest1 .active').eq( focusable.activeChild ), 'Class names set correctly 5' );
	
	glow(document).detach('focus', focusListener);
	glow(document).detach('blur', blurListener);
	
	activeElm && activeElm.blur();
	focusable.destroy();
});

test('looping', 2, function() {
	var elm1 = glow('#elementToTest1'),
		focusable = elm1.focusable({
			loop: true,
			children: '> li'
		}),
		activeElm,
		focusListener = function(event) {
			if ( !event.defaultPrevented() ) {
				activeElm = event.source;
			}
		},
		blurListener = function(event) {
			activeElm = undefined;
		};
	
	glow(document).on('focus', focusListener);
	glow(document).on('blur', blurListener);
	
	focusable.active(0);
	
	focusable.next().next().next().next().next();
	
	ok( glow('#elementToTest1 > li').item(1).eq(activeElm), 'Second list item is active, looped' );
	
	focusable.prev().prev();
	
	ok( glow('#elementToTest1 > li').item(3).eq(activeElm), 'Fourth list item is active, looped' );
	
	glow(document).detach('focus', focusListener);
	glow(document).detach('blur', blurListener);
	
	activeElm && activeElm.blur();
	focusable.destroy();
});