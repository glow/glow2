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

test('glow.NodeList#addClass', 4, function() {
	var myNodeList = new glow.NodeList('<p id="p1"></p>text<span class="existingClass"></span><!-- comment -->');
	
	// test this: adding a class to a nodelist with multiple elements, text and comments
	myNodeList.addClass('newClass');
	
	equal(myNodeList[0].className, 'newClass', 'First element, with no class, gets new class.');
	equal((myNodeList[1].className||''), '', 'Text does not get new class.'); // className may be undefined or empty
	equal(myNodeList[2].className, 'existingClass newClass', 'Second element, with an existing class, gets new class added.');
	equal((myNodeList[3].className||''), '', 'Comment does not get new class.');
});

test('glow.NodeList#attr', 24, function() {
	var myNodeList = new glow.NodeList('<p title="theTitle" lang="en-uk"></p>text<span lang="en-us"></span><!-- comment -->');
	
	// test this: getting an attribute
	var lang = myNodeList.attr('lang'),
		title = myNodeList.attr('title'),
		nonexist = myNodeList.attr('flyingspaghettimonster');
	
	equal(lang, 'en-uk', 'Can get the existing lang attribute of a paragraph.');
	equal(title, 'theTitle', 'Can get the existing title attribute of a paragraph.');
	equal(nonexist, '', 'Can get a non-existant attribute, as an empty string.');
	
	// test this: setting the value of an attribute with a default value with a single name and a single value
	myNodeList.attr('title', 'newTitle');
	
	equal(myNodeList[0].title, 'newTitle', 'Can set the title attribute, overwriting an existing title.');
	equal((myNodeList[1].title||''), '', 'Does not set the title attribute on a text node.');
	equal(myNodeList[2].title, 'newTitle', 'Can set a new title attribute to multiple elements.');
	
	myNodeList = new glow.NodeList('<p></p>text<span TITLE="upperTitle"></span><!-- comment -->');
	
	// test this: setting and getting the value of an attribute with no default value
	myNodeList.attr('unicorns', 'rainbow');
	
	equal(myNodeList.attr('unicorns'), 'rainbow', 'Can set and get the value of an attribute with no default value.');
	
	// test this: setting attributes where dom property doesn't match HTML attribute
	myNodeList.attr('class', 'theClass');
	equal(myNodeList[0].className, 'theClass', 'Can set "class" to set dom node property "className".');
	
	// test this: setting attributes with many names and values
	myNodeList.attr({'lang': 'en-us', 'title': 'otherTitle'});
	
	equal(myNodeList[0].lang, 'en-us', 'Can set an attribute using an object to define names and values.');
	equal(myNodeList[2].title, 'otherTitle', 'Can set a attribute using an object on every element, overwriting an existing attribute in different case.');
	
	// test this: setting an attribute with uppercased name, getting same attribute with lowercased name
	myNodeList.attr('TITLE', 'caseyTitle');
	title = myNodeList.attr('title');
	equal(title, 'caseyTitle', 'Can set and get the title using different case names.');
	
	// test this: getting attribute with same name as dom property does not return the dom property
	equal(myNodeList.attr('childNodes'), '', 'Getting attribute with same name as dom property does not return the dom property.');
	
	myNodeList = new glow.NodeList();
	
	// test this: setting an attribute on an empty nodelist
	myNodeList.attr('title', 'newTitle');
	
	ok(true, 'Can call attr() on an empty NodeList.');
	
	// test this: getting an attribute from an empty nodelist
	title = myNodeList.attr('title');
	
	equal(title, undefined, 'Getting an attribute from an empty list returns undefined.');
	
	// test this: getting and setting attributes on a form element
	myNodeList = new glow.NodeList('<form action="foo" purpose="register" method="get"><input name="method" id="method" type="text"><input name="purpose" id="purpose" type="text"><input name="unicorns" id="unicorns" type="text"></form>');
	var method = myNodeList.attr('method');
	if (typeof method !== 'string') method = 'error - not a string!';
	equal(method, 'get', 'Getting standard attribute on a form with a same-named input.');
	equal(myNodeList.attr('purpose'), 'register', 'Getting custom attribute on a form with a same-named input.');
	equal(myNodeList.attr('unicorns'), '', 'Getting undefined attribute on a form with a same-named input.');

	myNodeList.attr('method', 'post');
	method = myNodeList[0].childNodes[0] || {nodeName: ''};
	equal(method.nodeName.toLowerCase(), 'input', 'Setting attribute on a form with a same-named input.');
	
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
    
	// test this: some attribute names are special or case-sensitive in the borken browsers
	myNodeList = new glow.NodeList('<label for="email" class="my-class">Email</label><input name="email" id="email" type="text" maxlength="42" />');
	equal(myNodeList.attr('for'), 'email', 'Getting an attribute with a special name, like "for", returns the correct value.');
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.attr('maxlength'), '42', 'Getting an attribute with a special name, like "maxlength", returns the correct value.');
	
});

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
	
	myNodeList = new glow.NodeList();
	equal(myNodeList.hasClass('unicorns'), undefined, 'Class of an empty node list is undefined.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.hasClass('rainbows'), undefined, 'Class of an text node is undefined.');
	
});

test('glow.NodeList#removeAttr', 9, function() {
	var myNodeList = new glow.NodeList('<p title="aTitle" lang="en-uk"></p><span title="someTitle"></span><!-- comment -->');
	
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
});

test('glow.NodeList#removeClass', 6, function() {
	var myNodeList = new glow.NodeList('<p class=" one   two three"></p><span class="two two"></span><span class="two"></span><span></span>');
	
	myNodeList.removeClass('two');
	
	equal(myNodeList[0].className, 'one three', 'Removed a middle class.');
	equal(myNodeList[1].className, '', 'Removed a repeated class from second element.');
	equal(myNodeList[2].className, '', 'Removed a single class from second element.');
	equal(myNodeList[3].className, '', 'Removed a non-existent class from second element.');
	
	myNodeList.removeClass('one');
	equal(myNodeList[0].className, 'three', 'Removed the first class.');
	
	myNodeList.removeClass('three');
	equal(myNodeList[0].className, '', 'Removed the last class.');
});

test('glow.NodeList#prop', 9, function() {
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
	
	try {
		myNodeList.prop();
	}
	catch(e) {
		ok(true, 'Passing no arguments to prop throws an error.');
	}
	
	try {
		myNodeList.prop('a', 'b', 'c');
	}
	catch(e) {
		ok(true, 'Passing more than 2 arguments to prop throws an error.');
	}
	
	myNodeList = new glow.NodeList();
	var emptyProp = myNodeList.prop('stuff');
	equal(emptyProp, undefined, 'Reading prop from an empty list returns undefined.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	var textProp = myNodeList.prop('stuff');
	equal(textProp, undefined, 'Reading prop from a text node returns undefined.');
});