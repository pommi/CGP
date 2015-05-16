<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

# use width/height from config if nothing is given
if (empty($_GET['x']))
	$_GET['x'] = $CONFIG['detail-width'];
if (empty($_GET['y']))
	$_GET['y'] = $CONFIG['detail-height'];

# set graph_type to canvas if hybrid
if ($CONFIG['graph_type'] == 'hybrid')
	$CONFIG['graph_type'] = 'canvas';

$host = GET('h');
$plugin = GET('p');
$pinstance = GET('pi');
$category = GET('c');
$type = GET('t');
$tinstance = GET('ti');
$seconds = GET('s');

$selected_plugins = !$plugin ? $CONFIG['overview'] : array($plugin);

html_start();

printf('<fieldset id="%s">', htmlentities($host));
printf('<legend>%s</legend>', htmlentities($host));

		echo <<<EOT
<input type="checkbox" id="navicon" class="navicon" />
<label for="navicon"></label>

EOT;

if (!$plugins = collectd_plugins($host)) {
	echo "Unknown host\n";
	return false;
}

plugins_list($host, $selected_plugins);

echo '<div class="graphs">';
plugin_header($host, $plugin);

$args = GET();
print '<ul class="time-range">' . "\n";
foreach($CONFIG['term'] as $key => $s) {
	$args['s'] = $s;
	$selected = selected_timerange($seconds, $s);
	printf('<li><a %s href="%s%s">%s</a></li>'."\n",
		$selected,
		htmlentities($CONFIG['weburl']),
		htmlentities(build_url('detail.php', $args)),
		htmlentities($key));
}
print "</ul>\n";

if ($CONFIG['graph_type'] == 'canvas') {
	chdir($CONFIG['webdir']);
	include $CONFIG['webdir'].'/graph.php';
} else {
	printf("<img src=\"%s%s\">\n",
		htmlentities($CONFIG['weburl']),
		htmlentities(build_url('graph.php', GET()))
	);
}
echo '</div>';
echo "</fieldset>\n";

html_end();
