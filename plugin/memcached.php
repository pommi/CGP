<?php

# Collectd Memcached plugin

# Details on http://github.com/octo/collectd/blob/master/src/memcached.c



require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# df-cache.rrd
# memcached_command-(flush|get|set).rrd
# memcached_connections-current.rrd
# memcached_items-current.rrd
# memcached_octets.rrd
# memcached_ops-(evictions|hits|misses).rrd
# percent-hitratio.rrd
# ps_count.rrd
# ps_cputime.rrd


switch(GET('t')) {
# df-cache.rrd
	case 'df':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('used', 'free');
		$obj->order = array('used', 'free');
		$obj->ds_names = array(
			'used' => 'Used',
			'free' => 'Free',
		);
		$obj->colors = array(
			'used' => '00e000',
			'free' => '0000ff',
		);
		$obj->rrd_title = 'Memcached Memory Usage';
		$obj->rrd_vertical = 'bytes';
	break;

# memcached_command-(flush|get|set).rrd
	case 'memcached_command':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG);
		$obj->order = array('flush', 'get', 'set');
		$obj->ds_names = array(
			'flush' => 'Flush',
			'get'   => 'Get',
			'set'   => 'Set',
		);
		$obj->colors = array(
			'flush' => '00e000',
			'get'   => '0000ff',
            'set'   => 'ffb000',
		);
		$obj->rrd_title = 'Memcached Commands';
		$obj->rrd_vertical = 'Commands';
	break;

# memcached_connections-current.rrd
	case 'memcached_connections':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('value');
        $obj->ds_names = array(
	        'value' => 'Connections',
        );
        $obj->colors = array(
	        'percent' => '00b000',
        );
		$obj->rrd_title = 'Memcached Number of Connections';
		$obj->rrd_vertical = 'Connections';
    break;

# memcached_items-current.rrd
	case 'memcached_items':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('value');
        $obj->ds_names = array(
	        'value ' => 'Items',
        );
        $obj->colors = array(
	        'value' => '00b000',
        );
		$obj->rrd_title = 'Number of Items in Memcached';
		$obj->rrd_vertical = 'Items';
    break;

# memcached_octets.rrd
	case 'memcached_octets':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('rx', 'tx');
		$obj->order = array('rx', 'tx');
		$obj->ds_names = array(
			'rx' => 'Receive',
			'tx' => 'Transmit',
		);
		$obj->colors = array(
			'rx' => '0000ff',
			'tx' => '00b000',
		);
		$obj->rrd_title = 'Memcached Network Traffic';
		$obj->rrd_vertical = 'Bytes';
	break;
# memcached_ops-(evictions|hits|misses).rrd
	case 'memcached_ops':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG);
		$obj->order = array('evictions', 'hits', 'misses');
		$obj->ds_names = array(
			'evictions' => 'Evictions',
			'hits'      => 'Hits',
			'misses'    => 'Misses',
		);
		$obj->colors = array(
			'evictions' => '00e000',
			'hits'      => '0000ff',
            'misses'    => 'ffb000',
		);
		$obj->rrd_title = 'Memcached Operations';
		$obj->rrd_vertical = 'Commands';
	break;

# percent-hitratio.rrd
	case 'percent':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('percent');
        $obj->ds_names = array(
	        'percent ' => 'Percentage',
        );
        $obj->colors = array(
	        'percent' => '00e000',
        );
		$obj->rrd_title = 'Memcached Hits/Gets Ratio';
		$obj->rrd_vertical = 'Percent';
    break;
# ps_count.rrd
	case 'ps_count':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('threads');
		$obj->order = array('threads');
		$obj->ds_names = array(
			'threads' => 'Threads',
		);
		$obj->colors = array(
			'threads' => '00b000',
		);
		$obj->rrd_title = 'Memcached number of Threads';
		$obj->rrd_vertical = 'Threads';
	break;

# ps_cputime.rrd
	case 'ps_cputime':
        require_once 'type/Default.class.php';
        $obj = new Type_Default($CONFIG);
        $obj->data_sources = array('user', 'syst');
		$obj->order = array('user', 'syst');
		$obj->ds_names = array(
			'user' => 'User',
			'syst' => 'System',
		);
		$obj->colors = array(
			'user'  => '00e000',
			'syst'  => '0000ff',
		);
		$obj->rrd_title = 'CPU Time consumed by the memcached process';
		$obj->rrd_vertical = 'Time';
	break;
}

$obj->width = $width;
$obj->heigth = $heigth;
$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
