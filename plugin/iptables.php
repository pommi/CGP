<?php

# Collectd IPTables plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# iptables/ipt_bytes-XXX.rrd
# iptables/ipt_packets-XXX.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;

$obj->data_sources = array('value');
switch($_GET['t']) {
	case 'ipt_bytes':
	  $obj->rrd_title = 'Bytes';
	  break;
	case 'ipt_packets':
	  $obj->rrd_title = 'Packets';
	  break;
 }
$obj->rrd_vertical = '';
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
