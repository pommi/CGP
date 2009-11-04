<?php

# Collectd Interface plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericIO.class.php';
require_once 'inc/collectd.inc.php';

# LAYOUT
# interface/
# interface/if_errors-XXXX.rrd
# interface/if_octets-XXXX.rrd
# interface/if_packets-XXXX.rrd

$obj = new Type_GenericIO;
$obj->datadir = $CONFIG['datadir'];
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('rx', 'tx');
$obj->ds_names = array(
	'rx' => 'Receive ',
	'tx' => 'Transmit',
);
$obj->colors = array(
	'rx' => '0000ff',
	'tx' => '00b000',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;
$obj->rrd_format = '%5.1lf%s';
switch($type) {
	case 'if_errors':
		$obj->rrd_title = "Interface Errors ($tinstance) on $host";
		$obj->rrd_vertical = 'Errors per second';
	break;
	case 'if_octets':
		$obj->rrd_title = "Interface Traffic ($tinstance) on $host";
		$obj->rrd_vertical = 'Bits per second';
	break;
	case 'if_packets':
		$obj->rrd_title = "Interface Packets ($tinstance) on $host";
		$obj->rrd_vertical = 'Packets per second';
	break;
}

collectd_flush(ident_from_args($obj->args));

$obj->rrd_graph();

?>
