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

test('escapeRegex', 100, function() {
	equal(typeof glow.util.escapeRegex, 'function', 'escapeRegex is function');
	equal(
		glow.util.escapeRegex('[Hello. Is | this* escaped?]'),
		'\\[Hello\\. Is \\| this\\* escaped\\?\\]',
		'Basic escaping test'
	);
});