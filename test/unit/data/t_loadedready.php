<?php
	// allow incremental rendering in this environment
	@header('Cache-Control: private, no-cache, must-revalidate');
	@apache_setenv('no-gzip', 1);
	@ini_set('output_buffering', 0);
	@ini_set('zlib.output_compression', 0);
	@ini_set('implicit_flush', 1);
	for ($i = 0; $i < ob_get_level(); $i++) { ob_end_flush(); }
	ob_implicit_flush(1);
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	
	<title>t Loaded Ready</title>
	
	<script type="text/javascript">
		parent.testHelper.addScript('brew.js', window);
	</script>
	
	<script type="text/javascript">
		window.readyRan = [];
		window.elementFound = null;
		window.env = null;
		
		Brew( parent.testHelper.getVersion(), {base: parent.testHelper.getBase() })
			.load('core')
			.loaded(function() {
				window.readyRan.push('zero');
			})
			.ready(function(brew) {
				// dom elements in the body are available when this runs?
				window.elementFound = document.getElementById('test-element');
				
				// the first callback runs?
				window.readyRan.push('one');
			})
			.ready(function(brew) {
				// the second callback runs?
				window.readyRan.push('two');
				
				// setting a ready callback after the document is already ready...
				brew.load('ui')
				.loaded(function(){ /*debug*///log.info('~ pushed three');
					window.readyRan.push('three');
				})
				.ready(function(){ /*debug*///log.info('~ pushed four');
					window.readyRan.push('four');
					
					if (parent.callbacks && parent.callbacks[window.name]) { parent.callbacks[window.name](window); }
				});
			})
	</script>
	
</head>
<body>
Begin waiting.
<?php
	flush();
	sleep(2);
?>
End waiting.
<p id='test-element'>hello world</p>
</body>
</html>
