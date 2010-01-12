<?php

# Collectd CPU plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# processes/
# processes/ps_state-paging.rrd
# processes/ps_state-blocked.rrd
# processes/ps_state-zombies.rrd
# processes/ps_state-stopped.rrd
# processes/ps_state-running.rrd
# processes/ps_state-sleeping.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->ds_names = array(
	'paging' => 'Paging  ',
	'blocked' => 'Blocked ',
	'zombies' => 'Zombies ',
	'stopped' => 'Stopped ',
	'running' => 'Running ',
	'sleeping' => 'Sleeping',
);
$obj->colors = array(
	'paging' => 'ffb000',
	'blocked' => 'ff00ff',
	'zombies' => 'ff0000',
	'stopped' => 'a000a0',
	'running' => '00e000',
	'sleeping' => '0000ff',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = 'Processes';
$obj->rrd_vertical = 'Processes';
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
