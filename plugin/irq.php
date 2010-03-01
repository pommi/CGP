<?php

# Collectd IRQ plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';
require_once 'inc/collectd.inc.php';

## LAYOUT
# irq/
# irq/irq-XX.rrd

$obj = new Type_GenericStacked($CONFIG);
$obj->width = $width;
$obj->heigth = $heigth;
$obj->generate_colors();

$obj->rrd_title = 'Interrupts';
$obj->rrd_vertical = 'IRQs/s';
$obj->rrd_format = '%6.1lf';

collectd_flush($obj->identifiers);
$obj->rrd_graph();

?>
