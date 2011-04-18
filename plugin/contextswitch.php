<?php

# Collectd contextswitch plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# contextswitch/contextswitch.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('contextswitches');
$obj->ds_names = array(
	'contextswitches' => 'Context switches',
);
$obj->colors = array(
	'contextswitches' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Context switches';
$obj->rrd_vertical = 'switch per second Bits';
$obj->rrd_format = '%4.0lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
