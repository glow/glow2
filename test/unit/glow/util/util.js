module('glow.util');

test('apply', 3, function() {
	var objA = {foo: 'hello', bar: 'world'},
		objB = {bar: 'everyone', mof: 42};
		
	equal(typeof glow.util.apply, 'function', 'Function exists');
	
	var returnObj = glow.util.apply(objA, objB);
	
	equal(objA, returnObj, 'Returns destniation object');
	
	same(objA, {
		foo: 'hello',
		bar: 'everyone',
		mof: 42
	}, 'Properties copied');
});

test('apply ignores properties on prototype', 1, function() {
	function MyObj() {}
	MyObj.prototype.foobar = 'foobar';
	
	var objA = {foo: 'hello'},
		objB = new MyObj();
		
	objB.bar = 'world';
	
	glow.util.apply(objA, objB);
	
	same(objA, {
		foo: 'hello',
		bar: 'world'
	}, 'Properties copied');
});

test("extend", 12, function() {
	equal(typeof glow.util.extend, 'function', 'Function exists');

	var BaseClass = function() {
		this.a = "From Base";
		this.b = "From Base";
	}
	BaseClass.prototype = {
		c: function() {
			return "From Base";
		},
		d: function() {
			return "From Base";
		}
	};
	var SubClass = function() {
		BaseClass.call(this);
		this.b = "From Sub";
		this.e = "From Sub";
	}
	glow.util.extend(SubClass, BaseClass, {
		d: function() {
			return "From Sub";
		},
		f: function() {
			return "From Sub";
		}
	});

	var myBase = new BaseClass();
	var mySub = new SubClass();

	equals(myBase.a, "From Base", "Base a prop");
	equals(myBase.b, "From Base", "Base b prop");
	equals(myBase.c(), "From Base", "Base c function");
	equals(myBase.d(), "From Base", "Base d function");
	equals(mySub.a, "From Base", "Sub a prop (inherited)");
	equals(mySub.b, "From Sub", "Sub b prop (overwritten)");
	equals(mySub.c(), "From Base", "Sub c function (inherited)");
	equals(mySub.d(), "From Sub", "Sub d function (overwritten)");
	equals(mySub.e, "From Sub", "Sub e prop (new)");
	equals(mySub.f(), "From Sub", "Sub f function (new)");
	equals(SubClass.base, BaseClass, "sub.base property set");
});

test('getType', 10, function() {
	equal(typeof glow.util.getType, 'function', 'getType is function');
	equal(glow.util.getType(null), 'null', 'detect null');
	equal(glow.util.getType(undefined), 'undefined', 'detect undefined');
	equal(glow.util.getType('Hello'), 'string', 'detect string');
	equal(glow.util.getType({}), 'object', 'detect object');
	equal(glow.util.getType(new Object()), 'object', 'detect Object');
	equal(glow.util.getType(12), 'number', 'detect number');
	equal(glow.util.getType([]), 'Array', 'detect Array literal');
	equal(glow.util.getType(new Array()), 'Array', 'detect Array object');
	equal(glow.util.getType(glow('#whatever')), 'NodeList', 'detect NodeList');
});

test('escapeRegex', 2, function() {
	equal(typeof glow.util.escapeRegex, 'function', 'escapeRegex is function');
	equal(
		glow.util.escapeRegex('[Hello. Is | this* escaped?]'),
		'\\[Hello\\. Is \\| this\\* escaped\\?\\]',
		'Basic escaping test'
	);
});

test('trim', 7, function() {
	equal(typeof glow.util.trim, 'function', 'trim is function.');
	
	equal(
		glow.util.trim('  Hello World'), 'Hello World', 'Leading spaces.'
	);
	
	equal(
		glow.util.trim('Hello World  '), 'Hello World', 'Trailing spaces.'
	);
	
	equal(
		glow.util.trim('  Hello World  '), 'Hello World', 'Leading and trailing spaces.'
	);
	
	equal(
		glow.util.trim(' 	 Hello World'), 'Hello World', 'Leading spaces and tabs.'
	);
	
	equal(
		glow.util.trim('Hello World 	 '), 'Hello World', 'Trailing spaces and tabs.'
	);
	
	equal(
		glow.util.trim(' 	 Hello World 	 '), 'Hello World', 'Leading and trailing spaces and tabs.'
	);
});

test('decodeUrl', 4, function() {
	equal(typeof glow.util.decodeUrl, 'function', 'decodeUrl is function.');
	
	same(
		glow.util.decodeUrl('foo=Foo&bar=Bar%201&bar=Bar2'), {foo: 'Foo', bar: ['Bar 1', 'Bar2']}
	);
	
	same(
		glow.util.decodeUrl('foo&bar&bar'), {foo: '', bar: ['', '']}
	);
	
	same(
		glow.util.decodeUrl('foo=&bar&bar=2&foo=1'), {foo: ['', '1'], bar: ['', '2']}
	);
});

test('encodeUrl', 2, function() {
	equal(typeof glow.util.decodeUrl, 'function', 'decodeUrl is function.');
	
	same(
		glow.util.encodeUrl({foo: "Foo", bar: ["Bar 1", "Bar2"]}), "foo=Foo&bar=Bar%201&bar=Bar2"
	);
});

test('interpolate', 2, function() {
	equal(typeof glow.util.interpolate, 'function', 'interpolate is function.');
	
	var data = {
		name: 'Haxors!!1 <script src="hackhackhack.js"></script>'
	}
	var template = '<p>Hello, my name is {name}</p>';
	var result = glow.util.interpolate(template, data, {
		escapeHtml: true
	});
	
	equal(glow(result).get('*').length, 0, 'HTML Correctly escaped');
});

test('cookie', 8, function() {
	equal(typeof glow.util.cookie, 'function', 'cookie is function.');
	
	glow.util.cookie('tea', 'milky');
	
	var offset = document.cookie.indexOf('tea=milky');
	notEqual(offset, -1, 'Set cookie appears in document.cookie.');
	
	equal(glow.util.cookie('tea'), 'milky', 'Can set and get cookie.');
	
	var allCookies = glow.util.cookie();
	equal(allCookies['tea'], 'milky', 'Can get all cookies.');
	
	glow.util.cookie({'tea': 'milky', 'sugar': '2', 'biscuit': 'yes'});
	// note that order is not guaranteed to be preserved when setting then getting multiple cookies
	allCookies = glow.util.cookie();
	
	equal(allCookies['tea'], 'milky');
	equal(allCookies['sugar'], '2');
	equal(allCookies['biscuit'], 'yes');
	
	glow.util.removeCookie('sugar');
	equal(glow.util.cookie('sugar'), undefined, 'Can remove a cookie.');
});