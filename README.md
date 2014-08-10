Collectd Graph Panel (CGP)
==========================
Collectd Graph Panel (CGP) is a graphical web-based front-end for visualizing
RRD collected by [collectd][collectd], written in the PHP language.

The latest version of CGP can be found on https://github.com/pommi/CGP. When you
have improvements or fixes, do not hesitate to send a pull request!

Requirements
------------
CGP has the following hard requirements:

 - Web server with PHP 5.0 support.
 - `rrdtool` program, expected at `/usr/bin/rrdtool` (can be changed in the
   configuration file, `$CONFIG['rrdtool']`).
 - `shell_exec` must not be disabled through the [`disable_functions` ini
   directive][ini.disable_functions]. It must allow execution of the `rrdtool`
   program.

The following software is optional, but nevertheless highly recommended:

 - [PHP JSON extension][php-json]: for a finer representation of the data in the
   graph. These representations can be found in the `plugins/` directory.
 - Web browser with `canvas` support such as IE 9+, Firefox, Chrome, Opera 9+.
   Optional unless you use `$CONFIG['graph_type'] = 'canvas'`.

Installation and configuration
------------------------------
CGP is designed to run out of the box. If you want to modify some configuration
settings, please create `conf/config.local.php` to overrule the settings from
`conf/config.php`.

In a default configuration, the server will execute `rrdtool` to draw PNG
graphs. These pictures are static and can put quite a burden on the server. For
more flexibility, set `$CONFIG['graph_type'] = 'canvas'`. This will make web
browsers download the RRD files and allows the user to zoom and move though the
history using their pointer device.

See [doc/nginx.conf](doc/nginx.conf) for an example configuration for the nginx
web server. The `.htaccess` file in the top-level directory can serve as a guide
for Apache configuration.

Performance tips
----------------
Although the default configuration "just works", you can further improve your
set up to reduce data usage and CPU time:

 - Enable gzip compression and caching (for at least RRD data files, SVG
   pictures and Javascript files. The canvas graph type downloads each RRD data
   file which are quite large (considering their quantity). Savings of 70% - 80%
   can be achieved for RRD data files.
 - Set `$CONFIG['rrd_url']` to a directory directly accessible by the web server
   such that it can provide better cache control than PHP.
 - Instead of the default `png` graph type, consider `canvas` to relieve the web
   server. This moves the image processing to the client that views the picture.
 - Disable the `open_basedir` setting of PHP, or at least put the RRD data dir
   in the beginning. When enabled, PHP (at least 5.5.14) scans though every
   path component which is quite costly if you have over 100 RRD files and a
   deep directory hierarchy. 17 seconds was observed for four path components
   (with `.` at the end), this dropped down to 4.8 seconds when prepending the
   RRD data directory to the beginning. When disabled, processing took less than
   a second.

License
-------
CGP is released under the terms of GPL version 3. See [doc/LICENSE](doc/LICENSE)
for the full license text.

Acknowledgements
----------------
CGP is authored by Pim van den Berg with contributions from many other people.

Canvas support depends on jsrrdgraph by Manuel Luis,
https://github.com/manuelluis/jsrrdgraph

 [collectd]: http://collectd.org/
 [ini.disable_functions]: http://php.net/ini.core#ini.disable-functions
 [php-json]: http://php.net/json
