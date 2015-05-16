<?php

# html related functions

require_once 'conf/common.inc.php';
require_once 'inc/rrdtool.class.php';
require_once 'inc/functions.inc.php';
require_once 'inc/collectd.inc.php';

function html_start() {
	global $CONFIG;

	$path = htmlentities(breadcrumbs());
	$html_weburl = htmlentities($CONFIG['weburl']);

	echo <<<EOT
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>CGP{$path}</title>
	<meta name="viewport" content="width=device-width">
	<link rel="stylesheet" href="{$html_weburl}layout/style.css" type="text/css">
	<link rel="stylesheet" href="{$html_weburl}layout/style-b.css" type="text/css" media="(max-width: 1000px),(max-device-width: 1000px) and (orientation: portrait),(max-device-width: 767px) and (orientation: landscape)">
	<link rel="stylesheet" href="{$html_weburl}layout/style-c.css" type="text/css" media="(max-width: 767px),(max-device-width: 767px) and (orientation: portrait),(max-device-width: 499px) and (orientation: landscape)">
	<link rel="stylesheet" href="{$html_weburl}layout/style-d.css" type="text/css" media="(max-width: 499px),(max-device-width: 499px) and (orientation: portrait)">

EOT;
	if (isset($CONFIG['page_refresh']) && is_numeric($CONFIG['page_refresh'])) {
		echo <<<EOT
	<meta http-equiv="refresh" content="{$CONFIG['page_refresh']}">

EOT;
	}

	if ($CONFIG['graph_type'] == 'canvas') {
		echo <<<EOT
	<script type="text/javascript" src="{$html_weburl}js/sprintf.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/strftime.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdRpn.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdTime.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdGraph.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdGfxCanvas.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/binaryXHR.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/rrdFile.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdDataFile.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/RrdCmdLine.js"></script>

EOT;
	}

	if ($CONFIG['showtime']) {
		echo <<<EOT
	<script type="text/javascript" src="{$html_weburl}js/jquery-2.1.1.min.js"></script>
	<script type="text/javascript" src="{$html_weburl}js/jquery.timeago.js"></script>

EOT;
	}

echo <<<EOT
</head>
<body>

<div id="header">
  <h1><a href="{$html_weburl}">Collectd Graph Panel</a></h1>
</div>

EOT;

	if(!function_exists('json_decode')) {
		echo <<<EOT
<div class="warnheader">
	Your php version doesn't support <a href="http://php.net/json">JSON</a>. Your graphs would have looked more beautiful if it did.
</div>

EOT;

	}

	if($CONFIG['version'] == 4) {
		echo <<<EOT
<div class="warnheader">
	You are using Collectd 4, which is deprecated by CGP. Graphs like
	<code>df</code> and <code>interfaces</code> may be incomplete.
</div>

EOT;

	}

echo <<<EOT
<div id="content">

EOT;
}

function html_end($footer = false) {
	global $CONFIG;

	if ($footer) {
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

		$html_weburl = htmlentities($CONFIG['weburl']);

		echo <<<EOT
</div>
<div id="footer">
<hr><span class="small"><a href="http://pommi.nethuis.nl/category/cgp/" rel="external">Collectd Graph Panel</a> ({$version}) is distributed under the <a href="{$html_weburl}doc/LICENSE" rel="license">GNU General Public License (GPLv3)</a></span>
</div>

EOT;
	}
	if ($CONFIG['graph_type'] == 'canvas') {
		if ($CONFIG['rrd_fetch_method'] == 'async') {
			$js_async = 'true';
		} else {
			$js_async = 'false';
		}
		echo <<<EOT
<script src="{$html_weburl}js/CGP.js"></script>
<script>
CGP.drawAll($js_async);
</script>

EOT;
	}

echo <<<EOT
</body>
</html>
EOT;
}

function plugin_header($host, $plugin) {
	global $CONFIG;

	printf("<h2><a href=\"%shost.php?h=%s&amp;p=%s\">%s</a></h2>\n",
		htmlentities($CONFIG['weburl']),
		urlencode($host),
		urlencode($plugin),
		htmlentities($plugin));
}

