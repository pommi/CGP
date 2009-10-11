<?php

require_once 'conf/common.inc.php';

# returns an array of all collectd hosts
function collectd_hosts() {
	global $CONFIG;

	if (!is_dir($CONFIG['datadir']))
		return false;

	$dir = scandir($CONFIG['datadir']);
	foreach($dir as $k => $v) {
		if(!is_dir($CONFIG['datadir'].'/'.$v) || $v == '.' || $v == '..')
			unset($dir[$k]);
	}
	return($dir);
}

# returns an array of plugins/pinstances/types/tinstances
function collectd_plugindata($host) {
	global $CONFIG;

	if (!is_dir($CONFIG['datadir'].'/'.$host))
		return false;

	chdir($CONFIG['datadir'].'/'.$host);
	$files = glob("*/*.rrd");
	if (!$files)
		return false;
	
	$data;
	$i = 0;
	foreach($files as $item) {
		unset($part);

		# split item by plugin/type
		$part = explode('/', $item);
		$part[1] = preg_replace('/\.rrd/', '', $part[1]);

		# plugin
		$data[$i]['p'] = preg_replace('/-.+/', '', $part[0]);

		# plugin instance
		if(preg_match('/-/', $part[0]))
			$data[$i]['pi'] = preg_replace('/^[a-z_]+\-/', '', $part[0]);
		
		# type
		$data[$i]['t'] = preg_replace('/-.+/', '', $part[1]);

		# type instance
		if(preg_match('/-/', $part[1]))
			$data[$i]['ti'] = preg_replace('/^[a-z_]+\-/', '', $part[1]);

		$i++;
	}
	return($data);
}

# returns an array of all plugins of a host
function collectd_plugins($host) {
	$plugindata = collectd_plugindata($host);

	$plugins = array();
	foreach ($plugindata as $item) {
		if (!in_array($item['p'], $plugins))
			$plugins[] = $item['p'];
	}
	
	return $plugins;
}

# returns an array of all pi/t/ti of an plugin
function collectd_plugindetail($host, $plugin, $detail, $where=NULL) {
	$details = array('pi', 't', 'ti');
	if (!in_array($detail, $details))
		return false;

	$plugindata = collectd_plugindata($host);

	$return = array();
	foreach ($plugindata as $item) {
		if ($item['p'] == $plugin && !in_array($item[$detail], $return) && isset($item[$detail])) {
			if ($where) {
				$add = true;
				# add detail to returnvalue if all where is true
				foreach($where as $key => $value) {
					if ($item[$key] != $value)
						$add = false;
				}
				if ($add)
					$return[] = $item[$detail];
			} else {
				$return[] = $item[$detail];
			}
		}
	}

	if (empty($return))
		return false;
	
	return $return;
}

# generate graph url's for a plugin of a host
function graphs_from_plugin($host, $plugin) {
	global $CONFIG;

	$pis = collectd_plugindetail($host, $plugin, 'pi');
	$ts = collectd_plugindetail($host, $plugin, 't');
	$tis = collectd_plugindetail($host, $plugin, 'ti');
	if (!$pis) $pis = array('NULL');
	if (!$tis || $CONFIG['groupby'][$plugin] == 'type')
		$tis = array('NULL');

	foreach($pis as $pi) {
		foreach ($tis as $ti) {
			foreach ($ts as $t) {
				$items = array(
					'h' => $host,
					'p' => $plugin,
					'pi' => $pi,
					't' => $t,
					'ti' => $ti
				);
				printf('<a href="%s/%s"><img src="%s/%s"></a>'."\n",
					$CONFIG['weburl'],
					build_url('detail.php', $items),
					$CONFIG['weburl'],
					build_url('graph.php', $items)
				);
			}
		}
	}
}

# generate an url with GET values from $items
function build_url($base, $items, $s=86400) {
	if (!is_array($items))
		return false;
	
	if (!is_numeric($s))
		return false;

	$i=0;
	foreach ($items as $key => $value) {
		# don't include empty values
		if ($value == 'NULL')
			continue;

		$base .= sprintf('%s%s=%s', $i==0 ? '?' : '&', $key, $value);
		$i++;
	}
	if (!isset($items['s']))
		$base .= '&s='.$s;

	return $base;
}

?>
