<?php

# Collectd Wireless Plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array('value' => 'Value');
$obj->colors = array('value' => '0000f0');
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%6.1lf';

switch($obj->args['type']) {
	case 'signal_noise':
		$obj->rrd_title = sprintf('Noise level (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'dBm';
		break;
	case 'signal_power':
		$obj->rrd_title = sprintf('Signal level (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'dBm';
		break;
	case 'signal_quality':
		$obj->rrd_title = sprintf('Link Quality (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'quality';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
