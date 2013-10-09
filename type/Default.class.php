<?php

# Collectd Default type

class Type_Default {
	var $datadir;
	var $rrdtool;
	var $rrdtool_opts;
	var $cache;
	var $args;
	var $seconds;
	var $data_sources = array('value');
	var $order;
	var $ds_names;
	var $colors;
	var $rrd_title;
	var $rrd_vertical;
	var $rrd_format;
	var $scale = 1;
	var $width;
	var $heigth;
	var $graph_type;
	var $negative_io;
	var $graph_smooth;

	var $files;
	var $tinstances;
	var $identifiers;

	function __construct($config) {
		$this->datadir = $config['datadir'];
		$this->rrdtool = $config['rrdtool'];
		$this->rrdtool_opts = $config['rrdtool_opts'];
		$this->cache = $config['cache'];
		$this->parse_get();
		$this->rrd_files();
		$this->identifiers = $this->file2identifier($this->files);
		$this->width = GET('x');
		if (empty($this->width)) $this->width = $config['width'];
		$this->heigth = GET('y');
		if (empty($this->heigth)) $this->heigth = $config['heigth'];
		$this->graph_type = $config['graph_type'];
		$this->negative_io = $config['negative_io'];
		$this->graph_smooth = $config['graph_smooth'];
	}

	function rainbow_colors() {
		$c = 0;
		$sources = count($this->rrd_get_sources());
		foreach ($this->rrd_get_sources() as $ds) {
			# hue (saturnation=1, value=1)
			$h = $sources > 1 ? 360 - ($c * (330/($sources-1))) : 360;

			$h = ($h %= 360) / 60;
			$f = $h - floor($h);
			$q[0] = $q[1] = 0;
			$q[2] = 1*(1-1*(1-$f));
			$q[3] = $q[4] = 1;
			$q[5] = 1*(1-1*$f);

			$hex = '';
			foreach(array(4,2,0) as $j) {
				$hex .= sprintf('%02x', $q[(floor($h)+$j)%6] * 255);
			}
			$this->colors[$ds] = $hex;
			$c++;
		}
	}

	# parse $_GET values
	function parse_get() {
		$this->args = array(
			'host' => GET('h'),
			'plugin' => GET('p'),
			'pinstance' => GET('pi'),
			'category' => GET('c'),
			'type' => GET('t'),
			'tinstance' => GET('ti'),
		);
		$this->seconds = GET('s');
	}

	function validate_color($color) {
		if (!preg_match('/^[0-9a-f]{6}$/', $color))
			return '000000';
		else
			return $color;
	}

	function get_faded_color($fgc, $bgc='ffffff', $percent=0.25) {
		$fgc = $this->validate_color($fgc);
		if (!is_numeric($percent))
			$percent=0.25;

		$rgb = array('r', 'g', 'b');

		$fg['r'] = hexdec(substr($fgc,0,2));
		$fg['g'] = hexdec(substr($fgc,2,2));
		$fg['b'] = hexdec(substr($fgc,4,2));
		$bg['r'] = hexdec(substr($bgc,0,2));
		$bg['g'] = hexdec(substr($bgc,2,2));
		$bg['b'] = hexdec(substr($bgc,4,2));

		foreach ($rgb as $pri) {
			$c[$pri] = dechex(round($percent * $fg[$pri]) + ((1.0 - $percent) * $bg[$pri]));
			if ($c[$pri] == '0')
				$c[$pri] = '00';
		}

		return $c['r'].$c['g'].$c['b'];
	}

	function rrd_escape($value) {
		if ($this->graph_type == 'canvas') {
			# http://oss.oetiker.ch/rrdtool/doc/rrdgraph_graph.en.html#IEscaping_the_colon
			return str_replace(':', '\:', $value);
		} else {
			# php needs it double escaped to execute rrdtool correctly
			return str_replace(':', '\\\:', $value);
		}
	}

	function parse_filename($file) {
		if ($this->graph_type == 'canvas') {
			$file = 'rrd.php/' . str_replace($this->datadir . '/', '', $file);
			# rawurlencode all but /
			$file = str_replace('%2F', '/', rawurlencode($file));
		} else {
			# escape spaces
			$file = str_replace(' ', '\ ', $file);
		}
		return $this->rrd_escape($file);
	}

