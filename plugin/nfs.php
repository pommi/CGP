<?php

# Collectd NFS plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';


# Check http://github.com/octo/collectd/blob/master/src/nfs.c

## LAYOUT
# nfs-XX/nfs_procedure-YY.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->data_sources = array('value');
switch($obj->args['pinstance']) {
    case 'v2client':
        $obj->order = array('create', 'fsstat', 'getattr', 'link', 'lookup', 'mkdir', 'null', 'readdir', 'readlink', 'read', 'remove', 'rename', 'rmdir', 'root', 'setattr', 'symlink', 'wrcache', 'write');
    break;

    case 'v3client':
        $obj->order = array('access', 'commit', 'create', 'fsinfo', 'fsstat', 'getattr', 'link', 'lookup', 'mkdir', 'mknod', 'null', 'pathconf', 'read', 'readdir', 'readdirplus', 'readlink', 'remove', 'rename', 'rmdir', 'setattr', 'symlink', 'write');
    break;
}

$obj->width = $width;
$obj->heigth = $heigth;

$obj->rrd_title = sprintf('NFS-%s Procedures', $obj->args['pinstance']);
$obj->rrd_vertical = 'Procedures';
$obj->rrd_format = '%5.2lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();
