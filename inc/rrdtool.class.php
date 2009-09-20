<?php

class RRDTool {
	var $width = 175;
	var $height = 125;

	function rrd_info($rrdfile) {
		if (file_exists($rrdfile)) {
			$raw_info = shell_exec('/usr/bin/rrdtool info '.$rrdfile);
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
