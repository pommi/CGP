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
 * RrdDataFile
 * @constructor
 */
var RrdDataFile = function() {
  this.init.apply(this, arguments);
};

RrdDataFile.prototype = {
	rrdfiles: null,

	init: function()
	{
		this.rrdfiles = {};
	},
	fetch: function(gdp, ft_step)
	{
    var cal_start, cal_end;
    var best_full_rra = 0, best_part_rra = 0, chosen_rra = 0;
    var best_full_step_diff = 0, best_part_step_diff = 0, tmp_step_diff = 0, tmp_match = 0, best_match = 0;
    var full_match, rra_base;
    var first_full = 1;
    var first_part = 1;
    var rrd;
    var data_ptr;
    var rows;

		if (gdp.rrd in this.rrdfiles) {
			rrd = this.rrdfiles[gdp.rrd];
		} else {
			var bf = FetchBinaryURL(gdp.rrd);
			rrd = new RRDFile(bf);
			this.rrdfiles[gdp.rrd] = rrd;
		}

		var cf_idx = gdp.cf;
		var ds_cnt = rrd.getNrDSs();
		var rra_cnt = rrd.getNrRRAs();

    for (var i = 0; i < ds_cnt; i++)
			gdp.ds_namv[i] = rrd.rrd_header.getDSbyIdx(i).getName();

		for (var i = 0; i < rra_cnt; i++) {
			var rra = rrd.getRRAInfo(i);
			if (RrdGraphDesc.cf_conv(rra.getCFName()) === cf_idx) {
				cal_end = (rrd.getLastUpdate() - (rrd.getLastUpdate() % (rra.getPdpPerRow() * rra.pdp_step)));
				cal_start = (cal_end - (rra.getPdpPerRow() * rra.row_cnt * rra.pdp_step));
				full_match = gdp.end - gdp.start;

				tmp_step_diff = Math.abs(ft_step - (rrd.getMinStep() * rra.pdp_cnt));
				if (cal_start <= gdp.start) {
					if (first_full || (tmp_step_diff < best_full_step_diff)) {
						first_full = 0;
						best_full_step_diff = tmp_step_diff;
						best_full_rra = i;
					}
				} else {
					tmp_match = full_match;
					if (cal_start > gdp.start) tmp_match -= (cal_start - gdp.start);
					if (first_part || (best_match < tmp_match) || (best_match === tmp_match && tmp_step_diff < best_part_step_diff)) {
						first_part = 0;
						best_match = tmp_match;
						best_part_step_diff = tmp_step_diff;
						best_part_rra = i;
					}
				}
			}
		}

		if (first_full === 0) chosen_rra = best_full_rra;
		else if (first_part === 0) chosen_rra = best_part_rra;
		else throw "the RRD does not contain an RRA matching the chosen CF";

		var rra_info = rrd.getRRAInfo(chosen_rra);
		var rra = rrd.getRRA(chosen_rra);

		ft_step = rrd.rrd_header.pdp_step * rra_info.getPdpPerRow();
    gdp.start -= (gdp.start % ft_step);
    gdp.end += (ft_step - gdp.end % ft_step);
    rows = (gdp.end - gdp.start) / ft_step + 1;

		gdp.ds_cnt = ds_cnt;
    data_ptr = 0;

    var rra_end_time = (rrd.getLastUpdate() - (rrd.getLastUpdate() % ft_step));
    var rra_start_time = (rra_end_time - (ft_step * (rra_info.row_cnt - 1)));
    /* here's an error by one if we don't be careful */
    var start_offset = (gdp.start + ft_step - rra_start_time) / ft_step;
    var end_offset = (rra_end_time - gdp.end) / ft_step;

		gdp.data = [];

		for (i = start_offset; i < rra.row_cnt - end_offset; i++) {
			if (i < 0) {
				for (var ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = Number.NaN;
			} else if (i >= rra.row_cnt) {
	    	for (var ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = Number.NaN;
			} else {
				for (var ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = rra.getEl(i, ii);
			}
		}
		return ft_step;
	}
};
