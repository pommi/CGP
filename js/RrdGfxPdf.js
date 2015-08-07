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
/*******************************************************************************
* FPDF                                                                         *
*                                                                              *
* Version: 1.7                                                                 *
* Date:    2011-06-18                                                          *
* Author:  Olivier PLATHEY                                                     *
*******************************************************************************/

// define('FPDF_VERSION','1.7');

"use strict";

/**
 * RrdGfxPdf
 * @constructor
 */
var RrdGfxPdf = function (orientation, unit, size)
{
	if (orientation === undefined)
		orientation='P';
	if (unit === undefined)
		unit='mm';
	if (size === undefined)
		size='A4';

	this.lMargin = 0;            // left margin
	this.tMargin = 0;            // top margin
	this.rMargin = 0;            // right margin
	this.bMargin = 0;            // page break margin
	this.cMargin = 0;            // cell margin

	this.x = 0;                  // current position in user unit
	this.y = 0;

	this.ZoomMode = null;          // zoom display mode
	this.LayoutMode = null;        // layout display mode
	this.title = null;             // title
	this.subject = null;           // subject
	this.author = null;            // author
	this.keywords = null;          // keywords
	this.creator = null;           // creator

	// Initialization of properties
	this.page = 0; // current page number
	this.offsets = []; // array of object offsets
	this.n = 2; // current object number
	this.buffer = ''; // buffer holding in-memory PDF
	this.pages = []; // array containing pages
	this.PageSizes = []; // used for pages with non default sizes or orientations
	this.state = 0; // current document state
	this.fonts = {}; // array of used fonts
	this.diffs = []; // array of encoding differences
	this.FontFamily = ''; // current font family
	this.FontStyle = ''; // current font style
	this.FontSizePt = 12; // current font size in points
	this.FontSize = this.FontSizePt/this.k;
	this.DrawColor = '0 G'; // commands for drawing color
	this.FillColor = '0 g'; // commands for filling color
	this.TextColor = '0 g'; // commands for text color
	this.ColorFlag = false; // indicates whether fill and text colors are different
	this.ws = 0; // word spacing

	// Core fonts
	this.CoreFonts = ['courier', 'helvetica', 'times', 'symbol', 'zapfdingbats'];
	// Scale factor (number of points in user unit)
	if(unit === 'pt')
		this.k = 1;
	else if(unit === 'mm')
		this.k = 72/25.4;
	else if(unit === 'cm')
		this.k = 72/2.54;
	else if(unit === 'in')
		this.k = 72;
	else
		throw 'Incorrect unit: '+unit;
	// Page sizes
	this.StdPageSizes = {
		'a3': [841.89 , 1190.55],
		'a4': [595.28 , 841.89],
		'a5': [420.94 , 595.28],
		'letter': [612 , 792],
		'legal': [612 , 1008]
	};

	size = this._getpagesize(size);
	this.DefPageSize = size;
	this.CurPageSize = size;
	// Page orientation
	orientation = orientation.toLowerCase();
	if(orientation=='p' || orientation=='portrait') {
		this.DefOrientation = 'P';
		this.w = size[0];
		this.h = size[1];
	} else if(orientation=='l' || orientation=='landscape') {
		this.DefOrientation = 'L';
		this.w = size[1];
		this.h = size[0];
	} else {
		throw 'Incorrect orientation: '+orientation;
	}
	this.CurOrientation = this.DefOrientation;
	this.wPt = this.w*this.k;
	this.hPt = this.h*this.k;
	// Page margins (1 cm)
	var margin = 28.35/this.k;
	this.SetMargins(margin,margin);
	// Interior cell margin (1 mm)
	this.cMargin = margin/10;
	// Line width (0.2 mm)
	this.LineWidth = .567/this.k;
	// Default display mode
	this.SetDisplayMode('default');
	// Set default PDF version number
	this.PDFVersion = '1.3';

	this.dash = false;
	this.dash_array = null;
	this.dash_offset = null;
};

