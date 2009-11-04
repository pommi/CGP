<?php

# Collectd Users plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# users/users.rrd

$obj = new Type_Default;
$obj->datadir = $CONFIG['datadir'];
$obj->args = array(
	'host' => $host,
	'plugin' => $plugin,
	'pinstance' => $pinstance,
	'type' => $type,
	'tinstance' => $tinstance,
);
$obj->data_sources = array('users');
$obj->ds_names = array(
	'users' => 'Users',
);
$obj->colors = array(
	'users' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->seconds = $seconds;
$obj->rrd_title = "Users on $host";
$obj->rrd_vertical = 'Users';
$obj->rrd_format = '%.1lf';

collectd_flush(ident_from_args($obj->args));

$obj->rrd_graph();

?>
