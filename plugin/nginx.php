<?php

# Collectd nginx plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# nginx/
# nginx/connections-accepted.rrd
# nginx/connections-handled.rrd
# nginx/nginx_connections-active.rrd
# nginx/nginx_connections-reading.rrd
# nginx/nginx_connections-waiting.rrd
# nginx/nginx_connections-writing.rrd
# nginx/nginx_requests.rrd

$obj = new Type_Default($CONFIG, $_GET);

switch($obj->args['type'])
{
	case 'connections':
		$obj->order = array('accepted', 'handled');
		$obj->legend = array(
			'accepted'  => 'Accepted',
			'handled' => 'Handled',
		);
		$obj->colors = array(
			'accepted' => 'ff0000',
			'handled' => '0000ff',
		);
		$obj->rrd_title = sprintf('nginx connections');
		$obj->rrd_vertical = 'Connections/s';
	break;
	case 'nginx_connections':
		$obj->order = array('active', 'reading', 'waiting', 'writing');
		$obj->legend = array(
			'active'  => 'Active',
			'reading' => 'Reading',
			'waiting' => 'Waiting',
			'writing' => 'Writing',
		);
		$obj->colors = array(
			'active'  => '005d57',
			'reading' => '4444ff',
			'waiting' => 'f24ac8',
			'writing' => '00cf00',
		);
		$obj->rrd_title = sprintf('nginx connections');
		$obj->rrd_vertical = 'Connections/s';
	break;
	case 'nginx_requests':
		$obj->legend = array(
			'value' => 'Requests',
		);
		$obj->colors = array(
			'value' => '00aa00',
		);
		$obj->rrd_title = sprintf('nginx requests');
		$obj->rrd_vertical = 'Requests per second';
	break;
}

$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
