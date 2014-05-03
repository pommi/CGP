<?php

# Collectd tail plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';


$obj = new Type_Default($CONFIG, $_GET);

$obj->rrd_title = sprintf('tail: %s (%s)', $obj->args['pinstance'], $obj->args['type']);
$obj->rrd_format = '%5.1lf%s';

# backwards compatibility
if ($CONFIG['version'] < 5) {
	if (strcmp($obj->args['type'], 'gauge') != 0) {
		$obj->data_sources = array('count');
		if (count($obj->legend) == 1) {
			$obj->legend['count'] = $obj->legend['value'];
			unset($obj->legend['value']);
		}
		if (count($obj->colors) == 1) {
			$obj->colors['count'] = $obj->colors['value'];
			unset($obj->colors['value']);
		}
	}
}

$obj->rrd_graph();
