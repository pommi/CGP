<?php

# Collectd NUT plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# nut-XXXX/
# nut-XXXX/percent-XXXX.rrd
# nut-XXXX/temerature-XXXX.rrd
# nut-XXXX/voltage-XXXX.rrd
# nut-XXXX/timeleft-XXXX.rrd

$obj = new Type_Default($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->generate_colors();
switch($obj->args['type']) {
	case 'percent':
		$obj->data_sources = array('percent');
		$obj->ds_names = array('charge' => 'Charge',
		                       'load' => 'Load');
		$obj->rrd_title = sprintf('Charge & load (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = '%';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'temperature':
		$obj->data_sources = array('value');
		$obj->ds_names = array('value' => 'Temperature');
		$obj->rrd_title = sprintf('Temperature (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = '°C';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'timeleft':
		$obj->data_sources = array('timeleft');
		$obj->ds_names = array('timeleft' => 'Timeleft');
		$obj->rrd_title = sprintf('Timeleft (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Seconds';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'voltage':
		$obj->data_sources = array('value');
		$obj->ds_names = array('battery' => 'Battery',
		                       'input' => 'Input',
		                       'output' => 'Output');
		$obj->rrd_title = sprintf('Voltage (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Volts';
		$obj->rrd_format = '%5.1lf';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
