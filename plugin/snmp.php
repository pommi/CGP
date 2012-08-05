<?php

# Collectd Swap plugin

require_once 'conf/common.inc.php';
#require_once 'type/Default.class.php';
require_once 'type/GenericIO.class.php';
#require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';


# LAYOUT 
# snmp/
# snmp/if_errors-XXXX.rrd
# snmp/if_octets-XXXX.rrd
# snmp/if_packets-XXXX.rrd

$obj = new Type_GenericIO($CONFIG);

$instance = $CONFIG['version'] < 5 ? 'tinstance' : 'pinstance';
switch($obj->args['type']) {
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
		if ($CONFIG['interface_use_bit']) {
			$obj->scale = 8;
			$obj->rrd_vertical = 'Bits per second';
		} else {
			$obj->scale = 1;
			$obj->rrd_vertical = 'Bytes per second';
		}
		$obj->width = $width;
		$obj->heigth = $heigth;
		$obj->rrd_format = '%5.1lf%s';
		$obj->rrd_title = sprintf('Interface Traffic (%s)', $obj->args[$instance]);
	break;
	default:
		# others are not supported yet
	return;
}


collectd_flush($obj->identifiers);
$obj->rrd_graph();
