<?php

# Collectd CPUfreq plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# cpufreq/cpufreq-X.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('value');
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'CPU frequency scaling';
$obj->rrd_vertical = 'Hz';
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
