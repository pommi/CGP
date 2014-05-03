<?php

# Collectd CPUfreq plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';

## LAYOUT
# cpufreq/cpufreq-X.rrd

$obj = new Type_Default($CONFIG, $_GET);
$obj->data_sources = array('value');
$obj->rrd_title = 'CPU frequency scaling';
$obj->rrd_vertical = 'Hz';
$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
