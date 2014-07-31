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
 **/

"use strict";

/**
 * ColorError
 * @constructor
 */
var ColorError = function (message)
{
    this.name = "ColorError";
    this.message = (message) ? message : "Error";
};
ColorError.prototype = new Error();

/**
 * Color
 * @constructor
 */
function Color(str)
{
  var bits;

	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 1.0;

  if ((bits = /^#?([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(str))) {
    this.r = parseInt(bits[1]+bits[1], 16);
		this.g = parseInt(bits[2]+bits[2], 16);
		this.b = parseInt(bits[3]+bits[3], 16);
  } else if ((bits = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(str))) {
    this.r = parseInt(bits[1], 16);
		this.g = parseInt(bits[2], 16);
		this.b = parseInt(bits[3], 16);
  } else if ((bits = /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(str))) {
    this.r = parseInt(bits[1], 16);
		this.g = parseInt(bits[2], 16);
		this.b = parseInt(bits[3], 16);
		this.a = parseInt(bits[4], 16)/255;
  } else if ((bits = /^rgb\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\)$/.exec(str))) {
    this.r = parseInt(bits[1], 10);
		this.g = parseInt(bits[2], 10); 
		this.b = parseInt(bits[3], 10);
  } else if ((bits = /^rgba\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([0-9.]+)\)$/.exec(str))) {
    this.r = parseInt(bits[1], 10);
		this.g = parseInt(bits[2], 10);
		this.b = parseInt(bits[3], 10);
		this.a = parseFloat(bits[4], 10);
  } else {
    throw new ColorError("Unknow color format '"+str+"'");
  }
};

Color.prototype.torgba = function ()
{
  return 'rgba('+this.r+','+this.g+','+this.b+','+this.a+')';
};

