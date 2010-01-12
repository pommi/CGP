<?php

class RRDTool {
	var $rrdtool = '/usr/bin/rrdtool';

	function __construct($rrdtool) {
		if (file_exists($rrdtool)) {
			$this->rrdtool = $rrdtool;
		} else {
			printf('<p class="warn">Error: RRDTool (<em>%s</em>) is not executable. Please install RRDTool it and configure <em>$CONFIG[\'rrdtool\'].</em></p>', $rrdtool);
			die();
		}
	}

	function rrd_info($rrdfile) {
		if (file_exists($rrdfile)) {
			$raw_info = shell_exec($this->rrdtool.' info '.$rrdfile);
			$raw_array = explode("\n", $raw_info);
			foreach ($raw_array as $key => $info) {
				if ($info != "") {
					$item_info = explode(" = ", $info);
					$item_info[1] = preg_replace('/"/', '', $item_info[1]);
					$info_array[$item_info[0]] = $item_info[1];
				}
			}
			return($info_array);
		} else {
			return false;
		}
	}
}

?>
