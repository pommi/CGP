<?php

# Collectd Df plugin

require_once $CONFIG['webdir'].'/conf/config.php';
require_once $CONFIG['webdir'].'/type/GenericStacked.class.php';

# LAYOUT
#
# df/
# df/df-XXXX.rrd

$obj = new Type_GenericStacked;
$obj->datadir = $CONFIG['datadir'];
$obj->path_format = '{host}/{plugin}/{type}-{tinstance}.rrd';
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('free', 'used');
$obj->ds_names = array(
	'free' => 'Free',
	'used' => 'Used',
);
$obj->colors = array(
	'free' => '00ff00',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;

$obj->rrd_title = "Free space ($tinstance) on $host";
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%sB';

$obj->rrd_graph();

?>
