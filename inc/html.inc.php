<?php

# html related functions

require_once 'conf/common.inc.php';
require_once 'inc/rrdtool.class.php';
require_once 'inc/functions.inc.php';
require_once 'inc/collectd.inc.php';

function html_start() {
	global $CONFIG;

	$path = htmlentities(breadcrumbs());

	echo <<<EOT
<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="description" content="">
    <meta name="author" content="">
	<title>Collectd Graph Panel {$path}</title>
	<link rel="stylesheet" href="{$CONFIG['weburl']}assets/css/bootstrap.min.css" type="text/css">
	<link rel="stylesheet" href="{$CONFIG['weburl']}assets/css/style.css" type="text/css">
	<style type="text/css">
        body { padding-top: 40px; }
        @media screen and (max-width: 768px) {
            body { padding-top: 0px; }
        }
    </style>
	<meta name="viewport" content="width=1050, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">

EOT;

	if ($CONFIG['graph_type'] == 'canvas') {
		echo <<<EOT
	<script type="text/javascript" src="{$CONFIG['weburl']}js/sprintf.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/strftime.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdRpn.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdTime.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdGraph.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdGfxCanvas.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/binaryXHR.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/rrdFile.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdDataFile.js"></script>
	<script type="text/javascript" src="{$CONFIG['weburl']}js/RrdCmdLine.js"></script>

EOT;
	}

echo <<<EOT
</head>
<body>

<div class="navbar navbar-inverse navbar-fixed-top">
    <div class="navbar-inner">
        <a class="brand" style="margin-left:10px;" href="{$CONFIG['weburl']}">Collectd Graph Panel</a>
    </div>
</div>

<div class="container-fluid clearfix">
EOT;
}

function html_end() {
	global $CONFIG;

	$git = '/usr/bin/git';
	$changelog = $CONFIG['webdir'].'/doc/CHANGELOG';

	$version = 'v?';
	if (file_exists($git) && is_dir($CONFIG['webdir'].'/.git')) {
		chdir($CONFIG['webdir']);
		$version = exec($git.' describe --tags');
	} elseif (file_exists($changelog)) {
		$changelog = file($changelog);
		$version = explode(' ', $changelog[0]);
		$version = 'v'.$version[0];
	}

    $now = time();

	echo <<<EOT
</div>
<div id="footer">
    <div class="container">
        <a href="http://pommi.nethuis.nl/category/cgp/" rel="external" target="_blank">Collectd Graph Panel</a> ({$version}) is distributed under the <a href="{$CONFIG['weburl']}doc/LICENSE" rel="licence">GNU General Public License (GPLv3)</a>
    </div>
</div>

<script src="{$CONFIG['weburl']}assets/js/jquery-2.0.0.min.js"></script>
<script src="{$CONFIG['weburl']}assets/js/bootstrap.min.js"></script>
<script type="text/javascript">
    var now = {$now};
    function swapImage(id, url){
        $('#' + id).attr('src', url);
    }
</script>


EOT;

	if ($CONFIG['graph_type'] == 'canvas') {
		echo <<<EOT
<script type="text/javascript" src="{$CONFIG['weburl']}js/CGP.js"></script>

EOT;
	}

echo <<<EOT

</body>
</html>
EOT;
}

function plugin_header($host, $plugin) {
	global $CONFIG;

    $s = GET('s');
    $seconds = (!empty($s) && is_numeric($s)) ? $s : $CONFIG['time_range']['default'];

	return printf("<h3><a href='%shost.php?h=%s&p=%s&s=%s'>%s</a></h3>\n", $CONFIG['weburl'], $host, $plugin, $seconds, $plugin);

}

