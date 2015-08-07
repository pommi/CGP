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
 * RrdJson
 * @constructor
 */
var RrdJson = function() {
	if (arguments.length == 1) {
		this.init1.apply(this, arguments);
	} else if (arguments.length == 2) {
		this.init2.apply(this, arguments);
	} else if (arguments.length == 3) {
		this.init3.apply(this, arguments);
	}
};

RrdJson.prototype = {
	graph: null,
	json: null,

	init1: function (rrdgraph)
	{
		this.graph = rrdgraph;
	},
	init2: function (rrdgraph, jsonstr)
	{
		this.json =  JSON.parse(jsonstr);
		this.graph = rrdgraph;
	},
	init3: function (gfx, fetch, jsonstr)
	{
		this.json =  JSON.parse(jsonstr);
		this.graph = new RrdGraph(gfx, fetch);
	},
	parse: function()
	{
		for (var option in this.json) {
			switch(option) {
				case 'alt_autoscale':
					this.graph.alt_autoscale = this.json.alt_autoscale;
					break;
				case 'base':
					this.graph.base = parseInt(this.json.base, 10);
					if (this.graph.base !== 1000 && this.graph.base !== 1024)
						throw 'the only sensible value for base apart from 1000 is 1024';
					break;
				case 'color':
					for (var color in this.json.color) {
						if (color in this.graph.GRC) {
							this.graph.GRC[color] = this.json.color[color];
						} else {
							throw "invalid color '" + color + "'";
						}
					}
					break;
				case 'full_size_mode':
					this.graph.full_size_mode = this.json.full_size_mode;
					break;
				case 'slope_mode':
					this.graph.slopemode = this.json.slope_mode;
					break;
				case 'end':
					this.graph.end_t = new RrdTime(this.json.end);
					break;
				case 'force_rules_legend':
					this.graph.force_rules_legend = this.json.force_rules_legend;
					break;
				case 'no_legend':
					this.graph.no_legend = this.json.no_legend;
					break;
				case 'height':
					this.graph.ysize = this.json.height;
					break;
				case 'no_minor':
					this.graph.no_minor = this.json.no_minor;
					break;
				case 'alt_autoscale_min':
					this.graph.alt_autoscale_min = this.json.alt_autoscale_min;
					break;
				case 'only_graph':
					this.graph.only_graph = this.json.only_graph;
					break;
				case 'units_length':
					this.graph.unitslength = this.json.units_length; // FIXME
					this.graph.forceleftspace = true;
					break;
				case 'lower_limit':
					if (this.json.lower_limit === null)  this.graph.setminval = Number.NaN;
					else this.graph.setminval = this.json.lower_limit;
					break;
				case 'alt_autoscale_max':
					this.graph.alt_autoscale_max = this.json.alt_autoscale_max;
					break;
				case 'zoom':
					this.graph.zoom = this.json.zoom;
					if (this.graph.zoom <= 0.0)
						throw "zoom factor must be > 0";
					break;
				case 'no_gridfit':
					this.graph.gridfit = this.json.no_gridfit;
					break;
				case 'font':
					for (var font in  this.json.font) {
						if (font in this.graph.TEXT) {
							if (this.json.font[font].size !== undefined) 
								this.graph.TEXT[font].size = this.json.font[font].size;
							if (this.json.font[font].font !== undefined) 
								this.graph.TEXT[font].font = this.json.font[font].font;
						} else {
							throw "invalid text property name";
						}
					}
					break;
				case 'logarithmic':
					this.graph.logarithmic = this.json.logarithmic;
					break;
				case 'rigid':
					this.graph.rigid = this.json.rigid;
					break;
				case 'step':
					this.graph.step = this.json.step;
					this.graph.step_orig = this.json.step;
					break;
				case 'start':
					this.graph.start_t = new RrdTime(this.json.start);
					break;
				case 'tabwidth':
					this.graph.tabwidth = this.json.tabwidth;
					break;
				case 'title':
					this.graph.title = this.json.title;
					break;
				case 'upper_limit':
					if (this.json.upper_limit === null) this.graph.setmaxval = Number.NaN;
					else this.graph.setmaxval = this.json.upper_limit;
					break;
				case 'vertical_label':
					this.graph.ylegend = this.json.vertical_label;
					break;
				case 'watermark':
					this.graph.watermark = this.json.watermark;
					break;
				case 'width':
					this.graph.xsize = this.json.width;
					if (this.graph.xsize < 10)
						throw "width below 10 pixels";
					break;
				case 'units_exponent':
					this.graph.unitsexponent = this.json.units_exponent;
					break;
				case 'x_grid':
					break;
				case 'alt_ygrid':
					this.graph.alt_ygrid = this.json.alt_ygrid;
					break;
				case 'y_grid':
					break;
				case 'lazy':
					this.graph.lazy = this.json.lazy;
					break;
				case 'units':
					break;
				case 'disable_rrdtool_tag':
					this.graph.no_rrdtool_tag = this.json.disable_rrdtool_tag;
					break;
				case 'right_axis':
					break;
				case 'right_axis_label':
					this.graph.second_axis_legend = this.json.right_axis_label;
					break;
				case 'right_axis_format':
					this.graph.second_axis_format = this.json.right_axis_format;
					break;
				case 'legend_position':
					switch (this.json.legend_position) {
						case "north":
							this.graph.legendposition = this.graph.LEGEND_POS.NORTH;
							break;
						case "west":
							this.graph.legendposition = this.graph.LEGEND_POS.WEST;
							break;
						case "south":
							this.graph.legendposition = this.graph.LEGEND_POS.SOUTH;
							break;
						case "east":
							this.graph.legendposition = this.graph.LEGEND_POS.EAST;
							break;
						default:
							throw "unknown legend-position '" + this.json.legend_position + "'";
					}
					break;
				case 'legend_direction':
					if (this.json.legend_direction === "topdown") {
						this.graph.legenddirection = this.graph.LEGEND_DIR.TOP_DOWN;
					} else if (this.json.legend_direction === "bottomup") {
						this.graph.legenddirection = this.graph.LEGEND_DIR.BOTTOM_UP;
					} else {
						throw "unknown legend-direction'" + this.json.legend_direction + "'";
					}
					break;
				case 'border':
					this.graph.draw_3d_border = this.json.border;
					break;
				case 'grid_dash':
					if (this.json.grid_dash.length !== 2)
						throw "expected grid-dash format float:float";
					this.graph.grid_dash_on = this.json.grid_dash[0];
					this.graph.grid_dash_off = this.json.grid_dash[1];
					break;
				case 'dynamic_labels':
					this.graph.dynamic_labels = this.json.dynamic_labels;
					break;	
				case 'gdes':
					this.parse_gdes(this.json.gdes);
					break;
				default:
					throw 'Unknow option "'+option+'"';
			}
		}
		var start_end = RrdTime.proc_start_end(this.graph.start_t, this.graph.end_t); // FIXME here?
		this.graph.start = start_end[0];
		this.graph.end = start_end[1];
	},
	parse_gdes: function (gdes)
	{
		for (var i = 0, gdes_c = gdes.length; i < gdes_c; i++) {
			switch (gdes[i].type) {
//	 		GPRINT:vname:format
				case 'GPRINT':
					this.graph.gdes_add_gprint(gdes[i].vname, gdes[i].cf, gdes[i].format, gdes[i].strftm);
				break;
// 			LINE[width]:value[#color][:[legend][:STACK]][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case 'LINE':
					this.graph.gdes_add_line(gdes[i].width, gdes[i].value, gdes[i].color, gdes[i].legend, gdes[i].stack, gdes[i].dashes, gdes[i].dash_offset);
					break;
// 			AREA:value[#color][:[legend][:STACK]]
				case 'AREA':
					this.graph.gdes_add_area(gdes[i].value, gdes[i].color, gdes[i].legend, gdes[i].stack);
				break;
// 			TICK:vname#rrggbb[aa][:fraction[:legend]]
				case 'TICK':
					this.graph.gdes_add_tick(gdes[i].vname, gdes[i].color, gdes[i].fraction, gdes[i].legend);
					break;
// 			HRULE:value#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case 'HRULE':
					this.graph.gdes_add_hrule(gdes[i].value, gdes[i].color, gdes[i].legend, gdes[i].dashes, gdes[i].dash_offset);
					break;
// 			VRULE:time#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case 'VRULE':
					this.graph.gdes_add_vrule(gdes[i].time, gdes[i].color, gdes[i].legend, gdes[i].dashes, gdes[i].dash_offset);
				break;
// 			COMMENT:text
				case 'COMMENT':
					this.graph.gdes_add_comment(gdes[i].legend);
					break;
// 			TEXTALIGN:{left|right|justified|center}
				case 'TEXTALIGN':
					switch (gdes[i].align) {
						case 'left':
							this.graph.gdes_add_textalign(RrdGraphDesc.TXA_LEFT);
							break;
						case 'right':
							this.graph.gdes_add_textalign(RrdGraphDesc.TXA_RIGHT);
							break;
						case 'justified':
							this.graph.gdes_add_textalign(RrdGraphDesc.TXA_JUSTIFIED);
							break;
						case 'center':
							this.graph.gdes_add_textalign(RrdGraphDesc.TXA_CENTER);
							break;
					}
				break;
//	 		DEF:<vname>=<rrdfile>:<ds-name>:<CF>[:step=<step>][:start=<time>][:end=<time>][:reduce=<CF>]
				case 'DEF':
					this.graph.gdes_add_def(gdes[i].vname, gdes[i].rrdfile, gdes[i].name, gdes[i].cf, gdes[i].step, gdes[i].start, gdes[i].end, gdes[i].reduce);
				break;
//	 		CDEF:vname=RPN expression
				case 'CDEF':
					this.graph.gdes_add_cdef(gdes[i].vname, gdes[i].rpn);
					break;
// 			VDEF:vname=RPN expression
				case 'VDEF':
					this.graph.gdes_add_vdef(gdes[i].vname, gdes[i].rpn);
					break;
// 			SHIFT:vname:offset
				case 'SHIFT':
					this.graph.gdes_add_shift(gdes[i].vname, gdes[i].offset);
					break;
			}
		}
	},
	dump: function(full)
	{
		this.json = {};

		if (full === undefined) full = false;

		if (this.graph.alt_autoscale != false || full) 
			this.json.alt_autoscale = this.graph.alt_autoscale;

		if (this.graph.base != 1000 || full)
			this.json.base = this.graph.base;

		this.json.color = {};

		if (this.graph.GRC.CANVAS != 'rgba(255, 255, 255, 1.0)' || full)
			this.json.color.CANVAS = this.graph.GRC.CANVAS;
		if (this.graph.GRC.BACK != 'rgba(242,242, 242, 1.0)' || full)
			this.json.color.BACK = this.graph.GRC.BACK;
		if (this.graph.GRC.SHADEA != 'rgba(207, 207, 207, 1.0)' || full)
			this.json.color.SHADEA = this.graph.GRC.SHADEA;
		if (this.graph.GRC.SHADEB != 'rgba(158, 158, 158, 1.0)' || full)
			this.json.color.SHADEB = this.graph.GRC.SHADEB;
		if (this.graph.GRC.GRID != 'rgba(143, 143, 143, 0.75)' || full)
			this.json.color.GRID = this.graph.GRC.GRID;
		if (this.graph.GRC.MGRID != 'rgba(222, 79, 79, 0.60)' || full)
			this.json.color.MGRID = this.graph.GRC.MGRID;
		if (this.graph.GRC.FONT != 'rgba(0, 0, 0, 1.0)' || full)
			this.json.color.FONT = this.graph.GRC.FONT;
		if (this.graph.GRC.ARROW != 'rgba(127, 31, 31, 1.0)' || full)
			this.json.color.ARROW = this.graph.GRC.ARROW;
		if (this.graph.GRC.AXIS != 'rgba(31, 31, 31, 1.0)' || full)
			this.json.color.AXIS = this.graph.GRC.AXIS;
		if (this.graph.GRC.FRAME != 'rgba(0, 0, 0, 1.0)' || full)
			this.json.color.FRAME = this.graph.GRC.FRAME;

		if (!Object.keys(this.json.color).length)  delete this.json.color;

		if (this.graph.full_size_mode != false || full)
			this.json.full_size_mode = this.graph.full_size_mode;

		if (this.graph.slopemode != false || full)
			this.json.slope_mode = this.graph.slopemode;

		this.json.end = this.graph.end_t.tspec;
		this.json.start = this.graph.start_t.tspec;

		if (this.graph.force_rules_legend != false || full)
			this.json.force_rules_legend = this.graph.force_rules_legend;

		if (this.graph.no_legend != false || full)
			this.json.no_legend = this.graph.no_legend;

		this.json.width = this.graph.xsize;
		this.json.height = this.graph.ysize;

		if (this.graph.no_minor != false || full)
			this.json.no_minor = this.graph.no_minor;

		if (this.graph.alt_autoscale_min != false || full)
			this.json.alt_autoscale_min = this.graph.alt_autoscale_min;

		if (this.graph.only_graph != false || full)
			this.json.only_graph = this.graph.only_graph;

		if (this.graph.unitslength != 6 || full)
			this.json.units_length = this.graph.unitslength;

		if (!isNaN(this.graph.setminval) || full)
			this.json.lower_limit = this.graph.setminval;

		if (this.graph.alt_autoscale_max != false || full)
			this.json.alt_autoscale_max = this.graph.alt_autoscale_max;

		if (this.graph.zoom != 1 || full) 
			this.json.zoom = this.graph.zoom;

		if (this.graph.gridfit != true || full)
			this.json.no_gridfit = this.graph.gridfit;

		this.json.font = {};
		if (this.graph.TEXT.DEFAULT.size != 11 || this.graph.TEXT.LEGEND.font != this.graph.DEFAULT_FONT || full)
			this.json.font.DEFAULT = { size: this.graph.TEXT.DEFAULT.size, font: this.graph.TEXT.DEFAULT.font};
		if (this.graph.TEXT.TITLE.size != 12 || this.graph.TEXT.TITLE.font != this.graph.DEFAULT_FONT || full)
			this.json.font.TITLE = { size: this.graph.TEXT.TITLE.size, font: this.graph.TEXT.TITLE.font};
		if (this.graph.TEXT.AXIS.size != 10 || this.graph.TEXT.AXIS.font != this.graph.DEFAULT_FONT || full) 
			this.json.font.AXIS = { size: this.graph.TEXT.AXIS.size, font: this.graph.TEXT.AXIS.font};
		if (this.graph.TEXT.UNIT.size != 11 || this.graph.TEXT.UNIT.font != this.graph.DEFAULT_FONT || full)
			this.json.font.UNIT = { size: this.graph.TEXT.UNIT.size, font: this.graph.TEXT.UNIT.font};
		if (this.graph.TEXT.LEGEND.size != 11 || this.graph.TEXT.LEGEND.font != this.graph.DEFAULT_FONT || full)
			this.json.font.LEGEND = { size: this.graph.TEXT.LEGEND.size, font: this.graph.TEXT.LEGEND.font};
		if (this.graph.TEXT.WATERMARK.size != 8 || this.graph.TEXT.WATERMARK.font != this.graph.DEFAULT_FONT || full)
			this.json.font.WATERMARK = { size: this.graph.TEXT.WATERMARK.size, font: this.graph.TEXT.WATERMARK.font};

		if (!Object.keys(this.json.font).length)  delete this.json.font;

		if (this.graph.logarithmic != false || full)
			this.json.logarithmic = this.graph.logarithmic;

		if (this.graph.rigid != false || full)
			this.json.rigid = this.graph.rigid;

//	this.json.step = this.graph.step; // FIXME

		if (this.graph.tabwidth != 40 || full)
			this.json.tabwidth = this.graph.tabwidth;

		if (this.graph.title != '' || full)
			this.json.title = this.graph.title;

		if (!isNaN(this.graph.setmaxval) || full)
			this.json.upper_limit = this.graph.setmaxval;

		if (this.graph.ylegend != null || full)
			this.json.vertical_label = this.graph.ylegend;

		if (this.graph.watermark != null || full)
			this.json.watermark = this.graph.watermark;

		if (this.graph.unitsexponent != 9999 || full)
			this.json.units_exponent = this.graph.unitsexponent;

//		this.json.x-grid =  // FIXME

		if (this.graph.alt_ygrid != false || full)
			this.json.alt_ygrid = this.graph.alt_ygrid;

//		this.json.y_grid =  // FIXME

//		this.json.lazy = this.graph.lazy;

		if (this.graph.force_units_si != false || full)
			this.json.units = 'si'; // FIXME

		if (this.graph.no_rrdtool_tag != false || full)
			this.json.disable_rrdtool_tag = this.graph.no_rrdtool_tag;

//		this.json.right_axis = FIXME

		if (this.graph.second_axis_legend != null || full)
			this.json.right_axis_label = this.graph.second_axis_legend;
		if (this.graph.second_axis_format != null || full)
			this.json.right_axis_format =  this.graph.second_axis_format;

//		this.json.legendposition = this.graph.legendposition; // FIXME
//		this.json.legend-direction = this.graph.legenddirection; // FIXME

		if (this.graph.draw_3d_border != 2 || full)
			this.json.border = this.graph.draw_3d_border;

		if (this.graph.grid_dash_on != 1 || this.graph.grid_dash_off != 1 || full)
			this.json.grid_dash = [this.graph.grid_dash_on, this.graph.grid_dash_off];

		if (this.graph.dynamic_labels != false || full)
			this.json.dynamic_labels = this.graph.dynamic_labels;

		this.json.gdes = [];
		for (var i = 0, gdes_c = this.graph.gdes.length; i < gdes_c; i++) {
			switch (this.graph.gdes[i].gf) {
// 			GPRINT:vname:format
				case RrdGraphDesc.GF_GPRINT:
					this.json.gdes.push({
						type: 'GPRINT',
						vname: this.graph.gdes[i].vname,
						cf:	RrdGraphDesc.cf2str(this.graph.gdes[i].cf),
						format: this.graph.gdes[i].format,
						strftm: (this.graph.gdes[i].strftm === false ? undefined : this.graph.gdes[i].strftm) });
					break;
// 			LINE[width]:value[#color][:[legend][:STACK]][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case RrdGraphDesc.GF_LINE:
					this.json.gdes.push({
						type: 'LINE',
						width: this.graph.gdes[i].linewidth,
						value: this.graph.gdes[i].vname,
						color: this.graph.gdes[i].col,
						legend: (this.graph.gdes[i].legend === '' ? undefined : this.graph.gdes[i].legend.substr(2)),
						stack: (this.graph.gdes[i].stack === false ? undefined : this.graph.gdes[i].stack),
						dashes: (this.graph.gdes[i].dash === false ? undefined : this.graph.gdes[i].p_dashes),
						dash_offset: this.graph.gdes[i].offset });
					break;
// 			AREA:value[#color][:[legend][:STACK]]
				case RrdGraphDesc.GF_AREA:
					this.json.gdes.push({
						type: 'AREA',
						value: this.graph.gdes[i].vname,
						color: this.graph.gdes[i].col,
						legend: (this.graph.gdes[i].legend === '' ? undefined : this.graph.gdes[i].legend.substr(2)),
						stack: (this.graph.gdes[i].stack === false ? undefined : this.graph.gdes[i].stack) });
					break;
// 			TICK:vname#rrggbb[aa][:fraction[:legend]]
				case RrdGraphDesc.GF_TICK:
					this.json.gdes.push({
						type: 'TICK',
						vname: this.graph.gdes[i].vname,
						color: this.graph.gdes[i].col,
						fraction: this.graph.gdes[i].yrule,
						legend: (this.graph.gdes[i].legend === '' ? undefined : this.graph.gdes[i].legend.substr(2)) });
					break;
// 			HRULE:value#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case RrdGraphDesc.GF_HRULE:
					this.json.gdes.push({
						type: 'HRULE',
						value: this.graph.gdes[i].yrule,
						color: this.graph.gdes[i].col,
						legend: (this.graph.gdes[i].legend === '' ? undefined : this.graph.gdes[i].legend.substr(2)),
						dashes: (this.graph.gdes[i].dash === false ? undefined : this.graph.gdes[i].p_dashes),
						dash_offset: this.graph.gdes[i].offset });
					break;
// 			VRULE:time#color[:legend][:dashes[=on_s[,off_s[,on_s,off_s]...]][:dash-offset=offset]]
				case RrdGraphDesc.GF_VRULE:
					this.json.gdes.push({
						type: 'VRULE',
						time: this.graph.gdes[i].xrule,
						color: this.graph.gdes[i].col,
						legend: (this.graph.gdes[i].legend === '' ? undefined : this.graph.gdes[i].legend.substr(2)),
						dashes: (this.graph.gdes[i].dash === false ? undefined : this.graph.gdes[i].p_dashes),
						dash_offset: this.graph.gdes[i].offset });
					break;
// 			COMMENT:text
				case RrdGraphDesc.GF_COMMENT:
					this.json.gdes.push({
						type: 'COMMENT',
						legend: this.graph.gdes[i].legend});
					break;
// 			TEXTALIGN:{left|right|justified|center}
				case RrdGraphDesc.GF_TEXTALIGN:
					var align = '';
					switch (this.graph.gdes[i].txtalign) {
						case RrdGraphDesc.TXA_LEFT:
							align = 'left';	
							break;
						case RrdGraphDesc.TXA_RIGHT:
							align = 'right';
							break;
						case RrdGraphDesc.TXA_JUSTIFIED:
							align = 'justified';
							break;
						case RrdGraphDesc.TXA_CENTER:
							align = 'center';
							break;
					}

					this.json.gdes.push({
						type: 'TEXTALIGN',
						align: align });
					break;
// 			DEF:<vname>=<rrdfile>:<ds-name>:<CF>[:step=<step>][:start=<time>][:end=<time>][:reduce=<CF>]
				case RrdGraphDesc.GF_DEF:
					this.json.gdes.push({
						type: 'DEF',
						vname: this.graph.gdes[i].vname,
						rrdfile: this.graph.gdes[i].rrd,
						name: this.graph.gdes[i].ds_nam,
						cf: RrdGraphDesc.cf2str(this.graph.gdes[i].cf),
//						step: this.graph.gdes[i].step,
						step: undefined,
						start: undefined,
				//		start: this.graph.gdes[i].start, // FIXME
						end: undefined,
			//			end: this.graph.gdes[i].end, // FIXME
			//			reduce: RrdGraphDesc.cf2str(this.graph.gdes[i].cf_reduce)
						reduce: undefined
					});

					break;
// 			CDEF:vname=RPN expression
				case RrdGraphDesc.GF_CDEF:
					this.json.gdes.push({
						type: 'CDEF',
						vname: this.graph.gdes[i].vname,
						rpn: this.graph.gdes[i].rpnp.rpnexpr});
					break;
// 			VDEF:vname=RPN expression
				case RrdGraphDesc.GF_VDEF:
					this.json.gdes.push({
						type: 'VDEF',
						vname: this.graph.gdes[i].vname,
						rpn: this.graph.gdes[this.graph.gdes[i].vidx].vname+','+this.graph.gdes[i].vf.expr});
					break;
// 			SHIFT:vname:offset
				case RrdGraphDesc.GF_SHIFT:
					this.json.gdes.push({
						type: 'VDEF',
						vname: this.graph.gdes[i].vname,
						offset: this.shidx });
					break;
			}
		}
	}
};
