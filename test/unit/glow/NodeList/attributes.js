module('glow.NodeList attributes');

test('glow.NodeList.attr API', 11, function() {
	ok(glow.NodeList.prototype, 'glow.NodeList.prototype is defined.');
	
	// test this: the methods in the docs are callable
	equal(typeof glow.NodeList.prototype.addClass, 'function', 'glow.NodeList.prototye.addClass is a function.');
	equal(typeof glow.NodeList.prototype.attr, 'function', 'glow.NodeList.prototye.attr is a function.');
	equal(typeof glow.NodeList.prototype.data, 'function', 'glow.NodeList.prototye.data is a function.');
	equal(typeof glow.NodeList.prototype.hasAttr, 'function', 'glow.NodeList.prototye.hasAttr is a function.');
	equal(typeof glow.NodeList.prototype.hasClass, 'function', 'glow.NodeList.prototye.hasClass is a function.');
	equal(typeof glow.NodeList.prototype.prop, 'function', 'glow.NodeList.prototye.prop is a function.');
	equal(typeof glow.NodeList.prototype.removeAttr, 'function', 'glow.NodeList.prototye.removeAttr is a function.');
	equal(typeof glow.NodeList.prototype.removeClass, 'function', 'glow.NodeList.prototye.removeClass is a function.');
	equal(typeof glow.NodeList.prototype.removeData, 'function', 'glow.NodeList.prototye.removeData is a function.');
	equal(typeof glow.NodeList.prototype.toggleClass, 'function', 'glow.NodeList.prototye.toggleClass is a function.');
});

test('glow.NodeList#addClass', 6, function() {
	var myNodeList = new glow.NodeList('<p id="p1"></p>text<span class="existingClass"></span><!-- comment -->');
	
	// test this: adding a class to a nodelist with multiple elements, text and comments
	myNodeList.addClass('newClass');
	
	equal(myNodeList[0].className, 'newClass', 'First element, with no class, gets new class.');
	equal((myNodeList[1].className||''), '', 'Text does not get new class.'); // className may be undefined or empty
	equal(myNodeList[2].className, 'existingClass newClass', 'Second element, with an existing class, gets new class added.');
	equal((myNodeList[3].className||''), '', 'Comment does not get new class.');

	// test this: non-element nodes
	myNodeList = new glow.NodeList('<!-- comment -->');
	myNodeList.addClass('rainbows');
	ok(true, 'Adding a class from a non-element node does not crash.');

	// test this: empty nodelist
	myNodeList = new glow.NodeList();
	myNodeList.addClass('rainbows');
	ok(true, 'Adding a class from an empty node list does not crash.');
});

if (glow.debug) test('glow.NodeList#addClass debug', 6, function() {
	var myNodeList = new glow.NodeList('<p></p>'),
		errorCount = glow.debug.errors.length,
		error;
	
	myNodeList.addClass(); // error
	equal(glow.debug.errors.length, errorCount+1, 'Passing no arguments logs an error.');
	error = glow.debug.errors.pop();
	equal(error.type, 'wrong count', 'Passing no arguments logs an error of type "count".');
	
	myNodeList.addClass('a', 'b'); // error
	equal(glow.debug.errors.length, errorCount+1,  'Passing more than 1 argument throws an error.');
	error = glow.debug.errors.pop();
	equal(error.type, 'wrong count', 'Passing more than 1 argument logs an error of type "count".');
	
	
	myNodeList.addClass([]); // error
	equal(glow.debug.errors.length, errorCount+1,  'Passing wrong type of argument throws an error.');
	error = glow.debug.errors.pop();
	equal(error.type, 'wrong type', 'Passing more than 1 argument logs an error of type "type".');
});

