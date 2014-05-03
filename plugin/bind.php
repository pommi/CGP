<?php

# Collectd bind plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';


$obj = new Type_GenericStacked($CONFIG, $_GET);

$obj->rrd_title = sprintf('%s/%s', $obj->args['pinstance'], $obj->args['type']);
$obj->rrd_format = '%5.1lf%s';

$obj->rrd_graph();