RrdGfxPdf.CORE_FONTS= {
	'courierBI': {name: 'Courier-BoldOblique', up: -100, ut: 50, cw: [600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600] },
	'courierB': {name: 'Courier-Bold', up: -100, ut: 50, cw: [600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600] },
	'courierI': {name: 'Courier-Oblique', up: -100, ut: 50, cw: [600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600] },
	'courier': {name: 'Courier', up: -100, ut: 50, cw: [600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600,600] },
	'helveticaBI': {name: 'Helvetica-BoldOblique', up: -100, ut: 50, cw: [ 278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278, 278,278,278,278,278,278,278,278,278,278,278,333,474,556,556,889,722,238,333,333,389,584, 278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722, 722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944, 667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889, 611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,350,556,350,278,556, 500,1000,556,556,333,1000,667,333,1000,350,611,350,350,278,278,500,500,350,556,1000,333,1000, 556,333,944,350,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333, 400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722, 1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722, 722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611, 611,611,611,611,611,584,611,611,611,611,611,556,611,556] },
	'helveticaB': {name: 'Helvetica-Bold', up: -100, ut: 50, cw: [ 278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278, 278,278,278,278,278,278,278,278,278,278,278,333,474,556,556,889,722,238,333,333,389,584, 278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722, 722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944, 667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889, 611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,350,556,350,278,556, 500,1000,556,556,333,1000,667,333,1000,350,611,350,350,278,278,500,500,350,556,1000,333,1000, 556,333,944,350,500,667,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333, 400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722, 1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722, 722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611, 611,611,611,611,611,584,611,611,611,611,611,556,611,556] },
	'helveticaI': {name: 'Helvetica-Oblique', up: -100, ut: 50, cw: [ 278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278, 278,278,278,278,278,278,278,278,278,278,278,278,355,556,556,889,667,191,333,333,389,584, 278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667, 667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944, 667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833, 556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,350,556,350,222,556, 333,1000,556,556,333,1000,667,333,1000,350,611,350,350,222,222,333,333,350,556,1000,333,1000, 500,333,944,350,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333, 400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667, 1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722, 722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556, 556,556,556,556,556,584,611,556,556,556,556,500,556,500] },
	'helvetica': {name: 'Helvetica', up: -100, ut: 50, cw: [ 278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278, 278,278,278,278,278,278,278,278,278,278,278,278,355,556,556,889,667,191,333,333,389,584, 278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667, 667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944, 667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833, 556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,350,556,350,222,556, 333,1000,556,556,333,1000,667,333,1000,350,611,350,350,222,222,333,333,350,556,1000,333,1000, 500,333,944,350,500,667,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333, 400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667, 1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722, 722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556, 556,556,556,556,556,584,611,556,556,556,556,500,556,500] },
	'timesBI': {name: 'Times-BoldItalic', up: -100, ut: 50, cw: [ 250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250, 250,250,250,250,250,250,250,250,250,250,250,389,555,500,500,833,778,278,333,333,500,570, 250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,832,667, 667,667,722,667,667,722,778,389,500,667,611,889,722,722,611,722,667,556,611,722,667,889, 667,611,611,333,278,333,570,500,333,500,500,444,500,444,333,500,556,278,278,500,278,778, 556,500,500,500,389,389,278,556,444,667,500,444,389,348,220,348,570,350,500,350,333,500, 500,1000,500,500,333,1000,556,333,944,350,611,350,350,333,333,500,500,350,500,1000,333,1000, 389,333,722,350,389,611,250,389,500,500,500,500,220,500,333,747,266,500,606,333,747,333, 400,570,300,300,333,576,500,250,333,300,300,500,750,750,750,500,667,667,667,667,667,667, 944,667,667,667,667,667,389,389,389,389,722,722,722,722,722,722,722,570,722,722,722,722, 722,611,611,500,500,500,500,500,500,500,722,444,444,444,444,444,278,278,278,278,500,556, 500,500,500,500,500,570,500,556,556,556,556,444,500,444] },
	'timesB': {name: 'Times-Bold', up: -100, ut: 50, cw: [ 250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250, 250,250,250,250,250,250,250,250,250,250,250,333,555,500,500,1000,833,278,333,333,500,570, 250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,570,570,570,500,930,722, 667,722,722,667,611,778,778,389,500,778,667,944,722,778,611,778,722,556,667,722,722,1000, 722,722,667,333,278,333,581,500,333,500,556,444,556,444,333,500,556,278,333,556,278,833, 556,500,556,556,444,389,333,556,500,722,500,500,444,394,220,394,520,350,500,350,333,500, 500,1000,500,500,333,1000,556,333,1000,350,667,350,350,333,333,500,500,350,500,1000,333,1000, 389,333,722,350,444,722,250,333,500,500,500,500,220,500,333,747,300,500,570,333,747,333, 400,570,300,300,333,556,540,250,333,300,330,500,750,750,750,500,722,722,722,722,722,722, 1000,722,667,667,667,667,389,389,389,389,722,722,778,778,778,778,778,570,778,722,722,722, 722,722,611,556,500,500,500,500,500,500,722,444,444,444,444,444,278,278,278,278,500,556, 500,500,500,500,500,570,500,556,556,556,556,500,556,500] },
	'timesI': {name: 'Times-Italic', up: -100, ut: 50, cw: [ 250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250, 250,250,250,250,250,250,250,250,250,250,250,333,420,500,500,833,778,214,333,333,500,675, 250,333,250,278,500,500,500,500,500,500,500,500,500,500,333,333,675,675,675,500,920,611, 611,667,722,611,611,722,722,333,444,667,556,833,667,722,611,722,611,500,556,722,611,833, 611,556,556,389,278,389,422,500,333,500,500,444,500,444,278,500,500,278,278,444,278,722, 500,500,500,500,389,389,278,500,444,667,444,444,389,400,275,400,541,350,500,350,333,500, 556,889,500,500,333,1000,500,333,944,350,556,350,350,333,333,556,556,350,500,889,333,980, 389,333,667,350,389,556,250,389,500,500,500,500,275,500,333,760,276,500,675,333,760,333, 400,675,300,300,333,500,523,250,333,300,310,500,750,750,750,500,611,611,611,611,611,611, 889,667,611,611,611,611,333,333,333,333,722,667,722,722,722,722,722,675,722,722,722,722, 722,556,611,500,500,500,500,500,500,500,667,444,444,444,444,444,278,278,278,278,500,500, 500,500,500,500,500,675,500,500,500,500,500,444,500,444] },
	'times': {name: 'Times-Roman', up: -100, ut: 50, cw: [ 250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250, 250,250,250,250,250,250,250,250,250,250,250,333,408,500,500,833,778,180,333,333,500,564, 250,333,250,278,500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,722, 667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944, 722,722,611,333,278,333,469,500,333,444,500,444,500,444,333,500,500,278,278,500,278,778, 500,500,500,500,333,389,278,500,500,722,500,500,444,480,200,480,541,350,500,350,333,500, 444,1000,500,500,333,1000,556,333,889,350,611,350,350,333,333,444,444,350,500,1000,333,980, 389,333,722,350,444,722,250,333,500,500,500,500,200,500,333,760,276,500,564,333,760,333, 400,564,300,300,333,500,453,250,333,300,310,500,750,750,750,444,722,722,722,722,722,722, 889,667,611,611,611,611,333,333,333,333,722,722,722,722,722,722,722,564,722,722,722,722, 722,722,556,500,444,444,444,444,444,444,667,444,444,444,444,444,278,278,278,278,500,500, 500,500,500,500,500,564,500,500,500,500,500,500,500,500] },
	'symbol': {name: 'Symbol', up: -100, ut: 50, cw: [ 250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250, 250,250,250,250,250,250,250,250,250,250,250,333,713,500,549,833,778,439,333,333,500,549, 250,549,250,278,500,500,500,500,500,500,500,500,500,500,278,278,549,549,549,444,549,722, 667,722,612,611,763,603,722,333,631,722,686,889,722,722,768,741,556,592,611,690,439,768, 645,795,611,333,863,333,658,500,500,631,549,549,494,439,521,411,603,329,603,549,549,576, 521,549,549,521,549,603,439,576,713,686,493,686,494,480,200,480,549,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,750,620,247,549,167,713,500,753,753,753,753,1042,987,603,987,603, 400,549,411,549,549,713,494,460,549,549,549,549,1000,603,1000,658,823,686,795,987,768,768, 823,768,768,713,713,713,713,713,713,713,768,713,790,790,890,823,549,250,713,603,603,1042, 987,603,987,603,494,329,790,790,786,713,384,384,384,384,384,384,494,494,494,494,0,329,274,686,686,686,384,384,384,384,384,384,494,494,494,0] },
	'zapfdingbats': {name: 'ZapfDingbats', up: -100, ut: 50, cw: [ 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,278,974,961,974,980,719,789,790,791,690,960,939, 549,855,911,933,911,945,974,755,846,762,761,571,677,763,760,759,754,494,552,537,577,692, 786,788,788,790,793,794,816,823,789,841,823,833,816,831,923,744,723,749,790,792,695,776, 768,792,759,707,708,682,701,826,815,789,789,707,687,696,689,786,787,713,791,785,791,873, 761,762,762,759,759,892,892,788,784,438,138,277,415,392,392,668,668,0,390,390,317,317, 276,276,509,509,410,410,234,234,334,334,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,732,544,544,910,667,760,760,776,595,694,626,788,788,788,788, 788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788,788, 788,788,788,788,788,788,788,788,788,788,788,788,788,788,894,838,1016,458,748,924,748,918, 927,928,928,834,873,828,924,924,917,930,931,463,883,836,836,867,867,696,696,874,0,874, 760,946,771,865,771,888,967,888,831,873,927,970,918,0] }
};