	function rrd_files() {
		$files = $this->get_filenames();

		foreach($files as $filename) {
			$basename=basename($filename,'.rrd');
			$instance = strpos($basename,'-')
				? substr($basename, strpos($basename,'-') + 1)
				: 'value';

			$this->tinstances[] = $instance;
			$this->files[$instance] = $filename;
		}

		sort($this->tinstances);
		ksort($this->files);
	}

	function get_filenames() {
		$identifier = sprintf('%s/%s%s%s%s%s/%s%s%s',
			$this->args['host'],
			$this->args['plugin'],
			strlen($this->args['category']) ? '-' : '', $this->args['category'],
			strlen($this->args['pinstance']) ? '-' : '', $this->args['pinstance'],
			$this->args['type'],
			strlen($this->args['tinstance']) ? '-' : '', $this->args['tinstance']
		);

		$wildcard = strlen($this->args['tinstance']) ? '.' : '[-.]*';

		$files = glob($this->datadir .'/'. $identifier . $wildcard . 'rrd');

		return $files;
	}

	function file2identifier($files) {
		foreach($files as $key => $file) {
			if (is_file($file)) {
				$files[$key] = preg_replace("#^$this->datadir/#u", '', $files[$key]);
				$files[$key] = preg_replace('#\.rrd$#', '', $files[$key]);
			}
		}

		return $files;
	}

	function rrd_graph($debug = false) {
		if (!$this->colors)
			$this->rainbow_colors();

		$graphdata = $this->rrd_gen_graph();

		$style = $debug !== false ? $debug : $this->graph_type;
		switch ($style) {
			case 'cmd':
				print '<pre>';
				foreach ($graphdata as $d) {
					printf("%s \\\n", $d);
				}
				print '</pre>';
			break;
			case 'canvas':
				printf('<canvas id="%s" class="rrd">', sha1(serialize($graphdata)));
				foreach ($graphdata as $d) {
					printf("%s\n", $d);
				}
				print '</canvas>';
			break;
			case 'debug':
			case 1:
				print '<pre>';
				print_r($graphdata);
				print '</pre>';
			break;
			case 'png':
			default:
				# caching
				if (is_numeric($this->cache) && $this->cache > 0)
					header("Expires: " . date(DATE_RFC822,strtotime($this->cache." seconds")));
				header("content-type: image/png");
				$graphdata = implode(' ', $graphdata);
				echo `$graphdata`;
			break;
		}
	}

	function rrd_options() {
		if ($this->graph_type != 'canvas') {
			$rrdgraph[] = $this->rrdtool;
			$rrdgraph[] = 'graph - -a PNG';
		}
		if ($this->rrdtool_opts != '')
			$rrdgraph[] = $this->rrdtool_opts;
		if ($this->graph_smooth)
			$rrdgraph[] = '-E';
		$rrdgraph[] = sprintf('-w %d', is_numeric($this->width) ? $this->width : 400);
		$rrdgraph[] = sprintf('-h %d', is_numeric($this->heigth) ? $this->heigth : 175);
		$rrdgraph[] = '-l 0';
		$rrdgraph[] = sprintf('-t "%s on %s"', $this->rrd_title, $this->args['host']);
		if ($this->rrd_vertical)
			$rrdgraph[] = sprintf('-v "%s"', $this->rrd_vertical);
		$rrdgraph[] = sprintf('-s e-%d', is_numeric($this->seconds) ? $this->seconds : 86400);

		return $rrdgraph;
	}

