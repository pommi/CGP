<?php

require_once 'config.php';

$CONFIG['webdir'] = preg_replace('/\/[a-z\.]+$/', '', $_SERVER['SCRIPT_FILENAME']);
$CONFIG['weburl'] = preg_replace('/(?<=\/)[a-z\.]+$/', '', $_SERVER['SCRIPT_NAME']);

if (!ini_get('date.timezone')) {
	date_default_timezone_set($CONFIG['default_timezone']);
}
