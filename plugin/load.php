<?php

# Collectd Load plugin

require_once $CONFIG['webdir'].'/conf/config.php';
require_once $CONFIG['webdir'].'/type/Default.class.php';

## LAYOUT
# load/load.rrd

$obj = new Type_Default;
$obj->datadir = $CONFIG['datadir'];
$obj->path_format = '{host}/{plugin}/{type}.rrd';
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('shortterm', 'midterm', 'longterm');
$obj->ds_names = array(
	'shortterm' => ' 1 min',
	'midterm' => ' 5 min',
	'longterm' => '15 min',
);
$obj->colors = array(
	'shortterm' => '00ff00',
	'midterm' => '0000ff',
	'longterm' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;
$obj->rrd_title = "System load on $host";
$obj->rrd_vertical = 'System load';
$obj->rrd_format = '%.2lf';

$obj->rrd_graph();

?>
