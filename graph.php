<?php

require_once 'conf/common.inc.php';

$width = empty($_GET['x']) ? $CONFIG['width'] : $_GET['x'];
$heigth = empty($_GET['y']) ? $CONFIG['heigth'] : $_GET['y'];

if (!preg_match('/^[a-z]+$/', $_GET['p'])) {
	die_img('Error: plugin contains unknown characters.');
	exit;
}

if (!file_exists($CONFIG['webdir'].'/plugin/'.$_GET['p'].'.php')) {
	die_img(sprintf('Error: plugin not available (%s).', $_GET['p']));
	exit;
}

include $CONFIG['webdir'].'/plugin/'.$_GET['p'].'.php';


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
