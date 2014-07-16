<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/collectd.inc.php';

$plugin = validate_get(GET('p'), 'plugin');
$type = validate_get(GET('t'), 'type');
$width = empty($_GET['x']) ? $CONFIG['width'] : $_GET['x'];
$height = empty($_GET['y']) ? $CONFIG['height'] : $_GET['y'];

if (validate_get(GET('h'), 'host') === NULL) {
	error_log('CGP Error: plugin contains unknown characters');
	error_image();
}

if ($width > $CONFIG['max-width'] || $height > $CONFIG['max-height']) {
	error_log('Resquested image is too large. Please configure max-width and max-height.');
	error_image();
}

$typesdb = parse_typesdb_file($CONFIG['typesdb']);

if ($plugin == 'aggregation') {
	$pi = explode("-", GET('pi'));
	$plugin = $_GET['p'] = $pi[0];
}

# plugin json
if (file_exists('plugin/'.$plugin.'.json')) {
	$json = file_get_contents('plugin/'.$plugin.'.json');
	$plugin_json = json_decode($json, true);

	if (is_null($plugin_json))
		error_log('CGP Error: invalid json in plugin/'.$plugin.'.json');
}

if (!isset($plugin_json[$type]['type']))
	$plugin_json[$type]['type'] = 'default';

switch ($plugin_json[$type]['type']) {
	case 'stacked':
		require_once 'type/GenericStacked.class.php';
		$obj = new Type_GenericStacked($CONFIG, $_GET);
		break;
	case 'io':
		require_once 'type/GenericIO.class.php';
		$obj = new Type_GenericIO($CONFIG, $_GET);
		break;
	case 'uptime':
		require_once 'type/Uptime.class.php';
		$obj = new Type_Uptime($CONFIG, $_GET);
		break;
	default:
		require_once 'type/Default.class.php';
		$obj = new Type_Default($CONFIG, $_GET);
		break;
}

if (isset($typesdb[$type])) {
	$obj->data_sources = array();
	foreach ($typesdb[$type] as $ds => $property) {
		$obj->data_sources[] = $ds;
	}
}

if (isset($plugin_json[$type]['legend'])) {
	$obj->order = array();
	foreach ($plugin_json[$type]['legend'] as $rrd => $property) {
		$obj->order[] = $rrd;
		$obj->legend[$rrd] = isset($property['name']) ? $property['name'] : $rrd;
		if (isset($property['color']))
			$obj->colors[$rrd] = $property['color'];
	}
}

if (isset($plugin_json[$type]['title'])) {
	$obj->rrd_title = $plugin_json[$type]['title'];
	$obj->rrd_title = str_replace('{{PI}}', GET('pi'), $obj->rrd_title);
	$obj->rrd_title = str_replace('{{TI}}', GET('ti'), $obj->rrd_title);
}

if (isset($plugin_json[$type]['vertical'])) {
	$obj->rrd_vertical = $plugin_json[$type]['vertical'];
	$obj->rrd_vertical = str_replace('{{ND}}', ucfirst($CONFIG['network_datasize']), $obj->rrd_vertical);
}

if (isset($plugin_json[$type]['rrdtool_opts'])) {
	$obj->rrdtool_opts[] = $plugin_json[$type]['rrdtool_opts'];
}

if (isset($plugin_json[$type]['datasize']) and $plugin_json[$type]['datasize'])
	$obj->scale = $CONFIG['network_datasize'] == 'bits' ? 8 : 1;

if ($type == 'if_octets')
	$obj->percentile = $CONFIG['percentile'];

if (isset($plugin_json[$type]['scale']))
	$obj->scale = $plugin_json[$type]['scale'];

if (isset($plugin_json[$type]['base']))
	$obj->base = $plugin_json[$type]['base'];

if (isset($plugin_json[$type]['legend_format']))
	$obj->rrd_format = $plugin_json[$type]['legend_format'];

$obj->rrd_graph();