test('glow.NodeList#attr', 33, function() {
		
	// test this: getting an attribute value
	var myNodeList = new glow.NodeList(
		'<p title="theTitle" lang="en-uk"></p>text<span lang="en-us"></span><!-- comment -->'
	);
	equal(myNodeList.attr('lang'), 'en-uk', 'Can get the existing lang attribute of a paragraph.');
	equal(myNodeList.attr('title'), 'theTitle', 'Can get the existing title attribute of a paragraph.');
	equal(myNodeList.attr('flyingspaghettimonster'), '', 'Can get a non-existant attribute, as an empty string.');
	
	// test this: setting the value of an attribute with a default value with a single name and a single value
	myNodeList.attr('title', 'newTitle');
	equal(myNodeList[0].title, 'newTitle', 'Can set the title attribute, overwriting an existing title.');
	equal((myNodeList[1].title||''), '', 'Does not set the title attribute on a text node.');
	equal(myNodeList[2].title, 'newTitle', 'Attribute set on all items.');

	// test this: setting and getting the value of an attribute with no default value
	myNodeList = new glow.NodeList(
		'<p class="testClass"><b>hello</b></p>text<span TITLE="upperTitle"></span><!-- comment -->'
	);
	myNodeList.attr('unicorns', 'rainbow');
	equal(myNodeList.attr('unicorns'), 'rainbow', 'Can set and get the value of a custom attribute with no default value.');
	
	// test this: setting several attributes at once
	myNodeList.attr({'lang': 'en-us', 'title': 'otherTitle'});
	equal(myNodeList[0].lang, 'en-us', 'Can set an attribute using an object to define names and values.');
	equal(myNodeList[0].title, 'otherTitle', 'Can set multiple attributes using an object to define names and values.');
	equal(myNodeList[2].title, 'otherTitle', 'Can set an attribute using an object on every element, overwriting an existing attribute in different case.');
	
	// test this: setting and getting an attribute with different case
	myNodeList.attr('TITLE', 'caseyTitle');
	equal(myNodeList.attr('title'), 'caseyTitle', 'Can get uppercased title using lowercased name.');
	equal(myNodeList.attr('TiTlE'), 'caseyTitle', 'Can get the title using random case name.');
	
	// test this: setting and getting an attribute with different case which has a different dom property name
	myNodeList.attr('CLaSS', 'newClass');
	equal(myNodeList[0].className, 'newClass', 'Can set an attribute using an object on every element, overwriting an existing attribute in different case.');
	equal(myNodeList.attr('clAss'), 'newClass', 'Can get uppercased title using lowercased name.');
	
	// attributes and properties:
	// changing an attribute value will change the related dom property
	// changing a dom property value (or the browser inserts a default value) will change the related attribute value
	
	// test this: changing attribute where dom property name doesn't match the corresponding HTML attribute name
	myNodeList.attr('class', 'theClass');
	equal(myNodeList[0].className, 'theClass', 'Can set "class" attribute to change the dom node property "className".');
	
	// test this: getting attribute with same name as dom property does not return that dom property
	ok(myNodeList[0].childNodes, 'A dom property is defined but...')
	equal(myNodeList.attr('childNodes'), '', 'Getting attribute with same name as a defined dom property does not return the dom property.');
	
	// test this: setting an attribute on an empty nodelist
	myNodeList = new glow.NodeList();
	myNodeList.attr('title', 'newTitle');
	ok(true, 'Can call attr(name, value) on an empty NodeList.');
	
	// test this: getting an attribute from an empty nodelist
	title = myNodeList.attr('title');
	equal(title, '', 'Can call attr(name) on an empty list');
	
	// test this: getting and setting attributes on an image element
	myNodeList = new glow.NodeList(
		'<img src="whatever" alt="theAlt" width=77>'
	);
	equal(myNodeList.attr('width'), '77', 'Get an attribute from an image with the same name as a dom property.');
	equal(myNodeList.attr('height'), '', 'Get an undefined attribute from an image with the same name as a dom property.');
	myNodeList[0].width = 42;
	equal(myNodeList.attr('width'), '42', 'Set an attribute from an image with the same name as a dom property.');
	
	// test this: getting and setting attributes on a form element
	myNodeList = new glow.NodeList('<form action="foo" purpose="register" method="get"><input name="method" id="method" type="text"><input name="purpose" id="purpose" type="text"><input name="unicorns" id="unicorns" type="text"></form>');
	myNodeList[0].action = 'bar';
	equal(myNodeList.attr('action'), 'bar', 'When dom property with same name as attribute changes, so does the attribute.');
	equal(myNodeList.attr('purpose'), 'register', 'Getting custom attribute on a form with a same-named input.');
	equal(myNodeList.attr('unicorns'), '', 'Getting undefined attribute on a form with a same-named input.');

	myNodeList.attr('method', 'post');
	method = myNodeList[0].childNodes[0] || {nodeName: 'error'};
	equal(method.nodeName.toLowerCase(), 'input', 'Setting attribute on a form with a same-named input doe not affect input element.');
	
	// test this: attributes that refer to event handlers
	myNodeList = new glow.NodeList("<a href=\"/index.html\" onclick=\"alert('Back home!')\">Home</a>");
	var onclick = myNodeList.attr('onclick'), // defined
		onmouseover = myNodeList.attr('onmouseover'); // not defined
	equal(!!onclick, true, 'Getting event handler defined as an attribute returns a value.');
	equal(!!onmouseover, false, 'Getting event handler not defined as an attribute returns no value.');
	
	// test this: case insensitivity
	myNodeList = new glow.NodeList("<a TiTlE='go home' href='/index.html'>Home</a>");
	var title = myNodeList.attr('title');
	myNodeList.attr('title', 'index page');
	var title2 = myNodeList.attr('title');
	
    equal(title, 'go home', 'Getting an attribute with a different case.');
	equal(title2, 'index page', 'Setting an attribute with a different case.');
    
    // test this: getting href value of an anchor in page
	myNodeList = glow('#testanchor'); // will fail on IE 6 & 7 when the A node is generated with glow.dom.create()
	equal(myNodeList.attr('href'), 'index.html', 'Get a href attribute from an anchor has value as set.');

	// test this: some attribute names are special or case-sensitive in the borken browsers
	myNodeList = new glow.NodeList('<label for="email" class="my-class">Email</label><input name="email" id="email" type="text" maxlength="42" />');
	equal(myNodeList.attr('for'), 'email', 'Getting an attribute with a special name, like "for", returns the correct value.');
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.attr('maxlength'), '42', 'Getting an attribute with a special name, like "maxlength", returns the correct value.');
	
});

