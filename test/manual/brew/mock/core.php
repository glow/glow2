<?php

error_reporting(E_ALL); 
ini_set('display_errors', 1);

$version = $_GET['version'];
$core = file_get_contents('../../../../src/core/ready.js') . "\n";

header('Content-Type: text/javascript');
echo $core;
echo "\nBrew.complete('core', '$version');";