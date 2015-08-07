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

 * RRDtool 1.4.5  Copyright by Tobi Oetiker, 1997-2010
 *
 * Convert to javascript: Manuel Sanmartin <manuel.luis at gmail.com>
 **/

"use strict";

/**
 * RrdGraphDescError
 * @constructor
 */
var RrdGraphDescError = function (message)
{
	this.name = "RrdGraphDescError";
	this.message = (message) ? message : "Error";
};
RrdGraphDescError.prototype = new Error();

/**
 * RrdGraphDesc
 * @constructor
 */
var RrdGraphDesc = function (graph)
{
	this.gf = null;      /* graphing function */
	this.stack = false;    /* boolean */
	this.debug = false;    /* boolean */
	this.vname = null;     /* name of the variable */
	this.vidx = Number.NaN;     /* gdes reference */
	this.rrd = null;    /* name of the rrd_file containing data */
	this.ds_nam = null;  /* data source name */
	this.ds = -1;       /* data source number */
	this.cf = RrdGraphDesc.CF_AVERAGE;      /* consolidation function */
	this.cf_reduce = RrdGraphDesc.CF_AVERAGE;   /* consolidation function for reduce_data() */
	this.col = null; /* graph color */
	this.format = null;  /* format for PRINT AND GPRINT */
	this.legend = null;  /* legend */
	this.strftm = false;   /* should the VDEF legend be formated with strftime */
	this.leg_x = 0; /* location of legend */
	this.leg_y = 0;
	this.yrule = Number.NaN;    /* value for y rule line and for VDEF */
	this.xrule = 0;    /* time for x rule line and for VDEF */
	this.vf = null;       /* instruction for VDEF function */
	this.rpnp = null;     /* instructions for CDEF function */

	/* SHIFT implementation */
	this.shidx = 0;    /* gdes reference for offset (-1 --> constant) */
	this.shval = 0;    /* offset if shidx is -1 */
	this.shift = 0;    /* current shift applied */

	/* description of data fetched for the graph element */
	this.start = graph.start;   /* timestaps for first and last data element */
	this.end = graph.end;
	this.start_orig = graph.start; /* timestaps for first and last data element */
	this.end_orig = graph.end;
	this.step = graph.step; /* time between samples */
	this.step_orig = graph.step;    /* time between samples */
	this.ds_cnt = 0;   /* how many data sources are there in the fetch */
	this.data_first = 0;   /* first pointer to this data */
	this.ds_namv = [];  /* name of datasources  in the fetch. */
	this.data = [];  /* the raw data drawn from the rrd */
	this.p_data = [];    /* processed data, xsize elments */
	this.linewidth = 0;    /* linewideth */

	/* dashed line stuff */
	this.dash = false;     /* boolean, draw dashed line? */
	this.p_dashes = []; /* pointer do dash array which keeps the lengths of dashes */
	this.ndash = false;    /* number of dash segments */
	this.offset = 0;   /* dash offset along the line */

	this.txtalign = 0;   /* change default alignment strategy for text */

	/** ** **/
	var args = []; // FIXME other way ¿?
	var type = arguments[1];
	args[0] = arguments[0];
	for(var i = 2; i < arguments.length; i++) args[i-1] = arguments[i];

	switch (type) {
		case RrdGraphDesc.GF_GPRINT:
			this.gprint.apply(this, args);
			break;
		case RrdGraphDesc.GF_COMMENT:
			this.comment.apply(this, args);
			break;
		case RrdGraphDesc.GF_HRULE:
			this.hrule.apply(this, args);
			break;
		case RrdGraphDesc.GF_VRULE:
			this.vrule.apply(this, args);
			break;
		case RrdGraphDesc.GF_LINE:
			this.line.apply(this, args);
			break;
		case RrdGraphDesc.GF_AREA:
			this.area.apply(this, args);
			break;
		case RrdGraphDesc.GF_TICK:
			this.tick.apply(this, args);
			break;
		case RrdGraphDesc.GF_TEXTALIGN:
			this.textalign.apply(this, args);
			break;
		case RrdGraphDesc.GF_DEF:
			this.def.apply(this, args);
			break;
		case RrdGraphDesc.GF_CDEF:
			this.cdef.apply(this, args);
			break;
		case RrdGraphDesc.GF_VDEF:
			this.vdef.apply(this, args);
			break;
		case RrdGraphDesc.GF_SHIFT:
			this.fshift.apply(this, args);
			break;
	}
};

RrdGraphDesc.GF_PRINT = 0;
RrdGraphDesc.GF_GPRINT = 1;
RrdGraphDesc.GF_COMMENT = 2;
RrdGraphDesc.GF_HRULE = 3;
RrdGraphDesc.GF_VRULE = 4;
RrdGraphDesc.GF_LINE = 5;
RrdGraphDesc.GF_AREA = 6;
RrdGraphDesc.GF_STACK = 7;
RrdGraphDesc.GF_TICK = 8;
RrdGraphDesc.GF_TEXTALIGN = 9;
RrdGraphDesc.GF_DEF = 10;
RrdGraphDesc.GF_CDEF = 11;
RrdGraphDesc.GF_VDEF = 12;
RrdGraphDesc.GF_SHIFT = 13;
RrdGraphDesc.GF_XPORT = 14;

RrdGraphDesc.CF_AVERAGE = 0;
RrdGraphDesc.CF_MINIMUM = 1;
RrdGraphDesc.CF_MAXIMUM = 2;
RrdGraphDesc.CF_LAST = 3;
RrdGraphDesc.CF_HWPREDICT = 4;
RrdGraphDesc.CF_SEASONAL = 5;
RrdGraphDesc.CF_DEVPREDICT = 6;
RrdGraphDesc.CF_DEVSEASONAL = 7;
RrdGraphDesc.CF_FAILURES = 8;
RrdGraphDesc.CF_MHWPREDICT = 9;

RrdGraphDesc.TXA_LEFT = 0;
RrdGraphDesc.TXA_RIGHT = 1;
RrdGraphDesc.TXA_CENTER = 2;
RrdGraphDesc.TXA_JUSTIFIED = 3;

RrdGraphDesc.cf_conv = function (str)
{
	switch (str){
		case 'AVERAGE': return RrdGraphDesc.CF_AVERAGE;
		case 'MIN': return RrdGraphDesc.CF_MINIMUM;
		case 'MAX': return RrdGraphDesc.CF_MAXIMUM;
		case 'LAST': return RrdGraphDesc.CF_LAST;
		case 'HWPREDICT': return RrdGraphDesc.CF_HWPREDICT;
		case 'MHWPREDICT': return RrdGraphDesc.CF_MHWPREDICT;
		case 'DEVPREDICT': return RrdGraphDesc.CF_DEVPREDICT;
		case 'SEASONAL': return RrdGraphDesc.CF_SEASONAL;
		case 'DEVSEASONAL': return RrdGraphDesc.CF_DEVSEASONAL;
		case 'FAILURES': return RrdGraphDesc.CF_FAILURES;
	}
	return -1;
};

RrdGraphDesc.cf2str = function (cf) 
{
	switch (cf){
		case RrdGraphDesc.CF_AVERAGE: return 'AVERAGE';
		case RrdGraphDesc.CF_MINIMUM: return 'MIN';
		case RrdGraphDesc.CF_MAXIMUM: return 'MAX';
		case RrdGraphDesc.CF_LAST: return 'LAST';
		case RrdGraphDesc.CF_HWPREDICT: return 'HWPREDICT';
		case RrdGraphDesc.CF_MHWPREDICT: return 'MHWPREDICT';
		case RrdGraphDesc.CF_DEVPREDICT: return 'DEVPREDICT';
		case RrdGraphDesc.CF_SEASONAL: return 'SEASONAL';
		case RrdGraphDesc.CF_DEVSEASONAL: return 'DEVSEASONAL';
		case RrdGraphDesc.CF_FAILURES: return 'FAILURES';
	}
	return '';
};

RrdGraphDesc.prototype.def = function (graph, vname, rrdfile, name, cf, step, start, end, reduce)
{
	var start_t = new RrdTime(this.start);
	var end_t = new RrdTime(this.end);

	this.gf = RrdGraphDesc.GF_DEF;
	this.vname = vname;
	this.vidx = graph.find_var(vname);
	this.rrd = rrdfile;
	this.ds_nam = name;
	this.cf = RrdGraphDesc.cf_conv(cf);

	if (step != undefined && step != null) {
		this.step = step;
		this.step_orig = step;
	}
	if (start != undefined && start != null)
		start_t = new RrdTime(start);
	if (end != undefined && end != null)
		end_t = new RrdTime(end);
	if (reduce  === undefined || reduce === null)
		this.cf_reduce = this.cf; // ¿?
	else
		this.cf_reduce = RrdGraphDesc.cf_conv(reduce);
	this.legend = '';

	var start_end = RrdTime.proc_start_end(start_t, end_t); // FIXME here?
	this.start = start_end[0];
	this.end = start_end[1];
	this.start_orig = start_end[0];
	this.end_orig = start_end[1];
};

RrdGraphDesc.prototype.cdef = function (graph, vname, rpn)
{
	this.gf = RrdGraphDesc.GF_CDEF;
	this.vname = vname;
	this.vidx = graph.find_var(vname);
	this.rpnp = new RrdRpn(rpn, graph.gdes);
	this.legend = '';
};

RrdGraphDesc.prototype.vdef = function (graph, vname, rpn)
{
	this.gf = RrdGraphDesc.GF_VDEF;
	this.vname = vname;

	var index = rpn.indexOf(',');
	var name = rpn.substring(0,index);
	this.vidx = graph.find_var(name); // FIXME checks
	if (graph.gdes[this.vidx].gf != RrdGraphDesc.GF_DEF && graph.gdes[this.vidx].gf != RrdGraphDesc.GF_CDEF) {
		throw new RrdGraphDescError('variable "'+name+'" not DEF nor CDEF in VDEF.');
	}
	this.vf = new RrdVdef(name, rpn.substring(index+1));
	this.legend = '';
};

RrdGraphDesc.prototype.fshift = function (graph, vname, offset)
{
	this.gf = RrdGraphDesc.GF_SHIFT;
	this.vname = vname; // ¿?
	this.vidx = graph.find_var(vname); // FIXME checks

	if (graph.gdes[this.vidx].gf === RrdGraphDesc.GF_VDEF)
		throw new RrdGraphDescError("Cannot shift a VDEF: '%s' in line '"+graph.gdes[this.vidx].vname+"'");
	if (graph.gdes[this.vidx].gf !== RrdGraphDesc.GF_DEF && graph.gdes[this.vidx].gf !== RrdGraphDesc.GF_CDEF)
		throw new RrdGraphDescError("Encountered unknown type variable '"+graph.gdes[this.vidx].vname+"'");

	this.shidx = graph.find_var(offset);
	if (this.shidx >= 0) {
		if  (graph.gdes[this.shidx].gf === RrdGraphDesc.GF_DEF || graph.gdes[this.shidx].gf === RrdGraphDesc.GF_CDEF)
			throw new RrdGraphDescError("Offset cannot be a (C)DEF: '"+graph.gdes[this.shidx].gf+"'");
		if  (graph.gdes[this.shidx].gf !== RrdGraphDesc.GF_VDEF)
			throw new RrdGraphDescError("Encountered unknown type variable '"+graph.gdes[this.shidx].vname+"'");
	} else {
		this.shval = parseInt(offset, 10); // FIXME check
		this.shidx = -1;
	}
	this.legend = '';
};

RrdGraphDesc.prototype.line = function (graph, width, value, color, legend, stack, dashes, dash_offset)
{
	this.gf = RrdGraphDesc.GF_LINE;
	this.vname = value;
	this.vidx = graph.find_var(value);
	this.linewidth = width;
	this.col = color;
	if (legend === undefined) this.legend = '';
	else if (legend.length === 0) this.legend = '';
	else this.legend = '  '+legend;
	if (stack === undefined) this.stack = false;
	else this.stack = stack;
	this.format = this.legend;

	if (dashes != undefined) {
		this.dash = true;
		this.p_dashes = dashes;
		this.ndash = dashes.length;
	}
	if (dash_offset !=undefined) {
		this.offset = dash_offset;
	}
};

RrdGraphDesc.prototype.area = function (graph, value, color, legend, stack)
{
	this.gf = RrdGraphDesc.GF_AREA;
	this.vname = value;
	this.vidx = graph.find_var(value);
	this.col = color;
	if (legend === undefined) this.legend = '';
	else if (legend.length === 0) this.legend = '';
	else this.legend = '  '+legend;
	if (stack === undefined) this.stack = false;
	else this.stack = stack;
	this.format = this.legend;
};

RrdGraphDesc.prototype.tick = function (graph, vname, color, fraction, legend)
{
	this.gf = RrdGraphDesc.GF_TICK;
	this.vname = vname;
	this.vidx = graph.find_var(vname);
	this.col = color;
	if (fraction !== undefined)
		this.yrule = fraction;
	else
		this.yrule = 0.1;
	if (legend === undefined) this.legend = '';
	else if (legend.length === 0) this.legend = '';
	else this.legend = '  '+legend;
	this.format = this.legend;
};

RrdGraphDesc.prototype.gprint = function (graph, vname, cf, format, strftimefmt)
{
	this.gf = RrdGraphDesc.GF_GPRINT;
	this.vname = vname;
	this.vidx = graph.find_var(vname);
	this.legend = '';
	if (this.vidx == -1) {
		throw new RrdGraphDescError("Cannot find var name: " + vname);
	}
	if (!format) {
		this.format = cf;
		switch (graph.gdes[this.vidx].gf) {
			case RrdGraphDesc.GF_DEF:
			case RrdGraphDesc.GF_CDEF:
				this.cf = graph.gdes[this.vidx].cf;
				break;
			case RrdGraphDesc.GF_VDEF:
				break;
			default:
				throw new RrdGraphDescError("Encountered unknown type variable "+graph.gdes[this.vidx].vname);
		}
	} else {
		this.cf = RrdGraphDesc.cf_conv(cf);
		this.format = format;
	}
	if (graph.gdes[this.vidx].gf === RrdGraphDesc.GF_VDEF && strftimefmt === true)
		this.strftm = true;
};

RrdGraphDesc.prototype.comment = function (graph, text)
{
	this.gf = RrdGraphDesc.GF_COMMENT;
	this.vidx = -1;
	this.legend = text;
};

RrdGraphDesc.prototype.textalign = function (graph, align)
{
	this.gf = RrdGraphDesc.GF_TEXTALIGN;
	this.vidx = -1;
	if (align === "left") {
		this.txtalign = RrdGraphDesc.TXA_LEFT;
	} else if (align === "right") {
		this.txtalign = RrdGraphDesc.TXA_RIGHT;
	} else if (align === "justified") {
		this.txtalign = RrdGraphDesc.TXA_JUSTIFIED;
	} else if (align === "center") {
		this.txtalign = RrdGraphDesc.TXA_CENTER;
	} else {
		throw new RrdGraphDescError("Unknown alignement type '"+align+"'");
	}
};

RrdGraphDesc.prototype.vrule = function (graph, time, color, legend, dashes, dash_offset)
{
	this.gf = RrdGraphDesc.GF_VRULE;
	this.xrule = time;
	this.col = color;
	if (legend === undefined) this.legend = '';
	else if (legend.length === 0) this.legend = '';
	else this.legend = '  '+legend;

	if (dashes != undefined) {
		this.dash = true;
		this.p_dashes = dashes;
		this.ndash = dashes.length;
	}
	if (dash_offset !=undefined) {
		this.offset = dash_offset;
	}
};

RrdGraphDesc.prototype.hrule = function (graph, value, color, legend, dashes, dash_offset)
{
	this.gf = RrdGraphDesc.GF_HRULE;
	this.vidx = graph.find_var(value);
	if (this.vidx == -1)
		this.yrule = value;
	this.col = color;
	if (legend === undefined) this.legend = '';
	else if (legend.length === 0) this.legend = '';
	else this.legend = '  '+legend;

	if (dashes != undefined) {
		this.dash = true;
		this.p_dashes = dashes;
		this.ndash = dashes.length;
	}
	if (dash_offset !=undefined) {
		this.offset = dash_offset;
	}
};

/**
 * RrdVdefError
 * @constructor
 */
var RrdVdefError = function (message)
{
	this.name = "RrdVdefError";
	this.message = (message) ? message : "Error";
};
RrdVdefError.prototype = new Error();


/**
 * RrdVdef
 * @constructor
 */
