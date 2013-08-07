/*
 * Client library for access to RRD archive files
 * Part of the javascriptRRD package
 * Copyright (c) 2009-2010 Frank Wuerthwein, fkw@ucsd.edu
 *                         Igor Sfiligoi, isfiligoi@ucsd.edu
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 *
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

/*
 *
 * RRDTool has been developed and is maintained by
 * Tobias Oether [http://oss.oetiker.ch/rrdtool/]
 *
 * This software can be used to read files produced by the RRDTool
 * but has been developed independently.
 *
 * Limitations:
 *
 * This version of the module assumes RRD files created on linux
 * with intel architecture and supports both 32 and 64 bit CPUs.
 * All integers in RRD files are suppoes to fit in 32bit values.
 *
 * Only versions 3 and 4 of the RRD archive are supported.
 *
 * Only AVERAGE,MAXIMUM,MINIMUM and LAST consolidation functions are
 * supported. For all others, the behaviour is at the moment undefined.
 *
 */

/*
 * Dependencies:
 *
 * The data provided to this module require an object of a class
 * that implements the following methods:
 *   getByteAt(idx)            - Return a 8 bit unsigned integer at offset idx
 *   getLongAt(idx)            - Return a 32 bit unsigned integer at offset idx
 *   getDoubleAt(idx)          - Return a double float at offset idx
 *   getFastDoubleAt(idx)      - Similar to getDoubleAt but with less precision
 *   getCStringAt(idx,maxsize) - Return a string of at most maxsize characters
 *                               that was 0-terminated in the source
 *
 * The BinaryFile from binaryXHR.js implements this interface.
 *
 */


// ============================================================
// Exception class
function InvalidRRD(msg) {
  this.message=msg;
  this.name="Invalid RRD";
}

// pretty print
InvalidRRD.prototype.toString = function() {
  return this.name + ': "' + this.message + '"';
}


// ============================================================
// RRD DS Info class
function RRDDS(rrd_data,rrd_data_idx,my_idx) {
  this.rrd_data=rrd_data;
  this.rrd_data_idx=rrd_data_idx;
  this.my_idx=my_idx;
}

RRDDS.prototype.getIdx = function() {
  return this.my_idx;
}
RRDDS.prototype.getName = function() {
  return this.rrd_data.getCStringAt(this.rrd_data_idx,20);
}
RRDDS.prototype.getType = function() {
  return this.rrd_data.getCStringAt(this.rrd_data_idx+20,20);
}
RRDDS.prototype.getMin = function() {
  return this.rrd_data.getDoubleAt(this.rrd_data_idx+48);
}
RRDDS.prototype.getMax = function() {
  return this.rrd_data.getDoubleAt(this.rrd_data_idx+56);
}


// ============================================================
// RRD RRA Info class
function RRDRRAInfo(rrd_data,rra_def_idx,
		    rrd_align,row_cnt,pdp_step,my_idx) {
  this.rrd_data=rrd_data;
  this.rra_def_idx=rra_def_idx;
  this.rrd_align=rrd_align;
  this.row_cnt=row_cnt;
  this.pdp_step=pdp_step;
  this.my_idx=my_idx;
}

RRDRRAInfo.prototype.getIdx = function() {
  return this.my_idx;
}

// Get number of rows
RRDRRAInfo.prototype.getNrRows = function() {
  return this.row_cnt;
}

// Get number of slots used for consolidation
// Mostly for internal use
RRDRRAInfo.prototype.getPdpPerRow = function() {
  if (this.rrd_align==32)
    return this.rrd_data.getLongAt(this.rra_def_idx+24,20);
  else
    return this.rrd_data.getLongAt(this.rra_def_idx+32,20);
}

// Get RRA step (expressed in seconds)
RRDRRAInfo.prototype.getStep = function() {
  return this.pdp_step*this.getPdpPerRow();
}

// Get consolidation function name
RRDRRAInfo.prototype.getCFName = function() {
  return this.rrd_data.getCStringAt(this.rra_def_idx,20);
}


