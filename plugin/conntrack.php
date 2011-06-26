<?php

# Collectd Conntrack plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# conntrack/conntrack.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array(
	'value' => 'Conntrack entries',
);
$obj->colors = array(
	'value' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Conntrack entries';
$obj->rrd_vertical = '#';
$obj->rrd_format = '%.1lf';

# backwards compatibility
# the data source is named 'entropy' in collectd's types.db
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('entropy');

	$obj->ds_names['entropy'] = $obj->ds_names['value'];
	unset($obj->ds_names['value']);

	$obj->colors['entropy'] = $obj->colors['value'];
	unset($obj->colors['value']);
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
