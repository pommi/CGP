<?php

# Collectd Swap plugin

require_once 'conf/common.inc.php';

## LAYOUT
# swap/
# swap/swap-cached.rrd
# swap/swap-free.rrd
# swap/swap-used.rrd

switch(GET('t')) {
	case 'swap':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG, $_GET);
		$obj->order = array('free', 'cached', 'used');
		$obj->legend = array(
			'free'   => 'Free',
			'cached' => 'Cached',
			'used'   => 'Used',
		);
		$obj->colors = array(
			'free'   => '00e000',
			'cached' => '0000ff',
			'used'   => 'ff0000',
		);
		$obj->rrd_title = 'Swap utilization';
		$obj->rrd_vertical = 'Bytes';
	break;
	case 'swap_io':
		require_once 'type/GenericIO.class.php';
		$obj = new Type_GenericIO($CONFIG, $_GET);
		$obj->order = array('out', 'in');
		$obj->legend = array(
			'out' => 'Out',
			'in'  => 'In',
		);
		$obj->colors = array(
			'out' => '0000ff',
			'in'  => '00b000',
		);
		$obj->rrd_title = 'Swapped I/O pages';
		$obj->rrd_vertical = 'Pages';
	break;
}

$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
