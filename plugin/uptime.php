<?php

# Collectd Uptime plugin

require_once 'conf/common.inc.php';
require_once 'type/Uptime.class.php';

## LAYOUT
# uptime/uptime.rrd

$obj = new Type_Uptime($CONFIG, $_GET);
$obj->data_sources = array('value');
$obj->legend = array(
	'value' => 'Current',
);
$obj->colors = array(
	'value' => '00e000',
);
$obj->rrd_title = 'Uptime';
$obj->rrd_vertical = 'Days';
$obj->rrd_format = '%.1lf';

$obj->rrd_graph();
