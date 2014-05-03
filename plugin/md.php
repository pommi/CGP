<?php

# Collectd MD plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# md-XXXX/
# md-XXXX/md_disks-XXXX.rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->ds_names = array(
	'value' => 'Value',
);
$obj->rrd_title = sprintf('Disks (md-%s)', $obj->args['pinstance']);
$obj->rrd_vertical = '#';
$obj->rrd_format = '%2.0lf';

$obj->rrd_graph();
