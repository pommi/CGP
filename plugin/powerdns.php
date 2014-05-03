<?php

# Collectd PowerDNS plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';


$obj = new Type_Default($CONFIG, $_GET);

$obj->rrd_title = sprintf('PowerDNS %s (%s)', $obj->args['type'], $obj->args['pinstance']);
$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
