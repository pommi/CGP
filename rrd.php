<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/html.inc.php';

$file_name = basename(__FILE__); 
$path = $_SERVER['PHP_SELF'];
$path_args  = strpos($path, $file_name);
$path_info = substr($path, $path_args + strlen($file_name));

if ($file = validateRRDPath($CONFIG['datadir'], $path_info)) {
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.basename($file));
	header("Expires: " .date(DATE_RFC822,strtotime($CONFIG['cache']." seconds")));
    ob_clean();
    flush();
    readfile($file);
} else {
	header('HTTP/1.0 403 Forbidden');

	html_start();
	echo <<<EOT
<h2>Forbidden</h2>
<p><a href="{$CONFIG['weburl']}">Return home...</a></p>

EOT;
	html_end();
}
