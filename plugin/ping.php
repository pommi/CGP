<?php

# Collectd Ping plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# ping/
# ping/ping-<host>.rrd
# ping/ping_stddev-<host>.rrd
# ping/ping_droprate-<host>.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array('ping' => 'Ping time',
                       'ping_stddev' => 'Ping stddev',
                       'ping_droprate' => 'Ping droprate');
$obj->rrd_format = '%5.1lf';

switch($obj->args['type']) {
	case 'ping':
		if ($CONFIG['version'] < 5)
			$obj->data_sources = array('ping');
		$obj->rrd_title = 'Ping latency';
		$obj->rrd_vertical = 'Milliseconds';
		break;
	case 'ping_stddev':
		$obj->rrd_title = 'Ping standard deviation';
		$obj->rrd_vertical = 'Milliseconds';
		break;
	case 'ping_droprate':
		$obj->rrd_title = 'Ping droprate';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
