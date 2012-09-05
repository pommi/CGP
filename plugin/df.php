<?php

# Collectd Df plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

# LAYOUT
#
# df-X/df_complex-free.rrd
# df-X/df_complex-reserved.rrd
# df-X/df_complex-used.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('value');
$obj->order = array('reserved', 'free', 'used');
$obj->ds_names = array(
	'reserved' => 'Reserved',
	'free' => 'Free',
	'used' => 'Used',
);
$obj->colors = array(
	'reserved' => 'aaaaaa',
	'free' => '00ff00',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('Free space (%s)', $obj->args['pinstance']);
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%sB';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('free', 'used');
	$obj->rrd_title = sprintf('Free space (%s)', $obj->args['tinstance']);
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
