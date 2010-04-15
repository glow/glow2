module('glow.net');
	test('Checks public interface', function() {			
        expect(1);				
        ok( (glow.net !== undefined), 'my instance of glow has the net module defined.' );
		
	});
		
	test('Basic net.get', function(){
		expect(8);
		stop();	
	
		var getRequest = glow.net.get("xhr/basictext.txt").on("load", 
				function(response){
					ok(true, "correct callback used");
					equal(response.status, 200, "Status code");
					equal(response.nativeResponse.status, 200, "Native response found");
					ok(response.statusText(), "Status returned: " + response.statusText());
					equal(response.header("Content-Type"), "text/plain", "Content-Type header");
					start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
		
		equal(typeof getRequest.abort, "function", "Return object has abort method");
		equal(typeof getRequest.on, "function", "Return object has on method");
		equal(typeof getRequest.destroy, "function", "Return object has destroy method");
	});
	
	
	
	/*test("glow.net.get async header setting", function() {
		expect(5);
		stop(5000);
		
		
		var request = glow.net.get("xhr/requestheaderdump.php",
					 {headers: {
							"Custom-Header": "thisisatest",
							"Content-Type": "image/png"
						}}
					 ).on("load", 
				function(response){
					if ( response.text().slice(0, 2) == '<?' ) {
					start();
					skip("This test requires a web server running PHP5");
					return;
				}
						ok(true, "correct callback used");
						ok(/^REQUEST_METHOD: GET/m.test(response.text()), "Using get method");
						ok(/^HTTP_CUSTOM_HEADER: thisisatest/m.test(response.text()), "Custom Header Sent");
						ok(/^HTTP_X_REQUESTED_WITH: XMLHttpRequest/m.test(response.text()), "X-Requested-With default set");
						ok(/^CONTENT_TYPE: image\/png/m.test(response.text()), "Content-type Changed");
						start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
		
		
	});
	*/
	
	test("glow.net.get async xml", function() {
	expect(3);
	stop(5000);
	
			var getXml = glow.net.get("xhr/xml.xml").on("load", 
				function(response){
					ok(true, "correct callback used");
					var xml = response.xml();
					ok(xml, "xml returned");
					equal(xml.getElementsByTagName("foo").length, 3, "3 elements of foo");
					start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
			
			
	
	});
	
	
	test("glow.net.get force xml", function() {
		expect(5);
		stop(5000);
		
		var getXml = glow.net.get("xhr/xml.txt", {
			forceXml: true}).on("load", 
				function(response){
					ok(true, "correct callback used");
					var xml = response.xml();
					ok(xml, "xml returned");
					equal(xml.getElementsByTagName("hello").length, 1, "1 element of hello");
					equal(xml.getElementsByTagName("world").length, 1, "1 element of world");
					equal(xml.getElementsByTagName("world")[0].childNodes[0].nodeValue, 'Yey for XML', "Got text node value");
					start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
		
		
		
	});

	// need decodeJson method
	test("glow.net.get async json", function() {
		expect(4);
		stop(5000);
		
		var getRequest = glow.net.get("xhr/json.txt", 
		{some:"postData", blah:["something", "somethingElse"]}).on("load", 
				function(response){
					ok(true, "correct callback used");
					var json = response.json();
					ok(json, "json returned");
					equal(json.hello, "world", "Returned correct value for 'hello'");
					equal(json.something, 3, "Returned correct value for 'something'");
					start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
		
		
	});
	// below happens on all current version of IE 6, 7, 8
	if(!glow.env.ie){
	test("glow.net.abort", function() {
		expect(2);
		
		
		
		stop(5000);
		var aborted = true;
		var abortableRequest = glow.net.get("xhr/large.txt").on("load", 
				function(response){
					aborted = false;
				}).on("error",
				function(response){
					aborted = false;
				}).on("abort",
				function(response){
					ok(true, "Abort event fired");
				});
		abortableRequest.abort();
		window.setTimeout(function() {
			ok(aborted, "Request aborted");
			start();
		}, 1000);
		
		
	});
	}
	
	
	test("glow.net.post async string", function() {
	expect(3);
	stop(5000);
	var postRequest = glow.net.post("xhr/requestheaderdump.php",
					"some=postData&blah=hurrah").on("load",
				  function(response){
					if ( response.text().slice(0, 2) == '<?' ) {
						start();
						skip("This test requires a web server running PHP5");
						return;
					}
					ok(true, "correct callback used");
					equal( (/^REQUEST_METHOD: (\w+)/m.exec(response.text()) || [,,])[1], "POST", "Using post method" );
					equal( (/^CONTENT_LENGTH: (\d+)/m.exec(response.text()) || [,,])[1], "25",   "Correct content length" );
					start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
	
	
});
	
	test("glow.net.post aync json", function() {
	expect(3);
	stop(5000);
	
	var postRequest = glow.net.post("xhr/requestheaderdump.php",
								{some:"postData", blah:["something", "somethingElse"]}).on("load",
					function(response){
						if ( response.text().slice(0, 2) == '<?' ) {
						start();
						skip("This test requires a web server running PHP5");
						return;
					}
						ok(true, "correct callback used");
						equal( (/^REQUEST_METHOD: (\w+)/m.exec(response.text()) || [,,])[1], "POST", "Using post method" );
						equal( (/^CONTENT_LENGTH: (\d+)/m.exec(response.text()) || [,,])[1], "47",   "Correct content length" );
						start();
				}).on("error",
				function(response){
					ok(false, "correct callback used");
					start();
				});
	
	
	});


//timeouts
test("glow.net.get timeout cancelling", function() {
	expect(2);
	stop(5000);
	
	var noError = true;
	
	var getRequest = glow.net.get("xhr/basictext.txt",
					{timeout: 2}).on("load",
				function(response){
					ok(true, "load called");
							
				}).on("error",
				function(response){
					noError = false;
				});
	
	
		
	window.setTimeout(function () {
		ok(noError, "error (timeout) not called")
		start();
	}, 3000);
});

/**** HERE ****/
test("glow.net.getJsonp general", function() {
	expect(2);
	stop(5000);
	var timeoutCancelled = true;
	
	var jsonpRequest = glow.net.getJsonp("xhr/jsoncallback.js?callback={callback}",
					   {timeout: 2}).on('load',
		function(data) {
			ok(true, "Callback called");
			equal(data.hello, "world", "Data returned");
			start();
		}).on('error',
			function() {
				timeoutCancelled = false;
				
			});

	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called")
		
		start();
	}, 3000);
	
	
});

test("glow.net.getJsonp timeout and charset", function() {
	expect(3);
	stop(5000);
	
	var onLoadCalled = false;
	
	//this script doesn't actually callback, so it'll timeout
	var jsonpRequest = glow.net.getJsonp("xhr/loadscriptfail.js?callback={callback}",
					  {timeout: 2,
						charset: "utf-8"}).on('load', 
		function(data) {
			onLoadCalled = true;
			start();
		}).on('error',
		function() {
			ok(!onLoadCalled, "load not called");
			ok(true, "error (timeout) called");
			start();
		});

	equals(glow(document.body.lastChild).attr("charset"), "utf-8", "Charset set");
});

test("glow.net.getJsonp aborting", function() {	
	stop(5000);
	var onLoadCalled = false;
	var onErrorCalled = false;
	var onAbortCalled = false;
	
	var jsonpRequest = glow.net.getJsonp("testdata/xhr/jsoncallback.js?callback={callback}",
									{timeout: 2}).on('load', 
		function(data) {
			onLoadCalled = true;			
		}).on('error',
		function() {
			onErrorCalled = true;			
		}).on('abort',
		function() {
			onAbortCalled = true;			
		});
		
	
	
		
	jsonpRequest.abort();
	
	window.setTimeout(function () {
		if (!request.completed) {
			expect(3);
			ok(!onLoadCalled, "load not called");
			ok(!onErrorCalled, "error (timeout) not called");
			ok(onAbortCalled, "abort called");
			start();
		}
		else{
			expect(1);
			ok(request.completed, "The request completed to quickly to abort it");
			start();
		}
	}, 3000);
});



test("glow.net.getResources single CSS", function() {
	expect(4);
	stop(5000);
	var timeoutCancelled = true;
	
	var cssRequest = glow.net.getResources("http://www.bbc.co.uk/glow/styles/default.css",
					   {timeout: 2}).on('progress',
		function(response){
			console.log('progress event');
			ok(true, "Progress fired");
			equal( response, "http://www.bbc.co.uk/glow/styles/default.css", "Got uri of the item that just completed (progress)" );
			}).on('load',
		function(data) {
			console.log('load event');
			ok(true, "Load fired");
			start();
		}).on('error',
			function() {
				console.log('error event');
				timeoutCancelled = false;
			});

	
	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called");
		
		start();
	}, 3000);
	
	
});

test("glow.net.getResources single image", function() {
	expect(5);
	stop(5000);
	var timeoutCancelled = true;
	
	var image = glow.net.getResources("http://www.bbc.co.uk/glow/styles/images/banner.png",
					   {timeout: 2}).on('progress',
		function(response){
			ok(true, "Progress fired (this should appear 1 time)");
			equal( response, "http://www.bbc.co.uk/glow/styles/images/banner.png", "Got uri of the item that just completed (progress)" );
			
			}).on('load',
		function(response) {
			ok(true, "Load fired");
			equal( response.completed(), 1, "1 item completed" );
		}).on('error',
			function() {
				timeoutCancelled = false;
			});
	
	
	//console.log(request.element());
	
	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called")
		
		start();
	}, 3000);
	
	
});

test("glow.net.getResources multiple images", function() {
	expect(4);
	stop(5000);
	var timeoutCancelled = true;
	
	var images = glow.net.getResources(["http://www.bbc.co.uk/glow/styles/images/banner.png", "http://www.bbc.co.uk/includes/blq/resources/gvl/r57/img/header_blocks.gif"],
					   {timeout: 2}).on('progress',
		function(response){
			ok(true, "Progress fired (this should appear 2 times)");
			}).on('load',
		function(data) {
			ok(true, "Load fired");
			start();
		}).on('error',
			function() {
				timeoutCancelled = false;
			});
	
	
	//console.log(request.element());
	
	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called")
		
		start();
	}, 3000);
	
	
});


test("glow.net.getResources mixed images and css", function() {
	expect(5);
	stop(5000);
	var timeoutCancelled = true;
	
	var imagesAndCss = glow.net.getResources(["http://www.bbc.co.uk/glow/styles/images/banner.png", "http://www.bbc.co.uk/includes/blq/resources/gvl/r57/img/header_blocks.gif", "http://www.bbc.co.uk/glow/styles/default.css"],
					   {timeout: 2}).on('progress',
		function(response){
			ok(true, "Progress fired (this should appear 3 times)");
			console.log("progress response:"+ response);
			}).on('load',
		function(data) {
			ok(true, "Load fired");
			start();
		}).on('error',
			function() {
				timeoutCancelled = false;
			});
	

	
	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called")
		
		start();
	}, 3000);
	
	
});

