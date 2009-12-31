<?php

# Collectd Swap plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# swap/
# swap/swap-cached.rrd
# swap/swap-free.rrd
# swap/swap-used.rrd

if ($_GET['t'] == 'swap_io') {
	die_img('Error: swap_io not supported yet');
	exit;
}

$obj = new Type_GenericStacked($CONFIG['datadir']);
$obj->order = array('free', 'cached', 'used');
$obj->ds_names = array(
	'free' => 'Free    ',
	'cached' => 'Cached  ',
	'used' => 'Used    ',
);
$obj->colors = array(
	'free' => '00e000',
	'cached' => '0000ff',
	'used' => 'ff0000',
);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = 'Swap utilization';
$obj->rrd_vertical = 'Bytes';
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
