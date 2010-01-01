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

$host = validate_get($_GET['h'], 'host');
$plugin = validate_get($_GET['p'], 'plugin');
$pinstance = validate_get($_GET['pi'], 'pinstance');
$type = validate_get($_GET['t'], 'type');
$tinstance = validate_get($_GET['ti'], 'tinstance');
$width = $_GET['x'];
$heigth = $_GET['y'];
$seconds = $_GET['s'];

html_start();

printf('<h2><a href="%s">%s</a></h2>'."\n",
	$CONFIG['weburl'].'/host.php?h='.htmlentities($host), $host
);

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
print "<ul>\n";
foreach($term as $key => $s) {
	$args['s'] = $s;
	printf('<li><a href="%s/%s">%s</a></li>'."\n",
		$CONFIG['weburl'], build_url('detail.php', $args), $key);
}
print "</ul>\n";

$plugins = collectd_plugins($host);

if(!$plugins) {
	echo "Unknown host\n";
	return false;
}

# show graph
printf('<img src="%s/%s">'."\n", $CONFIG['weburl'], build_url('graph.php', $_GET));

html_end();

?>
