<?php

$data = json_decode( file_get_contents('data.json') );
$filtered = array();
foreach ($data as $dataItem) {
	$pos = stripos($dataItem->name, $_GET['search']);
	if ($pos === 0) {
		$filtered[] = $dataItem;
	}
}
echo json_encode($filtered);