function plugins_list($host, $selected_plugins = array()) {
	global $CONFIG;

	$plugins = collectd_plugins($host);

        echo '<div class="sidebar-nav sidebar-nav-fixed">';
        echo '<h3>Plugins</h3>';
        echo '<ul class="nav nav-list">';

        printf("<li><a %s href='%shost.php?h=%s'>overview</a></li>\n",
            selected_overview($selected_plugins),
            $CONFIG['weburl'],
            $host
        );

        # first the ones defined as ordered
        foreach($CONFIG['overview'] as $plugin) {
            if (in_array($plugin, $plugins)) {
                printf("<li><a %s href='%shost.php?h=%s&p=%s'>%4\$s</a></li>\n",
                    selected_plugin($plugin, $selected_plugins),
                    $CONFIG['weburl'],
                    $host,
                    $plugin
                );
            }
        }

        # other plugins
        foreach($plugins as $plugin) {
            if (!in_array($plugin, $CONFIG['overview'])) {
                printf("<li><a %s href='%shost.php?h=%s&p=%s'>%4\$s</a></li>\n",
                    selected_plugin($plugin, $selected_plugins),
                    $CONFIG['weburl'],
                    $host,
                    $plugin
                );
            }
        }

        echo '</ul>';
        echo '</div>';
}

function list_plugins(array $plugins, array $hosts, $config){
    $plugins = array_unique($plugins);
    echo '<div class="sidebar-nav sidebar-nav-fixed">';
    echo '<h3>Plugins</h3>';
    echo '<ul class="nav nav-list">';
        foreach($plugins as $plugin){
            echo '<li><a href="'.$config['weburl'].'host.php?h='.implode(',', $hosts).'&p='.$plugin.'">'.$plugin.'</a></li>';
        }
    echo '</ul>';
    echo '</div>';
}

function selected_overview($selected_plugins) {
	if (count($selected_plugins) > 1) {
		return 'class="selected"';
	}
	return '';
}

function selected_plugin($plugin, $selected_plugins) {
	if (in_array($plugin, $selected_plugins)) {
		return 'class="selected"';
	}
	return '';
}

function selected_timerange($value1, $value2) {
	if ($value1 == $value2) {
		return 'class="selected"';
	}
	return '';
}

function host_summary($cat, $hosts) {
	global $CONFIG;

	$rrd = new RRDTool($CONFIG['rrdtool']);

	if(count($hosts) > 0){

        echo '<table class="table table-bordered table-striped table-hover table-inverse">';

        echo '<thead>';
            echo '<tr>';
                echo '<th>Host</th>';
                if($CONFIG['showload']){
                    echo '<th>Short Load</th>';
                    echo '<th>Mid Load</th>';
                    echo '<th>Long Load</th>';
                }
            echo '</tr>';
        echo '</thead>';

        echo '<tbody>';

        $row_style = array(0 => "even", 1 => "odd");
        $host_counter = 0;

        foreach($hosts as $host) {
            $host_counter++;

            printf('<tr>', $row_style[$host_counter % 2]);
            printf('<td><a href="%shost.php?h=%s">%s</a></td>',
                $CONFIG['weburl'],$host, $host);

            if ($CONFIG['showload']) {
                collectd_flush(sprintf('%s/load/load', $host));
                $rrd_info = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/load/load.rrd');

                # ignore if file does not exist
                if (!$rrd_info)
                    continue;

                if (isset($rrd_info['ds[shortterm].last_ds']) &&
                    isset($rrd_info['ds[midterm].last_ds']) &&
                    isset($rrd_info['ds[longterm].last_ds'])) {

                    printf('<td>%.2f</td><td>%.2f</td><td>%.2f</td>',
                        $rrd_info['ds[shortterm].last_ds'],
                        $rrd_info['ds[midterm].last_ds'],
                        $rrd_info['ds[longterm].last_ds']);
                }
            }

            print "</tr>\n";
        }
        echo '</tbody>';
	    echo '</table>';
    }
}


function breadcrumbs() {
	$path = '';
	if (validate_get(GET('h'), 'host'))
		$path .= ' - '.ucfirst(GET('h'));
	if (validate_get(GET('p'), 'plugin'))
		$path .= ' - '.ucfirst(GET('p'));
	if (validate_get(GET('pi'), 'pinstance'))
		$path .= ' - '.GET('pi');
	if (validate_get(GET('t'), 'type') && validate_get(GET('p'), 'plugin') && GET('t') != GET('p'))
		$path .= ' - '.GET('t');
	if (validate_get(GET('ti'), 'tinstance'))
		$path .= ' - '.GET('ti');

	return $path;
}
