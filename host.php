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
		printf('<div id="%s">'."\n", $plugin);
		printf("<h3><span class=\"point\" onclick=\"javascript:rmP('%s','%s')\"><img src=\"%s/layout/minus.gif\" alt=\"[-]\"> %s</span></h3>\n", $host, $plugin, $CONFIG['weburl'], $plugin);
		graphs_from_plugin($host, $plugin);
		print "</div>\n";
	}
}

# other plugins
foreach($plugins as $plugin) {
	if (!in_array($plugin, $CONFIG['overview'])) {
		printf('<div id="%s">'."\n", $plugin);
		if ($splugin == $plugin) {
			printf("<h3><span class=\"point\" onclick=\"javascript:rmP('%s','%s')\"><img src=\"%s/layout/minus.gif\" alt=\"[-]\"> %s</span></h3>\n", $host, $plugin, $CONFIG['weburl'], $plugin);
			graphs_from_plugin($host, $plugin);
		} else {
			printf("<h3><span class=\"point\" onclick=\"javascript:getP('%s','%s')\"><img src=\"%s/layout/plus.gif\" alt=\"[+]\"> %s</span></h3>\n", $host, $plugin, $CONFIG['weburl'], $plugin);
		}
		print "</div>\n";
	}
}

html_end();

?>
