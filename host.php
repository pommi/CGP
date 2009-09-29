<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

$host = $_GET['h'];
$splugin = $_GET['p'];

html_start();

printf('<h2><a href="%s">&laquo;</a> %s</h2>'."\n", $CONFIG['weburl'], $host);

$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

# first the ones defined in overview
foreach($CONFIG['overview'] as $plugin) {
	if (in_array($plugin, $plugins)) {
		printf("<h3>[-] %s</h3>\n", $plugin);
		graphs_from_plugin($host, $plugin);
	}
}

# other plugins
foreach($plugins as $plugin) {
	if (!in_array($plugin, $CONFIG['overview'])) {
		$url = sprintf('<a href="%s/host.php?h=%s&p=%s">%s</a>'."\n", $CONFIG['weburl'], $host, $plugin, $plugin);
		if ($splugin == $plugin) {
			printf("<h3>[-] %s</h3>\n", $url);
			graphs_from_plugin($host, $plugin);
		} else {
			printf("<h3>[+] %s</h3>\n", $url);
		}
	}
}

html_end();

?>
