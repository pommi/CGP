<?php

# Collectd IRQ plugin

require_once 'conf/common.inc.php';
require_once 'type/GenericStacked.class.php';

## LAYOUT
# irq/
# irq/irq-XX.rrd

$obj = new Type_GenericStacked($CONFIG, $_GET);

$obj->rrd_title = 'Interrupts';
$obj->rrd_vertical = 'IRQs/s';
$obj->rrd_format = '%6.1lf';

$obj->rrd_graph();
