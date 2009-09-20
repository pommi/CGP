<?php

require_once 'conf/common.inc.php';

$host = $_GET['h'];
$plugin = $_GET['p'];
$pinstance = $_GET['pi'];
$type = $_GET['t'];
$tinstance = $_GET['ti'];
$width = $_GET['x'];
$heigth = $_GET['y'];
$seconds = $_GET['s'];

if (!preg_match('/^[a-z]+$/', $plugin)) {
	die_img('Error: plugin contains unknown characters.');
	exit;
}

if (!file_exists($CONFIG['webdir']."/plugin/$plugin.php")) {
	die_img(sprintf('Error: plugin not available (%s).', $plugin));
	exit;
}

include $CONFIG['webdir']."/plugin/$plugin.php";


function die_img($msg) {
	header("Content-Type: image/png");
	$image = ImageCreatetruecolor(300, 30);
	$black = ImageColorAllocate($image, 0, 0, 0);
	$white = ImageColorAllocate($image, 255, 255, 255);
	imagefill($image, 0, 0, $white);
	imagerectangle($image, 0, 0, 299, 29, $black);
	imagestring($image, 2, 10, 9, $msg, $black);
	imagepng($image);
	imagedestroy($image);
}

?>