RrdGfxPdf.prototype.parse_color = function(str)
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
		throw "Unknow color format '"+str+"'";
	}
};

RrdGfxPdf.prototype.size = function (width, height)
{
	var size = [height, width];
	this.DefPageSize = size;
	this.CurPageSize = size;
	this.DefOrientation = 'L';
	this.w = size[1];
	this.h = size[0];
	this.CurOrientation = this.DefOrientation;
	this.wPt = this.w*this.k;
	this.hPt = this.h*this.k;
	this.AddPage();
};

RrdGfxPdf.prototype.set_dash = function (dashes, n, offset)
{
	this.dash = true;
	this.dash_array = dashes;
	this.dash_offset = offset;
};

RrdGfxPdf.prototype._set_dash = function ()
{
	this.dash = true;

	if (this.dash_array != undefined && this.dash_array.length > 0) {
		for (var n=0; n < this.dash_array.length; n++) {
			this.dash_array[n] = this.dash_array[n] * this.k;
		}
		this.dash_array = this.dash_array.join(' ');

		if (this.dash_offset == 0) {
			this._out('['+this.dash_array+'] 0 d');
		} else {
			this.dash_offset = this.dash_offset * this.k;
			this._out('['+this.dash_array+'] '+this.dash_offset+' d');
		}
	}
	this.dash = false;
	this.dash_array = null;
	this.dash_offset = 0;
};

