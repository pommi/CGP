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

 **/

"use strict";

function sprintf()
{
	var argc = 0;
	var args = arguments;
	var fmt = args[argc++];

	function lpad (str, padString, length)
	{
		while (str.length < length)
			str = padString + str;
		return str;
	}

	function format (match, width, dot, precision, length, conversion)
	{
		if (match === '%%') return '%';

		var value = args[argc++];
		var prefix;

		if (width === undefined)
			width = 0;
		else
			width = +width;

		if (precision === undefined)
			precision = conversion == 'd' ? 0 : 6;
		else
			precision = +precision;

		switch (conversion) {
			case 's':
			case 'c':
				return value;
			case 'd':
				return parseInt(value, 10);
			case 'e':
				prefix = value < 0 ? '-' : '';
				return lpad(prefix+Math.abs(value).toExponential(precision),' ',width);
			case 'F':
			case 'f':
				prefix = value < 0 ? '-' : '';
				return lpad(prefix+Math.abs(value).toFixed(precision),' ',width);
			case 'g':
				prefix = value < 0 ? '-' : '';
				return lpad(prefix+Math.abs(value).toPrecision(precision),' ',width);
			default:
				return match;
		}

	}
	return fmt.replace(/%(\d+)?(\.(\d+))?(l?)([%scdfFeg])/g,format);
}
