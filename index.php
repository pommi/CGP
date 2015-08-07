<?php

include_once 'conf/common.inc.php';
include_once 'inc/collectd.inc.php';
require_once 'inc/html.inc.php';

html_start();

$h = array();

# show all categorized hosts
if (isset($CONFIG['cat']) && is_array($CONFIG['cat'])) {
	foreach($CONFIG['cat'] as $cat => $hosts) {
		host_summary($cat, $hosts);
		$h = array_merge($h, $hosts);
	}
}

# search for uncategorized hosts
if(!$chosts = collectd_hosts())
	printf('<p class="warn">Error: No Collectd hosts found in <em>%s</em></p>', $CONFIG['datadir']);
$uhosts = array_diff($chosts, $h);

# show all uncategorized hosts
if ($uhosts) {
	host_summary('uncategorized', $uhosts);
}

if ($CONFIG['showtime']) {
	echo <<<EOT
<script>
jQuery(document).ready(function() {
  jQuery("time.timeago").timeago();
});
</script>

EOT;
}

html_end(true);