RrdGfxPdf.prototype.line = function (X0, Y0, X1, Y1, width, color)
{
	this._save();
	this._setLineWidth(width);
	var rgba = this.parse_color(color);
	this._setDrawColor(rgba[0], rgba[1], rgba[2]);
	if (this.dash)
		this._set_dash();
	this._moveTo(X0, Y0);
	this._lineTo(X1, Y1);
	this._stroke();
	this._restore();
};

RrdGfxPdf.prototype.dashed_line = function (X0, Y0, X1, Y1, width, color, dash_on, dash_off)
{
	this._save();
	this._setLineWidth(width);
	var rgba = this.parse_color(color);
	this._setDrawColor(rgba[0], rgba[1], rgba[2]);
	this._out('['+(dash_on*this.k)+' '+(dash_off*this.k)+'] 0 d');
	this._moveTo(X0, Y0);
	this._lineTo(X1, Y1);
	this._stroke();
	this._restore();
};

RrdGfxPdf.prototype.rectangle = function (X0, Y0, X1, Y1, width, style)
{
	this._save();
	this._setLineWidth(width);
	var rgba = this.parse_color(style);
	this._setDrawColor(rgba[0], rgba[1], rgba[2]);
	if (this.dash)
		this._set_dash();
	this._moveTo(X0, Y0);
	this._lineTo(X1, Y0);
	this._lineTo(X1, Y1);
	this._lineTo(X0, Y1);
	this._closePath();
	this._stroke();
	this._restore();
};

RrdGfxPdf.prototype.new_area = function (X0, Y0, X1, Y1, X2, Y2, color)
{
	var rgba = this.parse_color(color);
	this._setFillColor(rgba[0], rgba[1], rgba[2]);
	this._moveTo(X0, Y0);
	this._lineTo(X1, Y1);
	this._lineTo(X2, Y2);
};

RrdGfxPdf.prototype.add_point = function (x, y)
{
	this._lineTo(x, y);
};

RrdGfxPdf.prototype.close_path = function ()
{
	this._closePath();
	this._fill();
};

RrdGfxPdf.prototype.stroke_begin = function (width, style)
{
	this._save();
	this._setLineWidth(width);
	var rgba = this.parse_color(style);
	this._setDrawColor(rgba[0], rgba[1], rgba[2]);
	if (this.dash)
		this._set_dash();
	this._out('0 J');  // line cap
	this._out('0 j');  // line join
};

RrdGfxPdf.prototype.stroke_end = function ()
{
	this._stroke();
	this._restore();
};

RrdGfxPdf.prototype.moveTo = function (x,y)
{
	this._moveTo(x, y);
};

RrdGfxPdf.prototype.lineTo = function (x,y)
{
	this._lineTo(x, y);
};

RrdGfxPdf.prototype.text = function (x, y, color, font, tabwidth, angle, h_align, v_align, text)
{
	this._save();
	this._setFont('courier', '', font.size*this.k);

	var width = this._getStringWidth('courier', '', font.size*this.k, text);
	var height = font.size;
/*
	this._moveTo(x,y-5); this._lineTo(x,y+5);
	this._moveTo(x-5,y); this._lineTo(x+5,y);
	this._moveTo(x+width,y-height-5); this._lineTo(x+width,y-height+5);
	this._moveTo(x+width-5,y-height); this._lineTo(x+width+5,y-height);
	this._stroke();
*/
	switch (h_align) {
		case RrdGraph.GFX_H_LEFT:
			if (angle == -90) {
				x = x-height/2;
			}
			break;
		case RrdGraph.GFX_H_RIGHT:
			x = x-width;
			break;
		case RrdGraph.GFX_H_CENTER:
			if (angle != 90) {
				x = x-width/2;
			}
			break;
	}

	switch (v_align) {
		case RrdGraph.GFX_V_TOP:
			if (angle != -90) {
				y = y + height/2;
			}
			break;
		case RrdGraph.GFX_V_BOTTOM:
			y = y - height/3;
			break;
		case RrdGraph.GFX_V_CENTER:
			if (angle == 90) {
				y = y + width/2;
			} else {
				y = y + height/4;
			}
			break;
	}

	x = x*this.k;
	y = (this.h-y)*this.k;

	var tm = [];
	tm[0] = Math.cos(angle*Math.PI/180.0);
	tm[1] = Math.sin(angle*Math.PI/180.0);
	tm[2] = -tm[1];
	tm[3] = tm[0];

	tm[4] = x + (tm[1] * y) - (tm[0] * x);
	tm[5] = y - (tm[0] * y) - (tm[1] * x);

	var rgba = this.parse_color(color);
	this._save();
	this._out('BT');
	this._out(sprintf('%.3F %.3F %.3F rg', rgba[0]/255,rgba[1]/255,rgba[2]/255));
	this._out(sprintf('%.2F %.2F Td', x, y));
	this._out(sprintf('%.3F %.3F %.3F %.3F %.3F %.3F cm', tm[0], tm[1], tm[2], tm[3], tm[4], tm[5]));
	this._out(sprintf('(%s) Tj',this._escape(text)));
	this._out('ET');
	this._restore();
};

