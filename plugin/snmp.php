<?php

# Collectd snmp plugin

require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';


switch(GET('t')) {
	case 'if_octets':
		require_once 'type/GenericIO.class.php';
		$obj = new Type_GenericIO($CONFIG);
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('Interface Traffic (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = sprintf('%s per second', ucfirst($CONFIG['network_datasize']));
		$obj->scale = $CONFIG['network_datasize'] == 'bits' ? 8 : 1;
	break;
	default:
		require_once 'type/Default.class.php';
		$obj = new Type_Default($CONFIG);
		$obj->rrd_title = sprintf('SNMP: %s (%s)', $obj->args['type'], $obj->args['tinstance']);
	return;
}

$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

