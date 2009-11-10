<?php

/**
  Given a query like: '?package=version/name.js' or '?package=version/name.css'
  will dynamically pull together all the files to make that package.
	
  Uses the packages.xml file to decide which files belong to which packages.
*/


/**** configure ****/

$conf = array(
	'path_to_packagelist' => 'packages.xml',
	'path_to_root'        => '../'
);


/**** main ****/

error_reporting(E_ALL); 
ini_set('display_errors', 1);

$args = getSafeArgs($_GET); // note: $_GET is already URL decoded
$packages = getPackages($conf['path_to_packagelist']);

if ( empty($args['package']) ) {
 	throw new Exception('Required GET parameter "package" is empty.');
}

list($version, $package) = split('\/', $args['package']);
list($package_name, $type) = split('\.', $package);

$files = getFiles($packages, $package_name, $type);

printHeader($type);
knitFiles($files, $conf['path_to_root'] . $version . '/');


/**** functions ****/

/**
 */
function getSafeArgs($unsafe_args) {
	$safe_args = array();
	
	if ( !empty($unsafe_args['package']) ) {
		if (!preg_match('!([^/]+)/[a-z]+\.(js|css)$!', $unsafe_args['package'])) {
			throw new Exception('Argument "package" ' . $unsafe_args['package'] . ' has unsafe characters and cannot be used.');
		}
		else {
			$safe_args['package'] = $unsafe_args['package'];
		}
	}
	
	return $safe_args;
}

/**
 */
function getPackages($address) {
	if ( !file_exists($address) || !is_readable($address) ) {
		throw new Exception('No file can be read from that address for the package list.');
	}
	
	try {
		$packages = simplexml_load_file($address);
	}
	catch(Exception $e) {
		throw new Exception('The file at that address cannot be parsed as XML.');
	}
	
	return $packages;
}

/**
 */
function getFiles($packages, $package_name, $type) {
	@$file_list = $packages->xpath("/packages/$package_name/$type");
	if ( empty($file_list) ) {
		throw new Exception('No data is defined for the package with that name and type.');
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
	foreach ($files as $file) {
  		readfile($base . $file);
  		print "\n";
  	}
  	return $files;
}