<?php

# Collectd Sensors plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT (similar to sensors plugin)
#
# collectd, by default, creates the ipmi RRDs in the following pattern:
# /(basedir)/(hostname)/ipmi/(type)-(instance).rrd
#
# Instances for IPMI usually have spaces in the filename, such as:
#
# temperature-System Temp system_board (7.1).rrd
# voltage-+1.1 V system_board (7.1).rrd
# voltage--12 V system_board (7.1).rrd
# voltage-+12 V system_board (7.1).rrd
# voltage-VBAT system_board (7.1).rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->ds_names = array(
	'value' => 'Value',
);
switch($obj->args['type']) {
	case 'fanspeed':
		$obj->rrd_title = sprintf('Fanspeed (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'RPM';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'temperature':
		$obj->rrd_title = sprintf('Temperature (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Celsius';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'voltage':
		$obj->rrd_title = sprintf('Voltage (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Volt';
		$obj->rrd_format = '%5.1lf';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