test("glow.net.put json", function() {
	expect(2);
	stop(5000);
	var putRequest = glow.net.put("xhr/put.php",
		{some:"putData", blah:["something", "somethingElse"]}).on('load',
			function(response) {				
				ok(true, "correct callback used");
				equal( response.text(), "PUT: putData", "Using put method" );
				start();
			}).on('error',
			function() {
				ok(false, "correct callback used");
				start();
			});

});


test("glow.net.del", function() {
	expect(2);
	stop();
	var doomedRequest = glow.net.del("xhr/delete.php").on('load', 
			function(response) {
				if ( response.text().slice(0, 2) == '<?' ) {
					start();
					skip("This test requires a web server running PHP5");
					return;
				}
				ok(true, "correct callback used");
				equal( response.text(), "DELETE request", "Using delete method" );
				start();
			}).on('error', 
			function() {
				ok(false, "correct callback used");
				start();
			});
		
	
});

test("glow.net.crossDomainRequest", function () {
    expect(1);
	stop(5000);

    var crossdomainrequest = glow.net.crossDomainGet('xhr/xdomain/windowdotname.html?search',
							{_fullBlankUrl: 'xhr/xdomain/blank.html'}).on('load', 
       function (response) {		
            equal(response.text(), 'test response', 'get xDomainResponse');
            start();
	   });


});