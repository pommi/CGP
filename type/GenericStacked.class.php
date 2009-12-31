<?php

require_once 'Default.class.php';

class Type_GenericStacked extends Type_Default {

	function rrd_gen_graph() {
		$rrdgraph = $this->rrd_options();

		$sources = $this->rrd_get_sources();

		$i=0;
		foreach ($this->tinstances as $tinstance) {
			foreach ($this->data_sources as $ds) {
				$rrdgraph[] = sprintf('DEF:min_%s=%s:%s:MIN', $sources[$i], $this->files[$tinstance], $ds);
				$rrdgraph[] = sprintf('DEF:avg_%s=%s:%s:AVERAGE', $sources[$i], $this->files[$tinstance], $ds);
				$rrdgraph[] = sprintf('DEF:max_%s=%s:%s:MAX', $sources[$i], $this->files[$tinstance], $ds);
				$i++;
			}
		}

		for ($i=count($sources)-1 ; $i>=0 ; $i--) {
			if ($i == (count($sources)-1))
				$rrdgraph[] = sprintf('CDEF:area_%s=avg_%1$s', $sources[$i]);
			else
				$rrdgraph[] = sprintf('CDEF:area_%s=area_%s,avg_%1$s,+', $sources[$i], $sources[$i+1]);
		}

		foreach ($sources as $source) {
			$color = $this->get_faded_color($this->colors[$source]);
			$rrdgraph[] = sprintf('AREA:area_%s#%s', $source, $color);
		}

		foreach ($sources as $source) {
			$dsname = $this->ds_names[$source] != '' ? $this->ds_names[$source] : $source;
			$rrdgraph[] = sprintf('LINE1:area_%s#%s:\'%s\'', $source, $this->validate_color($this->colors[$source]), $dsname);
			$rrdgraph[] = sprintf('GPRINT:min_%s:MIN:\'%s Min,\'', $source, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:AVERAGE:\'%s Avg,\'', $source, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:max_%s:MAX:\'%s Max,\'', $source, $this->rrd_format);
			$rrdgraph[] = sprintf('GPRINT:avg_%s:LAST:\'%s Last\\l\'', $source, $this->rrd_format);
		}

		return $rrdgraph;
	}
}

?>
