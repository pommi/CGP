<?php

# Collectd DNS plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# dns/
# dns/dns_octets.rrd
# dns/dns_opcode-X.rrd
# dns/dns_qtype-X.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

switch($obj->args['type']) {
	case 'dns_octets':
		$obj->data_sources = array(
			'queries',
			'responses',
		);
		$obj->ds_names = array(
			'queries'   => 'Queries',
			'responses' => 'Responses',
		);
		$obj->colors = array(
			'queries'   => '0000ff',
			'responses' => '00ff00',
		);
		$obj->rrd_title = 'DNS traffic';
		$obj->rrd_vertical = 'Bit/s';
	break;
	case 'dns_opcode':
		$obj->data_sources = array('value');
		$obj->rrd_title = 'DNS Opcode Query';
		$obj->rrd_vertical = 'Queries/s';
	break;
	case 'dns_qtype':
		$obj->data_sources = array('value');
		$obj->rrd_title = 'DNS QType';
		$obj->rrd_vertical = 'Queries/s';
	break;
	case 'dns_rcode':
		$obj->data_sources = array('value');
		$obj->rrd_title = 'DNS Reply code';
		$obj->rrd_vertical = 'Queries/s';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