// if (glow.debug) test('glow.NodeList#attr debug', 3, function() {
// 	try {
// 		myNodeList.attr();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.attr('a', 'b', 'c'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 2 arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.attr(3, 'shazam'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#hasAttr', 11, function() {
	var myNodeList = new glow.NodeList('<p title="" lang="en-uk"></p>text<span title="someTitle"></span><!-- comment -->');
	
	// test this: checking if a node has an attribute
	var hasLang = myNodeList.hasAttr('lang'),
		hasTitle = myNodeList.hasAttr('title'),
		hasNonexist = myNodeList.hasAttr('flyingspaghettimonster'),
		hasDomprop = myNodeList.hasAttr('childNodes');
	
	equal(hasLang, true, 'An attribute with a value set to a non-empty string returns true.');
	// NOTE: An undefined attribute with a default value MAY be set automatically the browser
	equal(hasTitle, true, 'An attribute with a value set to the empty string returns true.');
	equal(hasNonexist, false, 'An non-existent attribute returns false.');
	equal(hasDomprop, false, 'An undefined attribute with same name as dom property returns false.');
	
	// test this: trying to call hasAttr on an empty nodelist
	myNodeList = new glow.NodeList();
	equal(myNodeList.hasAttr('unicorns'), undefined, 'Calling hasAttr() on an empty NodeList returns undefined.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.hasAttr('rainbows'), undefined, 'Calling hasAttr() on a text node returns undefined.');
	
	// test this: case insensitivity
	myNodeList = new glow.NodeList("<a REL='index' href='/index.html')\">Home</a>");
	
	equal(myNodeList.hasAttr('rel'), true, 'Case differences of attribute do not prevent hasAttr() from detecting it.');
	
	// test this: forms
	myNodeList = new glow.NodeList('<form action="foo" method="get"><input name="email" id="email" type="checkbox" checked /><input name="purpose" id="purpose" type="text"><input name="unicorns" id="unicorns" type="text"></form>');
	
	var hasAction = myNodeList.hasAttr('action'), // yes
		hasEmail = myNodeList.hasAttr('email'); // no
		
	equal(hasAction, true, 'Calling hasAttr() on a defined form attribute returns true.');
	equal(hasEmail, false, 'Calling hasAttr() on an undefined form attribute with same name as an input element returns false.');
	
	myNodeList = new glow.NodeList('<input name="email" id="email" type="checkbox" checked />');
	
	var hasChecked = myNodeList.hasAttr('checked'), // yes
		hasMaxlength = myNodeList.hasAttr('maxlength'); // no
		
	equal(hasChecked, true, 'Calling hasAttr() on an existing input attribute with no value returns true.');
	equal(hasMaxlength, false, 'Calling hasAttr() on an undefined input attribute with a default value, like maxlength, returns false.');

});

