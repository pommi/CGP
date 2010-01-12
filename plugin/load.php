<?php

# Collectd Load plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# load/load.rrd

$obj = new Type_Default($CONFIG);
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
$obj->rrd_title = 'System load';
$obj->rrd_vertical = 'System load';
$obj->rrd_format = '%.2lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
