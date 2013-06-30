<?php

# Collectd aggregation plugin

require_once 'conf/common.inc.php';
require_once 'type/Default.class.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
#
# collectd, by default, creates the aggregation RRDs in the following pattern:
# /(basedir)/(hostname)/aggregation-(type)-(instance)/(type)-(datasources).rrd
# 
# Examples (aggregation of multiple CPUs in a single host):
#
# collectd configuration:
# <Plugin "aggregation">
#  <Aggregation>
#    Host "athens"
#    Plugin "cpu"
#    Type "cpu"
#    GroupBy "Host"
#    GroupBy "TypeInstance"
#	 CalculateSum true
# 	 CalculateAverage true
#	 </Aggregation>
# </Plugin>
#
# Produces filenames like:
# /rrdcollectd/athens/aggregation-cpu-average/cpu-idle.rrd
# /rrdcollectd/athens/aggregation-cpu-average/cpu-user.rrd
# /rrdcollectd/athens/aggregation-cpu-average/cpu-wait.rrd
# /rrdcollectd/athens/aggregation-cpu-average/cpu-system.rrd

switch(GET('t')) {
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
		$obj->rrd_format = '%7.2lf';
		$obj->rrdtool_opts .= ' -u 100';

		collectd_flush($obj->identifiers);
		$obj->rrd_graph();
	break;
}