// if (glow.debug) test('glow.NodeList#hasAttr debug', 3, function() {
// 	try {
// 		myNodeList.hasAttr();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.hasAttr('a', 'b'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 1 argument throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.hasAttr([]); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#hasClass', 6, function() {
	var myNodeList = new glow.NodeList('<p class="one two three"></p>text');
	
	// test this: getting an attribute
	var hasClass0 = myNodeList.hasClass('shooby'),
		hasClass1 = myNodeList.hasClass('one'),
		hasClass2 = myNodeList.hasClass('two'),
		hasClass3 = myNodeList.hasClass('three');
	
	equal(hasClass0, false, 'Test if nonexistent class exists.');
	equal(hasClass1, true, 'Test if first class exists.');
	equal(hasClass2, true, 'Test if middle class exists.');
	equal(hasClass3, true, 'Test if last class exists.');
	
	// test this: empty nodelist
	myNodeList = new glow.NodeList();
	equal(myNodeList.hasClass('unicorns'), undefined, 'Class of an empty node list is undefined.');
	
	// test this: non-element nodes
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.hasClass('rainbows'), undefined, 'Class of an text node is undefined.');
	
});

// if (glow.debug) test('glow.NodeList#hasClass debug', 3, function() {
// 	try {
// 		myNodeList.hasClass();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.hasClass('a', 'b'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 1 argument throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.hasClass([]); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#removeAttr', 11, function() {
	var myNodeList = new glow.NodeList('<p title="aTitle" LANG="en-uk"></p><span title="someTitle"></span><!-- comment -->');
	
	myNodeList.removeAttr('lang');
	myNodeList.removeAttr('title');
	myNodeList.removeAttr('unicorns');
	
	var hasLang = myNodeList.hasAttr('lang'),
		hasTitle1 = myNodeList.hasAttr('title'),
		hasNonexist = myNodeList.hasAttr('unicorns');
	
	equal(hasLang, false, 'Removed an attribute from first element.');
	equal(hasTitle1, false, 'Removed another attribute from first element.');
	equal(hasNonexist, false, 'Removed non-existent attribute from first element.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	
	var hasTitle2 = myNodeList.attr('title');
	equal(hasTitle2, '', 'Removed an attribute from second element.');
	
	// test this: case sensitivity
	myNodeList = new glow.NodeList("<a TaRgEt='_blank' href='/index.html')\">Home</a>");
	
	myNodeList.removeAttr('target');
	equal(myNodeList[0].target, '', 'Removing an attribute with different case.');
	
	// test this: removing special attributes
	myNodeList = new glow.NodeList("<a class='linky' href='/index.html' onclick=\"alert('Back home!')\">Home</a>");
	
	ok(/\bindex\.html$/.test(myNodeList[0].href), 'A href attribute was defined.');
	equal(myNodeList[0].className, 'linky', 'A class attribute was defined.');

	myNodeList.removeAttr('href');
	myNodeList.removeAttr('class');
	
	equal(myNodeList[0].href, '', 'Removing an href attribute of an anchor tag empties the href property.');
	equal(myNodeList[0].className, '', 'Removing a class attribute by removing "class" empties the className property.');
	
	// test this: non-element nodes
	var myNodeList = new glow.NodeList(myNodeList[2]);
	myNodeList.removeAttr('href');
	ok(true, 'Removing an attribute from a non-element node does not crash.');
	
	// test this: empty nodelist
	var myNodeList = new glow.NodeList();
	myNodeList.removeAttr('href');
	ok(true, 'Removing an attribute from an empty node list does not crash.');

});

