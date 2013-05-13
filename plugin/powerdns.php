<?php

# Collectd PowerDNS plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';


$obj = new Type_Default($CONFIG);

$obj->rrd_title = sprintf('PowerDNS %s (%s)', $obj->args['type'], $obj->args['pinstance']);
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
