<?php

# Collectd aggregation plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# aggregation-XXXX-YYYYY/
#
# Layout for aggregation of "cpu" plugin:
# aggregation-cpu-YYYYY/cpu-idle.rrd
# aggregation-cpu-YYYYY/cpu-interrupt.rrd
# aggregation-cpu-YYYYY/cpu-nice.rrd
# aggregation-cpu-YYYYY/cpu-softirq.rrd
# aggregation-cpu-YYYYY/cpu-steal.rrd
# aggregation-cpu-YYYYY/cpu-system.rrd
# aggregation-cpu-YYYYY/cpu-user.rrd
# aggregation-cpu-YYYYY/cpu-wait.rrd

$obj = new Type_Default($CONFIG);
$obj->ds_names = array(
	'value' => 'Value',
);
switch($obj->args['type']) {
	case 'cpu':
		$obj = new Type_GenericStacked($CONFIG);
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
		$obj->rrd_title = sprintf('CPU-%s usage', $obj->args['pinstance']);
		$obj->rrd_vertical = 'Jiffies';
		$obj->rrd_format = '%5.2lf';
		$obj->rrdtool_opts .= ' -u 100';
	break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();
