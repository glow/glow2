<?php

####
#   Given a query like '?package=version/name.js' or '?package=version/name.css'
#   will dynamically pull together all the files to make that package.
#
#   Uses the packages.xml file to decide which files belong to which packages.
#
#   To keep debugging code use ?package=version/name.debug.js
#   Debugging code in content is delimited by /*!debug*/ and /*gubed!*/
#
#   To add a delay (seconds) use ?package=version/name.js&delay=3
# 
#   To knit a file into the middle of another add the following to the content:
#   /*!include:filename.js*/
####

/**** configure ****/

$conf = array(
	'path_to_packagelist' => 'packages.xml',
	'path_to_root'        => '../'
);
if ( strpos($_GET['package'], '/brew/packages/') === 0 ) {
    $_GET['package'] = substr($_GET['package'], strlen('/brew/packages/'));
}



/**** main ****/

function errorHandler($msg) {
	$msg = str_replace("\\", "\\\\", $msg);
	$msg = str_replace("'", "\\'", $msg);
	$msg = preg_replace("/[\r\n]/", "\\n", $msg);
    echo "window.console && console.log('Knit Error: $msg.');\n";
    exit(1);
}

error_reporting(E_ALL); 
ini_set('display_errors', 0);
set_exception_handler('errorHandler');


$args = getSafeArgs($_GET); // note: $_GET is already URL decoded
$packages = getPackages($conf['path_to_packagelist']);

if ( empty($args['package']) ) {
 	throw new Exception('Required GET parameter "package" is empty.');
}

list($version, $packageName, $debug, $type) = parsePackageName($args['package']);

if ($version == '@SRC@') { $version = 'src'; }

$files = getFiles($packages, $packageName, $type);

if ( !empty($args['delay']) ) {
	sleep(min($args['delay'], 10)); // maximum sleepiness == 10
}

printHeader($type);

$content = knitFiles($files, $conf['path_to_root'] . $version . '/');
if (!$debug) {
	$content = preg_replace(':/\*!debug\*/.*?/\*gubed!\*/:s', '', $content);
}
print($content);


/**** functions ****/

/**
 */
function getSafeArgs($unsafe_args) {
	$safe_args = array();
	
	if ( !empty($unsafe_args['package']) ) {
		if (!preg_match('!([^/]+)/[a-z.]+\.(js|css)$!', $unsafe_args['package'])) {
			throw new Exception('Argument "package" ' . $unsafe_args['package'] . ' has unsafe characters and cannot be used.');
		}
		else {
			$safe_args['package'] = $unsafe_args['package'];
		}
	}
	
	if ( !empty($unsafe_args['delay']) ) {
		if (!preg_match('!^\d+$!', $unsafe_args['delay'])) {
			throw new Exception('Argument "delay" ' . $unsafe_args['delay'] . ' must be an integer so cannot be used.');
		}
		else {
			$safe_args['delay'] = $unsafe_args['delay'];
		}
	}
	
	return $safe_args;
}

/**
 */
function parsePackageName($package) {
	list($version, $package) = explode('/', $package);
	
	$parts = explode('.', $package);

	$type = array_pop($parts);
	
	$debug = 0;
	if ($parts[count($parts)-1] == 'debug') {
		$debug = 1;
		array_pop($parts);
	}
	
	$name = implode('.', $parts);
	
	return array($version, $name, $debug, $type);
}

/**
 */
function getPackages($xmlPath) {
	if ( !file_exists($xmlPath) || !is_readable($xmlPath) ) {
		throw new Exception("Cannot read any file at '$xmlPath'.");
	}
	
	try {
		$packages = simplexml_load_file($xmlPath);
	}
	catch(Exception $e) {
		throw new Exception("The file at '$xmlPath' cannot be parsed as XML.");
	}
	
	return $packages;
}

/**
 */
function getFiles($packages, $package_name, $type) {
	@$file_list = $packages->xpath("/packages/$package_name/$type");
	if ( empty($file_list) ) {
		throw new Exception("No data is defined for the package named '$package_name'.");
	}
	
	$files = array();
	
	foreach ($file_list[0] as $file) {
  		$files[] = preg_replace('/^src\//', '', $file); // 'src' will be replaced by the root+version
  	}
  	return $files;
}

/**
 */
function printHeader($type) {
	switch ($type) {
		case 'js':
			header('Content-Type: text/javascript');
			break;
		case 'css':
			header('Content-Type: text/css');
			break;
	}
}

/**
 */
function knitFiles($files, $base='') {
	$content = '';
	
	foreach ($files as $file) {
		$path = $base . $file;
		
		if ( !file_exists($path) || !is_readable($path) ) {
			throw new Exception("Cannot read any file at '$path'.");
		}
		$content .= file_get_contents($base . $file) . "\n";
  	}
  	
  	$content = parseInclude($content, $base);
  	
  	return $content;
}

/**
 */
function parseInclude($content, $base='') {
	$replacer = create_function('$args', 'return file_get_contents("'.$base.'include/".$args[1]);');

	$content = preg_replace_callback('/\/\*!include:(.+?)\*\//', $replacer, $content);
  	
  	return $content;
}




