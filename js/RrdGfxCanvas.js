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
 * RrdGfxCanvas
 * @constructor
 */
var RrdGfxCanvas = function(canvasId) 
{
	this.canvas = document.getElementById(canvasId);
	this.ctx = this.canvas.getContext('2d');
	this.dash = false;
	this.dash_offset = null;
	this.dash_array = null;
};

RrdGfxCanvas.prototype.size = function (width, height)
{
	this.canvas.width = width;
	this.canvas.height = height;
};

RrdGfxCanvas.prototype.set_dash = function (dashes, n, offset)
{
	this.dash = true;
	this.dash_array = dashes;
	this.dash_offset = offset;
};

RrdGfxCanvas.prototype._set_dash = function ()
{
	if (this.dash_array != undefined && this.dash_array.length > 0) {
		this.ctx.setLineDash(this.dash_array);
		if (this.dash_offset > 0) {
			this.ctx.lineDashOffset = this.dash_offset;
		}
	}
	this.dash = false;
	this.dash_array = null;
	this.dash_offset = 0;
};

RrdGfxCanvas.prototype.line = function (X0, Y0, X1, Y1, width, color)
{
	X0 = Math.round(X0);
	Y0 = Math.round(Y0);
	X1 = Math.round(X1);
	Y1 = Math.round(Y1);

	if (Y0 === Y1) {
		Y0 += 0.5;
		Y1 += 0.5;
	} else if (X0 === X1) {
		X0 += 0.5;
		X1 += 0.5;
	}
	this.ctx.save();
	this.ctx.lineWidth = width;
	this.ctx.strokeStyle = color;
	if (this.dash) this._set_dash();
	this.ctx.beginPath();
	this.ctx.moveTo(X0, Y0);
	this.ctx.lineTo(X1, Y1);
	this.ctx.stroke();
	this.ctx.restore();
};

RrdGfxCanvas.prototype.dashed_line = function (X0, Y0, X1, Y1, width, color, dash_on, dash_off)
{
	var swap, n;
	X0 = Math.round(X0);
	Y0 = Math.round(Y0);
	X1 = Math.round(X1);
	Y1 = Math.round(Y1);

	this.ctx.save();
	this.ctx.lineWidth = width;
	this.ctx.strokeStyle = color;
	this.ctx.setLineDash([ dash_on, dash_off ]);
	this.ctx.lineDashOffset = dash_on;
	this.ctx.beginPath();

	if (Y0 === Y1) {
		Y0 += 0.5;
		Y1 += 0.5;
	} else if (X0 === X1) {
		X0 += 0.5;
		X1 += 0.5;
	}

	this.ctx.moveTo(X0, Y0);
	this.ctx.lineTo(X1, Y1);
/*
	if (Y0 === Y1) {
		Y0 += 0.5;
		Y1 += 0.5;
		if (X0 > X1) {
			swap = X0;
			X0 = X1;
			X1 = swap;
		}
		this.ctx.moveTo(X0, Y0);
		n = 0;
		while(X0<=X1) {
			if (n%2 === 1) {
				X0 += dash_on;
				this.ctx.lineTo(X0, Y0);
			} else {
				X0 += dash_off;
				this.ctx.moveTo(X0, Y0);
			}
			n++;
		}
	} else if (X0 === X1) {
		X0 += 0.5;
		X1 += 0.5;
		if (Y0 > Y1) {
			swap = Y0;
			Y0 = Y1;
			Y1 = swap;
		}
		this.ctx.moveTo(X0, Y0);
		n = 0;
		while(Y0<=Y1) {
			if (n%2 === 1) {
				Y0 += dash_on;
				this.ctx.lineTo(X0, Y0);
			} else {
				Y0 += dash_off;
				this.ctx.moveTo(X0, Y0);
			}
			n++;
		}

	} else {
		this.ctx.moveTo(X0, Y0);
		this.ctx.lineTo(X1, Y1);
	}
*/
	this.ctx.stroke();
	this.ctx.restore();
};