// ============================================================
// RRD RRA handling class
function RRDRRA(rrd_data,rra_ptr_idx,
		rra_info,
		header_size,prev_row_cnts,ds_cnt) {
  this.rrd_data=rrd_data;
  this.rra_info=rra_info;
  this.row_cnt=rra_info.row_cnt;
  this.ds_cnt=ds_cnt;

  var row_size=ds_cnt*8;

  this.base_rrd_db_idx=header_size+prev_row_cnts*row_size;

  // get imediately, since it will be needed often
  this.cur_row=rrd_data.getLongAt(rra_ptr_idx);

  // calculate idx relative to base_rrd_db_idx
  // mostly used internally
  this.calc_idx = function(row_idx,ds_idx) {
    if ((row_idx>=0) && (row_idx<this.row_cnt)) {
      if ((ds_idx>=0) && (ds_idx<ds_cnt)){
	// it is round robin, starting from cur_row+1
	var real_row_idx=row_idx+this.cur_row+1;
	if (real_row_idx>=this.row_cnt) real_row_idx-=this.row_cnt;
	return row_size*real_row_idx+ds_idx*8;
      } else {
	throw RangeError("DS idx ("+ row_idx +") out of range [0-" + ds_cnt +").");
      }
    } else {
      throw RangeError("Row idx ("+ row_idx +") out of range [0-" + this.row_cnt +").");
    }
  }
}

RRDRRA.prototype.getIdx = function() {
  return this.rra_info.getIdx();
}

// Get number of rows/columns
RRDRRA.prototype.getNrRows = function() {
  return this.row_cnt;
}
RRDRRA.prototype.getNrDSs = function() {
  return this.ds_cnt;
}

// Get RRA step (expressed in seconds)
RRDRRA.prototype.getStep = function() {
  return this.rra_info.getStep();
}

// Get consolidation function name
RRDRRA.prototype.getCFName = function() {
  return this.rra_info.getCFName();
}

RRDRRA.prototype.getEl = function(row_idx,ds_idx) {
  return this.rrd_data.getDoubleAt(this.base_rrd_db_idx+this.calc_idx(row_idx,ds_idx));
}

// Low precision version of getEl
// Uses getFastDoubleAt
RRDRRA.prototype.getElFast = function(row_idx,ds_idx) {
  return this.rrd_data.getFastDoubleAt(this.base_rrd_db_idx+this.calc_idx(row_idx,ds_idx));
}

// ============================================================
// RRD Header handling class
function RRDHeader(rrd_data) {
  this.rrd_data=rrd_data;
  this.validate_rrd();
  this.load_header();
  this.calc_idxs();
}

// Internal, used for initialization
RRDHeader.prototype.validate_rrd = function() {
  if (this.rrd_data.getCStringAt(0,4)!=="RRD") throw new InvalidRRD("Wrong magic id.");

  this.rrd_version=this.rrd_data.getCStringAt(4,5);
  if ((this.rrd_version!=="0003")&&(this.rrd_version!=="0004")) {
    throw new InvalidRRD("Unsupported RRD version "+this.rrd_version+".");
  }

  if (this.rrd_data.getDoubleAt(12)==8.642135e+130) {
    this.rrd_align=32;
  } else if (this.rrd_data.getDoubleAt(16)==8.642135e+130) {
    this.rrd_align=64;
  } else {
    throw new InvalidRRD("Unsupported platform.");
  }
}

// Internal, used for initialization
RRDHeader.prototype.load_header = function() {
  if (this.rrd_align==32) {
    this.ds_cnt=this.rrd_data.getLongAt(20,false);
    this.rra_cnt=this.rrd_data.getLongAt(24,false);
    this.pdp_step=this.rrd_data.getLongAt(28,false);
    // 8*10 unused values follow
    this.top_header_size=112;
  } else {
    //get only the low 32 bits, the high 32 should always be 0
    this.ds_cnt=this.rrd_data.getLongAt(24,false);
    this.rra_cnt=this.rrd_data.getLongAt(32,false);
    this.pdp_step=this.rrd_data.getLongAt(40,false);
    // 8*10 unused values follow
    this.top_header_size=128;
  }
}

// Internal, used for initialization
RRDHeader.prototype.calc_idxs = function() {
  this.ds_def_idx=this.top_header_size;
  // char ds_nam[20], char dst[20], unival par[10]
  this.ds_el_size=120;

  this.rra_def_idx=this.ds_def_idx+this.ds_el_size*this.ds_cnt;
  // char cf_nam[20], uint row_cnt, uint pdp_cnt, unival par[10]
  this.row_cnt_idx;
  if (this.rrd_align==32) {
    this.rra_def_el_size=108;
    this.row_cnt_idx=20;
  } else {
    this.rra_def_el_size=120;
    this.row_cnt_idx=24;
  }

  this.live_head_idx=this.rra_def_idx+this.rra_def_el_size*this.rra_cnt;
  // time_t last_up, int last_up_usec
  if (this.rrd_align==32) {
    this.live_head_size=8;
  } else {
    this.live_head_size=16;
  }

  this.pdp_prep_idx=this.live_head_idx+this.live_head_size;
  // char last_ds[30], unival scratch[10]
  this.pdp_prep_el_size=112;

  this.cdp_prep_idx=this.pdp_prep_idx+this.pdp_prep_el_size*this.ds_cnt;
  // unival scratch[10]
  this.cdp_prep_el_size=80;

  this.rra_ptr_idx=this.cdp_prep_idx+this.cdp_prep_el_size*this.ds_cnt*this.rra_cnt;
  // uint cur_row
  if (this.rrd_align==32) {
    this.rra_ptr_el_size=4;
  } else {
    this.rra_ptr_el_size=8;
  }

  this.header_size=this.rra_ptr_idx+this.rra_ptr_el_size*this.rra_cnt;
}