function plugins_list($host, $selected_plugins = array()) {
	global $CONFIG;

	$plugins = collectd_plugins($host);

	echo '<div class="plugins">';
	echo '<h2>Plugins</h2>';
	echo '<ul>';

	printf("<li><a %shref=\"%shost.php?h=%s\">overview</a></li>\n",
		selected_overview($selected_plugins),
		htmlentities($CONFIG['weburl']),
		urlencode($host)
	);

	# first the ones defined as ordered
	foreach($CONFIG['overview'] as $plugin) {
		if (in_array($plugin, $plugins)) {
			printf("<li><a %shref=\"%shost.php?h=%s&amp;p=%s\">%s</a></li>\n",
				selected_plugin($plugin, $selected_plugins),
				htmlentities($CONFIG['weburl']),
				urlencode($host),
				urlencode($plugin),
				htmlentities($plugin)
			);
		}
	}

	# other plugins
	foreach($plugins as $plugin) {
		if (!in_array($plugin, $CONFIG['overview'])) {
			printf("<li><a %shref=\"%shost.php?h=%s&amp;p=%s\">%s</a></li>\n",
				selected_plugin($plugin, $selected_plugins),
				htmlentities($CONFIG['weburl']),
				urlencode($host),
				urlencode($plugin),
				htmlentities($plugin)
			);
		}
	}

	echo '</ul>';
	echo '</div>';
}

function selected_overview($selected_plugins) {
	if (count($selected_plugins) > 1) {
		return 'class="selected" ';
	}
	return '';
}

function selected_plugin($plugin, $selected_plugins) {
	if (in_array($plugin, $selected_plugins)) {
		return 'class="selected" ';
	}
	return '';
}

function selected_timerange($value1, $value2) {
	if ($value1 == $value2) {
		return 'class="selected" ';
	}
	return '';
}

function host_summary($cat, $hosts) {
	global $CONFIG;

	$rrd = new RRDTool($CONFIG['rrdtool']);

	printf('<fieldset id="%s">', htmlentities($cat));
	printf('<legend>%s</legend>', htmlentities($cat));
	echo "<div class=\"summary\">\n";

	$row_style = array(0 => "even", 1 => "odd");
	$host_counter = 0;

	foreach($hosts as $host) {
		$host_counter++;

		printf('<div class="row %s">', $row_style[$host_counter % 2]);
		printf('<label><a href="%shost.php?h=%s">%s</a></label>',
			htmlentities($CONFIG['weburl']),
			urlencode($host),
			htmlentities($host));

		echo "<div class=\"hostinfo\">";

		if ($CONFIG['showload']) {
			require_once 'type/Default.class.php';
			$load = array('h' => $host, 'p' => 'load', 't' => 'load');
			$obj = new Type_Default($CONFIG, $load);
			$obj->collectd_flush();

			$rrd_info = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/load/load.rrd');

			if ($rrd_info &&
				isset($rrd_info['ds[shortterm].last_ds']) &&
				isset($rrd_info['ds[midterm].last_ds']) &&
				isset($rrd_info['ds[longterm].last_ds'])) {

				$cores = count(group_plugindata(collectd_plugindata($host, 'cpu')));

				foreach (array('ds[shortterm].last_ds', 'ds[midterm].last_ds', 'ds[longterm].last_ds') as $info) {
					$class = '';
					if ($cores > 0 && $rrd_info[$info] > $cores * 2)
						$class = ' crit';
					elseif ($cores > 0 && $rrd_info[$info] > $cores)
						$class = ' warn';

					printf('<div class="field%s">%.2f</div>', $class, $rrd_info[$info]);
				}
			}
		}

		if ($CONFIG['showmem']) {
			$rrd_info_mu = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/memory/memory-used.rrd');
			$rrd_info_mf = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/memory/memory-free.rrd');
			$rrd_info_bf = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/memory/memory-buffered.rrd');
			$rrd_info_ca = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/memory/memory-cached.rrd');

			# ignore if file does not exist
			if ($rrd_info_mu && $rrd_info_mf && $rrd_info_bf && $rrd_info_ca) {
				$info='ds[value].last_ds';
				if (isset($rrd_info_mu[$info]) && isset($rrd_info_mf[$info]) && isset($rrd_info_bf[$info]) && isset($rrd_info_ca[$info]) ) {
					$percent_mem =	$rrd_info_mu[$info] * 100 / ($rrd_info_mu[$info] + $rrd_info_mf[$info] + $rrd_info_bf[$info] + $rrd_info_ca[$info]);

					$class = '';
					if ($percent_mem > 90)
						$class = ' crit';
					elseif ($percent_mem > 70)
						$class = ' warn';

					printf('<div class="field%s">%d%%</div>', $class, $percent_mem);
				}
			}
		}

		if ($CONFIG['showtime']) {
			$rrd_info = $rrd->rrd_info($CONFIG['datadir'].'/'.$host.'/load/load.rrd');
			if ($rrd_info) {
				$time = time() - $rrd_info['last_update'];

				$class = 'wide';
				if ($time > 300)
					$class .= ' crit';
				elseif ($time > 60)
					$class .= ' warn';

				printf('<div class="field %s"><time class="timeago" datetime="%s">%d seconds ago</time></div>',
					$class, date('c', $rrd_info['last_update']), $time);
			}
		}

		print "</div></div>\n";
	}

	echo "</div>\n";
	echo "</fieldset>\n";
}


