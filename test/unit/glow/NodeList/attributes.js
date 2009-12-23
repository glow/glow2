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

test('glow.NodeList#attr', 14, function() {
	var myNodeList = new glow.NodeList('<p title="theTitle" lang="en-uk"></p>text<span lang="en-us"></span><!-- comment -->');
	
	// test this: getting an attribute
	var lang = myNodeList.attr('lang'),
		title = myNodeList.attr('title'),
		nonexist = myNodeList.attr('flyingspaghettimonster');
	
	equal(lang, 'en-uk', 'Can get the existing lang attribute of a paragraph.');
	equal(title, 'theTitle', 'Can get the existing title attribute of a paragraph.');
	equal(nonexist, undefined, 'Can get a non-existant attribute, as undefined.');
	
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
	equal(myNodeList.attr('childNodes'), undefined, 'Getting attribute with same name as dom property does not return the dom property.');
	
	myNodeList = new glow.NodeList();
	
	// test this: setting an attribute on an empty nodelist
	myNodeList.attr('title', 'newTitle');
	
	ok(true, 'Can call attr() on an empty NodeList.');
	
	// test this: getting an attribute from an empty nodelist
	title = myNodeList.attr('title');
	
	equal(title, undefined, 'Getting an attribute from an empty list returns undefined.');
});

test('glow.NodeList#hasAttr', 6, function() {
	var myNodeList = new glow.NodeList('<p title="" lang="en-uk"></p>text<span title="someTitle"></span><!-- comment -->');
	
	// test this: getting an attribute
	var hasLang = myNodeList.hasAttr('lang'),
		hasTitle = myNodeList.hasAttr('title'),
		hasNonexist = myNodeList.hasAttr('flyingspaghettimonster'),
		hasDomprop = myNodeList.hasAttr('childNodes');
	
	equal(hasLang, true, 'Test if a defined node has a defined attribute.');
	// NOTE: An undefined attribute with a default value MAY be set automatically the browser
	equal(hasTitle, true, 'Test if a node has an empty but defined attribute.');
	equal(hasNonexist, false, 'Test if a node has a non-existent attribute.');
	equal(hasDomprop, false, 'Test if a node has an undefined attribute with same name as dom property.');
	
	myNodeList = new glow.NodeList();
	equal(myNodeList.hasAttr('unicorns'), undefined, 'Test if an attribute of an empty node list is undefined.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	equal(myNodeList.hasAttr('rainbows'), undefined, 'Attribute of an text node is undefined.');
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

test('glow.NodeList#removeAttr', 4, function() {
	var myNodeList = new glow.NodeList('<p title="aTitle" lang="en-uk"></p><span title="someTitle"></span><!-- comment -->');
	
	myNodeList.removeAttr('lang');
	myNodeList.removeAttr('title');
	myNodeList.removeAttr('unicorns');
	
	var hasLang = myNodeList.attr('lang'),
		hasTitle1 = myNodeList.attr('title'),
		hasNonexist = myNodeList.attr('unicorns');
	
	equal(hasLang||undefined, undefined, 'Removed an attribute from first element.');
	equal(hasTitle1||undefined, undefined, 'Removed another attribute from first element.');
	equal(hasNonexist, undefined, 'Removed non-existent attribute from first element.');
	
	myNodeList = new glow.NodeList(myNodeList[1]);
	
	var hasTitle2 = myNodeList.attr('title');
	equal(hasTitle2||undefined, undefined, 'Removed an attribute from second element.');
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