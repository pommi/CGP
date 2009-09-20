<?php

require_once 'Default.class.php';

class Type_GenericIO extends Type_Default {
	
	function rrd_gen_graph() {
		$filename = $this->get_filename();

		$rrdgraph[] = '/usr/bin/rrdtool graph - -a PNG';
		$rrdgraph[] = sprintf('-w %d', is_numeric($this->width) ? $this->width : 400);
		$rrdgraph[] = sprintf('-h %d', is_numeric($this->heigth) ? $this->heigth : 175);
		$rrdgraph[] = '-l 0';
		$rrdgraph[] = sprintf('-t "%s"', $this->rrd_title);
		$rrdgraph[] = sprintf('-v "%s"', $this->rrd_vertical);
		$rrdgraph[] = sprintf('-s -%d', is_numeric($this->seconds) ? $this->seconds : 86400);

		if ($this->scale)
			$raw = '_raw';
		foreach($this->data_sources as $ds) {
			$rrdgraph[] = sprintf('DEF:min_%s%s=%s:%s:MIN', $ds, $raw, $filename, $ds);
			$rrdgraph[] = sprintf('DEF:avg_%s%s=%s:%s:AVERAGE', $ds, $raw, $filename, $ds);
			$rrdgraph[] = sprintf('DEF:max_%s%s=%s:%s:MAX', $ds, $raw, $filename, $ds);
		}
		if ($this->scale) {
			foreach($this->data_sources as $ds) {
				$rrdgraph[] = sprintf('CDEF:min_%s=min_%s_raw,%s,*', $ds, $ds, $this->scale);
				$rrdgraph[] = sprintf('CDEF:avg_%s=avg_%s_raw,%s,*', $ds, $ds, $this->scale);
				$rrdgraph[] = sprintf('CDEF:max_%s=max_%s_raw,%s,*', $ds, $ds, $this->scale);
			}
		}

		$rrdgraph[] = sprintf('CDEF:overlap=avg_%s,avg_%s,LT,avg_%1$s,avg_%2$s,IF',
						$this->data_sources[0], $this->data_sources[1]);

		foreach($this->data_sources as $ds) {
			$rrdgraph[] = sprintf('AREA:avg_%s#%s', $ds, $this->get_faded_color($this->colors[$ds]));
		}

		$rrdgraph[] = sprintf('AREA:overlap#%s',
			$this->get_faded_color(
				$this->get_faded_color($this->colors[$this->data_sources[0]]),
				$this->get_faded_color($this->colors[$this->data_sources[1]])
			)
		);

		foreach($this->data_sources as $ds) {
			$rrdgraph[] = sprintf('LINE1:avg_%s#%s:\'%s\'', $ds, $this->colors[$ds], $this->ds_names[$ds]);
			$rrdgraph[] = sprintf('GPRINT:min_%s:MIN:\'%s Min,\'', $ds, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:AVERAGE:\'%s Avg,\'', $ds, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:max_%s:MAX:\'%s Max,\'', $ds, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:LAST:\'%s Last\l\'', $ds, $this->rrd_format);
		}
		
		return $rrdgraph;
	}
}

?>