// if (glow.debug) test('glow.NodeList#removeAttr debug', 3, function() {
// 	try {
// 		myNodeList.removeAttr();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.removeAttr('a', 'b'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 1 argument throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.removeAttr([]); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#removeClass', 9, function() {
	var myNodeList = new glow.NodeList('<p class=" one   two three"></p><span class="two two"></span><span class="two"></span><span></span><span class="FOUR"></span>');
	
	myNodeList.removeClass('two');
	
	equal(myNodeList[0].className, 'one three', 'Removed a middle class.');
	equal(myNodeList[1].className, '', 'Removed a repeated class from second element.');
	equal(myNodeList[2].className, '', 'Removed a single class from second element.');
	equal(myNodeList[3].className, '', 'Removed a non-existent class from second element.');
	
	myNodeList.removeClass('one');
	equal(myNodeList[0].className, 'three', 'Removed the first class.');
	
	myNodeList.removeClass('three');
	equal(myNodeList[0].className, '', 'Removed the last class.');
	
	// classname is [CS] case sensitive, see http://www.w3.org/TR/html401/struct/global.html#h-7.5.2
	myNodeList.removeClass('four');
	equal(myNodeList[4].className, 'FOUR', 'Class name is treated as case sensitive.');

	// test this: non-element nodes
	myNodeList = new glow.NodeList('<!-- comment -->');
	myNodeList.removeClass('rainbows');
	ok(true, 'Removing a class from a non-element node does not crash.');

	// test this: empty nodelist
	myNodeList = new glow.NodeList();
	myNodeList.removeClass('href');
	ok(true, 'Removing a class from an empty node list does not crash.');

});

// if (glow.debug) test('glow.NodeList#removeClass debug', 3, function() {
// 	try {
// 		myNodeList.removeClass();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.removeClass('a', 'b'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 1 argument throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.removeClass(/abc/); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#prop', 7, function() {
	myNodeList = new glow.NodeList('<form action="process.php" target="popup" method="get"></form>Read<a href="terms.php">our Terms of service</a><!--comment-->');
	var form = myNodeList[0];
	
	var target = myNodeList.prop('target');
	equal(form.target, 'popup', 'Read a standard property from a form.');
	
	myNodeList.prop('target', '_blank');
	equal(form.target, '_blank', 'Set a standard property on a form.');
	
	myNodeList.prop({'title': 'hello', 'className': 'myclass'});
	equal(form.title, 'hello', 'Set a standard property on a form via an object.');
	equal(form.className, 'myclass', 'Set multiple properties on a form via an object.');
	equal(myNodeList[2].className, 'myclass', 'Set multiple properties on multiple nodes.');
	
	// test this: non-element nodes
	myNodeList = new glow.NodeList(myNodeList[1]);
	var textProp = myNodeList.prop('stuff');
	equal(textProp, undefined, 'Reading prop from a text node returns undefined.');
	
	// test this: empty nodelist
	myNodeList = new glow.NodeList();
	var emptyProp = myNodeList.prop('stuff');
	equal(emptyProp, undefined, 'Reading prop from an empty list returns undefined.');
	
});