var RrdVdef = function(vname, str) /* parse */
{
	var param;
	var func;
	var n = 0;

	this.expr = str;
	this.op = null;
	this.param = null;
	this.val = null;
	this.when = null;

	var index = str.indexOf(',');
	if (index != -1) {
		param = parseFloat(str.substr(0,index));
		func = str.substr(index+1);
	} else {
		param = Number.NaN;
		func = str;
	}

	if (func === 'PERCENT') this.op = RrdVdef.VDEF_PERCENT;
	else if (func === 'PERCENTNAN') this.op = RrdVdef.VDEF_PERCENTNAN;
	else if (func === 'MAXIMUM') this.op = RrdVdef.VDEF_MAXIMUM;
	else if (func === 'AVERAGE') this.op = RrdVdef.VDEF_AVERAGE;
	else if (func === 'STDEV') this.op = RrdVdef.VDEF_STDEV;
	else if (func === 'MINIMUM') this.op = RrdVdef.VDEF_MINIMUM;
	else if (func === 'TOTAL') this.op = RrdVdef.VDEF_TOTAL;
	else if (func === 'FIRST') this.op = RrdVdef.VDEF_FIRST;
	else if (func === 'LAST') this.op = RrdVdef.VDEF_LAST;
	else if (func === 'LSLSLOPE') this.op = RrdVdef.VDEF_LSLSLOPE;
	else if (func === 'LSLINT') this.op = RrdVdef.VDEF_LSLINT;
	else if (func === 'LSLCORREL') this.op = RrdVdef.VDEF_LSLCORREL;
	else {
		throw new RrdVdefError('Unknown function "'+func+'" in VDEF "'+vname+'"');
	}

	switch (this.op) {
		case RrdVdef.VDEF_PERCENT:
		case RrdVdef.VDEF_PERCENTNAN:
			if (isNaN(param)) { /* no parameter given */
				throw new RrdVdefError("Function '"+func+"' needs parameter in VDEF '"+vname+"'");
			}
			if (param >= 0.0 && param <= 100.0) {
				this.param = param;
				this.val = Number.NaN;    /* undefined */
				this.when = 0;  /* undefined */
			} else {
				throw new RrdVdefError("Parameter '"+param+"' out of range in VDEF '"+vname+"'");
			}
			break;
		case RrdVdef.VDEF_MAXIMUM:
		case RrdVdef.VDEF_AVERAGE:
		case RrdVdef.VDEF_STDEV:
		case RrdVdef.VDEF_MINIMUM:
		case RrdVdef.VDEF_TOTAL:
		case RrdVdef.VDEF_FIRST:
		case RrdVdef.VDEF_LAST:
		case RrdVdef.VDEF_LSLSLOPE:
		case RrdVdef.VDEF_LSLINT:
		case RrdVdef.VDEF_LSLCORREL:
			if (isNaN(param)) {
				this.param = Number.NaN;
				this.val = Number.NaN;
				this.when = 0;
			} else {
				throw new RrdVdefError("Function '"+func+"' needs no parameter in VDEF '"+vname+"'");
			}
			break;
	}
};

RrdVdef.VDEF_MAXIMUM = 0;
RrdVdef.VDEF_MINIMUM = 1;
RrdVdef.VDEF_AVERAGE = 2;
RrdVdef.VDEF_STDEV = 3;
RrdVdef.VDEF_PERCENT = 4;
RrdVdef.VDEF_TOTAL = 5;
RrdVdef.VDEF_FIRST = 6;
RrdVdef.VDEF_LAST = 7;
RrdVdef.VDEF_LSLSLOPE = 8;
RrdVdef.VDEF_LSLINT = 9;
RrdVdef.VDEF_LSLCORREL = 10;
RrdVdef.VDEF_PERCENTNAN = 11;

RrdVdef.prototype.vdef_percent_compar = function (a, b)
{ /* Equality is not returned; this doesn't hurt except (maybe) for a little performance.  */
	/* NaN < -INF < finite_values < INF */
	if (isNaN(a)) return -1;
	if (isNaN(b)) return 1;
	/* NaN doesn't reach this part so INF and -INF are extremes.  The sign from isinf() is compatible with the sign we return */
	if (!isFinite(a)) {
		if (a === -Infinity) return -1;
		else return 1;
	}
	if (!isFinite(b)) {
		if (b === -Infinity) return -1;
		else return 1;
	}
	/* If we reach this, both values must be finite */
	if (a < b) return -1;
	else return 1;
};

RrdVdef.prototype.calc = function(src)
{
	var data;
	var step, steps;
	var array = [];
	var field;
	var cnt = 0;

	data = src.data;
	steps = (src.end - src.start) / src.step;

	switch (this.op) {
		case RrdVdef.VDEF_PERCENT:
			for (step = 0; step < steps; step++) {
				array[step] = data[step * src.ds_cnt];
			}
			array.sort(this.vdef_percent_compar);
			field = Math.round((this.param * (steps - 1)) / 100.0);
			this.val = array[field];
			this.when = 0;   /* no time component */
			break;
		case RrdVdef.VDEF_PERCENTNAN:
			field=0;
			for (step = 0; step < steps; step++) {
				if (!isNaN(data[step * src.ds_cnt])) {
					array[field] = data[step * src.ds_cnt];
				}
			}
			array.sort(this.vdef_percent_compar);
			field = Math.round(this.param * (field - 1) / 100.0);
			this.val = array[field];
			this.when = 0;   /* no time component */
			break;
		case RrdVdef.VDEF_MAXIMUM:
			step = 0;
			while (step != steps && isNaN(data[step * src.ds_cnt])) step++;
			if (step === steps) {
				this.val = Number.NaN;
				this.when = 0;
			} else {
				this.val = data[step * src.ds_cnt];
				this.when = src.start + (step + 1) * src.step;
			}
			while (step != steps) {
				if (isFinite(data[step * src.ds_cnt])) {
					if (data[step * src.ds_cnt] > this.val) {
						this.val = data[step * src.ds_cnt];
						this.when = src.start + (step + 1) * src.step;
					}
				}
				step++;
			}
			break;
		case RrdVdef.VDEF_TOTAL:
		case RrdVdef.VDEF_STDEV:
		case RrdVdef.VDEF_AVERAGE:
			var sum = 0.0;
			var average = 0.0;

			for (step = 0; step < steps; step++) {
				if (isFinite(data[step * src.ds_cnt])) {
					sum += data[step * src.ds_cnt];
					cnt++;
				}
			}

			if (cnt) {
				if (this.op === RrdVdef.VDEF_TOTAL) {
					this.val = sum * src.step;
					this.when = 0;   /* no time component */
				} else if (this.op === RrdVdef.VDEF_AVERAGE) {
					this.val = sum / cnt;
					this.when = 0;   /* no time component */
				} else {
					average = sum / cnt;
					sum = 0.0;
					for (step = 0; step < steps; step++) {
						if (isFinite(data[step * src.ds_cnt])) {
							sum += Math.pow((data[step * src.ds_cnt] - average), 2.0);
						}
					}
					this.val = Math.pow(sum / cnt, 0.5);
					this.when = 0;   /* no time component */
				}
			} else {
				this.val = Number.NaN;
				this.when = 0;
			}
			break;
		case RrdVdef.VDEF_MINIMUM:
			step = 0;
			while (step != steps && isNaN(data[step * src.ds_cnt])) step++;
			if (step === steps) {
				this.val = Number.NaN;
				this.when = 0;
			} else {
				this.val = data[step * src.ds_cnt];
					this.when = src.start + (step + 1) * src.step;
			}
			while (step != steps) {
				if (isFinite(data[step * src.ds_cnt])) {
					if (data[step * src.ds_cnt] < this.val) {
						this.val = data[step * src.ds_cnt];
						this.when = src.start + (step + 1) * src.step;
					}
				}
				step++;
			}
			break;
		case RrdVdef.VDEF_FIRST:
			step = 0;
			while (step != steps && isNaN(data[step * src.ds_cnt])) step++;
			if (step === steps) {    /* all entries were NaN */
				this.val = Number.NaN;
				this.when = 0;
			} else {
				this.val = data[step * src.ds_cnt];
				this.when = src.start + step * src.step;
			}
			break;
		case RrdVdef.VDEF_LAST:
			step = steps - 1;
			while (step >= 0 && isNaN(data[step * src.ds_cnt])) step--;
			if (step < 0) { /* all entries were NaN */
				this.val = Number.NaN;
				this.when = 0;
			} else {
				this.val = data[step * src.ds_cnt];
				this.when = src.start + (step + 1) * src.step;
			}
			break;
		case RrdVdef.VDEF_LSLSLOPE:
		case RrdVdef.VDEF_LSLINT:
		case RrdVdef.VDEF_LSLCORREL:
			var SUMx, SUMy, SUMxy, SUMxx, SUMyy, slope, y_intercept, correl;

			SUMx = 0;
			SUMy = 0;
			SUMxy = 0;
			SUMxx = 0;
			SUMyy = 0;

			for (step = 0; step < steps; step++) {
				if (isFinite(data[step * src.ds_cnt])) {
					cnt++;
					SUMx += step;
					SUMxx += step * step;
					SUMxy += step * data[step * src.ds_cnt];
					SUMy += data[step * src.ds_cnt];
					SUMyy += data[step * src.ds_cnt] * data[step * src.ds_cnt];
				}
			}

			slope = (SUMx * SUMy - cnt * SUMxy) / (SUMx * SUMx - cnt * SUMxx);
			y_intercept = (SUMy - slope * SUMx) / cnt;
			correl = (SUMxy - (SUMx * SUMy) / cnt) / Math.sqrt((SUMxx - (SUMx * SUMx) / cnt) * (SUMyy - (SUMy * SUMy) / cnt));

			if (cnt) {
				if (this.op === RrdVdef.VDEF_LSLSLOPE) {
					this.val = slope;
					this.when = 0;
				} else if (this.op === RrdVdef.VDEF_LSLINT) {
					this.val = y_intercept;
					this.when = 0;
				} else if (this.op === RrdVdef.VDEF_LSLCORREL) {
					this.val = correl;
						this.when = 0;
				}
			} else {
				this.val = Number.NaN;
				this.when = 0;
			}
			break;
	}
	return 0;
};

/**
 * RrdGraphError
 * @constructor
 */
var RrdGraphError = function (message)
{
    this.name = "RrdGraphError";
    this.message = (message) ? message : "Error";
};
RrdGraphError.prototype = new Error();

/**
 * RrdGraph
 * @constructor
 */
