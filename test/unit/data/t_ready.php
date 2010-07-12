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
<?php
	// some browsers refuse to do incremental rendering before 1k of content
	$one_k = 1024;
	echo '<!--';
	while ($one_k--) { echo 'x'; }
	echo '-->';
?>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	
	<title>t Ready</title>
	
	<script type="text/javascript">
		parent.testHelper.addScript('brew.js', window);
	</script>
	
	<script type="text/javascript">
		window.readyRan = [];
		window.elementFound = null;
		
		window.globalBrew = Brew( parent.testHelper.getVersion(), {base: parent.testHelper.getBase() })
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
				brew.ready(function(brew){
					window.readyRan.push('three');
				});
			});
			
			(function() {
				var originalOnload = window.onload || function(){};
				
				window.onload = function() { /*debug*///log.info('window.onload');
					originalOnload();
					
					globalBrew.ready(function(brew){
						window.readyRan.push('four');
						
						/*debug*///log.info(window.readyRan.join(', '));
						parent.callbacks[window.name](window);
					});
				}
			})();
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
