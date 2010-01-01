<?php

# global functions

function validate_get($value, $type) {
	switch($type) {
		case 'host':
			if (!preg_match('/^[\d\w\W]+$/', $value))
				return NULL;
		break;
		case 'plugin':
		case 'type':
			if (!preg_match('/^\w+$/', $value))
				return NULL;
		break;
		case 'pinstance':
		case 'tinstance':
			if (!preg_match('/^[\d\w-]+$/', $value))
				return NULL;
		break;
	}

	return $value;
}


?>
