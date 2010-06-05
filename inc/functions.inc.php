<?php

# global functions

function validate_get($value, $type) {
	switch($type) {
		case 'host':
			if (!preg_match('/^[\d\w\W]+$/u', $value))
				return NULL;
		break;
		case 'plugin':
		case 'type':
			if (!preg_match('/^\w+$/u', $value))
				return NULL;
		break;
		case 'pinstance':
		case 'tinstance':
			if (!preg_match('/^[\d\w-]+$/u', $value))
				return NULL;
		break;
	}

	return $value;
}

function crc32hex($str) {
	return sprintf("%x",crc32($str));
}

function error_image() {
	header("Content-Type: image/png");
	readfile('layout/error.png');
	exit;
}

?>
