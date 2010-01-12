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
<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>CGP{$path}</title>
	<link rel="stylesheet" href="{$CONFIG['weburl']}/layout/style.css" type="text/css">
	<script type="text/javascript" src="{$CONFIG['weburl']}/ajax.js"></script>
</head>
<body>

<div id="header">
  <h1><a href="{$CONFIG['weburl']}">Collectd Graph Panel</a></h1>
</div>

<div id="content">

EOT;
}

function html_end() {
	echo <<<EOT
</div>
<div id="footer">
<hr><span class="small">Collectd Graph Panel is distributed under the GNU General Public License (GPL)</span>
</div>
</body>
</html>
EOT;
}

function plugin_header($host, $plugin, $status) {
	global $CONFIG;

	if ($status == 1) {
		$f = 'get';
		$i = 'plus';
		$a = '+';
	} else {
		$f = 'rm';
		$i = 'minus';
		$a = '-';
	}

	return printf("<h3><span class=\"point\" onclick=\"javascript:%sP('%s','%s')\"><img src=\"%s/layout/%s.gif\" alt=\"[%s]\"> %s</span></h3>\n", $f, $host, $plugin, $CONFIG['weburl'], $i, $a, $plugin);
}

function host_summary($hosts) {
	global $CONFIG;

	$rrd = new RRDTool($CONFIG['rrdtool']);

	echo "<table class=\"summary\">\n";

	foreach($hosts as $host) {
		collectd_flush(sprintf('%s/load/load', $host));
		$rrd_info = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/load/load.rrd');
		if (!$rrd_info)
			continue;
		printf('<tr><th><a href="%s/host.php?h=%s">%s</a></th><td>%.2f</td><td>%.2f</td><td>%.2f</td></tr>'."\n",
		$CONFIG['weburl'],$host, $host,
		$rrd_info["ds[shortterm].last_ds"], $rrd_info["ds[midterm].last_ds"], $rrd_info["ds[longterm].last_ds"]);
	}

	echo "</table>\n";
}


function breadcrumbs() {
	if (validate_get($_GET['h'], 'host'))
		$path = ' - '.ucfirst($_GET['h']);
	if (validate_get($_GET['p'], 'plugin'))
		$path .= ' - '.ucfirst($_GET['p']);
	if (validate_get($_GET['pi'], 'pinstance'))
		$path .= ' - '.$_GET['pi'];
	if (validate_get($_GET['t'], 'type') && validate_get($_GET['p'], 'plugin') && $_GET['t'] != $_GET['p'])
		$path .= ' - '.$_GET['t'];
	if (validate_get($_GET['ti'], 'tinstance'))
		$path .= ' - '.$_GET['ti'];

	return $path;
}

?>
