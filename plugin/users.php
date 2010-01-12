<?php

# Collectd Users plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# users/users.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('users');
$obj->ds_names = array(
	'users' => 'Users',
);
$obj->colors = array(
	'users' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Users';
$obj->rrd_vertical = 'Users';
$obj->rrd_format = '%.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
