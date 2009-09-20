<?php

# Collectd Disk plugin

require_once $CONFIG['webdir'].'/conf/config.php';
require_once $CONFIG['webdir'].'/type/GenericIO.class.php';

## LAYOUT
# disk-XXXX/
# disk-XXXX/disk_merged.rrd
# disk-XXXX/disk_octets.rrd
# disk-XXXX/disk_ops.rrd
# disk-XXXX/disk_time.rrd

$obj = new Type_GenericIO;
$obj->datadir = $CONFIG['datadir'];
$obj->path_format = '{host}/{plugin}-{pinstance}/{type}.rrd';
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('read', 'write');
$obj->ds_names = array(
	'read' => 'Read   ',
	'write' => 'Written',
);
$obj->colors = array(
	'read' => '0000ff',
	'write' => '00b000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;
switch($type) {
	case 'disk_merged':
		$obj->rrd_title = "Disk Merged Operations ($pinstance) on $host";
		$obj->rrd_vertical = 'Merged operations/s';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'disk_octets':
		$obj->rrd_title = "Disk Traffic ($pinstance) on $host";
		$obj->rrd_vertical = 'Bytes per second';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'disk_ops':
		$obj->rrd_title = "Disk Operations ($pinstance) on $host";
		$obj->rrd_vertical = 'Ops per second';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'disk_time':
		$obj->rrd_title = "Disk time per operation ($pinstance) on $host";
		$obj->rrd_vertical = 'Avg. Time/Op';
		$obj->rrd_format = '%5.1lf%ss';
		$obj->scale = '0.001';
	break;
}

$obj->rrd_graph();

?>
