<?php

# Collectd Entropy plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# entropy/entropy.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('entropy');
$obj->ds_names = array(
	'entropy' => 'Entropy bits',
);
$obj->colors = array(
	'entropy' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Available entropy';
$obj->rrd_vertical = 'Bits';
$obj->rrd_format = '%4.0lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
