<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';

$plugin = validate_get(GET('p'), 'plugin');
$width = empty($_GET['x']) ? $CONFIG['width'] : $_GET['x'];
$height = empty($_GET['y']) ? $CONFIG['height'] : $_GET['y'];

if (validate_get(GET('h'), 'host') === NULL) {
	error_log('CGP Error: plugin contains unknown characters');
	error_image();
}

if (!file_exists($CONFIG['webdir'].'/plugin/'.$plugin.'.php')) {
	error_log(sprintf('CGP Error: plugin "%s" is not available', $plugin));
	error_image();
}

if ($width > $CONFIG['max-width'] || $height > $CONFIG['max-height']) {
	error_log('Resquested image is too large. Please configure max-width and max-height.');
	error_image();
}

# load plugin
include $CONFIG['webdir'].'/plugin/'.$plugin.'.php';


?>
