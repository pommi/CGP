<?php

require_once 'conf/common.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

header("Content-Type: text/html");

$category = GET('h');
$plugin = GET('p');

$selected_plugins = !$plugin ? $CONFIG['overview'] : array($plugin);

html_start();

echo "<h1>$category</h1>";

$host = $CONFIG['cat'][$category][0];

printf("<fieldset id=\"%s\">", htmlentities($host));
printf("<legend>%s</legend>", htmlentities($host));

		echo <<<EOT
<input type="checkbox" id="navicon" class="navicon" />
<label for="navicon"></label>

EOT;

if (!strlen($host) || !$plugins = collectd_plugins($host)) {
	echo "Unknown host\n";
	return false;
}

plugins_list_group($category, $selected_plugins);

echo $CONFIG['cat'][$category];

echo '<div class="graphs">';
foreach ($selected_plugins as $selected_plugin) {
	plugin_header($host, $selected_plugin);
	if (in_array($selected_plugin, $plugins)) {
		foreach ($CONFIG['cat'][$category] as $host) {
			graphs_from_plugin($host, $selected_plugin, empty($plugin));
		}
	}
}
echo '</div>';
printf("</fieldset>");

html_end();
