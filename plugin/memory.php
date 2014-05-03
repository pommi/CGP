<?php

# Collectd Memory plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';

## LAYOUT
# memory/
# memory/memory-buffered.rrd
# memory/memory-cached.rrd
# memory/memory-free.rrd
# memory/memory-used.rrd

$obj = new Type_GenericStacked($CONFIG, $_GET);
$obj->order = array('free', 'inactive', 'buffered', 'cached', 'cache', 'locked', 'used', 'active', 'wired');
$obj->legend = array(
	'free'     => 'Free',
	'inactive' => 'Inactive',
	'cached'   => 'Cached',
	'cache'    => 'Cache',
	'buffered' => 'Buffered',
	'locked'   => 'Locked',
	'used'     => 'Used',
	'active'   => 'Active',
	'wired'    => 'Wired',
);
$obj->colors = array(
	'free' => '00e000',
	'inactive' => '00b000',
	'cached' => '0000ff',
	'cache' => '0000ff',
	'buffered' => 'ffb000',
	'locked' => 'ff00ff',
	'used' => 'ff0000',
	'active' => 'ff00ff',
	'wired' => 'ff0000',
);

$obj->rrd_title = 'Physical memory utilization';
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