RrdGfxCanvas.prototype.rectangle = function (X0, Y0, X1, Y1, width, style)
{
	X0 = Math.round(X0)+0.5;
	X1 = Math.round(X1)+0.5;
	Y0 = Math.round(Y0)+0.5;
	Y1 = Math.round(Y1)+0.5;

	this.ctx.save();
	this.ctx.beginPath();
	if (this.dash) this._set_dash();
	this.ctx.lineWidth = width;
	this.ctx.moveTo(X0, Y0);
	this.ctx.lineTo(X1, Y0);
	this.ctx.lineTo(X1, Y1);
	this.ctx.lineTo(X0, Y1);
	this.ctx.closePath();
	this.ctx.strokeStyle = style;
	this.ctx.stroke();
	this.ctx.restore();
};

RrdGfxCanvas.prototype.new_area = function (X0, Y0, X1, Y1, X2, Y2, color)
{
	X0 = Math.round(X0)+0.5;
	Y0 = Math.round(Y0)+0.5;
	X1 = Math.round(X1)+0.5;
	Y1 = Math.round(Y1)+0.5;
	X2 = Math.round(X2)+0.5;
	Y2 = Math.round(Y2)+0.5;
	this.ctx.fillStyle = color;
	this.ctx.beginPath();
	this.ctx.moveTo(X0, Y0);
	this.ctx.lineTo(X1, Y1);
	this.ctx.lineTo(X2, Y2);
};

RrdGfxCanvas.prototype.add_point = function (x, y)
{
	x = Math.round(x)+0.5;
	y = Math.round(y)+0.5;
	this.ctx.lineTo(x, y);
};

RrdGfxCanvas.prototype.close_path = function ()
{
	this.ctx.closePath();
	this.ctx.fill();
};

RrdGfxCanvas.prototype.stroke_begin = function (width, style)
{
	this.ctx.save();
	this.ctx.beginPath();
	if (this.dash) this._set_dash();
	this.ctx.lineWidth = width;
	this.ctx.strokeStyle = style;
	this.ctx.lineCap = 'round';
	this.ctx.round = 'round';
};

RrdGfxCanvas.prototype.stroke_end = function ()
{
	this.ctx.stroke();
	this.ctx.restore();
};

RrdGfxCanvas.prototype.moveTo = function (x,y)
{
	x = Math.round(x)+0.5;
	y = Math.round(y)+0.5;
	this.ctx.moveTo(x, y);
};

RrdGfxCanvas.prototype.lineTo = function (x,y)
{
	x = Math.round(x)+0.5;
	y = Math.round(y)+0.5;
	this.ctx.lineTo(x, y);
};

RrdGfxCanvas.prototype.text = function (x, y, color, font, tabwidth, angle, h_align, v_align, text)
{
	x = Math.round(x);
	y = Math.round(y);

	this.ctx.save();
	this.ctx.font = font.size+'px '+font.font;

	switch (h_align) {
		case RrdGraph.GFX_H_LEFT:
			this.ctx.textAlign = 'left';
			break;
		case RrdGraph.GFX_H_RIGHT:
			this.ctx.textAlign = 'right';
			break;
		case RrdGraph.GFX_H_CENTER:
			this.ctx.textAlign = 'center';
			break;
	}

	switch (v_align) {
		case RrdGraph.GFX_V_TOP:
			this.ctx.textBaseline = 'top';
			break;
		case RrdGraph.GFX_V_BOTTOM:
			this.ctx.textBaseline = 'bottom';
			break;
		case RrdGraph.GFX_V_CENTER:
			this.ctx.textBaseline = 'middle';
			break;
	}

	this.ctx.fillStyle = color;
	this.ctx.translate(x,y);
	this.ctx.rotate(-angle*Math.PI/180.0);
	this.ctx.fillText(text, 0, 0);
	this.ctx.restore();
};

RrdGfxCanvas.prototype.get_text_width = function(start, font, tabwidth, text)
{
	this.ctx.save();
	this.ctx.font = font.size+'px '+font.font;
	var width = this.ctx.measureText(text);
	this.ctx.restore();
	return width.width;
};

