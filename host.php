<?php

    require_once 'conf/common.inc.php';
    require_once 'inc/html.inc.php';
    require_once 'inc/collectd.inc.php';

    $host = validate_get(GET('h'), 'host');
    $plugin = validate_get(GET('p'), 'plugin');

    // check for multiple hosts
    if(strpos($host, ',') !== 0){
        $hosts = explode(',', $host);
    } else {
        $hosts = array($host);
    }

    $selected_plugins = !$plugin ? $CONFIG['overview'] : array($plugin);

    html_start();

    // get all of the available plugins for all of the hosts
    $plugins = array();
    foreach($hosts as $k => $host):
        $plugins = array_merge($plugins, collectd_plugins($host));
    endforeach;

        echo '<div class="row-fluid">';

            echo '<div class="span2">';
            list_plugins($plugins, $hosts, $CONFIG);
            echo '</div>';

            echo '<div class="span10">';
            $args = $_GET;
            echo '<br /><ul class="inline">';
            foreach($CONFIG['term'] as $key => $s) {
                $args['s'] = $s;
                $selected = selected_timerange($seconds, $s);
                printf('<li><a %s href="%s%s">%s</a></li>'."\n",
                    $selected, $CONFIG['weburl'], build_url('host.php', $args), $key);
            }
            echo '</ul>';
            foreach($hosts as $k => $host){
                if(!empty($plugin) && !in_array($plugin, collectd_plugins($host)))
                    continue;
                printf('<h2><a href="%shost.php?h=%s">%s</a></h2>', $CONFIG['weburl'], $host, $host);
                foreach ($selected_plugins as $selected_plugin) {
                    if (empty($plugin) || in_array($selected_plugin, $plugins)) {
                        echo '<div class="row-fluid">';
                            plugin_header($host, $selected_plugin);
                            graphs_from_plugin($host, $selected_plugin, empty($plugin));
                        echo '</div>';
                    }
                }
            }
            echo '</div>';

        echo '</div>';

    html_end();
