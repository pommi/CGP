<?php

# Collectd Swap plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';

## LAYOUT
# swap/
# swap/swap-cached.rrd
# swap/swap-free.rrd
# swap/swap-used.rrd

if ($type == 'swap_io') {
	die_img('Error: swap_io not supported yet');
	exit;
}

# grouped
require_once 'inc/collectd.inc.php';
$tinstance = collectd_plugindetail($host, $plugin, 'ti', array('t' => $type));

$obj = new Type_GenericStacked;
$obj->datadir = $CONFIG['datadir'];
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('value');
$obj->order = array('free', 'cached', 'used');
$obj->ds_names = array(
	'free' => 'Free    ',
	'cached' => 'Cached  ',
	'used' => 'Used    ',
);
$obj->colors = array(
	'free' => '00e000',
	'cached' => '0000ff',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;

$obj->rrd_title = 'Swap utilization';
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%s';

collectd_flush(ident_from_args($obj->args));

$obj->rrd_graph();

?>
