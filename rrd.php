<?php

require_once 'conf/common.inc.php';
require_once 'inc/functions.inc.php';
require_once 'inc/html.inc.php';

if ($file = validateRRDPath($CONFIG['datadir'], $_SERVER['PATH_INFO'])) {
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.basename($file));
	header("Expires: " .date(DATE_RFC822,strtotime($CONFIG['cache']." seconds")));
	if(ob_get_length()) ob_clean();
	flush();
	readfile($file);
} else {
	header('HTTP/1.0 403 Forbidden');

	html_start();
	echo <<<EOT
<fieldset id="forbidden">
<legend>forbidden</legend>
<p><a href="{$CONFIG['weburl']}">Return home...</a></p>
</fieldset>

EOT;
	html_end();
}
