<?php

require_once 'config.php';

$skin_config_file = 'layout/skin/' . $CONFIG['ui_skin'] . '/config.php';
if (file_exists($skin_config_file)) {
	require_once $skin_config_file;
}

$CONFIG['webdir'] = preg_replace('/\/[a-z\.]+$/', '', $_SERVER['SCRIPT_FILENAME']);
$CONFIG['weburl'] = preg_replace('/(?<=\/)[a-z\.]+$/', '', $_SERVER['SCRIPT_NAME']);

if (!ini_get('date.timezone')) {
	date_default_timezone_set($CONFIG['default_timezone']);
}
