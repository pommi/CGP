<?php

include_once 'conf/common.inc.php';
include_once 'inc/collectd.inc.php';
require_once 'inc/html.inc.php';

html_start();

$h = array();

# show all categorized hosts
if (is_array($CONFIG['cat'])) {
	foreach($CONFIG['cat'] as $cat => $hosts) {
		printf("<h2>%s</h2>\n", $cat);
		host_summary($hosts);
		$h = array_merge($h, $hosts);
	}
}

# search for uncategorized hosts
if(!$chosts = collectd_hosts())
	printf('<p class="warn">Error: No Collectd hosts found in <em>%s</em></p>', $CONFIG['datadir']);
$uhosts = array_diff($chosts, $h);

# show all uncategorized hosts
if ($uhosts) {
	echo "<h2>uncategorized</h2>\n";
	host_summary($uhosts);
}

html_end();

?>
