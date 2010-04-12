module('glow.net');
	test('Checks public interface', function() {			
        expect(1);				
        ok( (glow.net !== undefined), 'my instance of glow has the net module defined.' );
		
	});
		
	test('Basic net.get', function(){
		expect(8);
		stop();	
	
		var request = glow.net.get("xhr/basictext.txt").on("load", 
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
		
		equal(typeof request.abort, "function", "Return object has abort method");
		equal(typeof request.on, "function", "Return object has on method");
		equal(typeof request.destroy, "function", "Return object has destroy method");
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
	
			var request = glow.net.get("xhr/xml.xml").on("load", 
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
		
		glow.net.get("xhr/xml.txt", {
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
	/*test("glow.net.get async json", function() {
		expect(4);
		stop(5000);
		
		glow.net.get("xhr/requestheaderdump.php", 
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
		var request = glow.net.get("xhr/large.txt").on("load", 
				function(response){
					aborted = false;
				}).on("error",
				function(response){
					aborted = false;
				}).on("abort",
				function(response){
					ok(true, "Abort event fired");
				});
		request.abort();
		window.setTimeout(function() {
			ok(aborted, "Request aborted");
			start();
		}, 1000);
		
		
	});
	}*/
	
	
	test("glow.net.post async string", function() {
	expect(3);
	stop(5000);
	var request = glow.net.post("xhr/requestheaderdump.php",
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
	
	var request = glow.net.post("xhr/requestheaderdump.php",
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
	
	var request = glow.net.get("xhr/basictext.txt",
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
	
	var request = glow.net.getJsonp("xhr/jsoncallback.js?callback={callback}",
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
	expect(2);
	stop(5000);
	
	var onLoadCalled = false;
	
	//this script doesn't actually callback, so it'll timeout
	glow.net.getJsonp("xhr/loadscriptfail.js?callback={callback}",
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
/*
test("glow.net.getJsonp aborting", function() {
	expect(3);
	stop(5000);
	var onLoadCalled = false;
	var onErrorCalled = false;
	var onAbortCalled = false;
	
	var request = glow.net.getJsonp("testdata/xhr/jsoncallback.js?callback={callback}",
									{timeout: 2}).on('load', 
		function(data) {
			console.log('load');
			onLoadCalled = true;
			start();
		}).on('error',
		function() {
			console.log('error');
			onErrorCalled = true;
			start();
		}).on('abort',
		function() {
			console.log('abort');
			onAbortCalled = true;
			start();
		});
		
	
	if (request.completed) {
		console.log("completed");
		skip("Request complete, too late to abort");
		
		return;
	}
	//request.abort();
	
	window.setTimeout(function () {
		ok(!onLoadCalled, "load not called");
		ok(!onErrorCalled, "error (timeout) not called");
		ok(onAbortCalled, "abort called");
		start();
	}, 3000);
});

*/

test("glow.net.getResources single CSS", function() {
	expect(3);
	stop(5000);
	var timeoutCancelled = true;
	
	var request = glow.net.getResources("http://www.bbc.co.uk/glow/styles/default.css",
					   {timeout: 2}).on('progress',
		function(url){
			ok(true, "Progress fired");
			console.log("url completed: "+url);
			console.log(url);
			}).on('load',
		function(data) {
			ok(true, "Load fired");
			//equal(data.hello, "world", "Data passed");
			start();
		}).on('error',
			function() {
				timeoutCancelled = false;
			});

	
	window.setTimeout(function () {
		ok(timeoutCancelled, "error (timeout) not called");
		
		start();
	}, 3000);
	
	
});

test("glow.net.getResources single image", function() {
	expect(3);
	stop(5000);
	var timeoutCancelled = true;
	
	var request = glow.net.getResources("http://www.bbc.co.uk/glow/styles/images/banner.png",
					   {timeout: 2}).on('progress',
		function(url){
			ok(true, "Progress fired");
			console.log("url completed: "+url);
			console.log(url);
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

test("glow.net.put json", function() {
	expect(2);
	stop(5000);
	var request = glow.net.put("xhr/put.php",
		{some:"putData", blah:["something", "somethingElse"]}).on('load',
			function(response) {
				if ( response.text().slice(0, 2) == '<?' ) {
					start();
					skip("This test requires a web server running PHP5");
					return;
				}
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
	var request = glow.net.del("xhr/delete.php").on('load', 
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

    glow.net.crossDomainGet('xhr/xdomain/windowdotname.html?search',
							{_fullBlankUrl: 'xhr/xdomain/blank.html'}).on('load', 
       function (response) {
			console.log(response);
            equal(response, 'test response', 'get xDomainResponse');
            start();
	   });


});