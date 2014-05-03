<?php

# Collectd HDDTemp plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# hddtemp/temperature-<disk>.rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->ds_names = array('temperature' => 'Temperature');
$obj->rrd_title = 'HDD Temperature';
$obj->rrd_vertical = '°C';
$obj->rrd_format = '%.1lf';

$obj->rrd_graph();
