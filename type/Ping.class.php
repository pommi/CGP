<?php

require_once 'Base.class.php';

class Type_Ping extends Type_Base {

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

		# Draw shaded areas when some or all hosts are down
		$files_count = count($this->files);
		$files_present_def = 'CDEF:files_present=';
		$i=0;
		foreach ($this->files as $file) {
			$files_present_def .= sprintf('avg_%1$s,UN,1,avg_%1$s,IF,0,GT,', crc32hex($sources[$i++]));
		}
		$files_present_def .= (($files_count > 1) ? (implode(',', array_fill(0, ($files_count - 1), '+'))) : '0,+');
		$rrdgraph[] = $files_present_def;
		$rrdgraph[] = sprintf('CDEF:files_missing=%d,files_present,-', $files_count);
		$files_missing_colors = array('54ec4833', 'ecd74866', 'ea644aaa');
		for ($i = 0; $i < 3; $i++) {
			if ($i <= 1) {
				if ($files_count <= ($i + 1)) {
					continue;
				}
				$lower = $i;
				$upper = ($i == 0) ? 1 : ($files_count - 1);
			} else {
				$lower = ($files_count - 1);
				$upper = $files_count;
			}
			$rrdgraph[] = sprintf('CDEF:missing_%d=files_missing,%d,LE,UNKN,files_missing,%d,LE,INF,UNKN,IF,IF', $i, $lower, $upper);
			$rrdgraph[] = sprintf('AREA:missing_%d#%s', $i, $files_missing_colors[$i]);
		}

		if ($this->graph_minmax) {
			$c = 0;
			foreach ($sources as $source) {
				$color = is_array($this->colors) ? (isset($this->colors[$source])?$this->colors[$source]:$this->colors[$c++]): $this->colors;
				$rrdgraph[] = sprintf('LINE1:max_%s#%s', crc32hex($source), $this->get_faded_color($color));
				$rrdgraph[] = sprintf('LINE1:min_%s#%s', crc32hex($source), $this->get_faded_color($color));
			}
		}

		$c = 0;
		foreach ($sources as $source) {
			$legend = empty($this->legend[$source]) ? $source : $this->legend[$source];
			$color = is_array($this->colors) ? (isset($this->colors[$source])?$this->colors[$source]:$this->colors[$c++]): $this->colors;
			$rrdgraph[] = sprintf('LINE1:avg_%s#%s:%s', crc32hex($source), $this->validate_color($color), $this->rrd_escape($legend));
			$rrdgraph[] = sprintf('GPRINT:min_%s:MIN:%s Min,', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:AVERAGE:%s Avg,', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:max_%s:MAX:%s Max,', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:LAST:%s Last\\l', crc32hex($source), $this->rrd_format);
		}

		return $rrdgraph;
	}
}

?>
