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
 * RrdRpnError
 * @constructor
 */
var RrdRpnError = function (message) 
{
    this.name = "RrdRpnError";
    this.message = (message) ? message : "RPN stack underflow";
};
RrdRpnError.prototype = new Error();

/**
 * RrdRpn
 * @constructor
 */
var RrdRpn = function (str_expr, gdes) /* parser */
{
	var steps = -1;
	var expr;
	var exprs = str_expr.split(',');
	
	this.rpnexpr = str_expr;
	this.rpnp = [];
	this.rpnstack = null;

	for(var i=0, len=exprs.length; i < len; i++) {
		expr=exprs[i].toUpperCase();

		steps++;
		this.rpnp[steps] = {};

		if (!isNaN(expr)) {
			this.rpnp[steps].op = RrdRpn.OP_NUMBER;
			this.rpnp[steps].val = parseFloat(expr);
		}
		else if (expr === '+') this.rpnp[steps].op = RrdRpn.OP_ADD;
		else if (expr === '-') this.rpnp[steps].op = RrdRpn.OP_SUB;
		else if (expr === '*') this.rpnp[steps].op = RrdRpn.OP_MUL;
		else if (expr === '/') this.rpnp[steps].op = RrdRpn.OP_DIV;
		else if (expr === '%') this.rpnp[steps].op = RrdRpn.OP_MOD;
		else if (expr === 'SIN') this.rpnp[steps].op = RrdRpn.OP_SIN;
		else if (expr === 'COS') this.rpnp[steps].op = RrdRpn.OP_COS;
		else if (expr === 'LOG') this.rpnp[steps].op = RrdRpn.OP_LOG;
		else if (expr === 'FLOOR') this.rpnp[steps].op = RrdRpn.OP_FLOOR;
		else if (expr === 'CEIL') this.rpnp[steps].op = RrdRpn.OP_CEIL;
		else if (expr === 'EXP') this.rpnp[steps].op = RrdRpn.OP_EXP;
		else if (expr === 'DUP') this.rpnp[steps].op = RrdRpn.OP_DUP;
		else if (expr === 'EXC') this.rpnp[steps].op = RrdRpn.OP_EXC;
		else if (expr === 'POP') this.rpnp[steps].op = RrdRpn.OP_POP;
		else if (expr === 'LTIME') this.rpnp[steps].op = RrdRpn.OP_LTIME;
		else if (expr === 'LT') this.rpnp[steps].op = RrdRpn.OP_LT;
		else if (expr === 'LE') this.rpnp[steps].op = RrdRpn.OP_LE;
		else if (expr === 'GT') this.rpnp[steps].op = RrdRpn.OP_GT;
		else if (expr === 'GE') this.rpnp[steps].op = RrdRpn.OP_GE;
		else if (expr === 'EQ') this.rpnp[steps].op = RrdRpn.OP_EQ;
		else if (expr === 'IF') this.rpnp[steps].op = RrdRpn.OP_IF;
		else if (expr === 'MIN') this.rpnp[steps].op = RrdRpn.OP_MIN;
		else if (expr === 'MAX') this.rpnp[steps].op = RrdRpn.OP_MAX;
		else if (expr === 'LIMIT') this.rpnp[steps].op = RrdRpn.OP_LIMIT;
		else if (expr === 'UNKN') this.rpnp[steps].op = RrdRpn.OP_UNKN;
		else if (expr === 'UN') this.rpnp[steps].op = RrdRpn.OP_UN;
		else if (expr === 'NEGINF') this.rpnp[steps].op = RrdRpn.OP_NEGINF;
		else if (expr === 'NE') this.rpnp[steps].op = RrdRpn.OP_NE;
		else if (expr === 'COUNT') this.rpnp[steps].op = RrdRpn.OP_COUNT;
		else if (/PREV\([-_A-Za-z0-9]+\)/.test(expr)) {
			var match = exprs[i].match(/PREV\(([-_A-Za-z0-9]+)\)/i);
			if (match.length == 2) {
				this.rpnp[steps].op = RrdRpn.OP_PREV_OTHER;
				this.rpnp[steps].ptr = this.find_var(gdes, match[1]);  // FIXME if -1
			}
		}
		else if (expr === 'PREV') this.rpnp[steps].op = RrdRpn.OP_PREV;
		else if (expr === 'INF') this.rpnp[steps].op = RrdRpn.OP_INF;
		else if (expr === 'ISINF') this.rpnp[steps].op = RrdRpn.OP_ISINF;
		else if (expr === 'NOW') this.rpnp[steps].op = RrdRpn.OP_NOW;
		else if (expr === 'TIME') this.rpnp[steps].op = RrdRpn.OP_TIME;
		else if (expr === 'ATAN2') this.rpnp[steps].op = RrdRpn.OP_ATAN2;
		else if (expr === 'ATAN') this.rpnp[steps].op = RrdRpn.OP_ATAN;
		else if (expr === 'SQRT') this.rpnp[steps].op = RrdRpn.OP_SQRT;
		else if (expr === 'SORT') this.rpnp[steps].op = RrdRpn.OP_SORT;
		else if (expr === 'REV') this.rpnp[steps].op = RrdRpn.OP_REV;
		else if (expr === 'TREND') this.rpnp[steps].op = RrdRpn.OP_TREND;
		else if (expr === 'TRENDNAN') this.rpnp[steps].op = RrdRpn.OP_TRENDNAN;
		else if (expr === 'PREDICT') this.rpnp[steps].op = RrdRpn.OP_PREDICT;
		else if (expr === 'PREDICTSIGMA') this.rpnp[steps].op = RrdRpn.OP_PREDICTSIGMA;
		else if (expr === 'RAD2DEG') this.rpnp[steps].op = RrdRpn.OP_RAD2DEG;
		else if (expr === 'DEG2RAD') this.rpnp[steps].op = RrdRpn.OP_DEG2RAD;
		else if (expr === 'AVG') this.rpnp[steps].op = RrdRpn.OP_AVG;
		else if (expr === 'ABS') this.rpnp[steps].op = RrdRpn.OP_ABS;
		else if (expr === 'ADDNAN') this.rpnp[steps].op = RrdRpn.OP_ADDNAN;
		else if (/[-_A-Za-z0-9]+/.test(expr)) {
			this.rpnp[steps].ptr = this.find_var(gdes, exprs[i]); // FIXME if -1
			this.rpnp[steps].op = RrdRpn.OP_VARIABLE;
		} else {
			return;
		}
	}
	this.rpnp[steps + 1] = {};
	this.rpnp[steps + 1].op = RrdRpn.OP_END;
};