RrdGfxPdf.prototype.get_text_width = function(start, font, tabwidth, text)
{
	var width = this._getStringWidth('courier', '', font.size*this.k, text);
	return width;
};

/****              Public methods            *****/

RrdGfxPdf.prototype.SetMargins = function(left, top, right)
{
	if (right === undefined)
		right = null;
	// Set left, top and right margins
	this.lMargin = left;
	this.tMargin = top;
	if(right===null)
		right = left;
	this.rMargin = right;
};

RrdGfxPdf.prototype.SetLeftMargin = function(margin)
{
	// Set left margin
	this.lMargin = margin;
	if(this.page>0 && this.x<margin)
		this.x = margin;
};

RrdGfxPdf.prototype.SetTopMargin = function(margin)
{
	// Set top margin
	this.tMargin = margin;
};

RrdGfxPdf.prototype.SetRightMargin = function(margin)
{
	// Set right margin
	this.rMargin = margin;
};

RrdGfxPdf.prototype.SetDisplayMode = function(zoom, layout)
{
	// Set display mode in viewer
	if(zoom === 'fullpage' || zoom === 'fullwidth' || zoom === 'real' || zoom == 'default' || !(typeof zoom === "string"))
		this.ZoomMode = zoom;
	else
		throw 'Incorrect zoom display mode: '+zoom;

	if(layout === undefined) {
		this.LayoutMode = 'default';
	} else if(layout === 'single' || layout === 'continuous' || layout === 'two' || layout === 'default') {
		this.LayoutMode = layout;
	} else {
		throw 'Incorrect layout display mode: '+layout;
	}
};

RrdGfxPdf.prototype.SetTitle = function(title)
{
	// Title of document
	this.title = title;
};

RrdGfxPdf.prototype.SetSubject = function(subject)
{
	// Subject of document
	this.subject = subject;
};

RrdGfxPdf.prototype.SetAuthor = function(author)
{
	// Author of document
	this.author = author;
};

RrdGfxPdf.prototype.SetKeywords = function(keywords)
{
	// Keywords of document
	this.keywords = keywords;
};

RrdGfxPdf.prototype.SetCreator = function(creator)
{
	// Creator of document
	this.creator = creator;
};

RrdGfxPdf.prototype.Open = function()
{
	// Begin document
	this.state = 1;
};

RrdGfxPdf.prototype.Close = function()
{
	// Terminate document
	if(this.state==3)
		return;
	if(this.page==0)
		this.AddPage();
	// Close page
	this._endpage();
	// Close document
	this._enddoc();
};

RrdGfxPdf.prototype.AddPage = function(orientation, size)
{
	if (orientation === undefined) orientation='';
	if (size === undefined) size='';

	// Start a new page
	if(this.state==0)
		this.Open();

	var family = this.FontFamily;
	var style = this.FontStyle;
	var fontsize = this.FontSizePt;
	var lw = this.LineWidth;
	var dc = this.DrawColor;
	var fc = this.FillColor;
	var tc = this.TextColor;
	var cf = this.ColorFlag;

	if(this.page>0)
	{
		// Close page
		this._endpage();
	}
	// Start new page
	this._beginpage(orientation,size);
	// Set line cap style to square
	this._out('2 J');
	// Set line width
	this.LineWidth = lw;
	this._out(sprintf('%.2F w',lw*this.k));
	// Set font
	if(family)
		this._setFont(family,style,fontsize);
	// Set colors
	this.DrawColor = dc;
	if(dc!='0 G')
		this._out(dc);
	this.FillColor = fc;
	if(fc!='0 g')
		this._out(fc);
	this.TextColor = tc;
	this.ColorFlag = cf;
	// Restore line width
	if(this.LineWidth!=lw)
	{
		this.LineWidth = lw;
		this._out(sprintf('%.2F w',lw*this.k));
	}
	// Restore font
	if(family)
		this._setFont(family,style,fontsize);
	// Restore colors
	if(this.DrawColor!=dc)
	{
		this.DrawColor = dc;
		this._out(dc);
	}
	if(this.FillColor!=fc)
	{
		this.FillColor = fc;
		this._out(fc);
	}
	this.TextColor = tc;
	this.ColorFlag = cf;
};

RrdGfxPdf.prototype.PageNo = function()
{
	// Get current page number
	return this.page;
};

RrdGfxPdf.prototype._setDrawColor = function(r, g, b)
{
	if (g === undefined) g=null;
	if (b === undefined) b=null;
	// Set color for all stroking operations
	if((r==0 && g==0 && b==0) || g===null)
		this.DrawColor = sprintf('%.3F G',r/255);
	else
		this.DrawColor = sprintf('%.3F %.3F %.3F RG',r/255,g/255,b/255);
	if(this.page>0)
		this._out(this.DrawColor);
};

