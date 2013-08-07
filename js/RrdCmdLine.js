/**
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; either version 2 of the License, or (at your option)
 * any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
 * more details.

 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA

 *
 * Manuel Sanmartin <manuel.luis at gmail.com>
 **/

"use strict";

/**
 * RrdCmdLine
 * @constructor
 */
var RrdCmdLine = function() {
	// if (arguments.lenght === 3) // XXX
  this.init.apply(this, arguments);
};

RrdCmdLine.prototype = {
	graph: null,

	init: function (gfx, fetch, line)
	{
		this.graph = new RrdGraph(gfx, fetch);
		this.cmdline(line);
	},
	cmdline: function(line) // FIXME
	{
		var i = 0;
		line = line.replace(/\n/g," ");
		var lines = line.match(/[^" ]+|"[^"]+"/g);
		var len = lines.length;

		while (i < len) {
			var arg = lines[i];
			if (arg.charAt(0) === '"' && arg.charAt(arg.length-1) === '"')
				arg = arg.substr(1,arg.length-2);
			if (/^LINE[0-9.]+:/.test(arg)) {
				this.parse_line(arg);
			} else if (/^AREA:/.test(arg)) {
				this.parse_area(arg);
			} else if (/^DEF:/.test(arg)) {
				this.parse_def(arg);
			} else if (/^CDEF:/.test(arg)) {
				this.parse_cdef(arg);
			} else if (/^VDEF:/.test(arg)) {
				this.parse_vdef(arg);
			} else if (/^GPRINT:/.test(arg)) {
				this.parse_gprint(arg);
			} else if (/^COMMENT:/.test(arg)) {
				this.parse_comment(arg);
			} else if (/^VRULE:/.test(arg)) {
				this.parse_vrule(arg);
			} else if (/^HRULE:/.test(arg)) {
				this.parse_hrule(arg);
			} else if (/^TICK:/.test(arg)) {
				this.parse_tick(arg);
			} else if (/^TEXTALIGN:/.test(arg)) {
				this.parse_textaling(arg);
			} else if (/^SHIFT:/.test(arg)) {
				this.parse_shift(arg);
      } else if (arg.charAt(0) === '-') {
				var strip = 1;
				if (arg.length > 1 && arg.charAt(1) === '-') {
					strip = 2;
				}
				var option = arg.substr(strip);
				var value = undefined;

				if (option.indexOf('=') !== -1) {
					var index = option.indexOf('=');
					value = option.substr(index+1);
					option = option.substr(0,index);
				} else if (i+1 < len) {
					if (lines[i+1].charAt(0) !== '-' &&
							!/^"?LINE[0-9.]+:/.test(lines[i+1]) &&
							!/^"?AREA:/.test(lines[i+1]) &&
							!/^"?DEF:/.test(lines[i+1]) &&
							!/^"?CDEF:/.test(lines[i+1]) &&
							!/^"?VDEF:/.test(lines[i+1]) &&
							!/^"?GPRINT:/.test(lines[i+1]) &&
							!/^"?COMMENT:/.test(lines[i+1]) &&
							!/^"?HRULE:/.test(lines[i+1]) &&
							!/^"?VRULE:/.test(lines[i+1]) &&
							!/^"?TICK:/.test(lines[i+1]) &&
							!/^"?TEXTALING:/.test(lines[i+1]) &&
							!/^"?SHIFT:/.test(lines[i+1])
							) {
						i++;
						if (lines[i].charAt(0) === '"' && lines[i].charAt(lines[i].length-1) === '"')
							value = lines[i].substr(1,lines[i].length-2);
						else
							value = lines[i];
					}
				}
				this.set_option(option, value);
			} else {
				throw "Unknow argument: "+arg;
			}
			i++;
		}
		var start_end = RrdTime.proc_start_end(this.graph.start_t, this.graph.end_t); // FIXME here?
		this.graph.start = start_end[0];
		this.graph.end = start_end[1];
	},
	set_option: function(option, value)
	{
		switch(option) {
			case 'alt-autoscale':
			case 'A':
				this.graph.alt_autoscale = true;
				break;
			case 'base':
			case 'b':
				this.graph.base = parseInt(value, 10);
				if (this.graph.base !== 1000 && this.graph.base !== 1024)
					throw 'the only sensible value for base apart from 1000 is 1024';
				break;
			case 'color':
			case 'c':
				var index = value.indexOf('#');
				if (index === -1)
					throw "invalid color def format";
				var name = value.substr(0,index);
				if (!this.graph.GRC[name])
					throw "invalid color name '"+name+"'"
				this.graph.GRC[name] = value.substr(index); // FIXME check color
				break;
			case 'full-size-mode':
			case 'D':
				this.graph.full_size_mode = true;
				break;
			case 'slope-mode':
			case 'E':
				this.graph.slopemode = true;
				break;
			case 'end':
			case 'e':
				this.graph.end_t = new RrdTime(value);
//				this.graph.end = parseInt(value, 10);
				break;
			case 'force-rules-legend':
			case 'F':
				this.graph.force_rules_legend = true;
				break;
			case 'imginfo':
			case 'f':
				// im->imginfo = optarg;
				break;
			case 'graph-render-mode':
			case 'G':
			 // im->graph_antialias
				break;
			case 'no-legend':
			case 'g':
				this.graph.no_legend = true;
				break;
			case 'height':
			case 'h':
				this.graph.ysize = parseInt(value, 10);
				break;
			case 'no-minor':
			case 'I':
				this.graph.no_minor = false;
				break;
			case 'interlaced':
			case 'i':
				break;
			case 'alt-autoscale-min':
			case 'J':
				this.graph.alt_autoscale_min = true;
				break;
			case 'only-graph':
			case 'j':
				this.graph.only_graph = true;
				break;
			case 'units-length':
			case 'L':
				this.graph.unitslength = parseInt(value, 10);
				this.graph.forceleftspace = true;
				break;
			case 'lower-limit':
			case 'l':
				this.graph.setminval = parseFloat(value)
				break;
			case 'alt-autoscale-max':
			case 'M':
				this.graph.alt_autoscale_max = true;
				break;
			case 'zoom':
			case 'm':
				this.graph.zoom = parseFloat(value);
				if (this.graph.zoom <= 0.0)
					throw "zoom factor must be > 0";
				break;
			case 'no-gridfit':
			case 'N':
				this.graph.gridfit = true;
				break;
			case 'font':
			case 'n':
				var args = value.split(':');
				if (args.length !== 3)
					throw "invalid text property format";
				if (!this.graph.TEXT[args[0]])
					throw "invalid fonttag '"+args[0]+"'"
				if (args[1] > 0)
					this.graph.TEXT[args[0]].size = args[1];
				if (args[2])
					this.graph.TEXT[args[0]].font = args[2];
				break;
			case 'logarithmic':
			case 'o':
				this.graph.logarithmic = true;
				break;
			case 'pango-markup':
			case 'P':
				// im->with_markup = 1;
				break;
			case 'font-render-mode':
			case 'R':
				// im->font_options: normal light mono
				break;
			case 'rigid':
			case 'r':
				this.graph.rigid = true;
				break;
			case 'step':
				this.graph.step = parseInt(value, 10);
				break;
			case 'start':
			case 's':
				this.graph.start_t = new RrdTime(value);
				//this.graph.start = parseInt(value, 10);
				break;
			case 'tabwidth':
			case 'T':
				this.graph.tabwidth = parseFloat(value);
				break;
			case 'title':
			case 't':
				this.graph.title = value;
				break;
			case 'upper-limit':
			case 'u':
				this.graph.setmaxval = parseFloat(value);
				break;
			case 'vertical-label':
			case 'v':
				this.graph.ylegend = value;
				break;
			case 'watermark':
			case 'W':
				this.graph.watermark = value;
				break;
			case 'width':
			case 'w':
				this.graph.xsize = parseInt(value, 10);
				if (this.graph.xsize < 10)
					throw "width below 10 pixels";
				break;
			case 'units-exponent':
			case 'X':
				this.graph.unitsexponent = parseInt(value, 10);
				break;
			case 'x-grid':
			case 'x':
				if (value === 'none')  {
					this.graph.draw_x_grid = false;
				} else {
					var args = value.split(':');
					if (args.length !== 8)
						throw "invalid x-grid format";
					this.graph.xlab_user.gridtm = this.graph.tmt_conv(args[0]);
					if (this.graph.xlab_user.gridtm < 0)
						throw "unknown keyword "+args[0];
					this.graph.xlab_user.gridst = parseInt(args[1], 10);
					this.graph.xlab_user.mgridtm = this.graph.tmt_conv(args[2]);
					if (this.graph.xlab_user.mgridtm < 2)
						throw "unknown keyword "+args[2];
					this.graph.xlab_user.mgridst = parseInt(args[3], 10);
					this.graph.xlab_user.labtm = this.graph.tmt_conv(args[4]);
					if (this.graph.xlab_user.labtm < 0)
						throw "unknown keyword "+args[4];
					this.graph.xlab_user.labst = parseInt(args[5], 10);
					this.graph.xlab_user.precis = parseInt(args[6], 10);
					this.graph.xlab_user.minsec = 1;
					this.graph.xlab_form = args[7]; // FIXME : ? join(:)
					this.graph.xlab_user.stst = this.graph.xlab_form;
				}
				break;
			case 'alt-y-grid':
			case 'Y':
				this.graph.alt_ygrid = true;
				break;
			case 'y-grid':
			case 'y':
				if (value === 'none')  {
					this.graph.draw_y_grid = false;
				} else {
					var index = value.indexOf(':');
					if (index === -1)
						throw "invalid y-grid format";
					this.graph.ygridstep = parseFloat(value.substr(0,index));
					if (this.graph.ygridstep <= 0)
						throw "grid step must be > 0";
					this.graph.ylabfact = parseInt(value.substr(index+1), 10);
					if (this.graph.ylabfact < 1)
						throw "label factor must be > 0";
				}
				break;
			case 'lazy':
			case 'z':
				this.graph.lazy = 1;
				break;
			case 'units':
				if (this.graph.force_units)
					throw "--units can only be used once!";
				if (value === 'si')
					this.graph.force_units_si = true;
				else
					throw "invalid argument for --units: "+value;
				break;
			case 'alt-y-mrtg':
				break;
			case 'disable-rrdtool-tag':
				this.graph.no_rrdtool_tag = true;
				break;
			case 'right-axis':
				var index = value.indexOf(':');
				if (index === -1)
					throw "invalid right-axis format expected scale:shift";
				this.graph.second_axis_scale = parseFloat(value.substr(0,index));
				if(this.graph.second_axis_scale === 0)
					throw "the second_axis_scale  must not be 0";
				this.graph.second_axis_shift = parseFloat(value.substr(index+1));
				break;
			case 'right-axis-label':
				this.graph.second_axis_legend = value;
				break;
			case 'right-axis-format':
				this.graph.second_axis_format = value;
				break;
			case 'legend-position':
				if (value === "north") {
					this.graph.legendposition = this.graph.LEGEND_POS.NORTH;
				} else if (value === "west") {
					this.graph.legendposition = this.graph.LEGEND_POS.WEST;
				} else if (value === "south") {
					this.graph.legendposition = this.graph.LEGEND_POS.SOUTH;
				} else if (value === "east") {
					this.graph.legendposition = this.graph.LEGEND_POS.EAST;
				} else {
					throw "unknown legend-position '"+value+"'";
				}
				break;
			case 'legend-direction':
				if (value === "topdown") {
					this.graph.legenddirection = this.graph.LEGEND_DIR.TOP_DOWN;
				} else if (value === "bottomup") {
					this.graph.legenddirection = this.graph.LEGEND_DIR.BOTTOM_UP;
				} else {
					throw "unknown legend-position '"+value+"'";
				}
				break;
			case 'border':
				this.graph.draw_3d_border = parseInt(value, 10);
				break;
			case 'grid-dash':
				var index = value.indexOf(':');
				if (index === -1)
					throw "expected grid-dash format float:float";
				this.graph.grid_dash_on = parseFloat(value.substr(0,index));
				this.graph.grid_dash_off = parseFloat(value.substr(index+1));
				break;
			case 'dynamic-labels':
				this.graph.dynamic_labels = true;
				break;
			default:
				throw 'Unknow option "'+option+'"';
		}

	},
	// DEF:<vname>=<rrdfile>:<ds-name>:<CF>[:step=<step>][:start=<time>][:end=<time>][:reduce=<CF>]
	parse_def: function (line)
	{
		var args = line.split(/:/);
		var n=1;
		var vnames = args[n++].split('=');
		var vname = vnames[0];
		var rrdfile = vnames[1];
		var name = args[n++];
		var cf = args[n++];
		var step = undefined;
		var reduce = undefined;
		var start = undefined;
		var end = undefined;
		if (args.length > n) {
			for (var j = n, xlen = args.length ; j < xlen ; j++) {
				var opts = args[j].split("=");
				if (opts[0] === "step") step = opts[1];
				if (opts[0] === "reduce") reduce = opts[1]
				if (opts[0] === "start") start = opts[1];
				if (opts[0] === "end") end = opts[1];
			}
		}
		this.graph.gdes_add_def(vname, rrdfile, name, cf, step, start, end, reduce)
	},
	// CDEF:vname=RPN expression
	parse_cdef: function (line)
	{
		var args = line.split(/:|=/);
		this.graph.gdes_add_cdef(args[1], args[2]);
	},
	// VDEF:vname=RPN expression
	parse_vdef: function (line)
	{
		var args = line.split(/:|=/);
		this.graph.gdes_add_vdef(args[1], args[2]);
	},
	// SHIFT:vname:offset
	parse_shift: function (line)
	{
		var args = line.split(':');
		this.graph.gdes_add_shift(args[1], args[2]);
	},
	// LINE[width]:value[#color][:[legend][:STACK]][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_line: function (line)
	{
		var args = line.split(/#|:/);
		var width = parseFloat(args[0].substr(4));
		var stack = args[4] === 'STACK' ? true : undefined;
		var color = this.graph.parse_color(args[2]);
		this.graph.gdes_add_line(width, args[1], this.graph.color2rgba(color), args[3], stack);
	},
	// AREA:value[#color][:[legend][:STACK]]
	parse_area: function (line)
	{
		var args = line.split(/#|:/);
		var stack = args[3] === 'STACK' ? true : undefined;
		var color = this.graph.parse_color(args[2]);
		this.graph.gdes_add_area(args[1], this.graph.color2rgba(color), stack);
	},
	// TICK:vname#rrggbb[aa][:fraction[:legend]]
	parse_tick: function (line)
	{
		var args = line.split(/:|#/);
		var color = this.graph.parse_color(args[2]);
		this.graph.gdes_add_tick(args[1], this.graph.color2rgba(color), args[3], args[4]);
	},
	// GPRINT:vname:format
	parse_gprint: function(line)
	{
		var args = line.split(':');
		var strftime = false;
		var vname = args[1];
		var cf = args[2];
		var format = "";
		if (args.length > 3) {
			var m=0;
			for (var j = 3, xlen = args.length ; j < xlen ; j++) {
				if (args[j] === 'strftime') {
					strftime = true;
				} else {
					if (m>0) {
						format = format + ':'+ args[j];
					} else {
						format = args[j];
					}
					m++;
				}
			}
		}
		this.graph.gdes_add_gprint(vname, cf, format, strftime);
	},
	//COMMENT:text
	parse_comment: function (line)
	{
		var index = line.indexOf(':');
		this.graph.gdes_add_comment(line.substr(index+1));
	},
	// TEXTALIGN:{left|right|justified|center}
	parse_textaling: function (line)
	{
		var index = line.indexOf(':');
		this.graph.gdes_add_textaling(line.substr(index+1));
	},
	// VRULE:time#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_vrule: function (line)
	{
		var args = line.split(/:|#/);
		this.graph.gdes_add_vrule(args[1], '#'+args[2], args[3]);
	},
	// HRULE:value#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_hrule: function (line)
	{
		var args = line.split(/:|#/);
		this.graph.gdes_add_hrule(args[1], '#'+args[2], args[3]);
	}
};
