module('glow.net');
test('Checks public interface', function() {			
	expect(1);				
	ok( (glow.net !== undefined), 'my instance of glow has the net module defined.' );
	
});
	
test('Basic net.get', function(){
	expect(7);
	stop();	
	
	var getRequest = glow.net.get('xhr/basictext.txt').on("load", function(response) {
		ok(true, 'correct callback used');
		equal(response.status, 200, 'Status code');
		equal(response.nativeResponse.status, 200, 'Native response found');
		ok(response.statusText(), 'Status returned: ' + response.statusText());
		equal(response.header('Content-Type'), 'text/plain', 'Content-Type header');
		start();
	}).on('error', function(response){
		ok(false, 'correct callback used');
		start();
	});

	equal(typeof getRequest.abort, 'function', 'Return object has abort method');
	equal(typeof getRequest.on, 'function', 'Return object has on method');
	
	stop(5000);
});



test('glow.net.get async header setting', function() {
	expect(5);
	stop();
	
	
	var request = glow.net.get('xhr/requestheaderdump.php',
		{headers: {
			'Custom-Header': 'thisisatest',
			'Content-Type': 'image/png'
		}})
	.on('load', 
		function(response){
			ok(true, 'correct callback used');
			ok(/^REQUEST_METHOD: GET/m.test(response.text()), 'Using get method');
			ok(/^HTTP_CUSTOM_HEADER: thisisatest/m.test(response.text()), "Custom Header Sent");
			ok(/^HTTP_X_REQUESTED_WITH: XMLHttpRequest/m.test(response.text()), "X-Requested-With default set");
			ok(/^CONTENT_TYPE: image\/png/m.test(response.text()), "Content-type Changed");
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});
	stop(5000);	
});


test("glow.net.get async xml", function() {
	expect(3);
	stop();
	
	var getXml = glow.net.get("xhr/xml.xml").on("load", 
		function(response){
			ok(true, "correct callback used");
			var xml = response.xml();
			ok(xml, "xml returned");
			equal(xml.getElementsByTagName("foo").length, 3, "3 elements of foo");
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});			
	stop(5000);
});


test("glow.net.get force xml", function() {
	expect(5);
	stop();
	
	var getXml = glow.net.get("xhr/xml.txt", {
		forceXml: true})
	.on("load", 
		function(response){
			ok(true, "correct callback used");
			var xml = response.xml();
			ok(xml, "xml returned");
			equal(xml.getElementsByTagName("hello").length, 1, "1 element of hello");
			equal(xml.getElementsByTagName("world").length, 1, "1 element of world");
			equal(xml.getElementsByTagName("world")[0].childNodes[0].nodeValue, 'Yey for XML', "Got text node value");
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});	
	stop(5000);
});

// need decodeJson method
test("glow.net.get async json", function() {
	expect(4);
	stop();
	
	var getRequest = glow.net.get("xhr/json.txt", 
		{some:"postData", blah:["something", "somethingElse"]})
	.on("load", 
		function(response){
			ok(true, "correct callback used");
			var json = response.json();
			ok(json, "json returned");
			equal(json.hello, "world", "Returned correct value for 'hello'");
			equal(json.something, 3, "Returned correct value for 'something'");
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});
	stop(5000);
});

test("glow.net.abort", function() {
	expect(2);		
	
	stop();
	var aborted = true;
	var abortableRequest = glow.net.get("xhr/large.txt", {
		cacheBust: true
	}).on("load", 
		function(response){
			aborted = false;
		})
	.on("error",
		function(response){
			aborted = false;
		})
	.on("abort",
		function(response){
			ok(true, "Abort event fired");
			start();
		});
	
	abortableRequest.abort();

	ok(aborted, "Request aborted");	
	stop(5000);
});


test("glow.net.post async string", function() {
	expect(3);
	stop();
	var postRequest = glow.net.post("xhr/requestheaderdump.php",
				"some=postData&blah=hurrah")
	.on("load",
		function(response){					
			ok(true, "correct callback used");
			equal( (/^REQUEST_METHOD: (\w+)/m.exec(response.text()) || [,,])[1], "POST", "Using post method" );
			equal( (/^CONTENT_LENGTH: (\d+)/m.exec(response.text()) || [,,])[1], "25",   "Correct content length" );
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});
	stop(5000);
});

test("glow.net.post aync json", function() {
	expect(3);
	stop();
	
	var postRequest = glow.net.post("xhr/requestheaderdump.php",
				{some:"postData", blah:["something", "somethingElse"]}).on("load",
		function(response){				
			ok(true, "correct callback used");
			equal( (/^REQUEST_METHOD: (\w+)/m.exec(response.text()) || [,,])[1], "POST", "Using post method" );
			equal( (/^CONTENT_LENGTH: (\d+)/m.exec(response.text()) || [,,])[1], "47",   "Correct content length" );
			start();
		})
	.on("error",
		function(response){
			ok(false, "correct callback used");
			start();
		});
	stop(5000);
});



test("glow.net.get timeout cancelling", function() {
	expect(2);
	stop(5000);
	
	var noError = true;
	
	var getRequest = glow.net.get("xhr/morebasictext.txt",
			{timeout: 2}).on("load",
		function(response){
			ok(true, "load called");
			start();
		})
	.on("error",
		function(response){
			noError = false;
		});
	
	
	ok(noError, "error (timeout) not called");		
	
});


