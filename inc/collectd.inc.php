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
	if (!$tis) $tis = array('NULL');
	# backwards compatibility
	if ($CONFIG['version'] >= 5 || !preg_match('/^(df|interface)$/', $plugin))
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

				$time = array_key_exists($plugin, $CONFIG['time_range'])
					? $CONFIG['time_range'][$plugin]
					: $CONFIG['time_range']['default'];

				printf('<a href="%s/%s"><img src="%s/%s"></a>'."\n",
					$CONFIG['weburl'],
					build_url('detail.php', $items, $time),
					$CONFIG['weburl'],
					build_url('graph.php', $items, $time)
				);
			}
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
			printf('ERROR: Failed to write full command to unix-socket: %d out of %d written',
				$r === false ? -1 : $r, strlen($cmd));
			return FALSE;
		}

		$resp = fgets($socket);
		if ($resp === false) {
			printf('ERROR: Failed to read response from collectd for command: %s',
				trim($cmd));
			return FALSE;
		}

		$n = (int)$resp;
		while ($n-- > 0)
			fgets($socket);

		fclose($socket);

		return TRUE;
	} else {
		printf('ERROR: Failed to open unix-socket to collectd: %d: %s',
			$u_errno, $u_errmsg);
		return FALSE;
	}
}

?>
