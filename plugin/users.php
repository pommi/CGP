<?php

# Collectd Users plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# users/users.rrd

$obj = new Type_Default($CONFIG);
$obj->data_sources = array('value');
$obj->ds_names = array(
	'value' => 'Users',
);
$obj->colors = array(
	'value' => '0000f0',
);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_title = 'Users';
$obj->rrd_vertical = 'Users';
$obj->rrd_format = '%.1lf';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	$obj->data_sources = array('users');

	$obj->ds_names['users'] = $obj->ds_names['value'];
	unset($obj->ds_names['value']);

	$obj->colors['users'] = $obj->colors['value'];
	unset($obj->colors['value']);
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