RrdGfxPdf.prototype._setFillColor = function(r, g, b)
{
	if (g === undefined) g=null;
	if (b === undefined) b=null;
	// Set color for all filling operations
	if((r==0 && g==0 && b==0) || g===null)
		this.FillColor = sprintf('%.3F g',r/255);
	else
		this.FillColor = sprintf('%.3F %.3F %.3F rg',r/255,g/255,b/255);
	this.ColorFlag = (this.FillColor!=this.TextColor);
	if(this.page>0)
		this._out(this.FillColor);
};

RrdGfxPdf.prototype._setTextColor = function(r, g, b)
{
	if (g === undefined) g=null;
	if (b === undefined) b=null;
	// Set color for text
	if((r==0 && g==0 && b==0) || g===null)
		this.TextColor = sprintf('%.3F g',r/255);
	else
		this.TextColor = sprintf('%.3F %.3F %.3F rg',r/255,g/255,b/255);
	this.ColorFlag = (this.FillColor!=this.TextColor);
};

RrdGfxPdf.prototype._getStringWidth = function(family, style, size, s)
{
	if (style === undefined) style = '';
	if (size === undefined) size = 0;
	// Select a font; size given in points

	if(family=='') family = this.FontFamily;
	else family = family.toLowerCase();

	style = style.toUpperCase();
	if(style=='IB') style = 'BI';

	if(size==0) size = this.FontSizePt;

	// Test if font is already loaded
	var fontkey = family+style;
	if(!(fontkey in this.fonts)) {
		// Test if one of the core fonts
		if(family=='arial') family = 'helvetica';
		if(family=='symbol' || family=='zapfdingbats') style = '';
		fontkey = family+style;

		if (!(fontkey in this.fonts))
			this.AddFont(family, style);
	}
	// Select it
	size = size/this.k;
	var cw = this.fonts[fontkey].cw;
	var w = 0;
	var l = s.length;
	for(var i=0; i<l; i++) {
		w += cw[s.charCodeAt(i)];
	}
	return w*size/1000;
};

RrdGfxPdf.prototype._setLineWidth = function(width)
{
	// Set line width
	this.LineWidth = width;
	if(this.page>0)
		this._out(sprintf('%.2F w',width*this.k));
};

RrdGfxPdf.prototype._moveTo = function(x, y)
{
	this._out(sprintf('%.2F %.2F m',x*this.k,(this.h-y)*this.k));
};

RrdGfxPdf.prototype._lineTo = function(x, y)
{
	this._out(sprintf('%.2F %.2F l',x*this.k,(this.h-y)*this.k));
};

RrdGfxPdf.prototype._stroke = function()
{
	this._out('S');
};

RrdGfxPdf.prototype._save = function()
{
	this._out('q');
};

RrdGfxPdf.prototype._restore = function()
{
	this._out('Q');
};

RrdGfxPdf.prototype._closePath = function()
{
	this._out('h');
};

RrdGfxPdf.prototype._fill = function()
{
	this._out('f');
};

RrdGfxPdf.prototype._line = function(x1, y1, x2, y2)
{
	// Draw a line
	this._out(sprintf('%.2F %.2F m %.2F %.2F l S',x1*this.k,(this.h-y1)*this.k,x2*this.k,(this.h-y2)*this.k));
};

RrdGfxPdf.prototype._rect = function(x, y, w, h, style)
{
	var op;
	// Draw a rectangle
	if(style=='F')
		op = 'f';
	else if(style=='FD' || style=='DF')
		op = 'B';
	else
		op = 'S';
	this._out(sprintf('%.2F %.2F %.2F %.2F re %s',x*this.k,(this.h-y)*this.k,w*this.k,-h*this.k,op));
};

RrdGfxPdf.prototype.AddFont = function (family, style, file)
{
	if (style === undefined) style = '';

	if(family=='') family = this.FontFamily;
	else family = family.toLowerCase();

	style = style.toUpperCase();
	if(style=='IB') style = 'BI';

	var fontkey = family+style;
	if(fontkey in this.fonts)
		return;

	if(fontkey in RrdGfxPdf.CORE_FONTS){
		var font = RrdGfxPdf.CORE_FONTS[fontkey];
		this.fonts[fontkey] = font;
		var i=0;
		for (var n in this.fonts) i++;
		font['i'] = i;
	} else {
		throw 'Undefined font: '+family+' '+style;
	}
};

