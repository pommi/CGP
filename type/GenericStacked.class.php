<?php

require_once 'Default.class.php';

class Type_GenericStacked extends Type_Default {
	
	function rrd_gen_graph() {
		$rrdgraph = $this->rrd_options();

		if (is_array($this->args['tinstance']))
			if (is_array($this->order))
				$array = array_intersect($this->order, $this->args['tinstance']);
			else
				$array = $this->args['tinstance'];
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

		for ($i=count($array)-1 ; $i>=0 ; $i--) {
			if ($i == (count($array)-1))
				$rrdgraph[] = sprintf('CDEF:cdef%d=avg%d', $i, $i);
			else
				$rrdgraph[] = sprintf('CDEF:cdef%d=cdef%d,avg%d,+', $i, $i+1, $i);
		}

		$i=0;
		foreach ($array as $value) {
			$color = $this->get_faded_color($this->colors[$value]);
			$rrdgraph[] = sprintf('AREA:cdef%d#%s', $i, $color);
			$i++;
		}

		$i=0;
		foreach ($array as $value) {
			$dsname = $this->ds_names[$value] != '' ? $this->ds_names[$value] : $value;
			$rrdgraph[] = sprintf('LINE1:cdef%d#%s:\'%s\'', $i, $this->validate_color($this->colors[$value]), $dsname);
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