var RrdGraph = function (gfx, data)
{
	this.gfx = gfx; /* graphics object */
	this.data = data; /* fetch data object */
	this.data_need_fetch = []; /* List of data that need to be fetched */

	this.minval = Number.NaN; /* extreme values in the data */
	this.maxval = Number.NaN;
/* status information */
//with_markup: 0,
	this.xorigin = 0; /* where is (0,0) of the graph */
	this.yorigin = 0;
	this.xOriginTitle = 0; /* where is the origin of the title */
	this.yOriginTitle = 0;
	this.xOriginLegendY = 0; /* where is the origin of the y legend */
	this.yOriginLegendY = 0;
	this.xOriginLegendY2 = 0; /* where is the origin of the second y legend */
	this.yOriginLegendY2 = 0;
	this.xOriginLegend = 0; /* where is the origin of the legend */
	this.yOriginLegend = 0;
	this.ximg = 0; /* total size of the image */
	this.yimg = 0;
	this.legendwidth = 0; /* the calculated height and width of the legend */
	this.legendheight = 0;
	this.magfact = 1;  /* numerical magnitude */
	this.symbol = null;   /* magnitude symbol for y-axis */
	this.viewfactor = 1.0;  /* how should the numbers on the y-axis be scaled for viewing ? */

	this.base = 1000;     /* 1000 or 1024 depending on what we graph */

	this.start = 0;   /* what time does the graph cover */
	this.end = 0;

	this.xlab_form = null;   /* format for the label on the xaxis */
/* public */
	this.xsize = 400; /* graph area size in pixels */
	this.ysize = 100;
	this.zoom = 1;
	this.grid_dash_on = 1;
	this.grid_dash_off = 1;
	this.second_axis_scale = 0; /* relative to the first axis (0 to disable) */
	this.second_axis_shift = 0; /* how much is it shifted vs the first axis */
	this.second_axis_legend = null; /* label to put on the seond axis */
	this.second_axis_format = null; /* format for the numbers on the scond axis */
	this.draw_x_grid = true;  /* no x-grid at all */
	this.draw_y_grid = true;  /* no y-grid at all */
	this.ygridstep = Number.NaN;    /* user defined step for y grid */
	this.ylabfact = 0; /* every how many y grid shall a label be written ? */
	this.draw_3d_border = 2; /* size of border in pixels, 0 for off */
	this.dynamic_labels = false;/* pick the label shape according to the line drawn */
	this.ylegend = null; /* legend along the yaxis */
	this.title = ''; /* title for graph */
	this.watermark = null; /* watermark for graph */
	this.tabwidth = 40; /* tabwdith */
	this.step = 0; /* any preference for the default step ? */
	this.step_orig = 0; /* any preference for the default step ? */
	this.setminval = Number.NaN; /* extreme values in the data */
	this.setmaxval = Number.NaN;
	this.rigid = false;    /* do not expand range even with values outside */
	this.gridfit = true; /* adjust y-axis range etc so all grindlines falls in integer pixel values */
	this.lazy = 0;     /* only update the image if there is reasonable probablility that the existing one is out of date */
	this.legendposition = RrdGraph.LEGEND_POS_SOUTH; /* the position of the legend: north, west, south or east */
	this.legenddirection = RrdGraph.LEGEND_DIR_TOP_DOWN; /* The direction of the legend topdown or bottomup */
	this.logarithmic = false;  /* scale the yaxis logarithmic */
	this.force_scale_min = 0;  /* Force a scale--min */
	this.force_scale_max = 0;  /* Force a scale--max */
	this.unitsexponent = 9999;   /* 10*exponent for units on y-asis */
	this.unitslength = 6;  /* width of the yaxis labels */
	this.forceleftspace = false;   /* do not kill the space to the left of the y-axis if there is no grid */
	this.slopemode = false;    /* connect the dots of the curve directly, not using a stair */
	this.alt_ygrid = false; /* use alternative y grid algorithm */
	this.alt_autoscale = false; /* use alternative algorithm to find lower and upper bounds */
	this.alt_autoscale_min = false; /* use alternative algorithm to find lower bounds */
	this.alt_autoscale_max = false; /* use alternative algorithm to find upper bounds */
	this.no_legend = false; /* use no legend */
	this.no_minor = false; /* Turn off minor gridlines */
	this.only_graph = false; /* use only graph */
	this.force_rules_legend = false; /* force printing of HRULE and VRULE legend */
	this.force_units = false;   /* mask for all FORCE_UNITS_* flags */
	this.force_units_si = false; /* force use of SI units in Y axis (no effect in linear graph, SI instead of E in log graph) */
	this.full_size_mode = false; /* -width and -height indicate the total size of the image */
	this.no_rrdtool_tag = false; /* disable the rrdtool tag */

	this.xlab_user = null;
	this.ygrid_scale =  null;

	this.gdes = [];

	this.ytr_pixie = 0;
	this.xtr_pixie = 0;

	this.AlmostEqualBuffer = new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT*2);
	this.AlmostEqualInt = new Int32Array(this.AlmostEqualBuffer);
	this.AlmostEqualFloat = new Float32Array(this.AlmostEqualBuffer);

	this.DEFAULT_FONT = "'DejaVu Sans Mono', 'Courier', 'Ubuntu Mono'"; // pt -> pt=px*72/96
	this.MGRIDWIDTH = 0.6;
	this.GRIDWIDTH = 0.4;
	this.YLEGEND_ANGLE = 90.0;

	this.TEXT = {	
			DEFAULT: { size: 11, font: this.DEFAULT_FONT },
			TITLE: { size: 12, font: this.DEFAULT_FONT },
			AXIS: { size: 10, font: this.DEFAULT_FONT },
			UNIT: { size: 11, font: this.DEFAULT_FONT },
			LEGEND: { size: 11, font: this.DEFAULT_FONT },
			WATERMARK: { size: 8, font: this.DEFAULT_FONT }
	};	

	this.GRC = {	
			CANVAS: 'rgba(255, 255, 255, 1.0)',
			BACK: 'rgba(242,242, 242, 1.0)',
			SHADEA: 'rgba(207, 207, 207, 1.0)',
			SHADEB: 'rgba(158, 158, 158, 1.0)',
			GRID: 'rgba(143, 143, 143, 0.75)',
			MGRID: 'rgba(222, 79, 79, 0.60)',
			FONT: 'rgba(0, 0, 0, 1.0)',
			ARROW: 'rgba(127, 31, 31, 1.0)',
			AXIS: 'rgba(31, 31, 31, 1.0)',
			FRAME: 'rgba(0, 0, 0, 1.0)'
	};

	this.xlab = [
		{minsec: 0, length: 0, gridtm: RrdGraph.TMT_SECOND, gridst: 30, mgridtm: RrdGraph.TMT_MINUTE, mgridst: 5, labtm: RrdGraph.TMT_MINUTE, labst: 5, precis: 0, stst: '%H:%M' } ,
		{minsec: 2, length: 0, gridtm: RrdGraph.TMT_MINUTE, gridst: 1, mgridtm: RrdGraph.TMT_MINUTE, mgridst: 5, labtm: RrdGraph.TMT_MINUTE, labst: 5, precis: 0, stst: '%H:%M' } ,
		{minsec: 5, length: 0, gridtm: RrdGraph.TMT_MINUTE, gridst: 2, mgridtm: RrdGraph.TMT_MINUTE, mgridst: 10, labtm: RrdGraph.TMT_MINUTE, labst: 10, precis: 0, stst: '%H:%M' } ,
		{minsec: 10, length: 0, gridtm: RrdGraph.TMT_MINUTE, gridst: 5,mgridtm: RrdGraph.TMT_MINUTE, mgridst: 20, labtm: RrdGraph.TMT_MINUTE, labst: 20, precis: 0, stst: '%H:%M' } ,
		{minsec: 30, length: 0, gridtm: RrdGraph.TMT_MINUTE, gridst: 10, mgridtm: RrdGraph.TMT_HOUR, mgridst: 1, labtm: RrdGraph.TMT_HOUR, labst: 1, precis: 0, stst: '%H:%M' } ,
		{minsec: 60, length: 0, gridtm: RrdGraph.TMT_MINUTE, gridst: 30, mgridtm: RrdGraph.TMT_HOUR, mgridst: 2, labtm: RrdGraph.TMT_HOUR, labst: 2, precis: 0, stst: '%H:%M' } ,
		{minsec: 60, length: 24 * 3600, gridtm: RrdGraph.TMT_MINUTE, gridst: 30, mgridtm: RrdGraph.TMT_HOUR, mgridst: 2, labtm: RrdGraph.TMT_HOUR, labst: 6, precis: 0, stst: '%a %H:%M' } ,
		{minsec: 180, length: 0, gridtm: RrdGraph.TMT_HOUR, gridst: 1, mgridtm: RrdGraph.TMT_HOUR, mgridst: 6, labtm: RrdGraph.TMT_HOUR, labst: 6, precis: 0, stst: '%H:%M' } ,
		{minsec: 180, length: 24 * 3600, gridtm: RrdGraph.TMT_HOUR, gridst: 1, mgridtm: RrdGraph.TMT_HOUR, mgridst: 6, labtm: RrdGraph.TMT_HOUR, labst: 12, precis: 0, stst: '%a %H:%M' } ,
		{minsec: 600, length: 0, gridtm: RrdGraph.TMT_HOUR, gridst: 6, mgridtm: RrdGraph.TMT_DAY, mgridst: 1, labtm: RrdGraph.TMT_DAY, labst: 1, precis: 24 * 3600, stst: '%a' } ,
		{minsec: 1200, length: 0, gridtm: RrdGraph.TMT_HOUR, gridst: 6, mgridtm: RrdGraph.TMT_DAY, mgridst: 1, labtm: RrdGraph.TMT_DAY, labst: 1, precis: 24 * 3600, stst: '%d' } ,
		{minsec: 1800, length: 0, gridtm: RrdGraph.TMT_HOUR, gridst: 12, mgridtm: RrdGraph.TMT_DAY, mgridst: 1, labtm: RrdGraph.TMT_DAY, labst: 2, precis: 24 * 3600, stst:  '%a %d' },
		{minsec: 2400, length: 0, gridtm: RrdGraph.TMT_HOUR, gridst: 12, mgridtm: RrdGraph.TMT_DAY, mgridst: 1, labtm: RrdGraph.TMT_DAY, labst: 2, precis: 24 * 3600,stst: '%a' },
		{minsec: 3600, length: 0, gridtm: RrdGraph.TMT_DAY, gridst: 1, mgridtm: RrdGraph.TMT_WEEK, mgridst: 1, labtm: RrdGraph.TMT_WEEK, labst: 1, precis: 7 * 24 * 3600, stst: 'Week %V' },
		{minsec: 3 * 3600, length: 0, gridtm: RrdGraph.TMT_WEEK, gridst: 1, mgridtm: RrdGraph.TMT_MONTH, mgridst: 1, labtm: RrdGraph.TMT_WEEK, labst: 2, precis: 7 * 24 * 3600, stst: 'Week %V' },
		{minsec: 6 * 3600, length: 0, gridtm: RrdGraph.TMT_MONTH, gridst: 1, mgridtm: RrdGraph.TMT_MONTH, mgridst: 1, labtm: RrdGraph.TMT_MONTH, labst: 1, precis: 30 * 24 * 3600, stst: '%b' },
		{minsec: 48 * 3600,length: 0, gridtm: RrdGraph.TMT_MONTH, gridst: 1, mgridtm: RrdGraph.TMT_MONTH, mgridst: 3, labtm: RrdGraph.TMT_MONTH, labst: 3, precis: 30 * 24 * 3600, stst: '%b' },
		{minsec: 315360, length: 0, gridtm: RrdGraph.TMT_MONTH, gridst: 3, mgridtm: RrdGraph.TMT_YEAR, mgridst: 1, labtm: RrdGraph.TMT_YEAR, labst: 1, precis: 365 * 24 * 3600,  stst:  '%Y' },
		{minsec: 10 * 24 * 3600 , length: 0, gridtm: RrdGraph.TMT_YEAR, gridst: 1, mgridtm: RrdGraph.TMT_YEAR, mgridst: 1, labtm: RrdGraph.TMT_YEAR, labst: 1, precis: 365 * 24 * 3600,  stst:  '%y' },
		{minsec: -1, length: 0, gridtm: RrdGraph.TMT_MONTH, gridst: 0, mgridtm: RrdGraph.TMT_MONTH, mgridst: 0, labtm: RrdGraph.TMT_MONTH, labst: 0, precis: 0, stst: null }
	];

	this.ylab = [ 
		{grid: 0.1, lfac: [1, 2, 5, 10] } ,
		{grid: 0.2, lfac: [1, 5, 10, 20] } ,
		{grid: 0.5, lfac: [1, 2, 4, 10] } ,
		{grid: 1.0, lfac: [1, 2, 5, 10] } ,
		{grid: 2.0, lfac: [1, 5, 10, 20] } ,
		{grid: 5.0, lfac: [1, 2, 4, 10] } ,
		{grid: 10.0, lfac: [1, 2, 5, 10] } ,
		{grid: 20.0, lfac: [1, 5, 10, 20] } ,
		{grid: 50.0, lfac: [1, 2, 4, 10] } ,
		{grid: 100.0, lfac: [1, 2, 5, 10] } ,
		{grid: 200.0, lfac: [1, 5, 10, 20] } ,
		{grid: 500.0, lfac: [1, 2, 4, 10] },
		{grid: 0.0, lfac: [0, 0, 0, 0] }
	];

	this.si_symbol = [
		'y',                /* 10e-24 Yocto */
		'z',                /* 10e-21 Zepto */
		'a',                /* 10e-18 Atto */
		'f',                /* 10e-15 Femto */
		'p',                /* 10e-12 Pico */
		'n',                /* 10e-9  Nano */
		'u',                /* 10e-6  Micro */
		'm',                /* 10e-3  Milli */
		' ',                /* Base */
		'k',                /* 10e3   Kilo */
		'M',                /* 10e6   Mega */
		'G',                /* 10e9   Giga */
		'T',                /* 10e12  Tera */
		'P',                /* 10e15  Peta */
		'E',                /* 10e18  Exa */
    'Z',                /* 10e21  Zeta */
    'Y'                 /* 10e24  Yotta */
	];
	this.si_symbcenter = 8;

	this.start_t = new RrdTime("end-24h");
	this.end_t = new RrdTime("now");
};

RrdGraph.TMT_SECOND = 0;
RrdGraph.TMT_MINUTE = 1;
RrdGraph.TMT_HOUR = 2;
RrdGraph.TMT_DAY = 3;
RrdGraph.TMT_WEEK = 4;
RrdGraph.TMT_MONTH = 5;
RrdGraph.TMT_YEAR = 6;

RrdGraph.GFX_H_LEFT = 1;
RrdGraph.GFX_H_RIGHT = 2;
RrdGraph.GFX_H_CENTER = 3;

RrdGraph.GFX_V_TOP = 1;
RrdGraph.GFX_V_BOTTOM = 2;
RrdGraph.GFX_V_CENTER = 3;

RrdGraph.LEGEND_POS_NORTH = 0;
RrdGraph.LEGEND_POS_WEST = 1;
RrdGraph.LEGEND_POS_SOUTH = 2;
RrdGraph.LEGEND_POS_EAST = 3;

RrdGraph.LEGEND_DIR_TOP_DOWN = 0;
RrdGraph.LEGEND_DIR_BOTTOM_UP = 1;

RrdGraph.prototype.set_default_font = function (name)
{
	for (var font in this.TEXT)
		this.TEXT[font].font = name;
};

RrdGraph.prototype.parse_color = function(str)
{
	var bits;
	if ((bits = /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(str))) {
		return [parseInt(bits[1]+bits[1], 16), parseInt(bits[2]+bits[2], 16), parseInt(bits[3]+bits[3], 16), 1.0];
	} else if ((bits = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(str))) {
		return [parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16), 1.0];
	} else if ((bits = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(str))) {
		return [parseInt(bits[1], 16), parseInt(bits[2], 16), parseInt(bits[3], 16), parseInt(bits[4], 16)/255];
	} else if ((bits = /^rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)$/.exec(str))) {
		return [parseInt(bits[1], 10), parseInt(bits[2], 10), parseInt(bits[3], 10), 1.0];
	} else if ((bits = /^rgba\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9.]+)\)$/.exec(str))) {
		return [parseInt(bits[1], 10), parseInt(bits[2], 10), parseInt(bits[3], 10), parseFloat(bits[4], 10)];
	} else {
		throw new RrdGraphError("Unknow color format '"+str+"'");
	}
};

RrdGraph.prototype.color2rgba = function (color)
{
	return 'rgba('+color[0]+','+color[1]+','+color[2]+','+color[3]+')';
};

RrdGraph.prototype.xtr = function (mytime)
{
	if (mytime === 0) {
		this.xtr_pixie = this.xsize / (this.end - this.start);
		return this.xorigin;
	}
	return this.xorigin + this.xtr_pixie * (mytime - this.start);
};

RrdGraph.prototype.ytr = function (value)
{
	var yval;

	if (isNaN(value)) {
		if (!this.logarithmic)
			this.ytr_pixie = this.ysize / (this.maxval - this.minval);
		else
			this.ytr_pixie = this.ysize / ((Math.log(this.maxval)/Math.LN10) - (Math.log(this.minval)/Math.LN10));
		yval = this.yorigin;
	} else if (!this.logarithmic) {
		yval = this.yorigin - this.ytr_pixie * (value - this.minval);
	} else {
		if (value < this.minval) {
			yval = this.yorigin;
		} else {
			yval = this.yorigin - this.ytr_pixie * ((Math.log(value)/Math.LN10) - (Math.log(this.minval)/Math.LN10));
		}
	}
	return yval;
};

RrdGraph.prototype.AlmostEqual2sComplement = function(A, B, maxUlps)
{
	this.AlmostEqualFloat[0] = A;
	this.AlmostEqualFloat[1] = B;

	var aInt = this.AlmostEqualInt[0];
	if (aInt < 0) aInt = 0x80000000 - aInt;

	var bInt = this.AlmostEqualInt[1];
	if (bInt < 0) bInt = 0x80000000 - bInt;

	var intDiff = Math.abs(aInt - bInt);

	if (intDiff <= maxUlps)
		return true;

	return false;
};

RrdGraph.prototype.tmt2str = function (val)
{
	switch (val) {
		case RrdGraph.TMT_SECOND: return 'sec';
		case RrdGraph.TMT_MINUTE: return 'min';
		case RrdGraph.TMT_HOUR: return 'hour';
		case RrdGraph.TMT_DAY: return 'day';
		case RrdGraph.TMT_WEEK: return 'week';
		case RrdGraph.TMT_MONTH: return 'mon';
		case RrdGraph.TMT_YEAR: return 'year';
	}
	return val;
};

RrdGraph.prototype.find_first_time = function(start, baseint, basestep)
{
	var date = new Date(start*1000);

	switch (baseint) {
		case RrdGraph.TMT_SECOND:
			var sec = date.getSeconds();
			sec -= sec % basestep;
			date.setSeconds(sec);
			break;
		case RrdGraph.TMT_MINUTE:
			date.setSeconds(0);
			var min = date.getMinutes();
			min -= min % basestep;
			date.setMinutes(min);
			break;
		case RrdGraph.TMT_HOUR:
			date.setSeconds(0);
			date.setMinutes(0);
			var hour = date.getHours();
			hour -= hour % basestep;
			date.setHours(hour);
			break;
		case RrdGraph.TMT_DAY:
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			break;
		case RrdGraph.TMT_WEEK:
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			var mday = date.getDate();
			var wday = date.getDay();
			mday -= wday - 1; // FIXME find_first_weekday
			if (wday === 0) mday -= 7;// FIXME find_first_weekday
			date.setDate(mday);
			break;
		case RrdGraph.TMT_MONTH:
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			date.setDate(1);
			var mon = date.getMonth();
			mon -= mon % basestep;
			date.setMonth(mon);
			break;
		case RrdGraph.TMT_YEAR:
			date.setSeconds(0);
			date.setMinutes(0);
			date.setHours(0);
			date.setDate(1);
			date.setMonth(0);
			var year = date.getFullYear()-1900;
			year -= (year + 1900) %basestep;
			date.setFullYear(year+1900);
	}
	return Math.round(date.getTime()/1000.0);
};

RrdGraph.prototype.find_next_time = function(current, baseint, basestep)
{
	var date = new Date(current*1000);
	var limit = 2;
	var madetime;

	switch (baseint) {
		case RrdGraph.TMT_SECOND: limit = 7200; break;
		case RrdGraph.TMT_MINUTE: limit = 120; break;
		case RrdGraph.TMT_HOUR: limit = 2; break;
		default: limit = 2; break;
	}

	do {
		switch (baseint) {
			case RrdGraph.TMT_SECOND:
				date.setSeconds(date.getSeconds()+basestep);
				break;
			case RrdGraph.TMT_MINUTE:
				date.setMinutes(date.getMinutes()+basestep);
				break;
			case RrdGraph.TMT_HOUR:
				date.setHours(date.getHours()+basestep);
				break;
			case RrdGraph.TMT_DAY:
				date.setDate(date.getDate()+basestep);
				break;
			case RrdGraph.TMT_WEEK:
				date.setDate(date.getDate()+7*basestep);
				break;
			case RrdGraph.TMT_MONTH:
				date.setMonth(date.getMonth()+basestep);
				break;
			case RrdGraph.TMT_YEAR:
				date.setFullYear(date.getFullYear()+basestep);
				break;
		}
		madetime = Math.round(date.getTime()/1000.0);
	} while (madetime === -1 && limit-- >= 0);   /* this is necessary to skip impossible times like the daylight saving time skips */ // FIXME ??
	return madetime;
};

