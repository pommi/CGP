<?php

# collectd version
$CONFIG['version'] = 5;

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

# auto-refresh of overview page, in seconds (if set to >0)
$CONFIG['overview_refresh'] = 180;

# auto-refresh of graphs on the host page, in seconds (if set to >0)
$CONFIG['host_graphs_refresh'] = 120;

# auto-refresh of graphs on the detailed view page, in seconds (if set to >0)
$CONFIG['detail_graphs_refresh'] = 60;

# example of filter to show only the if_octets of eth0 on host page
# (interface must be enabled in the overview config array)
#$CONFIG['overview_filter']['interface'] = array('ti' => 'eth0', 't' => 'if_octets');

# default plugins time range
$CONFIG['time_range']['default'] = 86400;
$CONFIG['time_range']['uptime']  = 31536000;

# show load averages on overview page
$CONFIG['showload'] = true;

$CONFIG['term'] = array(
	'2hour'	 => 3600 * 2,
	'8hour'	 => 3600 * 8,
	'day'	 => 86400,
	'week'	 => 86400 * 7,
	'month'	 => 86400 * 31,
	'quarter'=> 86400 * 31 * 3,
	'year'	 => 86400 * 365,
);

# show graphs in bits or bytes
$CONFIG['network_datasize'] = 'bytes';

# Display graphs as png, svg or canvas
$CONFIG['graph_type'] = 'png';

# use the negative X-axis in I/O graphs
$CONFIG['negative_io'] = false;

# create smooth graphs (rrdtool -E)
$CONFIG['graph_smooth'] = false;

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

# Change this if you are going to host jQuery files locally, otherwise they will be pulled from a global CDN.
$CONFIG['jquery_path'] = NULL;
# Do you want to only use your locally hosted jQuery file if the CDN version does not load?
$CONFIG['jquery_path_fallbackonly'] = false;
# Use the "minified" version of the jquery file?  This should be set to true in most cases, unless you are debugging jQuery.
$CONFIG['jquery_useminified'] = true;

# load local configuration
if (file_exists(dirname(__FILE__).'/config.local.php'))
	include_once 'config.local.php';

?>
