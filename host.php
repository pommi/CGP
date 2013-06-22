<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

$host = validate_get(GET('h'), 'host');
$plugin = validate_get(GET('p'), 'plugin');

$selected_plugins = !$plugin ? $CONFIG['overview'] : array($plugin);

html_start();

printf("<fieldset id=\"%s\"/>", $host);
printf("<legend>%s</legend>", $host);


$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

plugins_list($host, $selected_plugins);

echo '<div class="graphs">';
foreach ($selected_plugins as $selected_plugin) {
	if (in_array($selected_plugin, $plugins)) {
		plugin_header($host, $selected_plugin);
		graphs_from_plugin($host, $selected_plugin, empty($plugin));
	}
}
echo '</div>';
printf("</fieldset>");

html_end();

?>
