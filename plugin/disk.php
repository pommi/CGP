<?php

# Collectd Disk plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericIO.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# disk-XXXX/
# disk-XXXX/disk_merged.rrd
# disk-XXXX/disk_octets.rrd
# disk-XXXX/disk_ops.rrd
# disk-XXXX/disk_time.rrd

$obj = new Type_GenericIO($CONFIG);
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
switch($obj->args['type']) {
	case 'disk_merged':
		$obj->rrd_title = sprintf('Disk Merged Operations (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Merged operations/s';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'disk_octets':
		$obj->rrd_title = sprintf('Disk Traffic (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes per second';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'disk_ops':
		$obj->rrd_title = sprintf('Disk Operations (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Ops per second';
		$obj->rrd_format = '%5.1lf';
	break;
	case 'disk_time':
		$obj->rrd_title = sprintf('Disk time per operation (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Avg. Time/Op';
		$obj->rrd_format = '%5.1lf%ss';
		$obj->scale = '0.001';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
