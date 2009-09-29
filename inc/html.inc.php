<?php

require_once 'conf/common.inc.php';
require_once 'inc/rrdtool.class.php';

function html_start() {
	global $CONFIG;
	echo <<<EOT
<!DOCTYPE HTML>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Collectd Graph Panel</title>
	<link rel="stylesheet" href="{$CONFIG['weburl']}/layout/style.css" type="text/css">
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

function host_summary($hosts) {
	global $CONFIG;

	$rrd = new RRDTool;

	echo "<table class=\"summary\">\n";

	foreach($hosts as $host) {
		$rrd_info = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/load/load.rrd');
		if (!$rrd_info)
			continue;
		printf('<tr><th><a href="%s/host.php?h=%s">%s</a></th><td>%.2f</td><td>%.2f</td><td>%.2f</td></tr>'."\n",
		$CONFIG['weburl'],$host, $host,
		$rrd_info["ds[shortterm].last_ds"], $rrd_info["ds[midterm].last_ds"], $rrd_info["ds[longterm].last_ds"]);
	}

	echo "</table>\n";
}

?>
