// jshint browser:true
/*
 * BinaryFile over XMLHttpRequest
 * Part of the javascriptRRD package
 * Copyright (c) 2009 Frank Wuerthwein, fkw@ucsd.edu
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 * Original repository: http://javascriptrrd.sourceforge.net/
 *
 * Based on:
 *   Binary Ajax 0.1.5
 *   Copyright (c) 2008 Jacob Seidelin, cupboy@gmail.com, http://blog.nihilogic.dk/
 *   MIT License [http://www.opensource.org/licenses/mit-license.php]
 */

// ============================================================
// Exception class
function InvalidBinaryFile(msg) {
	"use strict";
	this.message = msg;
	this.name = "Invalid BinaryFile";
}

// pretty print
InvalidBinaryFile.prototype.toString = function() {
	"use strict";
	return this.name + ': "' + this.message + '"';
};

// =====================================================================
// BinaryFile class
//   Allows access to element inside a binary stream
function BinaryFile(data) {
	"use strict";
	var dataLength;
	// whether the data is in little endian format
	var littleEndian = true;

	this.getRawData = function() {
		return data;
	};

	if (typeof data === "string") {
		dataLength = data.length;

		this.getByteAt = function(iOffset) {
			return data.charCodeAt(iOffset) & 0xFF;
		};
	} else if (typeof DataView != "undefined" && data instanceof ArrayBuffer) {
		dataLength = data.dataLength;
	/*@cc_on
	} else if (typeof data === "unknown") {
		// Correct. "unknown" as type. MS JScript 8 added this.
		dataLength = IEBinary_getLength(data);

		this.getByteAt = function(iOffset) {
			return IEBinary_getByteAt(data, iOffset);
		};
	@*/
	} else {
		throw new InvalidBinaryFile("Unsupported type " + (typeof data));
	}

	this.getLength = function() {
		return dataLength;
	};

	if (typeof DataView != "undefined" && data instanceof ArrayBuffer) {
		// not an antique browser, use faster TypedArrays
		this.extendWithDataView(data, littleEndian);
		// other functions here do not need these
		data = null;
	} else {
		// antique browser, use slower fallback implementation
		this.extendWithFallback(data, littleEndian);
	}
}

