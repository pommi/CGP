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
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'Bytes/s',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Webserver Traffic%s',
			!empty($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Bytes/s';
	break;
	case 'apache_connections':
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'Conns/s',
		);
		$obj->colors = array(
			'value' => '00b000',
		);
		$obj->rrd_title = sprintf('Webserver Connections%s',
			!empty($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Conns/s';
	break;
	case 'apache_idle_workers':
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'Workers',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Webserver Idle Workers%s',
			!empty($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Workers';
	break;
	case 'apache_requests':
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'Requests/s',
		);
		$obj->colors = array(
			'value' => '00b000',
		);
		$obj->rrd_title = sprintf('Webserver Requests%s',
			!empty($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Requests/s';
	break;
	case 'apache_scoreboard':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG);
		$obj->data_sources = array('value');
		$obj->order = array(
			'open',
			'idle_cleanup',
			'finishing',
			'logging',
			'closing',
			'dnslookup',
			'keepalive',
			'sending',
			'reading',
			'starting',
			'waiting',

			'connect',
			'hard_error',
			'close',
			'response_end',
			'write',
			'response_start',
			'handle_request',
			'read_post',
			'request_end',
			'read',
			'request_start',
		);
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

			'connect'        => 'Connect (empty)',
			'close'          => 'Close',
			'hard_error'     => 'Hard error',
			'read'           => 'Read',
			'read_post'      => 'Read POST',
			'write'          => 'Write',
			'handle_request' => 'Handle request',
			'request_start'  => 'Request start',
			'request_end'    => 'Request end',
			'response_start' => 'Response start',
			'response_end'   => 'Response end',
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

			'connect'        => 'e0e0e0',
			'close'          => '008080',
			'hard_error'     => 'ff0000',
			'read'           => 'ff00ff',
			'read_post'      => '00e000',
			'write'          => '000080',
			'handle_request' => '0080ff',
			'request_start'  => 'ffb000',
			'request_end'    => '0000ff',
			'response_start' => 'ffff00',
			'response_end'   => 'a000a0',
		);
		$obj->rrd_title = sprintf('Webserver Scoreboard%s',
			!empty($obj->args['pinstance']) ? ' ('.$obj->args['pinstance'].')' : '');
		$obj->rrd_vertical = 'Slots';
	break;
}

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('count');
	if (count($obj->ds_names) == 1) {
		$obj->ds_names['count'] = $obj->ds_names['value'];
		unset($obj->ds_names['value']);
	}
	if (count($obj->colors) == 1) {
		$obj->colors['count'] = $obj->colors['value'];
		unset($obj->colors['value']);
	}
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
