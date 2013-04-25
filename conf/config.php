<?php

# collectd version
$CONFIG['version'] = 5;

# collectd's datadir
// todo -- change this back
#$CONFIG['datadir'] = '/var/lib/collectd/rrd';
$CONFIG['datadir'] = '/opt/collectd/var/lib/collectd/rrd';

# rrdtool executable
$CONFIG['rrdtool'] = '/usr/bin/rrdtool';

# rrdtool special options
$CONFIG['rrdtool_opts'] = '';

# category of hosts to show on main page
$CONFIG['cat']['PISCES Production'] = array(
    'piscesweb10',
    'piscesweb11',
    'piscesweb11',
    'piscesweb12',
    'piscesweb13',
    'piscesweb14',
    'piscesweb15',
    'piscesweb16',
    'piscesweb17',
    'piscesweb18',
    'piscesweb19',
    #'piscesweb20',
    'piscesdb01',
    'piscesdb02',
    'piscesdb03',
    'piscesdb04',
    'pisces-varnish-prod1',
    'pisces-varnish-prod2',
    'pisces-varnish-prod3',
    'pisces-memcached-prod',
    'pisces-memcached-prod2',
    'pisces-memcached-prod3',
    'solr-indexer-prod',
    'solr-search1-prod',
    'solr-search2-prod',
    'pisceswebnas'
);

$CONFIG['cat']['eNewsPRO'] = array(
    'enewspro-web1',
    'enewspro-web2',
    'enewspro-neomysql10',
    'enewspro-neomysql11',
    'enewspro-memcached1',
    'enewspro-memcached2',
);

$CONFIG['cat']['KRANG'] = array(
    'krang-web1',
    'krang-web2',
    'krang-web3',
    'krang-be1',
    'krang-be2',
    'krang-be3',
    'krang-pbnas4',
    'krang-mysql-master',
    'krang-mysql-slave',
    'krang-texis-master',
    'krang-texis-query'
);

$CONFIG['cat']['vBulletin and WordPress'] = array(
    'neoweb01-wp-vbb',
    'neoweb02-wp-vbb',
    'neoweb03-wp-vbb',
    'neomysql01-wp-vbb',
    'neomysql02-wp-vbb',
);

# default plugins to show on host page
$CONFIG['overview'] = array('load', 'cpu', 'memory', 'swap');

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
