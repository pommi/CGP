<?php

# Collectd libvirt plugin

require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';

# LAYOUT
# libvirt/
# libvirt/disk_octets-XXXX.rrd
# libvirt/disk_ops-XXXX.rrd
# libvirt/if_dropped-XXXX.rrd
# libvirt/if_errors-XXXX.rrd
# libvirt/if_octets-XXXX.rrd
# libvirt/if_packets-XXXX.rrd
# libvirt/virt_cpu_total.rrd

require_once 'type/GenericIO.class.php';
$obj = new Type_GenericIO($CONFIG);

switch($obj->args['type']) {
	case 'disk_octets':
		$obj->data_sources = array('read', 'write');
		$obj->ds_names = array(
			'read' => 'Read',
			'write' => 'Written',
		);
		$obj->colors = array(
			'read' => '0000ff',
			'write' => '00b000',
		);
		$obj->rrd_title = sprintf('Disk Traffic (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Bytes per second';
		$obj->rrd_format = '%5.1lf%s';
	break;
	case 'disk_ops':
		$obj->data_sources = array('read', 'write');
		$obj->ds_names = array(
			'read' => 'Read',
			'write' => 'Written',
		);
		$obj->colors = array(
			'read' => '0000ff',
			'write' => '00b000',
		);
		$obj->rrd_title = sprintf('Disk Operations (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Ops per second';
		$obj->rrd_format = '%5.1lf%s';
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
		$obj->rrd_title = sprintf('Interface Packets Dropped (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Packets dropped per second';
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
		$obj->rrd_title = sprintf('Interface Errors (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Errors per second';
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
		$obj->rrd_title = sprintf('Interface Traffic (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Bytes per second';
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
		$obj->rrd_title = sprintf('Interface Packets (%s)', $obj->args['tinstance']);
		$obj->rrd_vertical = 'Packets per second';
	break;
	case 'virt_cpu_total':
		require_once 'type/Default.class.php';
		$obj = new Type_Default($CONFIG);

		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'CPU time',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = 'CPU usage';
		$obj->rrd_vertical = 'CPU time';
	break;
	case 'virt_vcpu':
		require_once 'type/Default.class.php';
		$obj = new Type_Default($CONFIG);

		$obj->data_sources = array('value');
		$obj->ds_names = array(
			'value' => 'VCPU time',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = 'VCPU usage';
		$obj->rrd_vertical = 'VCPU time';
	break;
}

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

if ($CONFIG['version'] < 5 && count($obj->data_sources) == 1) {
	$obj->data_sources = array('ns');

	$obj->ds_names['ns'] = $obj->ds_names['value'];
	unset($obj->ds_names['value']);

	$obj->colors['ns'] = $obj->colors['value'];
	unset($obj->colors['value']);
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