BinaryFile.prototype.extendWithFallback = function(data, littleEndian) {
	"use strict";
	var doubleMantExpHi = Math.pow(2,-28);
	var doubleMantExpLo = Math.pow(2,-52);
	var doubleMantExpFast = Math.pow(2,-20);

	// private function for getting bytes depending on endianess
	var that = this, getEndianByteAt;
	if (littleEndian) {
		getEndianByteAt = function(iOffset, width, delta) {
			return that.getByteAt(iOffset + delta);
		};
	} else {
		getEndianByteAt = function(iOffset, width, delta) {
			return that.getByteAt(iOffset + width - delta - 1);
		};
	}

	this.getSByteAt = function(iOffset) {
		var iByte = this.getByteAt(iOffset);
		if (iByte > 127)
			return iByte - 256;
		else
			return iByte;
	};
	this.getShortAt = function(iOffset) {
		var iShort = (getEndianByteAt(iOffset,2,1) << 8) + getEndianByteAt(iOffset,2,0);
		if (iShort < 0) iShort += 65536;
		return iShort;
	};
	this.getSShortAt = function(iOffset) {
		var iUShort = this.getShortAt(iOffset);
		if (iUShort > 32767)
			return iUShort - 65536;
		else
			return iUShort;
	};
	this.getLongAt = function(iOffset) {
		var iByte1 = getEndianByteAt(iOffset,4,0),
			iByte2 = getEndianByteAt(iOffset,4,1),
			iByte3 = getEndianByteAt(iOffset,4,2),
			iByte4 = getEndianByteAt(iOffset,4,3);

		var iLong = (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
		if (iLong < 0) iLong += 4294967296;
		return iLong;
	};
	this.getSLongAt = function(iOffset) {
		var iULong = this.getLongAt(iOffset);
		if (iULong > 2147483647)
			return iULong - 4294967296;
		else
			return iULong;
	};
	this.getCharAt = function(iOffset) {
		return String.fromCharCode(this.getByteAt(iOffset));
	};
	this.getCStringAt = function(iOffset, iMaxLength) {
		var aStr = [];
		for (var i=iOffset,j=0;(i<iOffset+iMaxLength) && (this.getByteAt(i)>0);i++,j++) {
			aStr[j] = String.fromCharCode(this.getByteAt(i));
		}
		return aStr.join("");
	};
	this.getDoubleAt = function(iOffset) {
		var iByte1 = getEndianByteAt(iOffset,8,0),
			iByte2 = getEndianByteAt(iOffset,8,1),
			iByte3 = getEndianByteAt(iOffset,8,2),
			iByte4 = getEndianByteAt(iOffset,8,3),
			iByte5 = getEndianByteAt(iOffset,8,4),
			iByte6 = getEndianByteAt(iOffset,8,5),
			iByte7 = getEndianByteAt(iOffset,8,6),
			iByte8 = getEndianByteAt(iOffset,8,7);
		var iSign=iByte8 >> 7;
		var iExpRaw=((iByte8 & 0x7F)<< 4) + (iByte7 >> 4);
		var iMantHi=((((((iByte7 & 0x0F) << 8) + iByte6) << 8) + iByte5) << 8) + iByte4;
		var iMantLo=((((iByte3) << 8) + iByte2) << 8) + iByte1;

		if (iExpRaw === 0) return 0.0;
		if (iExpRaw === 0x7ff) return undefined;

		var iExp=(iExpRaw & 0x7FF)-1023;

		var dDouble = ((iSign==1)?-1:1)*Math.pow(2,iExp)*(1.0 + iMantLo*doubleMantExpLo + iMantHi*doubleMantExpHi);
		return dDouble;
	};
	// Extracts only 4 bytes out of 8, loosing in precision (20 bit mantissa)
	this.getFastDoubleAt = function(iOffset) {
		var iByte5 = getEndianByteAt(iOffset,8,4),
			iByte6 = getEndianByteAt(iOffset,8,5),
			iByte7 = getEndianByteAt(iOffset,8,6),
			iByte8 = getEndianByteAt(iOffset,8,7);
		var iSign=iByte8 >> 7;
		var iExpRaw=((iByte8 & 0x7F)<< 4) + (iByte7 >> 4);
		var iMant=((((iByte7 & 0x0F) << 8) + iByte6) << 8) + iByte5;

		if (iExpRaw === 0) return 0.0;
		if (iExpRaw === 0x7ff) return undefined;

		var iExp=(iExpRaw & 0x7FF)-1023;

		var dDouble = ((iSign === 1) ? -1 : 1);
		dDouble *= Math.pow(2,iExp) * (1.0 + iMant*doubleMantExpFast);
		return dDouble;
	};
};

BinaryFile.prototype.extendWithDataView = function(data, littleEndian) {
	"use strict";
	var dv = new DataView(data);

	this.getByteAt = dv.getUint8.bind(dv);
	this.getSByteAt = dv.getInt8.bind(dv);
	this.getShortAt = function(iOffset) {
		return dv.getUint16(iOffset, littleEndian);
	};
	this.getSShortAt = function(iOffset) {
		return dv.getInt16(iOffset, littleEndian);
	};
	this.getLongAt = function(iOffset) {
		return dv.getUint32(iOffset, littleEndian);
	};
	this.getSLongAt = function(iOffset) {
		return dv.getInt32(iOffset, littleEndian);
	};
	this.getCharAt = function(iOffset) {
		return String.fromCharCode(this.getByteAt(iOffset));
	};
	this.getCStringAt = function(iOffset, iMaxLength) {
		var str = "";
		do {
			var b = this.getByteAt(iOffset++);
			if (b === 0)
				break;
			str += String.fromCharCode(b);
		} while (--iMaxLength > 0);
		return str;
	};
	this.getDoubleAt = function(iOffset) {
		return dv.getFloat64(iOffset, littleEndian);
	};
	this.getFastDoubleAt = this.getDoubleAt.bind(this);
};


// Use document.write only for stone-age browsers.
/*@cc on
document.write(
	"<script type='text/vbscript'>\r\n"
	+ "Function IEBinary_getByteAt(strBinary, iOffset)\r\n"
	+ "	IEBinary_getByteAt = AscB(MidB(strBinary,iOffset+1,1))\r\n"
	+ "End Function\r\n"
	+ "Function IEBinary_getLength(strBinary)\r\n"
	+ "	IEBinary_getLength = LenB(strBinary)\r\n"
	+ "End Function\r\n"
	+ "</script>\r\n"
);
@*/


// ===============================================================
// Load a binary file from the specified URL
// Will return an object of type BinaryFile
function FetchBinaryURL(url) {
	"use strict";
	var request =  new XMLHttpRequest();
	request.open("GET", url,false);
	try {
		request.overrideMimeType('text/plain; charset=x-user-defined');
	} catch (err) {
		// ignore any error, just to make both FF and IE work
	}
	request.send(null);

	var response = request.responseText;
	/*@cc_on
	try {
		// for older IE versions, the value in responseText is not usable
		if (IEBinary_getLength(this.responseBody)>0) {
			// will get here only for older verson of IE
			response=this.responseBody;
		}
	} catch (err) {
	}
	@*/

	// cannot use responseType == "arraybuffer" for synchronous requests, so
	// convert it afterwards
	if (typeof ArrayBuffer != "undefined") {
		var buffer = new ArrayBuffer(response.length);
		var bv = new Uint8Array(buffer);
		for (var i = 0; i < response.length; i++) {
			bv[i] = response.charCodeAt(i);
		}
		response = buffer;
	}

	var bf = new BinaryFile(response);
	return bf;
}


// ===============================================================
// Asyncronously load a binary file from the specified URL
//
// callback must be a function with one or two arguments:
//  - bf = an object of type BinaryFile
//  - optional argument object (used only if callback_arg not undefined)
function FetchBinaryURLAsync(url, callback, callback_arg) {
	"use strict";
	var callback_wrapper = function() {
		if(this.readyState === 4) {
			// ArrayBuffer response or just the response as string
			var response = this.response || this.responseText;
			/*@cc_on
			try {
				// for older IE versions, the value in responseText is not usable
				if (IEBinary_getLength(this.responseBody)>0) {
					// will get here only for older verson of IE
					response=this.responseBody;
				}
			} catch (err) {
			}
			@*/

			var bf = new BinaryFile(response);
			if (callback_arg) {
				callback(bf, callback_arg);
			} else {
				callback(bf);
			}
		}
	};

	var request =  new XMLHttpRequest();
	request.onreadystatechange = callback_wrapper;
	request.open("GET", url, true);
	// Supported since Chrome 10, FF 6, IE 10, Opera 11.60 (source: MDN)
	request.responseType = "arraybuffer";
	try {
		request.overrideMimeType('text/plain; charset=x-user-defined');
	} catch (err) {
		// ignore any error, just to make both FF and IE work
	}
	request.send(null);
	return request;
}
