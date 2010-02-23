<?php

# Collectd HDDTemp plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# hddtemp/temperature-<disk>.rrd

$obj = new Type_Default($CONFIG);
$obj->ds_names = array('temperature' => 'Temperature');
$obj->width = $width;
$obj->heigth = $heigth;
$obj->generate_colors();
$obj->rrd_title = 'HDD Temperature';
$obj->rrd_vertical = '°C';
$obj->rrd_format = '%.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
