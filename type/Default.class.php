<?php

require_once 'Base.class.php';

class Type_Default extends Type_Base {

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
