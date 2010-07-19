<?php

# Collectd Wireless Plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;

switch($obj->args['type']) {
	case 'signal_noise':
		$obj->data_sources = array('value');
		$obj->colors = array('value' => '0000f0');
		$obj->ds_names = array('value' => 'Value');
		$obj->rrd_title = 'Signal Noise';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%6.1lf';
		break;
	case 'signal_power':
		$obj->data_sources = array('value');
		$obj->colors = array('value' => '0000f0');
		$obj->ds_names = array('value' => 'Value');
		$obj->rrd_title = 'Signal Power';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%6.1lf';
		break;
	case 'signal_quality':
		$obj->data_sources = array('value');
		$obj->colors = array('value' => '0000f0');
		$obj->ds_names = array('value' => 'Value');
		$obj->rrd_title = 'Signal Quality';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%6.1lf';
		break;
}
collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
