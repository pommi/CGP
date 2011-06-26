<?php

# Collectd contextswitch plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# contextswitch/contextswitch.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array(
	'value' => 'Context switches',
);
$obj->colors = array(
	'value' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Context switches';
$obj->rrd_vertical = 'switch per second Bits';
$obj->rrd_format = '%4.0lf';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('contextswitches');

	$obj->ds_names['contextswitches'] = $obj->ds_names['value'];
	unset($obj->ds_names['value']);

	$obj->colors['contextswitches'] = $obj->colors['value'];
	unset($obj->colors['value']);
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