// if (glow.debug) test('glow.NodeList#prop debug', 3, function() {
// 	try {
// 		myNodeList.prop();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.prop('a', 'b', 'c'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 2 arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.prop([]); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of arguments throws an error.');
// 	}
// });

test('glow.NodeList#toggleClass', 4, function() {
	var myNodeList = new glow.NodeList('<p class="some-class other-class" id="p1"></p>text<!-- comment -->');
	
	// test this: toggle class
	myNodeList.toggleClass('some-class');
	
	equal(myNodeList[0].className, 'other-class', 'Can toggle an existing class to remove it.');
	
	myNodeList.toggleClass('some-class');
	equal(myNodeList[0].className, 'other-class some-class', 'Can toggle an non-existing class to add it.');
	
	// test this: non-element nodes
	myNodeList = new glow.NodeList('<!-- comment -->');
	myNodeList.toggleClass('rainbows');
	ok(true, 'Toggling a class on a non-element node does not crash.');

	// test this: empty nodelist
	myNodeList = new glow.NodeList();
	myNodeList.toggleClass('rainbows');
	ok(true, 'Toggling a class on an empty node list does not crash.');
});

// if (glow.debug) test('glow.NodeList#toggleClass debug', 3, function() {
// 	try {
// 		myNodeList.toggleClass();
// 	}
// 	catch(e) {
// 		ok(true, 'Passing no arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.toggleClass('a', 'b'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 1 argument throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.toggleClass(7); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#data', 11, function() {
	var myNodeList = new glow.NodeList('' +
		'<div id="dataTest"></div>' +
		'<p id="para1">' +
			'<span id="span1">one</span>' +
		'</p>' +
		'<p id="para2">two</p>' +
		'<p id="para3">three</p>' +
		'text<!-- comment -->'
	);
	
	var unicorns = myNodeList.data('unicorns');
	equal(unicorns, undefined, 'Getting a datum from NodeList with no data returns undefined.');
	
	var data = myNodeList.data();
	equal(data, undefined, 'Getting all data from NodeList with no data returns undefined.');
	
	var self = myNodeList.data('color', 'red');
	equal(myNodeList.data('color'), 'red', 'Can set and get a key, val from NodeList.');
	ok((myNodeList === self), 'The call to set a key, val is chainable.');
	
	data = myNodeList.data();
	equal(data.color, 'red', 'Can get the entire data object from NodeList when given no arguments.');
	
	var para1 = new glow.NodeList(myNodeList[1]);
	equal(para1.data('color'), 'red', 'Can get the same data from different NodeLists that refer to the same DomElements.');

	self = myNodeList.data({
		size: 'grande',
		count: 8
	});
	equal(myNodeList.data('size'), 'grande', 'Can set multiple key:vals at once.');
	equal(myNodeList.data('count'), 8, 'All the multiple key:vals are set.');
	ok((myNodeList === self), 'The call to multiple key:val is chainable.');
	
	myNodeList.data(0, 'zero');
	equal(myNodeList.data(0), 'zero', 'Can use falsey key.');
	
	myNodeList.data('nada', 0);
	equal(myNodeList.data('nada'), 0, 'Can use falsey val.');
});

// if (glow.debug) test('glow.NodeList#data debug', 2, function() {
// 	try {
// 		myNodeList.data('a', 'b', 'c'); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing more than 2 arguments throws an error.');
// 	}
// 	
// 	try {
// 		myNodeList.data(7); // error
// 	}
// 	catch(e) {
// 		ok(true, 'Passing wrong type of argument throws an error.');
// 	}
// });