RrdGraph.prototype.print_calc = function()
{
	var validsteps;
	var printval;
	var tmvdef;
	var graphelement = 0;
	var max_ii;
	var magfact = -1;
	var si_symb = "";
	var percent_s;
	var prline_cnt = 0;

	var now = Math.round((new Date()).getTime() / 1000);

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		var vidx = this.gdes[i].vidx;
		switch (this.gdes[i].gf) {
			case RrdGraphDesc.GF_PRINT:
			case RrdGraphDesc.GF_GPRINT:
				if (this.gdes[vidx].gf === RrdGraphDesc.GF_VDEF) { /* simply use vals */
					printval = this.gdes[vidx].vf.val;
					tmvdef = this.gdes[vidx].vf.when;
					// localtime_r(&this.gdes[vidx].vf.when, &tmvdef); // FIXME ?
				} else {    /* need to calculate max,min,avg etcetera */
					max_ii = ((this.gdes[vidx].end - this.gdes[vidx].start) / this.gdes[vidx].step * this.gdes[vidx].ds_cnt);
					printval = Number.NaN;
					validsteps = 0;

					for (var ii = this.gdes[vidx].ds; ii < max_ii; ii += this.gdes[vidx].ds_cnt) {
						if (!isFinite(this.gdes[vidx].data[ii])) continue;
						if (isNaN(printval)) {
							printval = this.gdes[vidx].data[ii];
							validsteps++;
							continue;
						}
						switch (this.gdes[i].cf) {
							case RrdGraphDesc.CF_HWPREDICT:
							case RrdGraphDesc.CF_MHWPREDICT:
							case RrdGraphDesc.CF_DEVPREDICT:
							case RrdGraphDesc.CF_DEVSEASONAL:
							case RrdGraphDesc.CF_SEASONAL:
							case RrdGraphDesc.CF_AVERAGE:
								validsteps++;
								printval += this.gdes[vidx].data[ii];
								break;
							case RrdGraphDesc.CF_MINIMUM:
								printval = Math.min(printval, this.gdes[vidx].data[ii]);
								break;
							case RrdGraphDesc.CF_FAILURES:
							case RrdGraphDesc.CF_MAXIMUM:
								printval = Math.max(printval, this.gdes[vidx].data[ii]);
								break;
							case RrdGraphDesc.CF_LAST:
								printval = this.gdes[vidx].data[ii];
						}
					}
					if (this.gdes[i].cf === RrdGraphDesc.CF_AVERAGE || this.gdes[i].cf > RrdGraphDesc.CF_LAST) {
						if (validsteps > 1) printval = (printval / validsteps);
					}
				}           /* prepare printval */

				if (!this.gdes[i].strftm && (percent_s = this.gdes[i].format.indexOf('%S')) != -1) {
					if (magfact < 0.0) {
						//[printval, si_symb, magfact] = this.auto_scale(printval, si_symb, magfact);
						var dummy = this.auto_scale(printval, si_symb, magfact); printval = dummy[0]; si_symb = dummy[1]; magfact = dummy[2];
						if (printval === 0.0) magfact = -1.0;
					} else {
						printval /= magfact;
					}
					this.gdes[i].format = this.gdes[i].format.substr(0, percent_s+1)+'s'+this.gdes[i].format.substr(percent_s+2);
				} else if (!this.gdes[i].strftm && this.gdes[i].format.indexOf('%s') != -1) {
					//[printval, si_symb, magfact] = this.auto_scale(printval, si_symb, magfact);
					var dummy = this.auto_scale(printval, si_symb, magfact); printval = dummy[0]; si_symb = dummy[1]; magfact = dummy[2];
				}

				if (this.gdes[i].strftm) {
					this.gdes[i].legend = strftime(this.gdes[i].format, tmvdef);
				} else {
					this.gdes[i].legend = sprintf(this.gdes[i].format, printval, si_symb);
				}
				graphelement = 1;
				break;
			case RrdGraphDesc.GF_LINE:
			case RrdGraphDesc.GF_AREA:
			case RrdGraphDesc.GF_TICK:
				graphelement = 1;
				break;
			case RrdGraphDesc.GF_HRULE:
				if (isNaN(this.gdes[i].yrule)) { /* we must set this here or the legend printer can not decide to print the legend */
					this.gdes[i].yrule = this.gdes[vidx].vf.val;
				}
				graphelement = 1;
				break;
			case RrdGraphDesc.GF_VRULE:
				if (this.gdes[i].xrule === 0) {   /* again ... the legend printer needs it */
					this.gdes[i].xrule = this.gdes[vidx].vf.when;
				}
				graphelement = 1;
				break;
			case RrdGraphDesc.GF_COMMENT:
			case RrdGraphDesc.GF_TEXTALIGN:
			case RrdGraphDesc.GF_DEF:
			case RrdGraphDesc.GF_CDEF:
			case RrdGraphDesc.GF_VDEF:
			case RrdGraphDesc.GF_SHIFT:
			case RrdGraphDesc.GF_XPORT:
				break;
			case RrdGraphDesc.GF_STACK:
				throw new RrdGraphError("STACK should already be turned into LINE or AREA here");
		}
	}
	return graphelement;
};

RrdGraph.prototype.reduce_data = function(gdes, cur_step)
{
	var reduce_factor = Math.ceil(gdes.step / cur_step);
	var col, dst_row, row_cnt, start_offset, end_offset, skiprows = 0;
	var srcptr, dstptr;

	gdes.step = cur_step * reduce_factor; /* set new step size for reduced data */
	dstptr = 0;
	srcptr = 0;
	row_cnt = (gdes.end - gdes.start) / cur_step;

	end_offset = gdes.end % gdes.step;
	start_offset = gdes.start % gdes.step;

	if (start_offset) {
		gdes.start = gdes.start - start_offset;
		skiprows = reduce_factor - start_offset / cur_step;
		srcptr += skiprows * gdes.ds_cnt;
		for (col = 0; col < gdes.ds_cnt; col++)
			gdes.data[dstptr++] = Number.NaN;
		row_cnt -= skiprows;
	}

	if (end_offset) {
		gdes.end = gdes.end - end_offset + gdes.step;
		skiprows = end_offset / cur_step;
		row_cnt -= skiprows;
	}

	if (row_cnt % reduce_factor) {
		throw new RrdGraphError("BUG in reduce_data(), SANITY CHECK: "+row_cnt+" rows cannot be reduced by "+reduce_factor);
	}

	for (dst_row = 0; row_cnt >= reduce_factor; dst_row++) {
		for (col = 0; col < gdes.ds_cnt; col++) {
			var newval = Number.NaN;
			var validval = 0;

			for (var i = 0; i < reduce_factor; i++) {
				if (isNaN(gdes.data[srcptr + i*gdes.ds_cnt + col])) continue;
				validval++;
				if (isNaN(newval)) {
					newval = gdes.data[srcptr + i * gdes.ds_cnt + col];
				} else {
					switch (gdes.cf_reduce) {
						case RrdGraphDesc.CF_HWPREDICT:
						case RrdGraphDesc.CF_MHWPREDICT:
						case RrdGraphDesc.CF_DEVSEASONAL:
						case RrdGraphDesc.CF_DEVPREDICT:
						case RrdGraphDesc.CF_SEASONAL:
						case RrdGraphDesc.CF_AVERAGE:
							newval += gdes.data[srcptr + i*gdes.ds_cnt + col];
							break;
						case RrdGraphDesc.CF_MINIMUM:
							newval = Math.min(newval, gdes.data[srcptr + i*gdes.ds_cnt + col]);
							break;
						case RrdGraphDesc.CF_FAILURES:
							/* an interval contains a failure if any subintervals contained a failure */
						case RrdGraphDesc.CF_MAXIMUM:
							newval = Math.max(newval, gdes.data[srcptr + i*gdes.ds_cnt + col]);
							break;
						case RrdGraphDesc.CF_LAST:
							newval = gdes.data[srcptr + i*gdes.ds_cnt + col];
							break;
					}
				}
			}

			if (validval === 0) {
				newval = Number.NaN;
			} else {
				switch (gdes.cf_reduce) {
					case RrdGraphDesc.CF_HWPREDICT:
					case RrdGraphDesc.CF_MHWPREDICT:
					case RrdGraphDesc.CF_DEVSEASONAL:
					case RrdGraphDesc.CF_DEVPREDICT:
					case RrdGraphDesc.CF_SEASONAL:
					case RrdGraphDesc.CF_AVERAGE:
						newval /= validval;
						break;
					case RrdGraphDesc.CF_MINIMUM:
					case RrdGraphDesc.CF_FAILURES:
					case RrdGraphDesc.CF_MAXIMUM:
					case RrdGraphDesc.CF_LAST:
						break;
				}
			}
			gdes.data[dstptr++] = newval;
		}

		srcptr += gdes.ds_cnt * reduce_factor;
		row_cnt -= reduce_factor;
	}
	if (end_offset) {
		for (col = 0; col < gdes.ds_cnt; col++)
			gdes.data[dstptr++] = Number.NaN;
	}
};

RrdGraph.prototype.data_fetch_async_callback = function (args, ft_step)
{
	var j, that;

	j = args.j;
	that = args.this;

	if (ft_step < 0)
		return -1;
	that.gdes[j].data_first = 1;
	that.gdes[j].step = Math.max(that.gdes[j].step, that.step);
	if (ft_step < that.gdes[j].step) {
		that.reduce_data(that.gdes[j], ft_step);
	} else {
		that.gdes[j].step = ft_step;
	}
	that.data_need_fetch[j] = 1;

	for (var i = 0, gdes_c = that.gdes.length; i < gdes_c; i++) {
		if (that.data_need_fetch[i] == j + 2) {
			that.gdes[i].start = that.gdes[j].start;
			that.gdes[i].end = that.gdes[j].end;
			that.gdes[i].step = that.gdes[j].step;
			that.gdes[i].ds_cnt = that.gdes[j].ds_cnt;
			that.gdes[i].ds_namv = that.gdes[j].ds_namv;
			that.gdes[i].data = that.gdes[j].data;
			that.gdes[i].data_first = 0;
			that.data_need_fetch[i] = 1;
		}
	}

	for (var i = 0, gdes_c = that.gdes.length; i < gdes_c; i++) {
		if (that.data_need_fetch[i] < 0) continue;
		if (that.data_need_fetch[i] == 1) continue;
		return;
	}

	for (var i = 0, gdes_c = that.gdes.length; i < gdes_c; i++) {
		if (that.gdes[i].gf != RrdGraphDesc.GF_DEF) continue;

		/* lets see if the required data source is really there */
		for (var ii = 0; ii < that.gdes[i].ds_cnt; ii++) {
				if (that.gdes[i].ds_namv[ii] === that.gdes[i].ds_nam) {
					that.gdes[i].ds = ii;
					break;
				}
		}

		if (that.gdes[i].ds === -1)
			throw new RrdGraphError("No DS called '"+that.gdes[i].ds_nam+"' in '"+that.gdes[i].rrd+"'");
	}
	that.graph_paint_draw();
};

RrdGraph.prototype.data_fetch_async = function ()
{
	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		if (this.gdes[i].gf != RrdGraphDesc.GF_DEF) {
			this.data_need_fetch.push(-1);
			continue;
		}

		for (var ii = 0; ii < i; ii++) {
			if (this.gdes[ii].gf != RrdGraphDesc.GF_DEF) continue;
			if ((this.gdes[i].rrd === this.gdes[ii].rrd)
				&& (this.gdes[i].cf === this.gdes[ii].cf)
				&& (this.gdes[i].cf_reduce === this.gdes[ii].cf_reduce)
				&& (this.gdes[i].start_orig === this.gdes[ii].start_orig)
				&& (this.gdes[i].end_orig === this.gdes[ii].end_orig)
				&& (this.gdes[i].step_orig === this.gdes[ii].step_orig)) {
					this.data_need_fetch.push(ii + 2);
					break;
			}
		}
		this.data_need_fetch.push(0);
	}

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		if (this.data_need_fetch[i] == 0) {
			this.data_need_fetch[i] = this.data.fetch_async(this.gdes[i], this.gdes[i].step, this.data_fetch_async_callback, {this: this, j:i});
		}
	}
};

RrdGraph.prototype.data_fetch = function()
{
	var skip;

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		if (this.gdes[i].gf != RrdGraphDesc.GF_DEF) continue;

		skip = false;
		for (var ii = 0; ii < i; ii++) {
			if (this.gdes[ii].gf != RrdGraphDesc.GF_DEF) continue;
			if ((this.gdes[i].rrd === this.gdes[ii].rrd)
				&& (this.gdes[i].cf === this.gdes[ii].cf)
				&& (this.gdes[i].cf_reduce === this.gdes[ii].cf_reduce)
				&& (this.gdes[i].start_orig === this.gdes[ii].start_orig)
				&& (this.gdes[i].end_orig === this.gdes[ii].end_orig)
				&& (this.gdes[i].step_orig === this.gdes[ii].step_orig)) {
					this.gdes[i].start = this.gdes[ii].start;
					this.gdes[i].end = this.gdes[ii].end;
					this.gdes[i].step = this.gdes[ii].step;
					this.gdes[i].ds_cnt = this.gdes[ii].ds_cnt;
					this.gdes[i].ds_namv = this.gdes[ii].ds_namv;
					this.gdes[i].data = this.gdes[ii].data;
					this.gdes[i].data_first = 0;
					skip = true;
			}
			if (skip) break;
		}

		if (!skip) {
			var ft_step = this.gdes[i].step;   /* ft_step will record what we got from fetch */
			ft_step = this.data.fetch(this.gdes[i], ft_step);
			if (ft_step < 0)
				return -1;
			this.gdes[i].data_first = 1;
			this.gdes[i].step = Math.max(this.gdes[i].step, this.step);
			if (ft_step < this.gdes[i].step) {
					this.reduce_data(this.gdes[i], ft_step);
			} else {
					this.gdes[i].step = ft_step;
			}
		}
		/* lets see if the required data source is really there */
		for (var ii = 0; ii < this.gdes[i].ds_cnt; ii++) {
			if (this.gdes[i].ds_namv[ii] === this.gdes[i].ds_nam) {
				this.gdes[i].ds = ii;
				break;
			}
		}

		if (this.gdes[i].ds === -1)
			throw new RrdGraphError("No DS called '"+this.gdes[i].ds_nam+"' in '"+this.gdes[i].rrd+"'");
	}

	return 0;
};

RrdGraph.prototype.lcd = function (num)
{
	var rest;
	for (var i = 0; num[i + 1] != 0; i++) {
		do {
			rest = num[i] % num[i + 1];
			num[i] = num[i + 1];
			num[i + 1] = rest;
		} while (rest != 0); // FIXME infinite loop ?
		num[i + 1] = num[i];
	}
	return num[i];
};

RrdGraph.prototype.data_calc = function()
{
	var dataidx;
	var now;
	var rpnstack;

	for (var gdi = 0, gdes_c = this.gdes.length; gdi < gdes_c; gdi++) {
		switch (this.gdes[gdi].gf) {
			case RrdGraphDesc.GF_XPORT:
				break;
			case RrdGraphDesc.GF_SHIFT:
				var vdp = this.gdes[this.gdes[gdi].vidx];
				/* remove current shift */
				vdp.start -= vdp.shift;
				vdp.end -= vdp.shift;

				if (this.gdes[gdi].shidx >= 0) vdp.shift = this.gdes[this.gdes[gdi].shidx].vf.val;
				else vdp.shift = this.gdes[gdi].shval;

				vdp.shift = (vdp.shift / vdp.step) * vdp.step;

				vdp.start += vdp.shift;
				vdp.end += vdp.shift;
				break;
			case RrdGraphDesc.GF_VDEF:
				this.gdes[gdi].ds_cnt = 0;
				if (this.gdes[gdi].vf.calc(this.gdes[this.gdes[gdi].vidx]))
					throw new RrdGraphError("Error processing VDEF '"+this.gdes[gdi].vname+"'");
				break;
			case RrdGraphDesc.GF_CDEF:
				this.gdes[gdi].ds_cnt = 1;
				this.gdes[gdi].ds = 0;
				this.gdes[gdi].data_first = 1;
				this.gdes[gdi].start = 0;
				this.gdes[gdi].end = 0;
				var steparray = [];
				var stepcnt = 0;
				dataidx = -1;

				var rpnp =  this.gdes[gdi].rpnp.rpnp;
				for (var rpi = 0; rpnp[rpi].op != RrdRpn.OP_END; rpi++) {
					if (rpnp[rpi].op === RrdRpn.OP_VARIABLE || rpnp[rpi].op === RrdRpn.OP_PREV_OTHER) {
						var ptr = rpnp[rpi].ptr;
						if (this.gdes[ptr].ds_cnt === 0) {    /* this is a VDEF data source */
							rpnp[rpi].val = this.gdes[ptr].vf.val;
							rpnp[rpi].op = RrdRpn.OP_NUMBER;
						} else {    /* normal variables and PREF(variables) */
							++stepcnt;
							steparray[stepcnt - 1] = this.gdes[ptr].step;

							if (this.gdes[gdi].start < this.gdes[ptr].start)
								this.gdes[gdi].start = this.gdes[ptr].start;
							if (this.gdes[gdi].end === 0 || this.gdes[gdi].end > this.gdes[ptr].end)
								this.gdes[gdi].end = this.gdes[ptr].end;

							rpnp[rpi].data = this.gdes[ptr].data;
							rpnp[rpi].pdata = this.gdes[ptr].ds;
							rpnp[rpi].step = this.gdes[ptr].step;
							rpnp[rpi].ds_cnt = this.gdes[ptr].ds_cnt;
						}
					}
				}
				/* move the data pointers to the correct period */
				for (var rpi = 0; rpnp[rpi].op != RrdRpn.OP_END; rpi++) {
					if (rpnp[rpi].op === RrdRpn.OP_VARIABLE || rpnp[rpi].op === RrdRpn.OP_PREV_OTHER) {
						var ptr = rpnp[rpi].ptr;
						var diff = this.gdes[gdi].start - this.gdes[ptr].start;

						if (diff > 0) rpnp[rpi].pdata += (diff / this.gdes[ptr].step) * this.gdes[ptr].ds_cnt;
					}
				}

				if (steparray === null) {
					throw new RrdGraphError("rpn expressions without DEF or CDEF variables are not supported");
				}
				steparray[stepcnt] = 0;
				this.gdes[gdi].step = this.lcd(steparray);
				this.gdes[gdi].data = [];

				for (now = this.gdes[gdi].start + this.gdes[gdi].step; now <= this.gdes[gdi].end; now += this.gdes[gdi].step) {
					if (this.gdes[gdi].rpnp.calc(now, this.gdes[gdi].data, ++dataidx) === -1)
						return -1;
				}
				break;
			default:
				continue;
		}
	}
	return 0;
};

