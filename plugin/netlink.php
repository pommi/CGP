<?php

# Collectd Netlink Plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

$obj = new Type_GenericStacked($CONFIG);

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type']) {
	case 'if_collisions':
		$obj->data_sources = array('value');
		$obj->ds_names = array('value' => 'Collisions');
		$obj->colors = array('value' => '0000ff');
		$obj->rrd_title = sprintf('Collisions (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Collisions/s';
		break;
	case 'if_dropped':
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('Dropped Packets (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Packets/s';
		break;
	case 'if_errors':
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('Interface Errors (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Errors/s';
		break;
	case 'if_multicast':
		$obj->data_sources = array('value');
		$obj->ds_names = array('value' => 'Packets');
		$obj->colors = array('value' => '0000ff');
		$obj->rrd_title = sprintf('Multicast Packets (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Packets/s';
		break;
	case 'if_octets':
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('Interface Traffic (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes/s';
		break;
	case 'if_packets':
		$obj->data_sources = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = sprintf('Interface Packets (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Packets/s';
		break;
	case 'if_rx_errors':
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'crc'    => 'CRC',
			'fifo'   => 'FiFo',
			'frame'  => 'Frame',
			'length' => 'Lenght',
			'missed' => 'Missed',
			'over'   => 'Over',
		);
		$obj->colors = array(
			'crc'    => '00e000',
			'fifo'   => 'f000c0',
			'frame'  => 'ffb000',
			'length' => 'f00000',
			'missed' => '0000f0',
			'over'   => '00e0ff',
		);
		$obj->rrd_title = sprintf('Interface receive errors (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Errors/s';
		break;
	case 'if_tx_errors':
		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'aborted'  => 'Aborted',
			'carrier'  => 'Carrier',
			'fifo'     => 'FiFo',
			'heartbeat'=> 'Heartbeat',
			'window'   => 'Window',
		);
		$obj->colors = array(
			'aborted'  => 'f00000',
			'carrier'  => '00e0ff',
			'fifo'     => '00e000',
			'heartbeat'=> 'ffb000',
			'window'   => 'f000c0',
		);
		$obj->rrd_title = sprintf('Interface transmit errors (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Errors/s';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
