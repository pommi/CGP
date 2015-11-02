<?php

# category of hosts to show on main page
#$CONFIG['cat']['category1'] = array('host1', 'host2');
# add mnellemann hosts categories based on regular expression
# category of hosts based on regular expression
#$CONFIG['cat']['Mailservers'] = '/mail\d+/';

# default plugins to show on host page
$CONFIG['overview'] = array('cpu', 'memory', 'load', 'df', 'interface');

# example of filter to show only the if_octets of eth0 on host page
# (interface must be enabled in the overview config array)
#$CONFIG['overview_filter']['interface'] = array('ti' => 'eth0', 't' => 'if_octets');
$CONFIG['overview_filter']['df'] = array('pi' => 'root', 't' => 'df_complex');
$CONFIG['overview_filter']['interface'] = array('pi' => 'eth0', 't' => 'if_packets');

# default plugins time range
$CONFIG['time_range']['default'] = 900;
$CONFIG['time_range']['uptime']  = 31536000;

# show load averages and used memory on overview page
$CONFIG['showload'] = true;
$CONFIG['showmem'] = true;
# modify bogdanr rootdf addon
$CONFIG['showrootdf'] = true;
$CONFIG['showtime'] = true;
# display ($CONFIG['showItem']) metrics legend on category header
$CONFIG['showlegend'] = true;

$CONFIG['term'] = array(
	'15min'	 => 60 * 15,
	'30min'	 => 60 * 30,
	'1hour'	 => 3600 * 1,
	'2hour'	 => 3600 * 2,
	'4hour'	 => 3600 * 4,
	'8hour'	 => 3600 * 8,
	'12hour' => 3600 * 12,
	'day'	 => 86400,
	'2day'	 => 86400 * 2,
	'4day'	 => 86400 * 4,
	'week'	 => 86400 * 7,
	'month'	 => 86400 * 31,
	'quarter'=> 86400 * 31 * 3,
	'year'	 => 86400 * 365,
);

# "png", "svg", "canvas" or "hybrid" (canvas on detail page, png on the others) graphs
$CONFIG['graph_type'] = 'hybrid';

# create smooth graphs (rrdtool -E)
$CONFIG['graph_smooth'] = true;

# page refresh (in seconds)
$CONFIG['page_refresh'] = '60';
