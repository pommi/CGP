<?php

# Collectd MySQL plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

$obj = new Type_GenericStacked($CONFIG);
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type'])
{
	case 'cache_result':
		$obj->ds_names = array(
			'qcache-not_cached' => 'Not Cached',
			'qcache-inserts' => 'Inserts',
			'qcache-hits' => 'Hits',
			'qcache-prunes' => 'Lowmem Prunes',
		);
		$obj->colors = array(
			'qcache-not_cached' => 'f0a000',
			'qcache-inserts' => '0000ff',
			'qcache-hits' => '00e000',
			'qcache-prunes' => 'ff0000',
		);
		$obj->rrd_title = sprintf('MySQL query cache (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Queries/s';
	break;
	case 'cache_size':
		$obj->ds_names = array(
			'qcache' => 'Queries',
		);
		$obj->rrd_title = sprintf('MySQL query cache size (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Queries in cache';
	break;
	case 'mysql_commands':
		$obj->rrd_title = sprintf('MySQL commands (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Issues/s';
	break;
	case 'mysql_handler':
		$obj->order = array('commit', 'delete',  'read_first', 'read_key', 'read_next', 'read_prev', 'read_rnd', 'read_rnd_next', 'update',  'write', 'rollback');
		$obj->colors = array(
			'commit' => 'ff0000',
			'delete' => 'ff00e7',
			'read_first' => 'cc00ff',
			'read_key' => '3200ff',
			'read_next' => '0065ff',
			'read_prev' => '00fff3',
			'read_rnd' => '00ff65',
			'read_rnd_next' => '33ff00',
			'update' => 'cbff00',
			'write' => 'ff9800',
			'rollback' => '000000',
		);
		$obj->rrd_title = sprintf('MySQL handler (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Invocations';
	break;
	case 'mysql_locks':
		$obj->colors = array(
			'immediate' => 'ff0000',
			'waited' => '00ff00',
		);
		$obj->rrd_title = sprintf('MySQL locks (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'locks';
	break;
	case 'mysql_octets':
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('MySQL traffic (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bits per second';
	break;
	case 'threads':
		$obj->ds_names = array(
			'cached' => 'Cached',
			'connected' => 'Connected',
			'running' => 'Running',
		);
		$obj->colors = array(
			'cached' => '00e000',
			'connected' => '0000ff',
			'running' => 'ff0000',
		);
		$obj->rrd_title = sprintf('MySQL threads (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Threads';
	break;
	case 'total_threads':
		$obj->ds_names = array(
			'created' => 'Created',
		);
		$obj->rrd_title = sprintf('MySQL created threads (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Created Threads';
	break;
	# mysql_qcache is removed since commit collectd-4.10.0-104-g9ae3541
	case 'mysql_qcache':
		$obj->data_sources = array('not_cached', 'inserts', 'hits', 'lowmem_prunes', 'queries_in_cache');
		$obj->ds_names = array(
			'not_cached' => 'Not Cached',
			'inserts' => 'Inserts',
			'hits' => 'Hits',
			'lowmem_prunes' => 'Lowmem Prunes',
			'queries_in_cache' => 'Queries in Cache',
		);
		$obj->colors = array(
			'not_cached' => 'f0a000',
			'inserts' => '0000ff',
			'hits' => '00e000',
			'lowmem_prunes' => 'ff0000',
			'queries_in_cache' => 'cccccc',
		);
		$obj->rrd_title = sprintf('MySQL query cache (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Queries/s';
	break;
	# mysql_threads is removed since commit collectd-4.10.0-105-g6c48fca
	case 'mysql_threads':
		$obj->data_sources = array('cached', 'connected', 'running', 'created');
		$obj->ds_names = array(
			'cached' => 'Cached',
			'connected' => 'Connected',
			'running' => 'Running',
			'created' => 'Created',
		);
		$obj->colors = array(
			'cached' => '00e000',
			'connected' => '0000ff',
			'running' => 'ff0000',
			'created' => 'cccccc',
		);
		$obj->rrd_title = sprintf('MySQL threads (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Threads';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
