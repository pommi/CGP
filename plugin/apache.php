<?php

# Collectd Apache plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# apache[-X]/apache_bytes-X.rrd
# apache[-X]/apache_connections-X.rrd
# apache[-X]/apache_idle_workers-X.rrd
# apache[-X]/apache_requests-X.rrd
# apache[-X]/apache_scoreboard-X.rrd

$obj = new Type_Default($CONFIG);

switch ($obj->args['type']) {
	case 'apache_bytes':
		$obj->data_sources = array('count');
		$obj->ds_names = array(
			'count' => 'Bytes/s',
		);
		$obj->colors = array(
			'count' => '0000ff',
		);
		$obj->rrd_title = sprintf('Webserver Traffic%s',
			!isset($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Bytes/s';
	break;
	case 'apache_connections':
		$obj->data_sources = array('count');
		$obj->ds_names = array(
			'count' => 'Conns/s',
		);
		$obj->colors = array(
			'count' => '00b000',
		);
		$obj->rrd_title = sprintf('Webserver Connections%s',
			!isset($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Conns/s';
	break;
	case 'apache_idle_workers':
		$obj->data_sources = array('count');
		$obj->ds_names = array(
			'count' => 'Workers',
		);
		$obj->colors = array(
			'count' => '0000ff',
		);
		$obj->rrd_title = sprintf('Webserver Idle Workers%s',
			!isset($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Workers';
	break;
	case 'apache_requests':
		$obj->data_sources = array('count');
		$obj->ds_names = array(
			'count' => 'Requests/s',
		);
		$obj->colors = array(
			'count' => '00b000',
		);
		$obj->rrd_title = sprintf('Webserver Requests%s',
			!isset($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Requests/s';
	break;
	case 'apache_scoreboard':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG);
		$obj->data_sources = array('count');
		$obj->order = array('open', 'idle_cleanup', 'finishing', 'logging', 'closing', 'dnslookup', 'keepalive', 'sending', 'reading', 'starting', 'waiting');
		$obj->ds_names = array(
			'open'      => 'Open (empty)',
			'waiting'   => 'Waiting',
			'starting'  => 'Starting up',
			'reading'   => 'Reading request',
			'sending'   => 'Sending reply',
			'keepalive' => 'Keepalive',
			'dnslookup' => 'DNS Lookup',
			'closing'   => 'Closing',
			'logging'   => 'Logging',
			'finishing' => 'Finishing',
			'idle_cleanup' => 'Idle cleanup',
		);
		$obj->colors = array(
			'open'      => 'e0e0e0',
			'waiting'   => 'ffb000',
			'starting'  => 'ff00ff',
			'reading'   => '0000ff',
			'sending'   => '00e000',
			'keepalive' => '0080ff',
			'dnslookup' => 'ff0000',
			'closing'   => '000080',
			'logging'   => 'a000a0',
			'finishing' => '008080',
			'idle_cleanup' => 'ffff00',
		);
		$obj->rrd_title = sprintf('Webserver Scoreboard%s',
			!isset($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Slots';
	break;
}

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
