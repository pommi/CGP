<?php

# Collectd curl_json plugin

require_once 'conf/common.inc.php';
require_once 'inc/collectd.inc.php';
require_once 'type/Default.class.php';
$obj = new Type_Default($CONFIG);
    
switch($obj->args['type']) {
  #COUNTER type example
  case 'http_requests':
    $obj->data_sources = array('count'); 
    $obj->ds_names = array('count' => "PHP requests");
    $obj->colors['count'] = '00b000';
    unset($obj->ds_names['value']);   
    $obj->rrd_title = $obj->args['type'].' of '.$obj->args['pinstance'];
    $obj->rrd_vertical = 'con/s';
    break;
  
  #Insert other COUNTER type values here
  
  #By default values counted as GAUGE
  default:    
    $obj->rrd_title = $obj->args['type'].' of '.$obj->args['pinstance'];
    $obj->rrd_vertical = 'Count';    
    break;
}

$obj->rrd_format = '%5.1lf%s';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
