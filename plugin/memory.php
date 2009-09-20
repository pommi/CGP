<?php

# Collectd Memory plugin

require_once $CONFIG['webdir'].'/conf/config.php';
require_once $CONFIG['webdir'].'/type/GenericStacked.class.php';

## LAYOUT
# memory/
# memory/memory-buffered.rrd
# memory/memory-cached.rrd
# memory/memory-free.rrd
# memory/memory-used.rrd

# grouped
require_once $CONFIG['webdir'].'/inc/collectd.inc.php';
$tinstance = collectd_plugindetail($host, $plugin, 'ti');

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
$obj->data_sources = array('value');
$obj->order = array('free', 'buffered', 'cached', 'used');
$obj->ds_names = array(
	'free' => 'Free    ',
	'cached' => 'Cached  ',
	'buffered' => 'Buffered',
	'used' => 'Used    ',
);
$obj->colors = array(
	'free' => '00e000',
	'cached' => '0000ff',
	'buffered' => 'ffb000',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;

$obj->rrd_title = "Physical memory utilization on $host";
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();

?>
