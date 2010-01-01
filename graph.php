<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';

$plugin = validate_get($_GET['p'], 'plugin');
$width = empty($_GET['x']) ? $CONFIG['width'] : $_GET['x'];
$heigth = empty($_GET['y']) ? $CONFIG['heigth'] : $_GET['y'];

if (validate_get($_GET['h'], 'host') === NULL) {
	die_img('Error: plugin contains unknown characters.');
	exit;
}

if (!file_exists($CONFIG['webdir'].'/plugin/'.$plugin.'.php')) {
	die_img(sprintf('Error: plugin not available (%s).', $plugin));
	exit;
}

# load plugin
include $CONFIG['webdir'].'/plugin/'.$plugin.'.php';


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
