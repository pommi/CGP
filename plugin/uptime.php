<?php

# Collectd Uptime plugin

require_once 'conf/common.inc.php';
require_once 'type/Uptime.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# uptime/uptime.rrd

$obj = new Type_Uptime($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array(
	'value' => 'Current',
);
$obj->colors = array(
	'value' => '00e000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Uptime';
$obj->rrd_vertical = 'Days';
$obj->rrd_format = '%.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
