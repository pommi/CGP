<?php

require_once 'Default.class.php';

class Type_GenericIO extends Type_Default {
	
	function rrd_gen_graph() {
		$rrdgraph = $this->rrd_options();

		$sources = $this->rrd_get_sources();

		if ($this->scale)
			$raw = '_raw';
		$i=0;
		foreach ($this->tinstances as $tinstance) {
			foreach ($this->data_sources as $ds) {
				$rrdgraph[] = sprintf('DEF:min_%s%s=%s:%s:MIN', crc32hex($sources[$i]), $raw, $this->files[$tinstance], $ds);
				$rrdgraph[] = sprintf('DEF:avg_%s%s=%s:%s:AVERAGE', crc32hex($sources[$i]), $raw, $this->files[$tinstance], $ds);
				$rrdgraph[] = sprintf('DEF:max_%s%s=%s:%s:MAX', crc32hex($sources[$i]), $raw, $this->files[$tinstance], $ds);
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

		$rrdgraph[] = sprintf('CDEF:overlap=avg_%s,avg_%s,LT,avg_%1$s,avg_%2$s,IF',
						crc32hex($sources[0]), crc32hex($sources[1]));

		foreach($sources as $source) {
			$rrdgraph[] = sprintf('AREA:avg_%s#%s', crc32hex($source), $this->get_faded_color($this->colors[$source]));
		}

		$rrdgraph[] = sprintf('AREA:overlap#%s',
			$this->get_faded_color(
				$this->get_faded_color($this->colors[$sources[0]]),
				$this->get_faded_color($this->colors[$sources[1]])
			)
		);

		foreach($sources as $source) {
			$dsname = $this->ds_names[$source] != '' ? $this->ds_names[$source] : $source;
			$rrdgraph[] = sprintf('LINE1:avg_%s#%s:\'%s\'', crc32hex($source), $this->colors[$source], $dsname);
			$rrdgraph[] = sprintf('GPRINT:min_%s:MIN:\'%s Min,\'', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:AVERAGE:\'%s Avg,\'', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:max_%s:MAX:\'%s Max,\'', crc32hex($source), $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:LAST:\'%s Last\l\'', crc32hex($source), $this->rrd_format);
		}
		
		return $rrdgraph;
	}
}

?>
