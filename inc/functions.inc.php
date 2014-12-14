<?php

# global functions

function GET($index) {
	if (isset($_GET[$index]))
		return $_GET[$index];
	return null;
}

function validate_get($value, $type) {
	switch($type) {
		case 'host':
			if (!preg_match('/^[\w-.]+$/u', $value))
				return NULL;
		break;
		case 'plugin':
		case 'category':
		case 'type':
			if (!preg_match('/^\w+$/u', $value))
				return NULL;
		break;
		case 'pinstance':
		case 'tinstance':
			if (!preg_match('/^[\w-]+$/u', $value))
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