RrdGraph.prototype.data_proc = function()
{
	var pixstep = (this.end - this.start) / this.xsize;
	var paintval;
	var minval = Number.NaN, maxval = Number.NaN;
	var gr_time;

	/* memory for the processed data */

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		if ((this.gdes[i].gf === RrdGraphDesc.GF_LINE) || (this.gdes[i].gf === RrdGraphDesc.GF_AREA) || (this.gdes[i].gf === RrdGraphDesc.GF_TICK)) {
			this.gdes[i].p_data = [];
		}
	}

	for (var i = 0; i < this.xsize; i++) {   /* for each pixel */
		var vidx;
		gr_time = this.start + pixstep * i;  /* time of the current step */
		paintval = 0.0;

		for (var ii = 0 , gdes_c = this.gdes.length; ii < gdes_c; ii++) {
			var value;
			switch (this.gdes[ii].gf) {
				case RrdGraphDesc.GF_LINE:
				case RrdGraphDesc.GF_AREA:
				case RrdGraphDesc.GF_TICK:
					if (!this.gdes[ii].stack) paintval = 0.0;
					value = this.gdes[ii].yrule;
					if (isNaN(value) || (this.gdes[ii].gf === RrdGraphDesc.GF_TICK)) {
						vidx = this.gdes[ii].vidx;
						if (this.gdes[vidx].gf === RrdGraphDesc.GF_VDEF) {
							value = this.gdes[vidx].vf.val;
						} else if (gr_time >= this.gdes[vidx].start && gr_time < this.gdes[vidx].end) {
							value = this.gdes[vidx].data[Math.floor((gr_time - this.gdes[vidx].start) / this.gdes[vidx].step) * this.gdes[vidx].ds_cnt + this.gdes[vidx].ds];
						} else {
							value = Number.NaN;
						}
					}
					if (!isNaN(value)) {
						paintval += value;
						this.gdes[ii].p_data[i] = paintval;
						if (isFinite(paintval) && this.gdes[ii].gf != RrdGraphDesc.GF_TICK) {
							if ((isNaN(minval) || paintval < minval) && !(this.logarithmic && paintval <= 0.0))
								minval = paintval;
							if (isNaN(maxval) || paintval > maxval)
								maxval = paintval;
						}
					} else {
						this.gdes[ii].p_data[i] = Number.NaN;
					}
					break;
				case RrdGraphDesc.GF_STACK:
					throw new RrdGraphError("STACK should already be turned into LINE or AREA here");
				default:
					break;
			}
		}
	}

	if (this.logarithmic) {
		if (isNaN(minval) || isNaN(maxval) || maxval <= 0) {
			minval = 0.0;
			maxval = 5.1;
		}
		if (minval <= 0) minval = maxval / 10e8;
	} else {
		if (isNaN(minval) || isNaN(maxval)) {
			minval = 0.0;
			maxval = 1.0;
		}
	}

	if (isNaN(this.minval) || ((!this.rigid) && this.minval > minval)) {
		if (this.logarithmic) this.minval = minval / 2.0;
		else this.minval = minval;
	}
	if (isNaN(this.maxval) || (!this.rigid && this.maxval < maxval)) {
		if (this.logarithmic) this.maxval = maxval * 2.0;
		else this.maxval = maxval;
	}

	if (this.minval > this.maxval) {
		if (this.minval > 0) this.minval = 0.99 * this.maxval;
		else this.minval = 1.01 * this.maxval;
	}

	if (this.AlmostEqual2sComplement(this.minval, this.maxval, 4)) {
		if (this.maxval > 0) this.maxval *= 1.01;
		else this.maxval *= 0.99;
		if (this.AlmostEqual2sComplement(this.maxval, 0, 4)) this.maxval = 1.0;
	}
	return 0;
};

RrdGraph.prototype.leg_place = function (calc_width)
{
	var interleg = this.TEXT.LEGEND.size * 1.5;
	var border = this.TEXT.LEGEND.size * 1.5;
	var fill = 0, fill_last;
	var legendwidth; // = this.ximg - 2 * border;
	var leg_c = 0;
	var leg_x = border;
	var leg_y = 0; //this.yimg;
	var leg_y_prev = 0; // this.yimg;
	var leg_cc;
	var glue = 0;
	var ii, mark = 0;
	var default_txtalign = RrdGraphDesc.TXA_JUSTIFIED; /*default line orientation */
	var legspace;
	var tab;
	var saved_legend;

	if(calc_width) legendwidth = 0;
	else legendwidth = this.legendwidth - 2 * border;

	if (!this.no_legend && !this.only_graph) {
		legspace = [];
		for (var i = 0 , gdes_c = this.gdes.length; i < gdes_c; i++) {
			var prt_fctn; /*special printfunctions */
			if(calc_width) saved_legend = this.gdes[i].legend;
			fill_last = fill;
			if (this.gdes[i].gf === RrdGraphDesc.GF_TEXTALIGN)
				default_txtalign = this.gdes[i].txtalign;

			if (!this.force_rules_legend) {
				if (this.gdes[i].gf === RrdGraphDesc.GF_HRULE && (this.gdes[i].yrule < this.minval || this.gdes[i].yrule > this.maxval))
					this.gdes[i].legend = null;
				if (this.gdes[i].gf === RrdGraphDesc.GF_VRULE && (this.gdes[i].xrule < this.start || this.gdes[i].xrule > this.end))
					this.gdes[i].legend = null;
			}

			if (this.gdes[i].legend != null) {
				this.gdes[i].legend = this.gdes[i].legend.replace(/\\t/gi, "\t"); /* turn \\t into tab */
				leg_cc = this.gdes[i].legend.length;
			} else {
				leg_cc = 0;
			}

			/* is there a controle code at the end of the legend string ? */
			if (leg_cc >= 2 && this.gdes[i].legend.charAt(leg_cc - 2) === '\\') {
				prt_fctn = this.gdes[i].legend.charAt(leg_cc - 1);
				leg_cc -= 2;
				this.gdes[i].legend = this.gdes[i].legend.substr(0,leg_cc);
			} else {
				prt_fctn = null;
			}
			/* only valid control codes */
			if (prt_fctn != 'l' && prt_fctn != 'n' && prt_fctn != 'r' && prt_fctn != 'j' && prt_fctn != 'c' &&
				prt_fctn != '.' && prt_fctn != 'u' && prt_fctn != 's' && prt_fctn != null  && prt_fctn != 'g') {
				throw new RrdGraphError("Unknown control code at the end of "+this.gdes[i].legend+": "+prt_fctn);
			}
			/* \n -> \l */
			if (prt_fctn === 'n') prt_fctn = 'l';
			if (prt_fctn === '.') prt_fctn = '\0';

			/* remove exess space from the end of the legend for \g */
			while (prt_fctn === 'g' && leg_cc > 0 && this.gdes[i].legend.charAt(leg_cc - 1) === ' ') {
				leg_cc--;
				this.gdes[i].legend = this.gdes[i].legend.substr(0,leg_cc);
			}

			if (leg_cc != 0) {
				legspace[i] = (prt_fctn === 'g' ? 0 : interleg);
				if (fill > 0) fill += legspace[i];
				fill += this.gfx.get_text_width(fill + border, this.TEXT.LEGEND, this.tabwidth, this.gdes[i].legend);
				leg_c++;
			} else {
				legspace[i] = 0;
			}
			/* who said there was a special tag ... ? */
			if (prt_fctn === 'g') prt_fctn = null;

			if (prt_fctn === null) {
				if(calc_width && (fill > legendwidth)) legendwidth = fill;

				if (i === gdes_c - 1 || fill > legendwidth) {
					switch (default_txtalign) {
						case RrdGraphDesc.TXA_RIGHT:
							prt_fctn = 'r';
							break;
						case RrdGraphDesc.TXA_CENTER:
							prt_fctn = 'c';
							break;
						case RrdGraphDesc.TXA_JUSTIFIED:
							prt_fctn = 'j';
							break;
						default:
							prt_fctn = 'l';
							break;
					}
				}
				/* is it time to place the legends ? */
				if (fill > legendwidth) {
					if (leg_c > 1) { /* go back one */
						i--;
						fill = fill_last;
						leg_c--;
					}
				}
				if (leg_c === 1 && prt_fctn === 'j') {
					prt_fctn = 'l';
				}
			}

			if (prt_fctn != null) {
				leg_x = border;
				if (leg_c >= 2 && prt_fctn === 'j') {
					glue = (legendwidth - fill) / (leg_c - 1);
				} else {
					glue = 0;
				}
				if (prt_fctn === 'c')
					leg_x = border + (legendwidth - fill) / 2.0;
				if (prt_fctn === 'r')
					leg_x = legendwidth - fill + border;
				for (ii = mark; ii <= i; ii++) {
					if (this.gdes[ii].legend === '') continue;
					this.gdes[ii].leg_x = leg_x;
					this.gdes[ii].leg_y = leg_y + border;
					leg_x += this.gfx.get_text_width(leg_x, this.TEXT.LEGEND, this.tabwidth, this.gdes[ii].legend) + legspace[ii] + glue;
				}
				leg_y_prev = leg_y;
				if (leg_x > border || prt_fctn === 's') leg_y += this.TEXT.LEGEND.size * 1.4;
				if (prt_fctn === 's') leg_y -= this.TEXT.LEGEND.size;
				if (prt_fctn === 'u') leg_y -= this.TEXT.LEGEND.size * 1.4;

				if(calc_width && (fill > legendwidth)) legendwidth = fill;
				fill = 0;
				leg_c = 0;
				mark = ii;
			}

			if(calc_width) this.gdes[i].legend = saved_legend;
		}
		if(calc_width) this.legendwidth = legendwidth + 2 * border;
		else this.legendheight = leg_y + border * 0.6; // FIXME 0.6 ??
	}
	return 0;
};

RrdGraph.prototype.axis_paint = function()
{
	this.gfx.line(this.xorigin - 4, this.yorigin,
			this.xorigin + this.xsize + 4, this.yorigin,
			this.MGRIDWIDTH, this.GRC.AXIS);

	this.gfx.line(this.xorigin, this.yorigin + 4,
			this.xorigin, this.yorigin - this.ysize - 4,
			this.MGRIDWIDTH, this.GRC.AXIS);

	this.gfx.new_area(this.xorigin + this.xsize + 2, this.yorigin - 3,
			this.xorigin + this.xsize + 2,
			this.yorigin + 3, this.xorigin + this.xsize + 7, this.yorigin,
			this.GRC.ARROW);
	this.gfx.close_path();

	this.gfx.new_area(this.xorigin - 3, this.yorigin - this.ysize - 2,
			this.xorigin + 3, this.yorigin - this.ysize - 2,
			this.xorigin, this.yorigin - this.ysize - 7,
			this.GRC.ARROW);
	this.gfx.close_path();

	if (this.second_axis_scale != 0){
		this.gfx.line (this.xorigin+this.xsize,this.yorigin+4,
			this.xorigin+this.xsize,this.yorigin-this.ysize-4,
			this.MGRIDWIDTH, this.GRC.AXIS);
		this.gfx.new_area (this.xorigin+this.xsize-2,  this.yorigin-this.ysize-2,
			this.xorigin+this.xsize+3,  this.yorigin-this.ysize-2,
			this.xorigin+this.xsize,    this.yorigin-this.ysize-7, /* LINEOFFSET */
			this.GRC.ARROW);
		this.gfx.close_path();
	}
};

RrdGraph.prototype.frexp10 = function (x)
{
	var mnt;
	var iexp;

	iexp = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
	mnt = x / Math.pow(10.0, iexp);
	if (mnt >= 10.0) {
		iexp++;
		mnt = x / Math.pow(10.0, iexp);
	}
	return [mnt, iexp];
};