test('glow.NodeList#removeData', 5, function() {
	var myNodeList = new glow.NodeList('' +
		'<div id="dataTest">' +
		'<p id="para1">' +
			'<span id="span1">one</span>' +
		'</p>' +
		'<p id="para2">two</p>' +
		'<p id="para3">three</p>' +
		'</div>text<!-- comment -->'
	);
	
	myNodeList.data({color: 'red', size: 'grande'});
	equal(myNodeList.data('color'), 'red', 'Data is set on the NodeList.');
	
	myNodeList.removeData('color');
	equal(myNodeList.data('color'), undefined, 'Can remove data by key name.');
	
	equal(myNodeList.data('size'), 'grande', 'More data is already set on the NodeList.');
	
	var self = myNodeList.removeData();
	var data = myNodeList.data();
	equal(data, undefined, 'Can remove all data at once.');
	ok( (myNodeList === self), 'The call to removeData is chainable.');
});


test('glow.NodeList#val', 12, function() {
	equal(
		glow("<input type=\"text\" name=\"blah\"/>").val(),
		"",
		"unspecified value returns empty string"
	);

	equal(
		glow("<input type=\"text\" name=\"blah\" value=\"val\"/>").val(),
		"val",
		"get value from text input"
	);

	equal(
		glow("<input type=\"checkbox\" name=\"blah\" value=\"val\" checked=\"checked\"/>").val(),
		"val",
		"get value from checked checkbox"
	);
	
	equal(
		glow("<input type=\"checkbox\" name=\"blah\" value=\"val\"/>").val(),
		"",
		"Empty value from unchecked checkbox"
	);

	equal(
		glow("<input type=\"radio\" name=\"blah\" value=\"val\"/>").val(),
		"",
		"Empty value from unchecked radio"
	);

	equal(
		glow("<input type=\"radio\" name=\"blah\" value=\"val\" checked=\"checked\"/>").val(),
		"val",
		"get value from checked radio"
	);

	equal(
		glow(
			"<select name=\"blah\"><option>foo</option>" +
			"<option value=\"bah\" selected=\"selected\">bar</option></select>"
		).val(),
		"bah",
		"value for selectd is selected option"
	);


	var formVal = glow(
		"<form>" +
		  "<fieldset>" +
			"<input type=\"hidden\" name=\"hidden1\" value=\"hidden1val\"/>" +
			"<input type=\"text\" name=\"nm1\" value=\"val1\"/>" +
			"<input type=\"text\" name=\"nm2\" value=\"val2.1\"/>" +
			"<input type=\"text\" name=\"nm2\" value=\"val2.2\"/>" +
		  "</fieldset>" +
		  "<fieldset>" +
			"<input type=\"checkbox\" name=\"ck1\" value=\"val1\"/>" +
			"<input type=\"checkbox\" name=\"ck2\" value=\"val2\" checked=\"checked\"/>" +
			"<input type=\"checkbox\" name=\"ck3\" value=\"val3.1\"/>" +
			"<input type=\"checkbox\" name=\"ck3\" value=\"val3.2\" checked=\"checked\"/>" +
			"<input type=\"checkbox\" name=\"ck3\" value=\"val3.3\"/>" +
			"<input type=\"checkbox\" name=\"ck3\" value=\"val3.4\" checked=\"checked\"/>" +
			"<input type=\"radio\" name=\"myRadios\" value=\"rval1\"/>" +
			"<input type=\"radio\" name=\"myRadios\" value=\"rval2\" checked=\"checked\"/>" +
			"<input type=\"radio\" name=\"myRadios2\" value=\"rval1\"/>" +
			"<input type=\"radio\" name=\"myRadios2\" value=\"rval2\"/>" +
			'<input type="text" value="Test" />' +
			'<object id="uploadBridge"><param name="quality" value="high" /></object>' +
			'<input type="file" name="fileUpload" />' +
			'<input type="submit" id="whatever" value="Test" />' +
		  "</fieldset>" +
		"</form>"
	).val();

	/*8*/equal(formVal.nm1, "val1", "form element in form value");
	



	/*9*/ok(! ('ck1' in formVal), "unchecked checkbox value not in form");
	/*10*/equal(formVal.ck2, "val2", "checked checkbox value in form");
	
	

	/*11*/equal(formVal.myRadios, "rval2", "radio has value of checked radio");
	/*12*/equal(formVal.myRadios2, undefined, "unchecked radios have undefined value");
});

