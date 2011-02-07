<?php

# collectd version
$CONFIG['version'] = 4;

# collectd's datadir
$CONFIG['datadir'] = '/var/lib/collectd/rrd';

# rrdtool executable
$CONFIG['rrdtool'] = '/usr/bin/rrdtool';

# rrdtool special options
$CONFIG['rrdtool_opts'] = '';

# category of hosts to show on main page
#$CONFIG['cat']['category1'] = array('host1', 'host2');

# default plugins to show on host page
$CONFIG['overview'] = array('load', 'cpu', 'memory', 'swap');

# default plugins time range
$CONFIG['time_range']['default'] = 86400;
$CONFIG['time_range']['uptime']  = 31536000;

# show load averages on overview page
$CONFIG['showload'] = true;

# browser cache time for the graphs (in seconds)
$CONFIG['cache'] = 90;

# default width/height of the graphs
$CONFIG['width'] = 400;
$CONFIG['heigth'] = 175;
# default width/height of detailed graphs
$CONFIG['detail-width'] = 800;
$CONFIG['detail-heigth'] = 350;

# collectd's unix socket (unixsock plugin)
# enabled: 'unix:///var/run/collectd-unixsock'
# disabled: NULL
$CONFIG['socket'] = NULL;


# load local configuration
if (file_exists(dirname(__FILE__).'/config.local.php'))
	include_once 'config.local.php';

?>
