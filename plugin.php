<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/html.inc.php';

$host = validate_get($_GET['h'], 'host');
$plugin = validate_get($_GET['p'], 'plugin');

if ($_GET['a'] == 'del') {
	plugin_header($host, $plugin, 1);
} else {
	plugin_header($host, $plugin, 0);
	graphs_from_plugin($host, $plugin);
}

?>
