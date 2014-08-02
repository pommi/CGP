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
		this.rrdfiles_fetching = {};
		this.rrdfiles_wait = {};
	},
	build: function(gdp, ft_step, rrd)
	{
		var cal_start, cal_end;
		var best_full_rra = -1, best_part_rra = -1, chosen_rra = 0;
		var best_full_step_diff = Infinity, best_part_step_diff = Infinity;
		var tmp_step_diff = 0, tmp_match = 0, best_match = -1;
		var full_match;
		var data_ptr;
		var rows;
		var rra;
		var i, ii;
		var last_update = rrd.getLastUpdate();

		var cf_idx = gdp.cf;
		var ds_cnt = rrd.getNrDSs();
		var rra_cnt = rrd.getNrRRAs();

		for (i = 0; i < ds_cnt; i++)
			gdp.ds_namv[i] = rrd.rrd_header.getDSbyIdx(i).getName();

		/* if the requested graph starts after the last available data point,
		 * return one big NaN instead of taking the finest (step=1) RRA */
		if (gdp.start > last_update) {
			ft_step = gdp.end - gdp.start;
			gdp.ds_cnt = ds_cnt;
			gdp.data = [];
			for (ii = 0; ii < ds_cnt; ii++)
				gdp.data[ii] = Number.NaN;
			return ft_step;
		}

		for (i = 0; i < rra_cnt; i++) {
			rra = rrd.getRRAInfo(i);
			if (RrdGraphDesc.cf_conv(rra.getCFName()) === cf_idx) {
				/* covered seconds in this RRA */
				var range_secs = rra.getStep();
				cal_end = last_update - (last_update % range_secs);
				cal_start = cal_end - (range_secs * rra.row_cnt);
				full_match = gdp.end - gdp.start;

				tmp_step_diff = Math.abs(ft_step - range_secs);
				if (cal_start <= gdp.start) {
					if (tmp_step_diff < best_full_step_diff) {
						best_full_step_diff = tmp_step_diff;
						best_full_rra = i;
					}
				} else {
					tmp_match = full_match;
					if (cal_start > gdp.start) tmp_match -= (cal_start - gdp.start);
					if (best_match < tmp_match || (best_match === tmp_match &&
								tmp_step_diff < best_part_step_diff)) {
						best_match = tmp_match;
						best_part_step_diff = tmp_step_diff;
						best_part_rra = i;
					}
				}
			}
		}

		if (best_full_rra >= 0) chosen_rra = best_full_rra;
		else if (best_part_rra >= 0) chosen_rra = best_part_rra;
		else throw "the RRD does not contain an RRA matching the chosen CF";

		var rra_info = rrd.getRRAInfo(chosen_rra);
		rra = rrd.getRRA(chosen_rra);

		ft_step = rra_info.getStep();
		gdp.start -= (gdp.start % ft_step);
		gdp.end += (ft_step - gdp.end % ft_step);
		rows = (gdp.end - gdp.start) / ft_step + 1;

		gdp.ds_cnt = ds_cnt;
		data_ptr = 0;

		var rra_end_time = (last_update - (last_update % ft_step));
		var rra_start_time = (rra_end_time - (ft_step * (rra_info.row_cnt - 1)));
		/* here's an error by one if we don't be careful */
		var start_offset = (gdp.start + ft_step - rra_start_time) / ft_step;
		var end_offset = (rra_end_time - gdp.end) / ft_step;

		gdp.data = [];

		for (i = start_offset; i < rra.row_cnt - end_offset; i++) {
			if (i < 0) {
				for (ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = Number.NaN;
			} else if (i >= rra.row_cnt) {
				for (ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = Number.NaN;
			} else {
				for(ii = 0; ii < ds_cnt; ii++)
					gdp.data[data_ptr++] = rra.getEl(i, ii);
			}
		}
		return ft_step;
	},
	fetch: function(gdp, ft_step)
	{
		var rrd;

		if (gdp.rrd in this.rrdfiles) {
			rrd = this.rrdfiles[gdp.rrd];
		} else {
			var bf = FetchBinaryURL(gdp.rrd);
			rrd = new RRDFile(bf);
			this.rrdfiles[gdp.rrd] = rrd;
		}

		return this.build(gdp, ft_step, rrd);
	},
	fetch_async_callback: function(bf, args)
	{
		var rrd;

		rrd = new RRDFile(bf);
		args.this.rrdfiles[args.gdp.rrd] = rrd;
		args.callback(args.callback_arg, args.this.build(args.gdp, args.ft_step, rrd));

		for(var vname in args.this.rrdfiles_wait)
		{
			var o_args = args.this.rrdfiles_wait[vname];
			if (args.gdp.rrd == o_args.gdp.rrd)
			{
				delete args.this.rrdfiles_wait[vname];
				o_args.callback(o_args.callback_arg, args.this.build(o_args.gdp, o_args.ft_step, rrd));
			}
		}
	},
	fetch_async: function(gdp, ft_step, callback, callback_arg)
	{
		if (gdp.rrd === null) return -1;

		if (gdp.rrd in this.rrdfiles) {
			callback(callback_arg, this.build(gdp, ft_step, this.rrdfiles[gdp.rrd]));
		} else if (gdp.rrd in this.rrdfiles_fetching) {
			this.rrdfiles_wait[gdp.vname] = { this:this, gdp: gdp, ft_step: ft_step, callback: callback, callback_arg: callback_arg };
			if (gdp.rrd in this.rrdfiles)
			{
				delete this.rrdfiles_wait[gdp.vname];
				callback(callback_arg, this.build(gdp, ft_step, this.rrdfiles[gdp.rrd]));
			}
		} else {
			this.rrdfiles_fetching[gdp.rrd] = FetchBinaryURLAsync(gdp.rrd, this.fetch_async_callback, { this:this, gdp: gdp, ft_step: ft_step, callback: callback, callback_arg: callback_arg });
		}
		return 0;
	}
};
