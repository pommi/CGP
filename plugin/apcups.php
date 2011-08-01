<?php

# Collectd APC UPS plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# apcups/
# apcups/charge.rrd
# apcups/frequency-input.rrd
# apcups/percent-load.rrd
# apcups/temperature.rrd
# apcups/timeleft.rrd
# apcups/voltage-battery.rrd
# apcups/voltage-input.rrd
# apcups/voltage-output.rrd

$obj = new Type_Default($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;

switch($obj->args['type']) {
	case 'charge':
		$obj->data_sources = array('value');
		$obj->ds_names = array('value' => 'Charge');
		$obj->colors = array('value' => '0000f0');
		$obj->rrd_title = sprintf('UPS Charge');
		$obj->rrd_vertical = 'Ampere hours';
	break;
	case 'frequency':
		$obj->data_sources = array('frequency');
		$obj->ds_names = array('frequency' => 'Input Frequency');
		$obj->colors = array('frequency' => '0000f0');
		$obj->rrd_title = sprintf('UPS Input Frequency');
		$obj->rrd_vertical = 'Hertz';
	break;
	case 'percent':
		$obj->data_sources = array('percent');
		$obj->ds_names = array('percent' => 'Load');
		$obj->colors = array('percent' => '0000f0');
		$obj->rrd_title = sprintf('UPS Load');
		$obj->rrd_vertical = 'Percent';
	break;
	case 'temperature':
		$obj->data_sources = array('value');
		$obj->ds_names = array('value' => 'Temperature');
		$obj->colors = array('value' => '0000f0');
		$obj->rrd_title = sprintf('UPS Temperature');
		$obj->rrd_vertical = 'Celsius';
	break;
	case 'timeleft':
		$obj->data_sources = array('timeleft');
		$obj->ds_names = array('timeleft' => 'Time Left');
		$obj->colors = array('timeleft' => '0000f0');
		$obj->rrd_title = sprintf('UPS Time Left');
		$obj->rrd_vertical = 'Minutes';
	break;
	case 'voltage':
		$obj->order = array('battery', 'input', 'output');
		$obj->ds_names = array(
			'battery' => 'Battery Voltage',
			'input' => 'Input Voltage',
			'output' => 'Output Voltage'
		);
		$obj->colors = array(
			'battery' => '0000f0',
			'input' => '00f000',
			'output' => 'f00000'
		);
		$obj->rrd_title = sprintf('UPS Voltage');
		$obj->rrd_vertical = 'Volt';
	break;
}
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

