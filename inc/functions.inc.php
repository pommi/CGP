<?php

# global functions

function GET($index = NULL, $value = NULL) {
	# parse all values from $_GET when no index is given
	if ($index === NULL) {
		$arr = array();
		foreach($_GET as $i => $v) {
			$arr[$i] = GET($i);
		}
		return $arr;
	}

	if (!isset($_GET[$index]))
		return NULL;

	if ($value === NULL)
		$value = $_GET[$index];

	$desc = array(
		'h'  => 'host',
		'p'  => 'plugin',
		'c'  => 'category',
		't'  => 'type',
		'pi' => 'plugin instance',
		'ti' => 'type instance',
		's'  => 'seconds',
		'x'  => 'x-axis',
		'y'  => 'y-axis',
	);

	switch($index) {
		case 'h': # host
		case 'pi': # plugin instance
		case 'ti': # type instance
			if (!preg_match('/^[\w-.: ]+$/u', $value)) {
				error_log(sprintf('Invalid %s in $_GET["%s"]: "%s"', $desc[$index], $index, $value));
				return NULL;
			}
		break;
		case 'p': # plugin
		case 'c': # category
		case 't': # type
			if (!preg_match('/^\w+$/u', $value)) {
				error_log(sprintf('Invalid %s in $_GET["%s"]: "%s"', $desc[$index], $index, $value));
				return NULL;
			}
		break;
		case 's': # seconds
		case 'x': # x-axis
		case 'y': # y-axis
			if (!is_numeric($value)) {
				error_log(sprintf('Invalid %s in $_GET["%s"]: "%s"', $desc[$index], $index, $value));
				return NULL;
			}
		break;
		default:
			return NULL;
		break;
	}

	return $value;
}

function validateRRDPath($base, $path) {
	$base = preg_replace('/\/$/', '', $base);

	# resolve possible symlink
	$base = realpath($base);

	$realpath = realpath(sprintf('%s/%s', $base, $path));

	if (strpos($realpath, $base) === false)
		return false;

	if (strpos($realpath, $base) !== 0)
		return false;

	if (!preg_match('/\.rrd$/', $realpath))
		return false;

	return $realpath;
}

function crc32hex($str) {
	return sprintf("%x",crc32($str));
}

function error_image() {
	header("Content-Type: image/png", true, 400);
	readfile('layout/error.png');
	exit;
}
