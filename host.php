<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

$host = validate_get($_GET['h'], 'host');
$splugin = validate_get($_GET['p'], 'plugin');

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
		printf('<div id="%s">'."\n", $plugin);
		plugin_header($host, $plugin, 0);
		graphs_from_plugin($host, $plugin);
		print "</div>\n";
	}
}

# other plugins
foreach($plugins as $plugin) {
	if (!in_array($plugin, $CONFIG['overview'])) {
		printf('<div id="%s">'."\n", $plugin);
		if ($splugin == $plugin) {
			plugin_header($host, $plugin, 0);
			graphs_from_plugin($host, $plugin);
		} else {
			plugin_header($host, $plugin, 1);
		}
		print "</div>\n";
	}
}

html_end();

?>