RrdGraph.prototype.horizontal_log_grid = function ()
{
	var yloglab = [ [ 1.0, 10., 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 5.0, 10., 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 2.0, 5.0, 7.0, 10., 0.0, 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 2.0, 4.0, 6.0, 8.0, 10., 0.0, 0.0, 0.0, 0.0 ],
		[ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10. ],
		[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] /* last line */
	];
	var i, j, val_exp, min_exp;
	var nex;      /* number of decades in data */
	var logscale; /* scale in logarithmic space */
	var exfrac = 1;   /* decade spacing */
	var mid = -1; /* row in yloglab for major grid */
	var mspac;    /* smallest major grid spacing (pixels) */
	var flab;     /* first value in yloglab to use */
	var value, tmp, pre_value;
	var X0, X1, Y0;
	var graph_label;

	nex = Math.log(this.maxval / this.minval)/Math.LN10;
	logscale = this.ysize / nex;
	/* major spacing for data with high dynamic range */
	while (logscale * exfrac < 2.3 * this.TEXT.LEGEND.size) { // FIXME 3 -> 2.34 ??
		if (exfrac === 1) exfrac = 2.3; // ??? 3 -> 2.34
		else exfrac += 2.3 ; // 3-> 2.34
	}
	/* major spacing for less dynamic data */
	do {
		mid++;
		for (i = 0; yloglab[mid][i + 1] < 10.0; i++) ;
		mspac = logscale * Math.log(10.0 / yloglab[mid][i])/Math.LN10;
	} while (mspac > 1.56 * this.TEXT.LEGEND.size && yloglab[mid][0] > 0); // FIXME 2->1.56 ??
	if (mid) mid--;
	/* find first value in yloglab */
	//for (flab = 0; yloglab[mid][flab] < 10 && this.frexp10(this.minval,tmp) > yloglab[mid][flab]; flab++);
	flab = -1;
	do {
		var ret;
		flab++;
		// [ret, tmp] = this.frexp10(this.minval);
		var dummy = this.frexp10(this.minval); ret = dummy[0]; tmp = dummy[1];
	} while (yloglab[mid][flab] < 10 && ret > yloglab[mid][flab]);

	if (yloglab[mid][flab] === 10.0) {
		tmp += 1.0;
		flab = 0;
	}

	val_exp = tmp;
	if (val_exp % exfrac) val_exp += Math.abs(-val_exp % exfrac);
	X0 = this.xorigin;
	X1 = this.xorigin + this.xsize;

	/* draw grid */
	pre_value = Number.NAN;

	while (1) {
		value = yloglab[mid][flab] * Math.pow(10.0, val_exp);
		if (this.AlmostEqual2sComplement(value, pre_value, 4)) // FIXME
			break;      /* it seems we are not converging */
		pre_value = value;
		Y0 = this.ytr(value);
		if (Math.floor(Y0 + 0.5) <= this.yorigin - this.ysize)
			break;
		/* major grid line */
		this.gfx.line(X0 - 2, Y0, X0, Y0, this.MGRIDWIDTH, this.GRC.MGRID);
		this.gfx.line(X1, Y0, X1 + 2, Y0, this.MGRIDWIDTH, this.GRC.MGRID);
		this.gfx.dashed_line(X0 - 2, Y0, X1 + 2, Y0, this.MGRIDWIDTH, this.GRC.MGRID, this.grid_dash_on, this.grid_dash_off);
		/* label */
		if (this.force_units_si) {
			var scale;
			var pvalue;
			var symbol;

			scale = Math.floor(val_exp / 3.0);
			if (value >= 1.0) pvalue = Math.pow(10.0, val_exp % 3);
			else pvalue = Math.pow(10.0, ((val_exp + 1) % 3) + 2);
			pvalue *= yloglab[mid][flab];

			if (((scale + this.si_symbcenter) < this.si_symbol.length) && ((scale + this.si_symbcenter) >= 0))
				symbol = this.si_symbol[scale + this.si_symbcenter];
			else
				symbol = '?';
			graph_label = sprintf("%3.0f %s", pvalue, symbol);
		} else {
			graph_label = sprintf("%3.0e", value);
		}
		if (this.second_axis_scale != 0){
			var graph_label_right;
			var sval = value*this.second_axis_scale+this.second_axis_shift;
			if (!this.second_axis_format[0]){
				if (this.force_units_si) {
					var mfac = 1;
					var symb = '';
					//[sval, symb, mfac ] = this.auto_scale(sval, symb, mfac);
					var dummy = this.auto_scale(sval, symb, mfac); sval = dummy[0]; symb = dummy[1]; mfac = dummy[2];
					graph_label_right = sprintf("%4.0f %s", sval,symb);
				} else {
					graph_label_right = sprintf("%3.0e", sval);
				}
			} else {
				graph_label_right = sprintf(this.second_axis_format,sval,"");
			}
			this.gfx.text( X1+7, Y0, this.GRC.FONT, this.TEXT.AXIS, this.tabwidth,0.0, RrdGraph.GFX_H_LEFT, RrdGraph.GFX_V_CENTER, graph_label_right );
		}

		this.gfx.text(X0 - this.TEXT.AXIS.size, Y0, this.GRC.FONT, this.TEXT.AXIS, this.tabwidth, 0.0, RrdGraph.GFX_H_RIGHT, RrdGraph.GFX_V_CENTER, graph_label);
		if (mid < 4 && exfrac === 1) { /* minor grid */
			if (flab === 0) { /* find first and last minor line behind current major line * i is the first line and j tha last */
				min_exp = val_exp - 1;
				for (i = 1; yloglab[mid][i] < 10.0; i++) ;
				i = yloglab[mid][i - 1] + 1;
				j = 10;
			} else {
				min_exp = val_exp;
				i = yloglab[mid][flab - 1] + 1;
				j = yloglab[mid][flab];
			}
			for (; i < j; i++) { /* draw minor lines below current major line */
				value = i * Math.pow(10.0, min_exp);
				if (value < this.minval) continue;
				Y0 = this.ytr(value);
				if (Math.floor(Y0 + 0.5) <= this.yorigin - this.ysize) break;
				this.gfx.line(X0 - 2, Y0, X0, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.line(X1, Y0, X1 + 2, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.dashed_line(X0 - 1, Y0, X1 + 1, Y0, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
			}
		} else if (exfrac > 1) {
			for (i = val_exp - exfrac / 3 * 2; i < val_exp; i += exfrac / 3) {
				value = Math.pow(10.0, i);
				if (value < this.minval) continue;
				Y0 = this.ytr(value);
				if (Math.floor(Y0 + 0.5) <= this.yorigin - this.ysize) break;
				this.gfx.line(X0 - 2, Y0, X0, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.line(X1, Y0, X1 + 2, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.dashed_line(X0 - 1, Y0, X1 + 1, Y0, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
			}
		}
		if (yloglab[mid][++flab] === 10.0) { /* next decade */
			flab = 0;
			val_exp += exfrac;
		}
	}
	if (mid < 4 && exfrac === 1) { /* draw minor lines after highest major line */
		if (flab === 0) { /* find first and last minor line below current major line * i is the first line and j tha last */
			min_exp = val_exp - 1;
			for (i = 1; yloglab[mid][i] < 10.0; i++) ;
			i = yloglab[mid][i - 1] + 1;
			j = 10;
		} else {
			min_exp = val_exp;
			i = yloglab[mid][flab - 1] + 1;
			j = yloglab[mid][flab];
		}
		for (; i < j; i++) { /* draw minor lines below current major line */
			value = i * Math.pow(10.0, min_exp);
			if (value < this.minval) continue;
			Y0 = this.ytr(value);
			if (Math.floor(Y0 + 0.5) <= this.yorigin - this.ysize) break;
			this.gfx.line(X0 - 2, Y0, X0, Y0, this.GRIDWIDTH, this.GRC.GRID);
			this.gfx.line(X1, Y0, X1 + 2, Y0, this.GRIDWIDTH, this.GRC.GRID);
			this.gfx.dashed_line(X0 - 1, Y0, X1 + 1, Y0, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
		}
	} else if (exfrac > 1) { /* fancy minor gridlines */
		for (i = val_exp - exfrac / 3 * 2; i < val_exp; i += exfrac / 3) {
			value = Math.pow(10.0, i);
			if (value < this.minval) continue;
			Y0 = this.ytr(value);
			if (Math.floor(Y0 + 0.5) <= this.yorigin - this.ysize) break;
			this.gfx.line(X0 - 2, Y0, X0, Y0, this.GRIDWIDTH, this.GRC.GRID);
			this.gfx.line(X1, Y0, X1 + 2, Y0, this.GRIDWIDTH, this.GRC.GRID);
			this.gfx.dashed_line(X0 - 1, Y0, X1 + 1, Y0, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
		}
	}
	return 1;
};

RrdGraph.prototype.vertical_grid = function()
{
	var xlab_sel; /* which sort of label and grid ? */
	var ti, tilab, timajor;
	var factor;
	var graph_label;
	var X0, Y0, Y1;   /* points for filled graph and more */

	/* the type of time grid is determined by finding the number of seconds per pixel in the graph */
	if (this.xlab_user.minsec === -1) {
		factor = (this.end - this.start) / this.xsize;
		xlab_sel = 0;

		while (this.xlab[xlab_sel + 1].minsec != -1 && this.xlab[xlab_sel + 1].minsec <= factor) xlab_sel++;
		if (xlab_sel === 0) xlab_sel=1; // FIXME XXX XXX xlab_sel == 0 ???
		while (this.xlab[xlab_sel - 1].minsec === this.xlab[xlab_sel].minsec && this.xlab[xlab_sel].length > (this.end - this.start)) xlab_sel--;
		this.xlab_user = this.xlab[xlab_sel];

	}
	Y0 = this.yorigin;
	Y1 = this.yorigin - this.ysize;

	if (!(this.no_minor)) {
		for (	ti = this.find_first_time(this.start, this.xlab_user.gridtm, this.xlab_user.gridst),
			timajor = this.find_first_time(this.start, this.xlab_user.mgridtm, this.xlab_user.mgridst);
			ti < this.end && ti != -1;
			ti = this.find_next_time(ti, this.xlab_user.gridtm, this.xlab_user.gridst)) {
		    if (ti < this.start || ti > this.end) continue;
		    while (timajor < ti && timajor != -1) timajor = this.find_next_time(timajor, this.xlab_user.mgridtm, this.xlab_user.mgridst);
		    if (timajor === -1) break;
		    if (ti === timajor) continue;
		    X0 = this.xtr(ti);
		    this.gfx.line(X0, Y1 - 2, X0, Y1, this.GRIDWIDTH, this.GRC.GRID);
		    this.gfx.line(X0, Y0, X0, Y0 + 2, this.GRIDWIDTH, this.GRC.GRID);
		    this.gfx.dashed_line(X0, Y0 + 1, X0, Y1 - 1, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
		}
	}

	for (	ti = this.find_first_time(this.start, this.xlab_user.mgridtm, this.xlab_user.mgridst);
		ti < this.end && ti != -1;
		ti = this.find_next_time(ti, this.xlab_user.mgridtm, this.xlab_user.mgridst)
		) {
		if (ti < this.start || ti > this.end) continue;
		X0 = this.xtr(ti);
		this.gfx.line(X0, Y1 - 2, X0, Y1, this.MGRIDWIDTH, this.GRC.MGRID);
		this.gfx.line(X0, Y0, X0, Y0 + 3, this.MGRIDWIDTH, this.GRC.MGRID);
		this.gfx.dashed_line(X0, Y0 + 3, X0, Y1 - 2, this.MGRIDWIDTH,
			this.GRC.MGRID, this.grid_dash_on, this.grid_dash_off);
	}

	for (	ti = this.find_first_time(this.start - this.xlab_user.precis / 2, this.xlab_user.labtm, this.xlab_user.labst);
		(ti <= this.end - this.xlab_user.precis / 2) && ti != -1;
		ti = this.find_next_time(ti, this.xlab_user.labtm, this.xlab_user.labst)
		) {
		tilab = ti + this.xlab_user.precis / 2;
		if (tilab < this.start || tilab > this.end)
		    continue;
		//localtime_r(&tilab, &tm); FIXME
		//strftime(graph_label, 99, this.xlab_user.stst, &tm);
		graph_label = strftime(this.xlab_user.stst, tilab);
		this.gfx.text(this.xtr(tilab), Y0 + 3, this.GRC.FONT,
			 this.TEXT.AXIS, this.tabwidth, 0.0,
			 RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_TOP, graph_label);
	}
};

RrdGraph.prototype.auto_scale = function (value, symb_ptr, magfact)
{
	var sindex;

	if (value === 0.0 || isNaN(value)) {
		sindex = 0;
		magfact = 1.0;
	} else {
		sindex = Math.floor((Math.log(Math.abs(value))/Math.LN10) / (Math.log(this.base)/Math.LN10));
		magfact = Math.pow(this.base, sindex);
		value /= magfact;
	}
	if (sindex <= this.si_symbcenter && sindex >= -this.si_symbcenter) {
		symb_ptr = this.si_symbol[sindex + this.si_symbcenter];
	} else {
		symb_ptr = '?';
	}
	return [value, symb_ptr, magfact];
};

RrdGraph.prototype.si_unit = function()
{
	var digits;
	var viewdigits = 0;

	digits = Math.floor(Math.log(Math.max(Math.abs(this.minval), Math.abs(this.maxval))) / Math.log(this.base));

	if (this.unitsexponent != 9999) {
		/* unitsexponent = 9, 6, 3, 0, -3, -6, -9, etc */
		viewdigits = Math.floor(this.unitsexponent / 3);
	} else {
		viewdigits = digits;
	}

	this.magfact = Math.pow(this.base, digits);

	this.viewfactor = this.magfact / Math.pow(this.base, viewdigits);

	if (((viewdigits + this.si_symbcenter) < this.si_symbol.length) && ((viewdigits + this.si_symbcenter) >= 0))
		this.symbol = this.si_symbol[viewdigits + this.si_symbcenter];
	else
		this.symbol = '?';
};

RrdGraph.prototype.expand_range = function ()
{
	var sensiblevalues = [ 1000.0, 900.0, 800.0, 750.0, 700.0, 600.0, 500.0, 400.0, 300.0, 250.0, 200.0, 125.0, 100.0, 90.0, 80.0, 75.0, 70.0, 60.0, 50.0, 40.0, 30.0, 25.0, 20.0, 10.0, 9.0, 8.0, 7.0, 6.0, 5.0, 4.0, 3.5, 3.0, 2.5, 2.0, 1.8, 1.5, 1.2, 1.0, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.0, -1 ];
	var scaled_min, scaled_max;
	var adj;
	var i;

	if (isNaN(this.ygridstep)) {
		if (this.alt_autoscale) {
			var delt, fact;

			delt = this.maxval - this.minval;
			adj = delt * 0.1;
			fact = 2.0 * Math.pow(10.0, Math.floor(Math.log(Math.max(Math.abs(this.minval), Math.abs(this.maxval)) / this.magfact)/Math.LN10) - 2);
			if (delt < fact) adj = (fact - delt) * 0.55;
			this.minval -= adj;
			this.maxval += adj;
		} else if (this.alt_autoscale_min) {
			adj = (this.maxval - this.minval) * 0.1;
			this.minval -= adj;
		} else if (this.alt_autoscale_max) {
			adj = (this.maxval - this.minval) * 0.1;
			this.maxval += adj;
		} else {
			scaled_min = this.minval / this.magfact;
			scaled_max = this.maxval / this.magfact;

			for (i = 1; sensiblevalues[i] > 0; i++) {
				if (sensiblevalues[i - 1] >= scaled_min && sensiblevalues[i] <= scaled_min)
					this.minval = sensiblevalues[i] * this.magfact;
				if (-sensiblevalues[i - 1] <= scaled_min && -sensiblevalues[i] >= scaled_min)
					this.minval = -sensiblevalues[i - 1] * this.magfact;
				if (sensiblevalues[i - 1] >= scaled_max && sensiblevalues[i] <= scaled_max)
					this.maxval = sensiblevalues[i - 1] * this.magfact;
				if (-sensiblevalues[i - 1] <= scaled_max && -sensiblevalues[i] >= scaled_max)
					this.maxval = -sensiblevalues[i] * this.magfact;
			}
		}
	} else {
		this.minval = this.ylabfact * this.ygridstep * Math.floor(this.minval / (this.ylabfact * this.ygridstep));
		this.maxval = this.ylabfact * this.ygridstep * Math.ceil(this.maxval / (this.ylabfact * this.ygridstep));
  }
};

RrdGraph.prototype.calc_horizontal_grid = function()
{
	var range;
	var scaledrange;
	var pixel, i;
	var gridind = 0;
	var decimals, fractionals;

	this.ygrid_scale.labfact = 2;
	range = this.maxval - this.minval;
	scaledrange = range / this.magfact;
	if (isNaN(scaledrange) || !isFinite(scaledrange)) {
		return false;
	}

	pixel = 1;
	if (isNaN(this.ygridstep)) {
		if (this.alt_ygrid) {
			decimals = Math.ceil(Math.log(Math.max(Math.abs(this.maxval), Math.abs(this.minval)) * this.viewfactor / this.magfact)/Math.LN10);
			if (decimals <= 0) decimals = 1;
				this.ygrid_scale.gridstep = Math.pow(10, Math.floor(Math.log(range * this.viewfactor / this.magfact)/Math.LN10)) / this.viewfactor * this.magfact;
			if (this.ygrid_scale.gridstep === 0)  this.ygrid_scale.gridstep = 0.1;
			if (range / this.ygrid_scale.gridstep < 5 && this.ygrid_scale.gridstep >= 30)
				this.ygrid_scale.gridstep /= 10;
			if (range / this.ygrid_scale.gridstep > 15)
				this.ygrid_scale.gridstep *= 10;
			if (range / this.ygrid_scale.gridstep > 5) {
				this.ygrid_scale.labfact = 1;
				if (range / this.ygrid_scale.gridstep > 8 || this.ygrid_scale.gridstep < 1.8 * this.TEXT.AXIS.size) // 1.8
					this.ygrid_scale.labfact = 2;
			} else {
				this.ygrid_scale.gridstep /= 5;
				this.ygrid_scale.labfact = 5;
			}

			fractionals = Math.floor(Math.log(this.ygrid_scale.gridstep * this.ygrid_scale.labfact * this.viewfactor / this.magfact)/Math.LN10);
			if (fractionals < 0) {  /* small amplitude. */
				var len = decimals - fractionals + 1;
				if (this.unitslength < len + 2) this.unitslength = len + 2;
				this.ygrid_scale.labfmt = sprintf("%%%d.%df%s", len, -fractionals, (this.symbol != ' ' ? " %s" : ""));
			} else {
				var len = decimals + 1;
				if (this.unitslength < len + 2) this.unitslength = len + 2;
				this.ygrid_scale.labfmt = sprintf("%%%d.0f%s", len, (this.symbol != ' ' ? " %s" : ""));
			}
		} else {  /* classic rrd grid */
			for (i = 0; this.ylab[i].grid > 0; i++) {
				pixel = this.ysize / (scaledrange / this.ylab[i].grid);
				gridind = i;
				if (pixel >= 5) break;
			}
			for (i = 0; i < 4; i++) {
				if (pixel * this.ylab[gridind].lfac[i] >= 1.8 * this.TEXT.AXIS.size) { // 1.8
					this.ygrid_scale.labfact = this.ylab[gridind].lfac[i];
					break;
				}
			}
			this.ygrid_scale.gridstep = this.ylab[gridind].grid * this.magfact;
		}
	} else {
		this.ygrid_scale.gridstep = this.ygridstep;
		this.ygrid_scale.labfact = this.ylabfact;
	}
	return true;
};

RrdGraph.prototype.draw_horizontal_grid = function()
{
	var i;
	var scaledstep;
	var graph_label;
	var nlabels = 0;
	var X0 = this.xorigin;
	var X1 = this.xorigin + this.xsize;
	var sgrid = Math.round(this.minval / this.ygrid_scale.gridstep - 1);
	var egrid = Math.round(this.maxval / this.ygrid_scale.gridstep + 1);
	var MaxY;
	var second_axis_magfact = 0;
	var second_axis_symb = '';
	var Y0, YN;
	var sisym;

	scaledstep = this.ygrid_scale.gridstep / this.magfact * this.viewfactor;
	MaxY = scaledstep * egrid;
	for (i = sgrid; i <= egrid; i++) {
		Y0 = this.ytr(this.ygrid_scale.gridstep * i);
		YN = this.ytr(this.ygrid_scale.gridstep * (i + 1));
		if (Math.floor(Y0 + 0.5) >= this.yorigin - this.ysize && Math.floor(Y0 + 0.5) <= this.yorigin) {
			if (i % this.ygrid_scale.labfact === 0 || (nlabels === 1 && (YN < this.yorigin - this.ysize || YN > this.yorigin))) {
				if (this.symbol === ' ') {
					if (this.alt_ygrid) {
						graph_label = sprintf(this.ygrid_scale.labfmt, scaledstep * i); // FIXME
					} else {
						if (MaxY < 10) {
							graph_label = sprintf("%4.1f", scaledstep * i);
						} else {
							graph_label = sprintf("%4.0f", scaledstep * i);
						}
					}
				} else {
					sisym = (i === 0 ? ' ' : this.symbol);
					if (this.alt_ygrid) {
						graph_label = sprintf(this.ygrid_scale.labfmt, scaledstep * i, sisym);
					} else {
						if (MaxY < 10) {
							graph_label = sprintf("%4.1f %s", scaledstep * i, sisym);
						} else {
							graph_label = sprintf("%4.0f %s", scaledstep * i, sisym);
						}
					}
				}
				nlabels++;
				if (this.second_axis_scale != 0){
					var graph_label_right;
					var sval = this.ygrid_scale.gridstep*i*this.second_axis_scale+this.second_axis_shift;
					if (!this.second_axis_format){
						if (!second_axis_magfact){
							var dummy = this.ygrid_scale.gridstep*(sgrid+egrid)/2.0*this.second_axis_scale+this.second_axis_shift;
							//[dummy, second_axis_symb, second_axis_magfact ] = this.auto_scale(dummy,second_axis_symb,second_axis_magfact);
							dummy =  this.auto_scale(dummy,second_axis_symb,second_axis_magfact); second_axis_symb = dummy[1];  second_axis_magfact=dummy[2];
						}
						sval /= second_axis_magfact;
						if(MaxY < 10) {
							graph_label_right = sprintf("%5.1f %s", sval, second_axis_symb);
						} else {
							graph_label_right = sprintf("%5.0f %s", sval, second_axis_symb);
						}
					} else {
						graph_label_right = sprintf(this.second_axis_format, sval);
					}
					this.gfx.text (X1+7, Y0, this.GRC.FONT, this.TEXT.AXIS, this.tabwidth, 0.0, RrdGraph.GFX_H_LEFT, RrdGraph.GFX_V_CENTER, graph_label_right );
				}
				this.gfx.text(X0 - this.TEXT.AXIS.size , Y0, this.GRC.FONT, this.TEXT.AXIS , this.tabwidth, 0.0, RrdGraph.GFX_H_RIGHT, RrdGraph.GFX_V_CENTER, graph_label);
				this.gfx.line(X0 - 2, Y0, X0, Y0, this.MGRIDWIDTH, this.GRC.MGRID);
				this.gfx.line(X1, Y0, X1 + 2, Y0, this.MGRIDWIDTH, this.GRC.MGRID);
				this.gfx.dashed_line(X0 - 2, Y0, X1 + 2, Y0, this.MGRIDWIDTH, this.GRC.MGRID, this.grid_dash_on, this.grid_dash_off);
			} else if (!this.no_minor) {
				this.gfx.line( X0 - 2, Y0, X0, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.line(X1, Y0, X1 + 2, Y0, this.GRIDWIDTH, this.GRC.GRID);
				this.gfx.dashed_line(X0 - 1, Y0, X1 + 1, Y0, this.GRIDWIDTH, this.GRC.GRID, this.grid_dash_on, this.grid_dash_off);
			}
		}
	}
	return 1;
};

RrdGraph.prototype.grid_paint = function()
{
	var i;
	var res = 0;
	var X0, Y0;

	if (this.draw_3d_border > 0) {
		i = this.draw_3d_border;
		this.gfx.new_area(0, this.yimg, i, this.yimg - i, i, i, this.GRC.SHADEA);
		this.gfx.add_point(this.ximg - i, i);
		this.gfx.add_point(this.ximg, 0);
		this.gfx.add_point(0, 0);
		this.gfx.close_path();
		this.gfx.new_area(i, this.yimg - i, this.ximg - i, this.yimg - i, this.ximg - i, i, this.GRC.SHADEB);
		this.gfx.add_point(this.ximg, 0);
		this.gfx.add_point(this.ximg, this.yimg);
		this.gfx.add_point(0, this.yimg);
		this.gfx.close_path();
	}
	if (this.draw_x_grid)
		this.vertical_grid();
	if (this.draw_y_grid) {
		if (this.logarithmic)
			res =	this.horizontal_log_grid();
		else
			res = this.draw_horizontal_grid();
	    /* dont draw horizontal grid if there is no min and max val */
		if (!res) {
			this.gfx.text(this.ximg / 2, (2 * this.yorigin - this.ysize) / 2,
			this.GRC.FONT, this.TEXT.AXIS,
			this.tabwidth, 0.0,
			RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_CENTER, 'No Data found');
		}
	}

	/* yaxis unit description */
	if (this.ylegend){
	    this.gfx.text(this.xOriginLegendY+10, this.yOriginLegendY,
				this.GRC.FONT, this.TEXT.UNIT, this.tabwidth, this.YLEGEND_ANGLE,
				RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_CENTER, this.ylegend);

	}
	if (this.second_axis_legend){
		this.gfx.text(this.xOriginLegendY2+10, this.yOriginLegendY2,
			this.GRC.FONT, this.TEXT.UNIT, this.tabwidth, this.YLEGEND_ANGLE,
			RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_CENTER, this.second_axis_legend);
	}

	/* graph title */
	this.gfx.text(this.xOriginTitle, this.yOriginTitle+6,
	         this.GRC.FONT, this.TEXT.TITLE, this.tabwidth, 0.0, RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_TOP, this.title);
	/* rrdtool 'logo' */
	if (!this.no_rrdtool_tag){
		var color = this.parse_color(this.GRC.FONT);
		color[3] = 0.3;
		var water_color = this.color2rgba(color);
		var xpos = this.legendposition === RrdGraph.LEGEND_POS_EAST ? this.xOriginLegendY : this.ximg - 4;
		this.gfx.text(xpos, 5, water_color, this.TEXT.WATERMARK, this.tabwidth,
				-90, RrdGraph.GFX_H_LEFT, RrdGraph.GFX_V_TOP, "RRDTOOL / TOBI OETIKER");
	}
	/* graph watermark */
	if (this.watermark) {
		var color = this.parse_color(this.GRC.FONT);
		color[3] = 0.3;
		var water_color = this.color2rgba(color);
		this.gfx.text(this.ximg / 2, this.yimg - 6, water_color, this.TEXT.WATERMARK , this.tabwidth, 0,
				RrdGraph.GFX_H_CENTER, RrdGraph.GFX_V_BOTTOM, this.watermark);
	}
	/* graph labels */
	if (!(this.no_legend) && !(this.only_graph)) {
		for (var i = 0 , gdes_c = this.gdes.length; i < gdes_c; i++) {
			if (!this.gdes[i].legend) continue;
			X0 = this.xOriginLegend + this.gdes[i].leg_x;
			Y0 = this.legenddirection === RrdGraph.LEGEND_DIR_TOP_DOWN ? this.yOriginLegend + this.gdes[i].leg_y : this.yOriginLegend + this.legendheight - this.gdes[i].leg_y;
			this.gfx.text(X0, Y0, this.GRC.FONT, this.TEXT.LEGEND, this.tabwidth, 0.0, RrdGraph.GFX_H_LEFT, RrdGraph.GFX_V_BOTTOM, this.gdes[i].legend);
			if (this.gdes[i].gf != RrdGraphDesc.GF_PRINT && this.gdes[i].gf != RrdGraphDesc.GF_GPRINT && this.gdes[i].gf != RrdGraphDesc.GF_COMMENT) {
				var boxH, boxV;
				var X1, Y1;

				boxH = this.gfx.get_text_width(0,this.TEXT.LEGEND, this.tabwidth, 'o') * 1.2;
				boxV = boxH;

				Y0 -= boxV * 0.4;

				if (this.dynamic_labels && this.gdes[i].gf === RrdGraphDesc.GF_HRULE) {
			  		this.gfx.line(X0, Y0 - boxV / 2, X0 + boxH, Y0 - boxV / 2, 1.0, this.gdes[i].col);
				} else if (this.dynamic_labels && this.gdes[i].gf === RrdGraphDesc.GF_VRULE) {
			  		this.gfx.line(X0 + boxH / 2, Y0, X0 + boxH / 2, Y0 - boxV, 1.0, this.gdes[i].col);
		  		} else if (this.dynamic_labels && this.gdes[i].gf === RrdGraphDesc.GF_LINE) {
		  			this.gfx.line(X0, Y0, X0 + boxH, Y0 - boxV, this.gdes[i].linewidth, this.gdes[i].col);
				} else {
					this.gfx.new_area(X0, Y0 - boxV, X0, Y0, X0 + boxH, Y0, this.GRC.BACK);
					this.gfx.add_point(X0 + boxH, Y0 - boxV);
					this.gfx.close_path();
					this.gfx.new_area(X0, Y0 - boxV, X0, Y0, X0 + boxH, Y0, this.gdes[i].col);
					this.gfx.add_point(X0 + boxH, Y0 - boxV);
					this.gfx.close_path();
					if (this.gdes[i].dash) this.gfx.set_dash([ 3.0 ], 1, 0.0);
					this.gfx.rectangle(X0, Y0, X0 + boxH, Y0 - boxV, 1.0, this.GRC.FRAME);
				}
			}
		}
	}
};

RrdGraph.prototype.graph_size_location = function (elements)
{
	var Xvertical = 0;
	var Xvertical2 = 0;
	var Ytitle = 0;
	var Xylabel = 0;
	var Xmain = 0;
	var Ymain = 0;
	var Yxlabel = 0;
	var Xspacing = 15;
	var Yspacing = 15;
	var Ywatermark = 4;

	if (this.only_graph) {
		this.xorigin = 0;
		this.ximg = this.xsize;
		this.yimg = this.ysize;
		this.yorigin = this.ysize;
		this.xtr(0);
		this.ytr(Number.NaN);
		return 0;
	}

	if(this.watermark)
		Ywatermark = this.TEXT.WATERMARK.size * 1.5; // 2
	if(this.ylegend)
		Xvertical = this.TEXT.UNIT.size * 1.5; // 2
	if(this.second_axis_legend) {
		Xvertical2 = this.TEXT.UNIT.size * 1.5; // 2
	} else {
		Xvertical2 = Xspacing;
	}

	if(this.title)
		Ytitle = this.TEXT.TITLE.size * 1.95 + 10; // 2.6
	else
		Ytitle = Yspacing;

	if (elements) {
		if (this.draw_x_grid)
			Yxlabel = this.TEXT.AXIS.size * 1.35; // 2.5 1.87
		if (this.draw_y_grid || this.forceleftspace)  // FIXME
			Xylabel = this.gfx.get_text_width(0, this.TEXT.AXIS, this.tabwidth, '0') * this.unitslength;
	}
	Xylabel += Xspacing;
	this.legendheight = 0;
	this.legendwidth = 0;
	if(!this.no_legend) {
		if(this.legendposition === RrdGraph.LEGEND_POS_WEST || this.legendposition === RrdGraph.LEGEND_POS_EAST){
			if (this.leg_place(1) === -1) return -1; // FIXME
		}
	}

	if(this.full_size_mode) {
		this.ximg = this.xsize;
		this.yimg = this.ysize;
		Xmain = this.ximg;
		Ymain = this.yimg;

		Xmain -= Xylabel;// + Xspacing;
		if((this.legendposition === RrdGraph.LEGEND_POS_WEST || this.legendposition === RrdGraph.LEGEND_POS_EAST) && !(this.no_legend) )
			Xmain -= this.legendwidth;// + Xspacing;
		if (this.second_axis_scale != 0) Xmain -= Xylabel;
		if (!(this.no_rrdtool_tag)) Xmain -= Xspacing;

		Xmain -= Xvertical + Xvertical2;

		if(Xmain < 1) Xmain = 1;
		this.xsize = Xmain;

		if (!(this.no_legend)) {
			if(this.legendposition === RrdGraph.LEGEND_POS_NORTH || this.legendposition === RrdGraph.LEGEND_POS_SOUTH){
				this.legendwidth = this.ximg;
				if (this.leg_place(0) === -1) return -1;
			}
		}

		if( (this.legendposition === RrdGraph.LEGEND_POS_NORTH || this.legendposition === RrdGraph.LEGEND_POS_SOUTH)  && !(this.no_legend) )
			Ymain -=  Yxlabel + this.legendheight;
		else Ymain -= Yxlabel;

		Ymain -= Ytitle;

		if (this.nolegened) Ymain -= 0.5*Yspacing;
		if (this.watermark) Ymain -= Ywatermark;
		if(Ymain < 1) Ymain = 1;
		this.ysize = Ymain;
	} else {
		if (elements) {
			Xmain = this.xsize;
			Ymain = this.ysize;
		}
		this.ximg = Xmain + Xylabel;
		if (!this.no_rrdtool_tag) this.ximg += Xspacing;

		if( (this.legendposition === RrdGraph.LEGEND_POS_WEST || this.legendposition === RrdGraph.LEGEND_POS_EAST) && !this.no_legend )
			this.ximg += this.legendwidth;// + Xspacing;
		if (this.second_axis_scale != 0) this.ximg += Xylabel;

		this.ximg += Xvertical + Xvertical2;

		if (!(this.no_legend)) {
			if(this.legendposition === RrdGraph.LEGEND_POS_NORTH || this.legendposition === RrdGraph.LEGEND_POS_SOUTH){
				this.legendwidth = this.ximg;
				if (this.leg_place(0) === -1) return -1;
			}
		}

		this.yimg = Ymain + Yxlabel;
		if( (this.legendposition === RrdGraph.LEGEND_POS_NORTH || this.legendposition === RrdGraph.LEGEND_POS_SOUTH)  && !(this.no_legend) )
		     this.yimg += this.legendheight;

		if (Ytitle) this.yimg += Ytitle;
		else this.yimg += 1.5 * Yspacing;

		if (this.no_legend) this.yimg += 0.5*Yspacing;
		if (this.watermark) this.yimg += Ywatermark;
	}


	if (!this.no_legend) {
		if(this.legendposition === RrdGraph.LEGEND_POS_WEST || this.legendposition === RrdGraph.LEGEND_POS_EAST){
			if (this.leg_place(0) === -1) return -1;
		}
	}

	switch(this.legendposition){
		case RrdGraph.LEGEND_POS_NORTH:
			this.xOriginTitle   = Math.round(this.xsize / 2);
			this.yOriginTitle   = 0;
			this.xOriginLegend  = 0;
			this.yOriginLegend  = Math.round(Ytitle);
			this.xOriginLegendY = 0;
			this.yOriginLegendY = Math.round(Ytitle + this.legendheight + (Ymain / 2) + Yxlabel);
			this.xorigin        = Math.round(Xvertical + Xylabel);
			this.yorigin        = Math.round(Ytitle + this.legendheight + Ymain);
			this.xOriginLegendY2 = Math.round(Xvertical + Xylabel + Xmain);
			if (this.second_axis_scale != 0) this.xOriginLegendY2 += Xylabel;
			this.yOriginLegendY2 = Math.round(Ytitle + this.legendheight + (Ymain / 2) + Yxlabel);
			break;
		case RrdGraph.LEGEND_POS_WEST:
			this.xOriginTitle   = Math.round(this.legendwidth + this.xsize / 2);
			this.yOriginTitle   = 0;
			this.xOriginLegend  = 0;
			this.yOriginLegend  = Math.round(Ytitle);
			this.xOriginLegendY = Math.round(this.legendwidth);
			this.yOriginLegendY = Math.round(Ytitle + (Ymain / 2));
			this.xorigin        = Math.round(this.legendwidth + Xvertical + Xylabel);
			this.yorigin        = Math.round(Ytitle + Ymain);
			this.xOriginLegendY2 = Math.round(this.legendwidth + Xvertical + Xylabel + Xmain);
			if (this.second_axis_scale != 0) this.xOriginLegendY2 += Xylabel;
			this.yOriginLegendY2 = Math.round(Ytitle + (Ymain / 2));
			break;
		case RrdGraph.LEGEND_POS_SOUTH:
			this.xOriginTitle   = Math.round(this.xsize / 2);
			this.yOriginTitle   = 0;
			this.xOriginLegend  = 0;
			this.yOriginLegend  = Math.round(Ytitle + Ymain + Yxlabel);
			this.xOriginLegendY = 0;
			this.yOriginLegendY = Math.round(Ytitle + (Ymain / 2));
			this.xorigin        = Math.round(Xvertical + Xylabel);
			this.yorigin        = Math.round(Ytitle + Ymain);
			this.xOriginLegendY2 = Math.round(Xvertical + Xylabel + Xmain);
			if (this.second_axis_scale != 0) this.xOriginLegendY2 += Xylabel;
			this.yOriginLegendY2 = Math.round(Ytitle + (Ymain / 2));
			break;
		case RrdGraph.LEGEND_POS_EAST:
			this.xOriginTitle   = Math.round(this.xsize / 2);
			this.yOriginTitle   = 0;
			this.xOriginLegend  = Math.round(Xvertical + Xylabel + Xmain + Xvertical2);
			if (this.second_axis_scale != 0) this.xOriginLegend += Xylabel;
			this.yOriginLegend  = Math.round(Ytitle);
			this.xOriginLegendY = 0;
			this.yOriginLegendY = Math.round(Ytitle + (Ymain / 2));
			this.xorigin        = Math.round(Xvertical + Xylabel);
			this.yorigin        = Math.round(Ytitle + Ymain);
			this.xOriginLegendY2 = Math.round(Xvertical + Xylabel + Xmain);
			if (this.second_axis_scale != 0) this.xOriginLegendY2 += Xylabel;
			this.yOriginLegendY2 = Math.round(Ytitle + (Ymain / 2));

			if (!this.no_rrdtool_tag){
				this.xOriginTitle    += Xspacing;
				this.xOriginLegend   += Xspacing;
				this.xOriginLegendY  += Xspacing;
				this.xorigin         += Xspacing;
				this.xOriginLegendY2 += Xspacing;
			}
			break;
	}
	this.xtr(0);
	this.ytr(Number.NaN);
	return 0;
};

RrdGraph.prototype.graph_paint_init = function()
{
	if (this.logarithmic && this.minval <= 0)
		throw new RrdGraphError("for a logarithmic yaxis you must specify a lower-limit > 0");

	//var start_end = RrdTime.proc_start_end(this.start_t, this.end_t);
	//this.start = start_end[0];
	//this.end = start_end[1];

	if (this.start < 3600 * 24 * 365 * 10)
		throw new RrdGraphError("the first entry to fetch should be after 1980 ("+this.start+")");

	if (this.end < this.start)
		throw new RrdGraphError("start ("+this.start+") should be less than end ("+this.end+")");

//this.xlab_form = null
	this.xlab_user = { minsec: -1, length: 0, gridtm: 0, gridst: 0, mgridtm: 0, mgridst: 0, labtm: 0, labst: 0, precis: 0, stst: null };
	this.ygrid_scale = { gridstep: 0.0, labfact:0 , labfmt: null };
	this.minval = this.setminval;
	this.maxval = this.setmaxval;

	this.step = Math.max(this.step_orig, (this.end - this.start) / this.xsize);

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		this.gdes[i].step = this.gdes[i].step_orig;
		this.gdes[i].start = this.start; // FIXME SHIFT
//	this.gdes[i].start_orig = this.start;
		this.gdes[i].end = this.end; // FIXME SHIFT
//	this.gdes[i].end_orig = this.end;
	}

};

RrdGraph.prototype.graph_paint_draw = function()
{
	var areazero = 0.0;
	var lastgdes = null;

	if (this.data_calc() === -1)
		return -1;
	var i = this.print_calc();
	if (i < 0)
		return -1;
	if (this.graph_size_location(i) === -1)
		return -1;

	if (this.data_proc() === -1)
		return -1;
	if (!this.logarithmic)
		this.si_unit();
	if (!this.rigid && !this.logarithmic)
		this.expand_range();

	if (this.magfact === 0) this.magfact =1; // FIXME logarithmic ¿?

	if (!this.calc_horizontal_grid())
		return -1;

	this.ytr(Number.NaN);

	this.gfx.size(this.ximg, this.yimg);

	this.gfx.new_area(0, 0, 0, this.yimg, this.ximg, this.yimg, this.GRC.BACK);
	this.gfx.add_point(this.ximg, 0);
	this.gfx.close_path();

	this.gfx.new_area(this.xorigin, this.yorigin, this.xorigin + this.xsize,
		this.yorigin, this.xorigin + this.xsize, this.yorigin - this.ysize, this.GRC.CANVAS);
	this.gfx.add_point(this.xorigin, this.yorigin - this.ysize);
	this.gfx.close_path();

//this.ctx.rect(this.xorigin, this.yorigin - this.ysize - 1.0, this.xsize, this.ysize + 2.0);
//this.ctx.clip();

	if (this.minval > 0.0) areazero = this.minval;
	if (this.maxval < 0.0) areazero = this.maxval;

	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		switch (this.gdes[i].gf) {
			case RrdGraphDesc.GF_CDEF:
			case RrdGraphDesc.GF_VDEF:
			case RrdGraphDesc.GF_DEF:
			case RrdGraphDesc.GF_PRINT:
			case RrdGraphDesc.GF_GPRINT:
			case RrdGraphDesc.GF_COMMENT:
			case RrdGraphDesc.GF_TEXTALIGN:
			case RrdGraphDesc.GF_HRULE:
			case RrdGraphDesc.GF_VRULE:
			case RrdGraphDesc.GF_XPORT:
			case RrdGraphDesc.GF_SHIFT:
				break;
			case RrdGraphDesc.GF_TICK:
				for (var ii = 0; ii < this.xsize; ii++) {
					if (!isNaN(this.gdes[i].p_data[ii]) && this.gdes[i].p_data[ii] != 0.0) {
						if (this.gdes[i].yrule > 0) {
							this.gfx.line(this.xorigin + ii, this.yorigin + 1.0, 
									this.xorigin + ii, this.yorigin - this.gdes[i].yrule * this.ysize, 1.0, this.gdes[i].col);
						} else if (this.gdes[i].yrule < 0) {
							this.gfx.line(this.xorigin + ii, this.yorigin - this.ysize - 1.0, 
									this.xorigin + ii, this.yorigin - this.ysize - this.gdes[i].yrule * this.ysize, 1.0, this.gdes[i].col);
						}
					}
				}
				break;
			case RrdGraphDesc.GF_LINE:
			case RrdGraphDesc.GF_AREA:
				var diffval = this.maxval - this.minval;
				var maxlimit = this.maxval + 9 * diffval;
				var minlimit = this.minval - 9 * diffval;
				for (var ii = 0; ii < this.xsize; ii++) {
					if (!isNaN(this.gdes[i].p_data[ii])) { // FIXME NaN < ???
						if (!isFinite(this.gdes[i].p_data[ii])) {
							if (this.gdes[i].p_data[ii] > 0) this.gdes[i].p_data[ii] = this.maxval;
							else this.gdes[i].p_data[ii] = this.minval;
						}
						if (this.gdes[i].p_data[ii] > maxlimit) this.gdes[i].p_data[ii] = maxlimit;
						if (this.gdes[i].p_data[ii] < minlimit) this.gdes[i].p_data[ii] = minlimit;
					}
				}
				var color = this.parse_color(this.gdes[i].col); // if (this.gdes[i].col.alpha != 0.0)
				if (color[3] != 0.0) {
					if (this.gdes[i].gf === RrdGraphDesc.GF_LINE) {
						var last_y = 0.0;
						var draw_on = false;

						if (this.gdes[i].dash) this.gfx.set_dash(this.gdes[i].p_dashes, this.gdes[i].ndash, this.gdes[i].offset);
						this.gfx.stroke_begin(this.gdes[i].linewidth, this.gdes[i].col);
						for (var ii = 1; ii < this.xsize; ii++) {
							if (isNaN(this.gdes[i].p_data[ii]) || (this.slopemode && isNaN(this.gdes[i].p_data[ii - 1]))) {
								draw_on = false;
								continue;
							}
							if (!draw_on) {
								last_y = this.ytr(this.gdes[i].p_data[ii]);
								if (!this.slopemode) {
									var x = ii - 1 + this.xorigin;
									var y = last_y;
									this.gfx.moveTo(x, y);
									x = ii + this.xorigin;
									y = last_y;
									this.gfx.lineTo(x, y);
								} else {
									var x = ii - 1 + this.xorigin;
									var y = this.ytr(this.gdes[i].p_data[ii - 1]);
									this.gfx.moveTo(x, y);
									x = ii + this.xorigin;
									y = last_y;
									this.gfx.lineTo(x, y);
								}
								draw_on = true;
							} else {
								var x1 = ii + this.xorigin;
								var y1 = this.ytr(this.gdes[i].p_data[ii]);

								if (!this.slopemode && !this.AlmostEqual2sComplement(y1, last_y, 4)) {
									var x = ii - 1 + this.xorigin;
									var y = y1;

									this.gfx.lineTo(x, y);
								}
								last_y = y1;
								this.gfx.lineTo(x1, y1);
							}
						}
						this.gfx.stroke_end();
					} else {
						var idxI = -1;
						var foreY = [];
						var foreX = [];
						var backY = [];
						var backX = [];
						var drawem = false;

						for (ii = 0; ii <= this.xsize; ii++) {
							var ybase, ytop;

							if (idxI > 0 && (drawem || ii === this.xsize)) {
								var cntI = 1;
								var lastI = 0;

								while (cntI < idxI && this.AlmostEqual2sComplement(foreY [lastI], foreY[cntI], 4) &&
									this.AlmostEqual2sComplement(foreY [lastI], foreY [cntI + 1], 4)) cntI++;
								this.gfx.new_area(backX[0], backY[0], foreX[0], foreY[0], foreX[cntI], foreY[cntI], this.gdes[i].col);
								while (cntI < idxI) {
									lastI = cntI;
									cntI++;
									while (cntI < idxI &&
										this.AlmostEqual2sComplement(foreY [lastI], foreY[cntI], 4) &&
										this.AlmostEqual2sComplement(foreY [lastI], foreY [cntI + 1], 4)) cntI++;
										this.gfx.add_point(foreX[cntI], foreY[cntI]);
								}
								this.gfx.add_point(backX[idxI], backY[idxI]);
								while (idxI > 1) {
									lastI = idxI;
									idxI--;
									while (idxI > 1 &&
										this.AlmostEqual2sComplement(backY [lastI], backY[idxI], 4) &&
										this.AlmostEqual2sComplement(backY [lastI], backY [idxI - 1], 4)) idxI--;
									this.gfx.add_point(backX[idxI], backY[idxI]);
								}
								idxI = -1;
								drawem = false;
								this.gfx.close_path();
							}
							if (drawem) {
								drawem = false;
								idxI = -1;
							}
							if (ii === this.xsize)
								break;
							if (!this.slopemode && ii === 0)
								continue;
							if (isNaN(this.gdes[i].p_data[ii])) {
								drawem = true;
								continue;
							}
							ytop = this.ytr(this.gdes[i].p_data[ii]);
							if (lastgdes && this.gdes[i].stack) ybase = this.ytr(lastgdes.p_data[ii]);
							else ybase = this.ytr(areazero);
							if (ybase === ytop) {
								drawem = true;
								continue;
							}
							if (ybase > ytop) {
								var extra = ytop;
								ytop = ybase;
								ybase = extra;
							}
							if (!this.slopemode) {
								backY[++idxI] = ybase - 0.2;
								backX[idxI] = ii + this.xorigin - 1;
								foreY[idxI] = ytop + 0.2;
								foreX[idxI] = ii + this.xorigin - 1;
							}
							backY[++idxI] = ybase - 0.2;
							backX[idxI] = ii + this.xorigin;
							foreY[idxI] = ytop + 0.2;
							foreX[idxI] = ii + this.xorigin;
						}
					}
				}
				/* if color != 0x0 */
				/* make sure we do not run into trouble when stacking on NaN */
				for (ii = 0; ii < this.xsize; ii++) {
					if (isNaN(this.gdes[i].p_data[ii])) {
						if (lastgdes && (this.gdes[i].stack)) this.gdes[i].p_data[ii] = lastgdes.p_data[ii];
						else this.gdes[i].p_data[ii] = areazero;
					}
				}
				lastgdes = this.gdes[i]; //lastgdes = &(this.gdes[i]);
				break;
			case RrdGraphDesc.GF_STACK:
				throw new RrdGraphError("STACK should already be turned into LINE or AREA here");
		}
	}
//cairo_reset_clip(this.cr);
	if (!this.only_graph)
		this.grid_paint();
	if (!this.only_graph)
		this.axis_paint();
	/* the RULES are the last thing to paint ... */
	for (var i = 0, gdes_c = this.gdes.length; i < gdes_c; i++) {
		switch (this.gdes[i].gf) {
			case RrdGraphDesc.GF_HRULE:
				if (this.gdes[i].yrule >= this.minval && this.gdes[i].yrule <= this.maxval) {
					if (this.gdes[i].dash) this.gfx.set_dash(this.gdes[i].p_dashes, this.gdes[i].ndash, this.gdes[i].offset);
					this.gfx.line(this.xorigin, this.ytr(this.gdes[i].yrule), 
						this.xorigin + this.xsize, this.ytr(this.gdes[i].yrule), 1.0, this.gdes[i].col);
				}
				break;
			case RrdGraphDesc.GF_VRULE:
				if (this.gdes[i].xrule >= this.start && this.gdes[i].xrule <= this.end) {
					if (this.gdes[i].dash) this.gfx.set_dash(this.gdes[i].p_dashes, this.gdes[i].ndash, this.gdes[i].offset);
					this.gfx.line(this.xtr(this.gdes[i].xrule), this.yorigin, 
						this.xtr(this.gdes[i].xrule), this.yorigin - this.ysize, 1.0, this.gdes[i].col);
				}
				break;
			default:
				break;
		}
	}
	return 0;
};

RrdGraph.prototype.graph_paint = function ()
{
	this.graph_paint_init();
	if (this.data_fetch() === -1)
		return -1;
	return this.graph_paint_draw();
};

RrdGraph.prototype.graph_paint_async = function ()
{
	this.graph_paint_init();
	this.data_fetch_async();
};

RrdGraph.prototype.find_var = function(key)
{
	for (var ii = 0, gdes_c = this.gdes.length; ii < gdes_c; ii++) {
		if ((this.gdes[ii].gf === RrdGraphDesc.GF_DEF ||
			this.gdes[ii].gf === RrdGraphDesc.GF_VDEF ||
			this.gdes[ii].gf === RrdGraphDesc.GF_CDEF)
			&& this.gdes[ii].vname === key) {
			return ii;
		}
	}
	return -1;
};

RrdGraph.prototype.gdes_add_def = function (vname, rrdfile, name, cf, step, start, end, reduce)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_DEF, vname, rrdfile, name, cf, step, start, end, reduce));
};

RrdGraph.prototype.gdes_add_cdef = function (vname, rpn)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_CDEF, vname, rpn));
};

RrdGraph.prototype.gdes_add_vdef = function (vname, rpn)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_VDEF, vname, rpn));
};