RrdRpn.OP_NUMBER= 0;
RrdRpn.OP_VARIABLE = 1;
RrdRpn.OP_INF = 2;
RrdRpn.OP_PREV = 3;
RrdRpn.OP_NEGINF = 4;
RrdRpn.OP_UNKN = 5;
RrdRpn.OP_NOW = 6;
RrdRpn.OP_TIME = 7;
RrdRpn.OP_ADD = 8;
RrdRpn.OP_MOD = 9;
RrdRpn.OP_SUB = 10;
RrdRpn.OP_MUL = 11;
RrdRpn.OP_DIV = 12;
RrdRpn.OP_SIN = 13;
RrdRpn.OP_DUP = 14;
RrdRpn.OP_EXC = 15;
RrdRpn.OP_POP = 16;
RrdRpn.OP_COS = 17;
RrdRpn.OP_LOG = 18;
RrdRpn.OP_EXP = 19;
RrdRpn.OP_LT = 20;
RrdRpn.OP_LE = 21;
RrdRpn.OP_GT = 22;
RrdRpn.OP_GE = 23;
RrdRpn.OP_EQ = 24;
RrdRpn.OP_IF = 25;
RrdRpn.OP_MIN = 26;
RrdRpn.OP_MAX = 27;
RrdRpn.OP_LIMIT = 28;
RrdRpn.OP_FLOOR = 29;
RrdRpn.OP_CEIL = 30;
RrdRpn.OP_UN = 31;
RrdRpn.OP_END = 32;
RrdRpn.OP_LTIME = 33;
RrdRpn.OP_NE = 34;
RrdRpn.OP_ISINF = 35;
RrdRpn.OP_PREV_OTHER = 36;
RrdRpn.OP_COUNT = 37;
RrdRpn.OP_ATAN = 38;
RrdRpn.OP_SQRT = 39;
RrdRpn.OP_SORT = 40;
RrdRpn.OP_REV = 41;
RrdRpn.OP_TREND = 42;
RrdRpn.OP_TRENDNAN = 43;
RrdRpn.OP_ATAN2 = 44;
RrdRpn.OP_RAD2DEG = 45;
RrdRpn.OP_DEG2RAD = 46;
RrdRpn.OP_PREDICT = 47;
RrdRpn.OP_PREDICTSIGMA = 48;
RrdRpn.OP_AVG = 49;
RrdRpn.OP_ABS = 50;
RrdRpn.OP_ADDNAN = 51 ;

