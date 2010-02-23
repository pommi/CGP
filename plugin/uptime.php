<?php

# Collectd Uptime plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# uptime/uptime.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array(
	'value' => 'seconds',
);
$obj->colors = array(
	'value' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Uptime';
$obj->rrd_vertical = 'Seconds';
$obj->rrd_format = '%.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
