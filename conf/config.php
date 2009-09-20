<?php

$CONFIG['datadir'] = '/var/lib/collectd/rrd';

#$CONFIG['cat']['nethuis'] = array('pepper');
$CONFIG['overview'] = array('load', 'cpu', 'memory', 'swap');

$CONFIG['groupby'] = array(
	'cpu' => 'type',
	'irq' => 'type',
	'memory' => 'type',
	'processes' => 'type',
	'swap' => 'type',
	'sensors' => 'type',
);

include 'config.local.php';

?>