RrdGfxPdf.prototype._setFont = function(family, style, size)
{
	if (style === undefined) style = '';
	if (size === undefined) size = 0;
	// Select a font; size given in points

	if(family=='') family = this.FontFamily;
	else family = family.toLowerCase();

	style = style.toUpperCase();
	if(style=='IB') style = 'BI';

	if(size==0) size = this.FontSizePt;

	// Test if font is already selected
	//if(this.FontFamily==family && this.FontStyle==style && this.FontSizePt==size)
	//	return;

	// Test if font is already loaded
	var fontkey = family+style;
	if(!(fontkey in this.fonts)) {
		// Test if one of the core fonts
		if(family=='arial') family = 'helvetica';
		if(family=='symbol' || family=='zapfdingbats') style = '';
		fontkey = family+style;

		if (!(fontkey in this.fonts))
			this.AddFont(family, style);
	}
	// Select it
	this.FontFamily = family;
	this.FontStyle = style;
	this.FontSizePt = size;
	this.FontSize = size/this.k;
	this.CurrentFont = this.fonts[fontkey];
	if(this.page>0)
		this._out(sprintf('BT /F%d %.2F Tf ET',this.CurrentFont['i'],this.FontSizePt)); // FIXME i
};

RrdGfxPdf.prototype._setFontSize = function(size)
{
	// Set font size in points
	//if(this.FontSizePt==size)
	//	return;
	this.FontSizePt = size;
	this.FontSize = size/this.k;
	if(this.page>0)
		this._out(sprintf('BT /F%d %.2F Tf ET',this.CurrentFont['i'],this.FontSizePt));
};

RrdGfxPdf.prototype._text = function(x, y, txt)
{
	// Output a string
	var s = sprintf('BT %.2F %.2F Td (%s) Tj ET',x*this.k,(this.h-y)*this.k,this._escape(txt));
	if(this.ColorFlag)
		s = 'q '+this.TextColor+' '+s+' Q';
	this._out(s);
};

RrdGfxPdf.prototype.output = function()
{
	// Output PDF to some destination
	if(this.state<3)
		this.Close();
	document.location.href = 'data:application/pdf;base64,' + Base64.encode(this.buffer);
	//return this.buffer;
};

RrdGfxPdf.prototype._getpagesize = function(size) // FIXME
{
	if(typeof size === "string" ) {
		size = size.toLowerCase();
		if(!(size in this.StdPageSizes))
			throw 'Unknown page size: '+size;
		var a = this.StdPageSizes[size];
		return [a[0]/this.k, a[1]/this.k];
	} else {
		if(size[0]>size[1]) {
			return [size[1], size[0]];
		} else {
			return size;
		}
	}
};

RrdGfxPdf.prototype._beginpage = function(orientation, size)
{
	this.page++;
	this.pages[this.page] = '';
	this.state = 2;
	this.x = this.lMargin;
	this.y = this.tMargin;
	this.FontFamily = '';
	// Check page size and orientation
	if(orientation=='') orientation = this.DefOrientation;
	else orientation = orientation[0].toUpperCase();

	if(size=='') size = this.DefPageSize;
	else size = this._getpagesize(size);

	if(orientation!=this.CurOrientation || size[0]!=this.CurPageSize[0] || size[1]!=this.CurPageSize[1])
	{
		// New size or orientation
		if(orientation=='P') {
			this.w = size[0];
			this.h = size[1];
		} else {
			this.w = size[1];
			this.h = size[0];
		}
		this.wPt = this.w*this.k;
		this.hPt = this.h*this.k;
		this.CurOrientation = orientation;
		this.CurPageSize = size;
	}
	if(orientation!=this.DefOrientation || size[0]!=this.DefPageSize[0] || size[1]!=this.DefPageSize[1])
		this.PageSizes[this.page] = [this.wPt, this.hPt];
};

RrdGfxPdf.prototype._endpage = function()
{
	this.state = 1;
};

RrdGfxPdf.prototype._escape = function(s) // FIXME
{
	// Escape special characters in strings
	//s = str_replace('\\','\\\\',s);
	//s = str_replace('(','\\(',s);
	//s = str_replace(')','\\)',s);
	//s = str_replace("\r",'\\r',s);
	return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
};

RrdGfxPdf.prototype._textstring = function(s)
{
	// Format a text string
	return '('+this._escape(s)+')';
};

RrdGfxPdf.prototype._newobj = function()
{
	// Begin a new object
	this.n++;
	this.offsets[this.n] = this.buffer.length;
	this._out(this.n+' 0 obj');
};

RrdGfxPdf.prototype._putstream = function(s)
{
	this._out('stream');
	this._out(s);
	this._out('endstream');
};

RrdGfxPdf.prototype._out = function(s)
{
// Add a line to the document
	if(this.state==2)
		this.pages[this.page] += s+"\n";
	else
		this.buffer += s+"\n";
};

