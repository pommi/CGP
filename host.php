<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

$host = $_GET['h'];
$splugin = $_GET['p'];

html_start();

printf('<h2>%s</h2>'."\n", $host);

$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

# first the ones defined in overview
foreach($CONFIG['overview'] as $plugin) {
	if (in_array($plugin, $plugins)) {
		printf("<h3><img src=\"%s/layout/minus.gif\" alt=\"[-]\"> %s</h3>\n", $CONFIG['weburl'], $plugin);
		graphs_from_plugin($host, $plugin);
	}
}

# other plugins
foreach($plugins as $plugin) {
	if (!in_array($plugin, $CONFIG['overview'])) {
		$url = sprintf('<a href="%s/host.php?h=%s&p=%s">%s</a>'."\n", $CONFIG['weburl'], $host, $plugin, $plugin);
		if ($splugin == $plugin) {
			printf("<h3><img src=\"%s/layout/minus.gif\" alt=\"[-]\"> %s</h3>\n", $CONFIG['weburl'], $url);
			graphs_from_plugin($host, $plugin);
		} else {
			printf("<h3><img src=\"%s/layout/plus.gif\" alt=\"[+]\"> %s</h3>\n", $CONFIG['weburl'], $url);
		}
	}
}

html_end();

?>
