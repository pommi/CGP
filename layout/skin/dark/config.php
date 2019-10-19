<?php

class Skin extends Base {
	# Basic rrdtool graph colors
	var $rrdtool_colors = array(
		'CANVAS' => '33393a',
		'BACK' => '2e3436',
		'FONT' => 'ffffff',
		'SHADEA' => '33393a',
		'SHADEB' => '263032',
	);

	function __construct($config, $_get) {
		Base::__construct($config, $_get);

		$this->plugin_colors['load'] = array(
			'shortterm' => '3366ff',
			'midterm' => 'ffcc66',
			'longterm' => 'ff3333',
		);
		$this->plugin_colors['cpu'] = array(
			'idle' => '171717',
			'nice' => '66ff66',
			'user' => '3366ff',
			'wait' => 'ffb033',
			'system' => 'ff3333',
			'steal' => 'ffffff',
		);
		$this->plugin_colors['processes-ps_state'] = array(
			'paging' => 'ffb066',
			'blocked' => 'ff66ff',
			'zombies' => 'ff3333',
			'stopped' => 'a033a0',
			'running' => '66ff66',
			'sleeping' => '3366ff',
			'value' => 'f0a000',
		);
		$this->plugin_colors['memory'] = array(
			'options' => array(
				'area_lines' => false,
			),
			'free' => '1e541a',
			'cached' => '308729',
			'buffered' => '42ba39',
			'locked' => '54ec48',
			'used' => '75ec6c', #'54ec48',
		);
		$this->plugin_colors['swap'] = array(
			'options' => array(
				'area_lines' => false,
			),
			'free' => '37344f',
			'cached' => '5d39ba',
			'used' => '9775ed',
		);
		$this->plugin_colors['swap-swap_io'] = array(
			'out' => '3366ff',
			'in' => '33ff33',
		);
		$this->plugin_colors['df'] = array(
			'reserved' => '333333',
			'free' => '3a657d',
			'used' => '57c2ff',
		);
		$this->plugin_colors['disk'] = array(
			'read' => '48c4ec',
			'write' => 'ea644a',
		);
		$this->plugin_colors['interface'] = array(
			'rx' => '3399ff',
			'tx' => 'ffff44',
		);
		$this->plugin_colors['conntrack'] = array( 'value' => '66ccff' );
		$this->plugin_colors['contextswitch'] = array( 'value' => '66ccff' );
		$this->plugin_colors['entropy'] = array( 'value' => '66ccff' );
		$this->plugin_colors['uptime'] = array( 'value' => '66ff66' );
		$this->plugin_colors['users'] = array( 'value' => '66ccff' );
	}

	# Private helper functions

	# http://stackoverflow.com/a/3597447
	private function _HSVtoRGB($H, $S, $V) {
		//1
		$H *= 6;
		//2
		$I = floor($H);
		$F = $H - $I;
		//3
		$M = $V * (1 - $S);
		$N = $V * (1 - $S * $F);
		$K = $V * (1 - $S * (1 - $F));
		//4
		switch ($I) {
		case 0:
			list($R,$G,$B) = array($V,$K,$M);
			break;
		case 1:
			list($R,$G,$B) = array($N,$V,$M);
			break;
		case 2:
			list($R,$G,$B) = array($M,$V,$K);
			break;
		case 3:
			list($R,$G,$B) = array($M,$N,$V);
			break;
		case 4:
			list($R,$G,$B) = array($K,$M,$V);
			break;
		case 5:
		case 6: //for when $H=1 is given
			list($R,$G,$B) = array($V,$M,$N);
			break;
		}
		return array($R, $G, $B);
	}

	# Skin override functions

	function rainbow_colors() {
		$c = 0;
		$sources = count($this->rrd_get_sources());
		$sat = 0.75;
		$val = 1.0;
		foreach ($this->rrd_get_sources() as $ds) {
			$h = $sources > 1 ? 360 - ($c * (330/($sources-1))) : 360;
			$h = ($h %= 360);
			$hex = '';
			foreach($this->_HSVtoRGB($h / 360, $sat, $val) as $j) {
				$hex .= sprintf('%02x', $j * 255);
			}
			$this->colors[$ds] = $hex;
			$c++;
		}
	}

	function get_faded_color($type, $fgc, $bgc=null, $percent=0.25) {
		if ($bgc === null) {
			$bgc = $this->rrd_canvas_color();
		}

		$rgb = array('r', 'g', 'b');

		$fg['r'] = hexdec(substr($fgc,0,2));
		$fg['g'] = hexdec(substr($fgc,2,2));
		$fg['b'] = hexdec(substr($fgc,4,2));
		$bg['r'] = hexdec(substr($bgc,0,2));
		$bg['g'] = hexdec(substr($bgc,2,2));
		$bg['b'] = hexdec(substr($bgc,4,2));

		foreach ($rgb as $pri) {
			switch ($type) {
				case 'area':
					$diff = (255 - $bg[$pri]) - $fg[$pri];
					$diff = round($percent * $diff);
					if ($diff > 50) { $diff = 50; }
					$c[$pri] = dechex(
						$fg[$pri] + $diff
					);
					if ($c[$pri] == '0')
						$c[$pri] = '00';
					break;
				default:
					$c[$pri] = sprintf('%02x', round($percent * $fg[$pri]) + ((1.0 - $percent) * $bg[$pri]));
					break;
			}
		}

		return $c['r'].$c['g'].$c['b'];
	}
}

?>
