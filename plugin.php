<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';

$host = $_GET['h'];
$plugin = $_GET['p'];

if ($_GET['a'] == 'del') {
	printf("<h3><span class=\"point\" onclick=\"javascript:getP('%s','%s')\"><img src=\"%s/layout/plus.gif\" alt=\"[+]\"> %s</span></h3>\n", $host, $plugin, $CONFIG['weburl'], $plugin);
} else {
	printf("<h3><span class=\"point\" onclick=\"javascript:rmP('%s','%s')\"><img src=\"%s/layout/minus.gif\" alt=\"[-]\"> %s</span></h3>\n", $host, $plugin, $CONFIG['weburl'], $plugin);
	graphs_from_plugin($host, $plugin);
}

?>
