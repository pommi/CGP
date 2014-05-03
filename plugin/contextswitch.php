<?php

# Collectd contextswitch plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# contextswitch/contextswitch.rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->data_sources = array('value');
$obj->legend = array(
	'value' => 'Context switches',
);
$obj->colors = array(
	'value' => '0000f0',
);
$obj->rrd_title = 'Context switches';
$obj->rrd_vertical = 'switch per second Bits';
$obj->rrd_format = '%4.0lf';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('contextswitches');

	$obj->legend['contextswitches'] = $obj->legend['value'];
	unset($obj->legend['value']);

	$obj->colors['contextswitches'] = $obj->colors['value'];
	unset($obj->colors['value']);
}

$obj->rrd_graph();
