<?php

$CONFIG['datadir'] = '/var/lib/collectd/rrd';

#$CONFIG['cat']['nethuis'] = array('pepper');
$CONFIG['overview'] = array('load', 'cpu', 'memory', 'swap');

# default width/height of the graphs
$CONFIG['width'] = 400;
$CONFIG['heigth'] = 175;
# default width/height of detailed graphs
$CONFIG['detail-width'] = 800;
$CONFIG['detail-heigth'] = 350;

$CONFIG['groupby'] = array(
	'cpu' => 'type',
	'irq' => 'type',
	'memory' => 'type',
	'processes' => 'type',
	'swap' => 'type',
	'sensors' => 'type',
);

if (file_exists(dirname(__FILE__).'/config.local.php'))
	include 'config.local.php';

?>