function breadcrumbs() {
	$path = '';
	if (GET('h'))
		$path .= ' - '.ucfirst(GET('h'));
	if (GET('p'))
		$path .= ' - '.ucfirst(GET('p'));
	if (GET('pi'))
		$path .= ' - '.GET('pi');
	if (GET('t') && GET('p') && GET('t') != GET('p'))
		$path .= ' - '.GET('t');
	if (GET('ti'))
		$path .= ' - '.GET('ti');

	return $path;
}

# generate graph url's for a plugin of a host
function graphs_from_plugin($host, $plugin, $overview=false) {
	global $CONFIG;

	if (!$plugindata = collectd_plugindata($host, $plugin))
		return false;
	if (!$plugindata = group_plugindata($plugindata))
		return false;
	if (!$plugindata = plugin_sort($plugindata))
		return false;

	foreach ($plugindata as $items) {

		if (
			$overview && isset($CONFIG['overview_filter'][$plugin]) &&
			$CONFIG['overview_filter'][$plugin] !== array_intersect_assoc($CONFIG['overview_filter'][$plugin], $items)
		) {
			continue;
		}

		$items['h'] = $host;

		$time = array_key_exists($plugin, $CONFIG['time_range'])
			? $CONFIG['time_range'][$plugin]
			: $CONFIG['time_range']['default'];

		if ($CONFIG['graph_type'] == 'canvas') {
			chdir($CONFIG['webdir']);
			isset($items['p']) ? $_GET['p'] = $items['p'] : $_GET['p'] = '';
			isset($items['pi']) ? $_GET['pi'] = $items['pi'] : $_GET['pi'] = '';
			isset($items['t']) ? $_GET['t'] = $items['t'] : $_GET['t'] = '';
			isset($items['ti']) ? $_GET['ti'] = $items['ti'] : $_GET['ti'] = '';
			$_GET['s'] = $time;
			include $CONFIG['webdir'].'/graph.php';
		} else {
			printf('<a href="%1$s%2$s"><img src="%1$s%3$s"></a>'."\n",
				htmlentities($CONFIG['weburl']),
				htmlentities(build_url('detail.php', $items, $time)),
				htmlentities(build_url('graph.php', $items, $time))
			);
		}
	}
}

# generate an url with GET values from $items
function build_url($base, $items, $s=NULL) {
	global $CONFIG;

	if (!is_array($items))
		return false;

	if (!is_numeric($s))
		$s = $CONFIG['time_range']['default'];

	// Remove all empty values
	$items = array_filter($items, 'strlen');

	if (!isset($items['s']))
		$items['s'] = $s;

	return "$base?" . http_build_query($items, '', '&');
}
