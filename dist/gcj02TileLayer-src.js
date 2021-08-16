(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.gcj02TileLayer = factory());
}(this, (function () { 'use strict';

	/*
	 * @namespace Util
	 *
	 * Various utility functions, used by Leaflet internally.
	 */
	Object.freeze = function (obj) {
		return obj;
	};

	// @function create(proto: Object, properties?: Object): Object
	// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
	var create$3 = Object.create || function () {
		function F() {}
		return function (proto) {
			F.prototype = proto;
			return new F();
		};
	}();

	// @function setOptions(obj: Object, options: Object): Object
	// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
	function setOptions(obj, options) {
		if (!obj.hasOwnProperty('options')) {
			obj.options = obj.options ? create$3(obj.options) : {};
		}
		for (var i in options) {
			obj.options[i] = options[i];
		}
		return obj.options;
	}

	var templateRe = /\{ *([\w_-]+) *\}/g;

	// @function template(str: String, data: Object): String
	// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
	// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
	// `('Hello foo, bar')`. You can also specify functions instead of strings for
	// data values — they will be evaluated passing `data` as an argument.
	function template(str, data) {
		return str.replace(templateRe, function (str, key) {
			var value = data[key];

			if (value === undefined) {
				throw new Error('No value provided for variable ' + str);
			} else if (typeof value === 'function') {
				value = value(data);
			}
			return value;
		});
	}

	// @function isArray(obj): Boolean
	// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
	var isArray = Array.isArray || function (obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	};

	//坐标转换
	var pi = 3.1415926535897932384626;
	var a = 6378245.0;
	var ee = 0.00669342162296594323;

	//经纬度转xyz协议瓦片编号
	function lonLatToTileNumbers(lon_deg, lat_deg, zoom) {
	    var lat_rad = pi / 180 * lat_deg; //math.radians(lat_deg)  角度转弧度
	    var n = Math.pow(2, zoom);
	    var xtile = parseInt((lon_deg + 180.0) / 360.0 * n);
	    var ytile = parseInt((1.0 - Math.asinh(Math.tan(lat_rad)) / pi) / 2.0 * n);
	    return [xtile, ytile];
	}

	//xyz协议瓦片编号转经纬度
	function tileNumbersToLonLat(xtile, ytile, zoom) {
	    let n = Math.pow(2, zoom);
	    let lon_deg = xtile / n * 360.0 - 180.0;
	    let lat_rad = Math.atan(Math.sinh(pi * (1 - 2 * ytile / n)));

	    let lat_deg = lat_rad * 180.0 / pi;
	    return [lon_deg, lat_deg];
	}
	/**84转火星*/
	function gps84_To_gcj02(lng, lat) {
	    if (isArray(lng)) {
	        var _lng = lng[0];
	        lat = lng[1];
	        lng = _lng;
	    }
	    if (lng instanceof Object) {
	        var _lng = lng.lng;
	        lat = lng.lat;
	        lng = _lng;
	    }

	    var dLat = transformLat(lng - 105.0, lat - 35.0);
	    var dLng = transformLng(lng - 105.0, lat - 35.0);
	    var radLat = lat / 180.0 * pi;
	    var magic = Math.sin(radLat);
	    magic = 1 - ee * magic * magic;
	    var sqrtMagic = Math.sqrt(magic);
	    dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
	    dLng = dLng * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
	    var mgLat = lat + dLat;
	    var mgLng = lng + dLng;
	    var newCoord = {
	        lng: mgLng,
	        lat: mgLat
	    };
	    return newCoord;
	}
	/**火星转84*/
	function gcj02_To_gps84(lng, lat) {
	    if (isArray(lng)) {
	        var _lng = lng[0];
	        lat = lng[1];
	        lng = _lng;
	    }
	    if (lng instanceof Object) {
	        var _lng = lng.lng;
	        lat = lng.lat;
	        lng = _lng;
	    }

	    var coord = transform(lng, lat);
	    var lontitude = lng * 2 - coord.lng;
	    var latitude = lat * 2 - coord.lat;
	    var newCoord = {
	        lng: lontitude,
	        lat: latitude
	    };
	    return newCoord;
	}

	function transform(lng, lat) {
	    var dLat = transformLat(lng - 105.0, lat - 35.0);
	    var dLng = transformLng(lng - 105.0, lat - 35.0);
	    var radLat = lat / 180.0 * pi;
	    var magic = Math.sin(radLat);
	    magic = 1 - ee * magic * magic;
	    var sqrtMagic = Math.sqrt(magic);
	    dLat = dLat * 180.0 / (a * (1 - ee) / (magic * sqrtMagic) * pi);
	    dLng = dLng * 180.0 / (a / sqrtMagic * Math.cos(radLat) * pi);
	    var mgLat = lat + dLat;
	    var mgLng = lng + dLng;
	    var newCoord = {
	        lng: mgLng,
	        lat: mgLat
	    };
	    return newCoord;
	}

	function transformLat(x, y) {
	    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
	    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
	    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
	    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
	    return ret;
	}

	function transformLng(x, y) {
	    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
	    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
	    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
	    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
	    return ret;
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var _typeof$1 = {exports: {}};

	(function (module) {
	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    module.exports = _typeof = function _typeof(obj) {
	      return typeof obj;
	    };

	    module.exports["default"] = module.exports, module.exports.__esModule = true;
	  } else {
	    module.exports = _typeof = function _typeof(obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };

	    module.exports["default"] = module.exports, module.exports.__esModule = true;
	  }

	  return _typeof(obj);
	}

	module.exports = _typeof;
	module.exports["default"] = module.exports, module.exports.__esModule = true;
	}(_typeof$1));

	var _typeof = /*@__PURE__*/getDefaultExportFromCjs(_typeof$1.exports);

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	function _possibleConstructorReturn(self, call) {
	  if (call && (_typeof(call) === "object" || typeof call === "function")) {
	    return call;
	  }

	  return _assertThisInitialized(self);
	}

	function _getPrototypeOf(o) {
	  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
	    return o.__proto__ || Object.getPrototypeOf(o);
	  };
	  return _getPrototypeOf(o);
	}

	function _setPrototypeOf(o, p) {
	  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
	    o.__proto__ = p;
	    return o;
	  };

	  return _setPrototypeOf(o, p);
	}

	function _inherits(subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function");
	  }

	  subClass.prototype = Object.create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf(subClass, superClass);
	}

	function _arrayWithHoles(arr) {
	  if (Array.isArray(arr)) return arr;
	}

	function _iterableToArrayLimit(arr, i) {
	  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

	  if (_i == null) return;
	  var _arr = [];
	  var _n = true;
	  var _d = false;

	  var _s, _e;

	  try {
	    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
	      _arr.push(_s.value);

	      if (i && _arr.length === i) break;
	    }
	  } catch (err) {
	    _d = true;
	    _e = err;
	  } finally {
	    try {
	      if (!_n && _i["return"] != null) _i["return"]();
	    } finally {
	      if (_d) throw _e;
	    }
	  }

	  return _arr;
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) {
	    arr2[i] = arr[i];
	  }

	  return arr2;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _nonIterableRest() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _slicedToArray(arr, i) {
	  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
	}

	/**
	 * Common utilities
	 * @module glMatrix
	 */
	// Configuration Constants
	var EPSILON = 0.000001;
	var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
	if (!Math.hypot) Math.hypot = function () {
	  var y = 0,
	      i = arguments.length;

	  while (i--) {
	    y += arguments[i] * arguments[i];
	  }

	  return Math.sqrt(y);
	};

	/**
	 * 4 Dimensional Vector
	 * @module vec4
	 */

	/**
	 * Creates a new, empty vec4
	 *
	 * @returns {vec4} a new 4D vector
	 */

	function create$2() {
	  var out = new ARRAY_TYPE(4);

	  if (ARRAY_TYPE != Float32Array) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	    out[3] = 0;
	  }

	  return out;
	}
	/**
	 * Scales a vec4 by a scalar number
	 *
	 * @param {vec4} out the receiving vector
	 * @param {ReadonlyVec4} a the vector to scale
	 * @param {Number} b amount to scale the vector by
	 * @returns {vec4} out
	 */

	function scale$1(out, a, b) {
	  out[0] = a[0] * b;
	  out[1] = a[1] * b;
	  out[2] = a[2] * b;
	  out[3] = a[3] * b;
	  return out;
	}
	/**
	 * Transforms the vec4 with a mat4.
	 *
	 * @param {vec4} out the receiving vector
	 * @param {ReadonlyVec4} a the vector to transform
	 * @param {ReadonlyMat4} m matrix to transform with
	 * @returns {vec4} out
	 */

	function transformMat4(out, a, m) {
	  var x = a[0],
	      y = a[1],
	      z = a[2],
	      w = a[3];
	  out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
	  out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
	  out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
	  out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
	  return out;
	}
	/**
	 * Perform some operation over an array of vec4s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */

	(function () {
	  var vec = create$2();
	  return function (a, stride, offset, count, fn, arg) {
	    var i, l;

	    if (!stride) {
	      stride = 4;
	    }

	    if (!offset) {
	      offset = 0;
	    }

	    if (count) {
	      l = Math.min(count * stride + offset, a.length);
	    } else {
	      l = a.length;
	    }

	    for (i = offset; i < l; i += stride) {
	      vec[0] = a[i];
	      vec[1] = a[i + 1];
	      vec[2] = a[i + 2];
	      vec[3] = a[i + 3];
	      fn(vec, vec, arg);
	      a[i] = vec[0];
	      a[i + 1] = vec[1];
	      a[i + 2] = vec[2];
	      a[i + 3] = vec[3];
	    }

	    return a;
	  };
	})();

	function createMat4() {
	  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	}
	function transformVector(matrix, vector) {
	  var result = transformMat4([], vector, matrix);
	  scale$1(result, result, 1 / result[3]);
	  return result;
	}

	/**
	 * Inverts a mat4
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the source matrix
	 * @returns {mat4} out
	 */

	function invert(out, a) {
	  var a00 = a[0],
	      a01 = a[1],
	      a02 = a[2],
	      a03 = a[3];
	  var a10 = a[4],
	      a11 = a[5],
	      a12 = a[6],
	      a13 = a[7];
	  var a20 = a[8],
	      a21 = a[9],
	      a22 = a[10],
	      a23 = a[11];
	  var a30 = a[12],
	      a31 = a[13],
	      a32 = a[14],
	      a33 = a[15];
	  var b00 = a00 * a11 - a01 * a10;
	  var b01 = a00 * a12 - a02 * a10;
	  var b02 = a00 * a13 - a03 * a10;
	  var b03 = a01 * a12 - a02 * a11;
	  var b04 = a01 * a13 - a03 * a11;
	  var b05 = a02 * a13 - a03 * a12;
	  var b06 = a20 * a31 - a21 * a30;
	  var b07 = a20 * a32 - a22 * a30;
	  var b08 = a20 * a33 - a23 * a30;
	  var b09 = a21 * a32 - a22 * a31;
	  var b10 = a21 * a33 - a23 * a31;
	  var b11 = a22 * a33 - a23 * a32; // Calculate the determinant

	  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

	  if (!det) {
	    return null;
	  }

	  det = 1.0 / det;
	  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
	  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
	  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
	  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
	  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
	  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
	  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
	  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
	  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
	  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
	  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
	  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
	  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
	  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
	  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
	  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
	  return out;
	}
	/**
	 * Multiplies two mat4s
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the first operand
	 * @param {ReadonlyMat4} b the second operand
	 * @returns {mat4} out
	 */

	function multiply(out, a, b) {
	  var a00 = a[0],
	      a01 = a[1],
	      a02 = a[2],
	      a03 = a[3];
	  var a10 = a[4],
	      a11 = a[5],
	      a12 = a[6],
	      a13 = a[7];
	  var a20 = a[8],
	      a21 = a[9],
	      a22 = a[10],
	      a23 = a[11];
	  var a30 = a[12],
	      a31 = a[13],
	      a32 = a[14],
	      a33 = a[15]; // Cache only the current line of the second matrix

	  var b0 = b[0],
	      b1 = b[1],
	      b2 = b[2],
	      b3 = b[3];
	  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[4];
	  b1 = b[5];
	  b2 = b[6];
	  b3 = b[7];
	  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[8];
	  b1 = b[9];
	  b2 = b[10];
	  b3 = b[11];
	  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  b0 = b[12];
	  b1 = b[13];
	  b2 = b[14];
	  b3 = b[15];
	  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
	  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
	  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
	  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
	  return out;
	}
	/**
	 * Translate a mat4 by the given vector
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the matrix to translate
	 * @param {ReadonlyVec3} v vector to translate by
	 * @returns {mat4} out
	 */

	function translate(out, a, v) {
	  var x = v[0],
	      y = v[1],
	      z = v[2];
	  var a00, a01, a02, a03;
	  var a10, a11, a12, a13;
	  var a20, a21, a22, a23;

	  if (a === out) {
	    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
	    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
	    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
	    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
	  } else {
	    a00 = a[0];
	    a01 = a[1];
	    a02 = a[2];
	    a03 = a[3];
	    a10 = a[4];
	    a11 = a[5];
	    a12 = a[6];
	    a13 = a[7];
	    a20 = a[8];
	    a21 = a[9];
	    a22 = a[10];
	    a23 = a[11];
	    out[0] = a00;
	    out[1] = a01;
	    out[2] = a02;
	    out[3] = a03;
	    out[4] = a10;
	    out[5] = a11;
	    out[6] = a12;
	    out[7] = a13;
	    out[8] = a20;
	    out[9] = a21;
	    out[10] = a22;
	    out[11] = a23;
	    out[12] = a00 * x + a10 * y + a20 * z + a[12];
	    out[13] = a01 * x + a11 * y + a21 * z + a[13];
	    out[14] = a02 * x + a12 * y + a22 * z + a[14];
	    out[15] = a03 * x + a13 * y + a23 * z + a[15];
	  }

	  return out;
	}
	/**
	 * Scales the mat4 by the dimensions in the given vec3 not using vectorization
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the matrix to scale
	 * @param {ReadonlyVec3} v the vec3 to scale the matrix by
	 * @returns {mat4} out
	 **/

	function scale(out, a, v) {
	  var x = v[0],
	      y = v[1],
	      z = v[2];
	  out[0] = a[0] * x;
	  out[1] = a[1] * x;
	  out[2] = a[2] * x;
	  out[3] = a[3] * x;
	  out[4] = a[4] * y;
	  out[5] = a[5] * y;
	  out[6] = a[6] * y;
	  out[7] = a[7] * y;
	  out[8] = a[8] * z;
	  out[9] = a[9] * z;
	  out[10] = a[10] * z;
	  out[11] = a[11] * z;
	  out[12] = a[12];
	  out[13] = a[13];
	  out[14] = a[14];
	  out[15] = a[15];
	  return out;
	}
	/**
	 * Rotates a matrix by the given angle around the X axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */

	function rotateX(out, a, rad) {
	  var s = Math.sin(rad);
	  var c = Math.cos(rad);
	  var a10 = a[4];
	  var a11 = a[5];
	  var a12 = a[6];
	  var a13 = a[7];
	  var a20 = a[8];
	  var a21 = a[9];
	  var a22 = a[10];
	  var a23 = a[11];

	  if (a !== out) {
	    // If the source and destination differ, copy the unchanged rows
	    out[0] = a[0];
	    out[1] = a[1];
	    out[2] = a[2];
	    out[3] = a[3];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	  } // Perform axis-specific matrix multiplication


	  out[4] = a10 * c + a20 * s;
	  out[5] = a11 * c + a21 * s;
	  out[6] = a12 * c + a22 * s;
	  out[7] = a13 * c + a23 * s;
	  out[8] = a20 * c - a10 * s;
	  out[9] = a21 * c - a11 * s;
	  out[10] = a22 * c - a12 * s;
	  out[11] = a23 * c - a13 * s;
	  return out;
	}
	/**
	 * Rotates a matrix by the given angle around the Z axis
	 *
	 * @param {mat4} out the receiving matrix
	 * @param {ReadonlyMat4} a the matrix to rotate
	 * @param {Number} rad the angle to rotate the matrix by
	 * @returns {mat4} out
	 */

	function rotateZ(out, a, rad) {
	  var s = Math.sin(rad);
	  var c = Math.cos(rad);
	  var a00 = a[0];
	  var a01 = a[1];
	  var a02 = a[2];
	  var a03 = a[3];
	  var a10 = a[4];
	  var a11 = a[5];
	  var a12 = a[6];
	  var a13 = a[7];

	  if (a !== out) {
	    // If the source and destination differ, copy the unchanged last row
	    out[8] = a[8];
	    out[9] = a[9];
	    out[10] = a[10];
	    out[11] = a[11];
	    out[12] = a[12];
	    out[13] = a[13];
	    out[14] = a[14];
	    out[15] = a[15];
	  } // Perform axis-specific matrix multiplication


	  out[0] = a00 * c + a10 * s;
	  out[1] = a01 * c + a11 * s;
	  out[2] = a02 * c + a12 * s;
	  out[3] = a03 * c + a13 * s;
	  out[4] = a10 * c - a00 * s;
	  out[5] = a11 * c - a01 * s;
	  out[6] = a12 * c - a02 * s;
	  out[7] = a13 * c - a03 * s;
	  return out;
	}
	/**
	 * Generates a perspective projection matrix with the given bounds.
	 * Passing null/undefined/no value for far will generate infinite projection matrix.
	 *
	 * @param {mat4} out mat4 frustum matrix will be written into
	 * @param {number} fovy Vertical field of view in radians
	 * @param {number} aspect Aspect ratio. typically viewport width/height
	 * @param {number} near Near bound of the frustum
	 * @param {number} far Far bound of the frustum, can be null or Infinity
	 * @returns {mat4} out
	 */

	function perspective(out, fovy, aspect, near, far) {
	  var f = 1.0 / Math.tan(fovy / 2),
	      nf;
	  out[0] = f / aspect;
	  out[1] = 0;
	  out[2] = 0;
	  out[3] = 0;
	  out[4] = 0;
	  out[5] = f;
	  out[6] = 0;
	  out[7] = 0;
	  out[8] = 0;
	  out[9] = 0;
	  out[11] = -1;
	  out[12] = 0;
	  out[13] = 0;
	  out[15] = 0;

	  if (far != null && far !== Infinity) {
	    nf = 1 / (near - far);
	    out[10] = (far + near) * nf;
	    out[14] = 2 * far * near * nf;
	  } else {
	    out[10] = -1;
	    out[14] = -2 * near;
	  }

	  return out;
	}
	/**
	 * Returns whether or not the matrices have approximately the same elements in the same position.
	 *
	 * @param {ReadonlyMat4} a The first matrix.
	 * @param {ReadonlyMat4} b The second matrix.
	 * @returns {Boolean} True if the matrices are equal, false otherwise.
	 */

	function equals(a, b) {
	  var a0 = a[0],
	      a1 = a[1],
	      a2 = a[2],
	      a3 = a[3];
	  var a4 = a[4],
	      a5 = a[5],
	      a6 = a[6],
	      a7 = a[7];
	  var a8 = a[8],
	      a9 = a[9],
	      a10 = a[10],
	      a11 = a[11];
	  var a12 = a[12],
	      a13 = a[13],
	      a14 = a[14],
	      a15 = a[15];
	  var b0 = b[0],
	      b1 = b[1],
	      b2 = b[2],
	      b3 = b[3];
	  var b4 = b[4],
	      b5 = b[5],
	      b6 = b[6],
	      b7 = b[7];
	  var b8 = b[8],
	      b9 = b[9],
	      b10 = b[10],
	      b11 = b[11];
	  var b12 = b[12],
	      b13 = b[13],
	      b14 = b[14],
	      b15 = b[15];
	  return Math.abs(a0 - b0) <= EPSILON * Math.max(1.0, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1.0, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1.0, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1.0, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1.0, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1.0, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1.0, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1.0, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1.0, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1.0, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1.0, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1.0, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1.0, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1.0, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1.0, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1.0, Math.abs(a15), Math.abs(b15));
	}

	/**
	 * 2 Dimensional Vector
	 * @module vec2
	 */

	/**
	 * Creates a new, empty vec2
	 *
	 * @returns {vec2} a new 2D vector
	 */

	function create$1() {
	  var out = new ARRAY_TYPE(2);

	  if (ARRAY_TYPE != Float32Array) {
	    out[0] = 0;
	    out[1] = 0;
	  }

	  return out;
	}
	/**
	 * Adds two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {ReadonlyVec2} a the first operand
	 * @param {ReadonlyVec2} b the second operand
	 * @returns {vec2} out
	 */

	function add(out, a, b) {
	  out[0] = a[0] + b[0];
	  out[1] = a[1] + b[1];
	  return out;
	}
	/**
	 * Negates the components of a vec2
	 *
	 * @param {vec2} out the receiving vector
	 * @param {ReadonlyVec2} a vector to negate
	 * @returns {vec2} out
	 */

	function negate$1(out, a) {
	  out[0] = -a[0];
	  out[1] = -a[1];
	  return out;
	}
	/**
	 * Performs a linear interpolation between two vec2's
	 *
	 * @param {vec2} out the receiving vector
	 * @param {ReadonlyVec2} a the first operand
	 * @param {ReadonlyVec2} b the second operand
	 * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
	 * @returns {vec2} out
	 */

	function lerp(out, a, b, t) {
	  var ax = a[0],
	      ay = a[1];
	  out[0] = ax + t * (b[0] - ax);
	  out[1] = ay + t * (b[1] - ay);
	  return out;
	}
	/**
	 * Perform some operation over an array of vec2s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */

	(function () {
	  var vec = create$1();
	  return function (a, stride, offset, count, fn, arg) {
	    var i, l;

	    if (!stride) {
	      stride = 2;
	    }

	    if (!offset) {
	      offset = 0;
	    }

	    if (count) {
	      l = Math.min(count * stride + offset, a.length);
	    } else {
	      l = a.length;
	    }

	    for (i = offset; i < l; i += stride) {
	      vec[0] = a[i];
	      vec[1] = a[i + 1];
	      fn(vec, vec, arg);
	      a[i] = vec[0];
	      a[i + 1] = vec[1];
	    }

	    return a;
	  };
	})();

	/**
	 * 3 Dimensional Vector
	 * @module vec3
	 */

	/**
	 * Creates a new, empty vec3
	 *
	 * @returns {vec3} a new 3D vector
	 */

	function create() {
	  var out = new ARRAY_TYPE(3);

	  if (ARRAY_TYPE != Float32Array) {
	    out[0] = 0;
	    out[1] = 0;
	    out[2] = 0;
	  }

	  return out;
	}
	/**
	 * Negates the components of a vec3
	 *
	 * @param {vec3} out the receiving vector
	 * @param {ReadonlyVec3} a vector to negate
	 * @returns {vec3} out
	 */

	function negate(out, a) {
	  out[0] = -a[0];
	  out[1] = -a[1];
	  out[2] = -a[2];
	  return out;
	}
	/**
	 * Perform some operation over an array of vec3s.
	 *
	 * @param {Array} a the array of vectors to iterate over
	 * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
	 * @param {Number} offset Number of elements to skip at the beginning of the array
	 * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
	 * @param {Function} fn Function to call for each vector in the array
	 * @param {Object} [arg] additional argument to pass to fn
	 * @returns {Array} a
	 * @function
	 */

	(function () {
	  var vec = create();
	  return function (a, stride, offset, count, fn, arg) {
	    var i, l;

	    if (!stride) {
	      stride = 3;
	    }

	    if (!offset) {
	      offset = 0;
	    }

	    if (count) {
	      l = Math.min(count * stride + offset, a.length);
	    } else {
	      l = a.length;
	    }

	    for (i = offset; i < l; i += stride) {
	      vec[0] = a[i];
	      vec[1] = a[i + 1];
	      vec[2] = a[i + 2];
	      fn(vec, vec, arg);
	      a[i] = vec[0];
	      a[i + 1] = vec[1];
	      a[i + 2] = vec[2];
	    }

	    return a;
	  };
	})();

	function assert(condition, message) {
	  if (!condition) {
	    throw new Error(message || 'viewport-mercator-project: assertion failed.');
	  }
	}

	var PI$1 = Math.PI;
	var PI_4 = PI$1 / 4;
	var DEGREES_TO_RADIANS$1 = PI$1 / 180;
	var RADIANS_TO_DEGREES = 180 / PI$1;
	var TILE_SIZE$1 = 512;
	var EARTH_CIRCUMFERENCE$1 = 40.03e6;
	var DEFAULT_ALTITUDE = 1.5;
	function zoomToScale$1(zoom) {
	  return Math.pow(2, zoom);
	}
	function lngLatToWorld(_ref, scale) {
	  var _ref2 = _slicedToArray(_ref, 2),
	      lng = _ref2[0],
	      lat = _ref2[1];

	  assert(Number.isFinite(lng) && Number.isFinite(scale));
	  assert(Number.isFinite(lat) && lat >= -90 && lat <= 90, 'invalid latitude');
	  scale *= TILE_SIZE$1;
	  var lambda2 = lng * DEGREES_TO_RADIANS$1;
	  var phi2 = lat * DEGREES_TO_RADIANS$1;
	  var x = scale * (lambda2 + PI$1) / (2 * PI$1);
	  var y = scale * (PI$1 - Math.log(Math.tan(PI_4 + phi2 * 0.5))) / (2 * PI$1);
	  return [x, y];
	}
	function worldToLngLat(_ref3, scale) {
	  var _ref4 = _slicedToArray(_ref3, 2),
	      x = _ref4[0],
	      y = _ref4[1];

	  scale *= TILE_SIZE$1;
	  var lambda2 = x / scale * (2 * PI$1) - PI$1;
	  var phi2 = 2 * (Math.atan(Math.exp(PI$1 - y / scale * (2 * PI$1))) - PI_4);
	  return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
	}
	function getDistanceScales$1(_ref6) {
	  var latitude = _ref6.latitude,
	      longitude = _ref6.longitude,
	      zoom = _ref6.zoom,
	      scale = _ref6.scale,
	      _ref6$highPrecision = _ref6.highPrecision,
	      highPrecision = _ref6$highPrecision === void 0 ? false : _ref6$highPrecision;
	  scale = scale !== undefined ? scale : zoomToScale$1(zoom);
	  assert(Number.isFinite(latitude) && Number.isFinite(longitude) && Number.isFinite(scale));
	  var result = {};
	  var worldSize = TILE_SIZE$1 * scale;
	  var latCosine = Math.cos(latitude * DEGREES_TO_RADIANS$1);
	  var pixelsPerDegreeX = worldSize / 360;
	  var pixelsPerDegreeY = pixelsPerDegreeX / latCosine;
	  var altPixelsPerMeter = worldSize / EARTH_CIRCUMFERENCE$1 / latCosine;
	  result.pixelsPerMeter = [altPixelsPerMeter, -altPixelsPerMeter, altPixelsPerMeter];
	  result.metersPerPixel = [1 / altPixelsPerMeter, -1 / altPixelsPerMeter, 1 / altPixelsPerMeter];
	  result.pixelsPerDegree = [pixelsPerDegreeX, -pixelsPerDegreeY, altPixelsPerMeter];
	  result.degreesPerPixel = [1 / pixelsPerDegreeX, -1 / pixelsPerDegreeY, 1 / altPixelsPerMeter];

	  if (highPrecision) {
	    var latCosine2 = DEGREES_TO_RADIANS$1 * Math.tan(latitude * DEGREES_TO_RADIANS$1) / latCosine;
	    var pixelsPerDegreeY2 = pixelsPerDegreeX * latCosine2 / 2;
	    var altPixelsPerDegree2 = worldSize / EARTH_CIRCUMFERENCE$1 * latCosine2;
	    var altPixelsPerMeter2 = altPixelsPerDegree2 / pixelsPerDegreeY * altPixelsPerMeter;
	    result.pixelsPerDegree2 = [0, -pixelsPerDegreeY2, altPixelsPerDegree2];
	    result.pixelsPerMeter2 = [altPixelsPerMeter2, 0, altPixelsPerMeter2];
	  }

	  return result;
	}
	function getViewMatrix(_ref7) {
	  var height = _ref7.height,
	      pitch = _ref7.pitch,
	      bearing = _ref7.bearing,
	      altitude = _ref7.altitude,
	      _ref7$center = _ref7.center,
	      center = _ref7$center === void 0 ? null : _ref7$center,
	      _ref7$flipY = _ref7.flipY,
	      flipY = _ref7$flipY === void 0 ? false : _ref7$flipY;
	  var vm = createMat4();
	  translate(vm, vm, [0, 0, -altitude]);
	  scale(vm, vm, [1, 1, 1 / height]);
	  rotateX(vm, vm, -pitch * DEGREES_TO_RADIANS$1);
	  rotateZ(vm, vm, bearing * DEGREES_TO_RADIANS$1);

	  if (flipY) {
	    scale(vm, vm, [1, -1, 1]);
	  }

	  if (center) {
	    translate(vm, vm, negate([], center));
	  }

	  return vm;
	}
	function getProjectionParameters(_ref8) {
	  var width = _ref8.width,
	      height = _ref8.height,
	      _ref8$altitude = _ref8.altitude,
	      altitude = _ref8$altitude === void 0 ? DEFAULT_ALTITUDE : _ref8$altitude,
	      _ref8$pitch = _ref8.pitch,
	      pitch = _ref8$pitch === void 0 ? 0 : _ref8$pitch,
	      _ref8$nearZMultiplier = _ref8.nearZMultiplier,
	      nearZMultiplier = _ref8$nearZMultiplier === void 0 ? 1 : _ref8$nearZMultiplier,
	      _ref8$farZMultiplier = _ref8.farZMultiplier,
	      farZMultiplier = _ref8$farZMultiplier === void 0 ? 1 : _ref8$farZMultiplier;
	  var pitchRadians = pitch * DEGREES_TO_RADIANS$1;
	  var halfFov = Math.atan(0.5 / altitude);
	  var topHalfSurfaceDistance = Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitchRadians - halfFov);
	  var farZ = Math.cos(Math.PI / 2 - pitchRadians) * topHalfSurfaceDistance + altitude;
	  return {
	    fov: 2 * Math.atan(height / 2 / altitude),
	    aspect: width / height,
	    focalDistance: altitude,
	    near: nearZMultiplier,
	    far: farZ * farZMultiplier
	  };
	}
	function getProjectionMatrix(_ref9) {
	  var width = _ref9.width,
	      height = _ref9.height,
	      pitch = _ref9.pitch,
	      altitude = _ref9.altitude,
	      nearZMultiplier = _ref9.nearZMultiplier,
	      farZMultiplier = _ref9.farZMultiplier;

	  var _getProjectionParamet = getProjectionParameters({
	    width: width,
	    height: height,
	    altitude: altitude,
	    pitch: pitch,
	    nearZMultiplier: nearZMultiplier,
	    farZMultiplier: farZMultiplier
	  }),
	      fov = _getProjectionParamet.fov,
	      aspect = _getProjectionParamet.aspect,
	      near = _getProjectionParamet.near,
	      far = _getProjectionParamet.far;

	  var projectionMatrix = perspective([], fov, aspect, near, far);
	  return projectionMatrix;
	}
	function worldToPixels(xyz, pixelProjectionMatrix) {
	  var _xyz2 = _slicedToArray(xyz, 3),
	      x = _xyz2[0],
	      y = _xyz2[1],
	      _xyz2$ = _xyz2[2],
	      z = _xyz2$ === void 0 ? 0 : _xyz2$;

	  assert(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z));
	  return transformVector(pixelProjectionMatrix, [x, y, z, 1]);
	}
	function pixelsToWorld(xyz, pixelUnprojectionMatrix) {
	  var targetZ = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	  var _xyz3 = _slicedToArray(xyz, 3),
	      x = _xyz3[0],
	      y = _xyz3[1],
	      z = _xyz3[2];

	  assert(Number.isFinite(x) && Number.isFinite(y), 'invalid pixel coordinate');

	  if (Number.isFinite(z)) {
	    var coord = transformVector(pixelUnprojectionMatrix, [x, y, z, 1]);
	    return coord;
	  }

	  var coord0 = transformVector(pixelUnprojectionMatrix, [x, y, 0, 1]);
	  var coord1 = transformVector(pixelUnprojectionMatrix, [x, y, 1, 1]);
	  var z0 = coord0[2];
	  var z1 = coord1[2];
	  var t = z0 === z1 ? 0 : ((targetZ || 0) - z0) / (z1 - z0);
	  return lerp([], coord0, coord1, t);
	}

	var IDENTITY = createMat4();

	var Viewport = function () {
	  function Viewport() {
	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        width = _ref.width,
	        height = _ref.height,
	        _ref$viewMatrix = _ref.viewMatrix,
	        viewMatrix = _ref$viewMatrix === void 0 ? IDENTITY : _ref$viewMatrix,
	        _ref$projectionMatrix = _ref.projectionMatrix,
	        projectionMatrix = _ref$projectionMatrix === void 0 ? IDENTITY : _ref$projectionMatrix;

	    _classCallCheck(this, Viewport);

	    this.width = width || 1;
	    this.height = height || 1;
	    this.scale = 1;
	    this.pixelsPerMeter = 1;
	    this.viewMatrix = viewMatrix;
	    this.projectionMatrix = projectionMatrix;
	    var vpm = createMat4();
	    multiply(vpm, vpm, this.projectionMatrix);
	    multiply(vpm, vpm, this.viewMatrix);
	    this.viewProjectionMatrix = vpm;
	    var m = createMat4();
	    scale(m, m, [this.width / 2, -this.height / 2, 1]);
	    translate(m, m, [1, -1, 0]);
	    multiply(m, m, this.viewProjectionMatrix);
	    var mInverse = invert(createMat4(), m);

	    if (!mInverse) {
	      throw new Error('Pixel project matrix not invertible');
	    }

	    this.pixelProjectionMatrix = m;
	    this.pixelUnprojectionMatrix = mInverse;
	    this.equals = this.equals.bind(this);
	    this.project = this.project.bind(this);
	    this.unproject = this.unproject.bind(this);
	    this.projectPosition = this.projectPosition.bind(this);
	    this.unprojectPosition = this.unprojectPosition.bind(this);
	    this.projectFlat = this.projectFlat.bind(this);
	    this.unprojectFlat = this.unprojectFlat.bind(this);
	  }

	  _createClass(Viewport, [{
	    key: "equals",
	    value: function equals$1(viewport) {
	      if (!(viewport instanceof Viewport)) {
	        return false;
	      }

	      return viewport.width === this.width && viewport.height === this.height && equals(viewport.projectionMatrix, this.projectionMatrix) && equals(viewport.viewMatrix, this.viewMatrix);
	    }
	  }, {
	    key: "project",
	    value: function project(xyz) {
	      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	          _ref2$topLeft = _ref2.topLeft,
	          topLeft = _ref2$topLeft === void 0 ? true : _ref2$topLeft;

	      var worldPosition = this.projectPosition(xyz);
	      var coord = worldToPixels(worldPosition, this.pixelProjectionMatrix);

	      var _coord = _slicedToArray(coord, 2),
	          x = _coord[0],
	          y = _coord[1];

	      var y2 = topLeft ? y : this.height - y;
	      return xyz.length === 2 ? [x, y2] : [x, y2, coord[2]];
	    }
	  }, {
	    key: "unproject",
	    value: function unproject(xyz) {
	      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	          _ref3$topLeft = _ref3.topLeft,
	          topLeft = _ref3$topLeft === void 0 ? true : _ref3$topLeft,
	          targetZ = _ref3.targetZ;

	      var _xyz = _slicedToArray(xyz, 3),
	          x = _xyz[0],
	          y = _xyz[1],
	          z = _xyz[2];

	      var y2 = topLeft ? y : this.height - y;
	      var targetZWorld = targetZ && targetZ * this.pixelsPerMeter;
	      var coord = pixelsToWorld([x, y2, z], this.pixelUnprojectionMatrix, targetZWorld);

	      var _this$unprojectPositi = this.unprojectPosition(coord),
	          _this$unprojectPositi2 = _slicedToArray(_this$unprojectPositi, 3),
	          X = _this$unprojectPositi2[0],
	          Y = _this$unprojectPositi2[1],
	          Z = _this$unprojectPositi2[2];

	      if (Number.isFinite(z)) {
	        return [X, Y, Z];
	      }

	      return Number.isFinite(targetZ) ? [X, Y, targetZ] : [X, Y];
	    }
	  }, {
	    key: "projectPosition",
	    value: function projectPosition(xyz) {
	      var _this$projectFlat = this.projectFlat(xyz),
	          _this$projectFlat2 = _slicedToArray(_this$projectFlat, 2),
	          X = _this$projectFlat2[0],
	          Y = _this$projectFlat2[1];

	      var Z = (xyz[2] || 0) * this.pixelsPerMeter;
	      return [X, Y, Z];
	    }
	  }, {
	    key: "unprojectPosition",
	    value: function unprojectPosition(xyz) {
	      var _this$unprojectFlat = this.unprojectFlat(xyz),
	          _this$unprojectFlat2 = _slicedToArray(_this$unprojectFlat, 2),
	          X = _this$unprojectFlat2[0],
	          Y = _this$unprojectFlat2[1];

	      var Z = (xyz[2] || 0) / this.pixelsPerMeter;
	      return [X, Y, Z];
	    }
	  }, {
	    key: "projectFlat",
	    value: function projectFlat(xyz) {
	      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;
	      return xyz;
	    }
	  }, {
	    key: "unprojectFlat",
	    value: function unprojectFlat(xyz) {
	      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;
	      return xyz;
	    }
	  }]);

	  return Viewport;
	}();

	function fitBounds(_ref) {
	  var width = _ref.width,
	      height = _ref.height,
	      bounds = _ref.bounds,
	      _ref$minExtent = _ref.minExtent,
	      minExtent = _ref$minExtent === void 0 ? 0 : _ref$minExtent,
	      _ref$maxZoom = _ref.maxZoom,
	      maxZoom = _ref$maxZoom === void 0 ? 24 : _ref$maxZoom,
	      _ref$padding = _ref.padding,
	      padding = _ref$padding === void 0 ? 0 : _ref$padding,
	      _ref$offset = _ref.offset,
	      offset = _ref$offset === void 0 ? [0, 0] : _ref$offset;

	  var _bounds = _slicedToArray(bounds, 2),
	      _bounds$ = _slicedToArray(_bounds[0], 2),
	      west = _bounds$[0],
	      south = _bounds$[1],
	      _bounds$2 = _slicedToArray(_bounds[1], 2),
	      east = _bounds$2[0],
	      north = _bounds$2[1];

	  if (Number.isFinite(padding)) {
	    var p = padding;
	    padding = {
	      top: p,
	      bottom: p,
	      left: p,
	      right: p
	    };
	  } else {
	    assert(Number.isFinite(padding.top) && Number.isFinite(padding.bottom) && Number.isFinite(padding.left) && Number.isFinite(padding.right));
	  }

	  var viewport = new WebMercatorViewport({
	    width: width,
	    height: height,
	    longitude: 0,
	    latitude: 0,
	    zoom: 0
	  });
	  var nw = viewport.project([west, north]);
	  var se = viewport.project([east, south]);
	  var size = [Math.max(Math.abs(se[0] - nw[0]), minExtent), Math.max(Math.abs(se[1] - nw[1]), minExtent)];
	  var targetSize = [width - padding.left - padding.right - Math.abs(offset[0]) * 2, height - padding.top - padding.bottom - Math.abs(offset[1]) * 2];
	  assert(targetSize[0] > 0 && targetSize[1] > 0);
	  var scaleX = targetSize[0] / size[0];
	  var scaleY = targetSize[1] / size[1];
	  var offsetX = (padding.right - padding.left) / 2 / scaleX;
	  var offsetY = (padding.bottom - padding.top) / 2 / scaleY;
	  var center = [(se[0] + nw[0]) / 2 + offsetX, (se[1] + nw[1]) / 2 + offsetY];
	  var centerLngLat = viewport.unproject(center);
	  var zoom = viewport.zoom + Math.log2(Math.abs(Math.min(scaleX, scaleY)));
	  return {
	    longitude: centerLngLat[0],
	    latitude: centerLngLat[1],
	    zoom: Math.min(zoom, maxZoom)
	  };
	}

	var WebMercatorViewport = function (_Viewport) {
	  _inherits(WebMercatorViewport, _Viewport);

	  function WebMercatorViewport() {
	    var _this;

	    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
	        width = _ref.width,
	        height = _ref.height,
	        _ref$latitude = _ref.latitude,
	        latitude = _ref$latitude === void 0 ? 0 : _ref$latitude,
	        _ref$longitude = _ref.longitude,
	        longitude = _ref$longitude === void 0 ? 0 : _ref$longitude,
	        _ref$zoom = _ref.zoom,
	        zoom = _ref$zoom === void 0 ? 0 : _ref$zoom,
	        _ref$pitch = _ref.pitch,
	        pitch = _ref$pitch === void 0 ? 0 : _ref$pitch,
	        _ref$bearing = _ref.bearing,
	        bearing = _ref$bearing === void 0 ? 0 : _ref$bearing,
	        _ref$altitude = _ref.altitude,
	        altitude = _ref$altitude === void 0 ? 1.5 : _ref$altitude,
	        nearZMultiplier = _ref.nearZMultiplier,
	        farZMultiplier = _ref.farZMultiplier;

	    _classCallCheck(this, WebMercatorViewport);

	    width = width || 1;
	    height = height || 1;
	    var scale = zoomToScale$1(zoom);
	    altitude = Math.max(0.75, altitude);
	    var center = lngLatToWorld([longitude, latitude], scale);
	    center[2] = 0;
	    var projectionMatrix = getProjectionMatrix({
	      width: width,
	      height: height,
	      pitch: pitch,
	      bearing: bearing,
	      altitude: altitude,
	      nearZMultiplier: nearZMultiplier || 1 / height,
	      farZMultiplier: farZMultiplier || 1.01
	    });
	    var viewMatrix = getViewMatrix({
	      height: height,
	      center: center,
	      pitch: pitch,
	      bearing: bearing,
	      altitude: altitude,
	      flipY: true
	    });
	    _this = _possibleConstructorReturn(this, _getPrototypeOf(WebMercatorViewport).call(this, {
	      width: width,
	      height: height,
	      viewMatrix: viewMatrix,
	      projectionMatrix: projectionMatrix
	    }));
	    _this.latitude = latitude;
	    _this.longitude = longitude;
	    _this.zoom = zoom;
	    _this.pitch = pitch;
	    _this.bearing = bearing;
	    _this.altitude = altitude;
	    _this.scale = scale;
	    _this.center = center;
	    _this.pixelsPerMeter = getDistanceScales$1(_assertThisInitialized(_assertThisInitialized(_this))).pixelsPerMeter[2];
	    Object.freeze(_assertThisInitialized(_assertThisInitialized(_this)));
	    return _this;
	  }

	  _createClass(WebMercatorViewport, [{
	    key: "projectFlat",
	    value: function projectFlat(lngLat) {
	      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;
	      return lngLatToWorld(lngLat, scale);
	    }
	  }, {
	    key: "unprojectFlat",
	    value: function unprojectFlat(xy) {
	      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.scale;
	      return worldToLngLat(xy, scale);
	    }
	  }, {
	    key: "getMapCenterByLngLatPosition",
	    value: function getMapCenterByLngLatPosition(_ref2) {
	      var lngLat = _ref2.lngLat,
	          pos = _ref2.pos;
	      var fromLocation = pixelsToWorld(pos, this.pixelUnprojectionMatrix);
	      var toLocation = lngLatToWorld(lngLat, this.scale);
	      var translate = add([], toLocation, negate$1([], fromLocation));
	      var newCenter = add([], this.center, translate);
	      return worldToLngLat(newCenter, this.scale);
	    }
	  }, {
	    key: "getLocationAtPoint",
	    value: function getLocationAtPoint(_ref3) {
	      var lngLat = _ref3.lngLat,
	          pos = _ref3.pos;
	      return this.getMapCenterByLngLatPosition({
	        lngLat: lngLat,
	        pos: pos
	      });
	    }
	  }, {
	    key: "fitBounds",
	    value: function fitBounds$1(bounds) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var width = this.width,
	          height = this.height;

	      var _fitBounds2 = fitBounds(Object.assign({
	        width: width,
	        height: height,
	        bounds: bounds
	      }, options)),
	          longitude = _fitBounds2.longitude,
	          latitude = _fitBounds2.latitude,
	          zoom = _fitBounds2.zoom;

	      return new WebMercatorViewport({
	        width: width,
	        height: height,
	        longitude: longitude,
	        latitude: latitude,
	        zoom: zoom
	      });
	    }
	  }]);

	  return WebMercatorViewport;
	}(Viewport);

	/**
	 * borrow from 
	 * https://github.com/uber-common/viewport-mercator-project/blob/master/src/web-mercator-utils.js
	 */

	const PI = Math.PI;
	const DEGREES_TO_RADIANS = PI / 180;
	// const RADIANS_TO_DEGREES = 180 / PI;
	const TILE_SIZE = 512;
	// Average circumference (40075 km equatorial, 40007 km meridional)
	const EARTH_CIRCUMFERENCE = 40.03e6;

	// Mapbox default altitude
	// const DEFAULT_ALTITUDE = 1.5;

	function zoomToScale(zoom) {
	  return Math.pow(2, zoom);
	}

	/**
	 * Calculate distance scales in meters around current lat/lon, both for
	 * degrees and pixels.
	 * In mercator projection mode, the distance scales vary significantly
	 * with latitude.
	 */
	function getDistanceScales(options) {
	  let {
	    latitude = 0, zoom = 1, scale, highPrecision = false
	  } = options;

	  // Calculate scale from zoom if not provided
	  scale = scale !== undefined ? scale : zoomToScale(zoom);

	  const result = {};
	  const worldSize = TILE_SIZE * scale;
	  const latCosine = Math.cos(latitude * DEGREES_TO_RADIANS);

	  /**
	   * Number of pixels occupied by one degree longitude around current lat/lon:
	     pixelsPerDegreeX = d(lngLatToWorld([lng, lat])[0])/d(lng)
	        = scale * TILE_SIZE * DEGREES_TO_RADIANS / (2 * PI)
	      pixelsPerDegreeY = d(lngLatToWorld([lng, lat])[1])/d(lat)
	        = -scale * TILE_SIZE * DEGREES_TO_RADIANS / cos(lat * DEGREES_TO_RADIANS)  / (2 * PI)
	    */
	  const pixelsPerDegreeX = worldSize / 360;
	  const pixelsPerDegreeY = pixelsPerDegreeX / latCosine;

	  /**
	   * Number of pixels occupied by one meter around current lat/lon:
	   */
	  const altPixelsPerMeter = worldSize / EARTH_CIRCUMFERENCE / latCosine;

	  /**
	   * LngLat: longitude -> east and latitude -> north (bottom left)
	   * UTM meter offset: x -> east and y -> north (bottom left)
	   * World space: x -> east and y -> south (top left)
	   *
	   * Y needs to be flipped when converting delta degree/meter to delta pixels
	   */
	  result.pixelsPerMeter = [altPixelsPerMeter, -altPixelsPerMeter, altPixelsPerMeter];
	  result.metersPerPixel = [1 / altPixelsPerMeter, -1 / altPixelsPerMeter, 1 / altPixelsPerMeter];

	  result.pixelsPerDegree = [pixelsPerDegreeX, -pixelsPerDegreeY, altPixelsPerMeter];
	  result.degreesPerPixel = [1 / pixelsPerDegreeX, -1 / pixelsPerDegreeY, 1 / altPixelsPerMeter];

	  /**
	   * Taylor series 2nd order for 1/latCosine
	     f'(a) * (x - a)
	        = d(1/cos(lat * DEGREES_TO_RADIANS))/d(lat) * dLat
	        = DEGREES_TO_RADIANS * tan(lat * DEGREES_TO_RADIANS) / cos(lat * DEGREES_TO_RADIANS) * dLat
	    */
	  if (highPrecision) {
	    const latCosine2 = DEGREES_TO_RADIANS * Math.tan(latitude * DEGREES_TO_RADIANS) / latCosine;
	    const pixelsPerDegreeY2 = pixelsPerDegreeX * latCosine2 / 2;

	    const altPixelsPerDegree2 = worldSize / EARTH_CIRCUMFERENCE * latCosine2;
	    const altPixelsPerMeter2 = altPixelsPerDegree2 / pixelsPerDegreeY * altPixelsPerMeter;

	    result.pixelsPerDegree2 = [0, -pixelsPerDegreeY2, altPixelsPerDegree2];
	    result.pixelsPerMeter2 = [altPixelsPerMeter2, 0, altPixelsPerMeter2];
	  }

	  // Main results, used for converting meters to latlng deltas and scaling offsets
	  return result;
	}

	class gcj02TileLayer {

	    constructor(layerId, url, options) {
	        this.id = layerId;
	        this.type = "custom";
	        this.renderingMode = '2d';
	        this.url = url;

	        this.options = {

	            //服务器编号
	            subdomains: null,

	            //在瓦片加载完成后，是否主动去更新渲染。
	            //如果是包含透明区域的瓦片，建议设置为false，如影像注记瓦片。
	            //当瓦片因为网络原因，在render方法不再主动后，才加载完成，这时去主动调用render方法，
	            //其中用于实现注记半透明效果的阿尔法混合会不起作用，瓦片透明区域会变成不透明的白色
	            imgLoadRender: true,

	            minZoom: 3,
	            maxZoom: 18
	        };
	        setOptions(this, options); //合并属性

	        //着色器程序 
	        this.program;

	        //存放当前显示的瓦片
	        this.showTiles = [];

	        //存放所有加载过的瓦片
	        this.tileCache = {};

	        //存放瓦片号对应的经纬度
	        this.gridCache = {};

	        //记录渲染时的变换矩阵。
	        //如果瓦片因为网速慢，在渲染完成后才加载过来，可以使用这个矩阵主动更新渲染
	        this.matrix;

	        this.map;
	    }

	    onAdd(map, gl) {
	        this.map = map;

	        // 参考：https://github.com/xiaoiver/custom-mapbox-layer/blob/master/src/shaders/project.glsl
	        var vertexSource = "" + "uniform mat4 u_matrix;" + "attribute vec2 a_pos;" + "attribute vec2 a_TextCoord;" + "varying vec2 v_TextCoord;" + "const float TILE_SIZE = 512.0;" + "const float PI = 3.1415926536;" + "const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);" + "uniform float u_project_scale;" + "uniform bool u_is_offset;" + "uniform vec3 u_pixels_per_degree;" + "uniform vec3 u_pixels_per_degree2;" + "uniform vec3 u_pixels_per_meter;" + "uniform vec2 u_viewport_center;" + "uniform vec4 u_viewport_center_projection;" + "uniform vec2 u_viewport_size;" + "float project_scale(float meters) {" + "    return meters * u_pixels_per_meter.z;" + "}" + "vec3 project_scale(vec3 position) {" + "    return position * u_pixels_per_meter;" + "}" + "vec2 project_mercator(vec2 lnglat) {" + "    float x = lnglat.x;" + "    return vec2(" + "    radians(x) + PI, PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))" + "    );" + "}" + "vec4 project_offset(vec4 offset) {" + "    float dy = offset.y;" + "    dy = clamp(dy, -1., 1.);" + "    vec3 pixels_per_unit = u_pixels_per_degree + u_pixels_per_degree2 * dy;" + "    return vec4(offset.xyz * pixels_per_unit, offset.w);" + "}" + "vec4 project_position(vec4 position) {" + "    if (u_is_offset) {" + "        float X = position.x - u_viewport_center.x;" + "        float Y = position.y - u_viewport_center.y;" + "        return project_offset(vec4(X, Y, position.z, position.w));" + "    }" + "    else {" + "        return vec4(" + "        project_mercator(position.xy) * WORLD_SCALE * u_project_scale, project_scale(position.z), position.w" + "        );" + "    }" + "}" + "vec4 project_to_clipping_space(vec3 position) {" + "    vec4 project_pos = project_position(vec4(position, 1.0));" + "    return u_matrix * project_pos + u_viewport_center_projection;" + "}" + "void main() {" + "   vec4 project_pos = project_position(vec4(a_pos, 0.0, 1.0));" + "   gl_Position = u_matrix * project_pos + u_viewport_center_projection;" + "   v_TextCoord = a_TextCoord;" + "}";

	        var fragmentSource = "" + "precision mediump float;" + "uniform sampler2D u_Sampler; " + "varying vec2 v_TextCoord; " + "void main() {" + "   gl_FragColor = texture2D(u_Sampler, v_TextCoord);" +
	        // "    gl_FragColor = vec4(1.0, 0.0, 0.0, 0.5);" +
	        "}";

	        //初始化顶点着色器
	        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	        gl.shaderSource(vertexShader, vertexSource);
	        gl.compileShader(vertexShader);
	        //初始化片元着色器
	        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	        gl.shaderSource(fragmentShader, fragmentSource);
	        gl.compileShader(fragmentShader);
	        //初始化着色器程序
	        this.program = gl.createProgram();
	        gl.attachShader(this.program, vertexShader);
	        gl.attachShader(this.program, fragmentShader);
	        gl.linkProgram(this.program);

	        //获取顶点位置变量
	        this.a_Pos = gl.getAttribLocation(this.program, "a_pos");
	        this.a_TextCoord = gl.getAttribLocation(this.program, 'a_TextCoord');

	        map.on('move', () => {
	            this.update(gl, map);
	        });
	        this.update(gl, map);
	    }

	    update(gl, map) {
	        var center = map.getCenter();
	        var zoom = parseInt(map.getZoom()) + 1;
	        var bounds = map.getBounds();

	        //把当前显示范围做偏移，后面加载瓦片时会再偏移回来
	        //如果不这样做的话，大比例尺时，瓦片偏移后，屏幕边缘会有空白区域
	        var northWest = gps84_To_gcj02(bounds.getNorthWest());
	        var southEast = gps84_To_gcj02(bounds.getSouthEast());

	        //算出当前范围的瓦片编号
	        var minTile = lonLatToTileNumbers(northWest.lng, northWest.lat, zoom);
	        var maxTile = lonLatToTileNumbers(southEast.lng, southEast.lat, zoom);
	        var currentTiles = [];
	        for (var x = minTile[0]; x <= maxTile[0]; x++) {
	            for (var y = minTile[1]; y <= maxTile[1]; y++) {
	                var xyz = {
	                    x: x,
	                    y: y,
	                    z: zoom
	                };
	                currentTiles.push(xyz);

	                //把瓦片号对应的经纬度缓存起来，
	                //存起来是因为贴纹理时需要瓦片4个角的经纬度，这样可以避免重复计算
	                //行和列向外多计算一个瓦片数，这样保证瓦片4个角都有经纬度可以取到
	                this.addGridCache(xyz, 0, 0);
	                if (x === maxTile[0]) this.addGridCache(xyz, 1, 0);
	                if (y === maxTile[1]) this.addGridCache(xyz, 0, 1);
	                if (x === maxTile[0] && y === maxTile[1]) this.addGridCache(xyz, 1, 1);
	            }
	        }

	        //瓦片设置为从中间向周边的排序
	        var centerTile = lonLatToTileNumbers(center.lng, center.lat, zoom); //计算中心点所在的瓦片号
	        currentTiles.sort((a, b) => {
	            return this.tileDistance(a, centerTile) - this.tileDistance(b, centerTile);
	        });

	        //加载瓦片
	        this.showTiles = [];
	        for (var xyz of currentTiles) {
	            //走缓存或新加载
	            if (this.tileCache[this.createTileKey(xyz)]) {
	                this.showTiles.push(this.tileCache[this.createTileKey(xyz)]);
	            } else {
	                var tile = this.createTile(gl, xyz);
	                this.showTiles.push(tile);
	                this.tileCache[this.createTileKey(xyz)] = tile;
	            }
	        }
	    }

	    //缓存瓦片号对应的经纬度
	    addGridCache(xyz, xPlus, yPlus) {
	        var key = this.createTileKey(xyz.x + xPlus, xyz.y + yPlus, xyz.z);
	        if (!this.gridCache[key]) {
	            this.gridCache[key] = gcj02_To_gps84(tileNumbersToLonLat(xyz.x + xPlus, xyz.y + yPlus, xyz.z));
	        }
	    }

	    //计算两个瓦片编号的距离
	    tileDistance(tile1, tile2) {
	        //计算直角三角形斜边长度，c（斜边）=√（a²+b²）。（a，b为两直角边）
	        return Math.sqrt(Math.pow(tile1.x - tile2[0], 2) + Math.pow(tile1.y - tile2[1], 2));
	    }

	    //创建瓦片id
	    createTileKey(xyz, y, z) {
	        if (xyz instanceof Object) {
	            return xyz.z + '/' + xyz.x + '/' + xyz.y;
	        } else {
	            var x = xyz;
	            return z + '/' + x + '/' + y;
	        }
	    }

	    //创建瓦片
	    createTile(gl, xyz) {
	        //替换请求地址中的变量
	        var _url = template(this.url, {
	            s: this.options.subdomains[Math.abs(xyz.x + xyz.y) % this.options.subdomains.length],
	            x: xyz.x,
	            y: xyz.y,
	            z: xyz.z
	        });

	        var tile = {
	            xyz: xyz
	        };

	        //瓦片编号转经纬度，并进行偏移
	        var leftTop = this.gridCache[this.createTileKey(xyz)];
	        var rightTop = this.gridCache[this.createTileKey(xyz.x + 1, xyz.y, xyz.z)];
	        var leftBottom = this.gridCache[this.createTileKey(xyz.x, xyz.y + 1, xyz.z)];
	        var rightBottom = this.gridCache[this.createTileKey(xyz.x + 1, xyz.y + 1, xyz.z)];

	        //顶点坐标+纹理坐标
	        var attrData = new Float32Array([leftTop.lng, leftTop.lat, 0.0, 1.0, leftBottom.lng, leftBottom.lat, 0.0, 0.0, rightTop.lng, rightTop.lat, 1.0, 1.0, rightBottom.lng, rightBottom.lat, 1.0, 0.0]);
	        var FSIZE = attrData.BYTES_PER_ELEMENT;
	        //创建缓冲区并传入数据
	        var buffer = gl.createBuffer();
	        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	        gl.bufferData(gl.ARRAY_BUFFER, attrData, gl.STATIC_DRAW);
	        tile.buffer = buffer;
	        //从缓冲区中获取顶点数据的参数
	        tile.PosParam = {
	            size: 2,
	            stride: FSIZE * 4,
	            offset: 0
	            //从缓冲区中获取纹理数据的参数
	        };tile.TextCoordParam = {
	            size: 2,
	            stride: FSIZE * 4,
	            offset: FSIZE * 2

	            //加载瓦片
	        };var img = new Image();
	        img.onload = () => {
	            // 创建纹理对象
	            tile.texture = gl.createTexture();
	            //向target绑定纹理对象
	            gl.bindTexture(gl.TEXTURE_2D, tile.texture);
	            //对纹理进行Y轴反转
	            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
	            //配置纹理图像
	            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

	            tile.isLoad = true;

	            //瓦片加载完成后主动绘制
	            if (this.options.imgLoadRender) {
	                this.render(gl, this.matrix);
	            }
	        };
	        img.crossOrigin = true;
	        img.src = _url;

	        return tile;
	    }

	    //渲染
	    render(gl, matrix) {

	        if (this.map.getZoom() < this.options.minZoom || this.map.getZoom() > this.options.maxZoom) return;

	        //记录变换矩阵，用于瓦片加载后主动绘制
	        this.matrix = matrix;

	        //应用着色程序
	        //必须写到这里，不能写到onAdd中，不然gl中的着色程序可能不是上面写的，会导致下面的变量获取不到
	        gl.useProgram(this.program);

	        for (var tile of this.showTiles) {
	            if (!tile.isLoad) continue;

	            //向target绑定纹理对象
	            gl.bindTexture(gl.TEXTURE_2D, tile.texture);
	            //开启0号纹理单元
	            gl.activeTexture(gl.TEXTURE0);
	            //配置纹理参数
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
	            // 获取纹理的存储位置
	            var u_Sampler = gl.getUniformLocation(this.program, 'u_Sampler');
	            //将0号纹理传递给着色器
	            gl.uniform1i(u_Sampler, 0);

	            gl.bindBuffer(gl.ARRAY_BUFFER, tile.buffer);
	            //设置从缓冲区获取顶点数据的规则
	            gl.vertexAttribPointer(this.a_Pos, tile.PosParam.size, gl.FLOAT, false, tile.PosParam.stride, tile.PosParam.offset);
	            gl.vertexAttribPointer(this.a_TextCoord, tile.TextCoordParam.size, gl.FLOAT, false, tile.TextCoordParam.stride, tile.TextCoordParam.offset);
	            //激活顶点数据缓冲区
	            gl.enableVertexAttribArray(this.a_Pos);
	            gl.enableVertexAttribArray(this.a_TextCoord);

	            // 设置位置的顶点参数
	            this.setVertex(gl);

	            //开启阿尔法混合，实现注记半透明效果
	            gl.enable(gl.BLEND);
	            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	            //绘制图形
	            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	        }
	    }

	    // 设置位置的顶点参数
	    //参考：https://github.com/xiaoiver/custom-mapbox-layer/blob/master/src/layers/PointCloudLayer2.ts
	    setVertex(gl) {
	        const currentZoomLevel = this.map.getZoom();
	        const bearing = this.map.getBearing();
	        const pitch = this.map.getPitch();
	        const center = this.map.getCenter();

	        const viewport = new WebMercatorViewport({
	            // width: gl.drawingBufferWidth*1.11,
	            // height: gl.drawingBufferHeight*1.11,
	            width: gl.drawingBufferWidth,
	            height: gl.drawingBufferHeight,

	            longitude: center.lng,
	            latitude: center.lat,
	            zoom: currentZoomLevel,
	            pitch,
	            bearing
	        });

	        // @ts-ignore
	        const { viewProjectionMatrix, projectionMatrix, viewMatrix, viewMatrixUncentered } = viewport;

	        let drawParams = {
	            // @ts-ignore
	            'u_matrix': viewProjectionMatrix,
	            'u_point_size': this.pointSize,
	            'u_is_offset': false,
	            'u_pixels_per_degree': [0, 0, 0],
	            'u_pixels_per_degree2': [0, 0, 0],
	            'u_viewport_center': [0, 0],
	            'u_pixels_per_meter': [0, 0, 0],
	            'u_project_scale': zoomToScale(currentZoomLevel),
	            'u_viewport_center_projection': [0, 0, 0, 0]
	        };

	        if (currentZoomLevel > 12) {
	            const { pixelsPerDegree, pixelsPerDegree2 } = getDistanceScales({
	                longitude: center.lng,
	                latitude: center.lat,
	                zoom: currentZoomLevel,
	                highPrecision: true
	            });

	            const positionPixels = viewport.projectFlat([Math.fround(center.lng), Math.fround(center.lat)], Math.pow(2, currentZoomLevel));

	            const projectionCenter = transformMat4([], [positionPixels[0], positionPixels[1], 0.0, 1.0], viewProjectionMatrix);

	            // Always apply uncentered projection matrix if available (shader adds center)
	            let viewMatrix2 = viewMatrixUncentered || viewMatrix;

	            // Zero out 4th coordinate ("after" model matrix) - avoids further translations
	            // viewMatrix = new Matrix4(viewMatrixUncentered || viewMatrix)
	            //   .multiplyRight(VECTOR_TO_POINT_MATRIX);
	            let viewProjectionMatrix2 = multiply([], projectionMatrix, viewMatrix2);
	            const VECTOR_TO_POINT_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
	            viewProjectionMatrix2 = multiply([], viewProjectionMatrix2, VECTOR_TO_POINT_MATRIX);

	            drawParams['u_matrix'] = viewProjectionMatrix2;
	            drawParams['u_is_offset'] = true;
	            drawParams['u_viewport_center'] = [Math.fround(center.lng), Math.fround(center.lat)];
	            // @ts-ignore
	            drawParams['u_viewport_center_projection'] = projectionCenter;
	            drawParams['u_pixels_per_degree'] = pixelsPerDegree && pixelsPerDegree.map(p => Math.fround(p));
	            drawParams['u_pixels_per_degree2'] = pixelsPerDegree2 && pixelsPerDegree2.map(p => Math.fround(p));
	        }

	        gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, drawParams['u_matrix']);

	        gl.uniform1f(gl.getUniformLocation(this.program, "u_project_scale"), drawParams['u_project_scale']);
	        gl.uniform1i(gl.getUniformLocation(this.program, "u_is_offset"), drawParams['u_is_offset'] ? 1 : 0);
	        gl.uniform3fv(gl.getUniformLocation(this.program, "u_pixels_per_degree"), drawParams['u_pixels_per_degree']);
	        gl.uniform3fv(gl.getUniformLocation(this.program, "u_pixels_per_degree2"), drawParams['u_pixels_per_degree2']);
	        gl.uniform3fv(gl.getUniformLocation(this.program, "u_pixels_per_meter"), drawParams['u_pixels_per_meter']);
	        gl.uniform2fv(gl.getUniformLocation(this.program, "u_viewport_center"), drawParams['u_viewport_center']);
	        gl.uniform4fv(gl.getUniformLocation(this.program, "u_viewport_center_projection"), drawParams['u_viewport_center_projection']);
	    }

	}

	return gcj02TileLayer;

})));
//# sourceMappingURL=gcj02TileLayer-src.js.map