	function rrd_get_sources() {
		# is the source spread over multiple files?
		if (is_array($this->files) && count($this->files)>1) {
			# and must it be ordered?
			if (is_array($this->order)) {
				$this->tinstances = array_merge(array_intersect($this->order, $this->tinstances));
			}
			# use tinstances as sources
			if(is_array($this->data_sources) && count($this->data_sources)>1) {
				$sources = array();
				foreach($this->tinstances as $f) {
					foreach($this->data_sources as $s) {
						$sources[] = $f . '-' . $s;
					}
				}
			}
			else {
				$sources = $this->tinstances;
			}
		}
		# or one file with multiple data_sources
		else {
			if(is_array($this->data_sources) && count($this->data_sources)==1 && in_array('value', $this->data_sources)) {
				# use tinstances as sources
				$sources = $this->tinstances;
			} else {
				# use data_sources as sources
				$sources = $this->data_sources;
			}
		}
		$this->parse_ds_names($sources);
		return $sources;
	}

	function parse_ds_names($sources) {
		# fill ds_names if not defined by plugin
		if (!is_array($this->ds_names))
			$this->ds_names = array_combine($sources, $sources);

		# detect length of longest ds_name
		$max = 0;
		foreach ($this->ds_names as $ds_name) {
			if(strlen((string)$ds_name) > $max)
				$max = strlen((string)$ds_name);
		}

		# make all ds_names equal in lenght
		$format = sprintf("%%-%ds", $max);
		foreach ($this->ds_names as $index => $value) {
			$this->ds_names[$index] = sprintf($format, $value);
		}
	}

	function rrd_gen_graph() {
		$rrdgraph = $this->rrd_options();

		$sources = $this->rrd_get_sources();

		if ($this->scale)
			$raw = '_raw';
		else
			$raw = null;

		$i=0;
		foreach ($this->tinstances as $tinstance) {
			foreach ($this->data_sources as $ds) {
				$rrdgraph[] = sprintf('DEF:min_%s%s=%s:%s:MIN', crc32hex($sources[$i]), $raw, $this->parse_filename($this->files[$tinstance]), $ds);
				$rrdgraph[] = sprintf('DEF:avg_%s%s=%s:%s:AVERAGE', crc32hex($sources[$i]), $raw, $this->parse_filename($this->files[$tinstance]), $ds);
				$rrdgraph[] = sprintf('DEF:max_%s%s=%s:%s:MAX', crc32hex($sources[$i]), $raw, $this->parse_filename($this->files[$tinstance]), $ds);
				$i++;
			}
		}
		if ($this->scale) {
			$i=0;
			foreach ($this->tinstances as $tinstance) {
				foreach ($this->data_sources as $ds) {
					$rrdgraph[] = sprintf('CDEF:min_%s=min_%1$s_raw,%s,*', crc32hex($sources[$i]), $this->scale);
					$rrdgraph[] = sprintf('CDEF:avg_%s=avg_%1$s_raw,%s,*', crc32hex($sources[$i]), $this->scale);
					$rrdgraph[] = sprintf('CDEF:max_%s=max_%1$s_raw,%s,*', crc32hex($sources[$i]), $this->scale);
					$i++;
				}
			}
		}

		if(count($this->files)<=1) {
			$c = 0;
			foreach ($sources as $source) {
				$color = is_array($this->colors) ? (isset($this->colors[$source])?$this->colors[$source]:$this->colors[$c++]): $this->colors;
				$rrdgraph[] = sprintf('AREA:max_%s#%s', crc32hex($source), $this->get_faded_color($color));
				$rrdgraph[] = sprintf('AREA:min_%s#%s', crc32hex($source), 'ffffff');
				break; # only 1 area to draw
			}
		}

		$c = 0;
		foreach ($sources as $source) {
			$dsname = empty($this->ds_names[$source]) ? $source : $this->ds_names[$source];
			$color = is_array($this->colors) ? (isset($this->colors[$source])?$this->colors[$source]:$this->colors[$c++]): $this->colors;
			$rrdgraph[] = sprintf('"LINE1:avg_%s#%s:%s"', crc32hex($source), $this->validate_color($color), $this->rrd_escape($dsname));
			$rrdgraph[] = sprintf('"GPRINT:min_%s:MIN:%s Min,"', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('"GPRINT:avg_%s:AVERAGE:%s Avg,"', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('"GPRINT:max_%s:MAX:%s Max,"', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('"GPRINT:avg_%s:LAST:%s Last\\l"', crc32hex($source), $this->rrd_format);
		}

		return $rrdgraph;
	}
}

?>
