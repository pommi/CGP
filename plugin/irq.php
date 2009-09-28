<?php

# Collectd IRQ plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';

## LAYOUT
# irq/
# irq/irq-XX.rrd

# grouped
require_once 'inc/collectd.inc.php';
$tinstance = collectd_plugindetail($host, $plugin, 'ti');
sort($tinstance);

$obj = new Type_GenericStacked;
$obj->datadir = $CONFIG['datadir'];
$obj->path_format = '{host}/{plugin}/{type}-{tinstance}.rrd';
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('value');
$obj->ds_names = NULL;
$obj->colors = NULL;
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;

$obj->rrd_title = "Interrupts on $host";
$obj->rrd_vertical = 'IRQs/s';
$obj->rrd_format = '%6.1lf';

$obj->rrd_graph();

?>