RrdRpn.prototype.find_var = function(gdes, key)
{
	for (var ii = 0, gdes_c = gdes.length; ii < gdes_c; ii++) {
		if ((gdes[ii].gf == RrdGraphDesc.GF_DEF ||
			gdes[ii].gf == RrdGraphDesc.GF_VDEF ||
			gdes[ii].gf == RrdGraphDesc.GF_CDEF)
			&& gdes[ii].vname == key) {
			return ii;
		}
	}
	return -1;
};

RrdRpn.prototype.compare_double = function(x, y)
{
	var diff = x -  y;
	return (diff < 0) ? -1 : (diff > 0) ? 1 : 0;
};

RrdRpn.prototype.fmod = function (x, y) 
{
	// http://kevin.vanzonneveld.net
	// +   original by: Onno Marsman
	// +      input by: Brett Zamir (http://brett-zamir.me)
	// +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// *     example 1: fmod(5.7, 1.3);
	// *     returns 1: 0.5
	var tmp, tmp2, p = 0,
		pY = 0,
		l = 0.0,
		l2 = 0.0;

	tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
	p = parseInt(tmp[2], 10) - (tmp[1] + '').length;
	tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
	pY = parseInt(tmp[2], 10) - (tmp[1] + '').length;

	if (pY > p) p = pY;

	tmp2 = (x % y);

	if (p < -100 || p > 20) {
		l = Math.round(Math.log(tmp2) / Math.log(10));
		l2 = Math.pow(10, l);
		return (tmp2 / l2).toFixed(l - p) * l2;
	} else {
		return parseFloat(tmp2.toFixed(-p));
	}
};

