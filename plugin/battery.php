<?php

# Collectd Battery plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# battery-X/
# battery-X/charge.rrd
# battery-X/current.rrd
# battery-X/voltage.rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->colors = array(
	'value' => '0000f0',
);
switch($obj->args['type']) {
	case 'charge':
		$obj->legend = array('value' => 'Charge');
		$obj->rrd_title = sprintf('Charge (Battery %s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Ampere hours';
	break;
	case 'current':
		$obj->legend = array('value' => 'Current');
		$obj->rrd_title = sprintf('Current (Battery %s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Ampere';
	break;
	case 'voltage':
		$obj->legend = array('value' => 'Voltage');
		$obj->rrd_title = sprintf('Voltage (Battery %s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Volt';
	break;
}
$obj->rrd_format = '%4.1lf';

$obj->rrd_graph();