RrdGraph.prototype.gdes_add_shift = function (vname, offset)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_SHIFT, vname, offset));
};

RrdGraph.prototype.gdes_add_line = function (width, value, color, legend, stack, dashes, dash_offset)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_LINE, width, value, color, legend, stack, dashes, dash_offset));
};

RrdGraph.prototype.gdes_add_area = function (value, color, legend, stack)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_AREA, value, color, legend, stack));
};

RrdGraph.prototype.gdes_add_tick = function (vname, color, fraction, legend)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_TICK, vname, color, fraction, legend));
};

RrdGraph.prototype.gdes_add_gprint = function (vname, cf, format, strftimefmt)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_GPRINT, vname, cf, format, strftimefmt));
};

RrdGraph.prototype.gdes_add_comment = function (text)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_COMMENT, text));
};

RrdGraph.prototype.gdes_add_textalign = function (align)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_TEXTALIGN, align));
};

RrdGraph.prototype.gdes_add_vrule = function (time, color, legend, dashes, dash_offset)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_VRULE, time, color, legend, dashes, dash_offset));
};

RrdGraph.prototype.gdes_add_hrule = function (value, color, legend, dashes, dash_offset)
{
	this.gdes.push(new RrdGraphDesc(this, RrdGraphDesc.GF_HRULE, value, color, legend, dashes, dash_offset));
};

RrdGraph.prototype.tmt_conv = function (str)
{
	switch (str) {
		case 'SECOND': return RrdGraph.TMT_SECOND;
		case 'MINUTE': return RrdGraph.TMT_MINUTE;
		case 'HOUR': return RrdGraph.TMT_HOUR;
		case 'DAY': return RrdGraph.TMT_DAY;
		case 'WEEK': return RrdGraph.TMT_WEEK;
		case 'MONTH': return RrdGraph.TMT_MONTH;
		case 'YEAR': return RrdGraph.TMT_YEAR;
	}
	return -1;
};