RrdRpn.prototype.calc = function (data_idx, output, output_idx)
{
	var stptr = -1;

	this.rpnstack = [];

	for (var rpi = 0; this.rpnp[rpi].op != RrdRpn.OP_END; rpi++) {
		switch (this.rpnp[rpi].op) {
			case RrdRpn.OP_NUMBER:
				this.rpnstack[++stptr] = this.rpnp[rpi].val;
				break;
			case RrdRpn.OP_VARIABLE:
			case RrdRpn.OP_PREV_OTHER:
				if (this.rpnp[rpi].ds_cnt == 0) {
					throw new RrdRpnError("VDEF made it into rpn_calc... aborting");
				} else {
					if (this.rpnp[rpi].op == RrdRpn.OP_VARIABLE) {
						this.rpnstack[++stptr] = this.rpnp[rpi].data[this.rpnp[rpi].pdata];
					} else {
						if ((output_idx) <= 0) this.rpnstack[++stptr] = Number.NaN;
						else this.rpnstack[++stptr] = this.rpnp[rpi].data[this.rpnp[rpi].pdata - this.rpnp[rpi].ds_cnt];
					}
					if (data_idx % this.rpnp[rpi].step == 0) {
						this.rpnp[rpi].pdata +=  this.rpnp[rpi].ds_cnt;
					}
				}
				break;
			case RrdRpn.OP_COUNT:
				this.rpnstack[++stptr] = (output_idx + 1);    /* Note: Counter starts at 1 */
				break;
			case RrdRpn.OP_PREV:
				if ((output_idx) <= 0) this.rpnstack[++stptr] = Number.NaN;
				else this.rpnstack[++stptr] = output[output_idx - 1];
				break;
			case RrdRpn.OP_UNKN:
				this.rpnstack[++stptr] = Number.NaN;
				break;
			case RrdRpn.OP_INF:
				this.rpnstack[++stptr] = Infinity;
				break;
			case RrdRpn.OP_NEGINF:
				this.rpnstack[++stptr] = -Infinity;
				break;
			case RrdRpn.OP_NOW:
				this.rpnstack[++stptr] = Math.round((new Date()).getTime() / 1000);
				break;
			case RrdRpn.OP_TIME:
				this.rpnstack[++stptr] = data_idx;
				break;
			case RrdRpn.OP_LTIME:
				var date = new Date(data_idx*1000); // FIXME XXX
				this.rpnstack[++stptr] = date.getTimezoneOffset() * 60 + data_idx;
				break;
			case RrdRpn.OP_ADD:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] + this.rpnstack[stptr];
				stptr--;
				break;
			case RrdRpn.OP_ADDNAN:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
						this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else if (isNaN(this.rpnstack[stptr])) {
						/* NOOP */
						/* this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1]; */
				} else {
						this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] + this.rpnstack[stptr];
				}
				stptr--;
				break;
			case RrdRpn.OP_SUB:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] - this.rpnstack[stptr];
				stptr--;
				break;
			case RrdRpn.OP_MUL:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = (this.rpnstack[stptr - 1]) * (this.rpnstack[stptr]);
				stptr--;
				break;
			case RrdRpn.OP_DIV:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] / this.rpnstack[stptr];
				stptr--;
				break;
			case RrdRpn.OP_MOD:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = this.fmod(this.rpnstack[stptr - 1] , this.rpnstack[stptr]);
				stptr--;
				break;
			case RrdRpn.OP_SIN:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.sin(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_ATAN:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.atan(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_RAD2DEG:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = 57.29577951 * this.rpnstack[stptr];
				break;
			case RrdRpn.OP_DEG2RAD:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = 0.0174532952 * this.rpnstack[stptr];
				break;
			case RrdRpn.OP_ATAN2:
				if(stptr < 1) throw new RrdRpnError();
				this.rpnstack[stptr - 1] = Math.atan2(this.rpnstack[stptr - 1], this.rpnstack[stptr]);
				stptr--;
				break;
			case RrdRpn.OP_COS:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.cos(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_CEIL:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.ceil(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_FLOOR:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.floor(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_LOG:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.log(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_DUP:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr + 1] = this.rpnstack[stptr];
				stptr++;
				break;
			case RrdRpn.OP_POP:
				if(stptr < 0) throw new RrdRpnError();
				stptr--;
				break;
			case RrdRpn.OP_EXC:
				if(stptr < 1) throw new RrdRpnError(); {
					var dummy = this.rpnstack[stptr];
					this.rpnstack[stptr] = this.rpnstack[stptr - 1];
					this.rpnstack[stptr - 1] = dummy;
				}
				break;
			case RrdRpn.OP_EXP:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.exp(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_LT:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] < this.rpnstack[stptr] ? 1.0 : 0.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_LE:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] <= this.rpnstack[stptr] ? 1.0 : 0.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_GT:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] > this.rpnstack[stptr] ? 1.0 : 0.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_GE:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] >= this.rpnstack[stptr] ? 1.0 : 0.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_NE:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] == this.rpnstack[stptr] ? 0.0 : 1.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_EQ:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr - 1] == this.rpnstack[stptr] ? 1.0 : 0.0;
				}
				stptr--;
				break;
			case RrdRpn.OP_IF:
				if(stptr < 2) throw new RrdRpnError();
				this.rpnstack[stptr - 2] = (isNaN(this.rpnstack[stptr - 2]) || this.rpnstack[stptr - 2] == 0.0) ? this.rpnstack[stptr] : this.rpnstack[stptr - 1];
				stptr--;
				stptr--;
				break;
			case RrdRpn.OP_MIN:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else if (this.rpnstack[stptr - 1] > this.rpnstack[stptr]) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				}
				stptr--;
				break;
			case RrdRpn.OP_MAX:
				if(stptr < 1) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 1])) {
				} else if (isNaN(this.rpnstack[stptr])) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				} else if (this.rpnstack[stptr - 1] < this.rpnstack[stptr]) {
					this.rpnstack[stptr - 1] = this.rpnstack[stptr];
				}
				stptr--;
				break;
			case RrdRpn.OP_LIMIT:
				if(stptr < 2) throw new RrdRpnError();
				if (isNaN(this.rpnstack[stptr - 2])) {
				} else if (isNaN(this.rpnstack[stptr - 1])) {
						this.rpnstack[stptr - 2] = this.rpnstack[stptr - 1];
				} else if (isNaN(this.rpnstack[stptr])) {
						this.rpnstack[stptr - 2] = this.rpnstack[stptr];
				} else if (this.rpnstack[stptr - 2] < this.rpnstack[stptr - 1]) {
						this.rpnstack[stptr - 2] = Number.NaN;
				} else if (this.rpnstack[stptr - 2] > this.rpnstack[stptr]) {
						this.rpnstack[stptr - 2] = Number.NaN;
				}
				stptr -= 2;
				break;
			case RrdRpn.OP_UN:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = isNaN(this.rpnstack[stptr]) ? 1.0 : 0.0;
				break;
			case RrdRpn.OP_ISINF:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = !isFinite(this.rpnstack[stptr]) ? 1.0 : 0.0;
				break;
			case RrdRpn.OP_SQRT:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.sqrt(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_SORT:
				if(stptr < 0) throw new RrdRpnError();
				var spn = this.rpnstack[stptr--];
				if(stptr < spn - 1) throw new RrdRpnError();
				var array = this.rpnstack.slice(stptr - spn + 1, stptr +1);
				array.sort(this.compare_double);
				for (var i=stptr - spn + 1, ii=0; i < (stptr +1) ; i++, ii++)
					this.rpnstack[i] = array[ii];
				// qsort(this.rpnstack + stptr - spn + 1, spn, sizeof(double), rpn_compare_double);
				break;
			case RrdRpn.OP_REV:
				if(stptr < 0) throw new RrdRpnError();
				var spn = this.rpnstack[stptr--];
				if(stptr < spn - 1) throw new RrdRpnError();
				var array = this.rpnstack.slice(stptr - spn + 1, stptr +1);
				array.reverse();
				for (var i=stptr - spn + 1, ii=0; i < (stptr +1) ; i++, ii++)
					this.rpnstack[i] = array[ii];
				break;
			case RrdRpn.OP_PREDICT:
			case RrdRpn.OP_PREDICTSIGMA:
				if(stptr < 2) throw new RrdRpnError();
				var locstepsize = this.rpnstack[--stptr];
				var shifts = this.rpnstack[--stptr];
				if(stptr < shifts) throw new RrdRpnError();
				if (shifts<0) stptr--;
				else stptr-=shifts;
				var val=Number.NaN;
				var dsstep = this.rpnp[rpi - 1].step;
				var dscount = this.rpnp[rpi - 1].ds_cnt;
				var locstep = Math.ceil(locstepsize/dsstep);
				var sum = 0;
				var sum2 = 0;
				var count = 0;
				/* now loop for each position */
				var doshifts=shifts;
				if (shifts<0) doshifts=-shifts;
				for(var loop=0;loop<doshifts;loop++) {
					var shiftstep=1;
					if (shifts<0) shiftstep = loop*this.rpnstack[stptr];
					else shiftstep = this.rpnstack[stptr+loop];
					if(shiftstep <0) {
						throw new RrdRpnError("negative shift step not allowed: "+shiftstep);
					}
					shiftstep=Math.ceil(shiftstep/dsstep);
					for(var i=0;i<=locstep;i++) {
						var offset=shiftstep+i;
						if ((offset>=0)&&(offset<output_idx)) {
							val = this.rpnp[rpi - 1].data[-dscount * offset];
							if (! isNaN(val)) {
								sum+=val;
								sum2+=val*val;
								count++;
							}
						}
					}
				}
				val=Number.NaN;
				if (this.rpnp[rpi].op == RrdRpn.OP_PREDICT) {
					if (count>0) val = sum/count;
				} else {
					if (count>1) {
						val=count*sum2-sum*sum;
						if (val<0) {
							val=Number.NaN;
						} else {
							val=Math.sqrt(val/(count*(count-1.0)));
						}
					}
				}
				this.rpnstack[stptr] = val;
				break;
			case RrdRpn.OP_TREND:
			case RrdRpn.OP_TRENDNAN:
				if(stptr < 1) throw new RrdRpnError();
				if ((rpi < 2) || (this.rpnp[rpi - 2].op != RrdRpn.OP_VARIABLE)) {
					throw new RrdRpnError("malformed trend arguments");
				} else {
					var dur = this.rpnstack[stptr];
					var step = this.rpnp[rpi - 2].step;

					if (output_idx + 1 >= Math.ceil(dur / step)) {
						var ignorenan = (this.rpnp[rpi].op == RrdRpn.OP_TREND);
						var accum = 0.0;
						var i = 0;
						var count = 0;

						do {
							var val = this.rpnp[rpi - 2].data[this.rpnp[rpi - 2].ds_cnt * i--];
							if (ignorenan || !isNaN(val)) {
								accum += val;
								++count;
							}
							dur -= step;
						} while (dur > 0);

						this.rpnstack[--stptr] = (count == 0) ? Number.NaN : (accum / count);
					} else this.rpnstack[--stptr] = Number.NaN;
				}
				break;
			case RrdRpn.OP_AVG:
				if(stptr < 0) throw new RrdRpnError();
				var i = this.rpnstack[stptr--];
				var sum = 0;
				var count = 0;

				if(stptr < i - 1) throw new RrdRpnError();
				while (i > 0) {
					var val = this.rpnstack[stptr--];
					i--;
					if (isNaN(val)) continue;
					count++;
					sum += val;
				}
				if (count > 0) this.rpnstack[++stptr] = sum / count;
				else this.rpnstack[++stptr] = Number.NaN;
				break;
			case RrdRpn.OP_ABS:
				if(stptr < 0) throw new RrdRpnError();
				this.rpnstack[stptr] = Math.abs(this.rpnstack[stptr]);
				break;
			case RrdRpn.OP_END:
				break;
		}
	}
	if (stptr != 0) throw new RrdRpnError("RPN final stack size != 1");
	output[output_idx] = this.rpnstack[0];
	return 0;
};

