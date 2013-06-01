<?php

# Collectd Thermal plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# thermal-XXXX/
# thermal-XXXX/gauge.rrd

$obj = new Type_Default($CONFIG);
$obj->ds_names = array(
	'value' => 'Temperature',
);
switch($obj->args['type']) {
	case 'gauge':
		$obj->rrd_title = sprintf('Temperature (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = '°C';
		$obj->rrd_format = '%.1lf';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
