How To Use
----------

In your config.local.php, define the plugins you want to use on the overview page

```php
$CONFIG['overview'] = array('interface', 'load', 'memory', 'sensors');
```

Now the interface plugin shows graphs errors, packets and octets for each interface.
I have eth0 and wlan0. On the overview page, I want to see the octets graph for wlan0 only.
By examining the interface plugin page, I determine the parameters for filtering the wlan0
graph.

http://SERVER/detail.php?p=interface&c=&pi=&t=if_octets&ti=wlan0&h=raijin&s=86400

They are **t=if_octects** and **ti=wlan0**. Thus, I set the filter for the interface plugin:

```php
$CONFIG['overview_filter']['interface'] = array('ti' => 'wlan0', 't' => 'if_octets');
```

One more example - I want to put a sensors graph on the overview page.

http://SERVER/detail.php?p=sensors&c=&pi=coretemp-isa-0000&t=temperature&h=raijin&s=86400

Parameters are **pi=coretemp-isa-0000** and **t=temperature**. So:

```php
$CONFIG['overview_filter']['sensors'] = array('t' => 'temperature', 'pi' => 'coretemp-isa-0000');
```
