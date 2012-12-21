<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

# use width/height from config if nothing is given
if (empty($_GET['x']))
	$_GET['x'] = $CONFIG['detail-width'];
if (empty($_GET['y']))
	$_GET['y'] = $CONFIG['detail-heigth'];

$host = validate_get(GET('h'), 'host');
$plugin = validate_get(GET('p'), 'plugin');
$pinstance = validate_get(GET('pi'), 'pinstance');
$category = validate_get(GET('c'), 'category');
$type = validate_get(GET('t'), 'type');
$tinstance = validate_get(GET('ti'), 'tinstance');
$width = GET('x');
$heigth = GET('y');
$seconds = GET('s');

if (!$plugin) {
	$selected_plugins = $CONFIG['overview'];
}
else {
	$selected_plugins = array($plugin);
}

html_start();

printf('<h2>%s</h2>'."\n", $host);

$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

plugins_list($host, $CONFIG['overview'], $plugins, $selected_plugins);


echo '<div class="graphs">';
plugin_header($host, $plugin);

$term = array(
	'2hour'	=> 3600*2,
	'8hour'	=> 3600*8,
	'day'	=> 86400,
	'week'	=> 86400*7,
	'month'	=> 86400*31,
	'quarter'=> 86400*31*3,
	'year'	=> 86400*365,
);

$args = $_GET;
print '<ul class="time-range">' . "\n";
foreach($term as $key => $s) {
	$args['s'] = $s;
	$selected = selected_timerange($seconds, $s);
	printf('<li><a %s href="%s%s">%s</a></li>'."\n",
		$selected, $CONFIG['weburl'], build_url('detail.php', $args), $key);
}
print "</ul>\n";

printf('<img src="%s%s">'."\n", $CONFIG['weburl'], build_url('graph.php', $_GET));
echo '</div>';

html_end();

?>
