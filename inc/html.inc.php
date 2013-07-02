<?php

# html related functions

require_once 'conf/common.inc.php';
require_once 'inc/rrdtool.class.php';
require_once 'inc/functions.inc.php';
require_once 'inc/collectd.inc.php';

/**
 * Generates the script tag to include a javascript file.  
 * - If $path has no leading slash, inclusion is done relative to $CONFIG['webdir']
 * - If $path has a leading slash or starts with 'http', inclusion is done as-is
 */
function html_javascript_include($js_url) {
	# Sample: <script src="//code.jquery.com/jquery-2.0.0.min.js"></script>
	# TODO: Do we need to check for leading slash or 'http' at the front?
	printf('<script src="%s"></script>', $js_url);	
	echo "\n";
}

function html_jquery_include() {	
	# http://stackoverflow.com/questions/1014203/best-way-to-use-googles-hosted-jquery-but-fall-back-to-my-hosted-library-on-go
	
	if (!isset($CONFIG['jquery_useminified'])) $CONFIG['jquery_useminified'] = true;
	if (!isset($CONFIG['jquery_path_fallbackonly'])) $CONFIG['jquery_path_fallbackonly'] = false;

	# Global CDN (content delivery network) source for jQuery files
	# http://code.jquery.com/jquery-2.0.1.min.js
	# http://code.jquery.com/jquery-2.0.1.js
	$jquery_cdn_url = 'http://code.jquery.com/jquery-';
	$jquery_version = '2.0.2';
	
	# Build global CDN URL
	$jquery_cdn_path = $jquery_cdn_url . $jquery_version;
	# TODO: The following fragment doesn't work, it always tacks on '.min' no matter what
#	if ($CONFIG['jquery_useminified']) {
#		$jquery_cdn_path .= '.min';
#	}
	$jquery_cdn_path .= '.js';
	
	if (isset($CONFIG['jquery_path'])) {
		# If $CONFIG['jquery_path'] has been set		
		if ($CONFIG['jquery_path_fallbackonly']) {
			# If $CONFIG['jquery_path_fallbackonly'] is true, then we should attempt to use the CDN version first.
			html_javascript_include($jquery_cdn_path);
			printf('<script>if (!window.jQuery) { document.write(\'<script src="%s"><\/script>\'); }</script>', $CONFIG['jquery_path']);
			echo "\n";
		} else {
			# Else we should only use the locally hosted
			html_javascript_include($CONFIG['jquery_path']);
		}
	} else {
		# Else we use only the CDN version
		html_javascript_include($jquery_cdn_path);
	}
}

/**
 * Called at the top of every page to generate the HTML !DOCTYPE, header, the opening body tag, etc. 
 * - $meta_refresh_period (seconds) if >0 then insert meta refresh tag
 */
function html_start($meta_refresh_period = 0) {
	global $CONFIG;

	$path = htmlentities(breadcrumbs());

	echo <<<EOT
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>CGP{$path}</title>
	<link rel="stylesheet" href="{$CONFIG['weburl']}layout/style.css" type="text/css">
	<meta name="viewport" content="width=1050, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">

EOT;

	if ((is_numeric($meta_refresh_period)) && ($meta_refresh_period > 0)) {
		printf('<meta http-equiv="refresh" content="%s">', $meta_refresh_period);
	}
	
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

	html_jquery_include();
		
echo <<<EOT
</head>
<body>

<div id="header">
  <h1><a href="{$CONFIG['weburl']}">Collectd Graph Panel</a></h1>
</div>

<div id="content">

EOT;
}

/**
 * Called at the bottom of every page to close up the body tag and include any 3rd party scripts.
 */
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

	echo <<<EOT
</div>
<div id="footer">
<hr><span class="small"><a href="http://pommi.nethuis.nl/category/cgp/" rel="external">Collectd Graph Panel</a> ({$version}) is distributed under the <a href="{$CONFIG['weburl']}doc/LICENSE" rel="licence">GNU General Public License (GPLv3)</a></span>
</div>

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

	return printf("<h2><a href='%shost.php?h=%s&p=%s'>%s</a></h2>\n", $CONFIG['weburl'], $host, $plugin, $plugin);
}

function plugins_list($host, $selected_plugins = array()) {
	global $CONFIG;

	$plugins = collectd_plugins($host);

	echo '<div class="plugins">';
	echo '<h2>Plugins</h2>';
	echo '<ul>';

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

	printf('<fieldset id="%s">', $cat);
	printf('<legend>%s</legend>', $cat);
	echo "<table class=\"summary\">\n";

	$row_style = array(0 => "even", 1 => "odd");
	$host_counter = 0;

	foreach($hosts as $host) {
		$host_counter++;

		$cores = count(group_plugindata(collectd_plugindata($host, 'cpu')));

		printf('<tr class="%s">', $row_style[$host_counter % 2]);
		printf('<th><a href="%shost.php?h=%s">%s</a></th>',
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

				foreach (array('ds[shortterm].last_ds', 'ds[midterm].last_ds', 'ds[longterm].last_ds') as $info) {
					$class = '';
					if ($cores > 0 && $rrd_info[$info] > $cores * 2)
						$class = ' class="crit"';
					elseif ($cores > 0 && $rrd_info[$info] > $cores)
						$class = ' class="warn"';

					printf('<td%s>%.2f</td>', $class, $rrd_info[$info]);
				}
			}
		}

		print "</tr>\n";
	}

	echo "</table>\n";
	echo "</fieldset>\n";
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

?>
