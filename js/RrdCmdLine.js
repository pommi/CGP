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
  this.init.apply(this, arguments);
};

RrdCmdLine.prototype = {
	graph: null,

	init: function (gfx, fetch, line)
	{
		this.graph = new RrdGraph(gfx, fetch);
		this.cmdline(line);
	},
	cmdline: function(line)
	{
		var i = 0;
		line = line.replace(/\n/g," ");
		var lines = line.match(/[^" ]+|"[^"]+"/g);
		var len = lines.length;

		while (i < len) {
			var arg = lines[i];
			if (arg.charAt(0) === '"' && arg.charAt(arg.length-1) === '"')
				arg = arg.substr(1,arg.length-2);
			if (arg.substring(0,4) === 'LINE') {
				this.parse_line(this.split(arg));
			} else if (arg.substring(0,5) === 'AREA:') {
				this.parse_area(this.split(arg));
			} else if (arg.substring(0,4) === 'DEF:') {
				this.parse_def(this.split(arg));
			} else if (arg.substring(0,5) === 'CDEF:') {
				this.parse_cdef(this.split(arg));
			} else if (arg.substring(0,5) === 'VDEF:') {
				this.parse_vdef(this.split(arg));
			} else if (arg.substring(0,7) === 'GPRINT:') {
				this.parse_gprint(this.split(arg));
			} else if (arg.substring(0,8) === 'COMMENT:') {
				this.parse_comment(this.split(arg));
			} else if (arg.substring(0,6) === 'VRULE:') {
				this.parse_vrule(this.split(arg));
			} else if (arg.substring(0,6) === 'HRULE:') {
				this.parse_hrule(this.split(arg));
			} else if (arg.substring(0,5) === 'TICK:') {
				this.parse_tick(this.split(arg));
			} else if (arg.substring(0,10) === 'TEXTALIGN:') {
				this.parse_textalign(this.split(arg));
			} else if (arg.substring(0,6) === 'SHIFT:') {
				this.parse_shift(this.split(arg));
			} else if (arg.charAt(0) === '-') {
				var strip = 1;
				if (arg.length > 1 && arg.charAt(1) === '-') {
					strip = 2;
				}
				var option = arg.substr(strip);
				/* try to parse a flag, otherwise assume --option=value */
				if (!this.set_flag(option)) {
					var value;
					if (option.indexOf('=') !== -1) {
						var index = option.indexOf('=');
						value = option.substr(index + 1);
						option = option.substr(0, index);
					} else if (i + 1 < len) {
						++i;
						if (lines[i].charAt(0) === '"' && lines[i].charAt(lines[i].length-1) === '"')
							value = lines[i].substr(1,lines[i].length-2);
						else
							value = lines[i];
					}
					this.set_option(option, value);
				}
			} else {
				throw "Unknown argument: "+arg;
			}
			i++;
		}
		var start_end = RrdTime.proc_start_end(this.graph.start_t, this.graph.end_t);
		this.graph.start = start_end[0];
		this.graph.end = start_end[1];
	},
	/** Returns true when the option is a flag that got consumed. */
	set_flag: function(option) {
		switch (option) {
			case 'alt-autoscale':
			case 'A':
				this.graph.alt_autoscale = true;
				return true;
			case 'full-size-mode':
			case 'D':
				this.graph.full_size_mode = true;
				return true;
			case 'slope-mode':
			case 'E':
				this.graph.slopemode = true;
				return true;
			case 'force-rules-legend':
			case 'F':
				this.graph.force_rules_legend = true;
				return true;
			case 'no-legend':
			case 'g':
				this.graph.no_legend = true;
				return true;
			case 'no-minor':
			case 'I':
				this.graph.no_minor = false;
				return true;
			case 'interlaced':
			case 'i':
				return true;
			case 'alt-autoscale-min':
			case 'J':
				this.graph.alt_autoscale_min = true;
				return true;
			case 'only-graph':
			case 'j':
				this.graph.only_graph = true;
				return true;
			case 'alt-autoscale-max':
			case 'M':
				this.graph.alt_autoscale_max = true;
				return true;
			case 'no-gridfit':
			case 'N':
				this.graph.gridfit = true;
				return true;
			case 'logarithmic':
			case 'o':
				this.graph.logarithmic = true;
				return true;
			case 'pango-markup':
			case 'P':
				// im->with_markup = 1;
				return true;
			case 'rigid':
			case 'r':
				this.graph.rigid = true;
				return true;
			case 'alt-y-grid':
			case 'Y':
				this.graph.alt_ygrid = true;
				return true;
			case 'lazy':
			case 'z':
				this.graph.lazy = true;
				return true;
			case 'alt-y-mrtg':
				return true;
			case 'disable-rrdtool-tag':
				this.graph.no_rrdtool_tag = true;
				return true;
			case 'dynamic-labels':
				this.graph.dynamic_labels = true;
				return true;
			default:
				/* unrecognized flag, maybe it is an option? */
				return false;
		}
	},
	set_option: function(option, value)
	{
		var args = value.split(':');
		var index = value.indexOf(':');
		switch(option) {
			case 'base':
			case 'b':
				this.graph.base = parseInt(value, 10);
				if (this.graph.base !== 1000 && this.graph.base !== 1024)
					throw 'the only sensible value for base apart from 1000 is 1024';
				break;
			case 'color':
			case 'c':
				index = value.indexOf('#');
				if (index === -1)
					throw "invalid color def format";
				var name = value.substr(0,index);
				if (!this.graph.GRC[name])
					throw "invalid color name '" + name + "'";
				this.graph.GRC[name] = value.substr(index); // FIXME check color
				break;
			case 'end':
			case 'e':
				this.graph.end_t = new RrdTime(value);
//				this.graph.end = parseInt(value, 10);
				break;
			case 'imginfo':
			case 'f':
				// im->imginfo = optarg;
				break;
			case 'graph-render-mode':
			case 'G':
				// im->graph_antialias
				break;
			case 'height':
			case 'h':
				this.graph.ysize = parseInt(value, 10);
				break;
			case 'units-length':
			case 'L':
				this.graph.unitslength = parseInt(value, 10);
				this.graph.forceleftspace = true;
				break;
			case 'lower-limit':
			case 'l':
				this.graph.setminval = parseFloat(value);
				break;
			case 'zoom':
			case 'm':
				this.graph.zoom = parseFloat(value);
				if (this.graph.zoom <= 0.0)
					throw "zoom factor must be > 0";
				break;
			case 'font':
			case 'n':
				if (args.length !== 3)
					throw "invalid text property format";
				if (!this.graph.TEXT[args[0]])
					throw "invalid font tag '" + args[0] + "'";
				if (args[1] > 0)
					this.graph.TEXT[args[0]].size = args[1];
				if (args[2])
					this.graph.TEXT[args[0]].font = args[2];
				break;
			case 'font-render-mode':
			case 'R':
				// im->font_options: normal light mono
				break;
			case 'step':
				this.graph.step = parseInt(value, 10);
				this.graph.step_orig = this.graph.step;
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
			case 'y-grid':
			case 'y':
				if (value === 'none')  {
					this.graph.draw_y_grid = false;
				} else {
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
			case 'units':
				if (this.graph.force_units)
					throw "--units can only be used once!";
				if (value === 'si')
					this.graph.force_units_si = true;
				else
					throw "invalid argument for --units: "+value;
				break;
			case 'right-axis':
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
				if (index === -1)
					throw "expected grid-dash format float:float";
				this.graph.grid_dash_on = parseFloat(value.substr(0,index));
				this.graph.grid_dash_off = parseFloat(value.substr(index+1));
				break;
			default:
				throw 'Unknown option "'+option+'"';
		}

	},
	split: function (line)
	{
		return line.replace(/:/g,'\0').replace(/\\\0/g,':').split('\0');
	},
	// DEF:<vname>=<rrdfile>:<ds-name>:<CF>[:step=<step>][:start=<time>][:end=<time>][:reduce=<CF>]
	parse_def: function (args)
	{
		if (args.length > 8)
			throw "Too many options for DEF: "+args.join(':');
		if (args.length < 4)
			throw "Too few options for DEF: "+args.join(':');

		var rrdfile;
		var vname;
		var index = args[1].indexOf('=');
		if (index > 0) {
			vname = args[1].substr(0, index);
			rrdfile = args[1].substr(index+1);
		} else {
			throw "Missing '=' in DEF: "+args[1];
		}
		rrdfile = rrdfile.replace(/\\\\/g, '\\');

		var name = args[2];
		var cf = args[3];

		var step, reduce, start, end;
		if (args.length > 4) {
			for (var n = 4; n == args.length; n++) {
				if (args[n].substring(0,4) === "step") {
					index = args[n].indexOf("=");
					if (index > 0) {
						step = args[n].substr(index+1);
					} else {
						throw "DEF step without value: "+args[n];
					}
				} else if (args[n].substring(0,6)  === "reduce") {
					index = args[n].indexOf("=");
					if (index > 0) {
						reduce = args[n].substr(index+1);
					} else {
						throw "DEF step without value: "+args[n];
					}
				} else if (args[n].substring(0,5)  === "start") {
					index = args[n].indexOf("=");
					if (index > 0) {
						start = args[n].substr(index+1);
					} else {
						throw "DEF step without value: "+args[n];
					}
				} else if (args[n].substring(0,3)  === "end") {
					index = args[n].indexOf("=");
					if (index > 0) {
						end = args[n].substr(index+1);
					} else {
						throw "DEF end without value: "+args[n];
					}
				} else {
					throw "Unknown DEF option: "+args[n];
				}
			}
		}

		this.graph.gdes_add_def(vname, rrdfile, name, cf, step, start, end, reduce);
	},
	// CDEF:vname=RPN expression
	parse_cdef: function (args)
	{
		var rpn, vname, index;

		if (args.length != 2)
			throw "Wrong options for CDEF: "+args.join(':');

		index = args[1].indexOf('=');
		if (index > 0) {
			vname = args[1].substr(0, index);
			rpn = args[1].substr(index+1);
		} else {
			throw "Missing '=' in CDEF: "+args[1];
		}

		this.graph.gdes_add_cdef(vname, rpn);
	},
	// VDEF:vname=RPN expression
	parse_vdef: function (args)
	{
		var rpn, vname, index;

		if (args.length != 2)
			throw "Wrong options for VDEF: "+args.join(':');

		index = args[1].indexOf('=');
		if (index > 0) {
			vname = args[1].substr(0, index);
			rpn = args[1].substr(index+1);
		} else {
			throw "Missing '=' in VDEF: "+args[1];
		}

		this.graph.gdes_add_vdef(vname, rpn);
	},
	// SHIFT:vname:offset
	parse_shift: function (args)
	{
		if (args.length != 3)
			throw "Wrong options for SHIFT: "+args.join(':');

		this.graph.gdes_add_shift(args[1], args[2]);
	},
	// LINE[width]:value[#color][:[legend][:STACK]][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_line: function (args)
	{
		if (args.length > 6)
			throw "Too many options for LINE: "+args.join(':');
		if (args.length < 2)
			throw "Too few options for LINE: "+args.join(':');

		var width = 1;
		if (args[0].length > 4)
			width = parseFloat(args[0].substr(4));

		var color = undefined;
		var value = args[1];
		var index = args[1].indexOf('#');
		if (index > 0) {
			value = args[1].substr(0, index);
			color = this.graph.parse_color(args[1].substr(index+1));
			color = this.graph.color2rgba(color);
		}

		var stack = false;
		var legend = undefined;
		var dashes = undefined;
		var dash_offset = undefined;
		if (args.length == 3 && args[2] === 'STACK') {
			stack = true;
		} else if (args.length >= 3) {
			legend = args[2];
			for (var n = 3; n < args.length; n++) {
				if (args[n] === 'STACK') {
					stack = true;
				} else if (args[n].substring(0,6) ===  'dashes') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dashes = args[n].substr(index+1).split(',');
					} else {
						dashes = [5];
					}
				} else if (args[n].substring(0,11) === 'dash-offset') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dash_offset = args[n].substr(index+1);
					} else {
						throw "LINE dash-offset without value: "+args[n];
					}
				} else {
					throw "Unknown LINE option: "+args[n];
				}
			}
		}

		if (legend != undefined && legend.length === 0)
			legend = undefined;

		this.graph.gdes_add_line(width, value, color, legend, stack, dashes, dash_offset);
	},
	// AREA:value[#color][:[legend][:STACK]]
	parse_area: function (args)
	{
		if (args.length > 4)
			throw "Too many options for AREA: "+args.join(':');
		if (args.length < 2)
			throw "Too few options for AREA: "+args.join(':');

		var color = undefined;
		var value = args[1];
		var index = args[1].indexOf('#');
		if (index > 0) {
			value = args[1].substr(0, index);
			color = this.graph.parse_color(args[1].substr(index+1));
			color = this.graph.color2rgba(color);
		}

		var legend = undefined;
		var stack = false;
		if (args.length == 3) {
			if (args[2] === 'STACK') {
				stack = true;
			} else {
				legend = args[2];
			}
		} else if (args.length == 4) {
			legend = args[2];
			if (args[3] === 'STACK') {
				stack = true;
			} else {
				throw "Unknown AREA option: "+args[3];
			}
		}

		if (legend != undefined && legend.length === 0)
			legend = undefined;

		this.graph.gdes_add_area(value, color, legend, stack);
	},
	// TICK:vname#rrggbb[aa][:fraction[:legend]]
	parse_tick: function (args)
	{
		if (args.length > 4)
			throw "Too many options for TICK: "+args.join(':');
		if (args.length < 2)
			throw "Too few options for TICK: "+args.join(':');

		var color = undefined;
		var vname = args[1];
		var index = args[1].indexOf('#');
		if (index > 0) {
			vname = args[1].substr(0, index);
			color = this.graph.parse_color(args[1].substr(index+1));
			color = this.graph.color2rgba(color);
		}
		var fraction = undefined;
		if (args.length >= 3 && args[2].length > 0)
			fraction = parseFloat(args[2]);
		var legend = undefined;
		if (args.length == 4)
			legend = args[3];

		if (legend != undefined && legend.length === 0)
			legend = undefined;

		this.graph.gdes_add_tick(vname, color, fraction, legend);
	},
	// GPRINT:vname:format[:strftime]
	// GPRINT:vname:cf:format[:strftime]
	parse_gprint: function(args)
	{
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
	parse_comment: function (args)
	{
		if (args.length < 2)
			throw "Wrong options for COMMENT: "+args.join(':');

		if (args.length > 2) {
			args.shift();
			this.graph.gdes_add_comment(args.join(':'));
		} else {
			this.graph.gdes_add_comment(args[1]);
		}
	},
	// TEXTALIGN:{left|right|justified|center}
	parse_textalign: function (args)
	{
		if (args.length != 2)
			throw "Wrong options for TESTALIGN: "+args.join(':');

		this.graph.gdes_add_textalign(args[1]);
	},
	// VRULE:time#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_vrule: function (args)
	{
		if (args.length > 5)
			throw "Too many options for VRULE: "+args.join(':');
		if (args.length < 2)
			throw "Too few options for VRULE: "+args.join(':');

		var color = undefined;
		var time = args[1];
		var index = args[1].indexOf('#');
		if (index > 0) {
			time = args[1].substr(0, index);
			color = this.graph.parse_color(args[1].substr(index+1));
			color = this.graph.color2rgba(color);
		}

		var legend = undefined;
		var dashes = undefined;
		var dash_offset = undefined;
		if (args.length >= 3) {
			legend = args[2];
			for (var n = 3; n < args.length; n++) {
				if (args[n].substring(0,6) ===  'dashes') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dashes = args[n].substr(index+1).split(',');
					} else {
						dashes = [5];
					}
				} else if (args[n].substring(0,11) === 'dash-offset') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dash_offset = args[n].substr(index+1);
					} else {
						throw "VRULE dash-offset without value: "+args[n];
					}
				} else {
					throw "Unknown VRULE option: "+args[n];
				}
			}
		}

		if (legend != undefined && legend.length === 0)
			legend = undefined;

		this.graph.gdes_add_vrule(time, color, legend, dashes, dash_offset);
	},
	// HRULE:value#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
	parse_hrule: function (args)
	{
		if (args.length > 5)
			throw "Too many options for HRULE: "+args.join(':');
		if (args.length < 2)
			throw "Too few options for HRULE: "+args.join(':');

		var color = undefined;
		var value = args[1];
		var index = args[1].indexOf('#');
		if (index > 0) {
			value = args[1].substr(0, index);
			color = this.graph.parse_color(args[1].substr(index+1));
			color = this.graph.color2rgba(color);
		}

		var legend = undefined;
		var dashes = undefined;
		var dash_offset = undefined;
		if (args.length >= 3) {
			legend = args[2];
			for (var n = 3; n < args.length; n++) {
				if (args[n].substring(0,6) ===  'dashes') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dashes = args[n].substr(index+1).split(',');
					} else {
						dashes = [5];
					}
				} else if (args[n].substring(0,11) === 'dash-offset') {
					index = args[n].indexOf('=');
					if (index > 0) {
						dash_offset = args[n].substr(index+1);
					} else {
						throw "HRULE dash-offset without value: "+args[n];
					}
				} else {
					throw "Unknown HRULE option: "+args[n];
				}
			}
		}

		if (legend != undefined && legend.length === 0)
			legend = undefined;

		this.graph.gdes_add_hrule(value, color, legend, dashes, dash_offset);
	}
};
