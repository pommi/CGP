<?php

# Collectd CPU plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# processes/
# processes/ps_state-paging.rrd
# processes/ps_state-blocked.rrd
# processes/ps_state-zombies.rrd
# processes/ps_state-stopped.rrd
# processes/ps_state-running.rrd
# processes/ps_state-sleeping.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type'])
{
	case 'ps_state':
		$obj->ds_names = array(
			'paging' => 'Paging',
			'blocked' => 'Blocked',
			'zombies' => 'Zombies',
			'stopped' => 'Stopped',
			'running' => 'Running',
			'sleeping' => 'Sleeping',
		);
		$obj->colors = array(
			'paging' => 'ffb000',
			'blocked' => 'ff00ff',
			'zombies' => 'ff0000',
			'stopped' => 'a000a0',
			'running' => '00e000',
			'sleeping' => '0000ff',
			'value' => 'f0a000',
		);
		$obj->rrd_title = 'Processes';
		$obj->rrd_vertical = 'Processes';
	break;

	case 'fork_rate':
		$obj->ds_names = array(
			'value' => 'Forks',
		);
		$obj->colors = array(
			'value' => 'f0a000',
		);
		$obj->rrd_title = 'Fork rate';
		$obj->rrd_vertical = 'forks/s';
	break;

	case 'ps_code':
		$obj->ds_names = array(
			'value' => 'TRS',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Text Resident Set (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
	break;

	case 'ps_count':
		$obj->data_sources = array('processes', 'threads');
		$obj->ds_names = array(
			'processes' => 'Processes',
			'threads' => 'Threads',
		);
		$obj->colors = array(
			'processes' => '0000ff',
			'threads' => 'ff0000',
		);
		$obj->rrd_title = sprintf('Number of Processes/Threads (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Amount';
	break;

	case 'ps_cputime':
		$obj->data_sources = array('user', 'syst');
		$obj->ds_names = array(
			'user' => 'User',
			'syst' => 'System',
		);
		$obj->colors = array(
			'user' => '0000ff',
			'syst' => 'ff0000',
		);
		$obj->rrd_title = sprintf('CPU time (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'CPU time [s]';
	break;

	case 'ps_disk_octets':
		$obj->data_sources = array('read', 'write');
		$obj->ds_names = array(
			'read'  => 'Read',
			'write' => 'Write',
		);
		$obj->colors = array(
			'read' => '0000ff',
			'write' => '00b000',
		);
		$obj->rrd_title = sprintf('Disk Traffic (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes per second';
	break;

	case 'ps_disk_ops':
		$obj->data_sources = array('read', 'write');
		$obj->ds_names = array(
			'read'  => 'Read',
			'write' => 'Write',
		);
		$obj->colors = array(
			'read' => '0000ff',
			'write' => '00b000',
		);
		$obj->rrd_title = sprintf('Disk Operations (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Ops per second';
	break;

	case 'ps_data':
		$obj->ds_names = array(
			'value' => 'DRS',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Data Resident Set (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
	break;

	case 'ps_pagefaults':
		$obj->data_sources = array('minflt', 'majflt');
		$obj->ds_names = array(
			'minflt' => 'Minor',
			'majflt' => 'Major',
		);
		$obj->colors = array(
			'minflt' => 'ff0000',
			'majflt' => '0000ff',
		);
		$obj->rrd_title = sprintf('PageFaults (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Pagefaults';
	break;

	case 'ps_rss':
		$obj->ds_names = array(
			'value' => 'RSS',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Resident Segment Size (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
	break;

	case 'ps_stacksize':
		$obj->ds_names = array(
			'value' => 'Stacksize',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Stacksize (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
	break;

	case 'ps_vm':
		$obj->ds_names = array(
			'value' => 'Memory',
		);
		$obj->colors = array(
			'value' => '0000ff',
		);
		$obj->rrd_title = sprintf('Virtual Memory (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
	break;

}


collectd_flush($obj->identifiers);
$obj->rrd_graph();