test("glow.net.jsonp general", 2, function() {
	stop(5000);
	
	var jsonpRequest = glow.net.jsonp("xhr/jsoncallback.js?callback={callback}", {
		timeout: 2
	}).on('load', function(data) {
		ok(true, "load called");
		equal(data.hello, "world", "Data returned");
		start();
	}).on('error', function() {
		ok(false, "error callback not called");
	});
});

test("glow.net.jsonp timeout and charset", function() {
	expect(3);
	stop();
	
	var onLoadCalled = false;
	
	//this script doesn't actually callback, so it'll timeout
	var jsonpRequest = glow.net.jsonp("xhr/loadscriptfail.js?callback={callback}", {
		timeout: 2,
		charset: "utf-8"
	}).on('load', function(data) {
		onLoadCalled = true;
	}).on('error', function() {
		ok(!onLoadCalled, "load not called");
		ok(true, "error (timeout) called");
		start();
	});

	equals( glow('script').attr("charset"), "utf-8", "Charset set" );
	stop(5000);
});

test("glow.net.jsonp aborting", function() {	
	stop();
	var onLoadCalled = false;
	var onErrorCalled = false;
	var onAbortCalled = false;
	
	var jsonpRequest = glow.net.jsonp("testdata/xhr/jsoncallback.js?callback={callback}",
									{timeout: 2}).on('load', 
		function(data) {
			onLoadCalled = true;			
		}).on('error',
		function() {
			onErrorCalled = true;			
		}).on('abort',
		function() {
			onAbortCalled = true;
			start();
		});
		
	
	
		
	jsonpRequest.abort();
	
	
	expect(3);
	ok(!onLoadCalled, "load not called");
	ok(!onErrorCalled, "error (timeout) not called");
	ok(onAbortCalled, "abort called");
			
	stop(5000);
});



test("glow.net.getResources single CSS", function() {
	expect(5);
	stop(5000);
	
	var cssRequest = glow.net.getResources("xhr/resources/test.css").on('progress', function(response) {
		ok(true, "Progress fired for single CSS file");
		equal(response.type, 'css', 'Correct type');
		equal(response.resource[0].nodeName, 'LINK', 'Correct resource');
		equal(response.url, 'xhr/resources/test.css', 'Correct url');
	}).on('load', function(response) {
		ok(true, "Load fired");
		start();
	});

});

test("glow.net.getResources single image", function() {
	expect(5);
	stop(5000);
	var timeoutCancelled = true;
	
	var image = glow.net.getResources('xhr/resources/dragon.jpg').on('progress', function(response) {
		ok(true, "Progress fired for single image (this should appear 1 time)");
		equal(response.type, 'img', 'Correct type');
		equal(response.resource[0].nodeName, 'IMG', 'Correct resource');
		equal(response.url, 'xhr/resources/dragon.jpg', 'Correct url');
	}).on('load', function(response) {
		ok(true, "Load fired");
		start();
	});
});

test("glow.net.getResources multiple images", function() {
	expect(3);
	stop(5000);
	var timeoutCancelled = true;
	
	var images = glow.net.getResources([
		'xhr/resources/glow_g.png', 'xhr/resources/bunny.jpg'
	]).on('progress', function(response){
		ok(true, "Progress fired (this should appear 2 times)");
	}).on('load', function(response) {
		ok(true, "Load fired");
		start();
	})
});

test("glow.net.getResources mixed images and css", function() {
	expect(6);

	stop(5000);
	
	var imagesAndCss = glow.net.getResources([
		"xhr/resources/homebannerbg.png",
		"xhr/resources/gradientbg.png",
		"xhr/resources/test.css"
	]).on('progress', function(response){
		ok(true, "Progress fired (this should appear 3 times)");
	}).on('load', function(response) {
		ok(true, "Load fired");
		equal(this.totalResources, 3, 'totalResources');
		equal(this.totalLoaded, 3, 'totalLoaded');
		start();
	});
});

test("glow.net.put json", function() {
	expect(2);
	stop();
	var putRequest = glow.net.put("xhr/put.php",
		{some:"putData", blah:["something", "somethingElse"]})
	.on('load',
			function(response) {				
				ok(true, "correct callback used");
				equal( response.text(), "PUT: putData", "Using put method" );
				start();
			}).on('error',
			function() {
				ok(false, "correct callback used");
				start();
			});
	stop(5000);
});


test("glow.net.del", function() {
	expect(2);
	stop();
	var doomedRequest = glow.net.del("xhr/delete.php").on('load', 
			function(response) {
				ok(true, "correct callback used");
				equal( response.text(), "DELETE request", "Using delete method" );
				start();
			}).on('error', 
			function() {
				ok(false, "correct callback used");
				start();
			});
	stop(5000);	
	
});

test("glow.net.crossDomainRequest", function () {
    expect(1);
	stop(5000);
	
    glow.net.crossDomainGet(window.location.href.replace(/net\.html.*$/, '') + 'xhr/xdomain/windowdotname.html?search')
		.on('load', function (response) {
            equal(response.text(), 'test response', 'get xDomainResponse');
            start();
		});
});