RrdGfxPdf.prototype._putpages = function()
{
	var wPt, hPt;
	var nb = this.page;
	if(this.DefOrientation=='P') {
		wPt = this.DefPageSize[0]*this.k;
		hPt = this.DefPageSize[1]*this.k;
	} else {
		wPt = this.DefPageSize[1]*this.k;
		hPt = this.DefPageSize[0]*this.k;
	}
	for(var n=1;n<=nb;n++)
	{
		// Page
		this._newobj();
		this._out('<</Type /Page');
		this._out('/Parent 1 0 R');
		if(this.PageSizes[n] !== undefined)
			this._out(sprintf('/MediaBox [0 0 %.2F %.2F]',this.PageSizes[n][0],this.PageSizes[n][1]));
		this._out('/Resources 2 0 R');
		if(this.PDFVersion>'1.3')
			this._out('/Group <</Type /Group /S /Transparency /CS /DeviceRGB>>');
		this._out('/Contents '+(this.n+1)+' 0 R>>');
		this._out('endobj');
		// Page content
		this._newobj();
		this._out('<</Length '+this.pages[n].length+'>>');
		this._putstream(this.pages[n]);
		this._out('endobj');
	}
	// Pages root
	this.offsets[1] = this.buffer.length;
	this._out('1 0 obj');
	this._out('<</Type /Pages');
	var kids = '/Kids [';
	for(var i=0;i<nb;i++)
		kids += (3+2*i)+' 0 R ';
	this._out(kids+']');
	this._out('/Count '+nb);
	this._out(sprintf('/MediaBox [0 0 %.2F %.2F]',wPt,hPt));
	this._out('>>');
	this._out('endobj');
};

RrdGfxPdf.prototype._putfonts = function()
{
	var nf = this.n;
	for(var diff in this.diffs) {
		// Encodings
		this._newobj();
		this._out('<</Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences ['+diff+']>>');
		this._out('endobj');
	}
	for(var font in this.fonts) { // FIXME
		// Font objects
		this.fonts[font]['n'] = this.n+1;
		var name = this.fonts[font]['name'];
		// Core font
		this._newobj();
		this._out('<</Type /Font');
		this._out('/BaseFont /'+name);
		this._out('/Subtype /Type1');
		if(name!='Symbol' && name!='ZapfDingbats')
			this._out('/Encoding /WinAnsiEncoding');
		this._out('>>');
		this._out('endobj');
	}
};

RrdGfxPdf.prototype._putresourcedict = function()
{
	this._out('/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]');
	this._out('/Font <<');
	for(var font in this.fonts)
		this._out('/F'+this.fonts[font]['i']+' '+this.fonts[font]['n']+' 0 R');
	this._out('>>');
	this._out('/XObject <<');
	this._out('>>');
};

RrdGfxPdf.prototype._putresources = function()
{
	this._putfonts();
	// Resource dictionary
	this.offsets[2] = this.buffer.length;
	this._out('2 0 obj');
	this._out('<<');
	this._putresourcedict();
	this._out('>>');
	this._out('endobj');
};

RrdGfxPdf.prototype._putinfo = function()
{
	// this._out('/Producer '+this._textstring('FPDF '+FPDF_VERSION)); FIXME
	if(this.title != null)
		this._out('/Title '+this._textstring(this.title));
	if(this.subject != null)
		this._out('/Subject '+this._textstring(this.subject));
	if(this.author != null)
		this._out('/Author '+this._textstring(this.author));
	if(this.keywords != null)
		this._out('/Keywords '+this._textstring(this.keywords));
	if(this.creator != null)
		this._out('/Creator '+this._textstring(this.creator));
	// this._out('/CreationDate '+this._textstring('D:'+date('YmdHis'))); // FIXME
};

RrdGfxPdf.prototype._putcatalog = function()
{
	this._out('/Type /Catalog');
	this._out('/Pages 1 0 R');

	if(this.ZoomMode=='fullpage')
		this._out('/OpenAction [3 0 R /Fit]');
	else if(this.ZoomMode=='fullwidth')
		this._out('/OpenAction [3 0 R /FitH null]');
	else if(this.ZoomMode=='real')
		this._out('/OpenAction [3 0 R /XYZ null null 1]');
	else if(typeof this.ZoomMode !== 'string')
		this._out('/OpenAction [3 0 R /XYZ null null '+sprintf('%.2F',this.ZoomMode/100)+']');

	if(this.LayoutMode=='single')
		this._out('/PageLayout /SinglePage');
	else if(this.LayoutMode=='continuous')
		this._out('/PageLayout /OneColumn');
	else if(this.LayoutMode=='two')
		this._out('/PageLayout /TwoColumnLeft');
};

RrdGfxPdf.prototype._enddoc = function()
{
	this._out('%PDF-'+this.PDFVersion);
	this._putpages();
	this._putresources();
	// Info
	this._newobj();
	this._out('<<');
	this._putinfo();
	this._out('>>');
	this._out('endobj');
	// Catalog
	this._newobj();
	this._out('<<');
	this._putcatalog();
	this._out('>>');
	this._out('endobj');
	// Cross-ref
	var o = this.buffer.length;
	this._out('xref');
	this._out('0 '+(this.n+1));
	this._out('0000000000 65535 f ');
	for(var i=1;i<=this.n;i++)
		this._out(sprintf('%010d 00000 n ',this.offsets[i]));
	// Trailer
	this._out('trailer');
	this._out('<<');
	this._out('/Size '+(this.n+1));
	this._out('/Root '+this.n+' 0 R');
	this._out('/Info '+(this.n-1)+' 0 R');
	this._out('>>');
	this._out('startxref');
	this._out(o);
	this._out('%%EOF');
	this.state = 3;
};

