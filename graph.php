<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';

$plugin = validate_get($_GET['p'], 'plugin');
$width = empty($_GET['x']) ? $CONFIG['width'] : $_GET['x'];
$heigth = empty($_GET['y']) ? $CONFIG['heigth'] : $_GET['y'];

if (validate_get($_GET['h'], 'host') === NULL) {
	error_log('CGP Error: plugin contains unknown characters');
	error_image();
}

if (!file_exists($CONFIG['webdir'].'/plugin/'.$plugin.'.php')) {
	error_log(sprintf('CGP Error: plugin "%s" is not available', $plugin));
	error_image();
}

# load plugin
include $CONFIG['webdir'].'/plugin/'.$plugin.'.php';


?>