// Optional initialization
// Read and calculate row counts
RRDHeader.prototype.load_row_cnts = function() {
  this.rra_def_row_cnts=[];
  this.rra_def_row_cnt_sums=[]; // how many rows before me
  for (var i=0; i<this.rra_cnt; i++) {
    this.rra_def_row_cnts[i]=this.rrd_data.getLongAt(this.rra_def_idx+i*this.rra_def_el_size+this.row_cnt_idx,false);
    if (i==0) {
      this.rra_def_row_cnt_sums[i]=0;
    } else {
      this.rra_def_row_cnt_sums[i]=this.rra_def_row_cnt_sums[i-1]+this.rra_def_row_cnts[i-1];
    }
  }
}

// ---------------------------
// Start of user functions

RRDHeader.prototype.getMinStep = function() {
  return this.pdp_step;
}
RRDHeader.prototype.getLastUpdate = function() {
  return this.rrd_data.getLongAt(this.live_head_idx,false);
}

RRDHeader.prototype.getNrDSs = function() {
  return this.ds_cnt;
}
RRDHeader.prototype.getDSNames = function() {
  var ds_names=[]
  for (var idx=0; idx<this.ds_cnt; idx++) {
    var ds=this.getDSbyIdx(idx);
    var ds_name=ds.getName()
    ds_names.push(ds_name);
  }
  return ds_names;
}
RRDHeader.prototype.getDSbyIdx = function(idx) {
  if ((idx>=0) && (idx<this.ds_cnt)) {
    return new RRDDS(this.rrd_data,this.ds_def_idx+this.ds_el_size*idx,idx);
  } else {
    throw RangeError("DS idx ("+ idx +") out of range [0-" + this.ds_cnt +").");
  }
}
RRDHeader.prototype.getDSbyName = function(name) {
  for (var idx=0; idx<this.ds_cnt; idx++) {
    var ds=this.getDSbyIdx(idx);
    var ds_name=ds.getName()
    if (ds_name==name)
      return ds;
  }
  throw RangeError("DS name "+ name +" unknown.");
}

RRDHeader.prototype.getNrRRAs = function() {
  return this.rra_cnt;
}
RRDHeader.prototype.getRRAInfo = function(idx) {
  if ((idx>=0) && (idx<this.rra_cnt)) {
    return new RRDRRAInfo(this.rrd_data,
			  this.rra_def_idx+idx*this.rra_def_el_size,
			  this.rrd_align,this.rra_def_row_cnts[idx],this.pdp_step,
			  idx);
  } else {
    throw RangeError("RRA idx ("+ idx +") out of range [0-" + this.rra_cnt +").");
  }
}

// ============================================================
// RRDFile class
//   Given a BinaryFile, gives access to the RRD archive fields
//
// Arguments:
//   bf must be an object compatible with the BinaryFile interface
function RRDFile(bf) {
  var rrd_data=bf

  this.rrd_header=new RRDHeader(rrd_data);
  this.rrd_header.load_row_cnts();

  // ===================================
  // Start of user functions

  this.getMinStep = function() {
    return this.rrd_header.getMinStep();
  }
  this.getLastUpdate = function() {
    return this.rrd_header.getLastUpdate();
  }

  this.getNrDSs = function() {
    return this.rrd_header.getNrDSs();
  }
  this.getDSNames = function() {
    return this.rrd_header.getDSNames();
  }
  this.getDS = function(id) {
    if (typeof id == "number") {
      return this.rrd_header.getDSbyIdx(id);
    } else {
      return this.rrd_header.getDSbyName(id);
    }
  }

  this.getNrRRAs = function() {
    return this.rrd_header.getNrRRAs();
  }

  this.getRRAInfo = function(idx) {
    return this.rrd_header.getRRAInfo(idx);
  }

  this.getRRA = function(idx) {
    var rra_info=this.rrd_header.getRRAInfo(idx);
    return new RRDRRA(rrd_data,
		      this.rrd_header.rra_ptr_idx+idx*this.rrd_header.rra_ptr_el_size,
		      rra_info,
		      this.rrd_header.header_size,
		      this.rrd_header.rra_def_row_cnt_sums[idx],
		      this.rrd_header.ds_cnt);
  }

}
