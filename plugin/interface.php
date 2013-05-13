<?php

# Collectd Interface plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericIO.class.php';
require_once 'inc/collectd.inc.php';

# LAYOUT - Collectd 4
# interface/
# interface/if_errors-XXXX.rrd
# interface/if_octets-XXXX.rrd
# interface/if_packets-XXXX.rrd

# LAYOUT - Collectd 5
# interface-XXXX/if_errors.rrd
# interface-XXXX/if_octets.rrd
# interface-XXXX/if_packets.rrd

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
$obj->rrd_format = '%5.1lf%s';

$instance = $CONFIG['version'] < 5 ? 'tinstance' : 'pinstance';
switch($obj->args['type']) {
	case 'if_errors':
		$obj->rrd_title = sprintf('Interface Errors (%s)', $obj->args[$instance]);
		$obj->rrd_vertical = 'Errors per second';
	break;
	case 'if_octets':
		$obj->rrd_title = sprintf('Interface Traffic (%s)', $obj->args[$instance]);
		$obj->rrd_vertical = sprintf('%s per second', ucfirst($CONFIG['network_datasize']));
		$obj->scale = $CONFIG['network_datasize'] == 'bits' ? 8 : 1;
	break;
	case 'if_packets':
		$obj->rrd_title = sprintf('Interface Packets (%s)', $obj->args[$instance]);
		$obj->rrd_vertical = 'Packets per second';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
