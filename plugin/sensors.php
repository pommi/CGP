<?php

# Collectd Sensors plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# disk-XXXX/
# disk-XXXX/fanspeed-XXXX.rrd
# disk-XXXX/temerature-XXXX.rrd
# disk-XXXX/voltage-XXXX.rrd

$obj = new Type_Default($CONFIG['datadir']);
$obj->ds_names = array(
	'value' => 'Value  ',
);
$obj->width = $width;
$obj->heigth = $heigth;
switch($obj->args['type']) {
	case 'fanspeed':
		$obj->colors = '00ff00';
		$obj->rrd_title = sprintf('Fanspeed (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'RPM';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'temperature':
		$obj->colors = '0000ff';
		$obj->rrd_title = sprintf('Temperature (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Celius';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'voltage':
		$obj->colors = 'ff0000';
		$obj->rrd_title = sprintf('Voltage (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Volt';
		$obj->rrd_format = '%5.1lf';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
