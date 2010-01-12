<?php

# Collectd Df plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

# LAYOUT
#
# df/
# df/df-XXXX.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('free', 'used');
$obj->ds_names = array(
	'free' => 'Free',
	'used' => 'Used',
);
$obj->colors = array(
	'free' => '00ff00',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('Free space (%s)', $obj->args['tinstance']);
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%sB';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
