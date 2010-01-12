<?php

# Collectd CPU plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# cpu-X/
# cpu-X/cpu-idle.rrd
# cpu-X/cpu-interrupt.rrd
# cpu-X/cpu-nice.rrd
# cpu-X/cpu-softirq.rrd
# cpu-X/cpu-steal.rrd
# cpu-X/cpu-system.rrd
# cpu-X/cpu-user.rrd
# cpu-X/cpu-wait.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('value');
$obj->order = array('idle', 'nice', 'user', 'wait', 'system', 'softirq', 'interrupt', 'steal');
$obj->ds_names = array(
	'idle' => 'Idle   ',
	'nice' => 'Nice   ',
	'user' => 'User   ',
	'wait' => 'Wait-IO',
	'system' => 'System ',
	'softirq' => 'SoftIRQ',
	'interrupt' => 'IRQ    ',
	'steal' => 'Steal  ',
);
$obj->colors = array(
	'idle' => 'e8e8e8',
	'nice' => '00e000',
	'user' => '0000ff',
	'wait' => 'ffb000',
	'system' => 'ff0000',
	'softirq' => 'ff00ff',
	'interrupt' => 'a000a0',
	'steal' => '000000',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('CPU-%s usage', $obj->args['pinstance']);
$obj->rrd_vertical = 'Jiffies';
$obj->rrd_format = '%5.2lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
