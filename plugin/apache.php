<?php

# Collectd Apache plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# apache-X/apache_scoreboard-X.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('count');
$obj->order = array('open', 'idle_cleanup', 'finishing', 'logging', 'closing', 'dnslookup', 'keepalive', 'sending', 'reading', 'starting', 'waiting');
$obj->ds_names = array(
	'open'      => 'Open (empty)   ',
	'waiting'   => 'Waiting        ',
	'starting'  => 'Starting up    ',
	'reading'   => 'Reading request',
	'sending'   => 'Sending reply  ',
	'keepalive' => 'Keepalive      ',
	'dnslookup' => 'DNS Lookup     ',
	'closing'   => 'Closing        ',
	'logging'   => 'Logging        ',
	'finishing' => 'Finishing      ',
	'idle_cleanup' => 'Idle cleanup   ',
);
$obj->colors = array(
	'open'      => 'e0e0e0',
	'waiting'   => 'ffb000',
	'starting'  => 'ff00ff',
	'reading'   => '0000ff',
	'sending'   => '00e000',
	'keepalive' => '0080ff',
	'dnslookup' => 'ff0000',
	'closing'   => '000080',
	'logging'   => 'a000a0',
	'finishing' => '008080',
	'idle_cleanup' => 'ffff00',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('Scoreboard of %s', $obj->args['pinstance']);
$obj->rrd_vertical = 'Slots';
$obj->rrd_format = '%5.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
