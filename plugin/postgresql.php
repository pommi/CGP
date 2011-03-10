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
	case 'pg_db_size':
		$obj->ds_names = array(
			'value' => 'Size',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('DB Size %s',
			!empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
		$obj->rrd_vertical = 'Size';
	break;
	default:
		$obj->rrd_title = sprintf('%s/%s', $obj->args['pinstance'], $obj->args['type']);
		$obj->rrd_vertical = 'Ops per second';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
