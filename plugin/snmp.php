<?php

# Collectd snmp plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';


$obj = new Type_Default($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('SNMP: %s (%s)', $obj->args['type'], $obj->args['tinstance']);
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

