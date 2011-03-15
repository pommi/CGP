<?php

# Collectd Postgresql plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# postgresql-X/pg_blks-heap_hit.rrd
# postgresql-X/pg_blks-heap_read.rrd
# postgresql-X/pg_blks-idx_hit.rrd
# postgresql-X/pg_blks-idx_read.rrd
# postgresql-X/pg_blks-tidx_hit.rrd
# postgresql-X/pg_blks-tidx_read.rrd
# postgresql-X/pg_blks-toast_hit.rrd
# postgresql-X/pg_blks-toast_read.rrd
# postgresql-X/pg_db_size.rrd
# postgresql-X/pg_n_tup_c-del.rrd
# postgresql-X/pg_n_tup_c-hot_upd.rrd
# postgresql-X/pg_n_tup_c-ins.rrd
# postgresql-X/pg_n_tup_c-upd.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type']) {
	case 'pg_blks':
		$obj->ds_names = array(
			'heap_hit'   => 'Heap hit',
			'heap_read'  => 'Heap read',
			'idx_hit'    => 'Index hit',
			'idx_read'   => 'Index read',
			'tidx_hit'   => 'Toast index hit',
			'tidx_read'  => 'Toast index read',
			'toast_hit'  => 'Toast hit',
			'toast_read' => 'Toast read',
		);
		$obj->rrd_title = sprintf('PostgreSQL Disk I/O (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Blocks';
	break;
	case 'pg_db_size':
		$obj->ds_names = array(
			'value' => 'Size',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('PostgreSQL DB size (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Bytes';
	break;
	case 'pg_n_tup_c':
		$obj->order = array(
			'ins',
			'upd',
			'hot_upd',
			'del',
		);
		$obj->ds_names = array(
			'ins'     => 'Insert',
			'upd'     => 'Update',
			'hot_upd' => 'Hot Update',
			'del'     => 'Delete',
		);
		$obj->colors = array(
			'ins'     => '00ff00',
			'upd'     => 'ff7c00',
			'hot_upd' => '0000ff',
			'del'     => 'ff0000',
		);
		$obj->rrd_title = sprintf('PostgreSQL Row actions (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Rows';
	break;
	case 'pg_n_tup_g':
		$obj->order = array('live', 'dead');
		$obj->ds_names = array(
			'live' => 'Live',
			'dead' => 'Dead',
		);
		$obj->colors = array(
			'live' => '00ff00',
			'dead' => 'ff0000',
		);
		$obj->rrd_title = sprintf('PostgreSQL Table states (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Rows';
	break;
	case 'pg_numbackends':
		$obj->ds_names = array(
			'value' => 'Backends',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('PostgreSQL Backends (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Number';
	break;
	case 'pg_scan':
		$obj->ds_names = array(
			'seq'           => 'Sequential',
			'seq_tup_read'  => 'Sequential rows',
			'idx'           => 'Index',
			'idx_tup_fetch' => 'Index Rows',
		);
		$obj->rrd_title = sprintf('PostgreSQL Scans (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Scans / Rows';
	break;
	case 'pg_xact':
		$obj->ds_names = array(
			'commit'   => 'Commit',
			'rollback' => 'Rollback',
		);
		$obj->colors = array(
			'commit'   => '00ff00',
			'rollback' => 'ff0000',
		);
		$obj->rrd_title = sprintf('PostgreSQL Transactions (%s)',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Transactions';
	break;
	default:
		$obj->rrd_title = sprintf('%s/%s', $obj->args['pinstance'], $obj->args['type']);
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
