<?php

# Collectd filecount plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# filecount-X/
# filecount-X/bytes.rrd
# filecount-X/files.rrd

$obj = new Type_GenericStacked($CONFIG);

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';
$obj->data_sources = array('value');

switch($obj->args['type']) {
	case 'bytes':
		$obj->ds_names = array('value' => 'Size');
		$obj->colors = array('value' => '0000ff');
		$obj->rrd_title = sprintf('Filecount: size (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Bytes';
		break;
	case 'files':
		$obj->ds_names = array('value' => 'Files');
		$obj->colors = array('value' => 'f0a000');
		$obj->rrd_title = sprintf('Filecount: number of files (%s)', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Files';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
