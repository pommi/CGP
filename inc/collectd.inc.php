<?php

# collectd related functions

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
function collectd_plugindata($host, $plugin=NULL) {
	global $CONFIG;

	if (!is_dir($CONFIG['datadir'].'/'.$host))
		return false;

	chdir($CONFIG['datadir'].'/'.$host);
	$files = glob("*/*.rrd");
	if (!$files)
		return false;
	
	$data = array();
	foreach($files as $item) {
		preg_match('#([\w_]+)(?:\-(.+))?/([\w_]+)(?:\-(.+))?\.rrd#', $item, $matches);

		$data[] = array(
			'p'  => $matches[1],
			'pi' => isset($matches[2]) ? $matches[2] : '',
			't'  => $matches[3],
			'ti' => isset($matches[4]) ? $matches[4] : '',
		);
	}

	# only return data about one plugin
	if (!is_null($plugin)) {
		foreach($data as $item) {
			if ($item['p'] == $plugin)
				$pdata[] = $item;
		}
		$data = $pdata;
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

# group plugin files for graph generation
function group_plugindata($plugindata) {
	global $CONFIG;

	# type instances should be grouped in 1 graph
	foreach ($plugindata as $item) {
		# backwards compatibility
		if ($CONFIG['version'] >= 5 || !preg_match('/^(df|interface)$/', $item['p']))
			if($item['p'] != 'libvirt')
				unset($item['ti']);
		$data[] = $item;
	}

	# remove duplicates
	$data = array_map("unserialize", array_unique(array_map("serialize", $data)));

	return $data;
}

# generate graph url's for a plugin of a host
function graphs_from_plugin($host, $plugin) {
	global $CONFIG;

	$plugindata = collectd_plugindata($host, $plugin);
	$plugindata = group_plugindata($plugindata);

	foreach ($plugindata as $items) {
		$items['h'] = $host;

		$time = array_key_exists($plugin, $CONFIG['time_range'])
			? $CONFIG['time_range'][$plugin]
			: $CONFIG['time_range']['default'];

		printf('<a href="%s%s"><img src="%s%s"></a>'."\n",
			$CONFIG['weburl'],
			build_url('detail.php', $items, $time),
			$CONFIG['weburl'],
			build_url('graph.php', $items, $time)
		);
	}
}

# generate an url with GET values from $items
function build_url($base, $items, $s=NULL) {
	global $CONFIG;

	if (!is_array($items))
		return false;
	
	if (!is_numeric($s))
		$s = $CONFIG['time_range']['default'];

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

# generate identifier that collectd's FLUSH command understands
function collectd_identifier($host, $plugin, $pinst, $type, $tinst) {
	global $CONFIG;

	$identifier = sprintf('%s/%s%s%s/%s%s%s', $host,
		$plugin, strlen($pinst) ? '-' : '', $pinst,
		$type, strlen($tinst) ? '-' : '', $tinst);

	if (is_file($CONFIG['datadir'].'/'.$identifier.'.rrd'))
		return $identifier;
	else
		return FALSE;
}

# tell collectd to FLUSH all data of the identifier(s)
function collectd_flush($identifier) {
	global $CONFIG;

	if (!$CONFIG['socket'])
		return FALSE;

	if (!$identifier || (is_array($identifier) && count($identifier) == 0) ||
			!(is_string($identifier) || is_array($identifier)))
		return FALSE;

	$u_errno  = 0;
	$u_errmsg = '';
	if ($socket = @fsockopen($CONFIG['socket'], 0, $u_errno, $u_errmsg)) {
		$cmd = 'FLUSH plugin=rrdtool';
		if (is_array($identifier)) {
			foreach ($identifier as $val)
				$cmd .= sprintf(' identifier="%s"', $val);
		} else
			$cmd .= sprintf(' identifier="%s"', $identifier);
		$cmd .= "\n";

		$r = fwrite($socket, $cmd, strlen($cmd));
		if ($r === false || $r != strlen($cmd)) {
			error_log(sprintf('ERROR: Failed to write full command to unix-socket: %d out of %d written',
				$r === false ? -1 : $r, strlen($cmd)));
			return FALSE;
		}

		$resp = fgets($socket);
		if ($resp === false) {
			error_log(sprintf('ERROR: Failed to read response from collectd for command: %s',
				trim($cmd)));
			return FALSE;
		}

		$n = (int)$resp;
		while ($n-- > 0)
			fgets($socket);

		fclose($socket);

		return TRUE;
	} else {
		error_log(sprintf('ERROR: Failed to open unix-socket to collectd: %d: %s',
			$u_errno, $u_errmsg));
		return FALSE;
	}
}

?>
