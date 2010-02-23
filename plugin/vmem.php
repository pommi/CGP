<?php

# Collectd VMem plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# vmem/
# vmem/vmpage_faults.rrd
# vmem/vmpage_io-memory.rrd
# vmem/vmpage_io-swapy.rrd
# vmem/vmpage_number-<type>.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
switch($obj->args['type']) {
	case 'vmpage_faults':
		$obj->data_sources = array('minflt', 'majflt');
		$obj->colors = array('minflt' => '0000f0',
		                     'majflt' => 'f00000');
		$obj->ds_names = array('minflt' => 'Minor',
		                       'majflt' => 'Major');
		$obj->rrd_title = 'Page faults';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%5.1lf%s';
		break;
	case 'vmpage_io':
		$obj->data_sources = array('in', 'out');
		$obj->ds_names = array('memory-in'  => 'Memory (in) ',
		                       'memory-out' => 'Memory (out)',
		                       'swap-in'    => 'Swap (in)   ',
		                       'swap-out'   => 'Swap (out)  ');
		$obj->colors = array('memory-in'  => 'ff0000',
		                     'memory-out' => '0000ff',
		                     'swap-in'    => 'ff00ff',
		                     'swap-out'   => 'ffff00');
		$obj->rrd_title = 'Page IO';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%5.1lf%s';
		break;
	case 'vmpage_number':
		$obj->data_sources = array('value');
		$obj->generate_colors();
		$obj->order = array('active_anon', 'active_file',
		                    'anon_pages', 'bounce',
		                    'dirty', 'file_pages',
                            'free_pages', 'inactive_anon',
		                    'inactive_file', 'mapped',
		                    'mlock', 'page_table_pages',
		                    'slab_reclaimable', 'slab_unreclaimable',
		                    'unevictable', 'unstable',
		                    #'vmscan_write',
		                    'writeback', 'writeback_temp');
		$obj->rrd_title = 'Pages';
		$obj->rrd_vertical = '';
		$obj->rrd_format = '%5.1lf%s';
		break;
}

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
