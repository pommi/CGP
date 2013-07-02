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
$seconds = GET('s');

$selected_plugins = !$plugin ? $CONFIG['overview'] : array($plugin);

html_start();

printf('<fieldset id="%s">', $host);
printf('<legend>%s</legend>', $host);

$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

plugins_list($host, $selected_plugins);

echo '<div class="graphs">';
plugin_header($host, $plugin);

$args = $_GET;
print '<ul class="time-range">' . "\n";
foreach($CONFIG['term'] as $key => $s) {
	$args['s'] = $s;
	$selected = selected_timerange($seconds, $s);
	printf('<li><a %s href="%s%s">%s</a></li>'."\n",
		$selected, $CONFIG['weburl'], build_url('detail.php', $args), $key);
}
print "</ul>\n";

if ($CONFIG['graph_type'] == 'canvas') {
	chdir($CONFIG['webdir']);
	include $CONFIG['webdir'].'/plugin/'.$plugin.'.php';
} else {
	if ($CONFIG['graph_type'] == 'svg') {
		// In order to get SVG images that are approximately the same size as PNG images, using the same
		// $CONFIG['detail-width'] setting, we need to adjust the SVG width up by 1.114x.
		// With a detail-width of 850, SVG files display as exactly 850px while PNG displays as 947px wide.
		$svg_upscale_magic_number = 1.114;
		$img_width = sprintf(' width="%s"', (is_numeric($CONFIG['detail-width']) ? ($CONFIG['detail-width']) : 400) * $svg_upscale_magic_number);
	} else {
		$img_width = '';
	}
	$graph_url = $CONFIG['weburl'] . build_url('graph.php', $_GET);
	# Get the aggressiveness value, verify that it falls within 0-1000 
	if (isset($CONFIG['detail_graphs_refresh_aggressiveness']) && is_numeric($CONFIG['detail_graphs_refresh_aggressiveness'] )) {
		if ($CONFIG['detail_graphs_refresh_aggressiveness'] < 0) $CONFIG['detail_graphs_refresh_aggressiveness'] = 0;
		if ($CONFIG['detail_graphs_refresh_aggressiveness'] > 1000) $CONFIG['detail_graphs_refresh_aggressiveness'] = 1000;
	} else {
		$CONFIG['detail_graphs_refresh_aggressiveness'] = 400;
	}
	# Get seconds duration off of GET URL, or use default
	if (isset($_GET['s']) && is_numeric($_GET['s'])) {
		$duration_seconds = $_GET['s'];
	} else {
		$duration_seconds = $CONFIG['time_range']['default'];
	}
	# sanity check on graph duration (minimum of 60 seconds)
	if ($duration_seconds < 60) $duration_seconds = 60;
	# If the aggressiveness value > 0, then we can use it to calculate the refresh rate (in milliseconds)
	if ($CONFIG['detail_graphs_refresh_aggressiveness'] > 0) {
		printf('<script>$(document).ready(function() { setInterval(function rrdGraphRefresh(){ console.log(\'refresh\'); $(\'#detailRRDGraph\').attr(\'src\', \'%s\' + \'&_ts=\' + new Date().getTime()); }, %d); });</script>'."\n", 
			$graph_url
			($duration_seconds * 1000) / $CONFIG['detail_graphs_refresh_aggressiveness']
		);
	}
	printf('<img class="rrd_graph" id="detailRRDGraph" src="%s"%s>'."\n", 
		$graph_url, 
		$img_width
	);
}
echo '</div>';
echo "</fieldset>\n";



html_end();

?>
