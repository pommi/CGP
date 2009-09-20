<?php

require_once 'inc/html.inc.php';
require_once 'inc/collectd.inc.php';

$host = $_GET['h'];
$plugin = $_GET['p'];
$pinstance = $_GET['pi'];
$type = $_GET['t'];
$tinstance = $_GET['ti'];
$width = $_GET['x'];
$heigth = $_GET['y'];
$seconds = $_GET['s'];

html_start();

printf('<h1><a href="%s">&laquo;</a> %s</h1>'."\n",
	$CONFIG['weburl'].'/host.php?h='.htmlentities($host), $host
);

$term = array(
	'2hour'	=> 3600*2,
	'6hour'	=> 3600*6,
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
