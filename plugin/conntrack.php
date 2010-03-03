<?php

# Collectd Conntrack plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# conntrack/conntrack.rrd

$obj = new Type_Default($CONFIG);
# the data source is named 'entropy' in collectd's types.db
$obj->data_sources = array('entropy');
$obj->ds_names = array(
	'entropy' => 'Conntrack entries',
);
$obj->colors = array(
	'entropy' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Conntrack entries';
$obj->rrd_vertical = '#';
$obj->rrd_format = '%.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
