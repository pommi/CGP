<?php

# Collectd aggregation plugin

require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# aggregation-(plugin)-(calculate)/(type)-(type-instance).rrd

$pi = explode("-", GET('pi'));

switch($pi[0]) {
	case 'cpu':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG, $_GET);
		$obj->data_sources = array('value');
		$obj->order = array('idle', 'nice', 'user', 'wait', 'system', 'softirq', 'interrupt', 'steal');
		$obj->ds_names = array(
			'idle' => 'Idle',
			'nice' => 'Nice',
			'user' => 'User',
			'wait' => 'Wait-IO',
			'system' => 'System',
			'softirq' => 'SoftIRQ',
			'interrupt' => 'IRQ',
			'steal' => 'Steal',
		);
		$obj->colors = array(
			'idle' => 'e8e8e8',
			'nice' => '00e000',
			'user' => '0000ff',
			'wait' => 'ffb000',
			'system' => 'ff0000',
			'softirq' => 'ff00ff',
			'interrupt' => 'a000a0',
			'steal' => '000000',
		);
		$obj->rrd_title = 'CPU usage';
		$obj->rrd_title = sprintf('CPU usage (%s)', $pi[1]);
		$obj->rrd_vertical = 'Jiffies';
		$obj->rrd_format = '%7.2lf';
		$obj->rrdtool_opts .= ' -u 100';

		collectd_flush($obj->identifiers);
		$obj->rrd_graph();
	break;
}
