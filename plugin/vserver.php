<?php

# Collectd VServer plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericIO.class.php';
require_once 'type/GenericStacked.class.php';

# LAYOUT
# vserver-XXXX
# vserver-XXXX/if_octets-inet6.rrd
# vserver-XXXX/if_octets-inet.rrd
# vserver-XXXX/if_octets-other.rrd
# vserver-XXXX/if_octets-unix.rrd
# vserver-XXXX/if_octets-unspec.rrd
# vserver-XXXX/load.rrd
# vserver-XXXX/vs_memory-anon.rrd
# vserver-XXXX/vs_memory-rss.rrd
# vserver-XXXX/vs_memory-vml.rrd
# vserver-XXXX/vs_memory-vm.rrd
# vserver-XXXX/vs_processes.rrd
# vserver-XXXX/vs_threads-onhold.rrd
# vserver-XXXX/vs_threads-running.rrd
# vserver-XXXX/vs_threads-total.rrd
# vserver-XXXX/vs_threads-uninterruptable.rrd

$obj = new Type_Default($CONFIG, $_GET);

switch($obj->args['type']) {
	case 'load':
		require_once "plugin/load.php";
		break;
	case 'vs_memory':
		$obj = new Type_GenericStacked($CONFIG, $_GET);
		$obj->order = array('vm', 'vml', 'rss', 'anon');
		# http://oldwiki.linux-vserver.org/Memory+Allocation
		$obj->legend = array(
			'vm' => "Virtual memory pages",
			'vml' => "Pages locked into memory",
			'rss' => "Resident set size",
			'anon' => "Anonymous memory pages",
		);
		$obj->colors = array(
			'vm' => '00e000',
			'vml' => '0000ff',
			'rss' => 'ffb000',
			'anon' => 'ff00ff',
			);

		$obj->rrd_title = sprintf('Memory utilization on Vserver %s', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
		$obj->rrd_format = '%5.1lf%s';

		$obj->rrd_graph();
		break;
	case 'vs_threads':
		$obj = new Type_GenericStacked($CONFIG, $_GET);
		$obj->order = array('running', 'uninterruptable', 'onhold', 'total');
		# http://linux-vserver.org/ProcFS
		$obj->legend = array(
			'onhold' => "Number of threads on hold",
			'running' => "Number of running threads",
			'total' => "Total number of threads",
			'uninterruptable' => "Number of uninterruptible threads",
		);
		$obj->colors = array(
			'onhold' => '00e000',
			'running' => '0000ff',
			'total' => 'ffb000',
			'uninterruptable' => 'ff00ff',
			);

		$obj->rrd_title = sprintf('Threads on Vserver %s', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Numbers';
		$obj->rrd_format = '%5.1lf%s';

		$obj->rrd_graph();
		break;
	case 'if_octets':
		$obj->data_sources = array('rx', 'tx');
		$obj->legend = array(
			'inet-rx' => 'IPv4 Receive',
			'inet-tx' => 'IPv4 Transmit',
			'inet6-rx' => 'IPv6 Receive',
			'inet6-tx' => 'IPv6 Transmit',
			);
		$obj->colors = array(
			'inet-rx'   => '0000ff',
			'inet-tx'   => '00b000',
			'inet6-rx'  => 'e0e0e0',
			'inet6-tx'  => 'ffb000',
			'other-rx'  => 'ff00ff',
			'other-tx'  => 'a000a0',
			'unix-rx'   => '00e000',
			'unix-tx'   => '0080ff',
			'unspec-rx' => 'ff0000',
			'unspec-tx' => '000080',
			);
		$obj->rrd_title = sprintf('Traffic on Vserver %s', $obj->args['pinstance']);
			$obj->rrd_vertical = sprintf('%s per second', ucfirst($CONFIG['network_datasize']));
			$obj->scale = $CONFIG['network_datasize'] == 'bits' ? 8 : 1;
		$obj->rrd_format = '%5.1lf%s';

		$obj->rrd_graph();
		break;
	case 'vs_processes':
		$obj->data_sources = array('value');
		$obj->legend = array(
			'value' => 'Processes',
		);
		$obj->rrd_title = sprintf('Processes on Vserver %s', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Processes';

		$obj->rrd_format = '%5.1lf%s';

		$obj->rrd_graph();
		break;

	default:
		die('Not implemented yet.');
		break;
}
