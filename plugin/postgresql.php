<?php

# Collectd Postgresql plugin
require_once 'modules/collectd.inc.php';

## LAYOUT
# postgresql-[instance]/pg_blks-heap_hit.rrd
# postgresql-[instance]/pg_blks-heap_read.rrd
# postgresql-[instance]/pg_blks-idx_hit.rrd
# postgresql-[instance]/pg_blks-idx_read.rrd
# postgresql-[instance]/pg_blks-tidx_hit.rrd
# postgresql-[instance]/pg_blks-tidx_read.rrd
# postgresql-[instance]/pg_blks-toast_hit.rrd
# postgresql-[instance]/pg_blks-toast_read.rrd
# postgresql-[instance]/pg_db_size.rrd
# postgresql-[instance]/pg_n_tup_c-del.rrd
# postgresql-[instance]/pg_n_tup_c-hot_upd.rrd
# postgresql-[instance]/pg_n_tup_c-ins.rrd
# postgresql-[instance]/pg_n_tup_c-upd.rrd

switch($_GET['t']) {
        case 'pg_db_size':
                require_once 'type/GenericStacked.class.php';
                $obj = new Type_GenericStacked($CONFIG);
                $obj->width = $width;
                $obj->heigth = $heigth;
                $obj->ds_names = array(
                        'value' => 'Size',
                );
                $obj->colors = array(
                        'value' => '0000ff',
                );
                $obj->rrd_title = sprintf('DB Size %s',
                        !empty($obj->args['pinstance']) ? $obj->args['pinstance'] : '');
                $obj->rrd_vertical = 'Size';
                $obj->rrd_format = '%5.1lf%s';
        break;
        case 'pg_blks':
                require_once 'type/GenericStacked.class.php';
                $obj = new Type_GenericStacked($CONFIG);
                $obj->width = $width;
                $obj->heigth = $heigth;
                $obj->generate_colors();

                $obj->rrd_title = sprintf('%s/%s', $obj->args['pinstance'], $obj->args['type']);
                $obj->rrd_vertical = 'Ops per second';
                $obj->rrd_format = '%5.1lf%s';
        break;
        case 'pg_n_tup_c':
                require_once 'type/GenericStacked.class.php';
                $obj = new Type_GenericStacked($CONFIG);
                $obj->width = $width;
                $obj->heigth = $heigth;
                $obj->generate_colors();

                $obj->rrd_title = sprintf('%s/%s', $obj->args['pinstance'], $obj->args['type']);
                $obj->rrd_vertical = 'Ops per second';
                $obj->rrd_format = '%5.1lf%s';
        break;

}


collectd_flush($obj->identifiers);
$obj->rrd_graph();
