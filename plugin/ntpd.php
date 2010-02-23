<?php

# Collectd NTPD plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# ntpd/
# ntpd/delay-<host>.rrd
# ntpd/frequency_offset-loop.rrd
# ntpd/time_dispersion-<host>.rrd
# ntpd/time_offset-<host>.rrd

$obj = new Type_Default($CONFIG);
$obj->ds_names = array('ping' => 'Ping time',
                       'ping_stddev' => 'Ping stddev',
                       'ping_droprate' => 'Ping droprate');
$obj->width = $width;
$obj->heigth = $heigth;
$obj->generate_colors();
switch($obj->args['type']) {
	case 'delay':
		$obj->data_sources = array('seconds');
		$obj->rrd_title = sprintf('Delay');
		$obj->rrd_vertical = 'Seconds';
		$obj->rrd_format = '%5.1lf%s';
		break;
	case 'frequency_offset':
		$obj->data_sources = array('ppm');
		$obj->rrd_title = 'Frequency offset';
		$obj->rrd_vertical = 'ppm';
		$obj->rrd_format = '%5.1lf%s';
		break;
	case 'time_dispersion':
		$obj->data_sources = array('seconds');
		$obj->rrd_title = 'Time dispersion';
		$obj->rrd_vertical = 'Seconds';
		$obj->rrd_format = '%5.1lf%s';
		break;
	case 'time_offset':
		$obj->data_sources = array('seconds');
		$obj->rrd_title = 'Time offset';
		$obj->rrd_vertical = 'Seconds';
		$obj->rrd_format = '%5.1lf%s';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
