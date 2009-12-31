<?php

# Collectd Default type

class Type_Default {
	var $datadir;
	var $args;
	var $data_sources;
	var $order;
	var $ds_names;
	var $colors;
	var $rrd_title;
	var $rrd_vertical;
	var $rrd_format;
	var $scale;
	var $width;
	var $heigth;

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

		$fg[r] = hexdec(substr($fgc,0,2));
		$fg[g] = hexdec(substr($fgc,2,2));
		$fg[b] = hexdec(substr($fgc,4,2));
		$bg[r] = hexdec(substr($bgc,0,2));
		$bg[g] = hexdec(substr($bgc,2,2));
		$bg[b] = hexdec(substr($bgc,4,2));

		foreach ($rgb as $pri) {
			$c[$pri] = dechex(round($percent * $fg[$pri]) + ((1.0 - $percent) * $bg[$pri]));
			if ($c[$pri] == '0')
				$c[$pri] = '00';
		}

		return $c[r].$c[g].$c[b];
	}

	function identifier($host, $plugin, $pinst, $type, $tinst) {
		$identifier = sprintf('%s/%s%s%s/%s%s%s', $host,
			$plugin, strlen($pinst) ? '-' : '', $pinst,
			$type, strlen($tinst) ? '-' : '', $tinst);

		if (is_file($this->datadir.'/'.$identifier.'.rrd'))
			return $identifier;
		else
			return FALSE;
	}

	function get_filename($tinstance=NULL) {
		if (!is_array($this->args['tinstance']) && $tinstance == NULL)
			$tinstance = $this->args['tinstance'];

		$identifier = $this->identifier($this->args['host'],
				$this->args['plugin'], $this->args['pinstance'],
				$this->args['type'], $tinstance);

		return $this->datadir.'/'.$identifier.'.rrd';
	}

	function rrd_graph($debug=false) {
		$graphdata = $this->rrd_gen_graph();
		
		if(!$debug) {
			# caching
			header("Expires: " . date(DATE_RFC822,strtotime("90 seconds")));
			header("content-type: image/png");
			$graphdata = implode(' ', $graphdata);
			echo `$graphdata`;
		} else {
			print '<pre>';
			print_r($graphdata);
			print '</pre>';
		}
	}

	function rrd_options() {
		$rrdgraph[] = '/usr/bin/rrdtool graph - -a PNG';
		$rrdgraph[] = sprintf('-w %d', is_numeric($this->width) ? $this->width : 400);
		$rrdgraph[] = sprintf('-h %d', is_numeric($this->heigth) ? $this->heigth : 175);
		$rrdgraph[] = '-l 0';
		$rrdgraph[] = sprintf('-t "%s on %s"', $this->rrd_title, $this->args['host']);
		$rrdgraph[] = sprintf('-v "%s"', $this->rrd_vertical);
		$rrdgraph[] = sprintf('-s -%d', is_numeric($this->seconds) ? $this->seconds : 86400);

		return $rrdgraph;
	}

	function rrd_gen_graph() {
		$filename = $this->get_filename();

		$rrdgraph = $this->rrd_options();

		if (is_array($this->args['tinstance']))
			$array = is_array($this->order) ? $this->order : $this->args['tinstance'];
		else
			$array = $this->data_sources;

		$i=0;
		foreach ($array as $value) {
			if (is_array($this->args['tinstance'])) {
				$filename = $this->get_filename($value);
				$ds = $this->data_sources[0];
			} else {
				$filename = $this->get_filename();
				$ds = $value;
			}
			$rrdgraph[] = sprintf('DEF:min%s=%s:%s:MIN', $i, $filename, $ds);
			$rrdgraph[] = sprintf('DEF:avg%s=%s:%s:AVERAGE', $i, $filename, $ds);
			$rrdgraph[] = sprintf('DEF:max%s=%s:%s:MAX', $i, $filename, $ds);
			$i++;
		}

		if (!is_array($this->args['tinstance'])) {
			$rrdgraph[] = sprintf('AREA:max0#%s', $this->get_faded_color($this->colors[$this->data_sources[0]]));
			$rrdgraph[] = sprintf('AREA:min0#%s', 'ffffff');
		}

		$i=0;
		foreach ($array as $value) {
			$dsname = $this->ds_names[$value] != '' ? $this->ds_names[$value] : $value;
			$color = is_array($this->colors) ? $this->colors[$value]: $this->colors;
			$rrdgraph[] = sprintf('LINE1:avg%d#%s:\'%s\'', $i, $this->validate_color($color), $dsname);
			$rrdgraph[] = sprintf('GPRINT:min%d:MIN:\'%s Min,\'', $i, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg%d:AVERAGE:\'%s Avg,\'', $i, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:max%d:MAX:\'%s Max,\'', $i, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg%d:LAST:\'%s Last\\l\'', $i, $this->rrd_format);
			$i++;
		}
	
		return $rrdgraph;
	}
}

?>
