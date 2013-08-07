<?php

# Collectd NUT plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# nut-XXXX/
# nut-XXXX/frequency-XXXX.rrd
# nut-XXXX/percent-XXXX.rrd
# nut-XXXX/temerature-XXXX.rrd
# nut-XXXX/timeleft-XXXX.rrd
# nut-XXXX/voltage-XXXX.rrd

$obj = new Type_Default($CONFIG);
switch($obj->args['type']) {
	case 'frequency':
		if ($CONFIG['version'] < 5) {
			$obj->data_sources = array('frequency');
		} else {
			$obj->data_sources = array('value');
		}
		$obj->ds_names = array('output' => 'Output');
		$obj->rrd_title = sprintf('Frequency (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Hz';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'percent':
		if ($CONFIG['version'] < 5) {
			$obj->data_sources = array('percent');
		} else {
			$obj->data_sources = array('value');
		}
		$obj->ds_names = array('charge' => 'Charge',
		                       'load' => 'Load');
		$obj->rrd_title = sprintf('Charge & load (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = '%';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'temperature':
		$obj->data_sources = array('value');
		$obj->ds_names = array('battery' => 'Battery');
		$obj->rrd_title = sprintf('Temperature (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = '°C';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'timeleft':
		if ($CONFIG['version'] < 5) {
			$obj->data_sources = array('timeleft');
		} else {
			$obj->data_sources = array('value');
		}
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
