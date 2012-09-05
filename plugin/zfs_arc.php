<?php
# Collectd zfs_arc plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# zfs_arc/
# zfs_arc/arc_counts-hits.rrd
# zfs_arc/arc_counts-misses.rrd
# zfs_arc/arc_l2_bytes.rrd
# zfs_arc/arc_l2_size.rrd
# zfs_arc/arc_ratio-L1.rrd
# zfs_arc/arc_ratio-L2.rrd
# zfs_arc/arc_size.rrd

$obj = new Type_Default($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type']) {
	case 'arc_counts':
		$obj->data_sources = array(
			'demand_data',
			'demand_metadata',
			'prefetch_data',
			'prefetch_metadata',
		);
		$obj->colors = array(
			'hits-demand_data' => 'ff0000',
			'misses-demand_data' => '880000',
			'hits-demand_metadata' => '00ff00',
			'misses-demand_metadata' => '00aa00',
			'hits-prefetch_data' => '0000ff',
			'misses-prefetch_data' => '00f0f0',
			'hits-prefetch_metadata' => 'ff00ff',
			'misses-prefetch_metadata' => '888800',
		);
		$obj->ds_names = array(
			'hits-demand_data' => 'data hits',
			'misses-demand_data' => 'metadata misses',
			'hits-demand_metadata' => 'metadata hits',
			'misses-demand_metadata' => 'metadata misses',
			'hits-prefetch_data' => 'prefetch data hits',
			'misses-prefetch_data' => 'prefetch data misses',
			'hits-prefetch_metadata' => 'prefetch metadata hits',
			'misses-prefetch_metadata' => 'prefetch metadata misses',
		);
		$obj->rrd_title = 'arc counts';
		$obj->rrd_vertical = 'count';
		break;
	case 'arc_size':
		$obj->data_sources = array('current','target','minlimit','maxlimit');
		$obj->order = array(
			'current',
			'target',
			'minlimit',
			'maxlimit',
		);
		$obj->rrd_title = 'Arc size';
		$obj->rrd_vertical = 'bytes';
		break;
	case 'arc_l2_bytes':
		$obj->data_sources = array(
			'write',
			'read',
		);
		$obj->ds_names = array(
			'write' => 'Write',
			'read'  => 'Read',
		);
		$obj->colors = array(
			'write' => 'ff0000',
			'read'  => '0000ff',
		);
		$obj->rrd_title = 'Arc L2 bytes';
		$obj->rrd_vertical = 'bytes';
		break;
	case 'arc_l2_size':
		$obj->data_sources = array(
			'value',
		);
		$obj->ds_names = array(
			'value'   => 'Bytes',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = 'Arc L2 size';
		$obj->rrd_vertical = 'bytes';
		break;
	case 'arc_ratio':
		$obj->data_sources = array('value');
		$obj->rrd_title = 'Arc ratio';
		$obj->rrd_vertical = 'ratio';
		break;
}
collectd_flush($obj->identifiers);
$obj->rrd_graph();
