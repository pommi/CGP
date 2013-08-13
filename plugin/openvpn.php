<?php

# Collectd OpenVPN plugin

require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# openvpn-XXXX/
# openvpn-XXXX/if_octets-XXXX.rrd
# openvpn-XXXX/users-XXXX.rrd

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
		$obj->rrd_title = sprintf('Traffic (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = sprintf('%s per second', ucfirst($CONFIG['network_datasize']));
		$obj->scale = $CONFIG['network_datasize'] == 'bits' ? 8 : 1;
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'users':
		require_once 'type/Default.class.php';
		$obj = new Type_Default($CONFIG);
		$obj->ds_names = array(
			'value' => 'Users',
		);
		$obj->rrd_title = sprintf('Users (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Users';
		$obj->rrd_format = '%.1lf';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
