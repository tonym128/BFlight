var Module = typeof Module !== "undefined" ? Module : {};

if (!Module.expectedDataFileDownloads) {
 Module.expectedDataFileDownloads = 0;
 Module.finishedDataFileDownloads = 0;
}

Module.expectedDataFileDownloads++;

(function() {
 var loadPackage = function(metadata) {
  var PACKAGE_PATH;
  if (typeof window === "object") {
   PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/");
  } else if (typeof location !== "undefined") {
   PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
  } else {
   throw "using preloaded data can only be done on a web page or in a web worker";
  }
  var PACKAGE_NAME = "index.data";
  var REMOTE_PACKAGE_BASE = "index.data";
  if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
   Module["locateFile"] = Module["locateFilePackage"];
   err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)");
  }
  var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
  var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
  var PACKAGE_UUID = metadata.package_uuid;
  function fetchRemotePackage(packageName, packageSize, callback, errback) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", packageName, true);
   xhr.responseType = "arraybuffer";
   xhr.onprogress = function(event) {
    var url = packageName;
    var size = packageSize;
    if (event.total) size = event.total;
    if (event.loaded) {
     if (!xhr.addedTotal) {
      xhr.addedTotal = true;
      if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
      Module.dataFileDownloads[url] = {
       loaded: event.loaded,
       total: size
      };
     } else {
      Module.dataFileDownloads[url].loaded = event.loaded;
     }
     var total = 0;
     var loaded = 0;
     var num = 0;
     for (var download in Module.dataFileDownloads) {
      var data = Module.dataFileDownloads[download];
      total += data.total;
      loaded += data.loaded;
      num++;
     }
     total = Math.ceil(total * Module.expectedDataFileDownloads / num);
     if (Module["setStatus"]) Module["setStatus"]("Downloading data... (" + loaded + "/" + total + ")");
    } else if (!Module.dataFileDownloads) {
     if (Module["setStatus"]) Module["setStatus"]("Downloading data...");
    }
   };
   xhr.onerror = function(event) {
    throw new Error("NetworkError for: " + packageName);
   };
   xhr.onload = function(event) {
    if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || xhr.status == 0 && xhr.response) {
     var packageData = xhr.response;
     callback(packageData);
    } else {
     throw new Error(xhr.statusText + " : " + xhr.responseURL);
    }
   };
   xhr.send(null);
  }
  function handleError(error) {
   console.error("package error:", error);
  }
  var fetchedCallback = null;
  var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
  if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
   if (fetchedCallback) {
    fetchedCallback(data);
    fetchedCallback = null;
   } else {
    fetched = data;
   }
  }, handleError);
  function runWithFS() {
   function assert(check, msg) {
    if (!check) throw msg + new Error().stack;
   }
   Module["FS_createPath"]("/", "data", true, true);
   function DataRequest(start, end, audio) {
    this.start = start;
    this.end = end;
    this.audio = audio;
   }
   DataRequest.prototype = {
    requests: {},
    open: function(mode, name) {
     this.name = name;
     this.requests[name] = this;
     Module["addRunDependency"]("fp " + this.name);
    },
    send: function() {},
    onload: function() {
     var byteArray = this.byteArray.subarray(this.start, this.end);
     this.finish(byteArray);
    },
    finish: function(byteArray) {
     var that = this;
     Module["FS_createDataFile"](this.name, null, byteArray, true, true, true);
     Module["removeRunDependency"]("fp " + that.name);
     this.requests[this.name] = null;
    }
   };
   var files = metadata.files;
   for (var i = 0; i < files.length; ++i) {
    new DataRequest(files[i].start, files[i].end, files[i].audio).open("GET", files[i].filename);
   }
   function processPackageData(arrayBuffer) {
    Module.finishedDataFileDownloads++;
    assert(arrayBuffer, "Loading data file failed.");
    assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
    var byteArray = new Uint8Array(arrayBuffer);
    var ptr = Module["getMemory"](byteArray.length);
    Module["HEAPU8"].set(byteArray, ptr);
    DataRequest.prototype.byteArray = Module["HEAPU8"].subarray(ptr, ptr + byteArray.length);
    var files = metadata.files;
    for (var i = 0; i < files.length; ++i) {
     DataRequest.prototype.requests[files[i].filename].onload();
    }
    Module["removeRunDependency"]("datafile_index.data");
   }
   Module["addRunDependency"]("datafile_index.data");
   if (!Module.preloadResults) Module.preloadResults = {};
   Module.preloadResults[PACKAGE_NAME] = {
    fromCache: false
   };
   if (fetched) {
    processPackageData(fetched);
    fetched = null;
   } else {
    fetchedCallback = processPackageData;
   }
  }
  if (Module["calledRun"]) {
   runWithFS();
  } else {
   if (!Module["preRun"]) Module["preRun"] = [];
   Module["preRun"].push(runWithFS);
  }
 };
 loadPackage({
  "files": [ {
   "start": 0,
   "audio": 1,
   "end": 102758,
   "filename": "/data/startup.wav"
  }, {
   "start": 102758,
   "audio": 1,
   "end": 120864,
   "filename": "/data/cloud2.wav"
  }, {
   "start": 120864,
   "audio": 1,
   "end": 151038,
   "filename": "/data/walking.wav"
  }, {
   "start": 151038,
   "audio": 1,
   "end": 185734,
   "filename": "/data/carStart.wav"
  } ],
  "remote_package_size": 185734,
  "package_uuid": "00b3473e-9172-4fc3-aee2-3aeab08479c5"
 });
})();

var moduleOverrides = {};

var key;

for (key in Module) {
 if (Module.hasOwnProperty(key)) {
  moduleOverrides[key] = Module[key];
 }
}

Module["arguments"] = [];

Module["thisProgram"] = "./this.program";

Module["quit"] = function(status, toThrow) {
 throw toThrow;
};

Module["preRun"] = [];

Module["postRun"] = [];

var ENVIRONMENT_IS_WEB = false;

var ENVIRONMENT_IS_WORKER = false;

var ENVIRONMENT_IS_NODE = false;

var ENVIRONMENT_IS_SHELL = false;

ENVIRONMENT_IS_WEB = typeof window === "object";

ENVIRONMENT_IS_WORKER = typeof importScripts === "function";

ENVIRONMENT_IS_NODE = typeof process === "object" && typeof require === "function" && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;

ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

var scriptDirectory = "";

function locateFile(path) {
 if (Module["locateFile"]) {
  return Module["locateFile"](path, scriptDirectory);
 } else {
  return scriptDirectory + path;
 }
}

if (ENVIRONMENT_IS_NODE) {
 scriptDirectory = __dirname + "/";
 var nodeFS;
 var nodePath;
 Module["read"] = function shell_read(filename, binary) {
  var ret;
  if (!nodeFS) nodeFS = require("fs");
  if (!nodePath) nodePath = require("path");
  filename = nodePath["normalize"](filename);
  ret = nodeFS["readFileSync"](filename);
  return binary ? ret : ret.toString();
 };
 Module["readBinary"] = function readBinary(filename) {
  var ret = Module["read"](filename, true);
  if (!ret.buffer) {
   ret = new Uint8Array(ret);
  }
  assert(ret.buffer);
  return ret;
 };
 if (process["argv"].length > 1) {
  Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/");
 }
 Module["arguments"] = process["argv"].slice(2);
 if (typeof module !== "undefined") {
  module["exports"] = Module;
 }
 process["on"]("uncaughtException", function(ex) {
  if (!(ex instanceof ExitStatus)) {
   throw ex;
  }
 });
 process["on"]("unhandledRejection", abort);
 Module["quit"] = function(status) {
  process["exit"](status);
 };
 Module["inspect"] = function() {
  return "[Emscripten Module object]";
 };
} else if (ENVIRONMENT_IS_SHELL) {
 if (typeof read != "undefined") {
  Module["read"] = function shell_read(f) {
   return read(f);
  };
 }
 Module["readBinary"] = function readBinary(f) {
  var data;
  if (typeof readbuffer === "function") {
   return new Uint8Array(readbuffer(f));
  }
  data = read(f, "binary");
  assert(typeof data === "object");
  return data;
 };
 if (typeof scriptArgs != "undefined") {
  Module["arguments"] = scriptArgs;
 } else if (typeof arguments != "undefined") {
  Module["arguments"] = arguments;
 }
 if (typeof quit === "function") {
  Module["quit"] = function(status) {
   quit(status);
  };
 }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
 if (ENVIRONMENT_IS_WORKER) {
  scriptDirectory = self.location.href;
 } else if (document.currentScript) {
  scriptDirectory = document.currentScript.src;
 }
 if (scriptDirectory.indexOf("blob:") !== 0) {
  scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1);
 } else {
  scriptDirectory = "";
 }
 Module["read"] = function shell_read(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, false);
  xhr.send(null);
  return xhr.responseText;
 };
 if (ENVIRONMENT_IS_WORKER) {
  Module["readBinary"] = function readBinary(url) {
   var xhr = new XMLHttpRequest();
   xhr.open("GET", url, false);
   xhr.responseType = "arraybuffer";
   xhr.send(null);
   return new Uint8Array(xhr.response);
  };
 }
 Module["readAsync"] = function readAsync(url, onload, onerror) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
   if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
    onload(xhr.response);
    return;
   }
   onerror();
  };
  xhr.onerror = onerror;
  xhr.send(null);
 };
 Module["setWindowTitle"] = function(title) {
  document.title = title;
 };
} else {}

var out = Module["print"] || (typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print : null);

var err = Module["printErr"] || (typeof printErr !== "undefined" ? printErr : typeof console !== "undefined" && console.warn.bind(console) || out);

for (key in moduleOverrides) {
 if (moduleOverrides.hasOwnProperty(key)) {
  Module[key] = moduleOverrides[key];
 }
}

moduleOverrides = undefined;

function dynamicAlloc(size) {
 var ret = HEAP32[DYNAMICTOP_PTR >> 2];
 var end = ret + size + 15 & -16;
 if (end <= _emscripten_get_heap_size()) {
  HEAP32[DYNAMICTOP_PTR >> 2] = end;
 } else {
  return 0;
 }
 return ret;
}

function getNativeTypeSize(type) {
 switch (type) {
 case "i1":
 case "i8":
  return 1;

 case "i16":
  return 2;

 case "i32":
  return 4;

 case "i64":
  return 8;

 case "float":
  return 4;

 case "double":
  return 8;

 default:
  {
   if (type[type.length - 1] === "*") {
    return 4;
   } else if (type[0] === "i") {
    var bits = parseInt(type.substr(1));
    assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
    return bits / 8;
   } else {
    return 0;
   }
  }
 }
}

function warnOnce(text) {
 if (!warnOnce.shown) warnOnce.shown = {};
 if (!warnOnce.shown[text]) {
  warnOnce.shown[text] = 1;
  err(text);
 }
}

var asm2wasmImports = {
 "f64-rem": function(x, y) {
  return x % y;
 },
 "debugger": function() {
  debugger;
 }
};

var functionPointers = new Array(0);

function dynCall(sig, ptr, args) {
 if (args && args.length) {
  return Module["dynCall_" + sig].apply(null, [ ptr ].concat(args));
 } else {
  return Module["dynCall_" + sig].call(null, ptr);
 }
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
 tempRet0 = value;
};

if (typeof WebAssembly !== "object") {
 err("no native wasm support detected");
}

var wasmMemory;

var wasmTable;

var ABORT = false;

var EXITSTATUS = 0;

function assert(condition, text) {
 if (!condition) {
  abort("Assertion failed: " + text);
 }
}

function setValue(ptr, value, type, noSafe) {
 type = type || "i8";
 if (type.charAt(type.length - 1) === "*") type = "i32";
 switch (type) {
 case "i1":
  HEAP8[ptr >> 0] = value;
  break;

 case "i8":
  HEAP8[ptr >> 0] = value;
  break;

 case "i16":
  HEAP16[ptr >> 1] = value;
  break;

 case "i32":
  HEAP32[ptr >> 2] = value;
  break;

 case "i64":
  tempI64 = [ value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[ptr >> 2] = tempI64[0], HEAP32[ptr + 4 >> 2] = tempI64[1];
  break;

 case "float":
  HEAPF32[ptr >> 2] = value;
  break;

 case "double":
  HEAPF64[ptr >> 3] = value;
  break;

 default:
  abort("invalid type for setValue: " + type);
 }
}

var ALLOC_NORMAL = 0;

var ALLOC_NONE = 3;

function allocate(slab, types, allocator, ptr) {
 var zeroinit, size;
 if (typeof slab === "number") {
  zeroinit = true;
  size = slab;
 } else {
  zeroinit = false;
  size = slab.length;
 }
 var singleType = typeof types === "string" ? types : null;
 var ret;
 if (allocator == ALLOC_NONE) {
  ret = ptr;
 } else {
  ret = [ _malloc, stackAlloc, dynamicAlloc ][allocator](Math.max(size, singleType ? 1 : types.length));
 }
 if (zeroinit) {
  var stop;
  ptr = ret;
  assert((ret & 3) == 0);
  stop = ret + (size & ~3);
  for (;ptr < stop; ptr += 4) {
   HEAP32[ptr >> 2] = 0;
  }
  stop = ret + size;
  while (ptr < stop) {
   HEAP8[ptr++ >> 0] = 0;
  }
  return ret;
 }
 if (singleType === "i8") {
  if (slab.subarray || slab.slice) {
   HEAPU8.set(slab, ret);
  } else {
   HEAPU8.set(new Uint8Array(slab), ret);
  }
  return ret;
 }
 var i = 0, type, typeSize, previousType;
 while (i < size) {
  var curr = slab[i];
  type = singleType || types[i];
  if (type === 0) {
   i++;
   continue;
  }
  if (type == "i64") type = "i32";
  setValue(ret + i, curr, type);
  if (previousType !== type) {
   typeSize = getNativeTypeSize(type);
   previousType = type;
  }
  i += typeSize;
 }
 return ret;
}

function getMemory(size) {
 if (!runtimeInitialized) return dynamicAlloc(size);
 return _malloc(size);
}

var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
 var endIdx = idx + maxBytesToRead;
 var endPtr = idx;
 while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;
 if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
  return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
 } else {
  var str = "";
  while (idx < endPtr) {
   var u0 = u8Array[idx++];
   if (!(u0 & 128)) {
    str += String.fromCharCode(u0);
    continue;
   }
   var u1 = u8Array[idx++] & 63;
   if ((u0 & 224) == 192) {
    str += String.fromCharCode((u0 & 31) << 6 | u1);
    continue;
   }
   var u2 = u8Array[idx++] & 63;
   if ((u0 & 240) == 224) {
    u0 = (u0 & 15) << 12 | u1 << 6 | u2;
   } else {
    u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63;
   }
   if (u0 < 65536) {
    str += String.fromCharCode(u0);
   } else {
    var ch = u0 - 65536;
    str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
   }
  }
 }
 return str;
}

function UTF8ToString(ptr, maxBytesToRead) {
 return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
}

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
 if (!(maxBytesToWrite > 0)) return 0;
 var startIdx = outIdx;
 var endIdx = outIdx + maxBytesToWrite - 1;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) {
   var u1 = str.charCodeAt(++i);
   u = 65536 + ((u & 1023) << 10) | u1 & 1023;
  }
  if (u <= 127) {
   if (outIdx >= endIdx) break;
   outU8Array[outIdx++] = u;
  } else if (u <= 2047) {
   if (outIdx + 1 >= endIdx) break;
   outU8Array[outIdx++] = 192 | u >> 6;
   outU8Array[outIdx++] = 128 | u & 63;
  } else if (u <= 65535) {
   if (outIdx + 2 >= endIdx) break;
   outU8Array[outIdx++] = 224 | u >> 12;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  } else {
   if (outIdx + 3 >= endIdx) break;
   outU8Array[outIdx++] = 240 | u >> 18;
   outU8Array[outIdx++] = 128 | u >> 12 & 63;
   outU8Array[outIdx++] = 128 | u >> 6 & 63;
   outU8Array[outIdx++] = 128 | u & 63;
  }
 }
 outU8Array[outIdx] = 0;
 return outIdx - startIdx;
}

function stringToUTF8(str, outPtr, maxBytesToWrite) {
 return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
}

function lengthBytesUTF8(str) {
 var len = 0;
 for (var i = 0; i < str.length; ++i) {
  var u = str.charCodeAt(i);
  if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
  if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4;
 }
 return len;
}

var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

function allocateUTF8(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = _malloc(size);
 if (ret) stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function allocateUTF8OnStack(str) {
 var size = lengthBytesUTF8(str) + 1;
 var ret = stackAlloc(size);
 stringToUTF8Array(str, HEAP8, ret, size);
 return ret;
}

function writeArrayToMemory(array, buffer) {
 HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
 for (var i = 0; i < str.length; ++i) {
  HEAP8[buffer++ >> 0] = str.charCodeAt(i);
 }
 if (!dontAddNull) HEAP8[buffer >> 0] = 0;
}

function demangle(func) {
 return func;
}

function demangleAll(text) {
 var regex = /__Z[\w\d_]+/g;
 return text.replace(regex, function(x) {
  var y = demangle(x);
  return x === y ? x : y + " [" + x + "]";
 });
}

function jsStackTrace() {
 var err = new Error();
 if (!err.stack) {
  try {
   throw new Error(0);
  } catch (e) {
   err = e;
  }
  if (!err.stack) {
   return "(no stack trace available)";
  }
 }
 return err.stack.toString();
}

function stackTrace() {
 var js = jsStackTrace();
 if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
 return demangleAll(js);
}

var WASM_PAGE_SIZE = 65536;

var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

function updateGlobalBufferViews() {
 Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
 Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
 Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
 Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
 Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
 Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
 Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
 Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer);
}

var DYNAMIC_BASE = 5421248, DYNAMICTOP_PTR = 178112;

var TOTAL_STACK = 5242880;

var TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;

if (TOTAL_MEMORY < TOTAL_STACK) err("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");

if (Module["buffer"]) {
 buffer = Module["buffer"];
} else {
 if (typeof WebAssembly === "object" && typeof WebAssembly.Memory === "function") {
  wasmMemory = new WebAssembly.Memory({
   "initial": TOTAL_MEMORY / WASM_PAGE_SIZE,
   "maximum": TOTAL_MEMORY / WASM_PAGE_SIZE
  });
  buffer = wasmMemory.buffer;
 } else {
  buffer = new ArrayBuffer(TOTAL_MEMORY);
 }
 Module["buffer"] = buffer;
}

updateGlobalBufferViews();

HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;

function callRuntimeCallbacks(callbacks) {
 while (callbacks.length > 0) {
  var callback = callbacks.shift();
  if (typeof callback == "function") {
   callback();
   continue;
  }
  var func = callback.func;
  if (typeof func === "number") {
   if (callback.arg === undefined) {
    Module["dynCall_v"](func);
   } else {
    Module["dynCall_vi"](func, callback.arg);
   }
  } else {
   func(callback.arg === undefined ? null : callback.arg);
  }
 }
}

var __ATPRERUN__ = [];

var __ATINIT__ = [];

var __ATMAIN__ = [];

var __ATEXIT__ = [];

var __ATPOSTRUN__ = [];

var runtimeInitialized = false;

var runtimeExited = false;

function preRun() {
 if (Module["preRun"]) {
  if (typeof Module["preRun"] == "function") Module["preRun"] = [ Module["preRun"] ];
  while (Module["preRun"].length) {
   addOnPreRun(Module["preRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPRERUN__);
}

function ensureInitRuntime() {
 if (runtimeInitialized) return;
 runtimeInitialized = true;
 callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
 callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
 callRuntimeCallbacks(__ATEXIT__);
 runtimeExited = true;
}

function postRun() {
 if (Module["postRun"]) {
  if (typeof Module["postRun"] == "function") Module["postRun"] = [ Module["postRun"] ];
  while (Module["postRun"].length) {
   addOnPostRun(Module["postRun"].shift());
  }
 }
 callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
 __ATPRERUN__.unshift(cb);
}

function addOnPostRun(cb) {
 __ATPOSTRUN__.unshift(cb);
}

var Math_abs = Math.abs;

var Math_ceil = Math.ceil;

var Math_floor = Math.floor;

var Math_min = Math.min;

var runDependencies = 0;

var runDependencyWatcher = null;

var dependenciesFulfilled = null;

function getUniqueRunDependency(id) {
 return id;
}

function addRunDependency(id) {
 runDependencies++;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
}

function removeRunDependency(id) {
 runDependencies--;
 if (Module["monitorRunDependencies"]) {
  Module["monitorRunDependencies"](runDependencies);
 }
 if (runDependencies == 0) {
  if (runDependencyWatcher !== null) {
   clearInterval(runDependencyWatcher);
   runDependencyWatcher = null;
  }
  if (dependenciesFulfilled) {
   var callback = dependenciesFulfilled;
   dependenciesFulfilled = null;
   callback();
  }
 }
}

Module["preloadedImages"] = {};

Module["preloadedAudios"] = {};

var dataURIPrefix = "data:application/octet-stream;base64,";

function isDataURI(filename) {
 return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0;
}

var wasmBinaryFile = "index.wasm";

if (!isDataURI(wasmBinaryFile)) {
 wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary() {
 try {
  if (Module["wasmBinary"]) {
   return new Uint8Array(Module["wasmBinary"]);
  }
  if (Module["readBinary"]) {
   return Module["readBinary"](wasmBinaryFile);
  } else {
   throw "both async and sync fetching of the wasm failed";
  }
 } catch (err) {
  abort(err);
 }
}

function getBinaryPromise() {
 if (!Module["wasmBinary"] && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === "function") {
  return fetch(wasmBinaryFile, {
   credentials: "same-origin"
  }).then(function(response) {
   if (!response["ok"]) {
    throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
   }
   return response["arrayBuffer"]();
  }).catch(function() {
   return getBinary();
  });
 }
 return new Promise(function(resolve, reject) {
  resolve(getBinary());
 });
}

function createWasm(env) {
 var info = {
  "env": env,
  "global": {
   "NaN": NaN,
   Infinity: Infinity
  },
  "global.Math": Math,
  "asm2wasm": asm2wasmImports
 };
 function receiveInstance(instance, module) {
  var exports = instance.exports;
  Module["asm"] = exports;
  removeRunDependency("wasm-instantiate");
 }
 addRunDependency("wasm-instantiate");
 if (Module["instantiateWasm"]) {
  try {
   return Module["instantiateWasm"](info, receiveInstance);
  } catch (e) {
   err("Module.instantiateWasm callback failed with error: " + e);
   return false;
  }
 }
 function receiveInstantiatedSource(output) {
  receiveInstance(output["instance"]);
 }
 function instantiateArrayBuffer(receiver) {
  getBinaryPromise().then(function(binary) {
   return WebAssembly.instantiate(binary, info);
  }).then(receiver, function(reason) {
   err("failed to asynchronously prepare wasm: " + reason);
   abort(reason);
  });
 }
 if (!Module["wasmBinary"] && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && typeof fetch === "function") {
  WebAssembly.instantiateStreaming(fetch(wasmBinaryFile, {
   credentials: "same-origin"
  }), info).then(receiveInstantiatedSource, function(reason) {
   err("wasm streaming compile failed: " + reason);
   err("falling back to ArrayBuffer instantiation");
   instantiateArrayBuffer(receiveInstantiatedSource);
  });
 } else {
  instantiateArrayBuffer(receiveInstantiatedSource);
 }
 return {};
}

Module["asm"] = function(global, env, providedBuffer) {
 env["memory"] = wasmMemory;
 env["table"] = wasmTable = new WebAssembly.Table({
  "initial": 1828,
  "maximum": 1828,
  "element": "anyfunc"
 });
 env["__memory_base"] = 1024;
 env["__table_base"] = 0;
 var exports = createWasm(env);
 return exports;
};

var ASM_CONSTS = [ function() {
 return screen.width;
}, function() {
 return screen.height;
}, function($0) {
 if (typeof Module["setWindowTitle"] !== "undefined") {
  Module["setWindowTitle"](UTF8ToString($0));
 }
 return 0;
}, function($0, $1, $2) {
 var w = $0;
 var h = $1;
 var pixels = $2;
 if (!Module["SDL2"]) Module["SDL2"] = {};
 var SDL2 = Module["SDL2"];
 if (SDL2.ctxCanvas !== Module["canvas"]) {
  SDL2.ctx = Module["createContext"](Module["canvas"], false, true);
  SDL2.ctxCanvas = Module["canvas"];
 }
 if (SDL2.w !== w || SDL2.h !== h || SDL2.imageCtx !== SDL2.ctx) {
  SDL2.image = SDL2.ctx.createImageData(w, h);
  SDL2.w = w;
  SDL2.h = h;
  SDL2.imageCtx = SDL2.ctx;
 }
 var data = SDL2.image.data;
 var src = pixels >> 2;
 var dst = 0;
 var num;
 if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
  num = data.length;
  while (dst < num) {
   var val = HEAP32[src];
   data[dst] = val & 255;
   data[dst + 1] = val >> 8 & 255;
   data[dst + 2] = val >> 16 & 255;
   data[dst + 3] = 255;
   src++;
   dst += 4;
  }
 } else {
  if (SDL2.data32Data !== data) {
   SDL2.data32 = new Int32Array(data.buffer);
   SDL2.data8 = new Uint8Array(data.buffer);
  }
  var data32 = SDL2.data32;
  num = data32.length;
  data32.set(HEAP32.subarray(src, src + num));
  var data8 = SDL2.data8;
  var i = 3;
  var j = i + 4 * num;
  if (num % 8 == 0) {
   while (i < j) {
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
    data8[i] = 255;
    i = i + 4 | 0;
   }
  } else {
   while (i < j) {
    data8[i] = 255;
    i = i + 4 | 0;
   }
  }
 }
 SDL2.ctx.putImageData(SDL2.image, 0, 0);
 return 0;
}, function($0, $1, $2, $3, $4) {
 var w = $0;
 var h = $1;
 var hot_x = $2;
 var hot_y = $3;
 var pixels = $4;
 var canvas = document.createElement("canvas");
 canvas.width = w;
 canvas.height = h;
 var ctx = canvas.getContext("2d");
 var image = ctx.createImageData(w, h);
 var data = image.data;
 var src = pixels >> 2;
 var dst = 0;
 var num;
 if (typeof CanvasPixelArray !== "undefined" && data instanceof CanvasPixelArray) {
  num = data.length;
  while (dst < num) {
   var val = HEAP32[src];
   data[dst] = val & 255;
   data[dst + 1] = val >> 8 & 255;
   data[dst + 2] = val >> 16 & 255;
   data[dst + 3] = val >> 24 & 255;
   src++;
   dst += 4;
  }
 } else {
  var data32 = new Int32Array(data.buffer);
  num = data32.length;
  data32.set(HEAP32.subarray(src, src + num));
 }
 ctx.putImageData(image, 0, 0);
 var url = hot_x === 0 && hot_y === 0 ? "url(" + canvas.toDataURL() + "), auto" : "url(" + canvas.toDataURL() + ") " + hot_x + " " + hot_y + ", auto";
 var urlBuf = _malloc(url.length + 1);
 stringToUTF8(url, urlBuf, url.length + 1);
 return urlBuf;
}, function($0) {
 if (Module["canvas"]) {
  Module["canvas"].style["cursor"] = UTF8ToString($0);
 }
 return 0;
}, function() {
 if (Module["canvas"]) {
  Module["canvas"].style["cursor"] = "none";
 }
}, function() {
 if (typeof AudioContext !== "undefined") {
  return 1;
 } else if (typeof webkitAudioContext !== "undefined") {
  return 1;
 }
 return 0;
}, function() {
 if (typeof navigator.mediaDevices !== "undefined" && typeof navigator.mediaDevices.getUserMedia !== "undefined") {
  return 1;
 } else if (typeof navigator.webkitGetUserMedia !== "undefined") {
  return 1;
 }
 return 0;
}, function($0) {
 if (typeof Module["SDL2"] === "undefined") {
  Module["SDL2"] = {};
 }
 var SDL2 = Module["SDL2"];
 if (!$0) {
  SDL2.audio = {};
 } else {
  SDL2.capture = {};
 }
 if (!SDL2.audioContext) {
  if (typeof AudioContext !== "undefined") {
   SDL2.audioContext = new AudioContext();
  } else if (typeof webkitAudioContext !== "undefined") {
   SDL2.audioContext = new webkitAudioContext();
  }
 }
 return SDL2.audioContext === undefined ? -1 : 0;
}, function() {
 var SDL2 = Module["SDL2"];
 return SDL2.audioContext.sampleRate;
}, function($0, $1, $2, $3) {
 var SDL2 = Module["SDL2"];
 var have_microphone = function(stream) {
  if (SDL2.capture.silenceTimer !== undefined) {
   clearTimeout(SDL2.capture.silenceTimer);
   SDL2.capture.silenceTimer = undefined;
  }
  SDL2.capture.mediaStreamNode = SDL2.audioContext.createMediaStreamSource(stream);
  SDL2.capture.scriptProcessorNode = SDL2.audioContext.createScriptProcessor($1, $0, 1);
  SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {
   if (SDL2 === undefined || SDL2.capture === undefined) {
    return;
   }
   audioProcessingEvent.outputBuffer.getChannelData(0).fill(0);
   SDL2.capture.currentCaptureBuffer = audioProcessingEvent.inputBuffer;
   dynCall("vi", $2, [ $3 ]);
  };
  SDL2.capture.mediaStreamNode.connect(SDL2.capture.scriptProcessorNode);
  SDL2.capture.scriptProcessorNode.connect(SDL2.audioContext.destination);
  SDL2.capture.stream = stream;
 };
 var no_microphone = function(error) {};
 SDL2.capture.silenceBuffer = SDL2.audioContext.createBuffer($0, $1, SDL2.audioContext.sampleRate);
 SDL2.capture.silenceBuffer.getChannelData(0).fill(0);
 var silence_callback = function() {
  SDL2.capture.currentCaptureBuffer = SDL2.capture.silenceBuffer;
  dynCall("vi", $2, [ $3 ]);
 };
 SDL2.capture.silenceTimer = setTimeout(silence_callback, $1 / SDL2.audioContext.sampleRate * 1e3);
 if (navigator.mediaDevices !== undefined && navigator.mediaDevices.getUserMedia !== undefined) {
  navigator.mediaDevices.getUserMedia({
   audio: true,
   video: false
  }).then(have_microphone).catch(no_microphone);
 } else if (navigator.webkitGetUserMedia !== undefined) {
  navigator.webkitGetUserMedia({
   audio: true,
   video: false
  }, have_microphone, no_microphone);
 }
}, function($0, $1, $2, $3) {
 var SDL2 = Module["SDL2"];
 SDL2.audio.scriptProcessorNode = SDL2.audioContext["createScriptProcessor"]($1, 0, $0);
 SDL2.audio.scriptProcessorNode["onaudioprocess"] = function(e) {
  if (SDL2 === undefined || SDL2.audio === undefined) {
   return;
  }
  SDL2.audio.currentOutputBuffer = e["outputBuffer"];
  dynCall("vi", $2, [ $3 ]);
 };
 SDL2.audio.scriptProcessorNode["connect"](SDL2.audioContext["destination"]);
}, function($0) {
 var SDL2 = Module["SDL2"];
 if ($0) {
  if (SDL2.capture.silenceTimer !== undefined) {
   clearTimeout(SDL2.capture.silenceTimer);
  }
  if (SDL2.capture.stream !== undefined) {
   var tracks = SDL2.capture.stream.getAudioTracks();
   for (var i = 0; i < tracks.length; i++) {
    SDL2.capture.stream.removeTrack(tracks[i]);
   }
   SDL2.capture.stream = undefined;
  }
  if (SDL2.capture.scriptProcessorNode !== undefined) {
   SDL2.capture.scriptProcessorNode.onaudioprocess = function(audioProcessingEvent) {};
   SDL2.capture.scriptProcessorNode.disconnect();
   SDL2.capture.scriptProcessorNode = undefined;
  }
  if (SDL2.capture.mediaStreamNode !== undefined) {
   SDL2.capture.mediaStreamNode.disconnect();
   SDL2.capture.mediaStreamNode = undefined;
  }
  if (SDL2.capture.silenceBuffer !== undefined) {
   SDL2.capture.silenceBuffer = undefined;
  }
  SDL2.capture = undefined;
 } else {
  if (SDL2.audio.scriptProcessorNode != undefined) {
   SDL2.audio.scriptProcessorNode.disconnect();
   SDL2.audio.scriptProcessorNode = undefined;
  }
  SDL2.audio = undefined;
 }
 if (SDL2.audioContext !== undefined && SDL2.audio === undefined && SDL2.capture === undefined) {
  SDL2.audioContext.close();
  SDL2.audioContext = undefined;
 }
}, function($0, $1) {
 var SDL2 = Module["SDL2"];
 var numChannels = SDL2.capture.currentCaptureBuffer.numberOfChannels;
 for (var c = 0; c < numChannels; ++c) {
  var channelData = SDL2.capture.currentCaptureBuffer.getChannelData(c);
  if (channelData.length != $1) {
   throw "Web Audio capture buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
  }
  if (numChannels == 1) {
   for (var j = 0; j < $1; ++j) {
    setValue($0 + j * 4, channelData[j], "float");
   }
  } else {
   for (var j = 0; j < $1; ++j) {
    setValue($0 + (j * numChannels + c) * 4, channelData[j], "float");
   }
  }
 }
}, function($0, $1) {
 var SDL2 = Module["SDL2"];
 var numChannels = SDL2.audio.currentOutputBuffer["numberOfChannels"];
 for (var c = 0; c < numChannels; ++c) {
  var channelData = SDL2.audio.currentOutputBuffer["getChannelData"](c);
  if (channelData.length != $1) {
   throw "Web Audio output buffer length mismatch! Destination size: " + channelData.length + " samples vs expected " + $1 + " samples!";
  }
  for (var j = 0; j < $1; ++j) {
   channelData[j] = HEAPF32[$0 + (j * numChannels + c << 2) >> 2];
  }
 }
}, function($0) {
 var str = UTF8ToString($0) + "\n\n" + "Abort/Retry/Ignore/AlwaysIgnore? [ariA] :";
 var reply = window.prompt(str, "i");
 if (reply === null) {
  reply = "i";
 }
 return allocate(intArrayFromString(reply), "i8", ALLOC_NORMAL);
} ];

function _emscripten_asm_const_i(code) {
 return ASM_CONSTS[code]();
}

function _emscripten_asm_const_ii(code, a0) {
 return ASM_CONSTS[code](a0);
}

function _emscripten_asm_const_iiiii(code, a0, a1, a2, a3) {
 return ASM_CONSTS[code](a0, a1, a2, a3);
}

function _emscripten_asm_const_iii(code, a0, a1) {
 return ASM_CONSTS[code](a0, a1);
}

function _emscripten_asm_const_iiiiii(code, a0, a1, a2, a3, a4) {
 return ASM_CONSTS[code](a0, a1, a2, a3, a4);
}

function _emscripten_asm_const_iiii(code, a0, a1, a2) {
 return ASM_CONSTS[code](a0, a1, a2);
}

__ATINIT__.push({
 func: function() {
  globalCtors();
 }
});

var ENV = {};

function ___buildEnvironment(environ) {
 var MAX_ENV_VALUES = 64;
 var TOTAL_ENV_SIZE = 1024;
 var poolPtr;
 var envPtr;
 if (!___buildEnvironment.called) {
  ___buildEnvironment.called = true;
  ENV["USER"] = ENV["LOGNAME"] = "web_user";
  ENV["PATH"] = "/";
  ENV["PWD"] = "/";
  ENV["HOME"] = "/home/web_user";
  ENV["LANG"] = "C.UTF-8";
  ENV["_"] = Module["thisProgram"];
  poolPtr = getMemory(TOTAL_ENV_SIZE);
  envPtr = getMemory(MAX_ENV_VALUES * 4);
  HEAP32[envPtr >> 2] = poolPtr;
  HEAP32[environ >> 2] = envPtr;
 } else {
  envPtr = HEAP32[environ >> 2];
  poolPtr = HEAP32[envPtr >> 2];
 }
 var strings = [];
 var totalSize = 0;
 for (var key in ENV) {
  if (typeof ENV[key] === "string") {
   var line = key + "=" + ENV[key];
   strings.push(line);
   totalSize += line.length;
  }
 }
 if (totalSize > TOTAL_ENV_SIZE) {
  throw new Error("Environment size exceeded TOTAL_ENV_SIZE!");
 }
 var ptrSize = 4;
 for (var i = 0; i < strings.length; i++) {
  var line = strings[i];
  writeAsciiToMemory(line, poolPtr);
  HEAP32[envPtr + i * ptrSize >> 2] = poolPtr;
  poolPtr += line.length + 1;
 }
 HEAP32[envPtr + strings.length * ptrSize >> 2] = 0;
}

function ___cxa_allocate_exception(size) {
 return _malloc(size);
}

function ___cxa_free_exception(ptr) {
 try {
  return _free(ptr);
 } catch (e) {}
}

var EXCEPTIONS = {
 last: 0,
 caught: [],
 infos: {},
 deAdjust: function(adjusted) {
  if (!adjusted || EXCEPTIONS.infos[adjusted]) return adjusted;
  for (var key in EXCEPTIONS.infos) {
   var ptr = +key;
   var adj = EXCEPTIONS.infos[ptr].adjusted;
   var len = adj.length;
   for (var i = 0; i < len; i++) {
    if (adj[i] === adjusted) {
     return ptr;
    }
   }
  }
  return adjusted;
 },
 addRef: function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount++;
 },
 decRef: function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  assert(info.refcount > 0);
  info.refcount--;
  if (info.refcount === 0 && !info.rethrown) {
   if (info.destructor) {
    Module["dynCall_vi"](info.destructor, ptr);
   }
   delete EXCEPTIONS.infos[ptr];
   ___cxa_free_exception(ptr);
  }
 },
 clearRef: function(ptr) {
  if (!ptr) return;
  var info = EXCEPTIONS.infos[ptr];
  info.refcount = 0;
 }
};

function ___cxa_throw(ptr, type, destructor) {
 EXCEPTIONS.infos[ptr] = {
  ptr: ptr,
  adjusted: [ ptr ],
  type: type,
  destructor: destructor,
  refcount: 0,
  caught: false,
  rethrown: false
 };
 EXCEPTIONS.last = ptr;
 if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
  __ZSt18uncaught_exceptionv.uncaught_exception = 1;
 } else {
  __ZSt18uncaught_exceptionv.uncaught_exception++;
 }
 throw ptr;
}

function ___cxa_uncaught_exception() {
 return !!__ZSt18uncaught_exceptionv.uncaught_exception;
}

function ___lock() {}

function ___setErrNo(value) {
 if (Module["___errno_location"]) HEAP32[Module["___errno_location"]() >> 2] = value;
 return value;
}

function ___map_file(pathname, size) {
 ___setErrNo(1);
 return -1;
}

var PATH = {
 splitPath: function(filename) {
  var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
  return splitPathRe.exec(filename).slice(1);
 },
 normalizeArray: function(parts, allowAboveRoot) {
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
   var last = parts[i];
   if (last === ".") {
    parts.splice(i, 1);
   } else if (last === "..") {
    parts.splice(i, 1);
    up++;
   } else if (up) {
    parts.splice(i, 1);
    up--;
   }
  }
  if (allowAboveRoot) {
   for (;up; up--) {
    parts.unshift("..");
   }
  }
  return parts;
 },
 normalize: function(path) {
  var isAbsolute = path.charAt(0) === "/", trailingSlash = path.substr(-1) === "/";
  path = PATH.normalizeArray(path.split("/").filter(function(p) {
   return !!p;
  }), !isAbsolute).join("/");
  if (!path && !isAbsolute) {
   path = ".";
  }
  if (path && trailingSlash) {
   path += "/";
  }
  return (isAbsolute ? "/" : "") + path;
 },
 dirname: function(path) {
  var result = PATH.splitPath(path), root = result[0], dir = result[1];
  if (!root && !dir) {
   return ".";
  }
  if (dir) {
   dir = dir.substr(0, dir.length - 1);
  }
  return root + dir;
 },
 basename: function(path) {
  if (path === "/") return "/";
  var lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) return path;
  return path.substr(lastSlash + 1);
 },
 extname: function(path) {
  return PATH.splitPath(path)[3];
 },
 join: function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return PATH.normalize(paths.join("/"));
 },
 join2: function(l, r) {
  return PATH.normalize(l + "/" + r);
 },
 resolve: function() {
  var resolvedPath = "", resolvedAbsolute = false;
  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
   var path = i >= 0 ? arguments[i] : FS.cwd();
   if (typeof path !== "string") {
    throw new TypeError("Arguments to path.resolve must be strings");
   } else if (!path) {
    return "";
   }
   resolvedPath = path + "/" + resolvedPath;
   resolvedAbsolute = path.charAt(0) === "/";
  }
  resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter(function(p) {
   return !!p;
  }), !resolvedAbsolute).join("/");
  return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
 },
 relative: function(from, to) {
  from = PATH.resolve(from).substr(1);
  to = PATH.resolve(to).substr(1);
  function trim(arr) {
   var start = 0;
   for (;start < arr.length; start++) {
    if (arr[start] !== "") break;
   }
   var end = arr.length - 1;
   for (;end >= 0; end--) {
    if (arr[end] !== "") break;
   }
   if (start > end) return [];
   return arr.slice(start, end - start + 1);
  }
  var fromParts = trim(from.split("/"));
  var toParts = trim(to.split("/"));
  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
   if (fromParts[i] !== toParts[i]) {
    samePartsLength = i;
    break;
   }
  }
  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
   outputParts.push("..");
  }
  outputParts = outputParts.concat(toParts.slice(samePartsLength));
  return outputParts.join("/");
 }
};

var TTY = {
 ttys: [],
 init: function() {},
 shutdown: function() {},
 register: function(dev, ops) {
  TTY.ttys[dev] = {
   input: [],
   output: [],
   ops: ops
  };
  FS.registerDevice(dev, TTY.stream_ops);
 },
 stream_ops: {
  open: function(stream) {
   var tty = TTY.ttys[stream.node.rdev];
   if (!tty) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   stream.tty = tty;
   stream.seekable = false;
  },
  close: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  flush: function(stream) {
   stream.tty.ops.flush(stream.tty);
  },
  read: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.get_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   var bytesRead = 0;
   for (var i = 0; i < length; i++) {
    var result;
    try {
     result = stream.tty.ops.get_char(stream.tty);
    } catch (e) {
     throw new FS.ErrnoError(ERRNO_CODES.EIO);
    }
    if (result === undefined && bytesRead === 0) {
     throw new FS.ErrnoError(ERRNO_CODES.EAGAIN);
    }
    if (result === null || result === undefined) break;
    bytesRead++;
    buffer[offset + i] = result;
   }
   if (bytesRead) {
    stream.node.timestamp = Date.now();
   }
   return bytesRead;
  },
  write: function(stream, buffer, offset, length, pos) {
   if (!stream.tty || !stream.tty.ops.put_char) {
    throw new FS.ErrnoError(ERRNO_CODES.ENXIO);
   }
   try {
    for (var i = 0; i < length; i++) {
     stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
    }
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES.EIO);
   }
   if (length) {
    stream.node.timestamp = Date.now();
   }
   return i;
  }
 },
 default_tty_ops: {
  get_char: function(tty) {
   if (!tty.input.length) {
    var result = null;
    if (ENVIRONMENT_IS_NODE) {
     var BUFSIZE = 256;
     var buf = new Buffer(BUFSIZE);
     var bytesRead = 0;
     var isPosixPlatform = process.platform != "win32";
     var fd = process.stdin.fd;
     if (isPosixPlatform) {
      var usingDevice = false;
      try {
       fd = fs.openSync("/dev/stdin", "r");
       usingDevice = true;
      } catch (e) {}
     }
     try {
      bytesRead = fs.readSync(fd, buf, 0, BUFSIZE, null);
     } catch (e) {
      if (e.toString().indexOf("EOF") != -1) bytesRead = 0; else throw e;
     }
     if (usingDevice) {
      fs.closeSync(fd);
     }
     if (bytesRead > 0) {
      result = buf.slice(0, bytesRead).toString("utf-8");
     } else {
      result = null;
     }
    } else if (typeof window != "undefined" && typeof window.prompt == "function") {
     result = window.prompt("Input: ");
     if (result !== null) {
      result += "\n";
     }
    } else if (typeof readline == "function") {
     result = readline();
     if (result !== null) {
      result += "\n";
     }
    }
    if (!result) {
     return null;
    }
    tty.input = intArrayFromString(result, true);
   }
   return tty.input.shift();
  },
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    out(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 },
 default_tty1_ops: {
  put_char: function(tty, val) {
   if (val === null || val === 10) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   } else {
    if (val != 0) tty.output.push(val);
   }
  },
  flush: function(tty) {
   if (tty.output && tty.output.length > 0) {
    err(UTF8ArrayToString(tty.output, 0));
    tty.output = [];
   }
  }
 }
};

var MEMFS = {
 ops_table: null,
 mount: function(mount) {
  return MEMFS.createNode(null, "/", 16384 | 511, 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
  if (!MEMFS.ops_table) {
   MEMFS.ops_table = {
    dir: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      lookup: MEMFS.node_ops.lookup,
      mknod: MEMFS.node_ops.mknod,
      rename: MEMFS.node_ops.rename,
      unlink: MEMFS.node_ops.unlink,
      rmdir: MEMFS.node_ops.rmdir,
      readdir: MEMFS.node_ops.readdir,
      symlink: MEMFS.node_ops.symlink
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek
     }
    },
    file: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: {
      llseek: MEMFS.stream_ops.llseek,
      read: MEMFS.stream_ops.read,
      write: MEMFS.stream_ops.write,
      allocate: MEMFS.stream_ops.allocate,
      mmap: MEMFS.stream_ops.mmap,
      msync: MEMFS.stream_ops.msync
     }
    },
    link: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr,
      readlink: MEMFS.node_ops.readlink
     },
     stream: {}
    },
    chrdev: {
     node: {
      getattr: MEMFS.node_ops.getattr,
      setattr: MEMFS.node_ops.setattr
     },
     stream: FS.chrdev_stream_ops
    }
   };
  }
  var node = FS.createNode(parent, name, mode, dev);
  if (FS.isDir(node.mode)) {
   node.node_ops = MEMFS.ops_table.dir.node;
   node.stream_ops = MEMFS.ops_table.dir.stream;
   node.contents = {};
  } else if (FS.isFile(node.mode)) {
   node.node_ops = MEMFS.ops_table.file.node;
   node.stream_ops = MEMFS.ops_table.file.stream;
   node.usedBytes = 0;
   node.contents = null;
  } else if (FS.isLink(node.mode)) {
   node.node_ops = MEMFS.ops_table.link.node;
   node.stream_ops = MEMFS.ops_table.link.stream;
  } else if (FS.isChrdev(node.mode)) {
   node.node_ops = MEMFS.ops_table.chrdev.node;
   node.stream_ops = MEMFS.ops_table.chrdev.stream;
  }
  node.timestamp = Date.now();
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 },
 getFileDataAsRegularArray: function(node) {
  if (node.contents && node.contents.subarray) {
   var arr = [];
   for (var i = 0; i < node.usedBytes; ++i) arr.push(node.contents[i]);
   return arr;
  }
  return node.contents;
 },
 getFileDataAsTypedArray: function(node) {
  if (!node.contents) return new Uint8Array();
  if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes);
  return new Uint8Array(node.contents);
 },
 expandFileStorage: function(node, newCapacity) {
  var prevCapacity = node.contents ? node.contents.length : 0;
  if (prevCapacity >= newCapacity) return;
  var CAPACITY_DOUBLING_MAX = 1024 * 1024;
  newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) | 0);
  if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
  var oldContents = node.contents;
  node.contents = new Uint8Array(newCapacity);
  if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
  return;
 },
 resizeFileStorage: function(node, newSize) {
  if (node.usedBytes == newSize) return;
  if (newSize == 0) {
   node.contents = null;
   node.usedBytes = 0;
   return;
  }
  if (!node.contents || node.contents.subarray) {
   var oldContents = node.contents;
   node.contents = new Uint8Array(new ArrayBuffer(newSize));
   if (oldContents) {
    node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
   }
   node.usedBytes = newSize;
   return;
  }
  if (!node.contents) node.contents = [];
  if (node.contents.length > newSize) node.contents.length = newSize; else while (node.contents.length < newSize) node.contents.push(0);
  node.usedBytes = newSize;
 },
 node_ops: {
  getattr: function(node) {
   var attr = {};
   attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
   attr.ino = node.id;
   attr.mode = node.mode;
   attr.nlink = 1;
   attr.uid = 0;
   attr.gid = 0;
   attr.rdev = node.rdev;
   if (FS.isDir(node.mode)) {
    attr.size = 4096;
   } else if (FS.isFile(node.mode)) {
    attr.size = node.usedBytes;
   } else if (FS.isLink(node.mode)) {
    attr.size = node.link.length;
   } else {
    attr.size = 0;
   }
   attr.atime = new Date(node.timestamp);
   attr.mtime = new Date(node.timestamp);
   attr.ctime = new Date(node.timestamp);
   attr.blksize = 4096;
   attr.blocks = Math.ceil(attr.size / attr.blksize);
   return attr;
  },
  setattr: function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
   if (attr.size !== undefined) {
    MEMFS.resizeFileStorage(node, attr.size);
   }
  },
  lookup: function(parent, name) {
   throw FS.genericErrors[ERRNO_CODES.ENOENT];
  },
  mknod: function(parent, name, mode, dev) {
   return MEMFS.createNode(parent, name, mode, dev);
  },
  rename: function(old_node, new_dir, new_name) {
   if (FS.isDir(old_node.mode)) {
    var new_node;
    try {
     new_node = FS.lookupNode(new_dir, new_name);
    } catch (e) {}
    if (new_node) {
     for (var i in new_node.contents) {
      throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
     }
    }
   }
   delete old_node.parent.contents[old_node.name];
   old_node.name = new_name;
   new_dir.contents[new_name] = old_node;
   old_node.parent = new_dir;
  },
  unlink: function(parent, name) {
   delete parent.contents[name];
  },
  rmdir: function(parent, name) {
   var node = FS.lookupNode(parent, name);
   for (var i in node.contents) {
    throw new FS.ErrnoError(ERRNO_CODES.ENOTEMPTY);
   }
   delete parent.contents[name];
  },
  readdir: function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink: function(parent, newname, oldpath) {
   var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
   node.link = oldpath;
   return node;
  },
  readlink: function(node) {
   if (!FS.isLink(node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return node.link;
  }
 },
 stream_ops: {
  read: function(stream, buffer, offset, length, position) {
   var contents = stream.node.contents;
   if (position >= stream.node.usedBytes) return 0;
   var size = Math.min(stream.node.usedBytes - position, length);
   assert(size >= 0);
   if (size > 8 && contents.subarray) {
    buffer.set(contents.subarray(position, position + size), offset);
   } else {
    for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
   }
   return size;
  },
  write: function(stream, buffer, offset, length, position, canOwn) {
   if (!length) return 0;
   var node = stream.node;
   node.timestamp = Date.now();
   if (buffer.subarray && (!node.contents || node.contents.subarray)) {
    if (canOwn) {
     node.contents = buffer.subarray(offset, offset + length);
     node.usedBytes = length;
     return length;
    } else if (node.usedBytes === 0 && position === 0) {
     node.contents = new Uint8Array(buffer.subarray(offset, offset + length));
     node.usedBytes = length;
     return length;
    } else if (position + length <= node.usedBytes) {
     node.contents.set(buffer.subarray(offset, offset + length), position);
     return length;
    }
   }
   MEMFS.expandFileStorage(node, position + length);
   if (node.contents.subarray && buffer.subarray) node.contents.set(buffer.subarray(offset, offset + length), position); else {
    for (var i = 0; i < length; i++) {
     node.contents[position + i] = buffer[offset + i];
    }
   }
   node.usedBytes = Math.max(node.usedBytes, position + length);
   return length;
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.usedBytes;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  },
  allocate: function(stream, offset, length) {
   MEMFS.expandFileStorage(stream.node, offset + length);
   stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
  },
  mmap: function(stream, buffer, offset, length, position, prot, flags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   var ptr;
   var allocated;
   var contents = stream.node.contents;
   if (!(flags & 2) && (contents.buffer === buffer || contents.buffer === buffer.buffer)) {
    allocated = false;
    ptr = contents.byteOffset;
   } else {
    if (position > 0 || position + length < stream.node.usedBytes) {
     if (contents.subarray) {
      contents = contents.subarray(position, position + length);
     } else {
      contents = Array.prototype.slice.call(contents, position, position + length);
     }
    }
    allocated = true;
    ptr = _malloc(length);
    if (!ptr) {
     throw new FS.ErrnoError(ERRNO_CODES.ENOMEM);
    }
    buffer.set(contents, ptr);
   }
   return {
    ptr: ptr,
    allocated: allocated
   };
  },
  msync: function(stream, buffer, offset, length, mmapFlags) {
   if (!FS.isFile(stream.node.mode)) {
    throw new FS.ErrnoError(ERRNO_CODES.ENODEV);
   }
   if (mmapFlags & 2) {
    return 0;
   }
   var bytesWritten = MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
   return 0;
  }
 }
};

var IDBFS = {
 dbs: {},
 indexedDB: function() {
  if (typeof indexedDB !== "undefined") return indexedDB;
  var ret = null;
  if (typeof window === "object") ret = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  assert(ret, "IDBFS used, but indexedDB not supported");
  return ret;
 },
 DB_VERSION: 21,
 DB_STORE_NAME: "FILE_DATA",
 mount: function(mount) {
  return MEMFS.mount.apply(null, arguments);
 },
 syncfs: function(mount, populate, callback) {
  IDBFS.getLocalSet(mount, function(err, local) {
   if (err) return callback(err);
   IDBFS.getRemoteSet(mount, function(err, remote) {
    if (err) return callback(err);
    var src = populate ? remote : local;
    var dst = populate ? local : remote;
    IDBFS.reconcile(src, dst, callback);
   });
  });
 },
 getDB: function(name, callback) {
  var db = IDBFS.dbs[name];
  if (db) {
   return callback(null, db);
  }
  var req;
  try {
   req = IDBFS.indexedDB().open(name, IDBFS.DB_VERSION);
  } catch (e) {
   return callback(e);
  }
  if (!req) {
   return callback("Unable to connect to IndexedDB");
  }
  req.onupgradeneeded = function(e) {
   var db = e.target.result;
   var transaction = e.target.transaction;
   var fileStore;
   if (db.objectStoreNames.contains(IDBFS.DB_STORE_NAME)) {
    fileStore = transaction.objectStore(IDBFS.DB_STORE_NAME);
   } else {
    fileStore = db.createObjectStore(IDBFS.DB_STORE_NAME);
   }
   if (!fileStore.indexNames.contains("timestamp")) {
    fileStore.createIndex("timestamp", "timestamp", {
     unique: false
    });
   }
  };
  req.onsuccess = function() {
   db = req.result;
   IDBFS.dbs[name] = db;
   callback(null, db);
  };
  req.onerror = function(e) {
   callback(this.error);
   e.preventDefault();
  };
 },
 getLocalSet: function(mount, callback) {
  var entries = {};
  function isRealDir(p) {
   return p !== "." && p !== "..";
  }
  function toAbsolute(root) {
   return function(p) {
    return PATH.join2(root, p);
   };
  }
  var check = FS.readdir(mount.mountpoint).filter(isRealDir).map(toAbsolute(mount.mountpoint));
  while (check.length) {
   var path = check.pop();
   var stat;
   try {
    stat = FS.stat(path);
   } catch (e) {
    return callback(e);
   }
   if (FS.isDir(stat.mode)) {
    check.push.apply(check, FS.readdir(path).filter(isRealDir).map(toAbsolute(path)));
   }
   entries[path] = {
    timestamp: stat.mtime
   };
  }
  return callback(null, {
   type: "local",
   entries: entries
  });
 },
 getRemoteSet: function(mount, callback) {
  var entries = {};
  IDBFS.getDB(mount.mountpoint, function(err, db) {
   if (err) return callback(err);
   try {
    var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readonly");
    transaction.onerror = function(e) {
     callback(this.error);
     e.preventDefault();
    };
    var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
    var index = store.index("timestamp");
    index.openKeyCursor().onsuccess = function(event) {
     var cursor = event.target.result;
     if (!cursor) {
      return callback(null, {
       type: "remote",
       db: db,
       entries: entries
      });
     }
     entries[cursor.primaryKey] = {
      timestamp: cursor.key
     };
     cursor.continue();
    };
   } catch (e) {
    return callback(e);
   }
  });
 },
 loadLocalEntry: function(path, callback) {
  var stat, node;
  try {
   var lookup = FS.lookupPath(path);
   node = lookup.node;
   stat = FS.stat(path);
  } catch (e) {
   return callback(e);
  }
  if (FS.isDir(stat.mode)) {
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode
   });
  } else if (FS.isFile(stat.mode)) {
   node.contents = MEMFS.getFileDataAsTypedArray(node);
   return callback(null, {
    timestamp: stat.mtime,
    mode: stat.mode,
    contents: node.contents
   });
  } else {
   return callback(new Error("node type not supported"));
  }
 },
 storeLocalEntry: function(path, entry, callback) {
  try {
   if (FS.isDir(entry.mode)) {
    FS.mkdir(path, entry.mode);
   } else if (FS.isFile(entry.mode)) {
    FS.writeFile(path, entry.contents, {
     canOwn: true
    });
   } else {
    return callback(new Error("node type not supported"));
   }
   FS.chmod(path, entry.mode);
   FS.utime(path, entry.timestamp, entry.timestamp);
  } catch (e) {
   return callback(e);
  }
  callback(null);
 },
 removeLocalEntry: function(path, callback) {
  try {
   var lookup = FS.lookupPath(path);
   var stat = FS.stat(path);
   if (FS.isDir(stat.mode)) {
    FS.rmdir(path);
   } else if (FS.isFile(stat.mode)) {
    FS.unlink(path);
   }
  } catch (e) {
   return callback(e);
  }
  callback(null);
 },
 loadRemoteEntry: function(store, path, callback) {
  var req = store.get(path);
  req.onsuccess = function(event) {
   callback(null, event.target.result);
  };
  req.onerror = function(e) {
   callback(this.error);
   e.preventDefault();
  };
 },
 storeRemoteEntry: function(store, path, entry, callback) {
  var req = store.put(entry, path);
  req.onsuccess = function() {
   callback(null);
  };
  req.onerror = function(e) {
   callback(this.error);
   e.preventDefault();
  };
 },
 removeRemoteEntry: function(store, path, callback) {
  var req = store.delete(path);
  req.onsuccess = function() {
   callback(null);
  };
  req.onerror = function(e) {
   callback(this.error);
   e.preventDefault();
  };
 },
 reconcile: function(src, dst, callback) {
  var total = 0;
  var create = [];
  Object.keys(src.entries).forEach(function(key) {
   var e = src.entries[key];
   var e2 = dst.entries[key];
   if (!e2 || e.timestamp > e2.timestamp) {
    create.push(key);
    total++;
   }
  });
  var remove = [];
  Object.keys(dst.entries).forEach(function(key) {
   var e = dst.entries[key];
   var e2 = src.entries[key];
   if (!e2) {
    remove.push(key);
    total++;
   }
  });
  if (!total) {
   return callback(null);
  }
  var errored = false;
  var completed = 0;
  var db = src.type === "remote" ? src.db : dst.db;
  var transaction = db.transaction([ IDBFS.DB_STORE_NAME ], "readwrite");
  var store = transaction.objectStore(IDBFS.DB_STORE_NAME);
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return callback(err);
    }
    return;
   }
   if (++completed >= total) {
    return callback(null);
   }
  }
  transaction.onerror = function(e) {
   done(this.error);
   e.preventDefault();
  };
  create.sort().forEach(function(path) {
   if (dst.type === "local") {
    IDBFS.loadRemoteEntry(store, path, function(err, entry) {
     if (err) return done(err);
     IDBFS.storeLocalEntry(path, entry, done);
    });
   } else {
    IDBFS.loadLocalEntry(path, function(err, entry) {
     if (err) return done(err);
     IDBFS.storeRemoteEntry(store, path, entry, done);
    });
   }
  });
  remove.sort().reverse().forEach(function(path) {
   if (dst.type === "local") {
    IDBFS.removeLocalEntry(path, done);
   } else {
    IDBFS.removeRemoteEntry(store, path, done);
   }
  });
 }
};

var NODEFS = {
 isWindows: false,
 staticInit: function() {
  NODEFS.isWindows = !!process.platform.match(/^win/);
  var flags = process["binding"]("constants");
  if (flags["fs"]) {
   flags = flags["fs"];
  }
  NODEFS.flagsForNodeMap = {
   1024: flags["O_APPEND"],
   64: flags["O_CREAT"],
   128: flags["O_EXCL"],
   0: flags["O_RDONLY"],
   2: flags["O_RDWR"],
   4096: flags["O_SYNC"],
   512: flags["O_TRUNC"],
   1: flags["O_WRONLY"]
  };
 },
 bufferFrom: function(arrayBuffer) {
  return Buffer.alloc ? Buffer.from(arrayBuffer) : new Buffer(arrayBuffer);
 },
 mount: function(mount) {
  assert(ENVIRONMENT_IS_NODE);
  return NODEFS.createNode(null, "/", NODEFS.getMode(mount.opts.root), 0);
 },
 createNode: function(parent, name, mode, dev) {
  if (!FS.isDir(mode) && !FS.isFile(mode) && !FS.isLink(mode)) {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
  var node = FS.createNode(parent, name, mode);
  node.node_ops = NODEFS.node_ops;
  node.stream_ops = NODEFS.stream_ops;
  return node;
 },
 getMode: function(path) {
  var stat;
  try {
   stat = fs.lstatSync(path);
   if (NODEFS.isWindows) {
    stat.mode = stat.mode | (stat.mode & 292) >> 2;
   }
  } catch (e) {
   if (!e.code) throw e;
   throw new FS.ErrnoError(ERRNO_CODES[e.code]);
  }
  return stat.mode;
 },
 realPath: function(node) {
  var parts = [];
  while (node.parent !== node) {
   parts.push(node.name);
   node = node.parent;
  }
  parts.push(node.mount.opts.root);
  parts.reverse();
  return PATH.join.apply(null, parts);
 },
 flagsForNode: function(flags) {
  flags &= ~2097152;
  flags &= ~2048;
  flags &= ~32768;
  flags &= ~524288;
  var newFlags = 0;
  for (var k in NODEFS.flagsForNodeMap) {
   if (flags & k) {
    newFlags |= NODEFS.flagsForNodeMap[k];
    flags ^= k;
   }
  }
  if (!flags) {
   return newFlags;
  } else {
   throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
  }
 },
 node_ops: {
  getattr: function(node) {
   var path = NODEFS.realPath(node);
   var stat;
   try {
    stat = fs.lstatSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   if (NODEFS.isWindows && !stat.blksize) {
    stat.blksize = 4096;
   }
   if (NODEFS.isWindows && !stat.blocks) {
    stat.blocks = (stat.size + stat.blksize - 1) / stat.blksize | 0;
   }
   return {
    dev: stat.dev,
    ino: stat.ino,
    mode: stat.mode,
    nlink: stat.nlink,
    uid: stat.uid,
    gid: stat.gid,
    rdev: stat.rdev,
    size: stat.size,
    atime: stat.atime,
    mtime: stat.mtime,
    ctime: stat.ctime,
    blksize: stat.blksize,
    blocks: stat.blocks
   };
  },
  setattr: function(node, attr) {
   var path = NODEFS.realPath(node);
   try {
    if (attr.mode !== undefined) {
     fs.chmodSync(path, attr.mode);
     node.mode = attr.mode;
    }
    if (attr.timestamp !== undefined) {
     var date = new Date(attr.timestamp);
     fs.utimesSync(path, date, date);
    }
    if (attr.size !== undefined) {
     fs.truncateSync(path, attr.size);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  lookup: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   var mode = NODEFS.getMode(path);
   return NODEFS.createNode(parent, name, mode);
  },
  mknod: function(parent, name, mode, dev) {
   var node = NODEFS.createNode(parent, name, mode, dev);
   var path = NODEFS.realPath(node);
   try {
    if (FS.isDir(node.mode)) {
     fs.mkdirSync(path, node.mode);
    } else {
     fs.writeFileSync(path, "", {
      mode: node.mode
     });
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
   return node;
  },
  rename: function(oldNode, newDir, newName) {
   var oldPath = NODEFS.realPath(oldNode);
   var newPath = PATH.join2(NODEFS.realPath(newDir), newName);
   try {
    fs.renameSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  unlink: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.unlinkSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  rmdir: function(parent, name) {
   var path = PATH.join2(NODEFS.realPath(parent), name);
   try {
    fs.rmdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  readdir: function(node) {
   var path = NODEFS.realPath(node);
   try {
    return fs.readdirSync(path);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  symlink: function(parent, newName, oldPath) {
   var newPath = PATH.join2(NODEFS.realPath(parent), newName);
   try {
    fs.symlinkSync(oldPath, newPath);
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  readlink: function(node) {
   var path = NODEFS.realPath(node);
   try {
    path = fs.readlinkSync(path);
    path = NODEJS_PATH.relative(NODEJS_PATH.resolve(node.mount.opts.root), path);
    return path;
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  }
 },
 stream_ops: {
  open: function(stream) {
   var path = NODEFS.realPath(stream.node);
   try {
    if (FS.isFile(stream.node.mode)) {
     stream.nfd = fs.openSync(path, NODEFS.flagsForNode(stream.flags));
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  close: function(stream) {
   try {
    if (FS.isFile(stream.node.mode) && stream.nfd) {
     fs.closeSync(stream.nfd);
    }
   } catch (e) {
    if (!e.code) throw e;
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  read: function(stream, buffer, offset, length, position) {
   if (length === 0) return 0;
   try {
    return fs.readSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  write: function(stream, buffer, offset, length, position) {
   try {
    return fs.writeSync(stream.nfd, NODEFS.bufferFrom(buffer.buffer), offset, length, position);
   } catch (e) {
    throw new FS.ErrnoError(ERRNO_CODES[e.code]);
   }
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     try {
      var stat = fs.fstatSync(stream.nfd);
      position += stat.size;
     } catch (e) {
      throw new FS.ErrnoError(ERRNO_CODES[e.code]);
     }
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  }
 }
};

var WORKERFS = {
 DIR_MODE: 16895,
 FILE_MODE: 33279,
 reader: null,
 mount: function(mount) {
  assert(ENVIRONMENT_IS_WORKER);
  if (!WORKERFS.reader) WORKERFS.reader = new FileReaderSync();
  var root = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0);
  var createdParents = {};
  function ensureParent(path) {
   var parts = path.split("/");
   var parent = root;
   for (var i = 0; i < parts.length - 1; i++) {
    var curr = parts.slice(0, i + 1).join("/");
    if (!createdParents[curr]) {
     createdParents[curr] = WORKERFS.createNode(parent, parts[i], WORKERFS.DIR_MODE, 0);
    }
    parent = createdParents[curr];
   }
   return parent;
  }
  function base(path) {
   var parts = path.split("/");
   return parts[parts.length - 1];
  }
  Array.prototype.forEach.call(mount.opts["files"] || [], function(file) {
   WORKERFS.createNode(ensureParent(file.name), base(file.name), WORKERFS.FILE_MODE, 0, file, file.lastModifiedDate);
  });
  (mount.opts["blobs"] || []).forEach(function(obj) {
   WORKERFS.createNode(ensureParent(obj["name"]), base(obj["name"]), WORKERFS.FILE_MODE, 0, obj["data"]);
  });
  (mount.opts["packages"] || []).forEach(function(pack) {
   pack["metadata"].files.forEach(function(file) {
    var name = file.filename.substr(1);
    WORKERFS.createNode(ensureParent(name), base(name), WORKERFS.FILE_MODE, 0, pack["blob"].slice(file.start, file.end));
   });
  });
  return root;
 },
 createNode: function(parent, name, mode, dev, contents, mtime) {
  var node = FS.createNode(parent, name, mode);
  node.mode = mode;
  node.node_ops = WORKERFS.node_ops;
  node.stream_ops = WORKERFS.stream_ops;
  node.timestamp = (mtime || new Date()).getTime();
  assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE);
  if (mode === WORKERFS.FILE_MODE) {
   node.size = contents.size;
   node.contents = contents;
  } else {
   node.size = 4096;
   node.contents = {};
  }
  if (parent) {
   parent.contents[name] = node;
  }
  return node;
 },
 node_ops: {
  getattr: function(node) {
   return {
    dev: 1,
    ino: undefined,
    mode: node.mode,
    nlink: 1,
    uid: 0,
    gid: 0,
    rdev: undefined,
    size: node.size,
    atime: new Date(node.timestamp),
    mtime: new Date(node.timestamp),
    ctime: new Date(node.timestamp),
    blksize: 4096,
    blocks: Math.ceil(node.size / 4096)
   };
  },
  setattr: function(node, attr) {
   if (attr.mode !== undefined) {
    node.mode = attr.mode;
   }
   if (attr.timestamp !== undefined) {
    node.timestamp = attr.timestamp;
   }
  },
  lookup: function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.ENOENT);
  },
  mknod: function(parent, name, mode, dev) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  },
  rename: function(oldNode, newDir, newName) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  },
  unlink: function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  },
  rmdir: function(parent, name) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  },
  readdir: function(node) {
   var entries = [ ".", ".." ];
   for (var key in node.contents) {
    if (!node.contents.hasOwnProperty(key)) {
     continue;
    }
    entries.push(key);
   }
   return entries;
  },
  symlink: function(parent, newName, oldPath) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  },
  readlink: function(node) {
   throw new FS.ErrnoError(ERRNO_CODES.EPERM);
  }
 },
 stream_ops: {
  read: function(stream, buffer, offset, length, position) {
   if (position >= stream.node.size) return 0;
   var chunk = stream.node.contents.slice(position, position + length);
   var ab = WORKERFS.reader.readAsArrayBuffer(chunk);
   buffer.set(new Uint8Array(ab), offset);
   return chunk.size;
  },
  write: function(stream, buffer, offset, length, position) {
   throw new FS.ErrnoError(ERRNO_CODES.EIO);
  },
  llseek: function(stream, offset, whence) {
   var position = offset;
   if (whence === 1) {
    position += stream.position;
   } else if (whence === 2) {
    if (FS.isFile(stream.node.mode)) {
     position += stream.node.size;
    }
   }
   if (position < 0) {
    throw new FS.ErrnoError(ERRNO_CODES.EINVAL);
   }
   return position;
  }
 }
};

var FS = {
 root: null,
 mounts: [],
 devices: {},
 streams: [],
 nextInode: 1,
 nameTable: null,
 currentPath: "/",
 initialized: false,
 ignorePermissions: true,
 trackingDelegate: {},
 tracking: {
  openFlags: {
   READ: 1,
   WRITE: 2
  }
 },
 ErrnoError: null,
 genericErrors: {},
 filesystems: null,
 syncFSRequests: 0,
 handleFSError: function(e) {
  if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
  return ___setErrNo(e.errno);
 },
 lookupPath: function(path, opts) {
  path = PATH.resolve(FS.cwd(), path);
  opts = opts || {};
  if (!path) return {
   path: "",
   node: null
  };
  var defaults = {
   follow_mount: true,
   recurse_count: 0
  };
  for (var key in defaults) {
   if (opts[key] === undefined) {
    opts[key] = defaults[key];
   }
  }
  if (opts.recurse_count > 8) {
   throw new FS.ErrnoError(40);
  }
  var parts = PATH.normalizeArray(path.split("/").filter(function(p) {
   return !!p;
  }), false);
  var current = FS.root;
  var current_path = "/";
  for (var i = 0; i < parts.length; i++) {
   var islast = i === parts.length - 1;
   if (islast && opts.parent) {
    break;
   }
   current = FS.lookupNode(current, parts[i]);
   current_path = PATH.join2(current_path, parts[i]);
   if (FS.isMountpoint(current)) {
    if (!islast || islast && opts.follow_mount) {
     current = current.mounted.root;
    }
   }
   if (!islast || opts.follow) {
    var count = 0;
    while (FS.isLink(current.mode)) {
     var link = FS.readlink(current_path);
     current_path = PATH.resolve(PATH.dirname(current_path), link);
     var lookup = FS.lookupPath(current_path, {
      recurse_count: opts.recurse_count
     });
     current = lookup.node;
     if (count++ > 40) {
      throw new FS.ErrnoError(40);
     }
    }
   }
  }
  return {
   path: current_path,
   node: current
  };
 },
 getPath: function(node) {
  var path;
  while (true) {
   if (FS.isRoot(node)) {
    var mount = node.mount.mountpoint;
    if (!path) return mount;
    return mount[mount.length - 1] !== "/" ? mount + "/" + path : mount + path;
   }
   path = path ? node.name + "/" + path : node.name;
   node = node.parent;
  }
 },
 hashName: function(parentid, name) {
  var hash = 0;
  for (var i = 0; i < name.length; i++) {
   hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  return (parentid + hash >>> 0) % FS.nameTable.length;
 },
 hashAddNode: function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  node.name_next = FS.nameTable[hash];
  FS.nameTable[hash] = node;
 },
 hashRemoveNode: function(node) {
  var hash = FS.hashName(node.parent.id, node.name);
  if (FS.nameTable[hash] === node) {
   FS.nameTable[hash] = node.name_next;
  } else {
   var current = FS.nameTable[hash];
   while (current) {
    if (current.name_next === node) {
     current.name_next = node.name_next;
     break;
    }
    current = current.name_next;
   }
  }
 },
 lookupNode: function(parent, name) {
  var err = FS.mayLookup(parent);
  if (err) {
   throw new FS.ErrnoError(err, parent);
  }
  var hash = FS.hashName(parent.id, name);
  for (var node = FS.nameTable[hash]; node; node = node.name_next) {
   var nodeName = node.name;
   if (node.parent.id === parent.id && nodeName === name) {
    return node;
   }
  }
  return FS.lookup(parent, name);
 },
 createNode: function(parent, name, mode, rdev) {
  if (!FS.FSNode) {
   FS.FSNode = function(parent, name, mode, rdev) {
    if (!parent) {
     parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
   };
   FS.FSNode.prototype = {};
   var readMode = 292 | 73;
   var writeMode = 146;
   Object.defineProperties(FS.FSNode.prototype, {
    read: {
     get: function() {
      return (this.mode & readMode) === readMode;
     },
     set: function(val) {
      val ? this.mode |= readMode : this.mode &= ~readMode;
     }
    },
    write: {
     get: function() {
      return (this.mode & writeMode) === writeMode;
     },
     set: function(val) {
      val ? this.mode |= writeMode : this.mode &= ~writeMode;
     }
    },
    isFolder: {
     get: function() {
      return FS.isDir(this.mode);
     }
    },
    isDevice: {
     get: function() {
      return FS.isChrdev(this.mode);
     }
    }
   });
  }
  var node = new FS.FSNode(parent, name, mode, rdev);
  FS.hashAddNode(node);
  return node;
 },
 destroyNode: function(node) {
  FS.hashRemoveNode(node);
 },
 isRoot: function(node) {
  return node === node.parent;
 },
 isMountpoint: function(node) {
  return !!node.mounted;
 },
 isFile: function(mode) {
  return (mode & 61440) === 32768;
 },
 isDir: function(mode) {
  return (mode & 61440) === 16384;
 },
 isLink: function(mode) {
  return (mode & 61440) === 40960;
 },
 isChrdev: function(mode) {
  return (mode & 61440) === 8192;
 },
 isBlkdev: function(mode) {
  return (mode & 61440) === 24576;
 },
 isFIFO: function(mode) {
  return (mode & 61440) === 4096;
 },
 isSocket: function(mode) {
  return (mode & 49152) === 49152;
 },
 flagModes: {
  "r": 0,
  "rs": 1052672,
  "r+": 2,
  "w": 577,
  "wx": 705,
  "xw": 705,
  "w+": 578,
  "wx+": 706,
  "xw+": 706,
  "a": 1089,
  "ax": 1217,
  "xa": 1217,
  "a+": 1090,
  "ax+": 1218,
  "xa+": 1218
 },
 modeStringToFlags: function(str) {
  var flags = FS.flagModes[str];
  if (typeof flags === "undefined") {
   throw new Error("Unknown file open mode: " + str);
  }
  return flags;
 },
 flagsToPermissionString: function(flag) {
  var perms = [ "r", "w", "rw" ][flag & 3];
  if (flag & 512) {
   perms += "w";
  }
  return perms;
 },
 nodePermissions: function(node, perms) {
  if (FS.ignorePermissions) {
   return 0;
  }
  if (perms.indexOf("r") !== -1 && !(node.mode & 292)) {
   return 13;
  } else if (perms.indexOf("w") !== -1 && !(node.mode & 146)) {
   return 13;
  } else if (perms.indexOf("x") !== -1 && !(node.mode & 73)) {
   return 13;
  }
  return 0;
 },
 mayLookup: function(dir) {
  var err = FS.nodePermissions(dir, "x");
  if (err) return err;
  if (!dir.node_ops.lookup) return 13;
  return 0;
 },
 mayCreate: function(dir, name) {
  try {
   var node = FS.lookupNode(dir, name);
   return 17;
  } catch (e) {}
  return FS.nodePermissions(dir, "wx");
 },
 mayDelete: function(dir, name, isdir) {
  var node;
  try {
   node = FS.lookupNode(dir, name);
  } catch (e) {
   return e.errno;
  }
  var err = FS.nodePermissions(dir, "wx");
  if (err) {
   return err;
  }
  if (isdir) {
   if (!FS.isDir(node.mode)) {
    return 20;
   }
   if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
    return 16;
   }
  } else {
   if (FS.isDir(node.mode)) {
    return 21;
   }
  }
  return 0;
 },
 mayOpen: function(node, flags) {
  if (!node) {
   return 2;
  }
  if (FS.isLink(node.mode)) {
   return 40;
  } else if (FS.isDir(node.mode)) {
   if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
    return 21;
   }
  }
  return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
 },
 MAX_OPEN_FDS: 4096,
 nextfd: function(fd_start, fd_end) {
  fd_start = fd_start || 0;
  fd_end = fd_end || FS.MAX_OPEN_FDS;
  for (var fd = fd_start; fd <= fd_end; fd++) {
   if (!FS.streams[fd]) {
    return fd;
   }
  }
  throw new FS.ErrnoError(24);
 },
 getStream: function(fd) {
  return FS.streams[fd];
 },
 createStream: function(stream, fd_start, fd_end) {
  if (!FS.FSStream) {
   FS.FSStream = function() {};
   FS.FSStream.prototype = {};
   Object.defineProperties(FS.FSStream.prototype, {
    object: {
     get: function() {
      return this.node;
     },
     set: function(val) {
      this.node = val;
     }
    },
    isRead: {
     get: function() {
      return (this.flags & 2097155) !== 1;
     }
    },
    isWrite: {
     get: function() {
      return (this.flags & 2097155) !== 0;
     }
    },
    isAppend: {
     get: function() {
      return this.flags & 1024;
     }
    }
   });
  }
  var newStream = new FS.FSStream();
  for (var p in stream) {
   newStream[p] = stream[p];
  }
  stream = newStream;
  var fd = FS.nextfd(fd_start, fd_end);
  stream.fd = fd;
  FS.streams[fd] = stream;
  return stream;
 },
 closeStream: function(fd) {
  FS.streams[fd] = null;
 },
 chrdev_stream_ops: {
  open: function(stream) {
   var device = FS.getDevice(stream.node.rdev);
   stream.stream_ops = device.stream_ops;
   if (stream.stream_ops.open) {
    stream.stream_ops.open(stream);
   }
  },
  llseek: function() {
   throw new FS.ErrnoError(29);
  }
 },
 major: function(dev) {
  return dev >> 8;
 },
 minor: function(dev) {
  return dev & 255;
 },
 makedev: function(ma, mi) {
  return ma << 8 | mi;
 },
 registerDevice: function(dev, ops) {
  FS.devices[dev] = {
   stream_ops: ops
  };
 },
 getDevice: function(dev) {
  return FS.devices[dev];
 },
 getMounts: function(mount) {
  var mounts = [];
  var check = [ mount ];
  while (check.length) {
   var m = check.pop();
   mounts.push(m);
   check.push.apply(check, m.mounts);
  }
  return mounts;
 },
 syncfs: function(populate, callback) {
  if (typeof populate === "function") {
   callback = populate;
   populate = false;
  }
  FS.syncFSRequests++;
  if (FS.syncFSRequests > 1) {
   console.log("warning: " + FS.syncFSRequests + " FS.syncfs operations in flight at once, probably just doing extra work");
  }
  var mounts = FS.getMounts(FS.root.mount);
  var completed = 0;
  function doCallback(err) {
   assert(FS.syncFSRequests > 0);
   FS.syncFSRequests--;
   return callback(err);
  }
  function done(err) {
   if (err) {
    if (!done.errored) {
     done.errored = true;
     return doCallback(err);
    }
    return;
   }
   if (++completed >= mounts.length) {
    doCallback(null);
   }
  }
  mounts.forEach(function(mount) {
   if (!mount.type.syncfs) {
    return done(null);
   }
   mount.type.syncfs(mount, populate, done);
  });
 },
 mount: function(type, opts, mountpoint) {
  var root = mountpoint === "/";
  var pseudo = !mountpoint;
  var node;
  if (root && FS.root) {
   throw new FS.ErrnoError(16);
  } else if (!root && !pseudo) {
   var lookup = FS.lookupPath(mountpoint, {
    follow_mount: false
   });
   mountpoint = lookup.path;
   node = lookup.node;
   if (FS.isMountpoint(node)) {
    throw new FS.ErrnoError(16);
   }
   if (!FS.isDir(node.mode)) {
    throw new FS.ErrnoError(20);
   }
  }
  var mount = {
   type: type,
   opts: opts,
   mountpoint: mountpoint,
   mounts: []
  };
  var mountRoot = type.mount(mount);
  mountRoot.mount = mount;
  mount.root = mountRoot;
  if (root) {
   FS.root = mountRoot;
  } else if (node) {
   node.mounted = mount;
   if (node.mount) {
    node.mount.mounts.push(mount);
   }
  }
  return mountRoot;
 },
 unmount: function(mountpoint) {
  var lookup = FS.lookupPath(mountpoint, {
   follow_mount: false
  });
  if (!FS.isMountpoint(lookup.node)) {
   throw new FS.ErrnoError(22);
  }
  var node = lookup.node;
  var mount = node.mounted;
  var mounts = FS.getMounts(mount);
  Object.keys(FS.nameTable).forEach(function(hash) {
   var current = FS.nameTable[hash];
   while (current) {
    var next = current.name_next;
    if (mounts.indexOf(current.mount) !== -1) {
     FS.destroyNode(current);
    }
    current = next;
   }
  });
  node.mounted = null;
  var idx = node.mount.mounts.indexOf(mount);
  assert(idx !== -1);
  node.mount.mounts.splice(idx, 1);
 },
 lookup: function(parent, name) {
  return parent.node_ops.lookup(parent, name);
 },
 mknod: function(path, mode, dev) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  if (!name || name === "." || name === "..") {
   throw new FS.ErrnoError(22);
  }
  var err = FS.mayCreate(parent, name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.mknod) {
   throw new FS.ErrnoError(1);
  }
  return parent.node_ops.mknod(parent, name, mode, dev);
 },
 create: function(path, mode) {
  mode = mode !== undefined ? mode : 438;
  mode &= 4095;
  mode |= 32768;
  return FS.mknod(path, mode, 0);
 },
 mkdir: function(path, mode) {
  mode = mode !== undefined ? mode : 511;
  mode &= 511 | 512;
  mode |= 16384;
  return FS.mknod(path, mode, 0);
 },
 mkdirTree: function(path, mode) {
  var dirs = path.split("/");
  var d = "";
  for (var i = 0; i < dirs.length; ++i) {
   if (!dirs[i]) continue;
   d += "/" + dirs[i];
   try {
    FS.mkdir(d, mode);
   } catch (e) {
    if (e.errno != 17) throw e;
   }
  }
 },
 mkdev: function(path, mode, dev) {
  if (typeof dev === "undefined") {
   dev = mode;
   mode = 438;
  }
  mode |= 8192;
  return FS.mknod(path, mode, dev);
 },
 symlink: function(oldpath, newpath) {
  if (!PATH.resolve(oldpath)) {
   throw new FS.ErrnoError(2);
  }
  var lookup = FS.lookupPath(newpath, {
   parent: true
  });
  var parent = lookup.node;
  if (!parent) {
   throw new FS.ErrnoError(2);
  }
  var newname = PATH.basename(newpath);
  var err = FS.mayCreate(parent, newname);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.symlink) {
   throw new FS.ErrnoError(1);
  }
  return parent.node_ops.symlink(parent, newname, oldpath);
 },
 rename: function(old_path, new_path) {
  var old_dirname = PATH.dirname(old_path);
  var new_dirname = PATH.dirname(new_path);
  var old_name = PATH.basename(old_path);
  var new_name = PATH.basename(new_path);
  var lookup, old_dir, new_dir;
  try {
   lookup = FS.lookupPath(old_path, {
    parent: true
   });
   old_dir = lookup.node;
   lookup = FS.lookupPath(new_path, {
    parent: true
   });
   new_dir = lookup.node;
  } catch (e) {
   throw new FS.ErrnoError(16);
  }
  if (!old_dir || !new_dir) throw new FS.ErrnoError(2);
  if (old_dir.mount !== new_dir.mount) {
   throw new FS.ErrnoError(18);
  }
  var old_node = FS.lookupNode(old_dir, old_name);
  var relative = PATH.relative(old_path, new_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(22);
  }
  relative = PATH.relative(new_path, old_dirname);
  if (relative.charAt(0) !== ".") {
   throw new FS.ErrnoError(39);
  }
  var new_node;
  try {
   new_node = FS.lookupNode(new_dir, new_name);
  } catch (e) {}
  if (old_node === new_node) {
   return;
  }
  var isdir = FS.isDir(old_node.mode);
  var err = FS.mayDelete(old_dir, old_name, isdir);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  err = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!old_dir.node_ops.rename) {
   throw new FS.ErrnoError(1);
  }
  if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
   throw new FS.ErrnoError(16);
  }
  if (new_dir !== old_dir) {
   err = FS.nodePermissions(old_dir, "w");
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  try {
   if (FS.trackingDelegate["willMovePath"]) {
    FS.trackingDelegate["willMovePath"](old_path, new_path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
  FS.hashRemoveNode(old_node);
  try {
   old_dir.node_ops.rename(old_node, new_dir, new_name);
  } catch (e) {
   throw e;
  } finally {
   FS.hashAddNode(old_node);
  }
  try {
   if (FS.trackingDelegate["onMovePath"]) FS.trackingDelegate["onMovePath"](old_path, new_path);
  } catch (e) {
   console.log("FS.trackingDelegate['onMovePath']('" + old_path + "', '" + new_path + "') threw an exception: " + e.message);
  }
 },
 rmdir: function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, true);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.rmdir) {
   throw new FS.ErrnoError(1);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(16);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.rmdir(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 },
 readdir: function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  if (!node.node_ops.readdir) {
   throw new FS.ErrnoError(20);
  }
  return node.node_ops.readdir(node);
 },
 unlink: function(path) {
  var lookup = FS.lookupPath(path, {
   parent: true
  });
  var parent = lookup.node;
  var name = PATH.basename(path);
  var node = FS.lookupNode(parent, name);
  var err = FS.mayDelete(parent, name, false);
  if (err) {
   throw new FS.ErrnoError(err);
  }
  if (!parent.node_ops.unlink) {
   throw new FS.ErrnoError(1);
  }
  if (FS.isMountpoint(node)) {
   throw new FS.ErrnoError(16);
  }
  try {
   if (FS.trackingDelegate["willDeletePath"]) {
    FS.trackingDelegate["willDeletePath"](path);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['willDeletePath']('" + path + "') threw an exception: " + e.message);
  }
  parent.node_ops.unlink(parent, name);
  FS.destroyNode(node);
  try {
   if (FS.trackingDelegate["onDeletePath"]) FS.trackingDelegate["onDeletePath"](path);
  } catch (e) {
   console.log("FS.trackingDelegate['onDeletePath']('" + path + "') threw an exception: " + e.message);
  }
 },
 readlink: function(path) {
  var lookup = FS.lookupPath(path);
  var link = lookup.node;
  if (!link) {
   throw new FS.ErrnoError(2);
  }
  if (!link.node_ops.readlink) {
   throw new FS.ErrnoError(22);
  }
  return PATH.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
 },
 stat: function(path, dontFollow) {
  var lookup = FS.lookupPath(path, {
   follow: !dontFollow
  });
  var node = lookup.node;
  if (!node) {
   throw new FS.ErrnoError(2);
  }
  if (!node.node_ops.getattr) {
   throw new FS.ErrnoError(1);
  }
  return node.node_ops.getattr(node);
 },
 lstat: function(path) {
  return FS.stat(path, true);
 },
 chmod: function(path, mode, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(1);
  }
  node.node_ops.setattr(node, {
   mode: mode & 4095 | node.mode & ~4095,
   timestamp: Date.now()
  });
 },
 lchmod: function(path, mode) {
  FS.chmod(path, mode, true);
 },
 fchmod: function(fd, mode) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(9);
  }
  FS.chmod(stream.node, mode);
 },
 chown: function(path, uid, gid, dontFollow) {
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: !dontFollow
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(1);
  }
  node.node_ops.setattr(node, {
   timestamp: Date.now()
  });
 },
 lchown: function(path, uid, gid) {
  FS.chown(path, uid, gid, true);
 },
 fchown: function(fd, uid, gid) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(9);
  }
  FS.chown(stream.node, uid, gid);
 },
 truncate: function(path, len) {
  if (len < 0) {
   throw new FS.ErrnoError(22);
  }
  var node;
  if (typeof path === "string") {
   var lookup = FS.lookupPath(path, {
    follow: true
   });
   node = lookup.node;
  } else {
   node = path;
  }
  if (!node.node_ops.setattr) {
   throw new FS.ErrnoError(1);
  }
  if (FS.isDir(node.mode)) {
   throw new FS.ErrnoError(21);
  }
  if (!FS.isFile(node.mode)) {
   throw new FS.ErrnoError(22);
  }
  var err = FS.nodePermissions(node, "w");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  node.node_ops.setattr(node, {
   size: len,
   timestamp: Date.now()
  });
 },
 ftruncate: function(fd, len) {
  var stream = FS.getStream(fd);
  if (!stream) {
   throw new FS.ErrnoError(9);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(22);
  }
  FS.truncate(stream.node, len);
 },
 utime: function(path, atime, mtime) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  var node = lookup.node;
  node.node_ops.setattr(node, {
   timestamp: Math.max(atime, mtime)
  });
 },
 open: function(path, flags, mode, fd_start, fd_end) {
  if (path === "") {
   throw new FS.ErrnoError(2);
  }
  flags = typeof flags === "string" ? FS.modeStringToFlags(flags) : flags;
  mode = typeof mode === "undefined" ? 438 : mode;
  if (flags & 64) {
   mode = mode & 4095 | 32768;
  } else {
   mode = 0;
  }
  var node;
  if (typeof path === "object") {
   node = path;
  } else {
   path = PATH.normalize(path);
   try {
    var lookup = FS.lookupPath(path, {
     follow: !(flags & 131072)
    });
    node = lookup.node;
   } catch (e) {}
  }
  var created = false;
  if (flags & 64) {
   if (node) {
    if (flags & 128) {
     throw new FS.ErrnoError(17);
    }
   } else {
    node = FS.mknod(path, mode, 0);
    created = true;
   }
  }
  if (!node) {
   throw new FS.ErrnoError(2);
  }
  if (FS.isChrdev(node.mode)) {
   flags &= ~512;
  }
  if (flags & 65536 && !FS.isDir(node.mode)) {
   throw new FS.ErrnoError(20);
  }
  if (!created) {
   var err = FS.mayOpen(node, flags);
   if (err) {
    throw new FS.ErrnoError(err);
   }
  }
  if (flags & 512) {
   FS.truncate(node, 0);
  }
  flags &= ~(128 | 512);
  var stream = FS.createStream({
   node: node,
   path: FS.getPath(node),
   flags: flags,
   seekable: true,
   position: 0,
   stream_ops: node.stream_ops,
   ungotten: [],
   error: false
  }, fd_start, fd_end);
  if (stream.stream_ops.open) {
   stream.stream_ops.open(stream);
  }
  if (Module["logReadFiles"] && !(flags & 1)) {
   if (!FS.readFiles) FS.readFiles = {};
   if (!(path in FS.readFiles)) {
    FS.readFiles[path] = 1;
    console.log("FS.trackingDelegate error on read file: " + path);
   }
  }
  try {
   if (FS.trackingDelegate["onOpenFile"]) {
    var trackingFlags = 0;
    if ((flags & 2097155) !== 1) {
     trackingFlags |= FS.tracking.openFlags.READ;
    }
    if ((flags & 2097155) !== 0) {
     trackingFlags |= FS.tracking.openFlags.WRITE;
    }
    FS.trackingDelegate["onOpenFile"](path, trackingFlags);
   }
  } catch (e) {
   console.log("FS.trackingDelegate['onOpenFile']('" + path + "', flags) threw an exception: " + e.message);
  }
  return stream;
 },
 close: function(stream) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(9);
  }
  if (stream.getdents) stream.getdents = null;
  try {
   if (stream.stream_ops.close) {
    stream.stream_ops.close(stream);
   }
  } catch (e) {
   throw e;
  } finally {
   FS.closeStream(stream.fd);
  }
  stream.fd = null;
 },
 isClosed: function(stream) {
  return stream.fd === null;
 },
 llseek: function(stream, offset, whence) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(9);
  }
  if (!stream.seekable || !stream.stream_ops.llseek) {
   throw new FS.ErrnoError(29);
  }
  if (whence != 0 && whence != 1 && whence != 2) {
   throw new FS.ErrnoError(22);
  }
  stream.position = stream.stream_ops.llseek(stream, offset, whence);
  stream.ungotten = [];
  return stream.position;
 },
 read: function(stream, buffer, offset, length, position) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(22);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(9);
  }
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(9);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(21);
  }
  if (!stream.stream_ops.read) {
   throw new FS.ErrnoError(22);
  }
  var seeking = typeof position !== "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(29);
  }
  var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
  if (!seeking) stream.position += bytesRead;
  return bytesRead;
 },
 write: function(stream, buffer, offset, length, position, canOwn) {
  if (length < 0 || position < 0) {
   throw new FS.ErrnoError(22);
  }
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(9);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(9);
  }
  if (FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(21);
  }
  if (!stream.stream_ops.write) {
   throw new FS.ErrnoError(22);
  }
  if (stream.flags & 1024) {
   FS.llseek(stream, 0, 2);
  }
  var seeking = typeof position !== "undefined";
  if (!seeking) {
   position = stream.position;
  } else if (!stream.seekable) {
   throw new FS.ErrnoError(29);
  }
  var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
  if (!seeking) stream.position += bytesWritten;
  try {
   if (stream.path && FS.trackingDelegate["onWriteToFile"]) FS.trackingDelegate["onWriteToFile"](stream.path);
  } catch (e) {
   console.log("FS.trackingDelegate['onWriteToFile']('" + stream.path + "') threw an exception: " + e.message);
  }
  return bytesWritten;
 },
 allocate: function(stream, offset, length) {
  if (FS.isClosed(stream)) {
   throw new FS.ErrnoError(9);
  }
  if (offset < 0 || length <= 0) {
   throw new FS.ErrnoError(22);
  }
  if ((stream.flags & 2097155) === 0) {
   throw new FS.ErrnoError(9);
  }
  if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
   throw new FS.ErrnoError(19);
  }
  if (!stream.stream_ops.allocate) {
   throw new FS.ErrnoError(95);
  }
  stream.stream_ops.allocate(stream, offset, length);
 },
 mmap: function(stream, buffer, offset, length, position, prot, flags) {
  if ((stream.flags & 2097155) === 1) {
   throw new FS.ErrnoError(13);
  }
  if (!stream.stream_ops.mmap) {
   throw new FS.ErrnoError(19);
  }
  return stream.stream_ops.mmap(stream, buffer, offset, length, position, prot, flags);
 },
 msync: function(stream, buffer, offset, length, mmapFlags) {
  if (!stream || !stream.stream_ops.msync) {
   return 0;
  }
  return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
 },
 munmap: function(stream) {
  return 0;
 },
 ioctl: function(stream, cmd, arg) {
  if (!stream.stream_ops.ioctl) {
   throw new FS.ErrnoError(25);
  }
  return stream.stream_ops.ioctl(stream, cmd, arg);
 },
 readFile: function(path, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "r";
  opts.encoding = opts.encoding || "binary";
  if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
   throw new Error('Invalid encoding type "' + opts.encoding + '"');
  }
  var ret;
  var stream = FS.open(path, opts.flags);
  var stat = FS.stat(path);
  var length = stat.size;
  var buf = new Uint8Array(length);
  FS.read(stream, buf, 0, length, 0);
  if (opts.encoding === "utf8") {
   ret = UTF8ArrayToString(buf, 0);
  } else if (opts.encoding === "binary") {
   ret = buf;
  }
  FS.close(stream);
  return ret;
 },
 writeFile: function(path, data, opts) {
  opts = opts || {};
  opts.flags = opts.flags || "w";
  var stream = FS.open(path, opts.flags, opts.mode);
  if (typeof data === "string") {
   var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
   var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
   FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
  } else if (ArrayBuffer.isView(data)) {
   FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
  } else {
   throw new Error("Unsupported data type");
  }
  FS.close(stream);
 },
 cwd: function() {
  return FS.currentPath;
 },
 chdir: function(path) {
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  if (lookup.node === null) {
   throw new FS.ErrnoError(2);
  }
  if (!FS.isDir(lookup.node.mode)) {
   throw new FS.ErrnoError(20);
  }
  var err = FS.nodePermissions(lookup.node, "x");
  if (err) {
   throw new FS.ErrnoError(err);
  }
  FS.currentPath = lookup.path;
 },
 createDefaultDirectories: function() {
  FS.mkdir("/tmp");
  FS.mkdir("/home");
  FS.mkdir("/home/web_user");
 },
 createDefaultDevices: function() {
  FS.mkdir("/dev");
  FS.registerDevice(FS.makedev(1, 3), {
   read: function() {
    return 0;
   },
   write: function(stream, buffer, offset, length, pos) {
    return length;
   }
  });
  FS.mkdev("/dev/null", FS.makedev(1, 3));
  TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
  TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
  FS.mkdev("/dev/tty", FS.makedev(5, 0));
  FS.mkdev("/dev/tty1", FS.makedev(6, 0));
  var random_device;
  if (typeof crypto === "object" && typeof crypto["getRandomValues"] === "function") {
   var randomBuffer = new Uint8Array(1);
   random_device = function() {
    crypto.getRandomValues(randomBuffer);
    return randomBuffer[0];
   };
  } else if (ENVIRONMENT_IS_NODE) {
   try {
    var crypto_module = require("crypto");
    random_device = function() {
     return crypto_module["randomBytes"](1)[0];
    };
   } catch (e) {
    random_device = function() {
     return Math.random() * 256 | 0;
    };
   }
  } else {
   random_device = function() {
    abort("random_device");
   };
  }
  FS.createDevice("/dev", "random", random_device);
  FS.createDevice("/dev", "urandom", random_device);
  FS.mkdir("/dev/shm");
  FS.mkdir("/dev/shm/tmp");
 },
 createSpecialDirectories: function() {
  FS.mkdir("/proc");
  FS.mkdir("/proc/self");
  FS.mkdir("/proc/self/fd");
  FS.mount({
   mount: function() {
    var node = FS.createNode("/proc/self", "fd", 16384 | 511, 73);
    node.node_ops = {
     lookup: function(parent, name) {
      var fd = +name;
      var stream = FS.getStream(fd);
      if (!stream) throw new FS.ErrnoError(9);
      var ret = {
       parent: null,
       mount: {
        mountpoint: "fake"
       },
       node_ops: {
        readlink: function() {
         return stream.path;
        }
       }
      };
      ret.parent = ret;
      return ret;
     }
    };
    return node;
   }
  }, {}, "/proc/self/fd");
 },
 createStandardStreams: function() {
  if (Module["stdin"]) {
   FS.createDevice("/dev", "stdin", Module["stdin"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdin");
  }
  if (Module["stdout"]) {
   FS.createDevice("/dev", "stdout", null, Module["stdout"]);
  } else {
   FS.symlink("/dev/tty", "/dev/stdout");
  }
  if (Module["stderr"]) {
   FS.createDevice("/dev", "stderr", null, Module["stderr"]);
  } else {
   FS.symlink("/dev/tty1", "/dev/stderr");
  }
  var stdin = FS.open("/dev/stdin", "r");
  assert(stdin.fd === 0, "invalid handle for stdin (" + stdin.fd + ")");
  var stdout = FS.open("/dev/stdout", "w");
  assert(stdout.fd === 1, "invalid handle for stdout (" + stdout.fd + ")");
  var stderr = FS.open("/dev/stderr", "w");
  assert(stderr.fd === 2, "invalid handle for stderr (" + stderr.fd + ")");
 },
 ensureErrnoError: function() {
  if (FS.ErrnoError) return;
  FS.ErrnoError = function ErrnoError(errno, node) {
   this.node = node;
   this.setErrno = function(errno) {
    this.errno = errno;
   };
   this.setErrno(errno);
   this.message = "FS error";
   if (this.stack) Object.defineProperty(this, "stack", {
    value: new Error().stack,
    writable: true
   });
  };
  FS.ErrnoError.prototype = new Error();
  FS.ErrnoError.prototype.constructor = FS.ErrnoError;
  [ 2 ].forEach(function(code) {
   FS.genericErrors[code] = new FS.ErrnoError(code);
   FS.genericErrors[code].stack = "<generic error, no stack>";
  });
 },
 staticInit: function() {
  FS.ensureErrnoError();
  FS.nameTable = new Array(4096);
  FS.mount(MEMFS, {}, "/");
  FS.createDefaultDirectories();
  FS.createDefaultDevices();
  FS.createSpecialDirectories();
  FS.filesystems = {
   "MEMFS": MEMFS,
   "IDBFS": IDBFS,
   "NODEFS": NODEFS,
   "WORKERFS": WORKERFS
  };
 },
 init: function(input, output, error) {
  assert(!FS.init.initialized, "FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)");
  FS.init.initialized = true;
  FS.ensureErrnoError();
  Module["stdin"] = input || Module["stdin"];
  Module["stdout"] = output || Module["stdout"];
  Module["stderr"] = error || Module["stderr"];
  FS.createStandardStreams();
 },
 quit: function() {
  FS.init.initialized = false;
  var fflush = Module["_fflush"];
  if (fflush) fflush(0);
  for (var i = 0; i < FS.streams.length; i++) {
   var stream = FS.streams[i];
   if (!stream) {
    continue;
   }
   FS.close(stream);
  }
 },
 getMode: function(canRead, canWrite) {
  var mode = 0;
  if (canRead) mode |= 292 | 73;
  if (canWrite) mode |= 146;
  return mode;
 },
 joinPath: function(parts, forceRelative) {
  var path = PATH.join.apply(null, parts);
  if (forceRelative && path[0] == "/") path = path.substr(1);
  return path;
 },
 absolutePath: function(relative, base) {
  return PATH.resolve(base, relative);
 },
 standardizePath: function(path) {
  return PATH.normalize(path);
 },
 findObject: function(path, dontResolveLastLink) {
  var ret = FS.analyzePath(path, dontResolveLastLink);
  if (ret.exists) {
   return ret.object;
  } else {
   ___setErrNo(ret.error);
   return null;
  }
 },
 analyzePath: function(path, dontResolveLastLink) {
  try {
   var lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   path = lookup.path;
  } catch (e) {}
  var ret = {
   isRoot: false,
   exists: false,
   error: 0,
   name: null,
   path: null,
   object: null,
   parentExists: false,
   parentPath: null,
   parentObject: null
  };
  try {
   var lookup = FS.lookupPath(path, {
    parent: true
   });
   ret.parentExists = true;
   ret.parentPath = lookup.path;
   ret.parentObject = lookup.node;
   ret.name = PATH.basename(path);
   lookup = FS.lookupPath(path, {
    follow: !dontResolveLastLink
   });
   ret.exists = true;
   ret.path = lookup.path;
   ret.object = lookup.node;
   ret.name = lookup.node.name;
   ret.isRoot = lookup.path === "/";
  } catch (e) {
   ret.error = e.errno;
  }
  return ret;
 },
 createFolder: function(parent, name, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.mkdir(path, mode);
 },
 createPath: function(parent, path, canRead, canWrite) {
  parent = typeof parent === "string" ? parent : FS.getPath(parent);
  var parts = path.split("/").reverse();
  while (parts.length) {
   var part = parts.pop();
   if (!part) continue;
   var current = PATH.join2(parent, part);
   try {
    FS.mkdir(current);
   } catch (e) {}
   parent = current;
  }
  return current;
 },
 createFile: function(parent, name, properties, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(canRead, canWrite);
  return FS.create(path, mode);
 },
 createDataFile: function(parent, name, data, canRead, canWrite, canOwn) {
  var path = name ? PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name) : parent;
  var mode = FS.getMode(canRead, canWrite);
  var node = FS.create(path, mode);
  if (data) {
   if (typeof data === "string") {
    var arr = new Array(data.length);
    for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
    data = arr;
   }
   FS.chmod(node, mode | 146);
   var stream = FS.open(node, "w");
   FS.write(stream, data, 0, data.length, 0, canOwn);
   FS.close(stream);
   FS.chmod(node, mode);
  }
  return node;
 },
 createDevice: function(parent, name, input, output) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  var mode = FS.getMode(!!input, !!output);
  if (!FS.createDevice.major) FS.createDevice.major = 64;
  var dev = FS.makedev(FS.createDevice.major++, 0);
  FS.registerDevice(dev, {
   open: function(stream) {
    stream.seekable = false;
   },
   close: function(stream) {
    if (output && output.buffer && output.buffer.length) {
     output(10);
    }
   },
   read: function(stream, buffer, offset, length, pos) {
    var bytesRead = 0;
    for (var i = 0; i < length; i++) {
     var result;
     try {
      result = input();
     } catch (e) {
      throw new FS.ErrnoError(5);
     }
     if (result === undefined && bytesRead === 0) {
      throw new FS.ErrnoError(11);
     }
     if (result === null || result === undefined) break;
     bytesRead++;
     buffer[offset + i] = result;
    }
    if (bytesRead) {
     stream.node.timestamp = Date.now();
    }
    return bytesRead;
   },
   write: function(stream, buffer, offset, length, pos) {
    for (var i = 0; i < length; i++) {
     try {
      output(buffer[offset + i]);
     } catch (e) {
      throw new FS.ErrnoError(5);
     }
    }
    if (length) {
     stream.node.timestamp = Date.now();
    }
    return i;
   }
  });
  return FS.mkdev(path, mode, dev);
 },
 createLink: function(parent, name, target, canRead, canWrite) {
  var path = PATH.join2(typeof parent === "string" ? parent : FS.getPath(parent), name);
  return FS.symlink(target, path);
 },
 forceLoadFile: function(obj) {
  if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
  var success = true;
  if (typeof XMLHttpRequest !== "undefined") {
   throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
  } else if (Module["read"]) {
   try {
    obj.contents = intArrayFromString(Module["read"](obj.url), true);
    obj.usedBytes = obj.contents.length;
   } catch (e) {
    success = false;
   }
  } else {
   throw new Error("Cannot load without read() or XMLHttpRequest.");
  }
  if (!success) ___setErrNo(5);
  return success;
 },
 createLazyFile: function(parent, name, url, canRead, canWrite) {
  function LazyUint8Array() {
   this.lengthKnown = false;
   this.chunks = [];
  }
  LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
   if (idx > this.length - 1 || idx < 0) {
    return undefined;
   }
   var chunkOffset = idx % this.chunkSize;
   var chunkNum = idx / this.chunkSize | 0;
   return this.getter(chunkNum)[chunkOffset];
  };
  LazyUint8Array.prototype.setDataGetter = function LazyUint8Array_setDataGetter(getter) {
   this.getter = getter;
  };
  LazyUint8Array.prototype.cacheLength = function LazyUint8Array_cacheLength() {
   var xhr = new XMLHttpRequest();
   xhr.open("HEAD", url, false);
   xhr.send(null);
   if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
   var datalength = Number(xhr.getResponseHeader("Content-length"));
   var header;
   var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
   var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
   var chunkSize = 1024 * 1024;
   if (!hasByteServing) chunkSize = datalength;
   var doXHR = function(from, to) {
    if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
    if (to > datalength - 1) throw new Error("only " + datalength + " bytes available! programmer error!");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
    if (typeof Uint8Array != "undefined") xhr.responseType = "arraybuffer";
    if (xhr.overrideMimeType) {
     xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }
    xhr.send(null);
    if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
    if (xhr.response !== undefined) {
     return new Uint8Array(xhr.response || []);
    } else {
     return intArrayFromString(xhr.responseText || "", true);
    }
   };
   var lazyArray = this;
   lazyArray.setDataGetter(function(chunkNum) {
    var start = chunkNum * chunkSize;
    var end = (chunkNum + 1) * chunkSize - 1;
    end = Math.min(end, datalength - 1);
    if (typeof lazyArray.chunks[chunkNum] === "undefined") {
     lazyArray.chunks[chunkNum] = doXHR(start, end);
    }
    if (typeof lazyArray.chunks[chunkNum] === "undefined") throw new Error("doXHR failed!");
    return lazyArray.chunks[chunkNum];
   });
   if (usesGzip || !datalength) {
    chunkSize = datalength = 1;
    datalength = this.getter(0).length;
    chunkSize = datalength;
    console.log("LazyFiles on gzip forces download of the whole file when length is accessed");
   }
   this._length = datalength;
   this._chunkSize = chunkSize;
   this.lengthKnown = true;
  };
  if (typeof XMLHttpRequest !== "undefined") {
   if (!ENVIRONMENT_IS_WORKER) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
   var lazyArray = new LazyUint8Array();
   Object.defineProperties(lazyArray, {
    length: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._length;
     }
    },
    chunkSize: {
     get: function() {
      if (!this.lengthKnown) {
       this.cacheLength();
      }
      return this._chunkSize;
     }
    }
   });
   var properties = {
    isDevice: false,
    contents: lazyArray
   };
  } else {
   var properties = {
    isDevice: false,
    url: url
   };
  }
  var node = FS.createFile(parent, name, properties, canRead, canWrite);
  if (properties.contents) {
   node.contents = properties.contents;
  } else if (properties.url) {
   node.contents = null;
   node.url = properties.url;
  }
  Object.defineProperties(node, {
   usedBytes: {
    get: function() {
     return this.contents.length;
    }
   }
  });
  var stream_ops = {};
  var keys = Object.keys(node.stream_ops);
  keys.forEach(function(key) {
   var fn = node.stream_ops[key];
   stream_ops[key] = function forceLoadLazyFile() {
    if (!FS.forceLoadFile(node)) {
     throw new FS.ErrnoError(5);
    }
    return fn.apply(null, arguments);
   };
  });
  stream_ops.read = function stream_ops_read(stream, buffer, offset, length, position) {
   if (!FS.forceLoadFile(node)) {
    throw new FS.ErrnoError(5);
   }
   var contents = stream.node.contents;
   if (position >= contents.length) return 0;
   var size = Math.min(contents.length - position, length);
   assert(size >= 0);
   if (contents.slice) {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents[position + i];
    }
   } else {
    for (var i = 0; i < size; i++) {
     buffer[offset + i] = contents.get(position + i);
    }
   }
   return size;
  };
  node.stream_ops = stream_ops;
  return node;
 },
 createPreloadedFile: function(parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) {
  Browser.init();
  var fullname = name ? PATH.resolve(PATH.join2(parent, name)) : parent;
  var dep = getUniqueRunDependency("cp " + fullname);
  function processData(byteArray) {
   function finish(byteArray) {
    if (preFinish) preFinish();
    if (!dontCreateFile) {
     FS.createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
    }
    if (onload) onload();
    removeRunDependency(dep);
   }
   var handled = false;
   Module["preloadPlugins"].forEach(function(plugin) {
    if (handled) return;
    if (plugin["canHandle"](fullname)) {
     plugin["handle"](byteArray, fullname, finish, function() {
      if (onerror) onerror();
      removeRunDependency(dep);
     });
     handled = true;
    }
   });
   if (!handled) finish(byteArray);
  }
  addRunDependency(dep);
  if (typeof url == "string") {
   Browser.asyncLoad(url, function(byteArray) {
    processData(byteArray);
   }, onerror);
  } else {
   processData(url);
  }
 },
 indexedDB: function() {
  return window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
 },
 DB_NAME: function() {
  return "EM_FS_" + window.location.pathname;
 },
 DB_VERSION: 20,
 DB_STORE_NAME: "FILE_DATA",
 saveFilesToDB: function(paths, onload, onerror) {
  onload = onload || function() {};
  onerror = onerror || function() {};
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = function openRequest_onupgradeneeded() {
   console.log("creating db");
   var db = openRequest.result;
   db.createObjectStore(FS.DB_STORE_NAME);
  };
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   var transaction = db.transaction([ FS.DB_STORE_NAME ], "readwrite");
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(function(path) {
    var putRequest = files.put(FS.analyzePath(path).object.contents, path);
    putRequest.onsuccess = function putRequest_onsuccess() {
     ok++;
     if (ok + fail == total) finish();
    };
    putRequest.onerror = function putRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   });
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 },
 loadFilesFromDB: function(paths, onload, onerror) {
  onload = onload || function() {};
  onerror = onerror || function() {};
  var indexedDB = FS.indexedDB();
  try {
   var openRequest = indexedDB.open(FS.DB_NAME(), FS.DB_VERSION);
  } catch (e) {
   return onerror(e);
  }
  openRequest.onupgradeneeded = onerror;
  openRequest.onsuccess = function openRequest_onsuccess() {
   var db = openRequest.result;
   try {
    var transaction = db.transaction([ FS.DB_STORE_NAME ], "readonly");
   } catch (e) {
    onerror(e);
    return;
   }
   var files = transaction.objectStore(FS.DB_STORE_NAME);
   var ok = 0, fail = 0, total = paths.length;
   function finish() {
    if (fail == 0) onload(); else onerror();
   }
   paths.forEach(function(path) {
    var getRequest = files.get(path);
    getRequest.onsuccess = function getRequest_onsuccess() {
     if (FS.analyzePath(path).exists) {
      FS.unlink(path);
     }
     FS.createDataFile(PATH.dirname(path), PATH.basename(path), getRequest.result, true, true, true);
     ok++;
     if (ok + fail == total) finish();
    };
    getRequest.onerror = function getRequest_onerror() {
     fail++;
     if (ok + fail == total) finish();
    };
   });
   transaction.onerror = onerror;
  };
  openRequest.onerror = onerror;
 }
};

var ERRNO_CODES = {
 EPERM: 1,
 ENOENT: 2,
 ESRCH: 3,
 EINTR: 4,
 EIO: 5,
 ENXIO: 6,
 E2BIG: 7,
 ENOEXEC: 8,
 EBADF: 9,
 ECHILD: 10,
 EAGAIN: 11,
 EWOULDBLOCK: 11,
 ENOMEM: 12,
 EACCES: 13,
 EFAULT: 14,
 ENOTBLK: 15,
 EBUSY: 16,
 EEXIST: 17,
 EXDEV: 18,
 ENODEV: 19,
 ENOTDIR: 20,
 EISDIR: 21,
 EINVAL: 22,
 ENFILE: 23,
 EMFILE: 24,
 ENOTTY: 25,
 ETXTBSY: 26,
 EFBIG: 27,
 ENOSPC: 28,
 ESPIPE: 29,
 EROFS: 30,
 EMLINK: 31,
 EPIPE: 32,
 EDOM: 33,
 ERANGE: 34,
 ENOMSG: 42,
 EIDRM: 43,
 ECHRNG: 44,
 EL2NSYNC: 45,
 EL3HLT: 46,
 EL3RST: 47,
 ELNRNG: 48,
 EUNATCH: 49,
 ENOCSI: 50,
 EL2HLT: 51,
 EDEADLK: 35,
 ENOLCK: 37,
 EBADE: 52,
 EBADR: 53,
 EXFULL: 54,
 ENOANO: 55,
 EBADRQC: 56,
 EBADSLT: 57,
 EDEADLOCK: 35,
 EBFONT: 59,
 ENOSTR: 60,
 ENODATA: 61,
 ETIME: 62,
 ENOSR: 63,
 ENONET: 64,
 ENOPKG: 65,
 EREMOTE: 66,
 ENOLINK: 67,
 EADV: 68,
 ESRMNT: 69,
 ECOMM: 70,
 EPROTO: 71,
 EMULTIHOP: 72,
 EDOTDOT: 73,
 EBADMSG: 74,
 ENOTUNIQ: 76,
 EBADFD: 77,
 EREMCHG: 78,
 ELIBACC: 79,
 ELIBBAD: 80,
 ELIBSCN: 81,
 ELIBMAX: 82,
 ELIBEXEC: 83,
 ENOSYS: 38,
 ENOTEMPTY: 39,
 ENAMETOOLONG: 36,
 ELOOP: 40,
 EOPNOTSUPP: 95,
 EPFNOSUPPORT: 96,
 ECONNRESET: 104,
 ENOBUFS: 105,
 EAFNOSUPPORT: 97,
 EPROTOTYPE: 91,
 ENOTSOCK: 88,
 ENOPROTOOPT: 92,
 ESHUTDOWN: 108,
 ECONNREFUSED: 111,
 EADDRINUSE: 98,
 ECONNABORTED: 103,
 ENETUNREACH: 101,
 ENETDOWN: 100,
 ETIMEDOUT: 110,
 EHOSTDOWN: 112,
 EHOSTUNREACH: 113,
 EINPROGRESS: 115,
 EALREADY: 114,
 EDESTADDRREQ: 89,
 EMSGSIZE: 90,
 EPROTONOSUPPORT: 93,
 ESOCKTNOSUPPORT: 94,
 EADDRNOTAVAIL: 99,
 ENETRESET: 102,
 EISCONN: 106,
 ENOTCONN: 107,
 ETOOMANYREFS: 109,
 EUSERS: 87,
 EDQUOT: 122,
 ESTALE: 116,
 ENOTSUP: 95,
 ENOMEDIUM: 123,
 EILSEQ: 84,
 EOVERFLOW: 75,
 ECANCELED: 125,
 ENOTRECOVERABLE: 131,
 EOWNERDEAD: 130,
 ESTRPIPE: 86
};

var SYSCALLS = {
 DEFAULT_POLLMASK: 5,
 mappings: {},
 umask: 511,
 calculateAt: function(dirfd, path) {
  if (path[0] !== "/") {
   var dir;
   if (dirfd === -100) {
    dir = FS.cwd();
   } else {
    var dirstream = FS.getStream(dirfd);
    if (!dirstream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
    dir = dirstream.path;
   }
   path = PATH.join2(dir, path);
  }
  return path;
 },
 doStat: function(func, path, buf) {
  try {
   var stat = func(path);
  } catch (e) {
   if (e && e.node && PATH.normalize(path) !== PATH.normalize(FS.getPath(e.node))) {
    return -ERRNO_CODES.ENOTDIR;
   }
   throw e;
  }
  HEAP32[buf >> 2] = stat.dev;
  HEAP32[buf + 4 >> 2] = 0;
  HEAP32[buf + 8 >> 2] = stat.ino;
  HEAP32[buf + 12 >> 2] = stat.mode;
  HEAP32[buf + 16 >> 2] = stat.nlink;
  HEAP32[buf + 20 >> 2] = stat.uid;
  HEAP32[buf + 24 >> 2] = stat.gid;
  HEAP32[buf + 28 >> 2] = stat.rdev;
  HEAP32[buf + 32 >> 2] = 0;
  HEAP32[buf + 36 >> 2] = stat.size;
  HEAP32[buf + 40 >> 2] = 4096;
  HEAP32[buf + 44 >> 2] = stat.blocks;
  HEAP32[buf + 48 >> 2] = stat.atime.getTime() / 1e3 | 0;
  HEAP32[buf + 52 >> 2] = 0;
  HEAP32[buf + 56 >> 2] = stat.mtime.getTime() / 1e3 | 0;
  HEAP32[buf + 60 >> 2] = 0;
  HEAP32[buf + 64 >> 2] = stat.ctime.getTime() / 1e3 | 0;
  HEAP32[buf + 68 >> 2] = 0;
  HEAP32[buf + 72 >> 2] = stat.ino;
  return 0;
 },
 doMsync: function(addr, stream, len, flags) {
  var buffer = new Uint8Array(HEAPU8.subarray(addr, addr + len));
  FS.msync(stream, buffer, 0, len, flags);
 },
 doMkdir: function(path, mode) {
  path = PATH.normalize(path);
  if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
  FS.mkdir(path, mode, 0);
  return 0;
 },
 doMknod: function(path, mode, dev) {
  switch (mode & 61440) {
  case 32768:
  case 8192:
  case 24576:
  case 4096:
  case 49152:
   break;

  default:
   return -ERRNO_CODES.EINVAL;
  }
  FS.mknod(path, mode, dev);
  return 0;
 },
 doReadlink: function(path, buf, bufsize) {
  if (bufsize <= 0) return -ERRNO_CODES.EINVAL;
  var ret = FS.readlink(path);
  var len = Math.min(bufsize, lengthBytesUTF8(ret));
  var endChar = HEAP8[buf + len];
  stringToUTF8(ret, buf, bufsize + 1);
  HEAP8[buf + len] = endChar;
  return len;
 },
 doAccess: function(path, amode) {
  if (amode & ~7) {
   return -ERRNO_CODES.EINVAL;
  }
  var node;
  var lookup = FS.lookupPath(path, {
   follow: true
  });
  node = lookup.node;
  var perms = "";
  if (amode & 4) perms += "r";
  if (amode & 2) perms += "w";
  if (amode & 1) perms += "x";
  if (perms && FS.nodePermissions(node, perms)) {
   return -ERRNO_CODES.EACCES;
  }
  return 0;
 },
 doDup: function(path, flags, suggestFD) {
  var suggest = FS.getStream(suggestFD);
  if (suggest) FS.close(suggest);
  return FS.open(path, flags, 0, suggestFD, suggestFD).fd;
 },
 doReadv: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.read(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
   if (curr < len) break;
  }
  return ret;
 },
 doWritev: function(stream, iov, iovcnt, offset) {
  var ret = 0;
  for (var i = 0; i < iovcnt; i++) {
   var ptr = HEAP32[iov + i * 8 >> 2];
   var len = HEAP32[iov + (i * 8 + 4) >> 2];
   var curr = FS.write(stream, HEAP8, ptr, len, offset);
   if (curr < 0) return -1;
   ret += curr;
  }
  return ret;
 },
 varargs: 0,
 get: function(varargs) {
  SYSCALLS.varargs += 4;
  var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
  return ret;
 },
 getStr: function() {
  var ret = UTF8ToString(SYSCALLS.get());
  return ret;
 },
 getStreamFromFD: function() {
  var stream = FS.getStream(SYSCALLS.get());
  if (!stream) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return stream;
 },
 getSocketFromFD: function() {
  var socket = SOCKFS.getSocket(SYSCALLS.get());
  if (!socket) throw new FS.ErrnoError(ERRNO_CODES.EBADF);
  return socket;
 },
 getSocketAddress: function(allowNull) {
  var addrp = SYSCALLS.get(), addrlen = SYSCALLS.get();
  if (allowNull && addrp === 0) return null;
  var info = __read_sockaddr(addrp, addrlen);
  if (info.errno) throw new FS.ErrnoError(info.errno);
  info.addr = DNS.lookup_addr(info.addr) || info.addr;
  return info;
 },
 get64: function() {
  var low = SYSCALLS.get(), high = SYSCALLS.get();
  return low;
 },
 getZero: function() {
  SYSCALLS.get();
 }
};

function ___syscall140(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), offset_high = SYSCALLS.get(), offset_low = SYSCALLS.get(), result = SYSCALLS.get(), whence = SYSCALLS.get();
  var offset = offset_low;
  FS.llseek(stream, offset, whence);
  HEAP32[result >> 2] = stream.position;
  if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null;
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall145(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doReadv(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall146(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), iov = SYSCALLS.get(), iovcnt = SYSCALLS.get();
  return SYSCALLS.doWritev(stream, iov, iovcnt);
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall221(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), cmd = SYSCALLS.get();
  switch (cmd) {
  case 0:
   {
    var arg = SYSCALLS.get();
    if (arg < 0) {
     return -ERRNO_CODES.EINVAL;
    }
    var newStream;
    newStream = FS.open(stream.path, stream.flags, 0, arg);
    return newStream.fd;
   }

  case 1:
  case 2:
   return 0;

  case 3:
   return stream.flags;

  case 4:
   {
    var arg = SYSCALLS.get();
    stream.flags |= arg;
    return 0;
   }

  case 12:
   {
    var arg = SYSCALLS.get();
    var offset = 0;
    HEAP16[arg + offset >> 1] = 2;
    return 0;
   }

  case 13:
  case 14:
   return 0;

  case 16:
  case 8:
   return -ERRNO_CODES.EINVAL;

  case 9:
   ___setErrNo(ERRNO_CODES.EINVAL);
   return -1;

  default:
   {
    return -ERRNO_CODES.EINVAL;
   }
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall5(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var pathname = SYSCALLS.getStr(), flags = SYSCALLS.get(), mode = SYSCALLS.get();
  var stream = FS.open(pathname, flags, mode);
  return stream.fd;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall54(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD(), op = SYSCALLS.get();
  switch (op) {
  case 21509:
  case 21505:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }

  case 21510:
  case 21511:
  case 21512:
  case 21506:
  case 21507:
  case 21508:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }

  case 21519:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    var argp = SYSCALLS.get();
    HEAP32[argp >> 2] = 0;
    return 0;
   }

  case 21520:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return -ERRNO_CODES.EINVAL;
   }

  case 21531:
   {
    var argp = SYSCALLS.get();
    return FS.ioctl(stream, op, argp);
   }

  case 21523:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }

  case 21524:
   {
    if (!stream.tty) return -ERRNO_CODES.ENOTTY;
    return 0;
   }

  default:
   abort("bad ioctl syscall " + op);
  }
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall6(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var stream = SYSCALLS.getStreamFromFD();
  FS.close(stream);
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___syscall91(which, varargs) {
 SYSCALLS.varargs = varargs;
 try {
  var addr = SYSCALLS.get(), len = SYSCALLS.get();
  var info = SYSCALLS.mappings[addr];
  if (!info) return 0;
  if (len === info.len) {
   var stream = FS.getStream(info.fd);
   SYSCALLS.doMsync(addr, stream, len, info.flags);
   FS.munmap(stream);
   SYSCALLS.mappings[addr] = null;
   if (info.allocated) {
    _free(info.malloc);
   }
  }
  return 0;
 } catch (e) {
  if (typeof FS === "undefined" || !(e instanceof FS.ErrnoError)) abort(e);
  return -e.errno;
 }
}

function ___unlock() {}

function _abort() {
 Module["abort"]();
}

function _emscripten_set_main_loop_timing(mode, value) {
 Browser.mainLoop.timingMode = mode;
 Browser.mainLoop.timingValue = value;
 if (!Browser.mainLoop.func) {
  return 1;
 }
 if (mode == 0) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
   var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now()) | 0;
   setTimeout(Browser.mainLoop.runner, timeUntilNextTick);
  };
  Browser.mainLoop.method = "timeout";
 } else if (mode == 1) {
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
   Browser.requestAnimationFrame(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "rAF";
 } else if (mode == 2) {
  if (typeof setImmediate === "undefined") {
   var setImmediates = [];
   var emscriptenMainLoopMessageId = "setimmediate";
   var Browser_setImmediate_messageHandler = function(event) {
    if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
     event.stopPropagation();
     setImmediates.shift()();
    }
   };
   addEventListener("message", Browser_setImmediate_messageHandler, true);
   setImmediate = function Browser_emulated_setImmediate(func) {
    setImmediates.push(func);
    if (ENVIRONMENT_IS_WORKER) {
     if (Module["setImmediates"] === undefined) Module["setImmediates"] = [];
     Module["setImmediates"].push(func);
     postMessage({
      target: emscriptenMainLoopMessageId
     });
    } else postMessage(emscriptenMainLoopMessageId, "*");
   };
  }
  Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
   setImmediate(Browser.mainLoop.runner);
  };
  Browser.mainLoop.method = "immediate";
 }
 return 0;
}

function _emscripten_get_now() {
 abort();
}

function _emscripten_set_main_loop(func, fps, simulateInfiniteLoop, arg, noSetTiming) {
 Module["noExitRuntime"] = true;
 assert(!Browser.mainLoop.func, "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.");
 Browser.mainLoop.func = func;
 Browser.mainLoop.arg = arg;
 var browserIterationFunc;
 if (typeof arg !== "undefined") {
  browserIterationFunc = function() {
   Module["dynCall_vi"](func, arg);
  };
 } else {
  browserIterationFunc = function() {
   Module["dynCall_v"](func);
  };
 }
 var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop;
 Browser.mainLoop.runner = function Browser_mainLoop_runner() {
  if (ABORT) return;
  if (Browser.mainLoop.queue.length > 0) {
   var start = Date.now();
   var blocker = Browser.mainLoop.queue.shift();
   blocker.func(blocker.arg);
   if (Browser.mainLoop.remainingBlockers) {
    var remaining = Browser.mainLoop.remainingBlockers;
    var next = remaining % 1 == 0 ? remaining - 1 : Math.floor(remaining);
    if (blocker.counted) {
     Browser.mainLoop.remainingBlockers = next;
    } else {
     next = next + .5;
     Browser.mainLoop.remainingBlockers = (8 * remaining + next) / 9;
    }
   }
   console.log('main loop blocker "' + blocker.name + '" took ' + (Date.now() - start) + " ms");
   Browser.mainLoop.updateStatus();
   if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
   setTimeout(Browser.mainLoop.runner, 0);
   return;
  }
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
  if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
   Browser.mainLoop.scheduler();
   return;
  } else if (Browser.mainLoop.timingMode == 0) {
   Browser.mainLoop.tickStartTime = _emscripten_get_now();
  }
  if (Browser.mainLoop.method === "timeout" && Module.ctx) {
   err("Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!");
   Browser.mainLoop.method = "";
  }
  Browser.mainLoop.runIter(browserIterationFunc);
  if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) return;
  if (typeof SDL === "object" && SDL.audio && SDL.audio.queueNewAudioData) SDL.audio.queueNewAudioData();
  Browser.mainLoop.scheduler();
 };
 if (!noSetTiming) {
  if (fps && fps > 0) _emscripten_set_main_loop_timing(0, 1e3 / fps); else _emscripten_set_main_loop_timing(1, 1);
  Browser.mainLoop.scheduler();
 }
 if (simulateInfiniteLoop) {
  throw "SimulateInfiniteLoop";
 }
}

var Browser = {
 mainLoop: {
  scheduler: null,
  method: "",
  currentlyRunningMainloop: 0,
  func: null,
  arg: 0,
  timingMode: 0,
  timingValue: 0,
  currentFrameNumber: 0,
  queue: [],
  pause: function() {
   Browser.mainLoop.scheduler = null;
   Browser.mainLoop.currentlyRunningMainloop++;
  },
  resume: function() {
   Browser.mainLoop.currentlyRunningMainloop++;
   var timingMode = Browser.mainLoop.timingMode;
   var timingValue = Browser.mainLoop.timingValue;
   var func = Browser.mainLoop.func;
   Browser.mainLoop.func = null;
   _emscripten_set_main_loop(func, 0, false, Browser.mainLoop.arg, true);
   _emscripten_set_main_loop_timing(timingMode, timingValue);
   Browser.mainLoop.scheduler();
  },
  updateStatus: function() {
   if (Module["setStatus"]) {
    var message = Module["statusMessage"] || "Please wait...";
    var remaining = Browser.mainLoop.remainingBlockers;
    var expected = Browser.mainLoop.expectedBlockers;
    if (remaining) {
     if (remaining < expected) {
      Module["setStatus"](message + " (" + (expected - remaining) + "/" + expected + ")");
     } else {
      Module["setStatus"](message);
     }
    } else {
     Module["setStatus"]("");
    }
   }
  },
  runIter: function(func) {
   if (ABORT) return;
   if (Module["preMainLoop"]) {
    var preRet = Module["preMainLoop"]();
    if (preRet === false) {
     return;
    }
   }
   try {
    func();
   } catch (e) {
    if (e instanceof ExitStatus) {
     return;
    } else {
     if (e && typeof e === "object" && e.stack) err("exception thrown: " + [ e, e.stack ]);
     throw e;
    }
   }
   if (Module["postMainLoop"]) Module["postMainLoop"]();
  }
 },
 isFullscreen: false,
 pointerLock: false,
 moduleContextCreatedCallbacks: [],
 workers: [],
 init: function() {
  if (!Module["preloadPlugins"]) Module["preloadPlugins"] = [];
  if (Browser.initted) return;
  Browser.initted = true;
  try {
   new Blob();
   Browser.hasBlobConstructor = true;
  } catch (e) {
   Browser.hasBlobConstructor = false;
   console.log("warning: no blob constructor, cannot create blobs with mimetypes");
  }
  Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : !Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null;
  Browser.URLObject = typeof window != "undefined" ? window.URL ? window.URL : window.webkitURL : undefined;
  if (!Module.noImageDecoding && typeof Browser.URLObject === "undefined") {
   console.log("warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.");
   Module.noImageDecoding = true;
  }
  var imagePlugin = {};
  imagePlugin["canHandle"] = function imagePlugin_canHandle(name) {
   return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
  };
  imagePlugin["handle"] = function imagePlugin_handle(byteArray, name, onload, onerror) {
   var b = null;
   if (Browser.hasBlobConstructor) {
    try {
     b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
     if (b.size !== byteArray.length) {
      b = new Blob([ new Uint8Array(byteArray).buffer ], {
       type: Browser.getMimetype(name)
      });
     }
    } catch (e) {
     warnOnce("Blob constructor present but fails: " + e + "; falling back to blob builder");
    }
   }
   if (!b) {
    var bb = new Browser.BlobBuilder();
    bb.append(new Uint8Array(byteArray).buffer);
    b = bb.getBlob();
   }
   var url = Browser.URLObject.createObjectURL(b);
   var img = new Image();
   img.onload = function img_onload() {
    assert(img.complete, "Image " + name + " could not be decoded");
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    Module["preloadedImages"][name] = canvas;
    Browser.URLObject.revokeObjectURL(url);
    if (onload) onload(byteArray);
   };
   img.onerror = function img_onerror(event) {
    console.log("Image " + url + " could not be decoded");
    if (onerror) onerror();
   };
   img.src = url;
  };
  Module["preloadPlugins"].push(imagePlugin);
  var audioPlugin = {};
  audioPlugin["canHandle"] = function audioPlugin_canHandle(name) {
   return !Module.noAudioDecoding && name.substr(-4) in {
    ".ogg": 1,
    ".wav": 1,
    ".mp3": 1
   };
  };
  audioPlugin["handle"] = function audioPlugin_handle(byteArray, name, onload, onerror) {
   var done = false;
   function finish(audio) {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = audio;
    if (onload) onload(byteArray);
   }
   function fail() {
    if (done) return;
    done = true;
    Module["preloadedAudios"][name] = new Audio();
    if (onerror) onerror();
   }
   if (Browser.hasBlobConstructor) {
    try {
     var b = new Blob([ byteArray ], {
      type: Browser.getMimetype(name)
     });
    } catch (e) {
     return fail();
    }
    var url = Browser.URLObject.createObjectURL(b);
    var audio = new Audio();
    audio.addEventListener("canplaythrough", function() {
     finish(audio);
    }, false);
    audio.onerror = function audio_onerror(event) {
     if (done) return;
     console.log("warning: browser could not fully decode audio " + name + ", trying slower base64 approach");
     function encode64(data) {
      var BASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var PAD = "=";
      var ret = "";
      var leftchar = 0;
      var leftbits = 0;
      for (var i = 0; i < data.length; i++) {
       leftchar = leftchar << 8 | data[i];
       leftbits += 8;
       while (leftbits >= 6) {
        var curr = leftchar >> leftbits - 6 & 63;
        leftbits -= 6;
        ret += BASE[curr];
       }
      }
      if (leftbits == 2) {
       ret += BASE[(leftchar & 3) << 4];
       ret += PAD + PAD;
      } else if (leftbits == 4) {
       ret += BASE[(leftchar & 15) << 2];
       ret += PAD;
      }
      return ret;
     }
     audio.src = "data:audio/x-" + name.substr(-3) + ";base64," + encode64(byteArray);
     finish(audio);
    };
    audio.src = url;
    Browser.safeSetTimeout(function() {
     finish(audio);
    }, 1e4);
   } else {
    return fail();
   }
  };
  Module["preloadPlugins"].push(audioPlugin);
  function pointerLockChange() {
   Browser.pointerLock = document["pointerLockElement"] === Module["canvas"] || document["mozPointerLockElement"] === Module["canvas"] || document["webkitPointerLockElement"] === Module["canvas"] || document["msPointerLockElement"] === Module["canvas"];
  }
  var canvas = Module["canvas"];
  if (canvas) {
   canvas.requestPointerLock = canvas["requestPointerLock"] || canvas["mozRequestPointerLock"] || canvas["webkitRequestPointerLock"] || canvas["msRequestPointerLock"] || function() {};
   canvas.exitPointerLock = document["exitPointerLock"] || document["mozExitPointerLock"] || document["webkitExitPointerLock"] || document["msExitPointerLock"] || function() {};
   canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
   document.addEventListener("pointerlockchange", pointerLockChange, false);
   document.addEventListener("mozpointerlockchange", pointerLockChange, false);
   document.addEventListener("webkitpointerlockchange", pointerLockChange, false);
   document.addEventListener("mspointerlockchange", pointerLockChange, false);
   if (Module["elementPointerLock"]) {
    canvas.addEventListener("click", function(ev) {
     if (!Browser.pointerLock && Module["canvas"].requestPointerLock) {
      Module["canvas"].requestPointerLock();
      ev.preventDefault();
     }
    }, false);
   }
  }
 },
 createContext: function(canvas, useWebGL, setInModule, webGLContextAttributes) {
  if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx;
  var ctx;
  var contextHandle;
  if (useWebGL) {
   var contextAttributes = {
    antialias: false,
    alpha: false,
    majorVersion: 1
   };
   if (webGLContextAttributes) {
    for (var attribute in webGLContextAttributes) {
     contextAttributes[attribute] = webGLContextAttributes[attribute];
    }
   }
   if (typeof GL !== "undefined") {
    contextHandle = GL.createContext(canvas, contextAttributes);
    if (contextHandle) {
     ctx = GL.getContext(contextHandle).GLctx;
    }
   }
  } else {
   ctx = canvas.getContext("2d");
  }
  if (!ctx) return null;
  if (setInModule) {
   if (!useWebGL) assert(typeof GLctx === "undefined", "cannot set in module if GLctx is used, but we are a non-GL context that would replace it");
   Module.ctx = ctx;
   if (useWebGL) GL.makeContextCurrent(contextHandle);
   Module.useWebGL = useWebGL;
   Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
    callback();
   });
   Browser.init();
  }
  return ctx;
 },
 destroyContext: function(canvas, useWebGL, setInModule) {},
 fullscreenHandlersInstalled: false,
 lockPointer: undefined,
 resizeCanvas: undefined,
 requestFullscreen: function(lockPointer, resizeCanvas, vrDevice) {
  Browser.lockPointer = lockPointer;
  Browser.resizeCanvas = resizeCanvas;
  Browser.vrDevice = vrDevice;
  if (typeof Browser.lockPointer === "undefined") Browser.lockPointer = true;
  if (typeof Browser.resizeCanvas === "undefined") Browser.resizeCanvas = false;
  if (typeof Browser.vrDevice === "undefined") Browser.vrDevice = null;
  var canvas = Module["canvas"];
  function fullscreenChange() {
   Browser.isFullscreen = false;
   var canvasContainer = canvas.parentNode;
   if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvasContainer) {
    canvas.exitFullscreen = document["exitFullscreen"] || document["cancelFullScreen"] || document["mozCancelFullScreen"] || document["msExitFullscreen"] || document["webkitCancelFullScreen"] || function() {};
    canvas.exitFullscreen = canvas.exitFullscreen.bind(document);
    if (Browser.lockPointer) canvas.requestPointerLock();
    Browser.isFullscreen = true;
    if (Browser.resizeCanvas) {
     Browser.setFullscreenCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   } else {
    canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
    canvasContainer.parentNode.removeChild(canvasContainer);
    if (Browser.resizeCanvas) {
     Browser.setWindowedCanvasSize();
    } else {
     Browser.updateCanvasDimensions(canvas);
    }
   }
   if (Module["onFullScreen"]) Module["onFullScreen"](Browser.isFullscreen);
   if (Module["onFullscreen"]) Module["onFullscreen"](Browser.isFullscreen);
  }
  if (!Browser.fullscreenHandlersInstalled) {
   Browser.fullscreenHandlersInstalled = true;
   document.addEventListener("fullscreenchange", fullscreenChange, false);
   document.addEventListener("mozfullscreenchange", fullscreenChange, false);
   document.addEventListener("webkitfullscreenchange", fullscreenChange, false);
   document.addEventListener("MSFullscreenChange", fullscreenChange, false);
  }
  var canvasContainer = document.createElement("div");
  canvas.parentNode.insertBefore(canvasContainer, canvas);
  canvasContainer.appendChild(canvas);
  canvasContainer.requestFullscreen = canvasContainer["requestFullscreen"] || canvasContainer["mozRequestFullScreen"] || canvasContainer["msRequestFullscreen"] || (canvasContainer["webkitRequestFullscreen"] ? function() {
   canvasContainer["webkitRequestFullscreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null) || (canvasContainer["webkitRequestFullScreen"] ? function() {
   canvasContainer["webkitRequestFullScreen"](Element["ALLOW_KEYBOARD_INPUT"]);
  } : null);
  if (vrDevice) {
   canvasContainer.requestFullscreen({
    vrDisplay: vrDevice
   });
  } else {
   canvasContainer.requestFullscreen();
  }
 },
 requestFullScreen: function(lockPointer, resizeCanvas, vrDevice) {
  err("Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.");
  Browser.requestFullScreen = function(lockPointer, resizeCanvas, vrDevice) {
   return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
  };
  return Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
 },
 nextRAF: 0,
 fakeRequestAnimationFrame: function(func) {
  var now = Date.now();
  if (Browser.nextRAF === 0) {
   Browser.nextRAF = now + 1e3 / 60;
  } else {
   while (now + 2 >= Browser.nextRAF) {
    Browser.nextRAF += 1e3 / 60;
   }
  }
  var delay = Math.max(Browser.nextRAF - now, 0);
  setTimeout(func, delay);
 },
 requestAnimationFrame: function requestAnimationFrame(func) {
  if (typeof window === "undefined") {
   Browser.fakeRequestAnimationFrame(func);
  } else {
   if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window["requestAnimationFrame"] || window["mozRequestAnimationFrame"] || window["webkitRequestAnimationFrame"] || window["msRequestAnimationFrame"] || window["oRequestAnimationFrame"] || Browser.fakeRequestAnimationFrame;
   }
   window.requestAnimationFrame(func);
  }
 },
 safeCallback: function(func) {
  return function() {
   if (!ABORT) return func.apply(null, arguments);
  };
 },
 allowAsyncCallbacks: true,
 queuedAsyncCallbacks: [],
 pauseAsyncCallbacks: function() {
  Browser.allowAsyncCallbacks = false;
 },
 resumeAsyncCallbacks: function() {
  Browser.allowAsyncCallbacks = true;
  if (Browser.queuedAsyncCallbacks.length > 0) {
   var callbacks = Browser.queuedAsyncCallbacks;
   Browser.queuedAsyncCallbacks = [];
   callbacks.forEach(function(func) {
    func();
   });
  }
 },
 safeRequestAnimationFrame: function(func) {
  return Browser.requestAnimationFrame(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  });
 },
 safeSetTimeout: function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setTimeout(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   } else {
    Browser.queuedAsyncCallbacks.push(func);
   }
  }, timeout);
 },
 safeSetInterval: function(func, timeout) {
  Module["noExitRuntime"] = true;
  return setInterval(function() {
   if (ABORT) return;
   if (Browser.allowAsyncCallbacks) {
    func();
   }
  }, timeout);
 },
 getMimetype: function(name) {
  return {
   "jpg": "image/jpeg",
   "jpeg": "image/jpeg",
   "png": "image/png",
   "bmp": "image/bmp",
   "ogg": "audio/ogg",
   "wav": "audio/wav",
   "mp3": "audio/mpeg"
  }[name.substr(name.lastIndexOf(".") + 1)];
 },
 getUserMedia: function(func) {
  if (!window.getUserMedia) {
   window.getUserMedia = navigator["getUserMedia"] || navigator["mozGetUserMedia"];
  }
  window.getUserMedia(func);
 },
 getMovementX: function(event) {
  return event["movementX"] || event["mozMovementX"] || event["webkitMovementX"] || 0;
 },
 getMovementY: function(event) {
  return event["movementY"] || event["mozMovementY"] || event["webkitMovementY"] || 0;
 },
 getMouseWheelDelta: function(event) {
  var delta = 0;
  switch (event.type) {
  case "DOMMouseScroll":
   delta = event.detail;
   break;

  case "mousewheel":
   delta = event.wheelDelta;
   break;

  case "wheel":
   delta = event["deltaY"];
   break;

  default:
   throw "unrecognized mouse wheel event: " + event.type;
  }
  return delta;
 },
 mouseX: 0,
 mouseY: 0,
 mouseMovementX: 0,
 mouseMovementY: 0,
 touches: {},
 lastTouches: {},
 calculateMouseEvent: function(event) {
  if (Browser.pointerLock) {
   if (event.type != "mousemove" && "mozMovementX" in event) {
    Browser.mouseMovementX = Browser.mouseMovementY = 0;
   } else {
    Browser.mouseMovementX = Browser.getMovementX(event);
    Browser.mouseMovementY = Browser.getMovementY(event);
   }
   if (typeof SDL != "undefined") {
    Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
    Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
   } else {
    Browser.mouseX += Browser.mouseMovementX;
    Browser.mouseY += Browser.mouseMovementY;
   }
  } else {
   var rect = Module["canvas"].getBoundingClientRect();
   var cw = Module["canvas"].width;
   var ch = Module["canvas"].height;
   var scrollX = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
   var scrollY = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
   if (event.type === "touchstart" || event.type === "touchend" || event.type === "touchmove") {
    var touch = event.touch;
    if (touch === undefined) {
     return;
    }
    var adjustedX = touch.pageX - (scrollX + rect.left);
    var adjustedY = touch.pageY - (scrollY + rect.top);
    adjustedX = adjustedX * (cw / rect.width);
    adjustedY = adjustedY * (ch / rect.height);
    var coords = {
     x: adjustedX,
     y: adjustedY
    };
    if (event.type === "touchstart") {
     Browser.lastTouches[touch.identifier] = coords;
     Browser.touches[touch.identifier] = coords;
    } else if (event.type === "touchend" || event.type === "touchmove") {
     var last = Browser.touches[touch.identifier];
     if (!last) last = coords;
     Browser.lastTouches[touch.identifier] = last;
     Browser.touches[touch.identifier] = coords;
    }
    return;
   }
   var x = event.pageX - (scrollX + rect.left);
   var y = event.pageY - (scrollY + rect.top);
   x = x * (cw / rect.width);
   y = y * (ch / rect.height);
   Browser.mouseMovementX = x - Browser.mouseX;
   Browser.mouseMovementY = y - Browser.mouseY;
   Browser.mouseX = x;
   Browser.mouseY = y;
  }
 },
 asyncLoad: function(url, onload, onerror, noRunDep) {
  var dep = !noRunDep ? getUniqueRunDependency("al " + url) : "";
  Module["readAsync"](url, function(arrayBuffer) {
   assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
   onload(new Uint8Array(arrayBuffer));
   if (dep) removeRunDependency(dep);
  }, function(event) {
   if (onerror) {
    onerror();
   } else {
    throw 'Loading data file "' + url + '" failed.';
   }
  });
  if (dep) addRunDependency(dep);
 },
 resizeListeners: [],
 updateResizeListeners: function() {
  var canvas = Module["canvas"];
  Browser.resizeListeners.forEach(function(listener) {
   listener(canvas.width, canvas.height);
  });
 },
 setCanvasSize: function(width, height, noUpdates) {
  var canvas = Module["canvas"];
  Browser.updateCanvasDimensions(canvas, width, height);
  if (!noUpdates) Browser.updateResizeListeners();
 },
 windowedWidth: 0,
 windowedHeight: 0,
 setFullscreenCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags | 8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 setWindowedCanvasSize: function() {
  if (typeof SDL != "undefined") {
   var flags = HEAPU32[SDL.screen >> 2];
   flags = flags & ~8388608;
   HEAP32[SDL.screen >> 2] = flags;
  }
  Browser.updateCanvasDimensions(Module["canvas"]);
  Browser.updateResizeListeners();
 },
 updateCanvasDimensions: function(canvas, wNative, hNative) {
  if (wNative && hNative) {
   canvas.widthNative = wNative;
   canvas.heightNative = hNative;
  } else {
   wNative = canvas.widthNative;
   hNative = canvas.heightNative;
  }
  var w = wNative;
  var h = hNative;
  if (Module["forcedAspectRatio"] && Module["forcedAspectRatio"] > 0) {
   if (w / h < Module["forcedAspectRatio"]) {
    w = Math.round(h * Module["forcedAspectRatio"]);
   } else {
    h = Math.round(w / Module["forcedAspectRatio"]);
   }
  }
  if ((document["fullscreenElement"] || document["mozFullScreenElement"] || document["msFullscreenElement"] || document["webkitFullscreenElement"] || document["webkitCurrentFullScreenElement"]) === canvas.parentNode && typeof screen != "undefined") {
   var factor = Math.min(screen.width / w, screen.height / h);
   w = Math.round(w * factor);
   h = Math.round(h * factor);
  }
  if (Browser.resizeCanvas) {
   if (canvas.width != w) canvas.width = w;
   if (canvas.height != h) canvas.height = h;
   if (typeof canvas.style != "undefined") {
    canvas.style.removeProperty("width");
    canvas.style.removeProperty("height");
   }
  } else {
   if (canvas.width != wNative) canvas.width = wNative;
   if (canvas.height != hNative) canvas.height = hNative;
   if (typeof canvas.style != "undefined") {
    if (w != wNative || h != hNative) {
     canvas.style.setProperty("width", w + "px", "important");
     canvas.style.setProperty("height", h + "px", "important");
    } else {
     canvas.style.removeProperty("width");
     canvas.style.removeProperty("height");
    }
   }
  }
 },
 wgetRequests: {},
 nextWgetRequestHandle: 0,
 getNextWgetRequestHandle: function() {
  var handle = Browser.nextWgetRequestHandle;
  Browser.nextWgetRequestHandle++;
  return handle;
 }
};

var AL = {
 QUEUE_INTERVAL: 25,
 QUEUE_LOOKAHEAD: .1,
 DEVICE_NAME: "Emscripten OpenAL",
 CAPTURE_DEVICE_NAME: "Emscripten OpenAL capture",
 ALC_EXTENSIONS: {
  ALC_SOFT_pause_device: true,
  ALC_SOFT_HRTF: true
 },
 AL_EXTENSIONS: {
  AL_EXT_float32: true,
  AL_SOFT_loop_points: true,
  AL_SOFT_source_length: true,
  AL_EXT_source_distance_model: true,
  AL_SOFT_source_spatialize: true
 },
 _alcErr: 0,
 alcErr: 0,
 deviceRefCounts: {},
 alcStringCache: {},
 paused: false,
 stringCache: {},
 contexts: {},
 currentCtx: null,
 buffers: {
  0: {
   id: 0,
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  }
 },
 paramArray: [],
 _nextId: 1,
 newId: function() {
  return AL.freeIds.length > 0 ? AL.freeIds.pop() : AL._nextId++;
 },
 freeIds: [],
 scheduleContextAudio: function(ctx) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  for (var i in ctx.sources) {
   AL.scheduleSourceAudio(ctx.sources[i]);
  }
 },
 scheduleSourceAudio: function(src, lookahead) {
  if (Browser.mainLoop.timingMode === 1 && document["visibilityState"] != "visible") {
   return;
  }
  if (src.state !== 4114) {
   return;
  }
  var currentTime = AL.updateSourceTime(src);
  var startTime = src.bufStartTime;
  var startOffset = src.bufOffset;
  var bufCursor = src.bufsProcessed;
  for (var i = 0; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   startTime = audioSrc._startTime + audioSrc._duration;
   startOffset = 0;
   bufCursor += audioSrc._skipCount + 1;
  }
  if (!lookahead) {
   lookahead = AL.QUEUE_LOOKAHEAD;
  }
  var lookaheadTime = currentTime + lookahead;
  var skipCount = 0;
  while (startTime < lookaheadTime) {
   if (bufCursor >= src.bufQueue.length) {
    if (src.looping) {
     bufCursor %= src.bufQueue.length;
    } else {
     break;
    }
   }
   var buf = src.bufQueue[bufCursor % src.bufQueue.length];
   if (buf.length === 0) {
    skipCount++;
    if (skipCount === src.bufQueue.length) {
     break;
    }
   } else {
    var audioSrc = src.context.audioCtx.createBufferSource();
    audioSrc.buffer = buf.audioBuf;
    audioSrc.playbackRate.value = src.playbackRate;
    if (buf.audioBuf._loopStart || buf.audioBuf._loopEnd) {
     audioSrc.loopStart = buf.audioBuf._loopStart;
     audioSrc.loopEnd = buf.audioBuf._loopEnd;
    }
    var duration = 0;
    if (src.type === 4136 && src.looping) {
     duration = Number.POSITIVE_INFINITY;
     audioSrc.loop = true;
     if (buf.audioBuf._loopStart) {
      audioSrc.loopStart = buf.audioBuf._loopStart;
     }
     if (buf.audioBuf._loopEnd) {
      audioSrc.loopEnd = buf.audioBuf._loopEnd;
     }
    } else {
     duration = (buf.audioBuf.duration - startOffset) / src.playbackRate;
    }
    audioSrc._startOffset = startOffset;
    audioSrc._duration = duration;
    audioSrc._skipCount = skipCount;
    skipCount = 0;
    audioSrc.connect(src.gain);
    if (typeof audioSrc.start !== "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.start(startTime, startOffset);
    } else if (typeof audioSrc.noteOn !== "undefined") {
     startTime = Math.max(startTime, src.context.audioCtx.currentTime);
     audioSrc.noteOn(startTime);
    }
    audioSrc._startTime = startTime;
    src.audioQueue.push(audioSrc);
    startTime += duration;
   }
   startOffset = 0;
   bufCursor++;
  }
 },
 updateSourceTime: function(src) {
  var currentTime = src.context.audioCtx.currentTime;
  if (src.state !== 4114) {
   return currentTime;
  }
  if (!isFinite(src.bufStartTime)) {
   src.bufStartTime = currentTime - src.bufOffset / src.playbackRate;
   src.bufOffset = 0;
  }
  var nextStartTime = 0;
  while (src.audioQueue.length) {
   var audioSrc = src.audioQueue[0];
   src.bufsProcessed += audioSrc._skipCount;
   nextStartTime = audioSrc._startTime + audioSrc._duration;
   if (currentTime < nextStartTime) {
    break;
   }
   src.audioQueue.shift();
   src.bufStartTime = nextStartTime;
   src.bufOffset = 0;
   src.bufsProcessed++;
  }
  if (src.bufsProcessed >= src.bufQueue.length && !src.looping) {
   AL.setSourceState(src, 4116);
  } else if (src.type === 4136 && src.looping) {
   var buf = src.bufQueue[0];
   if (buf.length === 0) {
    src.bufOffset = 0;
   } else {
    var delta = (currentTime - src.bufStartTime) * src.playbackRate;
    var loopStart = buf.audioBuf._loopStart || 0;
    var loopEnd = buf.audioBuf._loopEnd || buf.audioBuf.duration;
    if (loopEnd <= loopStart) {
     loopEnd = buf.audioBuf.duration;
    }
    if (delta < loopEnd) {
     src.bufOffset = delta;
    } else {
     src.bufOffset = loopStart + (delta - loopStart) % (loopEnd - loopStart);
    }
   }
  } else if (src.audioQueue[0]) {
   src.bufOffset = (currentTime - src.audioQueue[0]._startTime) * src.playbackRate;
  } else {
   if (src.type !== 4136 && src.looping) {
    var srcDuration = AL.sourceDuration(src) / src.playbackRate;
    if (srcDuration > 0) {
     src.bufStartTime += Math.floor((currentTime - src.bufStartTime) / srcDuration) * srcDuration;
    }
   }
   for (var i = 0; i < src.bufQueue.length; i++) {
    if (src.bufsProcessed >= src.bufQueue.length) {
     if (src.looping) {
      src.bufsProcessed %= src.bufQueue.length;
     } else {
      AL.setSourceState(src, 4116);
      break;
     }
    }
    var buf = src.bufQueue[src.bufsProcessed];
    if (buf.length > 0) {
     nextStartTime = src.bufStartTime + buf.audioBuf.duration / src.playbackRate;
     if (currentTime < nextStartTime) {
      src.bufOffset = (currentTime - src.bufStartTime) * src.playbackRate;
      break;
     }
     src.bufStartTime = nextStartTime;
    }
    src.bufOffset = 0;
    src.bufsProcessed++;
   }
  }
  return currentTime;
 },
 cancelPendingSourceAudio: function(src) {
  AL.updateSourceTime(src);
  for (var i = 1; i < src.audioQueue.length; i++) {
   var audioSrc = src.audioQueue[i];
   audioSrc.stop();
  }
  if (src.audioQueue.length > 1) {
   src.audioQueue.length = 1;
  }
 },
 stopSourceAudio: function(src) {
  for (var i = 0; i < src.audioQueue.length; i++) {
   src.audioQueue[i].stop();
  }
  src.audioQueue.length = 0;
 },
 setSourceState: function(src, state) {
  if (state === 4114) {
   if (src.state === 4114 || src.state == 4116) {
    src.bufsProcessed = 0;
    src.bufOffset = 0;
   } else {}
   AL.stopSourceAudio(src);
   src.state = 4114;
   src.bufStartTime = Number.NEGATIVE_INFINITY;
   AL.scheduleSourceAudio(src);
  } else if (state === 4115) {
   if (src.state === 4114) {
    AL.updateSourceTime(src);
    AL.stopSourceAudio(src);
    src.state = 4115;
   }
  } else if (state === 4116) {
   if (src.state !== 4113) {
    src.state = 4116;
    src.bufsProcessed = src.bufQueue.length;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  } else if (state === 4113) {
   if (src.state !== 4113) {
    src.state = 4113;
    src.bufsProcessed = 0;
    src.bufStartTime = Number.NEGATIVE_INFINITY;
    src.bufOffset = 0;
    AL.stopSourceAudio(src);
   }
  }
 },
 initSourcePanner: function(src) {
  if (src.type === 4144) {
   return;
  }
  var templateBuf = AL.buffers[0];
  for (var i = 0; i < src.bufQueue.length; i++) {
   if (src.bufQueue[i].id !== 0) {
    templateBuf = src.bufQueue[i];
    break;
   }
  }
  if (src.spatialize === 1 || src.spatialize === 2 && templateBuf.channels === 1) {
   if (src.panner) {
    return;
   }
   src.panner = src.context.audioCtx.createPanner();
   AL.updateSourceGlobal(src);
   AL.updateSourceSpace(src);
   src.panner.connect(src.context.gain);
   src.gain.disconnect();
   src.gain.connect(src.panner);
  } else {
   if (!src.panner) {
    return;
   }
   src.panner.disconnect();
   src.gain.disconnect();
   src.gain.connect(src.context.gain);
   src.panner = null;
  }
 },
 updateContextGlobal: function(ctx) {
  for (var i in ctx.sources) {
   AL.updateSourceGlobal(ctx.sources[i]);
  }
 },
 updateSourceGlobal: function(src) {
  var panner = src.panner;
  if (!panner) {
   return;
  }
  panner.refDistance = src.refDistance;
  panner.maxDistance = src.maxDistance;
  panner.rolloffFactor = src.rolloffFactor;
  panner.panningModel = src.context.hrtf ? "HRTF" : "equalpower";
  var distanceModel = src.context.sourceDistanceModel ? src.distanceModel : src.context.distanceModel;
  switch (distanceModel) {
  case 0:
   panner.distanceModel = "inverse";
   panner.refDistance = 3.40282e38;
   break;

  case 53249:
  case 53250:
   panner.distanceModel = "inverse";
   break;

  case 53251:
  case 53252:
   panner.distanceModel = "linear";
   break;

  case 53253:
  case 53254:
   panner.distanceModel = "exponential";
   break;
  }
 },
 updateListenerSpace: function(ctx) {
  var listener = ctx.audioCtx.listener;
  if (listener.positionX) {
   listener.positionX.value = ctx.listener.position[0];
   listener.positionY.value = ctx.listener.position[1];
   listener.positionZ.value = ctx.listener.position[2];
  } else {
   listener.setPosition(ctx.listener.position[0], ctx.listener.position[1], ctx.listener.position[2]);
  }
  if (listener.forwardX) {
   listener.forwardX.value = ctx.listener.direction[0];
   listener.forwardY.value = ctx.listener.direction[1];
   listener.forwardZ.value = ctx.listener.direction[2];
   listener.upX.value = ctx.listener.up[0];
   listener.upY.value = ctx.listener.up[1];
   listener.upZ.value = ctx.listener.up[2];
  } else {
   listener.setOrientation(ctx.listener.direction[0], ctx.listener.direction[1], ctx.listener.direction[2], ctx.listener.up[0], ctx.listener.up[1], ctx.listener.up[2]);
  }
  for (var i in ctx.sources) {
   AL.updateSourceSpace(ctx.sources[i]);
  }
 },
 updateSourceSpace: function(src) {
  if (!src.panner) {
   return;
  }
  var panner = src.panner;
  var posX = src.position[0];
  var posY = src.position[1];
  var posZ = src.position[2];
  var dirX = src.direction[0];
  var dirY = src.direction[1];
  var dirZ = src.direction[2];
  var listener = src.context.listener;
  var lPosX = listener.position[0];
  var lPosY = listener.position[1];
  var lPosZ = listener.position[2];
  if (src.relative) {
   var lBackX = -listener.direction[0];
   var lBackY = -listener.direction[1];
   var lBackZ = -listener.direction[2];
   var lUpX = listener.up[0];
   var lUpY = listener.up[1];
   var lUpZ = listener.up[2];
   function inverseMagnitude(x, y, z) {
    var length = Math.sqrt(x * x + y * y + z * z);
    if (length < Number.EPSILON) {
     return 0;
    }
    return 1 / length;
   }
   var invMag = inverseMagnitude(lBackX, lBackY, lBackZ);
   lBackX *= invMag;
   lBackY *= invMag;
   lBackZ *= invMag;
   invMag = inverseMagnitude(lUpX, lUpY, lUpZ);
   lUpX *= invMag;
   lUpY *= invMag;
   lUpZ *= invMag;
   var lRightX = lUpY * lBackZ - lUpZ * lBackY;
   var lRightY = lUpZ * lBackX - lUpX * lBackZ;
   var lRightZ = lUpX * lBackY - lUpY * lBackX;
   invMag = inverseMagnitude(lRightX, lRightY, lRightZ);
   lRightX *= invMag;
   lRightY *= invMag;
   lRightZ *= invMag;
   lUpX = lBackY * lRightZ - lBackZ * lRightY;
   lUpY = lBackZ * lRightX - lBackX * lRightZ;
   lUpZ = lBackX * lRightY - lBackY * lRightX;
   var oldX = dirX;
   var oldY = dirY;
   var oldZ = dirZ;
   dirX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   dirY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   dirZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   oldX = posX;
   oldY = posY;
   oldZ = posZ;
   posX = oldX * lRightX + oldY * lUpX + oldZ * lBackX;
   posY = oldX * lRightY + oldY * lUpY + oldZ * lBackY;
   posZ = oldX * lRightZ + oldY * lUpZ + oldZ * lBackZ;
   posX += lPosX;
   posY += lPosY;
   posZ += lPosZ;
  }
  if (panner.positionX) {
   panner.positionX.value = posX;
   panner.positionY.value = posY;
   panner.positionZ.value = posZ;
  } else {
   panner.setPosition(posX, posY, posZ);
  }
  if (panner.orientationX) {
   panner.orientationX.value = dirX;
   panner.orientationY.value = dirY;
   panner.orientationZ.value = dirZ;
  } else {
   panner.setOrientation(dirX, dirY, dirZ);
  }
  var oldShift = src.dopplerShift;
  var velX = src.velocity[0];
  var velY = src.velocity[1];
  var velZ = src.velocity[2];
  var lVelX = listener.velocity[0];
  var lVelY = listener.velocity[1];
  var lVelZ = listener.velocity[2];
  if (posX === lPosX && posY === lPosY && posZ === lPosZ || velX === lVelX && velY === lVelY && velZ === lVelZ) {
   src.dopplerShift = 1;
  } else {
   var speedOfSound = src.context.speedOfSound;
   var dopplerFactor = src.context.dopplerFactor;
   var slX = lPosX - posX;
   var slY = lPosY - posY;
   var slZ = lPosZ - posZ;
   var magSl = Math.sqrt(slX * slX + slY * slY + slZ * slZ);
   var vls = (slX * lVelX + slY * lVelY + slZ * lVelZ) / magSl;
   var vss = (slX * velX + slY * velY + slZ * velZ) / magSl;
   vls = Math.min(vls, speedOfSound / dopplerFactor);
   vss = Math.min(vss, speedOfSound / dopplerFactor);
   src.dopplerShift = (speedOfSound - dopplerFactor * vls) / (speedOfSound - dopplerFactor * vss);
  }
  if (src.dopplerShift !== oldShift) {
   AL.updateSourceRate(src);
  }
 },
 updateSourceRate: function(src) {
  if (src.state === 4114) {
   AL.cancelPendingSourceAudio(src);
   var audioSrc = src.audioQueue[0];
   if (!audioSrc) {
    return;
   }
   var duration;
   if (src.type === 4136 && src.looping) {
    duration = Number.POSITIVE_INFINITY;
   } else {
    duration = (audioSrc.buffer.duration - audioSrc._startOffset) / src.playbackRate;
   }
   audioSrc._duration = duration;
   audioSrc.playbackRate.value = src.playbackRate;
   AL.scheduleSourceAudio(src);
  }
 },
 sourceDuration: function(src) {
  var length = 0;
  for (var i = 0; i < src.bufQueue.length; i++) {
   var audioBuf = src.bufQueue[i].audioBuf;
   length += audioBuf ? audioBuf.duration : 0;
  }
  return length;
 },
 sourceTell: function(src) {
  AL.updateSourceTime(src);
  var offset = 0;
  for (var i = 0; i < src.bufsProcessed; i++) {
   offset += src.bufQueue[i].audioBuf.duration;
  }
  offset += src.bufOffset;
  return offset;
 },
 sourceSeek: function(src, offset) {
  var playing = src.state == 4114;
  if (playing) {
   AL.setSourceState(src, 4113);
  }
  if (src.bufQueue[src.bufsProcessed].audioBuf !== null) {
   src.bufsProcessed = 0;
   while (offset > src.bufQueue[src.bufsProcessed].audioBuf.duration) {
    offset -= src.bufQueue[src.bufsProcessed].audiobuf.duration;
    src.bufsProcessed++;
   }
   src.bufOffset = offset;
  }
  if (playing) {
   AL.setSourceState(src, 4114);
  }
 },
 getGlobalParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 49152:
   return AL.currentCtx.dopplerFactor;

  case 49155:
   return AL.currentCtx.speedOfSound;

  case 53248:
   return AL.currentCtx.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setGlobalParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  switch (param) {
  case 49152:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.dopplerFactor = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 49155:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.speedOfSound = value;
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    AL.currentCtx.distanceModel = value;
    AL.updateContextGlobal(AL.currentCtx);
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getListenerParam: function(funcname, param) {
  if (!AL.currentCtx) {
   return null;
  }
  switch (param) {
  case 4100:
   return AL.currentCtx.listener.position;

  case 4102:
   return AL.currentCtx.listener.velocity;

  case 4111:
   return AL.currentCtx.listener.direction.concat(AL.currentCtx.listener.up);

  case 4106:
   return AL.currentCtx.gain.gain.value;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setListenerParam: function(funcname, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  var listener = AL.currentCtx.listener;
  switch (param) {
  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.position[0] = value[0];
   listener.position[1] = value[1];
   listener.position[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.velocity[0] = value[0];
   listener.velocity[1] = value[1];
   listener.velocity[2] = value[2];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.currentCtx.gain.gain.value = value;
   break;

  case 4111:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2]) || !Number.isFinite(value[3]) || !Number.isFinite(value[4]) || !Number.isFinite(value[5])) {
    AL.currentCtx.err = 40963;
    return;
   }
   listener.direction[0] = value[0];
   listener.direction[1] = value[1];
   listener.direction[2] = value[2];
   listener.up[0] = value[3];
   listener.up[1] = value[4];
   listener.up[2] = value[5];
   AL.updateListenerSpace(AL.currentCtx);
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getBufferParam: function(funcname, bufferId, param) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  switch (param) {
  case 8193:
   return buf.frequency;

  case 8194:
   return buf.bytesPerSample * 8;

  case 8195:
   return buf.channels;

  case 8196:
   return buf.length * buf.bytesPerSample * buf.channels;

  case 8213:
   if (buf.length === 0) {
    return [ 0, 0 ];
   } else {
    return [ (buf.audioBuf._loopStart || 0) * buf.frequency, (buf.audioBuf._loopEnd || buf.length) * buf.frequency ];
   }

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setBufferParam: function(funcname, bufferId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var buf = AL.buffers[bufferId];
  if (!buf || bufferId === 0) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 8196:
   if (value !== 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 8213:
   if (value[0] < 0 || value[0] > buf.length || value[1] < 0 || value[1] > buf.Length || value[0] >= value[1]) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (buf.refCount > 0) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (buf.audioBuf) {
    buf.audioBuf._loopStart = value[0] / buf.frequency;
    buf.audioBuf._loopEnd = value[1] / buf.frequency;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 getSourceParam: function(funcname, sourceId, param) {
  if (!AL.currentCtx) {
   return null;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return null;
  }
  switch (param) {
  case 514:
   return src.relative;

  case 4097:
   return src.coneInnerAngle;

  case 4098:
   return src.coneOuterAngle;

  case 4099:
   return src.pitch;

  case 4100:
   return src.position;

  case 4101:
   return src.direction;

  case 4102:
   return src.velocity;

  case 4103:
   return src.looping;

  case 4105:
   if (src.type === 4136) {
    return src.bufQueue[0].id;
   } else {
    return 0;
   }

  case 4106:
   return src.gain.gain.value;

  case 4109:
   return src.minGain;

  case 4110:
   return src.maxGain;

  case 4112:
   return src.state;

  case 4117:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0) {
    return 0;
   } else {
    return src.bufQueue.length;
   }

  case 4118:
   if (src.bufQueue.length === 1 && src.bufQueue[0].id === 0 || src.looping) {
    return 0;
   } else {
    return src.bufsProcessed;
   }

  case 4128:
   return src.refDistance;

  case 4129:
   return src.rolloffFactor;

  case 4130:
   return src.coneOuterGain;

  case 4131:
   return src.maxDistance;

  case 4132:
   return AL.sourceTell(src);

  case 4133:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency;
   }
   return offset;

  case 4134:
   var offset = AL.sourceTell(src);
   if (offset > 0) {
    offset *= src.bufQueue[0].frequency * src.bufQueue[0].bytesPerSample;
   }
   return offset;

  case 4135:
   return src.type;

  case 4628:
   return src.spatialize;

  case 8201:
   var length = 0;
   var bytesPerFrame = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
    if (src.bufQueue[i].id !== 0) {
     bytesPerFrame = src.bufQueue[i].bytesPerSample * src.bufQueue[i].channels;
    }
   }
   return length * bytesPerFrame;

  case 8202:
   var length = 0;
   for (var i = 0; i < src.bufQueue.length; i++) {
    length += src.bufQueue[i].length;
   }
   return length;

  case 8203:
   return AL.sourceDuration(src);

  case 53248:
   return src.distanceModel;

  default:
   AL.currentCtx.err = 40962;
   return null;
  }
 },
 setSourceParam: function(funcname, sourceId, param, value) {
  if (!AL.currentCtx) {
   return;
  }
  var src = AL.currentCtx.sources[sourceId];
  if (!src) {
   AL.currentCtx.err = 40961;
   return;
  }
  if (value === null) {
   AL.currentCtx.err = 40962;
   return;
  }
  switch (param) {
  case 514:
   if (value === 1) {
    src.relative = true;
    AL.updateSourceSpace(src);
   } else if (value === 0) {
    src.relative = false;
    AL.updateSourceSpace(src);
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4097:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneInnerAngle = value;
   if (src.panner) {
    src.panner.coneInnerAngle = value % 360;
   }
   break;

  case 4098:
   if (!Number.isFinite(value)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterAngle = value;
   if (src.panner) {
    src.panner.coneOuterAngle = value % 360;
   }
   break;

  case 4099:
   if (!Number.isFinite(value) || value <= 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   if (src.pitch === value) {
    break;
   }
   src.pitch = value;
   AL.updateSourceRate(src);
   break;

  case 4100:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.position[0] = value[0];
   src.position[1] = value[1];
   src.position[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4101:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.direction[0] = value[0];
   src.direction[1] = value[1];
   src.direction[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4102:
   if (!Number.isFinite(value[0]) || !Number.isFinite(value[1]) || !Number.isFinite(value[2])) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.velocity[0] = value[0];
   src.velocity[1] = value[1];
   src.velocity[2] = value[2];
   AL.updateSourceSpace(src);
   break;

  case 4103:
   if (value === 1) {
    src.looping = true;
    AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = true;
     audioSrc._duration = Number.POSITIVE_INFINITY;
    }
   } else if (value === 0) {
    src.looping = false;
    var currentTime = AL.updateSourceTime(src);
    if (src.type === 4136 && src.audioQueue.length > 0) {
     var audioSrc = src.audioQueue[0];
     audioSrc.loop = false;
     audioSrc._duration = src.bufQueue[0].audioBuf.duration / src.playbackRate;
     audioSrc._startTime = currentTime - src.bufOffset / src.playbackRate;
    }
   } else {
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  case 4105:
   if (src.state === 4114 || src.state === 4115) {
    AL.currentCtx.err = 40964;
    return;
   }
   if (value === 0) {
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 1;
    src.bufQueue[0] = AL.buffers[0];
    src.bufsProcessed = 0;
    src.type = 4144;
   } else {
    var buf = AL.buffers[value];
    if (!buf) {
     AL.currentCtx.err = 40963;
     return;
    }
    for (var i in src.bufQueue) {
     src.bufQueue[i].refCount--;
    }
    src.bufQueue.length = 0;
    buf.refCount++;
    src.bufQueue = [ buf ];
    src.bufsProcessed = 0;
    src.type = 4136;
   }
   AL.initSourcePanner(src);
   AL.scheduleSourceAudio(src);
   break;

  case 4106:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.gain.gain.value = value;
   break;

  case 4109:
   if (!Number.isFinite(value) || value < 0 || value > Math.min(src.maxGain, 1)) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.minGain = value;
   break;

  case 4110:
   if (!Number.isFinite(value) || value < Math.max(0, src.minGain) || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxGain = value;
   break;

  case 4128:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.refDistance = value;
   if (src.panner) {
    src.panner.refDistance = value;
   }
   break;

  case 4129:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.rolloffFactor = value;
   if (src.panner) {
    src.panner.rolloffFactor = value;
   }
   break;

  case 4130:
   if (!Number.isFinite(value) || value < 0 || value > 1) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.coneOuterGain = value;
   if (src.panner) {
    src.panner.coneOuterGain = value;
   }
   break;

  case 4131:
   if (!Number.isFinite(value) || value < 0) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.maxDistance = value;
   if (src.panner) {
    src.panner.maxDistance = value;
   }
   break;

  case 4132:
   if (value < 0 || value > AL.sourceDuration(src)) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4133:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var frequency;
    for (var bufId in src.bufQueue) {
     if (bufId !== 0) {
      frequency = src.bufQueue[bufId].frequency;
      break;
     }
    }
    value /= frequency;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4134:
   var srcLen = AL.sourceDuration(src);
   if (srcLen > 0) {
    var bytesPerSec;
    for (var bufId in src.bufQueue) {
     if (bufId !== 0) {
      var buf = src.bufQueue[bufId];
      bytesPerSec = buf.frequency * buf.bytesPerSample * buf.channels;
      break;
     }
    }
    value /= bytesPerSec;
   }
   if (value < 0 || value > srcLen) {
    AL.currentCtx.err = 40963;
    return;
   }
   AL.sourceSeek(src, value);
   break;

  case 4628:
   if (value !== 0 && value !== 1 && value !== 2) {
    AL.currentCtx.err = 40963;
    return;
   }
   src.spatialize = value;
   AL.initSourcePanner(src);
   break;

  case 8201:
  case 8202:
  case 8203:
   AL.currentCtx.err = 40964;
   break;

  case 53248:
   switch (value) {
   case 0:
   case 53249:
   case 53250:
   case 53251:
   case 53252:
   case 53253:
   case 53254:
    src.distanceModel = value;
    if (AL.currentCtx.sourceDistanceModel) {
     AL.updateContextGlobal(AL.currentCtx);
    }
    break;

   default:
    AL.currentCtx.err = 40963;
    return;
   }
   break;

  default:
   AL.currentCtx.err = 40962;
   return;
  }
 },
 captures: {},
 sharedCaptureAudioCtx: null,
 requireValidCaptureDevice: function(deviceId, funcname) {
  if (deviceId === 0) {
   AL.alcErr = 40961;
   return null;
  }
  var c = AL.captures[deviceId];
  if (!c) {
   AL.alcErr = 40961;
   return null;
  }
  var err = c.mediaStreamError;
  if (err) {
   AL.alcErr = 40961;
   return null;
  }
  return c;
 }
};

function _alBufferData(bufferId, format, pData, size, freq) {
 if (!AL.currentCtx) {
  return;
 }
 var buf = AL.buffers[bufferId];
 if (!buf) {
  AL.currentCtx.err = 40963;
  return;
 }
 if (freq <= 0) {
  AL.currentCtx.err = 40963;
  return;
 }
 var audioBuf = null;
 try {
  switch (format) {
  case 4352:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size, freq);
    var channel0 = audioBuf.getChannelData(0);
    for (var i = 0; i < size; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 1;
   buf.length = size;
   break;

  case 4353:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 1;
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 1;
   buf.length = size >> 1;
   break;

  case 4354:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 1, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    for (var i = 0; i < size >> 1; ++i) {
     channel0[i] = HEAPU8[pData++] * .0078125 - 1;
     channel1[i] = HEAPU8[pData++] * .0078125 - 1;
    }
   }
   buf.bytesPerSample = 1;
   buf.channels = 2;
   buf.length = size >> 1;
   break;

  case 4355:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 1;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAP16[pData++] * 30517578125e-15;
     channel1[i] = HEAP16[pData++] * 30517578125e-15;
    }
   }
   buf.bytesPerSample = 2;
   buf.channels = 2;
   buf.length = size >> 2;
   break;

  case 65552:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(1, size >> 2, freq);
    var channel0 = audioBuf.getChannelData(0);
    pData >>= 2;
    for (var i = 0; i < size >> 2; ++i) {
     channel0[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 1;
   buf.length = size >> 2;
   break;

  case 65553:
   if (size > 0) {
    audioBuf = AL.currentCtx.audioCtx.createBuffer(2, size >> 3, freq);
    var channel0 = audioBuf.getChannelData(0);
    var channel1 = audioBuf.getChannelData(1);
    pData >>= 2;
    for (var i = 0; i < size >> 3; ++i) {
     channel0[i] = HEAPF32[pData++];
     channel1[i] = HEAPF32[pData++];
    }
   }
   buf.bytesPerSample = 4;
   buf.channels = 2;
   buf.length = size >> 3;
   break;

  default:
   AL.currentCtx.err = 40963;
   return;
  }
  buf.frequency = freq;
  buf.audioBuf = audioBuf;
 } catch (e) {
  AL.currentCtx.err = 40963;
  return;
 }
}

function _alGenBuffers(count, pBufferIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var buf = {
   deviceId: AL.currentCtx.deviceId,
   id: AL.newId(),
   refCount: 0,
   audioBuf: null,
   frequency: 0,
   bytesPerSample: 2,
   channels: 1,
   length: 0
  };
  AL.deviceRefCounts[buf.deviceId]++;
  AL.buffers[buf.id] = buf;
  HEAP32[pBufferIds + i * 4 >> 2] = buf.id;
 }
}

function _alGenSources(count, pSourceIds) {
 if (!AL.currentCtx) {
  return;
 }
 for (var i = 0; i < count; ++i) {
  var gain = AL.currentCtx.audioCtx.createGain();
  gain.connect(AL.currentCtx.gain);
  var src = {
   context: AL.currentCtx,
   id: AL.newId(),
   type: 4144,
   state: 4113,
   bufQueue: [ AL.buffers[0] ],
   audioQueue: [],
   looping: false,
   pitch: 1,
   dopplerShift: 1,
   gain: gain,
   minGain: 0,
   maxGain: 1,
   panner: null,
   bufsProcessed: 0,
   bufStartTime: Number.NEGATIVE_INFINITY,
   bufOffset: 0,
   relative: false,
   refDistance: 1,
   maxDistance: 3.40282e38,
   rolloffFactor: 1,
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   coneOuterGain: 0,
   coneInnerAngle: 360,
   coneOuterAngle: 360,
   distanceModel: 53250,
   spatialize: 2,
   get playbackRate() {
    return this.pitch * this.dopplerShift;
   }
  };
  AL.currentCtx.sources[src.id] = src;
  HEAP32[pSourceIds + i * 4 >> 2] = src.id;
 }
}

function _alGetError() {
 if (!AL.currentCtx) {
  return 40964;
 } else {
  var err = AL.currentCtx.err;
  AL.currentCtx.err = 0;
  return err;
 }
}

function _alGetSourcei(sourceId, param, pValue) {
 var val = AL.getSourceParam("alGetSourcei", sourceId, param);
 if (val === null) {
  return;
 }
 if (!pValue) {
  AL.currentCtx.err = 40963;
  return;
 }
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4112:
 case 4117:
 case 4118:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4135:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  HEAP32[pValue >> 2] = val;
  break;

 default:
  AL.currentCtx.err = 40962;
  return;
 }
}

function _alSourcePlay(sourceId) {
 if (!AL.currentCtx) {
  return;
 }
 var src = AL.currentCtx.sources[sourceId];
 if (!src) {
  AL.currentCtx.err = 40961;
  return;
 }
 AL.setSourceState(src, 4114);
}

function _alSourcei(sourceId, param, value) {
 switch (param) {
 case 514:
 case 4097:
 case 4098:
 case 4103:
 case 4105:
 case 4128:
 case 4129:
 case 4131:
 case 4132:
 case 4133:
 case 4134:
 case 4628:
 case 8201:
 case 8202:
 case 53248:
  AL.setSourceParam("alSourcei", sourceId, param, value);
  break;

 default:
  AL.setSourceParam("alSourcei", sourceId, param, null);
  break;
 }
}

function _alcCreateContext(deviceId, pAttrList) {
 if (!(deviceId in AL.deviceRefCounts)) {
  AL.alcErr = 40961;
  return 0;
 }
 var options = null;
 var attrs = [];
 var hrtf = null;
 pAttrList >>= 2;
 if (pAttrList) {
  var attr = 0;
  var val = 0;
  while (true) {
   attr = HEAP32[pAttrList++];
   attrs.push(attr);
   if (attr === 0) {
    break;
   }
   val = HEAP32[pAttrList++];
   attrs.push(val);
   switch (attr) {
   case 4103:
    if (!options) {
     options = {};
    }
    options.sampleRate = val;
    break;

   case 4112:
   case 4113:
    break;

   case 6546:
    switch (val) {
    case 0:
     hrtf = false;
     break;

    case 1:
     hrtf = true;
     break;

    case 2:
     break;

    default:
     AL.alcErr = 40964;
     return 0;
    }
    break;

   case 6550:
    if (val !== 0) {
     AL.alcErr = 40964;
     return 0;
    }
    break;

   default:
    AL.alcErr = 40964;
    return 0;
   }
  }
 }
 var AudioContext = window.AudioContext || window.webkitAudioContext;
 var ac = null;
 try {
  if (options) {
   ac = new AudioContext(options);
  } else {
   ac = new AudioContext();
  }
 } catch (e) {
  if (e.name === "NotSupportedError") {
   AL.alcErr = 40964;
  } else {
   AL.alcErr = 40961;
  }
  return 0;
 }
 if (typeof ac.createGain === "undefined") {
  ac.createGain = ac.createGainNode;
 }
 var gain = ac.createGain();
 gain.connect(ac.destination);
 var ctx = {
  deviceId: deviceId,
  id: AL.newId(),
  attrs: attrs,
  audioCtx: ac,
  listener: {
   position: [ 0, 0, 0 ],
   velocity: [ 0, 0, 0 ],
   direction: [ 0, 0, 0 ],
   up: [ 0, 0, 0 ]
  },
  sources: [],
  interval: setInterval(function() {
   AL.scheduleContextAudio(ctx);
  }, AL.QUEUE_INTERVAL),
  gain: gain,
  distanceModel: 53250,
  speedOfSound: 343.3,
  dopplerFactor: 1,
  sourceDistanceModel: false,
  hrtf: hrtf || false,
  _err: 0,
  get err() {
   return this._err;
  },
  set err(val) {
   if (this._err === 0 || val === 0) {
    this._err = val;
   }
  }
 };
 AL.deviceRefCounts[deviceId]++;
 AL.contexts[ctx.id] = ctx;
 if (hrtf !== null) {
  for (var ctxId in AL.contexts) {
   var c = AL.contexts[ctxId];
   if (c.deviceId === deviceId) {
    c.hrtf = hrtf;
    AL.updateContextGlobal(c);
   }
  }
 }
 return ctx.id;
}

function _alcGetIntegerv(deviceId, param, size, pValues) {
 if (size === 0 || !pValues) {
  return;
 }
 switch (param) {
 case 4096:
  HEAP32[pValues >> 2] = 1;
  break;

 case 4097:
  HEAP32[pValues >> 2] = 1;
  break;

 case 4098:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = AL.currentCtx.attrs.length;
  break;

 case 4099:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  for (var i = 0; i < AL.currentCtx.attrs.length; i++) {
   HEAP32[pValues + i * 4 >> 2] = AL.currentCtx.attrs[i];
  }
  break;

 case 4103:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = AL.currentCtx.audioCtx.sampleRate;
  break;

 case 4112:
 case 4113:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = 2147483647;
  break;

 case 6546:
 case 6547:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  var hrtfStatus = 0;
  for (var ctxId in AL.contexts) {
   var ctx = AL.contexts[ctxId];
   if (ctx.deviceId === deviceId) {
    hrtfStatus = ctx.hrtf ? 1 : 0;
   }
  }
  HEAP32[pValues >> 2] = hrtfStatus;
  break;

 case 6548:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  HEAP32[pValues >> 2] = 1;
  break;

 case 131075:
  if (!deviceId in AL.deviceRefCounts) {
   AL.alcErr = 40961;
   return;
  }
  if (!AL.currentCtx) {
   AL.alcErr = 40962;
   return;
  }
  HEAP32[pValues >> 2] = 1;

 case 786:
  var c = AL.requireValidCaptureDevice(deviceId, "alcGetIntegerv");
  if (!c) {
   return;
  }
  var n = c.capturedFrameCount;
  var dstfreq = c.requestedSampleRate;
  var srcfreq = c.audioCtx.sampleRate;
  var nsamples = Math.floor(n * (dstfreq / srcfreq));
  HEAP32[pValues >> 2] = nsamples;
  break;

 default:
  AL.alcErr = 40963;
  return;
 }
}

function _alcMakeContextCurrent(contextId) {
 if (contextId === 0) {
  AL.currentCtx = null;
  return 0;
 } else {
  AL.currentCtx = AL.contexts[contextId];
  return 1;
 }
}

function _alcOpenDevice(pDeviceName) {
 if (pDeviceName) {
  var name = UTF8ToString(pDeviceName);
  if (name !== AL.DEVICE_NAME) {
   return 0;
  }
 }
 if (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined") {
  var deviceId = AL.newId();
  AL.deviceRefCounts[deviceId] = 0;
  return deviceId;
 } else {
  return 0;
 }
}

function _emscripten_get_now_is_monotonic() {
 return ENVIRONMENT_IS_NODE || typeof dateNow !== "undefined" || (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"];
}

function _clock_gettime(clk_id, tp) {
 var now;
 if (clk_id === 0) {
  now = Date.now();
 } else if (clk_id === 1 && _emscripten_get_now_is_monotonic()) {
  now = _emscripten_get_now();
 } else {
  ___setErrNo(22);
  return -1;
 }
 HEAP32[tp >> 2] = now / 1e3 | 0;
 HEAP32[tp + 4 >> 2] = now % 1e3 * 1e3 * 1e3 | 0;
 return 0;
}

function _dlopen() {
 abort("To use dlopen, you need to use Emscripten's linking support, see https://github.com/emscripten-core/emscripten/wiki/Linking");
}

function _dlclose() {
 return _dlopen.apply(null, arguments);
}

function _dlerror() {
 return _dlopen.apply(null, arguments);
}

function _dlsym() {
 return _dlopen.apply(null, arguments);
}

var EGL = {
 errorCode: 12288,
 defaultDisplayInitialized: false,
 currentContext: 0,
 currentReadSurface: 0,
 currentDrawSurface: 0,
 contextAttributes: {
  alpha: false,
  depth: false,
  stencil: false,
  antialias: false
 },
 stringCache: {},
 setErrorCode: function(code) {
  EGL.errorCode = code;
 },
 chooseConfig: function(display, attribList, config, config_size, numConfigs) {
  if (display != 62e3) {
   EGL.setErrorCode(12296);
   return 0;
  }
  if (attribList) {
   for (;;) {
    var param = HEAP32[attribList >> 2];
    if (param == 12321) {
     var alphaSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.alpha = alphaSize > 0;
    } else if (param == 12325) {
     var depthSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.depth = depthSize > 0;
    } else if (param == 12326) {
     var stencilSize = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.stencil = stencilSize > 0;
    } else if (param == 12337) {
     var samples = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.antialias = samples > 0;
    } else if (param == 12338) {
     var samples = HEAP32[attribList + 4 >> 2];
     EGL.contextAttributes.antialias = samples == 1;
    } else if (param == 12344) {
     break;
    }
    attribList += 8;
   }
  }
  if ((!config || !config_size) && !numConfigs) {
   EGL.setErrorCode(12300);
   return 0;
  }
  if (numConfigs) {
   HEAP32[numConfigs >> 2] = 1;
  }
  if (config && config_size > 0) {
   HEAP32[config >> 2] = 62002;
  }
  EGL.setErrorCode(12288);
  return 1;
 }
};

function _eglBindAPI(api) {
 if (api == 12448) {
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12300);
  return 0;
 }
}

function _eglChooseConfig(display, attrib_list, configs, config_size, numConfigs) {
 return EGL.chooseConfig(display, attrib_list, configs, config_size, numConfigs);
}

var GL = {
 counter: 1,
 lastError: 0,
 buffers: [],
 mappedBuffers: {},
 programs: [],
 framebuffers: [],
 renderbuffers: [],
 textures: [],
 uniforms: [],
 shaders: [],
 vaos: [],
 contexts: {},
 currentContext: null,
 offscreenCanvases: {},
 timerQueriesEXT: [],
 programInfos: {},
 stringCache: {},
 unpackAlignment: 4,
 init: function() {
  GL.miniTempBuffer = new Float32Array(GL.MINI_TEMP_BUFFER_SIZE);
  for (var i = 0; i < GL.MINI_TEMP_BUFFER_SIZE; i++) {
   GL.miniTempBufferViews[i] = GL.miniTempBuffer.subarray(0, i + 1);
  }
 },
 recordError: function recordError(errorCode) {
  if (!GL.lastError) {
   GL.lastError = errorCode;
  }
 },
 getNewId: function(table) {
  var ret = GL.counter++;
  for (var i = table.length; i < ret; i++) {
   table[i] = null;
  }
  return ret;
 },
 MINI_TEMP_BUFFER_SIZE: 256,
 miniTempBuffer: null,
 miniTempBufferViews: [ 0 ],
 getSource: function(shader, count, string, length) {
  var source = "";
  for (var i = 0; i < count; ++i) {
   var len = length ? HEAP32[length + i * 4 >> 2] : -1;
   source += UTF8ToString(HEAP32[string + i * 4 >> 2], len < 0 ? undefined : len);
  }
  return source;
 },
 createContext: function(canvas, webGLContextAttributes) {
  var ctx = canvas.getContext("webgl", webGLContextAttributes) || canvas.getContext("experimental-webgl", webGLContextAttributes);
  return ctx && GL.registerContext(ctx, webGLContextAttributes);
 },
 registerContext: function(ctx, webGLContextAttributes) {
  var handle = _malloc(8);
  var context = {
   handle: handle,
   attributes: webGLContextAttributes,
   version: webGLContextAttributes.majorVersion,
   GLctx: ctx
  };
  if (ctx.canvas) ctx.canvas.GLctxObject = context;
  GL.contexts[handle] = context;
  if (typeof webGLContextAttributes.enableExtensionsByDefault === "undefined" || webGLContextAttributes.enableExtensionsByDefault) {
   GL.initExtensions(context);
  }
  return handle;
 },
 makeContextCurrent: function(contextHandle) {
  GL.currentContext = GL.contexts[contextHandle];
  Module.ctx = GLctx = GL.currentContext && GL.currentContext.GLctx;
  return !(contextHandle && !GLctx);
 },
 getContext: function(contextHandle) {
  return GL.contexts[contextHandle];
 },
 deleteContext: function(contextHandle) {
  if (GL.currentContext === GL.contexts[contextHandle]) GL.currentContext = null;
  if (typeof JSEvents === "object") JSEvents.removeAllHandlersOnTarget(GL.contexts[contextHandle].GLctx.canvas);
  if (GL.contexts[contextHandle] && GL.contexts[contextHandle].GLctx.canvas) GL.contexts[contextHandle].GLctx.canvas.GLctxObject = undefined;
  _free(GL.contexts[contextHandle]);
  GL.contexts[contextHandle] = null;
 },
 initExtensions: function(context) {
  if (!context) context = GL.currentContext;
  if (context.initExtensionsDone) return;
  context.initExtensionsDone = true;
  var GLctx = context.GLctx;
  if (context.version < 2) {
   var instancedArraysExt = GLctx.getExtension("ANGLE_instanced_arrays");
   if (instancedArraysExt) {
    GLctx["vertexAttribDivisor"] = function(index, divisor) {
     instancedArraysExt["vertexAttribDivisorANGLE"](index, divisor);
    };
    GLctx["drawArraysInstanced"] = function(mode, first, count, primcount) {
     instancedArraysExt["drawArraysInstancedANGLE"](mode, first, count, primcount);
    };
    GLctx["drawElementsInstanced"] = function(mode, count, type, indices, primcount) {
     instancedArraysExt["drawElementsInstancedANGLE"](mode, count, type, indices, primcount);
    };
   }
   var vaoExt = GLctx.getExtension("OES_vertex_array_object");
   if (vaoExt) {
    GLctx["createVertexArray"] = function() {
     return vaoExt["createVertexArrayOES"]();
    };
    GLctx["deleteVertexArray"] = function(vao) {
     vaoExt["deleteVertexArrayOES"](vao);
    };
    GLctx["bindVertexArray"] = function(vao) {
     vaoExt["bindVertexArrayOES"](vao);
    };
    GLctx["isVertexArray"] = function(vao) {
     return vaoExt["isVertexArrayOES"](vao);
    };
   }
   var drawBuffersExt = GLctx.getExtension("WEBGL_draw_buffers");
   if (drawBuffersExt) {
    GLctx["drawBuffers"] = function(n, bufs) {
     drawBuffersExt["drawBuffersWEBGL"](n, bufs);
    };
   }
  }
  GLctx.disjointTimerQueryExt = GLctx.getExtension("EXT_disjoint_timer_query");
  var automaticallyEnabledExtensions = [ "OES_texture_float", "OES_texture_half_float", "OES_standard_derivatives", "OES_vertex_array_object", "WEBGL_compressed_texture_s3tc", "WEBGL_depth_texture", "OES_element_index_uint", "EXT_texture_filter_anisotropic", "EXT_frag_depth", "WEBGL_draw_buffers", "ANGLE_instanced_arrays", "OES_texture_float_linear", "OES_texture_half_float_linear", "EXT_blend_minmax", "EXT_shader_texture_lod", "WEBGL_compressed_texture_pvrtc", "EXT_color_buffer_half_float", "WEBGL_color_buffer_float", "EXT_sRGB", "WEBGL_compressed_texture_etc1", "EXT_disjoint_timer_query", "WEBGL_compressed_texture_etc", "WEBGL_compressed_texture_astc", "EXT_color_buffer_float", "WEBGL_compressed_texture_s3tc_srgb", "EXT_disjoint_timer_query_webgl2" ];
  var exts = GLctx.getSupportedExtensions();
  if (exts && exts.length > 0) {
   GLctx.getSupportedExtensions().forEach(function(ext) {
    if (automaticallyEnabledExtensions.indexOf(ext) != -1) {
     GLctx.getExtension(ext);
    }
   });
  }
 },
 populateUniformTable: function(program) {
  var p = GL.programs[program];
  var ptable = GL.programInfos[program] = {
   uniforms: {},
   maxUniformLength: 0,
   maxAttributeLength: -1,
   maxUniformBlockNameLength: -1
  };
  var utable = ptable.uniforms;
  var numUniforms = GLctx.getProgramParameter(p, 35718);
  for (var i = 0; i < numUniforms; ++i) {
   var u = GLctx.getActiveUniform(p, i);
   var name = u.name;
   ptable.maxUniformLength = Math.max(ptable.maxUniformLength, name.length + 1);
   var ls = name.lastIndexOf("[");
   if (ls > 0) {
    name = name.slice(0, ls);
   }
   var loc = GLctx.getUniformLocation(p, name);
   if (loc) {
    var id = GL.getNewId(GL.uniforms);
    utable[name] = [ u.size, id ];
    GL.uniforms[id] = loc;
    for (var j = 1; j < u.size; ++j) {
     var n = name + "[" + j + "]";
     loc = GLctx.getUniformLocation(p, n);
     id = GL.getNewId(GL.uniforms);
     GL.uniforms[id] = loc;
    }
   }
  }
 }
};

function _eglCreateContext(display, config, hmm, contextAttribs) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 var glesContextVersion = 1;
 for (;;) {
  var param = HEAP32[contextAttribs >> 2];
  if (param == 12440) {
   glesContextVersion = HEAP32[contextAttribs + 4 >> 2];
  } else if (param == 12344) {
   break;
  } else {
   EGL.setErrorCode(12292);
   return 0;
  }
  contextAttribs += 8;
 }
 if (glesContextVersion != 2) {
  EGL.setErrorCode(12293);
  return 0;
 }
 EGL.contextAttributes.majorVersion = glesContextVersion - 1;
 EGL.contextAttributes.minorVersion = 0;
 EGL.context = GL.createContext(Module["canvas"], EGL.contextAttributes);
 if (EGL.context != 0) {
  EGL.setErrorCode(12288);
  GL.makeContextCurrent(EGL.context);
  Module.useWebGL = true;
  Browser.moduleContextCreatedCallbacks.forEach(function(callback) {
   callback();
  });
  GL.makeContextCurrent(null);
  return 62004;
 } else {
  EGL.setErrorCode(12297);
  return 0;
 }
}

function _eglCreateWindowSurface(display, config, win, attrib_list) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 EGL.setErrorCode(12288);
 return 62006;
}

function _eglDestroyContext(display, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 EGL.setErrorCode(12288);
 return 1;
}

function _eglDestroySurface(display, surface) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (surface != 62006) {
  EGL.setErrorCode(12301);
  return 1;
 }
 if (EGL.currentReadSurface == surface) {
  EGL.currentReadSurface = 0;
 }
 if (EGL.currentDrawSurface == surface) {
  EGL.currentDrawSurface = 0;
 }
 EGL.setErrorCode(12288);
 return 1;
}

function _eglGetConfigAttrib(display, config, attribute, value) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (config != 62002) {
  EGL.setErrorCode(12293);
  return 0;
 }
 if (!value) {
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.setErrorCode(12288);
 switch (attribute) {
 case 12320:
  HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 32 : 24;
  return 1;

 case 12321:
  HEAP32[value >> 2] = EGL.contextAttributes.alpha ? 8 : 0;
  return 1;

 case 12322:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12323:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12324:
  HEAP32[value >> 2] = 8;
  return 1;

 case 12325:
  HEAP32[value >> 2] = EGL.contextAttributes.depth ? 24 : 0;
  return 1;

 case 12326:
  HEAP32[value >> 2] = EGL.contextAttributes.stencil ? 8 : 0;
  return 1;

 case 12327:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12328:
  HEAP32[value >> 2] = 62002;
  return 1;

 case 12329:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12330:
  HEAP32[value >> 2] = 4096;
  return 1;

 case 12331:
  HEAP32[value >> 2] = 16777216;
  return 1;

 case 12332:
  HEAP32[value >> 2] = 4096;
  return 1;

 case 12333:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12334:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12335:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12337:
  HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 4 : 0;
  return 1;

 case 12338:
  HEAP32[value >> 2] = EGL.contextAttributes.antialias ? 1 : 0;
  return 1;

 case 12339:
  HEAP32[value >> 2] = 4;
  return 1;

 case 12340:
  HEAP32[value >> 2] = 12344;
  return 1;

 case 12341:
 case 12342:
 case 12343:
  HEAP32[value >> 2] = -1;
  return 1;

 case 12345:
 case 12346:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12347:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12348:
  HEAP32[value >> 2] = 1;
  return 1;

 case 12349:
 case 12350:
  HEAP32[value >> 2] = 0;
  return 1;

 case 12351:
  HEAP32[value >> 2] = 12430;
  return 1;

 case 12352:
  HEAP32[value >> 2] = 4;
  return 1;

 case 12354:
  HEAP32[value >> 2] = 0;
  return 1;

 default:
  EGL.setErrorCode(12292);
  return 0;
 }
}

function _eglGetDisplay(nativeDisplayType) {
 EGL.setErrorCode(12288);
 return 62e3;
}

function _eglGetError() {
 return EGL.errorCode;
}

function _eglGetProcAddress(name_) {
 return _emscripten_GetProcAddress(name_);
}

function _eglInitialize(display, majorVersion, minorVersion) {
 if (display == 62e3) {
  if (majorVersion) {
   HEAP32[majorVersion >> 2] = 1;
  }
  if (minorVersion) {
   HEAP32[minorVersion >> 2] = 4;
  }
  EGL.defaultDisplayInitialized = true;
  EGL.setErrorCode(12288);
  return 1;
 } else {
  EGL.setErrorCode(12296);
  return 0;
 }
}

function _eglMakeCurrent(display, draw, read, context) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (context != 0 && context != 62004) {
  EGL.setErrorCode(12294);
  return 0;
 }
 if (read != 0 && read != 62006 || draw != 0 && draw != 62006) {
  EGL.setErrorCode(12301);
  return 0;
 }
 GL.makeContextCurrent(context ? EGL.context : null);
 EGL.currentContext = context;
 EGL.currentDrawSurface = draw;
 EGL.currentReadSurface = read;
 EGL.setErrorCode(12288);
 return 1;
}

function _eglQueryString(display, name) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 EGL.setErrorCode(12288);
 if (EGL.stringCache[name]) return EGL.stringCache[name];
 var ret;
 switch (name) {
 case 12371:
  ret = allocate(intArrayFromString("Emscripten"), "i8", ALLOC_NORMAL);
  break;

 case 12372:
  ret = allocate(intArrayFromString("1.4 Emscripten EGL"), "i8", ALLOC_NORMAL);
  break;

 case 12373:
  ret = allocate(intArrayFromString(""), "i8", ALLOC_NORMAL);
  break;

 case 12429:
  ret = allocate(intArrayFromString("OpenGL_ES"), "i8", ALLOC_NORMAL);
  break;

 default:
  EGL.setErrorCode(12300);
  return 0;
 }
 EGL.stringCache[name] = ret;
 return ret;
}

function _eglSwapBuffers() {
 if (!EGL.defaultDisplayInitialized) {
  EGL.setErrorCode(12289);
 } else if (!Module.ctx) {
  EGL.setErrorCode(12290);
 } else if (Module.ctx.isContextLost()) {
  EGL.setErrorCode(12302);
 } else {
  EGL.setErrorCode(12288);
  return 1;
 }
 return 0;
}

function _eglSwapInterval(display, interval) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 if (interval == 0) _emscripten_set_main_loop_timing(0, 0); else _emscripten_set_main_loop_timing(1, interval);
 EGL.setErrorCode(12288);
 return 1;
}

function _eglTerminate(display) {
 if (display != 62e3) {
  EGL.setErrorCode(12296);
  return 0;
 }
 EGL.currentContext = 0;
 EGL.currentReadSurface = 0;
 EGL.currentDrawSurface = 0;
 EGL.defaultDisplayInitialized = false;
 EGL.setErrorCode(12288);
 return 1;
}

function _eglWaitClient() {
 EGL.setErrorCode(12288);
 return 1;
}

function _eglWaitGL() {
 return _eglWaitClient.apply(null, arguments);
}

function _eglWaitNative(nativeEngineId) {
 EGL.setErrorCode(12288);
 return 1;
}

var JSEvents = {
 keyEvent: 0,
 mouseEvent: 0,
 wheelEvent: 0,
 uiEvent: 0,
 focusEvent: 0,
 deviceOrientationEvent: 0,
 deviceMotionEvent: 0,
 fullscreenChangeEvent: 0,
 pointerlockChangeEvent: 0,
 visibilityChangeEvent: 0,
 touchEvent: 0,
 previousFullscreenElement: null,
 previousScreenX: null,
 previousScreenY: null,
 removeEventListenersRegistered: false,
 removeAllEventListeners: function() {
  for (var i = JSEvents.eventHandlers.length - 1; i >= 0; --i) {
   JSEvents._removeHandler(i);
  }
  JSEvents.eventHandlers = [];
  JSEvents.deferredCalls = [];
 },
 registerRemoveEventListeners: function() {
  if (!JSEvents.removeEventListenersRegistered) {
   __ATEXIT__.push(JSEvents.removeAllEventListeners);
   JSEvents.removeEventListenersRegistered = true;
  }
 },
 deferredCalls: [],
 deferCall: function(targetFunction, precedence, argsList) {
  function arraysHaveEqualContent(arrA, arrB) {
   if (arrA.length != arrB.length) return false;
   for (var i in arrA) {
    if (arrA[i] != arrB[i]) return false;
   }
   return true;
  }
  for (var i in JSEvents.deferredCalls) {
   var call = JSEvents.deferredCalls[i];
   if (call.targetFunction == targetFunction && arraysHaveEqualContent(call.argsList, argsList)) {
    return;
   }
  }
  JSEvents.deferredCalls.push({
   targetFunction: targetFunction,
   precedence: precedence,
   argsList: argsList
  });
  JSEvents.deferredCalls.sort(function(x, y) {
   return x.precedence < y.precedence;
  });
 },
 removeDeferredCalls: function(targetFunction) {
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   if (JSEvents.deferredCalls[i].targetFunction == targetFunction) {
    JSEvents.deferredCalls.splice(i, 1);
    --i;
   }
  }
 },
 canPerformEventHandlerRequests: function() {
  return JSEvents.inEventHandler && JSEvents.currentEventHandler.allowsDeferredCalls;
 },
 runDeferredCalls: function() {
  if (!JSEvents.canPerformEventHandlerRequests()) {
   return;
  }
  for (var i = 0; i < JSEvents.deferredCalls.length; ++i) {
   var call = JSEvents.deferredCalls[i];
   JSEvents.deferredCalls.splice(i, 1);
   --i;
   call.targetFunction.apply(this, call.argsList);
  }
 },
 inEventHandler: 0,
 currentEventHandler: null,
 eventHandlers: [],
 isInternetExplorer: function() {
  return navigator.userAgent.indexOf("MSIE") !== -1 || navigator.appVersion.indexOf("Trident/") > 0;
 },
 removeAllHandlersOnTarget: function(target, eventTypeString) {
  for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
   if (JSEvents.eventHandlers[i].target == target && (!eventTypeString || eventTypeString == JSEvents.eventHandlers[i].eventTypeString)) {
    JSEvents._removeHandler(i--);
   }
  }
 },
 _removeHandler: function(i) {
  var h = JSEvents.eventHandlers[i];
  h.target.removeEventListener(h.eventTypeString, h.eventListenerFunc, h.useCapture);
  JSEvents.eventHandlers.splice(i, 1);
 },
 registerOrRemoveHandler: function(eventHandler) {
  var jsEventHandler = function jsEventHandler(event) {
   ++JSEvents.inEventHandler;
   JSEvents.currentEventHandler = eventHandler;
   JSEvents.runDeferredCalls();
   eventHandler.handlerFunc(event);
   JSEvents.runDeferredCalls();
   --JSEvents.inEventHandler;
  };
  if (eventHandler.callbackfunc) {
   eventHandler.eventListenerFunc = jsEventHandler;
   eventHandler.target.addEventListener(eventHandler.eventTypeString, jsEventHandler, eventHandler.useCapture);
   JSEvents.eventHandlers.push(eventHandler);
   JSEvents.registerRemoveEventListeners();
  } else {
   for (var i = 0; i < JSEvents.eventHandlers.length; ++i) {
    if (JSEvents.eventHandlers[i].target == eventHandler.target && JSEvents.eventHandlers[i].eventTypeString == eventHandler.eventTypeString) {
     JSEvents._removeHandler(i--);
    }
   }
  }
 },
 getBoundingClientRectOrZeros: function(target) {
  return target.getBoundingClientRect ? target.getBoundingClientRect() : {
   left: 0,
   top: 0
  };
 },
 pageScrollPos: function() {
  if (window.pageXOffset > 0 || window.pageYOffset > 0) {
   return [ window.pageXOffset, window.pageYOffset ];
  }
  if (typeof document.documentElement.scrollLeft !== "undefined" || typeof document.documentElement.scrollTop !== "undefined") {
   return [ document.documentElement.scrollLeft, document.documentElement.scrollTop ];
  }
  return [ document.body.scrollLeft | 0, document.body.scrollTop | 0 ];
 },
 getNodeNameForTarget: function(target) {
  if (!target) return "";
  if (target == window) return "#window";
  if (target == screen) return "#screen";
  return target && target.nodeName ? target.nodeName : "";
 },
 tick: function() {
  if (window["performance"] && window["performance"]["now"]) return window["performance"]["now"](); else return Date.now();
 },
 fullscreenEnabled: function() {
  return document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;
 }
};

var __currentFullscreenStrategy = {};

var __specialEventTargets = [ 0, typeof document !== "undefined" ? document : 0, typeof window !== "undefined" ? window : 0 ];

function __findEventTarget(target) {
 try {
  if (!target) return window;
  if (typeof target === "number") target = __specialEventTargets[target] || UTF8ToString(target);
  if (target === "#window") return window; else if (target === "#document") return document; else if (target === "#screen") return screen; else if (target === "#canvas") return Module["canvas"];
  return typeof target === "string" ? document.getElementById(target) : target;
 } catch (e) {
  return null;
 }
}

function __findCanvasEventTarget(target) {
 if (typeof target === "number") target = UTF8ToString(target);
 if (!target || target === "#canvas") {
  if (typeof GL !== "undefined" && GL.offscreenCanvases["canvas"]) return GL.offscreenCanvases["canvas"];
  return Module["canvas"];
 }
 if (typeof GL !== "undefined" && GL.offscreenCanvases[target]) return GL.offscreenCanvases[target];
 return __findEventTarget(target);
}

function _emscripten_get_canvas_element_size(target, width, height) {
 var canvas = __findCanvasEventTarget(target);
 if (!canvas) return -4;
 HEAP32[width >> 2] = canvas.width;
 HEAP32[height >> 2] = canvas.height;
}

function __get_canvas_element_size(target) {
 var stackTop = stackSave();
 var w = stackAlloc(8);
 var h = w + 4;
 var targetInt = stackAlloc(target.id.length + 1);
 stringToUTF8(target.id, targetInt, target.id.length + 1);
 var ret = _emscripten_get_canvas_element_size(targetInt, w, h);
 var size = [ HEAP32[w >> 2], HEAP32[h >> 2] ];
 stackRestore(stackTop);
 return size;
}

function _emscripten_set_canvas_element_size(target, width, height) {
 var canvas = __findCanvasEventTarget(target);
 if (!canvas) return -4;
 canvas.width = width;
 canvas.height = height;
 return 0;
}

function __set_canvas_element_size(target, width, height) {
 if (!target.controlTransferredOffscreen) {
  target.width = width;
  target.height = height;
 } else {
  var stackTop = stackSave();
  var targetInt = stackAlloc(target.id.length + 1);
  stringToUTF8(target.id, targetInt, target.id.length + 1);
  _emscripten_set_canvas_element_size(targetInt, width, height);
  stackRestore(stackTop);
 }
}

function __registerRestoreOldStyle(canvas) {
 var canvasSize = __get_canvas_element_size(canvas);
 var oldWidth = canvasSize[0];
 var oldHeight = canvasSize[1];
 var oldCssWidth = canvas.style.width;
 var oldCssHeight = canvas.style.height;
 var oldBackgroundColor = canvas.style.backgroundColor;
 var oldDocumentBackgroundColor = document.body.style.backgroundColor;
 var oldPaddingLeft = canvas.style.paddingLeft;
 var oldPaddingRight = canvas.style.paddingRight;
 var oldPaddingTop = canvas.style.paddingTop;
 var oldPaddingBottom = canvas.style.paddingBottom;
 var oldMarginLeft = canvas.style.marginLeft;
 var oldMarginRight = canvas.style.marginRight;
 var oldMarginTop = canvas.style.marginTop;
 var oldMarginBottom = canvas.style.marginBottom;
 var oldDocumentBodyMargin = document.body.style.margin;
 var oldDocumentOverflow = document.documentElement.style.overflow;
 var oldDocumentScroll = document.body.scroll;
 var oldImageRendering = canvas.style.imageRendering;
 function restoreOldStyle() {
  var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  if (!fullscreenElement) {
   document.removeEventListener("fullscreenchange", restoreOldStyle);
   document.removeEventListener("mozfullscreenchange", restoreOldStyle);
   document.removeEventListener("webkitfullscreenchange", restoreOldStyle);
   document.removeEventListener("MSFullscreenChange", restoreOldStyle);
   __set_canvas_element_size(canvas, oldWidth, oldHeight);
   canvas.style.width = oldCssWidth;
   canvas.style.height = oldCssHeight;
   canvas.style.backgroundColor = oldBackgroundColor;
   if (!oldDocumentBackgroundColor) document.body.style.backgroundColor = "white";
   document.body.style.backgroundColor = oldDocumentBackgroundColor;
   canvas.style.paddingLeft = oldPaddingLeft;
   canvas.style.paddingRight = oldPaddingRight;
   canvas.style.paddingTop = oldPaddingTop;
   canvas.style.paddingBottom = oldPaddingBottom;
   canvas.style.marginLeft = oldMarginLeft;
   canvas.style.marginRight = oldMarginRight;
   canvas.style.marginTop = oldMarginTop;
   canvas.style.marginBottom = oldMarginBottom;
   document.body.style.margin = oldDocumentBodyMargin;
   document.documentElement.style.overflow = oldDocumentOverflow;
   document.body.scroll = oldDocumentScroll;
   canvas.style.imageRendering = oldImageRendering;
   if (canvas.GLctxObject) canvas.GLctxObject.GLctx.viewport(0, 0, oldWidth, oldHeight);
   if (__currentFullscreenStrategy.canvasResizedCallback) {
    dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
   }
  }
 }
 document.addEventListener("fullscreenchange", restoreOldStyle);
 document.addEventListener("mozfullscreenchange", restoreOldStyle);
 document.addEventListener("webkitfullscreenchange", restoreOldStyle);
 document.addEventListener("MSFullscreenChange", restoreOldStyle);
 return restoreOldStyle;
}

function __setLetterbox(element, topBottom, leftRight) {
 if (JSEvents.isInternetExplorer()) {
  element.style.marginLeft = element.style.marginRight = leftRight + "px";
  element.style.marginTop = element.style.marginBottom = topBottom + "px";
 } else {
  element.style.paddingLeft = element.style.paddingRight = leftRight + "px";
  element.style.paddingTop = element.style.paddingBottom = topBottom + "px";
 }
}

function _JSEvents_resizeCanvasForFullscreen(target, strategy) {
 var restoreOldStyle = __registerRestoreOldStyle(target);
 var cssWidth = strategy.softFullscreen ? window.innerWidth : screen.width;
 var cssHeight = strategy.softFullscreen ? window.innerHeight : screen.height;
 var rect = target.getBoundingClientRect();
 var windowedCssWidth = rect.right - rect.left;
 var windowedCssHeight = rect.bottom - rect.top;
 var canvasSize = __get_canvas_element_size(target);
 var windowedRttWidth = canvasSize[0];
 var windowedRttHeight = canvasSize[1];
 if (strategy.scaleMode == 3) {
  __setLetterbox(target, (cssHeight - windowedCssHeight) / 2, (cssWidth - windowedCssWidth) / 2);
  cssWidth = windowedCssWidth;
  cssHeight = windowedCssHeight;
 } else if (strategy.scaleMode == 2) {
  if (cssWidth * windowedRttHeight < windowedRttWidth * cssHeight) {
   var desiredCssHeight = windowedRttHeight * cssWidth / windowedRttWidth;
   __setLetterbox(target, (cssHeight - desiredCssHeight) / 2, 0);
   cssHeight = desiredCssHeight;
  } else {
   var desiredCssWidth = windowedRttWidth * cssHeight / windowedRttHeight;
   __setLetterbox(target, 0, (cssWidth - desiredCssWidth) / 2);
   cssWidth = desiredCssWidth;
  }
 }
 if (!target.style.backgroundColor) target.style.backgroundColor = "black";
 if (!document.body.style.backgroundColor) document.body.style.backgroundColor = "black";
 target.style.width = cssWidth + "px";
 target.style.height = cssHeight + "px";
 if (strategy.filteringMode == 1) {
  target.style.imageRendering = "optimizeSpeed";
  target.style.imageRendering = "-moz-crisp-edges";
  target.style.imageRendering = "-o-crisp-edges";
  target.style.imageRendering = "-webkit-optimize-contrast";
  target.style.imageRendering = "optimize-contrast";
  target.style.imageRendering = "crisp-edges";
  target.style.imageRendering = "pixelated";
 }
 var dpiScale = strategy.canvasResolutionScaleMode == 2 ? window.devicePixelRatio : 1;
 if (strategy.canvasResolutionScaleMode != 0) {
  var newWidth = cssWidth * dpiScale | 0;
  var newHeight = cssHeight * dpiScale | 0;
  __set_canvas_element_size(target, newWidth, newHeight);
  if (target.GLctxObject) target.GLctxObject.GLctx.viewport(0, 0, newWidth, newHeight);
 }
 return restoreOldStyle;
}

function _JSEvents_requestFullscreen(target, strategy) {
 if (strategy.scaleMode != 0 || strategy.canvasResolutionScaleMode != 0) {
  _JSEvents_resizeCanvasForFullscreen(target, strategy);
 }
 if (target.requestFullscreen) {
  target.requestFullscreen();
 } else if (target.msRequestFullscreen) {
  target.msRequestFullscreen();
 } else if (target.mozRequestFullScreen) {
  target.mozRequestFullScreen();
 } else if (target.mozRequestFullscreen) {
  target.mozRequestFullscreen();
 } else if (target.webkitRequestFullscreen) {
  target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
 } else {
  if (typeof JSEvents.fullscreenEnabled() === "undefined") {
   return -1;
  } else {
   return -3;
  }
 }
 if (strategy.canvasResizedCallback) {
  dynCall_iiii(strategy.canvasResizedCallback, 37, 0, strategy.canvasResizedCallbackUserData);
 }
 return 0;
}

function _emscripten_exit_fullscreen() {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 JSEvents.removeDeferredCalls(_JSEvents_requestFullscreen);
 var d = __specialEventTargets[1];
 if (d.exitFullscreen) {
  d.fullscreenElement && d.exitFullscreen();
 } else if (d.msExitFullscreen) {
  d.msFullscreenElement && d.msExitFullscreen();
 } else if (d.mozCancelFullScreen) {
  d.mozFullScreenElement && d.mozCancelFullScreen();
 } else if (d.webkitExitFullscreen) {
  d.webkitFullscreenElement && d.webkitExitFullscreen();
 } else {
  return -1;
 }
 if (__currentFullscreenStrategy.canvasResizedCallback) {
  dynCall_iiii(__currentFullscreenStrategy.canvasResizedCallback, 37, 0, __currentFullscreenStrategy.canvasResizedCallbackUserData);
  __currentFullscreenStrategy = 0;
 }
 return 0;
}

function __requestPointerLock(target) {
 if (target.requestPointerLock) {
  target.requestPointerLock();
 } else if (target.mozRequestPointerLock) {
  target.mozRequestPointerLock();
 } else if (target.webkitRequestPointerLock) {
  target.webkitRequestPointerLock();
 } else if (target.msRequestPointerLock) {
  target.msRequestPointerLock();
 } else {
  if (document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock || document.body.msRequestPointerLock) {
   return -3;
  } else {
   return -1;
  }
 }
 return 0;
}

function _emscripten_exit_pointerlock() {
 JSEvents.removeDeferredCalls(__requestPointerLock);
 if (document.exitPointerLock) {
  document.exitPointerLock();
 } else if (document.msExitPointerLock) {
  document.msExitPointerLock();
 } else if (document.mozExitPointerLock) {
  document.mozExitPointerLock();
 } else if (document.webkitExitPointerLock) {
  document.webkitExitPointerLock();
 } else {
  return -1;
 }
 return 0;
}

function _emscripten_get_device_pixel_ratio() {
 return window.devicePixelRatio || 1;
}

function _emscripten_get_element_css_size(target, width, height) {
 target = target ? __findEventTarget(target) : Module["canvas"];
 if (!target) return -4;
 if (target.getBoundingClientRect) {
  var rect = target.getBoundingClientRect();
  HEAPF64[width >> 3] = rect.right - rect.left;
  HEAPF64[height >> 3] = rect.bottom - rect.top;
 } else {
  HEAPF64[width >> 3] = target.clientWidth;
  HEAPF64[height >> 3] = target.clientHeight;
 }
 return 0;
}

function __fillGamepadEventData(eventStruct, e) {
 HEAPF64[eventStruct >> 3] = e.timestamp;
 for (var i = 0; i < e.axes.length; ++i) {
  HEAPF64[eventStruct + i * 8 + 16 >> 3] = e.axes[i];
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] === "object") {
   HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i].value;
  } else {
   HEAPF64[eventStruct + i * 8 + 528 >> 3] = e.buttons[i];
  }
 }
 for (var i = 0; i < e.buttons.length; ++i) {
  if (typeof e.buttons[i] === "object") {
   HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i].pressed;
  } else {
   HEAP32[eventStruct + i * 4 + 1040 >> 2] = e.buttons[i] == 1;
  }
 }
 HEAP32[eventStruct + 1296 >> 2] = e.connected;
 HEAP32[eventStruct + 1300 >> 2] = e.index;
 HEAP32[eventStruct + 8 >> 2] = e.axes.length;
 HEAP32[eventStruct + 12 >> 2] = e.buttons.length;
 stringToUTF8(e.id, eventStruct + 1304, 64);
 stringToUTF8(e.mapping, eventStruct + 1368, 64);
}

function _emscripten_get_gamepad_status(index, gamepadState) {
 if (index < 0 || index >= JSEvents.lastGamepadState.length) return -5;
 if (!JSEvents.lastGamepadState[index]) return -7;
 __fillGamepadEventData(gamepadState, JSEvents.lastGamepadState[index]);
 return 0;
}

function _emscripten_get_heap_size() {
 return TOTAL_MEMORY;
}

function _emscripten_get_num_gamepads() {
 return JSEvents.lastGamepadState.length;
}

function _emscripten_glAccum() {
 err("missing function: emscripten_glAccum");
 abort(-1);
}

function _emscripten_glActiveTexture(x0) {
 GLctx["activeTexture"](x0);
}

function _emscripten_glAreTexturesResident() {
 err("missing function: emscripten_glAreTexturesResident");
 abort(-1);
}

function _emscripten_glArrayElement() {
 err("missing function: emscripten_glArrayElement");
 abort(-1);
}

function _emscripten_glAttachObjectARB() {
 err("missing function: emscripten_glAttachObjectARB");
 abort(-1);
}

function _emscripten_glAttachShader(program, shader) {
 GLctx.attachShader(GL.programs[program], GL.shaders[shader]);
}

function _emscripten_glBeginConditionalRender() {
 err("missing function: emscripten_glBeginConditionalRender");
 abort(-1);
}

function _emscripten_glBeginQuery() {
 err("missing function: emscripten_glBeginQuery");
 abort(-1);
}

function _emscripten_glBeginTransformFeedback() {
 err("missing function: emscripten_glBeginTransformFeedback");
 abort(-1);
}

function _emscripten_glBindAttribLocation(program, index, name) {
 GLctx.bindAttribLocation(GL.programs[program], index, UTF8ToString(name));
}

function _emscripten_glBindBuffer(target, buffer) {
 GLctx.bindBuffer(target, GL.buffers[buffer]);
}

function _emscripten_glBindBufferBase() {
 err("missing function: emscripten_glBindBufferBase");
 abort(-1);
}

function _emscripten_glBindBufferRange() {
 err("missing function: emscripten_glBindBufferRange");
 abort(-1);
}

function _emscripten_glBindFragDataLocation() {
 err("missing function: emscripten_glBindFragDataLocation");
 abort(-1);
}

function _emscripten_glBindFramebuffer(target, framebuffer) {
 GLctx.bindFramebuffer(target, GL.framebuffers[framebuffer]);
}

function _emscripten_glBindProgramARB() {
 err("missing function: emscripten_glBindProgramARB");
 abort(-1);
}

function _emscripten_glBindRenderbuffer(target, renderbuffer) {
 GLctx.bindRenderbuffer(target, GL.renderbuffers[renderbuffer]);
}

function _emscripten_glBindTexture(target, texture) {
 GLctx.bindTexture(target, GL.textures[texture]);
}

function _emscripten_glBindVertexArray(vao) {
 GLctx["bindVertexArray"](GL.vaos[vao]);
}

function _emscripten_glBitmap() {
 err("missing function: emscripten_glBitmap");
 abort(-1);
}

function _emscripten_glBlendColor(x0, x1, x2, x3) {
 GLctx["blendColor"](x0, x1, x2, x3);
}

function _emscripten_glBlendEquation(x0) {
 GLctx["blendEquation"](x0);
}

function _emscripten_glBlendEquationSeparate(x0, x1) {
 GLctx["blendEquationSeparate"](x0, x1);
}

function _emscripten_glBlendFunc(x0, x1) {
 GLctx["blendFunc"](x0, x1);
}

function _emscripten_glBlendFuncSeparate(x0, x1, x2, x3) {
 GLctx["blendFuncSeparate"](x0, x1, x2, x3);
}

function _emscripten_glBlitFramebuffer() {
 err("missing function: emscripten_glBlitFramebuffer");
 abort(-1);
}

function _emscripten_glBufferData(target, size, data, usage) {
 GLctx.bufferData(target, data ? HEAPU8.subarray(data, data + size) : size, usage);
}

function _emscripten_glBufferSubData(target, offset, size, data) {
 GLctx.bufferSubData(target, offset, HEAPU8.subarray(data, data + size));
}

function _emscripten_glCallList() {
 err("missing function: emscripten_glCallList");
 abort(-1);
}

function _emscripten_glCallLists() {
 err("missing function: emscripten_glCallLists");
 abort(-1);
}

function _emscripten_glCheckFramebufferStatus(x0) {
 return GLctx["checkFramebufferStatus"](x0);
}

function _emscripten_glClampColor() {
 err("missing function: emscripten_glClampColor");
 abort(-1);
}

function _emscripten_glClear(x0) {
 GLctx["clear"](x0);
}

function _emscripten_glClearAccum() {
 err("missing function: emscripten_glClearAccum");
 abort(-1);
}

function _emscripten_glClearBufferfi() {
 err("missing function: emscripten_glClearBufferfi");
 abort(-1);
}

function _emscripten_glClearBufferfv() {
 err("missing function: emscripten_glClearBufferfv");
 abort(-1);
}

function _emscripten_glClearBufferiv() {
 err("missing function: emscripten_glClearBufferiv");
 abort(-1);
}

function _emscripten_glClearBufferuiv() {
 err("missing function: emscripten_glClearBufferuiv");
 abort(-1);
}

function _emscripten_glClearColor(x0, x1, x2, x3) {
 GLctx["clearColor"](x0, x1, x2, x3);
}

function _emscripten_glClearDepth(x0) {
 GLctx["clearDepth"](x0);
}

function _emscripten_glClearDepthf(x0) {
 GLctx["clearDepth"](x0);
}

function _emscripten_glClearIndex() {
 err("missing function: emscripten_glClearIndex");
 abort(-1);
}

function _emscripten_glClearStencil(x0) {
 GLctx["clearStencil"](x0);
}

function _emscripten_glClipPlane() {
 err("missing function: emscripten_glClipPlane");
 abort(-1);
}

function _emscripten_glColorMask(red, green, blue, alpha) {
 GLctx.colorMask(!!red, !!green, !!blue, !!alpha);
}

function _emscripten_glColorMaski() {
 err("missing function: emscripten_glColorMaski");
 abort(-1);
}

function _emscripten_glColorMaterial() {
 err("missing function: emscripten_glColorMaterial");
 abort(-1);
}

function _emscripten_glColorSubTable() {
 err("missing function: emscripten_glColorSubTable");
 abort(-1);
}

function _emscripten_glColorTable() {
 err("missing function: emscripten_glColorTable");
 abort(-1);
}

function _emscripten_glColorTableParameterfv() {
 err("missing function: emscripten_glColorTableParameterfv");
 abort(-1);
}

function _emscripten_glColorTableParameteriv() {
 err("missing function: emscripten_glColorTableParameteriv");
 abort(-1);
}

function _emscripten_glCompileShader(shader) {
 GLctx.compileShader(GL.shaders[shader]);
}

function _emscripten_glCompressedTexImage1D() {
 err("missing function: emscripten_glCompressedTexImage1D");
 abort(-1);
}

function _emscripten_glCompressedTexImage2D(target, level, internalFormat, width, height, border, imageSize, data) {
 GLctx["compressedTexImage2D"](target, level, internalFormat, width, height, border, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

function _emscripten_glCompressedTexImage3D() {
 err("missing function: emscripten_glCompressedTexImage3D");
 abort(-1);
}

function _emscripten_glCompressedTexSubImage1D() {
 err("missing function: emscripten_glCompressedTexSubImage1D");
 abort(-1);
}

function _emscripten_glCompressedTexSubImage2D(target, level, xoffset, yoffset, width, height, format, imageSize, data) {
 GLctx["compressedTexSubImage2D"](target, level, xoffset, yoffset, width, height, format, data ? HEAPU8.subarray(data, data + imageSize) : null);
}

function _emscripten_glCompressedTexSubImage3D() {
 err("missing function: emscripten_glCompressedTexSubImage3D");
 abort(-1);
}

function _emscripten_glConvolutionFilter1D() {
 err("missing function: emscripten_glConvolutionFilter1D");
 abort(-1);
}

function _emscripten_glConvolutionFilter2D() {
 err("missing function: emscripten_glConvolutionFilter2D");
 abort(-1);
}

function _emscripten_glConvolutionParameterf() {
 err("missing function: emscripten_glConvolutionParameterf");
 abort(-1);
}

function _emscripten_glConvolutionParameterfv() {
 err("missing function: emscripten_glConvolutionParameterfv");
 abort(-1);
}

function _emscripten_glConvolutionParameteri() {
 err("missing function: emscripten_glConvolutionParameteri");
 abort(-1);
}

function _emscripten_glConvolutionParameteriv() {
 err("missing function: emscripten_glConvolutionParameteriv");
 abort(-1);
}

function _emscripten_glCopyColorSubTable() {
 err("missing function: emscripten_glCopyColorSubTable");
 abort(-1);
}

function _emscripten_glCopyColorTable() {
 err("missing function: emscripten_glCopyColorTable");
 abort(-1);
}

function _emscripten_glCopyConvolutionFilter1D() {
 err("missing function: emscripten_glCopyConvolutionFilter1D");
 abort(-1);
}

function _emscripten_glCopyConvolutionFilter2D() {
 err("missing function: emscripten_glCopyConvolutionFilter2D");
 abort(-1);
}

function _emscripten_glCopyPixels() {
 err("missing function: emscripten_glCopyPixels");
 abort(-1);
}

function _emscripten_glCopyTexImage1D() {
 err("missing function: emscripten_glCopyTexImage1D");
 abort(-1);
}

function _emscripten_glCopyTexImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

function _emscripten_glCopyTexSubImage1D() {
 err("missing function: emscripten_glCopyTexSubImage1D");
 abort(-1);
}

function _emscripten_glCopyTexSubImage2D(x0, x1, x2, x3, x4, x5, x6, x7) {
 GLctx["copyTexSubImage2D"](x0, x1, x2, x3, x4, x5, x6, x7);
}

function _emscripten_glCopyTexSubImage3D() {
 err("missing function: emscripten_glCopyTexSubImage3D");
 abort(-1);
}

function _emscripten_glCreateProgram() {
 var id = GL.getNewId(GL.programs);
 var program = GLctx.createProgram();
 program.name = id;
 GL.programs[id] = program;
 return id;
}

function _emscripten_glCreateProgramObjectARB() {
 err("missing function: emscripten_glCreateProgramObjectARB");
 abort(-1);
}

function _emscripten_glCreateShader(shaderType) {
 var id = GL.getNewId(GL.shaders);
 GL.shaders[id] = GLctx.createShader(shaderType);
 return id;
}

function _emscripten_glCreateShaderObjectARB() {
 err("missing function: emscripten_glCreateShaderObjectARB");
 abort(-1);
}

function _emscripten_glCullFace(x0) {
 GLctx["cullFace"](x0);
}

function _emscripten_glDeleteBuffers(n, buffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[buffers + i * 4 >> 2];
  var buffer = GL.buffers[id];
  if (!buffer) continue;
  GLctx.deleteBuffer(buffer);
  buffer.name = 0;
  GL.buffers[id] = null;
  if (id == GL.currArrayBuffer) GL.currArrayBuffer = 0;
  if (id == GL.currElementArrayBuffer) GL.currElementArrayBuffer = 0;
 }
}

function _emscripten_glDeleteFramebuffers(n, framebuffers) {
 for (var i = 0; i < n; ++i) {
  var id = HEAP32[framebuffers + i * 4 >> 2];
  var framebuffer = GL.framebuffers[id];
  if (!framebuffer) continue;
  GLctx.deleteFramebuffer(framebuffer);
  framebuffer.name = 0;
  GL.framebuffers[id] = null;
 }
}

function _emscripten_glDeleteLists() {
 err("missing function: emscripten_glDeleteLists");
 abort(-1);
}

function _emscripten_glDeleteProgram(id) {
 if (!id) return;
 var program = GL.programs[id];
 if (!program) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteProgram(program);
 program.name = 0;
 GL.programs[id] = null;
 GL.programInfos[id] = null;
}

function _emscripten_glDeleteProgramsARB() {
 err("missing function: emscripten_glDeleteProgramsARB");
 abort(-1);
}

function _emscripten_glDeleteQueries() {
 err("missing function: emscripten_glDeleteQueries");
 abort(-1);
}

function _emscripten_glDeleteRenderbuffers(n, renderbuffers) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[renderbuffers + i * 4 >> 2];
  var renderbuffer = GL.renderbuffers[id];
  if (!renderbuffer) continue;
  GLctx.deleteRenderbuffer(renderbuffer);
  renderbuffer.name = 0;
  GL.renderbuffers[id] = null;
 }
}

function _emscripten_glDeleteShader(id) {
 if (!id) return;
 var shader = GL.shaders[id];
 if (!shader) {
  GL.recordError(1281);
  return;
 }
 GLctx.deleteShader(shader);
 GL.shaders[id] = null;
}

function _emscripten_glDeleteTextures(n, textures) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[textures + i * 4 >> 2];
  var texture = GL.textures[id];
  if (!texture) continue;
  GLctx.deleteTexture(texture);
  texture.name = 0;
  GL.textures[id] = null;
 }
}

function _emscripten_glDeleteVertexArrays(n, vaos) {
 for (var i = 0; i < n; i++) {
  var id = HEAP32[vaos + i * 4 >> 2];
  GLctx["deleteVertexArray"](GL.vaos[id]);
  GL.vaos[id] = null;
 }
}

function _emscripten_glDepthFunc(x0) {
 GLctx["depthFunc"](x0);
}

function _emscripten_glDepthMask(flag) {
 GLctx.depthMask(!!flag);
}

function _emscripten_glDepthRange(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

function _emscripten_glDepthRangef(x0, x1) {
 GLctx["depthRange"](x0, x1);
}

function _emscripten_glDetachObjectARB() {
 err("missing function: emscripten_glDetachObjectARB");
 abort(-1);
}

function _emscripten_glDetachShader(program, shader) {
 GLctx.detachShader(GL.programs[program], GL.shaders[shader]);
}

function _emscripten_glDisable(x0) {
 GLctx["disable"](x0);
}

function _emscripten_glDisableVertexAttribArray(index) {
 GLctx.disableVertexAttribArray(index);
}

function _emscripten_glDisablei() {
 err("missing function: emscripten_glDisablei");
 abort(-1);
}

function _emscripten_glDrawArrays(mode, first, count) {
 GLctx.drawArrays(mode, first, count);
}

function _emscripten_glDrawArraysInstanced(mode, first, count, primcount) {
 GLctx["drawArraysInstanced"](mode, first, count, primcount);
}

var __tempFixedLengthArray = [];

function _emscripten_glDrawBuffers(n, bufs) {
 var bufArray = __tempFixedLengthArray[n];
 for (var i = 0; i < n; i++) {
  bufArray[i] = HEAP32[bufs + i * 4 >> 2];
 }
 GLctx["drawBuffers"](bufArray);
}

function _emscripten_glDrawElements(mode, count, type, indices) {
 GLctx.drawElements(mode, count, type, indices);
}

function _emscripten_glDrawElementsInstanced(mode, count, type, indices, primcount) {
 GLctx["drawElementsInstanced"](mode, count, type, indices, primcount);
}

function _emscripten_glDrawPixels() {
 err("missing function: emscripten_glDrawPixels");
 abort(-1);
}

function _emscripten_glDrawRangeElements() {
 err("missing function: emscripten_glDrawRangeElements");
 abort(-1);
}

function _emscripten_glEdgeFlag() {
 err("missing function: emscripten_glEdgeFlag");
 abort(-1);
}

function _emscripten_glEdgeFlagPointer() {
 err("missing function: emscripten_glEdgeFlagPointer");
 abort(-1);
}

function _emscripten_glEdgeFlagv() {
 err("missing function: emscripten_glEdgeFlagv");
 abort(-1);
}

function _emscripten_glEnable(x0) {
 GLctx["enable"](x0);
}

function _emscripten_glEnableVertexAttribArray(index) {
 GLctx.enableVertexAttribArray(index);
}

function _emscripten_glEnablei() {
 err("missing function: emscripten_glEnablei");
 abort(-1);
}

function _emscripten_glEndConditionalRender() {
 err("missing function: emscripten_glEndConditionalRender");
 abort(-1);
}

function _emscripten_glEndList() {
 err("missing function: emscripten_glEndList");
 abort(-1);
}

function _emscripten_glEndQuery() {
 err("missing function: emscripten_glEndQuery");
 abort(-1);
}

function _emscripten_glEndTransformFeedback() {
 err("missing function: emscripten_glEndTransformFeedback");
 abort(-1);
}

function _emscripten_glEvalCoord1d() {
 err("missing function: emscripten_glEvalCoord1d");
 abort(-1);
}

function _emscripten_glEvalCoord1dv() {
 err("missing function: emscripten_glEvalCoord1dv");
 abort(-1);
}

function _emscripten_glEvalCoord1f() {
 err("missing function: emscripten_glEvalCoord1f");
 abort(-1);
}

function _emscripten_glEvalCoord1fv() {
 err("missing function: emscripten_glEvalCoord1fv");
 abort(-1);
}

function _emscripten_glEvalCoord2d() {
 err("missing function: emscripten_glEvalCoord2d");
 abort(-1);
}

function _emscripten_glEvalCoord2dv() {
 err("missing function: emscripten_glEvalCoord2dv");
 abort(-1);
}

function _emscripten_glEvalCoord2f() {
 err("missing function: emscripten_glEvalCoord2f");
 abort(-1);
}

function _emscripten_glEvalCoord2fv() {
 err("missing function: emscripten_glEvalCoord2fv");
 abort(-1);
}

function _emscripten_glEvalMesh1() {
 err("missing function: emscripten_glEvalMesh1");
 abort(-1);
}

function _emscripten_glEvalMesh2() {
 err("missing function: emscripten_glEvalMesh2");
 abort(-1);
}

function _emscripten_glEvalPoint1() {
 err("missing function: emscripten_glEvalPoint1");
 abort(-1);
}

function _emscripten_glEvalPoint2() {
 err("missing function: emscripten_glEvalPoint2");
 abort(-1);
}

function _emscripten_glFeedbackBuffer() {
 err("missing function: emscripten_glFeedbackBuffer");
 abort(-1);
}

function _emscripten_glFinish() {
 GLctx["finish"]();
}

function _emscripten_glFlush() {
 GLctx["flush"]();
}

function _emscripten_glFogf() {
 err("missing function: emscripten_glFogf");
 abort(-1);
}

function _emscripten_glFogfv() {
 err("missing function: emscripten_glFogfv");
 abort(-1);
}

function _emscripten_glFogi() {
 err("missing function: emscripten_glFogi");
 abort(-1);
}

function _emscripten_glFogiv() {
 err("missing function: emscripten_glFogiv");
 abort(-1);
}

function _emscripten_glFramebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer) {
 GLctx.framebufferRenderbuffer(target, attachment, renderbuffertarget, GL.renderbuffers[renderbuffer]);
}

function _emscripten_glFramebufferTexture1D() {
 err("missing function: emscripten_glFramebufferTexture1D");
 abort(-1);
}

function _emscripten_glFramebufferTexture2D(target, attachment, textarget, texture, level) {
 GLctx.framebufferTexture2D(target, attachment, textarget, GL.textures[texture], level);
}

function _emscripten_glFramebufferTexture3D() {
 err("missing function: emscripten_glFramebufferTexture3D");
 abort(-1);
}

function _emscripten_glFramebufferTextureLayer() {
 err("missing function: emscripten_glFramebufferTextureLayer");
 abort(-1);
}

function _emscripten_glFrontFace(x0) {
 GLctx["frontFace"](x0);
}

function __glGenObject(n, buffers, createFunction, objectTable) {
 for (var i = 0; i < n; i++) {
  var buffer = GLctx[createFunction]();
  var id = buffer && GL.getNewId(objectTable);
  if (buffer) {
   buffer.name = id;
   objectTable[id] = buffer;
  } else {
   GL.recordError(1282);
  }
  HEAP32[buffers + i * 4 >> 2] = id;
 }
}

function _emscripten_glGenBuffers(n, buffers) {
 __glGenObject(n, buffers, "createBuffer", GL.buffers);
}

function _emscripten_glGenFramebuffers(n, ids) {
 __glGenObject(n, ids, "createFramebuffer", GL.framebuffers);
}

function _emscripten_glGenLists() {
 err("missing function: emscripten_glGenLists");
 abort(-1);
}

function _emscripten_glGenProgramsARB() {
 err("missing function: emscripten_glGenProgramsARB");
 abort(-1);
}

function _emscripten_glGenQueries() {
 err("missing function: emscripten_glGenQueries");
 abort(-1);
}

function _emscripten_glGenRenderbuffers(n, renderbuffers) {
 __glGenObject(n, renderbuffers, "createRenderbuffer", GL.renderbuffers);
}

function _emscripten_glGenTextures(n, textures) {
 __glGenObject(n, textures, "createTexture", GL.textures);
}

function _emscripten_glGenVertexArrays(n, arrays) {
 __glGenObject(n, arrays, "createVertexArray", GL.vaos);
}

function _emscripten_glGenerateMipmap(x0) {
 GLctx["generateMipmap"](x0);
}

function _emscripten_glGetActiveAttrib(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveAttrib(program, index);
 if (!info) return;
 if (bufSize > 0 && name) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

function _emscripten_glGetActiveUniform(program, index, bufSize, length, size, type, name) {
 program = GL.programs[program];
 var info = GLctx.getActiveUniform(program, index);
 if (!info) return;
 if (bufSize > 0 && name) {
  var numBytesWrittenExclNull = stringToUTF8(info.name, name, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
 if (size) HEAP32[size >> 2] = info.size;
 if (type) HEAP32[type >> 2] = info.type;
}

function _emscripten_glGetActiveUniformBlockName() {
 err("missing function: emscripten_glGetActiveUniformBlockName");
 abort(-1);
}

function _emscripten_glGetActiveUniformBlockiv() {
 err("missing function: emscripten_glGetActiveUniformBlockiv");
 abort(-1);
}

function _emscripten_glGetActiveUniformName() {
 err("missing function: emscripten_glGetActiveUniformName");
 abort(-1);
}

function _emscripten_glGetActiveUniformsiv() {
 err("missing function: emscripten_glGetActiveUniformsiv");
 abort(-1);
}

function _emscripten_glGetAttachedObjectsARB() {
 err("missing function: emscripten_glGetAttachedObjectsARB");
 abort(-1);
}

function _emscripten_glGetAttachedShaders(program, maxCount, count, shaders) {
 var result = GLctx.getAttachedShaders(GL.programs[program]);
 var len = result.length;
 if (len > maxCount) {
  len = maxCount;
 }
 HEAP32[count >> 2] = len;
 for (var i = 0; i < len; ++i) {
  var id = GL.shaders.indexOf(result[i]);
  HEAP32[shaders + i * 4 >> 2] = id;
 }
}

function _emscripten_glGetAttribLocation(program, name) {
 return GLctx.getAttribLocation(GL.programs[program], UTF8ToString(name));
}

function _emscripten_glGetBooleani_v() {
 err("missing function: emscripten_glGetBooleani_v");
 abort(-1);
}

function emscriptenWebGLGet(name_, p, type) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 var ret = undefined;
 switch (name_) {
 case 36346:
  ret = 1;
  break;

 case 36344:
  if (type !== "Integer" && type !== "Integer64") {
   GL.recordError(1280);
  }
  return;

 case 36345:
  ret = 0;
  break;

 case 34466:
  var formats = GLctx.getParameter(34467);
  ret = formats ? formats.length : 0;
  break;
 }
 if (ret === undefined) {
  var result = GLctx.getParameter(name_);
  switch (typeof result) {
  case "number":
   ret = result;
   break;

  case "boolean":
   ret = result ? 1 : 0;
   break;

  case "string":
   GL.recordError(1280);
   return;

  case "object":
   if (result === null) {
    switch (name_) {
    case 34964:
    case 35725:
    case 34965:
    case 36006:
    case 36007:
    case 32873:
    case 34229:
    case 34068:
     {
      ret = 0;
      break;
     }

    default:
     {
      GL.recordError(1280);
      return;
     }
    }
   } else if (result instanceof Float32Array || result instanceof Uint32Array || result instanceof Int32Array || result instanceof Array) {
    for (var i = 0; i < result.length; ++i) {
     switch (type) {
     case "Integer":
      HEAP32[p + i * 4 >> 2] = result[i];
      break;

     case "Float":
      HEAPF32[p + i * 4 >> 2] = result[i];
      break;

     case "Boolean":
      HEAP8[p + i >> 0] = result[i] ? 1 : 0;
      break;

     default:
      throw "internal glGet error, bad type: " + type;
     }
    }
    return;
   } else {
    try {
     ret = result.name | 0;
    } catch (e) {
     GL.recordError(1280);
     err("GL_INVALID_ENUM in glGet" + type + "v: Unknown object returned from WebGL getParameter(" + name_ + ")! (error: " + e + ")");
     return;
    }
   }
   break;

  default:
   GL.recordError(1280);
   return;
  }
 }
 switch (type) {
 case "Integer64":
  tempI64 = [ ret >>> 0, (tempDouble = ret, +Math_abs(tempDouble) >= 1 ? tempDouble > 0 ? (Math_min(+Math_floor(tempDouble / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0) ], 
  HEAP32[p >> 2] = tempI64[0], HEAP32[p + 4 >> 2] = tempI64[1];
  break;

 case "Integer":
  HEAP32[p >> 2] = ret;
  break;

 case "Float":
  HEAPF32[p >> 2] = ret;
  break;

 case "Boolean":
  HEAP8[p >> 0] = ret ? 1 : 0;
  break;

 default:
  throw "internal glGet error, bad type: " + type;
 }
}

function _emscripten_glGetBooleanv(name_, p) {
 emscriptenWebGLGet(name_, p, "Boolean");
}

function _emscripten_glGetBufferParameteriv(target, value, data) {
 if (!data) {
  GL.recordError(1281);
  return;
 }
 HEAP32[data >> 2] = GLctx.getBufferParameter(target, value);
}

function _emscripten_glGetBufferPointerv() {
 err("missing function: emscripten_glGetBufferPointerv");
 abort(-1);
}

function _emscripten_glGetBufferSubData() {
 err("missing function: emscripten_glGetBufferSubData");
 abort(-1);
}

function _emscripten_glGetClipPlane() {
 err("missing function: emscripten_glGetClipPlane");
 abort(-1);
}

function _emscripten_glGetColorTable() {
 err("missing function: emscripten_glGetColorTable");
 abort(-1);
}

function _emscripten_glGetColorTableParameterfv() {
 err("missing function: emscripten_glGetColorTableParameterfv");
 abort(-1);
}

function _emscripten_glGetColorTableParameteriv() {
 err("missing function: emscripten_glGetColorTableParameteriv");
 abort(-1);
}

function _emscripten_glGetCompressedTexImage() {
 err("missing function: emscripten_glGetCompressedTexImage");
 abort(-1);
}

function _emscripten_glGetConvolutionFilter() {
 err("missing function: emscripten_glGetConvolutionFilter");
 abort(-1);
}

function _emscripten_glGetConvolutionParameterfv() {
 err("missing function: emscripten_glGetConvolutionParameterfv");
 abort(-1);
}

function _emscripten_glGetConvolutionParameteriv() {
 err("missing function: emscripten_glGetConvolutionParameteriv");
 abort(-1);
}

function _emscripten_glGetDoublev() {
 err("missing function: emscripten_glGetDoublev");
 abort(-1);
}

function _emscripten_glGetError() {
 if (GL.lastError) {
  var error = GL.lastError;
  GL.lastError = 0;
  return error;
 } else {
  return GLctx.getError();
 }
}

function _emscripten_glGetFloatv(name_, p) {
 emscriptenWebGLGet(name_, p, "Float");
}

function _emscripten_glGetFragDataLocation() {
 err("missing function: emscripten_glGetFragDataLocation");
 abort(-1);
}

function _emscripten_glGetFramebufferAttachmentParameteriv(target, attachment, pname, params) {
 var result = GLctx.getFramebufferAttachmentParameter(target, attachment, pname);
 if (result instanceof WebGLRenderbuffer || result instanceof WebGLTexture) {
  result = result.name | 0;
 }
 HEAP32[params >> 2] = result;
}

function _emscripten_glGetHandleARB() {
 err("missing function: emscripten_glGetHandleARB");
 abort(-1);
}

function _emscripten_glGetHistogram() {
 err("missing function: emscripten_glGetHistogram");
 abort(-1);
}

function _emscripten_glGetHistogramParameterfv() {
 err("missing function: emscripten_glGetHistogramParameterfv");
 abort(-1);
}

function _emscripten_glGetHistogramParameteriv() {
 err("missing function: emscripten_glGetHistogramParameteriv");
 abort(-1);
}

function _emscripten_glGetIntegeri_v() {
 err("missing function: emscripten_glGetIntegeri_v");
 abort(-1);
}

function _emscripten_glGetIntegerv(name_, p) {
 emscriptenWebGLGet(name_, p, "Integer");
}

function _emscripten_glGetLightfv() {
 err("missing function: emscripten_glGetLightfv");
 abort(-1);
}

function _emscripten_glGetLightiv() {
 err("missing function: emscripten_glGetLightiv");
 abort(-1);
}

function _emscripten_glGetMapdv() {
 err("missing function: emscripten_glGetMapdv");
 abort(-1);
}

function _emscripten_glGetMapfv() {
 err("missing function: emscripten_glGetMapfv");
 abort(-1);
}

function _emscripten_glGetMapiv() {
 err("missing function: emscripten_glGetMapiv");
 abort(-1);
}

function _emscripten_glGetMaterialfv() {
 err("missing function: emscripten_glGetMaterialfv");
 abort(-1);
}

function _emscripten_glGetMaterialiv() {
 err("missing function: emscripten_glGetMaterialiv");
 abort(-1);
}

function _emscripten_glGetMinmax() {
 err("missing function: emscripten_glGetMinmax");
 abort(-1);
}

function _emscripten_glGetMinmaxParameterfv() {
 err("missing function: emscripten_glGetMinmaxParameterfv");
 abort(-1);
}

function _emscripten_glGetMinmaxParameteriv() {
 err("missing function: emscripten_glGetMinmaxParameteriv");
 abort(-1);
}

function _emscripten_glGetObjectParameterfvARB() {
 err("missing function: emscripten_glGetObjectParameterfvARB");
 abort(-1);
}

function _emscripten_glGetObjectParameterivARB() {
 err("missing function: emscripten_glGetObjectParameterivARB");
 abort(-1);
}

function _emscripten_glGetPixelMapfv() {
 err("missing function: emscripten_glGetPixelMapfv");
 abort(-1);
}

function _emscripten_glGetPixelMapuiv() {
 err("missing function: emscripten_glGetPixelMapuiv");
 abort(-1);
}

function _emscripten_glGetPixelMapusv() {
 err("missing function: emscripten_glGetPixelMapusv");
 abort(-1);
}

function _emscripten_glGetPointerv() {
 err("missing function: emscripten_glGetPointerv");
 abort(-1);
}

function _emscripten_glGetPolygonStipple() {
 err("missing function: emscripten_glGetPolygonStipple");
 abort(-1);
}

function _emscripten_glGetProgramEnvParameterdvARB() {
 err("missing function: emscripten_glGetProgramEnvParameterdvARB");
 abort(-1);
}

function _emscripten_glGetProgramEnvParameterfvARB() {
 err("missing function: emscripten_glGetProgramEnvParameterfvARB");
 abort(-1);
}

function _emscripten_glGetProgramInfoLog(program, maxLength, length, infoLog) {
 var log = GLctx.getProgramInfoLog(GL.programs[program]);
 if (log === null) log = "(unknown error)";
 if (maxLength > 0 && infoLog) {
  var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}

function _emscripten_glGetProgramLocalParameterdvARB() {
 err("missing function: emscripten_glGetProgramLocalParameterdvARB");
 abort(-1);
}

function _emscripten_glGetProgramLocalParameterfvARB() {
 err("missing function: emscripten_glGetProgramLocalParameterfvARB");
 abort(-1);
}

function _emscripten_glGetProgramStringARB() {
 err("missing function: emscripten_glGetProgramStringARB");
 abort(-1);
}

function _emscripten_glGetProgramiv(program, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (program >= GL.counter) {
  GL.recordError(1281);
  return;
 }
 var ptable = GL.programInfos[program];
 if (!ptable) {
  GL.recordError(1282);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getProgramInfoLog(GL.programs[program]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35719) {
  HEAP32[p >> 2] = ptable.maxUniformLength;
 } else if (pname == 35722) {
  if (ptable.maxAttributeLength == -1) {
   program = GL.programs[program];
   var numAttribs = GLctx.getProgramParameter(program, 35721);
   ptable.maxAttributeLength = 0;
   for (var i = 0; i < numAttribs; ++i) {
    var activeAttrib = GLctx.getActiveAttrib(program, i);
    ptable.maxAttributeLength = Math.max(ptable.maxAttributeLength, activeAttrib.name.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxAttributeLength;
 } else if (pname == 35381) {
  if (ptable.maxUniformBlockNameLength == -1) {
   program = GL.programs[program];
   var numBlocks = GLctx.getProgramParameter(program, 35382);
   ptable.maxUniformBlockNameLength = 0;
   for (var i = 0; i < numBlocks; ++i) {
    var activeBlockName = GLctx.getActiveUniformBlockName(program, i);
    ptable.maxUniformBlockNameLength = Math.max(ptable.maxUniformBlockNameLength, activeBlockName.length + 1);
   }
  }
  HEAP32[p >> 2] = ptable.maxUniformBlockNameLength;
 } else {
  HEAP32[p >> 2] = GLctx.getProgramParameter(GL.programs[program], pname);
 }
}

function _emscripten_glGetQueryObjectiv() {
 err("missing function: emscripten_glGetQueryObjectiv");
 abort(-1);
}

function _emscripten_glGetQueryObjectuiv() {
 err("missing function: emscripten_glGetQueryObjectuiv");
 abort(-1);
}

function _emscripten_glGetQueryiv() {
 err("missing function: emscripten_glGetQueryiv");
 abort(-1);
}

function _emscripten_glGetRenderbufferParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getRenderbufferParameter(target, pname);
}

function _emscripten_glGetSeparableFilter() {
 err("missing function: emscripten_glGetSeparableFilter");
 abort(-1);
}

function _emscripten_glGetShaderInfoLog(shader, maxLength, length, infoLog) {
 var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
 if (log === null) log = "(unknown error)";
 if (maxLength > 0 && infoLog) {
  var numBytesWrittenExclNull = stringToUTF8(log, infoLog, maxLength);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}

function _emscripten_glGetShaderPrecisionFormat(shaderType, precisionType, range, precision) {
 var result = GLctx.getShaderPrecisionFormat(shaderType, precisionType);
 HEAP32[range >> 2] = result.rangeMin;
 HEAP32[range + 4 >> 2] = result.rangeMax;
 HEAP32[precision >> 2] = result.precision;
}

function _emscripten_glGetShaderSource(shader, bufSize, length, source) {
 var result = GLctx.getShaderSource(GL.shaders[shader]);
 if (!result) return;
 if (bufSize > 0 && source) {
  var numBytesWrittenExclNull = stringToUTF8(result, source, bufSize);
  if (length) HEAP32[length >> 2] = numBytesWrittenExclNull;
 } else {
  if (length) HEAP32[length >> 2] = 0;
 }
}

function _emscripten_glGetShaderiv(shader, pname, p) {
 if (!p) {
  GL.recordError(1281);
  return;
 }
 if (pname == 35716) {
  var log = GLctx.getShaderInfoLog(GL.shaders[shader]);
  if (log === null) log = "(unknown error)";
  HEAP32[p >> 2] = log.length + 1;
 } else if (pname == 35720) {
  var source = GLctx.getShaderSource(GL.shaders[shader]);
  var sourceLength = source === null || source.length == 0 ? 0 : source.length + 1;
  HEAP32[p >> 2] = sourceLength;
 } else {
  HEAP32[p >> 2] = GLctx.getShaderParameter(GL.shaders[shader], pname);
 }
}

function stringToNewUTF8(jsString) {
 var length = lengthBytesUTF8(jsString) + 1;
 var cString = _malloc(length);
 stringToUTF8(jsString, cString, length);
 return cString;
}

function _emscripten_glGetString(name_) {
 if (GL.stringCache[name_]) return GL.stringCache[name_];
 var ret;
 switch (name_) {
 case 7939:
  var exts = GLctx.getSupportedExtensions();
  var gl_exts = [];
  for (var i = 0; i < exts.length; ++i) {
   gl_exts.push(exts[i]);
   gl_exts.push("GL_" + exts[i]);
  }
  ret = stringToNewUTF8(gl_exts.join(" "));
  break;

 case 7936:
 case 7937:
 case 37445:
 case 37446:
  var s = GLctx.getParameter(name_);
  if (!s) {
   GL.recordError(1280);
  }
  ret = stringToNewUTF8(s);
  break;

 case 7938:
  var glVersion = GLctx.getParameter(GLctx.VERSION);
  {
   glVersion = "OpenGL ES 2.0 (" + glVersion + ")";
  }
  ret = stringToNewUTF8(glVersion);
  break;

 case 35724:
  var glslVersion = GLctx.getParameter(GLctx.SHADING_LANGUAGE_VERSION);
  var ver_re = /^WebGL GLSL ES ([0-9]\.[0-9][0-9]?)(?:$| .*)/;
  var ver_num = glslVersion.match(ver_re);
  if (ver_num !== null) {
   if (ver_num[1].length == 3) ver_num[1] = ver_num[1] + "0";
   glslVersion = "OpenGL ES GLSL ES " + ver_num[1] + " (" + glslVersion + ")";
  }
  ret = stringToNewUTF8(glslVersion);
  break;

 default:
  GL.recordError(1280);
  return 0;
 }
 GL.stringCache[name_] = ret;
 return ret;
}

function _emscripten_glGetStringi() {
 err("missing function: emscripten_glGetStringi");
 abort(-1);
}

function _emscripten_glGetTexGendv() {
 err("missing function: emscripten_glGetTexGendv");
 abort(-1);
}

function _emscripten_glGetTexGenfv() {
 err("missing function: emscripten_glGetTexGenfv");
 abort(-1);
}

function _emscripten_glGetTexGeniv() {
 err("missing function: emscripten_glGetTexGeniv");
 abort(-1);
}

function _emscripten_glGetTexImage() {
 err("missing function: emscripten_glGetTexImage");
 abort(-1);
}

function _emscripten_glGetTexParameterIiv() {
 err("missing function: emscripten_glGetTexParameterIiv");
 abort(-1);
}

function _emscripten_glGetTexParameterIuiv() {
 err("missing function: emscripten_glGetTexParameterIuiv");
 abort(-1);
}

function _emscripten_glGetTexParameterfv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAPF32[params >> 2] = GLctx.getTexParameter(target, pname);
}

function _emscripten_glGetTexParameteriv(target, pname, params) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 HEAP32[params >> 2] = GLctx.getTexParameter(target, pname);
}

function _emscripten_glGetTransformFeedbackVarying() {
 err("missing function: emscripten_glGetTransformFeedbackVarying");
 abort(-1);
}

function _emscripten_glGetUniformBlockIndex() {
 err("missing function: emscripten_glGetUniformBlockIndex");
 abort(-1);
}

function _emscripten_glGetUniformIndices() {
 err("missing function: emscripten_glGetUniformIndices");
 abort(-1);
}

function _emscripten_glGetUniformLocation(program, name) {
 name = UTF8ToString(name);
 var arrayIndex = 0;
 if (name[name.length - 1] == "]") {
  var leftBrace = name.lastIndexOf("[");
  arrayIndex = name[leftBrace + 1] != "]" ? parseInt(name.slice(leftBrace + 1)) : 0;
  name = name.slice(0, leftBrace);
 }
 var uniformInfo = GL.programInfos[program] && GL.programInfos[program].uniforms[name];
 if (uniformInfo && arrayIndex >= 0 && arrayIndex < uniformInfo[0]) {
  return uniformInfo[1] + arrayIndex;
 } else {
  return -1;
 }
}

function emscriptenWebGLGetUniform(program, location, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getUniform(GL.programs[program], GL.uniforms[location]);
 if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case "Integer":
   HEAP32[params >> 2] = data;
   break;

  case "Float":
   HEAPF32[params >> 2] = data;
   break;

  default:
   throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case "Integer":
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case "Float":
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;

   default:
    throw "internal emscriptenWebGLGetUniform() error, bad type: " + type;
   }
  }
 }
}

function _emscripten_glGetUniformfv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, "Float");
}

function _emscripten_glGetUniformiv(program, location, params) {
 emscriptenWebGLGetUniform(program, location, params, "Integer");
}

function _emscripten_glGetUniformuiv() {
 err("missing function: emscripten_glGetUniformuiv");
 abort(-1);
}

function _emscripten_glGetVertexAttribIiv() {
 err("missing function: emscripten_glGetVertexAttribIiv");
 abort(-1);
}

function _emscripten_glGetVertexAttribIuiv() {
 err("missing function: emscripten_glGetVertexAttribIuiv");
 abort(-1);
}

function _emscripten_glGetVertexAttribPointerv(index, pname, pointer) {
 if (!pointer) {
  GL.recordError(1281);
  return;
 }
 HEAP32[pointer >> 2] = GLctx.getVertexAttribOffset(index, pname);
}

function _emscripten_glGetVertexAttribdv() {
 err("missing function: emscripten_glGetVertexAttribdv");
 abort(-1);
}

function emscriptenWebGLGetVertexAttrib(index, pname, params, type) {
 if (!params) {
  GL.recordError(1281);
  return;
 }
 var data = GLctx.getVertexAttrib(index, pname);
 if (pname == 34975) {
  HEAP32[params >> 2] = data["name"];
 } else if (typeof data == "number" || typeof data == "boolean") {
  switch (type) {
  case "Integer":
   HEAP32[params >> 2] = data;
   break;

  case "Float":
   HEAPF32[params >> 2] = data;
   break;

  case "FloatToInteger":
   HEAP32[params >> 2] = Math.fround(data);
   break;

  default:
   throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
  }
 } else {
  for (var i = 0; i < data.length; i++) {
   switch (type) {
   case "Integer":
    HEAP32[params + i * 4 >> 2] = data[i];
    break;

   case "Float":
    HEAPF32[params + i * 4 >> 2] = data[i];
    break;

   case "FloatToInteger":
    HEAP32[params + i * 4 >> 2] = Math.fround(data[i]);
    break;

   default:
    throw "internal emscriptenWebGLGetVertexAttrib() error, bad type: " + type;
   }
  }
 }
}

function _emscripten_glGetVertexAttribfv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, "Float");
}

function _emscripten_glGetVertexAttribiv(index, pname, params) {
 emscriptenWebGLGetVertexAttrib(index, pname, params, "FloatToInteger");
}

function _emscripten_glHint(x0, x1) {
 GLctx["hint"](x0, x1);
}

function _emscripten_glHistogram() {
 err("missing function: emscripten_glHistogram");
 abort(-1);
}

function _emscripten_glIndexMask() {
 err("missing function: emscripten_glIndexMask");
 abort(-1);
}

function _emscripten_glIndexPointer() {
 err("missing function: emscripten_glIndexPointer");
 abort(-1);
}

function _emscripten_glIndexd() {
 err("missing function: emscripten_glIndexd");
 abort(-1);
}

function _emscripten_glIndexdv() {
 err("missing function: emscripten_glIndexdv");
 abort(-1);
}

function _emscripten_glIndexf() {
 err("missing function: emscripten_glIndexf");
 abort(-1);
}

function _emscripten_glIndexfv() {
 err("missing function: emscripten_glIndexfv");
 abort(-1);
}

function _emscripten_glIndexi() {
 err("missing function: emscripten_glIndexi");
 abort(-1);
}

function _emscripten_glIndexiv() {
 err("missing function: emscripten_glIndexiv");
 abort(-1);
}

function _emscripten_glIndexs() {
 err("missing function: emscripten_glIndexs");
 abort(-1);
}

function _emscripten_glIndexsv() {
 err("missing function: emscripten_glIndexsv");
 abort(-1);
}

function _emscripten_glIndexub() {
 err("missing function: emscripten_glIndexub");
 abort(-1);
}

function _emscripten_glIndexubv() {
 err("missing function: emscripten_glIndexubv");
 abort(-1);
}

function _emscripten_glInitNames() {
 err("missing function: emscripten_glInitNames");
 abort(-1);
}

function _emscripten_glInterleavedArrays() {
 err("missing function: emscripten_glInterleavedArrays");
 abort(-1);
}

function _emscripten_glIsBuffer(buffer) {
 var b = GL.buffers[buffer];
 if (!b) return 0;
 return GLctx.isBuffer(b);
}

function _emscripten_glIsEnabled(x0) {
 return GLctx["isEnabled"](x0);
}

function _emscripten_glIsEnabledi() {
 err("missing function: emscripten_glIsEnabledi");
 abort(-1);
}

function _emscripten_glIsFramebuffer(framebuffer) {
 var fb = GL.framebuffers[framebuffer];
 if (!fb) return 0;
 return GLctx.isFramebuffer(fb);
}

function _emscripten_glIsList() {
 err("missing function: emscripten_glIsList");
 abort(-1);
}

function _emscripten_glIsProgram(program) {
 program = GL.programs[program];
 if (!program) return 0;
 return GLctx.isProgram(program);
}

function _emscripten_glIsQuery() {
 err("missing function: emscripten_glIsQuery");
 abort(-1);
}

function _emscripten_glIsRenderbuffer(renderbuffer) {
 var rb = GL.renderbuffers[renderbuffer];
 if (!rb) return 0;
 return GLctx.isRenderbuffer(rb);
}

function _emscripten_glIsShader(shader) {
 var s = GL.shaders[shader];
 if (!s) return 0;
 return GLctx.isShader(s);
}

function _emscripten_glIsTexture(id) {
 var texture = GL.textures[id];
 if (!texture) return 0;
 return GLctx.isTexture(texture);
}

function _emscripten_glIsVertexArray(array) {
 var vao = GL.vaos[array];
 if (!vao) return 0;
 return GLctx["isVertexArray"](vao);
}

function _emscripten_glLineStipple() {
 err("missing function: emscripten_glLineStipple");
 abort(-1);
}

function _emscripten_glLineWidth(x0) {
 GLctx["lineWidth"](x0);
}

function _emscripten_glLinkProgram(program) {
 GLctx.linkProgram(GL.programs[program]);
 GL.populateUniformTable(program);
}

function _emscripten_glListBase() {
 err("missing function: emscripten_glListBase");
 abort(-1);
}

function _emscripten_glLoadName() {
 err("missing function: emscripten_glLoadName");
 abort(-1);
}

function _emscripten_glLoadTransposeMatrixd() {
 err("missing function: emscripten_glLoadTransposeMatrixd");
 abort(-1);
}

function _emscripten_glLoadTransposeMatrixf() {
 err("missing function: emscripten_glLoadTransposeMatrixf");
 abort(-1);
}

function _emscripten_glLogicOp() {
 err("missing function: emscripten_glLogicOp");
 abort(-1);
}

function _emscripten_glMap1d() {
 err("missing function: emscripten_glMap1d");
 abort(-1);
}

function _emscripten_glMap1f() {
 err("missing function: emscripten_glMap1f");
 abort(-1);
}

function _emscripten_glMap2d() {
 err("missing function: emscripten_glMap2d");
 abort(-1);
}

function _emscripten_glMap2f() {
 err("missing function: emscripten_glMap2f");
 abort(-1);
}

function _emscripten_glMapBuffer() {
 err("missing function: emscripten_glMapBuffer");
 abort(-1);
}

function _emscripten_glMapGrid1d() {
 err("missing function: emscripten_glMapGrid1d");
 abort(-1);
}

function _emscripten_glMapGrid1f() {
 err("missing function: emscripten_glMapGrid1f");
 abort(-1);
}

function _emscripten_glMapGrid2d() {
 err("missing function: emscripten_glMapGrid2d");
 abort(-1);
}

function _emscripten_glMapGrid2f() {
 err("missing function: emscripten_glMapGrid2f");
 abort(-1);
}

function _emscripten_glMinmax() {
 err("missing function: emscripten_glMinmax");
 abort(-1);
}

function _emscripten_glMultTransposeMatrixd() {
 err("missing function: emscripten_glMultTransposeMatrixd");
 abort(-1);
}

function _emscripten_glMultTransposeMatrixf() {
 err("missing function: emscripten_glMultTransposeMatrixf");
 abort(-1);
}

function _emscripten_glMultiDrawArrays() {
 err("missing function: emscripten_glMultiDrawArrays");
 abort(-1);
}

function _emscripten_glMultiDrawElements() {
 err("missing function: emscripten_glMultiDrawElements");
 abort(-1);
}

function _emscripten_glMultiTexCoord1d() {
 err("missing function: emscripten_glMultiTexCoord1d");
 abort(-1);
}

function _emscripten_glMultiTexCoord1dv() {
 err("missing function: emscripten_glMultiTexCoord1dv");
 abort(-1);
}

function _emscripten_glMultiTexCoord1f() {
 err("missing function: emscripten_glMultiTexCoord1f");
 abort(-1);
}

function _emscripten_glMultiTexCoord1fv() {
 err("missing function: emscripten_glMultiTexCoord1fv");
 abort(-1);
}

function _emscripten_glMultiTexCoord1i() {
 err("missing function: emscripten_glMultiTexCoord1i");
 abort(-1);
}

function _emscripten_glMultiTexCoord1iv() {
 err("missing function: emscripten_glMultiTexCoord1iv");
 abort(-1);
}

function _emscripten_glMultiTexCoord1s() {
 err("missing function: emscripten_glMultiTexCoord1s");
 abort(-1);
}

function _emscripten_glMultiTexCoord1sv() {
 err("missing function: emscripten_glMultiTexCoord1sv");
 abort(-1);
}

function _emscripten_glMultiTexCoord2d() {
 err("missing function: emscripten_glMultiTexCoord2d");
 abort(-1);
}

function _emscripten_glMultiTexCoord2dv() {
 err("missing function: emscripten_glMultiTexCoord2dv");
 abort(-1);
}

function _emscripten_glMultiTexCoord2f() {
 err("missing function: emscripten_glMultiTexCoord2f");
 abort(-1);
}

function _emscripten_glMultiTexCoord2fv() {
 err("missing function: emscripten_glMultiTexCoord2fv");
 abort(-1);
}

function _emscripten_glMultiTexCoord2i() {
 err("missing function: emscripten_glMultiTexCoord2i");
 abort(-1);
}

function _emscripten_glMultiTexCoord2iv() {
 err("missing function: emscripten_glMultiTexCoord2iv");
 abort(-1);
}

function _emscripten_glMultiTexCoord2s() {
 err("missing function: emscripten_glMultiTexCoord2s");
 abort(-1);
}

function _emscripten_glMultiTexCoord2sv() {
 err("missing function: emscripten_glMultiTexCoord2sv");
 abort(-1);
}

function _emscripten_glMultiTexCoord3d() {
 err("missing function: emscripten_glMultiTexCoord3d");
 abort(-1);
}

function _emscripten_glMultiTexCoord3dv() {
 err("missing function: emscripten_glMultiTexCoord3dv");
 abort(-1);
}

function _emscripten_glMultiTexCoord3f() {
 err("missing function: emscripten_glMultiTexCoord3f");
 abort(-1);
}

function _emscripten_glMultiTexCoord3fv() {
 err("missing function: emscripten_glMultiTexCoord3fv");
 abort(-1);
}

function _emscripten_glMultiTexCoord3i() {
 err("missing function: emscripten_glMultiTexCoord3i");
 abort(-1);
}

function _emscripten_glMultiTexCoord3iv() {
 err("missing function: emscripten_glMultiTexCoord3iv");
 abort(-1);
}

function _emscripten_glMultiTexCoord3s() {
 err("missing function: emscripten_glMultiTexCoord3s");
 abort(-1);
}

function _emscripten_glMultiTexCoord3sv() {
 err("missing function: emscripten_glMultiTexCoord3sv");
 abort(-1);
}

function _emscripten_glMultiTexCoord4d() {
 err("missing function: emscripten_glMultiTexCoord4d");
 abort(-1);
}

function _emscripten_glMultiTexCoord4dv() {
 err("missing function: emscripten_glMultiTexCoord4dv");
 abort(-1);
}

function _emscripten_glMultiTexCoord4f() {
 err("missing function: emscripten_glMultiTexCoord4f");
 abort(-1);
}

function _emscripten_glMultiTexCoord4fv() {
 err("missing function: emscripten_glMultiTexCoord4fv");
 abort(-1);
}

function _emscripten_glMultiTexCoord4i() {
 err("missing function: emscripten_glMultiTexCoord4i");
 abort(-1);
}

function _emscripten_glMultiTexCoord4iv() {
 err("missing function: emscripten_glMultiTexCoord4iv");
 abort(-1);
}

function _emscripten_glMultiTexCoord4s() {
 err("missing function: emscripten_glMultiTexCoord4s");
 abort(-1);
}

function _emscripten_glMultiTexCoord4sv() {
 err("missing function: emscripten_glMultiTexCoord4sv");
 abort(-1);
}

function _emscripten_glNewList() {
 err("missing function: emscripten_glNewList");
 abort(-1);
}

function _emscripten_glPassThrough() {
 err("missing function: emscripten_glPassThrough");
 abort(-1);
}

function _emscripten_glPixelMapfv() {
 err("missing function: emscripten_glPixelMapfv");
 abort(-1);
}

function _emscripten_glPixelMapuiv() {
 err("missing function: emscripten_glPixelMapuiv");
 abort(-1);
}

function _emscripten_glPixelMapusv() {
 err("missing function: emscripten_glPixelMapusv");
 abort(-1);
}

function _emscripten_glPixelStoref() {
 err("missing function: emscripten_glPixelStoref");
 abort(-1);
}

function _emscripten_glPixelStorei(pname, param) {
 if (pname == 3317) {
  GL.unpackAlignment = param;
 }
 GLctx.pixelStorei(pname, param);
}

function _emscripten_glPixelTransferf() {
 err("missing function: emscripten_glPixelTransferf");
 abort(-1);
}

function _emscripten_glPixelTransferi() {
 err("missing function: emscripten_glPixelTransferi");
 abort(-1);
}

function _emscripten_glPixelZoom() {
 err("missing function: emscripten_glPixelZoom");
 abort(-1);
}

function _emscripten_glPointParameterf() {
 err("missing function: emscripten_glPointParameterf");
 abort(-1);
}

function _emscripten_glPointParameterfv() {
 err("missing function: emscripten_glPointParameterfv");
 abort(-1);
}

function _emscripten_glPointParameteri() {
 err("missing function: emscripten_glPointParameteri");
 abort(-1);
}

function _emscripten_glPointParameteriv() {
 err("missing function: emscripten_glPointParameteriv");
 abort(-1);
}

function _emscripten_glPointSize() {
 err("missing function: emscripten_glPointSize");
 abort(-1);
}

function _emscripten_glPolygonOffset(x0, x1) {
 GLctx["polygonOffset"](x0, x1);
}

function _emscripten_glPolygonStipple() {
 err("missing function: emscripten_glPolygonStipple");
 abort(-1);
}

function _emscripten_glPopAttrib() {
 err("missing function: emscripten_glPopAttrib");
 abort(-1);
}

function _emscripten_glPopClientAttrib() {
 err("missing function: emscripten_glPopClientAttrib");
 abort(-1);
}

function _emscripten_glPopName() {
 err("missing function: emscripten_glPopName");
 abort(-1);
}

function _emscripten_glPrimitiveRestartIndex() {
 err("missing function: emscripten_glPrimitiveRestartIndex");
 abort(-1);
}

function _emscripten_glPrioritizeTextures() {
 err("missing function: emscripten_glPrioritizeTextures");
 abort(-1);
}

function _emscripten_glProgramEnvParameter4dARB() {
 err("missing function: emscripten_glProgramEnvParameter4dARB");
 abort(-1);
}

function _emscripten_glProgramEnvParameter4dvARB() {
 err("missing function: emscripten_glProgramEnvParameter4dvARB");
 abort(-1);
}

function _emscripten_glProgramEnvParameter4fARB() {
 err("missing function: emscripten_glProgramEnvParameter4fARB");
 abort(-1);
}

function _emscripten_glProgramEnvParameter4fvARB() {
 err("missing function: emscripten_glProgramEnvParameter4fvARB");
 abort(-1);
}

function _emscripten_glProgramLocalParameter4dARB() {
 err("missing function: emscripten_glProgramLocalParameter4dARB");
 abort(-1);
}

function _emscripten_glProgramLocalParameter4dvARB() {
 err("missing function: emscripten_glProgramLocalParameter4dvARB");
 abort(-1);
}

function _emscripten_glProgramLocalParameter4fARB() {
 err("missing function: emscripten_glProgramLocalParameter4fARB");
 abort(-1);
}

function _emscripten_glProgramLocalParameter4fvARB() {
 err("missing function: emscripten_glProgramLocalParameter4fvARB");
 abort(-1);
}

function _emscripten_glProgramStringARB() {
 err("missing function: emscripten_glProgramStringARB");
 abort(-1);
}

function _emscripten_glPushAttrib() {
 err("missing function: emscripten_glPushAttrib");
 abort(-1);
}

function _emscripten_glPushClientAttrib() {
 err("missing function: emscripten_glPushClientAttrib");
 abort(-1);
}

function _emscripten_glPushName() {
 err("missing function: emscripten_glPushName");
 abort(-1);
}

function _emscripten_glRasterPos2d() {
 err("missing function: emscripten_glRasterPos2d");
 abort(-1);
}

function _emscripten_glRasterPos2dv() {
 err("missing function: emscripten_glRasterPos2dv");
 abort(-1);
}

function _emscripten_glRasterPos2f() {
 err("missing function: emscripten_glRasterPos2f");
 abort(-1);
}

function _emscripten_glRasterPos2fv() {
 err("missing function: emscripten_glRasterPos2fv");
 abort(-1);
}

function _emscripten_glRasterPos2i() {
 err("missing function: emscripten_glRasterPos2i");
 abort(-1);
}

function _emscripten_glRasterPos2iv() {
 err("missing function: emscripten_glRasterPos2iv");
 abort(-1);
}

function _emscripten_glRasterPos2s() {
 err("missing function: emscripten_glRasterPos2s");
 abort(-1);
}

function _emscripten_glRasterPos2sv() {
 err("missing function: emscripten_glRasterPos2sv");
 abort(-1);
}

function _emscripten_glRasterPos3d() {
 err("missing function: emscripten_glRasterPos3d");
 abort(-1);
}

function _emscripten_glRasterPos3dv() {
 err("missing function: emscripten_glRasterPos3dv");
 abort(-1);
}

function _emscripten_glRasterPos3f() {
 err("missing function: emscripten_glRasterPos3f");
 abort(-1);
}

function _emscripten_glRasterPos3fv() {
 err("missing function: emscripten_glRasterPos3fv");
 abort(-1);
}

function _emscripten_glRasterPos3i() {
 err("missing function: emscripten_glRasterPos3i");
 abort(-1);
}

function _emscripten_glRasterPos3iv() {
 err("missing function: emscripten_glRasterPos3iv");
 abort(-1);
}

function _emscripten_glRasterPos3s() {
 err("missing function: emscripten_glRasterPos3s");
 abort(-1);
}

function _emscripten_glRasterPos3sv() {
 err("missing function: emscripten_glRasterPos3sv");
 abort(-1);
}

function _emscripten_glRasterPos4d() {
 err("missing function: emscripten_glRasterPos4d");
 abort(-1);
}

function _emscripten_glRasterPos4dv() {
 err("missing function: emscripten_glRasterPos4dv");
 abort(-1);
}

function _emscripten_glRasterPos4f() {
 err("missing function: emscripten_glRasterPos4f");
 abort(-1);
}

function _emscripten_glRasterPos4fv() {
 err("missing function: emscripten_glRasterPos4fv");
 abort(-1);
}

function _emscripten_glRasterPos4i() {
 err("missing function: emscripten_glRasterPos4i");
 abort(-1);
}

function _emscripten_glRasterPos4iv() {
 err("missing function: emscripten_glRasterPos4iv");
 abort(-1);
}

function _emscripten_glRasterPos4s() {
 err("missing function: emscripten_glRasterPos4s");
 abort(-1);
}

function _emscripten_glRasterPos4sv() {
 err("missing function: emscripten_glRasterPos4sv");
 abort(-1);
}

function __computeUnpackAlignedImageSize(width, height, sizePerPixel, alignment) {
 function roundedToNextMultipleOf(x, y) {
  return x + y - 1 & -y;
 }
 var plainRowSize = width * sizePerPixel;
 var alignedRowSize = roundedToNextMultipleOf(plainRowSize, alignment);
 return height * alignedRowSize;
}

var __colorChannelsInGlTextureFormat = {
 6402: 1,
 6406: 1,
 6407: 3,
 6408: 4,
 6409: 1,
 6410: 2,
 35904: 3,
 35906: 4
};

var __sizeOfGlTextureElementType = {
 5121: 1,
 5123: 2,
 5125: 4,
 5126: 4,
 32819: 2,
 32820: 2,
 33635: 2,
 34042: 4,
 36193: 2
};

function emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) {
 var sizePerPixel = __colorChannelsInGlTextureFormat[format] * __sizeOfGlTextureElementType[type];
 if (!sizePerPixel) {
  GL.recordError(1280);
  return;
 }
 var bytes = __computeUnpackAlignedImageSize(width, height, sizePerPixel, GL.unpackAlignment);
 var end = pixels + bytes;
 switch (type) {
 case 5121:
  return HEAPU8.subarray(pixels, end);

 case 5126:
  return HEAPF32.subarray(pixels >> 2, end >> 2);

 case 5125:
 case 34042:
  return HEAPU32.subarray(pixels >> 2, end >> 2);

 case 5123:
 case 33635:
 case 32819:
 case 32820:
 case 36193:
  return HEAPU16.subarray(pixels >> 1, end >> 1);

 default:
  GL.recordError(1280);
 }
}

function _emscripten_glReadPixels(x, y, width, height, format, type, pixels) {
 var pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, format);
 if (!pixelData) {
  GL.recordError(1280);
  return;
 }
 GLctx.readPixels(x, y, width, height, format, type, pixelData);
}

function _emscripten_glRectd() {
 err("missing function: emscripten_glRectd");
 abort(-1);
}

function _emscripten_glRectdv() {
 err("missing function: emscripten_glRectdv");
 abort(-1);
}

function _emscripten_glRectf() {
 err("missing function: emscripten_glRectf");
 abort(-1);
}

function _emscripten_glRectfv() {
 err("missing function: emscripten_glRectfv");
 abort(-1);
}

function _emscripten_glRecti() {
 err("missing function: emscripten_glRecti");
 abort(-1);
}

function _emscripten_glRectiv() {
 err("missing function: emscripten_glRectiv");
 abort(-1);
}

function _emscripten_glRects() {
 err("missing function: emscripten_glRects");
 abort(-1);
}

function _emscripten_glRectsv() {
 err("missing function: emscripten_glRectsv");
 abort(-1);
}

function _emscripten_glReleaseShaderCompiler() {}

function _emscripten_glRenderMode() {
 err("missing function: emscripten_glRenderMode");
 abort(-1);
}

function _emscripten_glRenderbufferStorage(x0, x1, x2, x3) {
 GLctx["renderbufferStorage"](x0, x1, x2, x3);
}

function _emscripten_glRenderbufferStorageMultisample() {
 err("missing function: emscripten_glRenderbufferStorageMultisample");
 abort(-1);
}

function _emscripten_glResetHistogram() {
 err("missing function: emscripten_glResetHistogram");
 abort(-1);
}

function _emscripten_glResetMinmax() {
 err("missing function: emscripten_glResetMinmax");
 abort(-1);
}

function _emscripten_glSampleCoverage(value, invert) {
 GLctx.sampleCoverage(value, !!invert);
}

function _emscripten_glScissor(x0, x1, x2, x3) {
 GLctx["scissor"](x0, x1, x2, x3);
}

function _emscripten_glSecondaryColor3b() {
 err("missing function: emscripten_glSecondaryColor3b");
 abort(-1);
}

function _emscripten_glSecondaryColor3bv() {
 err("missing function: emscripten_glSecondaryColor3bv");
 abort(-1);
}

function _emscripten_glSecondaryColor3d() {
 err("missing function: emscripten_glSecondaryColor3d");
 abort(-1);
}

function _emscripten_glSecondaryColor3dv() {
 err("missing function: emscripten_glSecondaryColor3dv");
 abort(-1);
}

function _emscripten_glSecondaryColor3f() {
 err("missing function: emscripten_glSecondaryColor3f");
 abort(-1);
}

function _emscripten_glSecondaryColor3fv() {
 err("missing function: emscripten_glSecondaryColor3fv");
 abort(-1);
}

function _emscripten_glSecondaryColor3i() {
 err("missing function: emscripten_glSecondaryColor3i");
 abort(-1);
}

function _emscripten_glSecondaryColor3iv() {
 err("missing function: emscripten_glSecondaryColor3iv");
 abort(-1);
}

function _emscripten_glSecondaryColor3s() {
 err("missing function: emscripten_glSecondaryColor3s");
 abort(-1);
}

function _emscripten_glSecondaryColor3sv() {
 err("missing function: emscripten_glSecondaryColor3sv");
 abort(-1);
}

function _emscripten_glSecondaryColor3ub() {
 err("missing function: emscripten_glSecondaryColor3ub");
 abort(-1);
}

function _emscripten_glSecondaryColor3ubv() {
 err("missing function: emscripten_glSecondaryColor3ubv");
 abort(-1);
}

function _emscripten_glSecondaryColor3ui() {
 err("missing function: emscripten_glSecondaryColor3ui");
 abort(-1);
}

function _emscripten_glSecondaryColor3uiv() {
 err("missing function: emscripten_glSecondaryColor3uiv");
 abort(-1);
}

function _emscripten_glSecondaryColor3us() {
 err("missing function: emscripten_glSecondaryColor3us");
 abort(-1);
}

function _emscripten_glSecondaryColor3usv() {
 err("missing function: emscripten_glSecondaryColor3usv");
 abort(-1);
}

function _emscripten_glSecondaryColorPointer() {
 err("missing function: emscripten_glSecondaryColorPointer");
 abort(-1);
}

function _emscripten_glSelectBuffer() {
 err("missing function: emscripten_glSelectBuffer");
 abort(-1);
}

function _emscripten_glSeparableFilter2D() {
 err("missing function: emscripten_glSeparableFilter2D");
 abort(-1);
}

function _emscripten_glShaderBinary() {
 GL.recordError(1280);
}

function _emscripten_glShaderSource(shader, count, string, length) {
 var source = GL.getSource(shader, count, string, length);
 GLctx.shaderSource(GL.shaders[shader], source);
}

function _emscripten_glStencilFunc(x0, x1, x2) {
 GLctx["stencilFunc"](x0, x1, x2);
}

function _emscripten_glStencilFuncSeparate(x0, x1, x2, x3) {
 GLctx["stencilFuncSeparate"](x0, x1, x2, x3);
}

function _emscripten_glStencilMask(x0) {
 GLctx["stencilMask"](x0);
}

function _emscripten_glStencilMaskSeparate(x0, x1) {
 GLctx["stencilMaskSeparate"](x0, x1);
}

function _emscripten_glStencilOp(x0, x1, x2) {
 GLctx["stencilOp"](x0, x1, x2);
}

function _emscripten_glStencilOpSeparate(x0, x1, x2, x3) {
 GLctx["stencilOpSeparate"](x0, x1, x2, x3);
}

function _emscripten_glTexBuffer() {
 err("missing function: emscripten_glTexBuffer");
 abort(-1);
}

function _emscripten_glTexEnvf() {
 err("missing function: emscripten_glTexEnvf");
 abort(-1);
}

function _emscripten_glTexEnvfv() {
 err("missing function: emscripten_glTexEnvfv");
 abort(-1);
}

function _emscripten_glTexEnvi() {
 err("missing function: emscripten_glTexEnvi");
 abort(-1);
}

function _emscripten_glTexEnviv() {
 err("missing function: emscripten_glTexEnviv");
 abort(-1);
}

function _emscripten_glTexImage2D(target, level, internalFormat, width, height, border, format, type, pixels) {
 GLctx.texImage2D(target, level, internalFormat, width, height, border, format, type, pixels ? emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, internalFormat) : null);
}

function _emscripten_glTexImage3D() {
 err("missing function: emscripten_glTexImage3D");
 abort(-1);
}

function _emscripten_glTexParameterIiv() {
 err("missing function: emscripten_glTexParameterIiv");
 abort(-1);
}

function _emscripten_glTexParameterIuiv() {
 err("missing function: emscripten_glTexParameterIuiv");
 abort(-1);
}

function _emscripten_glTexParameterf(x0, x1, x2) {
 GLctx["texParameterf"](x0, x1, x2);
}

function _emscripten_glTexParameterfv(target, pname, params) {
 var param = HEAPF32[params >> 2];
 GLctx.texParameterf(target, pname, param);
}

function _emscripten_glTexParameteri(x0, x1, x2) {
 GLctx["texParameteri"](x0, x1, x2);
}

function _emscripten_glTexParameteriv(target, pname, params) {
 var param = HEAP32[params >> 2];
 GLctx.texParameteri(target, pname, param);
}

function _emscripten_glTexStorage2D() {
 err("missing function: emscripten_glTexStorage2D");
 abort(-1);
}

function _emscripten_glTexStorage3D() {
 err("missing function: emscripten_glTexStorage3D");
 abort(-1);
}

function _emscripten_glTexSubImage1D() {
 err("missing function: emscripten_glTexSubImage1D");
 abort(-1);
}

function _emscripten_glTexSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixels) {
 var pixelData = null;
 if (pixels) pixelData = emscriptenWebGLGetTexPixelData(type, format, width, height, pixels, 0);
 GLctx.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, pixelData);
}

function _emscripten_glTexSubImage3D() {
 err("missing function: emscripten_glTexSubImage3D");
 abort(-1);
}

function _emscripten_glTransformFeedbackVaryings() {
 err("missing function: emscripten_glTransformFeedbackVaryings");
 abort(-1);
}

function _emscripten_glUniform1f(location, v0) {
 GLctx.uniform1f(GL.uniforms[location], v0);
}

function _emscripten_glUniform1fv(location, count, value) {
 if (count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[count - 1];
  for (var i = 0; i < count; ++i) {
   view[i] = HEAPF32[value + 4 * i >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 4 >> 2);
 }
 GLctx.uniform1fv(GL.uniforms[location], view);
}

function _emscripten_glUniform1i(location, v0) {
 GLctx.uniform1i(GL.uniforms[location], v0);
}

function _emscripten_glUniform1iv(location, count, value) {
 GLctx.uniform1iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 4 >> 2));
}

function _emscripten_glUniform1ui() {
 err("missing function: emscripten_glUniform1ui");
 abort(-1);
}

function _emscripten_glUniform1uiv() {
 err("missing function: emscripten_glUniform1uiv");
 abort(-1);
}

function _emscripten_glUniform2f(location, v0, v1) {
 GLctx.uniform2f(GL.uniforms[location], v0, v1);
}

function _emscripten_glUniform2fv(location, count, value) {
 if (2 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[2 * count - 1];
  for (var i = 0; i < 2 * count; i += 2) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 8 >> 2);
 }
 GLctx.uniform2fv(GL.uniforms[location], view);
}

function _emscripten_glUniform2i(location, v0, v1) {
 GLctx.uniform2i(GL.uniforms[location], v0, v1);
}

function _emscripten_glUniform2iv(location, count, value) {
 GLctx.uniform2iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 8 >> 2));
}

function _emscripten_glUniform2ui() {
 err("missing function: emscripten_glUniform2ui");
 abort(-1);
}

function _emscripten_glUniform2uiv() {
 err("missing function: emscripten_glUniform2uiv");
 abort(-1);
}

function _emscripten_glUniform3f(location, v0, v1, v2) {
 GLctx.uniform3f(GL.uniforms[location], v0, v1, v2);
}

function _emscripten_glUniform3fv(location, count, value) {
 if (3 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[3 * count - 1];
  for (var i = 0; i < 3 * count; i += 3) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 12 >> 2);
 }
 GLctx.uniform3fv(GL.uniforms[location], view);
}

function _emscripten_glUniform3i(location, v0, v1, v2) {
 GLctx.uniform3i(GL.uniforms[location], v0, v1, v2);
}

function _emscripten_glUniform3iv(location, count, value) {
 GLctx.uniform3iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 12 >> 2));
}

function _emscripten_glUniform3ui() {
 err("missing function: emscripten_glUniform3ui");
 abort(-1);
}

function _emscripten_glUniform3uiv() {
 err("missing function: emscripten_glUniform3uiv");
 abort(-1);
}

function _emscripten_glUniform4f(location, v0, v1, v2, v3) {
 GLctx.uniform4f(GL.uniforms[location], v0, v1, v2, v3);
}

function _emscripten_glUniform4fv(location, count, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniform4fv(GL.uniforms[location], view);
}

function _emscripten_glUniform4i(location, v0, v1, v2, v3) {
 GLctx.uniform4i(GL.uniforms[location], v0, v1, v2, v3);
}

function _emscripten_glUniform4iv(location, count, value) {
 GLctx.uniform4iv(GL.uniforms[location], HEAP32.subarray(value >> 2, value + count * 16 >> 2));
}

function _emscripten_glUniform4ui() {
 err("missing function: emscripten_glUniform4ui");
 abort(-1);
}

function _emscripten_glUniform4uiv() {
 err("missing function: emscripten_glUniform4uiv");
 abort(-1);
}

function _emscripten_glUniformBlockBinding() {
 err("missing function: emscripten_glUniformBlockBinding");
 abort(-1);
}

function _emscripten_glUniformMatrix2fv(location, count, transpose, value) {
 if (4 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[4 * count - 1];
  for (var i = 0; i < 4 * count; i += 4) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 16 >> 2);
 }
 GLctx.uniformMatrix2fv(GL.uniforms[location], !!transpose, view);
}

function _emscripten_glUniformMatrix2x3fv() {
 err("missing function: emscripten_glUniformMatrix2x3fv");
 abort(-1);
}

function _emscripten_glUniformMatrix2x4fv() {
 err("missing function: emscripten_glUniformMatrix2x4fv");
 abort(-1);
}

function _emscripten_glUniformMatrix3fv(location, count, transpose, value) {
 if (9 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[9 * count - 1];
  for (var i = 0; i < 9 * count; i += 9) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 36 >> 2);
 }
 GLctx.uniformMatrix3fv(GL.uniforms[location], !!transpose, view);
}

function _emscripten_glUniformMatrix3x2fv() {
 err("missing function: emscripten_glUniformMatrix3x2fv");
 abort(-1);
}

function _emscripten_glUniformMatrix3x4fv() {
 err("missing function: emscripten_glUniformMatrix3x4fv");
 abort(-1);
}

function _emscripten_glUniformMatrix4fv(location, count, transpose, value) {
 if (16 * count <= GL.MINI_TEMP_BUFFER_SIZE) {
  var view = GL.miniTempBufferViews[16 * count - 1];
  for (var i = 0; i < 16 * count; i += 16) {
   view[i] = HEAPF32[value + 4 * i >> 2];
   view[i + 1] = HEAPF32[value + (4 * i + 4) >> 2];
   view[i + 2] = HEAPF32[value + (4 * i + 8) >> 2];
   view[i + 3] = HEAPF32[value + (4 * i + 12) >> 2];
   view[i + 4] = HEAPF32[value + (4 * i + 16) >> 2];
   view[i + 5] = HEAPF32[value + (4 * i + 20) >> 2];
   view[i + 6] = HEAPF32[value + (4 * i + 24) >> 2];
   view[i + 7] = HEAPF32[value + (4 * i + 28) >> 2];
   view[i + 8] = HEAPF32[value + (4 * i + 32) >> 2];
   view[i + 9] = HEAPF32[value + (4 * i + 36) >> 2];
   view[i + 10] = HEAPF32[value + (4 * i + 40) >> 2];
   view[i + 11] = HEAPF32[value + (4 * i + 44) >> 2];
   view[i + 12] = HEAPF32[value + (4 * i + 48) >> 2];
   view[i + 13] = HEAPF32[value + (4 * i + 52) >> 2];
   view[i + 14] = HEAPF32[value + (4 * i + 56) >> 2];
   view[i + 15] = HEAPF32[value + (4 * i + 60) >> 2];
  }
 } else {
  var view = HEAPF32.subarray(value >> 2, value + count * 64 >> 2);
 }
 GLctx.uniformMatrix4fv(GL.uniforms[location], !!transpose, view);
}

function _emscripten_glUniformMatrix4x2fv() {
 err("missing function: emscripten_glUniformMatrix4x2fv");
 abort(-1);
}

function _emscripten_glUniformMatrix4x3fv() {
 err("missing function: emscripten_glUniformMatrix4x3fv");
 abort(-1);
}

function _emscripten_glUnmapBuffer() {
 err("missing function: emscripten_glUnmapBuffer");
 abort(-1);
}

function _emscripten_glUseProgram(program) {
 GLctx.useProgram(GL.programs[program]);
}

function _emscripten_glUseProgramObjectARB() {
 err("missing function: emscripten_glUseProgramObjectARB");
 abort(-1);
}

function _emscripten_glValidateProgram(program) {
 GLctx.validateProgram(GL.programs[program]);
}

function _emscripten_glVertexAttrib1d() {
 err("missing function: emscripten_glVertexAttrib1d");
 abort(-1);
}

function _emscripten_glVertexAttrib1dv() {
 err("missing function: emscripten_glVertexAttrib1dv");
 abort(-1);
}

function _emscripten_glVertexAttrib1f(x0, x1) {
 GLctx["vertexAttrib1f"](x0, x1);
}

function _emscripten_glVertexAttrib1fv(index, v) {
 GLctx.vertexAttrib1f(index, HEAPF32[v >> 2]);
}

function _emscripten_glVertexAttrib1s() {
 err("missing function: emscripten_glVertexAttrib1s");
 abort(-1);
}

function _emscripten_glVertexAttrib1sv() {
 err("missing function: emscripten_glVertexAttrib1sv");
 abort(-1);
}

function _emscripten_glVertexAttrib2d() {
 err("missing function: emscripten_glVertexAttrib2d");
 abort(-1);
}

function _emscripten_glVertexAttrib2dv() {
 err("missing function: emscripten_glVertexAttrib2dv");
 abort(-1);
}

function _emscripten_glVertexAttrib2f(x0, x1, x2) {
 GLctx["vertexAttrib2f"](x0, x1, x2);
}

function _emscripten_glVertexAttrib2fv(index, v) {
 GLctx.vertexAttrib2f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2]);
}

function _emscripten_glVertexAttrib2s() {
 err("missing function: emscripten_glVertexAttrib2s");
 abort(-1);
}

function _emscripten_glVertexAttrib2sv() {
 err("missing function: emscripten_glVertexAttrib2sv");
 abort(-1);
}

function _emscripten_glVertexAttrib3d() {
 err("missing function: emscripten_glVertexAttrib3d");
 abort(-1);
}

function _emscripten_glVertexAttrib3dv() {
 err("missing function: emscripten_glVertexAttrib3dv");
 abort(-1);
}

function _emscripten_glVertexAttrib3f(x0, x1, x2, x3) {
 GLctx["vertexAttrib3f"](x0, x1, x2, x3);
}

function _emscripten_glVertexAttrib3fv(index, v) {
 GLctx.vertexAttrib3f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2]);
}

function _emscripten_glVertexAttrib3s() {
 err("missing function: emscripten_glVertexAttrib3s");
 abort(-1);
}

function _emscripten_glVertexAttrib3sv() {
 err("missing function: emscripten_glVertexAttrib3sv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nbv() {
 err("missing function: emscripten_glVertexAttrib4Nbv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Niv() {
 err("missing function: emscripten_glVertexAttrib4Niv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nsv() {
 err("missing function: emscripten_glVertexAttrib4Nsv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nub() {
 err("missing function: emscripten_glVertexAttrib4Nub");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nubv() {
 err("missing function: emscripten_glVertexAttrib4Nubv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nuiv() {
 err("missing function: emscripten_glVertexAttrib4Nuiv");
 abort(-1);
}

function _emscripten_glVertexAttrib4Nusv() {
 err("missing function: emscripten_glVertexAttrib4Nusv");
 abort(-1);
}

function _emscripten_glVertexAttrib4bv() {
 err("missing function: emscripten_glVertexAttrib4bv");
 abort(-1);
}

function _emscripten_glVertexAttrib4d() {
 err("missing function: emscripten_glVertexAttrib4d");
 abort(-1);
}

function _emscripten_glVertexAttrib4dv() {
 err("missing function: emscripten_glVertexAttrib4dv");
 abort(-1);
}

function _emscripten_glVertexAttrib4f(x0, x1, x2, x3, x4) {
 GLctx["vertexAttrib4f"](x0, x1, x2, x3, x4);
}

function _emscripten_glVertexAttrib4fv(index, v) {
 GLctx.vertexAttrib4f(index, HEAPF32[v >> 2], HEAPF32[v + 4 >> 2], HEAPF32[v + 8 >> 2], HEAPF32[v + 12 >> 2]);
}

function _emscripten_glVertexAttrib4iv() {
 err("missing function: emscripten_glVertexAttrib4iv");
 abort(-1);
}

function _emscripten_glVertexAttrib4s() {
 err("missing function: emscripten_glVertexAttrib4s");
 abort(-1);
}

function _emscripten_glVertexAttrib4sv() {
 err("missing function: emscripten_glVertexAttrib4sv");
 abort(-1);
}

function _emscripten_glVertexAttrib4ubv() {
 err("missing function: emscripten_glVertexAttrib4ubv");
 abort(-1);
}

function _emscripten_glVertexAttrib4uiv() {
 err("missing function: emscripten_glVertexAttrib4uiv");
 abort(-1);
}

function _emscripten_glVertexAttrib4usv() {
 err("missing function: emscripten_glVertexAttrib4usv");
 abort(-1);
}

function _emscripten_glVertexAttribDivisor(index, divisor) {
 GLctx["vertexAttribDivisor"](index, divisor);
}

function _emscripten_glVertexAttribI1i() {
 err("missing function: emscripten_glVertexAttribI1i");
 abort(-1);
}

function _emscripten_glVertexAttribI1iv() {
 err("missing function: emscripten_glVertexAttribI1iv");
 abort(-1);
}

function _emscripten_glVertexAttribI1ui() {
 err("missing function: emscripten_glVertexAttribI1ui");
 abort(-1);
}

function _emscripten_glVertexAttribI1uiv() {
 err("missing function: emscripten_glVertexAttribI1uiv");
 abort(-1);
}

function _emscripten_glVertexAttribI2i() {
 err("missing function: emscripten_glVertexAttribI2i");
 abort(-1);
}

function _emscripten_glVertexAttribI2iv() {
 err("missing function: emscripten_glVertexAttribI2iv");
 abort(-1);
}

function _emscripten_glVertexAttribI2ui() {
 err("missing function: emscripten_glVertexAttribI2ui");
 abort(-1);
}

function _emscripten_glVertexAttribI2uiv() {
 err("missing function: emscripten_glVertexAttribI2uiv");
 abort(-1);
}

function _emscripten_glVertexAttribI3i() {
 err("missing function: emscripten_glVertexAttribI3i");
 abort(-1);
}

function _emscripten_glVertexAttribI3iv() {
 err("missing function: emscripten_glVertexAttribI3iv");
 abort(-1);
}

function _emscripten_glVertexAttribI3ui() {
 err("missing function: emscripten_glVertexAttribI3ui");
 abort(-1);
}

function _emscripten_glVertexAttribI3uiv() {
 err("missing function: emscripten_glVertexAttribI3uiv");
 abort(-1);
}

function _emscripten_glVertexAttribI4bv() {
 err("missing function: emscripten_glVertexAttribI4bv");
 abort(-1);
}

function _emscripten_glVertexAttribI4i() {
 err("missing function: emscripten_glVertexAttribI4i");
 abort(-1);
}

function _emscripten_glVertexAttribI4iv() {
 err("missing function: emscripten_glVertexAttribI4iv");
 abort(-1);
}

function _emscripten_glVertexAttribI4sv() {
 err("missing function: emscripten_glVertexAttribI4sv");
 abort(-1);
}

function _emscripten_glVertexAttribI4ubv() {
 err("missing function: emscripten_glVertexAttribI4ubv");
 abort(-1);
}

function _emscripten_glVertexAttribI4ui() {
 err("missing function: emscripten_glVertexAttribI4ui");
 abort(-1);
}

function _emscripten_glVertexAttribI4uiv() {
 err("missing function: emscripten_glVertexAttribI4uiv");
 abort(-1);
}

function _emscripten_glVertexAttribI4usv() {
 err("missing function: emscripten_glVertexAttribI4usv");
 abort(-1);
}

function _emscripten_glVertexAttribIPointer() {
 err("missing function: emscripten_glVertexAttribIPointer");
 abort(-1);
}

function _emscripten_glVertexAttribPointer(index, size, type, normalized, stride, ptr) {
 GLctx.vertexAttribPointer(index, size, type, !!normalized, stride, ptr);
}

function _emscripten_glViewport(x0, x1, x2, x3) {
 GLctx["viewport"](x0, x1, x2, x3);
}

function _emscripten_glWindowPos2d() {
 err("missing function: emscripten_glWindowPos2d");
 abort(-1);
}

function _emscripten_glWindowPos2dv() {
 err("missing function: emscripten_glWindowPos2dv");
 abort(-1);
}

function _emscripten_glWindowPos2f() {
 err("missing function: emscripten_glWindowPos2f");
 abort(-1);
}

function _emscripten_glWindowPos2fv() {
 err("missing function: emscripten_glWindowPos2fv");
 abort(-1);
}

function _emscripten_glWindowPos2i() {
 err("missing function: emscripten_glWindowPos2i");
 abort(-1);
}

function _emscripten_glWindowPos2iv() {
 err("missing function: emscripten_glWindowPos2iv");
 abort(-1);
}

function _emscripten_glWindowPos2s() {
 err("missing function: emscripten_glWindowPos2s");
 abort(-1);
}

function _emscripten_glWindowPos2sv() {
 err("missing function: emscripten_glWindowPos2sv");
 abort(-1);
}

function _emscripten_glWindowPos3d() {
 err("missing function: emscripten_glWindowPos3d");
 abort(-1);
}

function _emscripten_glWindowPos3dv() {
 err("missing function: emscripten_glWindowPos3dv");
 abort(-1);
}

function _emscripten_glWindowPos3f() {
 err("missing function: emscripten_glWindowPos3f");
 abort(-1);
}

function _emscripten_glWindowPos3fv() {
 err("missing function: emscripten_glWindowPos3fv");
 abort(-1);
}

function _emscripten_glWindowPos3i() {
 err("missing function: emscripten_glWindowPos3i");
 abort(-1);
}

function _emscripten_glWindowPos3iv() {
 err("missing function: emscripten_glWindowPos3iv");
 abort(-1);
}

function _emscripten_glWindowPos3s() {
 err("missing function: emscripten_glWindowPos3s");
 abort(-1);
}

function _emscripten_glWindowPos3sv() {
 err("missing function: emscripten_glWindowPos3sv");
 abort(-1);
}

function __emscripten_do_request_fullscreen(target, strategy) {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 if (!JSEvents.fullscreenEnabled()) return -3;
 if (!target) target = "#canvas";
 target = __findEventTarget(target);
 if (!target) return -4;
 if (!target.requestFullscreen && !target.msRequestFullscreen && !target.mozRequestFullScreen && !target.mozRequestFullscreen && !target.webkitRequestFullscreen) {
  return -3;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (strategy.deferUntilInEventHandler) {
   JSEvents.deferCall(_JSEvents_requestFullscreen, 1, [ target, strategy ]);
   return 1;
  } else {
   return -2;
  }
 }
 return _JSEvents_requestFullscreen(target, strategy);
}

function _emscripten_request_fullscreen_strategy(target, deferUntilInEventHandler, fullscreenStrategy) {
 var strategy = {};
 strategy.scaleMode = HEAP32[fullscreenStrategy >> 2];
 strategy.canvasResolutionScaleMode = HEAP32[fullscreenStrategy + 4 >> 2];
 strategy.filteringMode = HEAP32[fullscreenStrategy + 8 >> 2];
 strategy.deferUntilInEventHandler = deferUntilInEventHandler;
 strategy.canvasResizedCallback = HEAP32[fullscreenStrategy + 12 >> 2];
 strategy.canvasResizedCallbackUserData = HEAP32[fullscreenStrategy + 16 >> 2];
 __currentFullscreenStrategy = strategy;
 return __emscripten_do_request_fullscreen(target, strategy);
}

function _emscripten_request_pointerlock(target, deferUntilInEventHandler) {
 if (!target) target = "#canvas";
 target = __findEventTarget(target);
 if (!target) return -4;
 if (!target.requestPointerLock && !target.mozRequestPointerLock && !target.webkitRequestPointerLock && !target.msRequestPointerLock) {
  return -1;
 }
 var canPerformRequests = JSEvents.canPerformEventHandlerRequests();
 if (!canPerformRequests) {
  if (deferUntilInEventHandler) {
   JSEvents.deferCall(__requestPointerLock, 2, [ target ]);
   return 1;
  } else {
   return -2;
  }
 }
 return __requestPointerLock(target);
}

function abortOnCannotGrowMemory(requestedSize) {
 abort("Cannot enlarge memory arrays to size " + requestedSize + " bytes. Either (1) compile with  -s TOTAL_MEMORY=X  with X higher than the current value " + TOTAL_MEMORY + ", (2) compile with  -s ALLOW_MEMORY_GROWTH=1  which allows increasing the size at runtime, or (3) if you want malloc to return NULL (0) instead of this abort, compile with  -s ABORTING_MALLOC=0 ");
}

function _emscripten_resize_heap(requestedSize) {
 abortOnCannotGrowMemory(requestedSize);
}

function _emscripten_sample_gamepad_data() {
 return (JSEvents.lastGamepadState = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : null) ? 0 : -1;
}

function __registerFocusEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.focusEvent) JSEvents.focusEvent = _malloc(256);
 var focusEventHandlerFunc = function(event) {
  var e = event || window.event;
  var nodeName = JSEvents.getNodeNameForTarget(e.target);
  var id = e.target.id ? e.target.id : "";
  var focusEvent = JSEvents.focusEvent;
  stringToUTF8(nodeName, focusEvent + 0, 128);
  stringToUTF8(id, focusEvent + 128, 128);
  if (dynCall_iiii(callbackfunc, eventTypeId, focusEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  allowsDeferredCalls: false,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: focusEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_blur_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 12, "blur", targetThread);
 return 0;
}

function _emscripten_set_element_css_size(target, width, height) {
 target = target ? __findEventTarget(target) : Module["canvas"];
 if (!target) return -4;
 target.style.width = width + "px";
 target.style.height = height + "px";
 return 0;
}

function _emscripten_set_focus_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerFocusEventCallback(target, userData, useCapture, callbackfunc, 13, "focus", targetThread);
 return 0;
}

function __fillFullscreenChangeEventData(eventStruct, e) {
 var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
 var isFullscreen = !!fullscreenElement;
 HEAP32[eventStruct >> 2] = isFullscreen;
 HEAP32[eventStruct + 4 >> 2] = JSEvents.fullscreenEnabled();
 var reportedElement = isFullscreen ? fullscreenElement : JSEvents.previousFullscreenElement;
 var nodeName = JSEvents.getNodeNameForTarget(reportedElement);
 var id = reportedElement && reportedElement.id ? reportedElement.id : "";
 stringToUTF8(nodeName, eventStruct + 8, 128);
 stringToUTF8(id, eventStruct + 136, 128);
 HEAP32[eventStruct + 264 >> 2] = reportedElement ? reportedElement.clientWidth : 0;
 HEAP32[eventStruct + 268 >> 2] = reportedElement ? reportedElement.clientHeight : 0;
 HEAP32[eventStruct + 272 >> 2] = screen.width;
 HEAP32[eventStruct + 276 >> 2] = screen.height;
 if (isFullscreen) {
  JSEvents.previousFullscreenElement = fullscreenElement;
 }
}

function __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.fullscreenChangeEvent) JSEvents.fullscreenChangeEvent = _malloc(280);
 var fullscreenChangeEventhandlerFunc = function(event) {
  var e = event || window.event;
  var fullscreenChangeEvent = JSEvents.fullscreenChangeEvent;
  __fillFullscreenChangeEventData(fullscreenChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, fullscreenChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: false,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: fullscreenChangeEventhandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_fullscreenchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (typeof JSEvents.fullscreenEnabled() === "undefined") return -1;
 target = target ? __findEventTarget(target) : __specialEventTargets[1];
 if (!target) return -4;
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "fullscreenchange", targetThread);
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "mozfullscreenchange", targetThread);
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "webkitfullscreenchange", targetThread);
 __registerFullscreenChangeEventCallback(target, userData, useCapture, callbackfunc, 19, "msfullscreenchange", targetThread);
 return 0;
}

function __registerGamepadEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.gamepadEvent) JSEvents.gamepadEvent = _malloc(1432);
 var gamepadEventHandlerFunc = function(event) {
  var e = event || window.event;
  var gamepadEvent = JSEvents.gamepadEvent;
  __fillGamepadEventData(gamepadEvent, e.gamepad);
  if (dynCall_iiii(callbackfunc, eventTypeId, gamepadEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: gamepadEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_gamepadconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 __registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 26, "gamepadconnected", targetThread);
 return 0;
}

function _emscripten_set_gamepaddisconnected_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!navigator.getGamepads && !navigator.webkitGetGamepads) return -1;
 __registerGamepadEventCallback(2, userData, useCapture, callbackfunc, 27, "gamepaddisconnected", targetThread);
 return 0;
}

function __registerKeyEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.keyEvent) JSEvents.keyEvent = _malloc(164);
 var keyEventHandlerFunc = function(event) {
  var e = event || window.event;
  var keyEventData = JSEvents.keyEvent;
  stringToUTF8(e.key ? e.key : "", keyEventData + 0, 32);
  stringToUTF8(e.code ? e.code : "", keyEventData + 32, 32);
  HEAP32[keyEventData + 64 >> 2] = e.location;
  HEAP32[keyEventData + 68 >> 2] = e.ctrlKey;
  HEAP32[keyEventData + 72 >> 2] = e.shiftKey;
  HEAP32[keyEventData + 76 >> 2] = e.altKey;
  HEAP32[keyEventData + 80 >> 2] = e.metaKey;
  HEAP32[keyEventData + 84 >> 2] = e.repeat;
  stringToUTF8(e.locale ? e.locale : "", keyEventData + 88, 32);
  stringToUTF8(e.char ? e.char : "", keyEventData + 120, 32);
  HEAP32[keyEventData + 152 >> 2] = e.charCode;
  HEAP32[keyEventData + 156 >> 2] = e.keyCode;
  HEAP32[keyEventData + 160 >> 2] = e.which;
  if (dynCall_iiii(callbackfunc, eventTypeId, keyEventData, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: __findEventTarget(target),
  allowsDeferredCalls: JSEvents.isInternetExplorer() ? false : true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: keyEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_keydown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 2, "keydown", targetThread);
 return 0;
}

function _emscripten_set_keypress_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 1, "keypress", targetThread);
 return 0;
}

function _emscripten_set_keyup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerKeyEventCallback(target, userData, useCapture, callbackfunc, 3, "keyup", targetThread);
 return 0;
}

function __fillMouseEventData(eventStruct, e, target) {
 HEAPF64[eventStruct >> 3] = JSEvents.tick();
 HEAP32[eventStruct + 8 >> 2] = e.screenX;
 HEAP32[eventStruct + 12 >> 2] = e.screenY;
 HEAP32[eventStruct + 16 >> 2] = e.clientX;
 HEAP32[eventStruct + 20 >> 2] = e.clientY;
 HEAP32[eventStruct + 24 >> 2] = e.ctrlKey;
 HEAP32[eventStruct + 28 >> 2] = e.shiftKey;
 HEAP32[eventStruct + 32 >> 2] = e.altKey;
 HEAP32[eventStruct + 36 >> 2] = e.metaKey;
 HEAP16[eventStruct + 40 >> 1] = e.button;
 HEAP16[eventStruct + 42 >> 1] = e.buttons;
 HEAP32[eventStruct + 44 >> 2] = e["movementX"] || e["mozMovementX"] || e["webkitMovementX"] || e.screenX - JSEvents.previousScreenX;
 HEAP32[eventStruct + 48 >> 2] = e["movementY"] || e["mozMovementY"] || e["webkitMovementY"] || e.screenY - JSEvents.previousScreenY;
 if (Module["canvas"]) {
  var rect = Module["canvas"].getBoundingClientRect();
  HEAP32[eventStruct + 60 >> 2] = e.clientX - rect.left;
  HEAP32[eventStruct + 64 >> 2] = e.clientY - rect.top;
 } else {
  HEAP32[eventStruct + 60 >> 2] = 0;
  HEAP32[eventStruct + 64 >> 2] = 0;
 }
 if (target) {
  var rect = JSEvents.getBoundingClientRectOrZeros(target);
  HEAP32[eventStruct + 52 >> 2] = e.clientX - rect.left;
  HEAP32[eventStruct + 56 >> 2] = e.clientY - rect.top;
 } else {
  HEAP32[eventStruct + 52 >> 2] = 0;
  HEAP32[eventStruct + 56 >> 2] = 0;
 }
 if (e.type !== "wheel" && e.type !== "mousewheel") {
  JSEvents.previousScreenX = e.screenX;
  JSEvents.previousScreenY = e.screenY;
 }
}

function __registerMouseEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.mouseEvent) JSEvents.mouseEvent = _malloc(72);
 target = __findEventTarget(target);
 var mouseEventHandlerFunc = function(event) {
  var e = event || window.event;
  __fillMouseEventData(JSEvents.mouseEvent, e, target);
  if (dynCall_iiii(callbackfunc, eventTypeId, JSEvents.mouseEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString != "mousemove" && eventTypeString != "mouseenter" && eventTypeString != "mouseleave",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: mouseEventHandlerFunc,
  useCapture: useCapture
 };
 if (JSEvents.isInternetExplorer() && eventTypeString == "mousedown") eventHandler.allowsDeferredCalls = false;
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_mousedown_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 5, "mousedown", targetThread);
 return 0;
}

function _emscripten_set_mouseenter_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 33, "mouseenter", targetThread);
 return 0;
}

function _emscripten_set_mouseleave_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 34, "mouseleave", targetThread);
 return 0;
}

function _emscripten_set_mousemove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 8, "mousemove", targetThread);
 return 0;
}

function _emscripten_set_mouseup_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerMouseEventCallback(target, userData, useCapture, callbackfunc, 6, "mouseup", targetThread);
 return 0;
}

function __fillPointerlockChangeEventData(eventStruct, e) {
 var pointerLockElement = document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement;
 var isPointerlocked = !!pointerLockElement;
 HEAP32[eventStruct >> 2] = isPointerlocked;
 var nodeName = JSEvents.getNodeNameForTarget(pointerLockElement);
 var id = pointerLockElement && pointerLockElement.id ? pointerLockElement.id : "";
 stringToUTF8(nodeName, eventStruct + 4, 128);
 stringToUTF8(id, eventStruct + 132, 128);
}

function __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.pointerlockChangeEvent) JSEvents.pointerlockChangeEvent = _malloc(260);
 var pointerlockChangeEventHandlerFunc = function(event) {
  var e = event || window.event;
  var pointerlockChangeEvent = JSEvents.pointerlockChangeEvent;
  __fillPointerlockChangeEventData(pointerlockChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, pointerlockChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: false,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: pointerlockChangeEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_pointerlockchange_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 if (!document || !document.body || !document.body.requestPointerLock && !document.body.mozRequestPointerLock && !document.body.webkitRequestPointerLock && !document.body.msRequestPointerLock) {
  return -1;
 }
 target = target ? __findEventTarget(target) : __specialEventTargets[1];
 if (!target) return -4;
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "pointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mozpointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "webkitpointerlockchange", targetThread);
 __registerPointerlockChangeEventCallback(target, userData, useCapture, callbackfunc, 20, "mspointerlockchange", targetThread);
 return 0;
}

function __registerUiEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.uiEvent) JSEvents.uiEvent = _malloc(36);
 if (eventTypeString == "scroll" && !target) {
  target = document;
 } else {
  target = __findEventTarget(target);
 }
 var uiEventHandlerFunc = function(event) {
  var e = event || window.event;
  if (e.target != target) {
   return;
  }
  var scrollPos = JSEvents.pageScrollPos();
  var uiEvent = JSEvents.uiEvent;
  HEAP32[uiEvent >> 2] = e.detail;
  HEAP32[uiEvent + 4 >> 2] = document.body.clientWidth;
  HEAP32[uiEvent + 8 >> 2] = document.body.clientHeight;
  HEAP32[uiEvent + 12 >> 2] = window.innerWidth;
  HEAP32[uiEvent + 16 >> 2] = window.innerHeight;
  HEAP32[uiEvent + 20 >> 2] = window.outerWidth;
  HEAP32[uiEvent + 24 >> 2] = window.outerHeight;
  HEAP32[uiEvent + 28 >> 2] = scrollPos[0];
  HEAP32[uiEvent + 32 >> 2] = scrollPos[1];
  if (dynCall_iiii(callbackfunc, eventTypeId, uiEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: false,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: uiEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_resize_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerUiEventCallback(target, userData, useCapture, callbackfunc, 10, "resize", targetThread);
 return 0;
}

function __registerTouchEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.touchEvent) JSEvents.touchEvent = _malloc(1684);
 target = __findEventTarget(target);
 var touchEventHandlerFunc = function(event) {
  var e = event || window.event;
  var touches = {};
  for (var i = 0; i < e.touches.length; ++i) {
   var touch = e.touches[i];
   touches[touch.identifier] = touch;
  }
  for (var i = 0; i < e.changedTouches.length; ++i) {
   var touch = e.changedTouches[i];
   touches[touch.identifier] = touch;
   touch.changed = true;
  }
  for (var i = 0; i < e.targetTouches.length; ++i) {
   var touch = e.targetTouches[i];
   touches[touch.identifier].onTarget = true;
  }
  var touchEvent = JSEvents.touchEvent;
  var ptr = touchEvent;
  HEAP32[ptr + 4 >> 2] = e.ctrlKey;
  HEAP32[ptr + 8 >> 2] = e.shiftKey;
  HEAP32[ptr + 12 >> 2] = e.altKey;
  HEAP32[ptr + 16 >> 2] = e.metaKey;
  ptr += 20;
  var canvasRect = Module["canvas"] ? Module["canvas"].getBoundingClientRect() : undefined;
  var targetRect = JSEvents.getBoundingClientRectOrZeros(target);
  var numTouches = 0;
  for (var i in touches) {
   var t = touches[i];
   HEAP32[ptr >> 2] = t.identifier;
   HEAP32[ptr + 4 >> 2] = t.screenX;
   HEAP32[ptr + 8 >> 2] = t.screenY;
   HEAP32[ptr + 12 >> 2] = t.clientX;
   HEAP32[ptr + 16 >> 2] = t.clientY;
   HEAP32[ptr + 20 >> 2] = t.pageX;
   HEAP32[ptr + 24 >> 2] = t.pageY;
   HEAP32[ptr + 28 >> 2] = t.changed;
   HEAP32[ptr + 32 >> 2] = t.onTarget;
   if (canvasRect) {
    HEAP32[ptr + 44 >> 2] = t.clientX - canvasRect.left;
    HEAP32[ptr + 48 >> 2] = t.clientY - canvasRect.top;
   } else {
    HEAP32[ptr + 44 >> 2] = 0;
    HEAP32[ptr + 48 >> 2] = 0;
   }
   HEAP32[ptr + 36 >> 2] = t.clientX - targetRect.left;
   HEAP32[ptr + 40 >> 2] = t.clientY - targetRect.top;
   ptr += 52;
   if (++numTouches >= 32) {
    break;
   }
  }
  HEAP32[touchEvent >> 2] = numTouches;
  if (dynCall_iiii(callbackfunc, eventTypeId, touchEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: eventTypeString == "touchstart" || eventTypeString == "touchend",
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: touchEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_touchcancel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 25, "touchcancel", targetThread);
 return 0;
}

function _emscripten_set_touchend_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 23, "touchend", targetThread);
 return 0;
}

function _emscripten_set_touchmove_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 24, "touchmove", targetThread);
 return 0;
}

function _emscripten_set_touchstart_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 __registerTouchEventCallback(target, userData, useCapture, callbackfunc, 22, "touchstart", targetThread);
 return 0;
}

function __fillVisibilityChangeEventData(eventStruct, e) {
 var visibilityStates = [ "hidden", "visible", "prerender", "unloaded" ];
 var visibilityState = visibilityStates.indexOf(document.visibilityState);
 HEAP32[eventStruct >> 2] = document.hidden;
 HEAP32[eventStruct + 4 >> 2] = visibilityState;
}

function __registerVisibilityChangeEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.visibilityChangeEvent) JSEvents.visibilityChangeEvent = _malloc(8);
 var visibilityChangeEventHandlerFunc = function(event) {
  var e = event || window.event;
  var visibilityChangeEvent = JSEvents.visibilityChangeEvent;
  __fillVisibilityChangeEventData(visibilityChangeEvent, e);
  if (dynCall_iiii(callbackfunc, eventTypeId, visibilityChangeEvent, userData)) e.preventDefault();
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: false,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: visibilityChangeEventHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_visibilitychange_callback_on_thread(userData, useCapture, callbackfunc, targetThread) {
 if (!__specialEventTargets[1]) {
  return -4;
 }
 __registerVisibilityChangeEventCallback(__specialEventTargets[1], userData, useCapture, callbackfunc, 21, "visibilitychange", targetThread);
 return 0;
}

function __registerWheelEventCallback(target, userData, useCapture, callbackfunc, eventTypeId, eventTypeString, targetThread) {
 if (!JSEvents.wheelEvent) JSEvents.wheelEvent = _malloc(104);
 var wheelHandlerFunc = function(event) {
  var e = event || window.event;
  var wheelEvent = JSEvents.wheelEvent;
  __fillMouseEventData(wheelEvent, e, target);
  HEAPF64[wheelEvent + 72 >> 3] = e["deltaX"];
  HEAPF64[wheelEvent + 80 >> 3] = e["deltaY"];
  HEAPF64[wheelEvent + 88 >> 3] = e["deltaZ"];
  HEAP32[wheelEvent + 96 >> 2] = e["deltaMode"];
  if (dynCall_iiii(callbackfunc, eventTypeId, wheelEvent, userData)) e.preventDefault();
 };
 var mouseWheelHandlerFunc = function(event) {
  var e = event || window.event;
  __fillMouseEventData(JSEvents.wheelEvent, e, target);
  HEAPF64[JSEvents.wheelEvent + 72 >> 3] = e["wheelDeltaX"] || 0;
  HEAPF64[JSEvents.wheelEvent + 80 >> 3] = -(e["wheelDeltaY"] ? e["wheelDeltaY"] : e["wheelDelta"]);
  HEAPF64[JSEvents.wheelEvent + 88 >> 3] = 0;
  HEAP32[JSEvents.wheelEvent + 96 >> 2] = 0;
  var shouldCancel = dynCall_iiii(callbackfunc, eventTypeId, JSEvents.wheelEvent, userData);
  if (shouldCancel) {
   e.preventDefault();
  }
 };
 var eventHandler = {
  target: target,
  allowsDeferredCalls: true,
  eventTypeString: eventTypeString,
  callbackfunc: callbackfunc,
  handlerFunc: eventTypeString == "wheel" ? wheelHandlerFunc : mouseWheelHandlerFunc,
  useCapture: useCapture
 };
 JSEvents.registerOrRemoveHandler(eventHandler);
}

function _emscripten_set_wheel_callback_on_thread(target, userData, useCapture, callbackfunc, targetThread) {
 target = __findEventTarget(target);
 if (typeof target.onwheel !== "undefined") {
  __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "wheel", targetThread);
  return 0;
 } else if (typeof target.onmousewheel !== "undefined") {
  __registerWheelEventCallback(target, userData, useCapture, callbackfunc, 9, "mousewheel", targetThread);
  return 0;
 } else {
  return -1;
 }
}

function _exit(status) {
 exit(status);
}

function _getenv(name) {
 if (name === 0) return 0;
 name = UTF8ToString(name);
 if (!ENV.hasOwnProperty(name)) return 0;
 if (_getenv.ret) _free(_getenv.ret);
 _getenv.ret = allocateUTF8(ENV[name]);
 return _getenv.ret;
}

function _gettimeofday(ptr) {
 var now = Date.now();
 HEAP32[ptr >> 2] = now / 1e3 | 0;
 HEAP32[ptr + 4 >> 2] = now % 1e3 * 1e3 | 0;
 return 0;
}

function _llvm_stackrestore(p) {
 var self = _llvm_stacksave;
 var ret = self.LLVM_SAVEDSTACKS[p];
 self.LLVM_SAVEDSTACKS.splice(p, 1);
 stackRestore(ret);
}

function _llvm_stacksave() {
 var self = _llvm_stacksave;
 if (!self.LLVM_SAVEDSTACKS) {
  self.LLVM_SAVEDSTACKS = [];
 }
 self.LLVM_SAVEDSTACKS.push(stackSave());
 return self.LLVM_SAVEDSTACKS.length - 1;
}

function _emscripten_memcpy_big(dest, src, num) {
 HEAPU8.set(HEAPU8.subarray(src, src + num), dest);
}

function _usleep(useconds) {
 var msec = useconds / 1e3;
 if ((ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && self["performance"] && self["performance"]["now"]) {
  var start = self["performance"]["now"]();
  while (self["performance"]["now"]() - start < msec) {}
 } else {
  var start = Date.now();
  while (Date.now() - start < msec) {}
 }
 return 0;
}

function _nanosleep(rqtp, rmtp) {
 var seconds = HEAP32[rqtp >> 2];
 var nanoseconds = HEAP32[rqtp + 4 >> 2];
 if (rmtp !== 0) {
  HEAP32[rmtp >> 2] = 0;
  HEAP32[rmtp + 4 >> 2] = 0;
 }
 return _usleep(seconds * 1e6 + nanoseconds / 1e3);
}

function _pthread_cond_wait() {
 return 0;
}

function _sigaction(signum, act, oldact) {
 return 0;
}

var __sigalrm_handler = 0;

function _signal(sig, func) {
 if (sig == 14) {
  __sigalrm_handler = func;
 } else {}
 return 0;
}

function __isLeapYear(year) {
 return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function __arraySum(array, index) {
 var sum = 0;
 for (var i = 0; i <= index; sum += array[i++]) ;
 return sum;
}

var __MONTH_DAYS_LEAP = [ 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

var __MONTH_DAYS_REGULAR = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

function __addDays(date, days) {
 var newDate = new Date(date.getTime());
 while (days > 0) {
  var leap = __isLeapYear(newDate.getFullYear());
  var currentMonth = newDate.getMonth();
  var daysInCurrentMonth = (leap ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[currentMonth];
  if (days > daysInCurrentMonth - newDate.getDate()) {
   days -= daysInCurrentMonth - newDate.getDate() + 1;
   newDate.setDate(1);
   if (currentMonth < 11) {
    newDate.setMonth(currentMonth + 1);
   } else {
    newDate.setMonth(0);
    newDate.setFullYear(newDate.getFullYear() + 1);
   }
  } else {
   newDate.setDate(newDate.getDate() + days);
   return newDate;
  }
 }
 return newDate;
}

function _strftime(s, maxsize, format, tm) {
 var tm_zone = HEAP32[tm + 40 >> 2];
 var date = {
  tm_sec: HEAP32[tm >> 2],
  tm_min: HEAP32[tm + 4 >> 2],
  tm_hour: HEAP32[tm + 8 >> 2],
  tm_mday: HEAP32[tm + 12 >> 2],
  tm_mon: HEAP32[tm + 16 >> 2],
  tm_year: HEAP32[tm + 20 >> 2],
  tm_wday: HEAP32[tm + 24 >> 2],
  tm_yday: HEAP32[tm + 28 >> 2],
  tm_isdst: HEAP32[tm + 32 >> 2],
  tm_gmtoff: HEAP32[tm + 36 >> 2],
  tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
 };
 var pattern = UTF8ToString(format);
 var EXPANSION_RULES_1 = {
  "%c": "%a %b %d %H:%M:%S %Y",
  "%D": "%m/%d/%y",
  "%F": "%Y-%m-%d",
  "%h": "%b",
  "%r": "%I:%M:%S %p",
  "%R": "%H:%M",
  "%T": "%H:%M:%S",
  "%x": "%m/%d/%y",
  "%X": "%H:%M:%S"
 };
 for (var rule in EXPANSION_RULES_1) {
  pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
 }
 var WEEKDAYS = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ];
 var MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
 function leadingSomething(value, digits, character) {
  var str = typeof value === "number" ? value.toString() : value || "";
  while (str.length < digits) {
   str = character[0] + str;
  }
  return str;
 }
 function leadingNulls(value, digits) {
  return leadingSomething(value, digits, "0");
 }
 function compareByDay(date1, date2) {
  function sgn(value) {
   return value < 0 ? -1 : value > 0 ? 1 : 0;
  }
  var compare;
  if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
   if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
    compare = sgn(date1.getDate() - date2.getDate());
   }
  }
  return compare;
 }
 function getFirstWeekStartDate(janFourth) {
  switch (janFourth.getDay()) {
  case 0:
   return new Date(janFourth.getFullYear() - 1, 11, 29);

  case 1:
   return janFourth;

  case 2:
   return new Date(janFourth.getFullYear(), 0, 3);

  case 3:
   return new Date(janFourth.getFullYear(), 0, 2);

  case 4:
   return new Date(janFourth.getFullYear(), 0, 1);

  case 5:
   return new Date(janFourth.getFullYear() - 1, 11, 31);

  case 6:
   return new Date(janFourth.getFullYear() - 1, 11, 30);
  }
 }
 function getWeekBasedYear(date) {
  var thisDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
  var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
  var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
  var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
  var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
  if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
   if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
    return thisDate.getFullYear() + 1;
   } else {
    return thisDate.getFullYear();
   }
  } else {
   return thisDate.getFullYear() - 1;
  }
 }
 var EXPANSION_RULES_2 = {
  "%a": function(date) {
   return WEEKDAYS[date.tm_wday].substring(0, 3);
  },
  "%A": function(date) {
   return WEEKDAYS[date.tm_wday];
  },
  "%b": function(date) {
   return MONTHS[date.tm_mon].substring(0, 3);
  },
  "%B": function(date) {
   return MONTHS[date.tm_mon];
  },
  "%C": function(date) {
   var year = date.tm_year + 1900;
   return leadingNulls(year / 100 | 0, 2);
  },
  "%d": function(date) {
   return leadingNulls(date.tm_mday, 2);
  },
  "%e": function(date) {
   return leadingSomething(date.tm_mday, 2, " ");
  },
  "%g": function(date) {
   return getWeekBasedYear(date).toString().substring(2);
  },
  "%G": function(date) {
   return getWeekBasedYear(date);
  },
  "%H": function(date) {
   return leadingNulls(date.tm_hour, 2);
  },
  "%I": function(date) {
   var twelveHour = date.tm_hour;
   if (twelveHour == 0) twelveHour = 12; else if (twelveHour > 12) twelveHour -= 12;
   return leadingNulls(twelveHour, 2);
  },
  "%j": function(date) {
   return leadingNulls(date.tm_mday + __arraySum(__isLeapYear(date.tm_year + 1900) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, date.tm_mon - 1), 3);
  },
  "%m": function(date) {
   return leadingNulls(date.tm_mon + 1, 2);
  },
  "%M": function(date) {
   return leadingNulls(date.tm_min, 2);
  },
  "%n": function() {
   return "\n";
  },
  "%p": function(date) {
   if (date.tm_hour >= 0 && date.tm_hour < 12) {
    return "AM";
   } else {
    return "PM";
   }
  },
  "%S": function(date) {
   return leadingNulls(date.tm_sec, 2);
  },
  "%t": function() {
   return "\t";
  },
  "%u": function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay() || 7;
  },
  "%U": function(date) {
   var janFirst = new Date(date.tm_year + 1900, 0, 1);
   var firstSunday = janFirst.getDay() === 0 ? janFirst : __addDays(janFirst, 7 - janFirst.getDay());
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstSunday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstSundayUntilEndJanuary = 31 - firstSunday.getDate();
    var days = firstSundayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstSunday, janFirst) === 0 ? "01" : "00";
  },
  "%V": function(date) {
   var janFourthThisYear = new Date(date.tm_year + 1900, 0, 4);
   var janFourthNextYear = new Date(date.tm_year + 1901, 0, 4);
   var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
   var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
   var endDate = __addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
   if (compareByDay(endDate, firstWeekStartThisYear) < 0) {
    return "53";
   }
   if (compareByDay(firstWeekStartNextYear, endDate) <= 0) {
    return "01";
   }
   var daysDifference;
   if (firstWeekStartThisYear.getFullYear() < date.tm_year + 1900) {
    daysDifference = date.tm_yday + 32 - firstWeekStartThisYear.getDate();
   } else {
    daysDifference = date.tm_yday + 1 - firstWeekStartThisYear.getDate();
   }
   return leadingNulls(Math.ceil(daysDifference / 7), 2);
  },
  "%w": function(date) {
   var day = new Date(date.tm_year + 1900, date.tm_mon + 1, date.tm_mday, 0, 0, 0, 0);
   return day.getDay();
  },
  "%W": function(date) {
   var janFirst = new Date(date.tm_year, 0, 1);
   var firstMonday = janFirst.getDay() === 1 ? janFirst : __addDays(janFirst, janFirst.getDay() === 0 ? 1 : 7 - janFirst.getDay() + 1);
   var endDate = new Date(date.tm_year + 1900, date.tm_mon, date.tm_mday);
   if (compareByDay(firstMonday, endDate) < 0) {
    var februaryFirstUntilEndMonth = __arraySum(__isLeapYear(endDate.getFullYear()) ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR, endDate.getMonth() - 1) - 31;
    var firstMondayUntilEndJanuary = 31 - firstMonday.getDate();
    var days = firstMondayUntilEndJanuary + februaryFirstUntilEndMonth + endDate.getDate();
    return leadingNulls(Math.ceil(days / 7), 2);
   }
   return compareByDay(firstMonday, janFirst) === 0 ? "01" : "00";
  },
  "%y": function(date) {
   return (date.tm_year + 1900).toString().substring(2);
  },
  "%Y": function(date) {
   return date.tm_year + 1900;
  },
  "%z": function(date) {
   var off = date.tm_gmtoff;
   var ahead = off >= 0;
   off = Math.abs(off) / 60;
   off = off / 60 * 100 + off % 60;
   return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
  },
  "%Z": function(date) {
   return date.tm_zone;
  },
  "%%": function() {
   return "%";
  }
 };
 for (var rule in EXPANSION_RULES_2) {
  if (pattern.indexOf(rule) >= 0) {
   pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_2[rule](date));
  }
 }
 var bytes = intArrayFromString(pattern, false);
 if (bytes.length > maxsize) {
  return 0;
 }
 writeArrayToMemory(bytes, s);
 return bytes.length - 1;
}

function _strftime_l(s, maxsize, format, tm) {
 return _strftime(s, maxsize, format, tm);
}

function _time(ptr) {
 var ret = Date.now() / 1e3 | 0;
 if (ptr) {
  HEAP32[ptr >> 2] = ret;
 }
 return ret;
}

FS.staticInit();

__ATINIT__.unshift(function() {
 if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
});

__ATMAIN__.push(function() {
 FS.ignorePermissions = false;
});

__ATEXIT__.push(function() {
 FS.quit();
});

Module["FS_createFolder"] = FS.createFolder;

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createLink"] = FS.createLink;

Module["FS_createDevice"] = FS.createDevice;

Module["FS_unlink"] = FS.unlink;

__ATINIT__.unshift(function() {
 TTY.init();
});

__ATEXIT__.push(function() {
 TTY.shutdown();
});

if (ENVIRONMENT_IS_NODE) {
 var fs = require("fs");
 var NODEJS_PATH = require("path");
 NODEFS.staticInit();
}

Module["requestFullScreen"] = function Module_requestFullScreen(lockPointer, resizeCanvas, vrDevice) {
 err("Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.");
 Module["requestFullScreen"] = Module["requestFullscreen"];
 Browser.requestFullScreen(lockPointer, resizeCanvas, vrDevice);
};

Module["requestFullscreen"] = function Module_requestFullscreen(lockPointer, resizeCanvas, vrDevice) {
 Browser.requestFullscreen(lockPointer, resizeCanvas, vrDevice);
};

Module["requestAnimationFrame"] = function Module_requestAnimationFrame(func) {
 Browser.requestAnimationFrame(func);
};

Module["setCanvasSize"] = function Module_setCanvasSize(width, height, noUpdates) {
 Browser.setCanvasSize(width, height, noUpdates);
};

Module["pauseMainLoop"] = function Module_pauseMainLoop() {
 Browser.mainLoop.pause();
};

Module["resumeMainLoop"] = function Module_resumeMainLoop() {
 Browser.mainLoop.resume();
};

Module["getUserMedia"] = function Module_getUserMedia() {
 Browser.getUserMedia();
};

Module["createContext"] = function Module_createContext(canvas, useWebGL, setInModule, webGLContextAttributes) {
 return Browser.createContext(canvas, useWebGL, setInModule, webGLContextAttributes);
};

if (ENVIRONMENT_IS_NODE) {
 _emscripten_get_now = function _emscripten_get_now_actual() {
  var t = process["hrtime"]();
  return t[0] * 1e3 + t[1] / 1e6;
 };
} else if (typeof dateNow !== "undefined") {
 _emscripten_get_now = dateNow;
} else if (typeof self === "object" && self["performance"] && typeof self["performance"]["now"] === "function") {
 _emscripten_get_now = function() {
  return self["performance"]["now"]();
 };
} else if (typeof performance === "object" && typeof performance["now"] === "function") {
 _emscripten_get_now = function() {
  return performance["now"]();
 };
} else {
 _emscripten_get_now = Date.now;
}

var GLctx;

GL.init();

for (var i = 0; i < 32; i++) __tempFixedLengthArray.push(new Array(i));

function intArrayFromString(stringy, dontAddNull, length) {
 var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
 var u8array = new Array(len);
 var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
 if (dontAddNull) u8array.length = numBytesWritten;
 return u8array;
}

var asmGlobalArg = {};

var asmLibraryArg = {
 "b": abort,
 "u": setTempRet0,
 "nl": ___buildEnvironment,
 "ml": ___cxa_allocate_exception,
 "ll": ___cxa_throw,
 "kl": ___cxa_uncaught_exception,
 "$": ___lock,
 "jl": ___map_file,
 "_": ___setErrNo,
 "il": ___syscall140,
 "hl": ___syscall145,
 "Z": ___syscall146,
 "p": ___syscall221,
 "gl": ___syscall5,
 "Y": ___syscall54,
 "X": ___syscall6,
 "fl": ___syscall91,
 "t": ___unlock,
 "h": _abort,
 "el": _alBufferData,
 "dl": _alGenBuffers,
 "cl": _alGenSources,
 "bl": _alGetError,
 "al": _alGetSourcei,
 "$k": _alSourcePlay,
 "_k": _alSourcei,
 "Zk": _alcCreateContext,
 "W": _alcGetIntegerv,
 "Yk": _alcMakeContextCurrent,
 "Xk": _alcOpenDevice,
 "e": _clock_gettime,
 "Wk": _dlclose,
 "Vk": _dlerror,
 "V": _dlsym,
 "Uk": _eglBindAPI,
 "Tk": _eglChooseConfig,
 "Sk": _eglCreateContext,
 "Rk": _eglCreateWindowSurface,
 "Qk": _eglDestroyContext,
 "Pk": _eglDestroySurface,
 "Ok": _eglGetConfigAttrib,
 "U": _eglGetDisplay,
 "Nk": _eglGetError,
 "Mk": _eglGetProcAddress,
 "Lk": _eglInitialize,
 "Kk": _eglMakeCurrent,
 "Jk": _eglQueryString,
 "Ik": _eglSwapBuffers,
 "Hk": _eglSwapInterval,
 "Gk": _eglTerminate,
 "Fk": _eglWaitGL,
 "Ek": _eglWaitNative,
 "j": _emscripten_asm_const_i,
 "i": _emscripten_asm_const_ii,
 "T": _emscripten_asm_const_iii,
 "Dk": _emscripten_asm_const_iiii,
 "S": _emscripten_asm_const_iiiii,
 "Ck": _emscripten_asm_const_iiiiii,
 "Bk": _emscripten_exit_fullscreen,
 "Ak": _emscripten_exit_pointerlock,
 "s": _emscripten_get_device_pixel_ratio,
 "g": _emscripten_get_element_css_size,
 "R": _emscripten_get_gamepad_status,
 "zk": _emscripten_get_heap_size,
 "yk": _emscripten_get_num_gamepads,
 "xk": _emscripten_glAccum,
 "wk": _emscripten_glActiveTexture,
 "vk": _emscripten_glAreTexturesResident,
 "uk": _emscripten_glArrayElement,
 "tk": _emscripten_glAttachObjectARB,
 "sk": _emscripten_glAttachShader,
 "rk": _emscripten_glBeginConditionalRender,
 "qk": _emscripten_glBeginQuery,
 "pk": _emscripten_glBeginTransformFeedback,
 "ok": _emscripten_glBindAttribLocation,
 "nk": _emscripten_glBindBuffer,
 "mk": _emscripten_glBindBufferBase,
 "lk": _emscripten_glBindBufferRange,
 "kk": _emscripten_glBindFragDataLocation,
 "jk": _emscripten_glBindFramebuffer,
 "ik": _emscripten_glBindProgramARB,
 "hk": _emscripten_glBindRenderbuffer,
 "gk": _emscripten_glBindTexture,
 "fk": _emscripten_glBindVertexArray,
 "ek": _emscripten_glBitmap,
 "dk": _emscripten_glBlendColor,
 "ck": _emscripten_glBlendEquation,
 "bk": _emscripten_glBlendEquationSeparate,
 "ak": _emscripten_glBlendFunc,
 "$j": _emscripten_glBlendFuncSeparate,
 "_j": _emscripten_glBlitFramebuffer,
 "Zj": _emscripten_glBufferData,
 "Yj": _emscripten_glBufferSubData,
 "Xj": _emscripten_glCallList,
 "Wj": _emscripten_glCallLists,
 "Vj": _emscripten_glCheckFramebufferStatus,
 "Uj": _emscripten_glClampColor,
 "Tj": _emscripten_glClear,
 "Sj": _emscripten_glClearAccum,
 "Rj": _emscripten_glClearBufferfi,
 "Qj": _emscripten_glClearBufferfv,
 "Pj": _emscripten_glClearBufferiv,
 "Oj": _emscripten_glClearBufferuiv,
 "Nj": _emscripten_glClearColor,
 "Mj": _emscripten_glClearDepth,
 "Lj": _emscripten_glClearDepthf,
 "Kj": _emscripten_glClearIndex,
 "Jj": _emscripten_glClearStencil,
 "Ij": _emscripten_glClipPlane,
 "Hj": _emscripten_glColorMask,
 "Gj": _emscripten_glColorMaski,
 "Fj": _emscripten_glColorMaterial,
 "Ej": _emscripten_glColorSubTable,
 "Dj": _emscripten_glColorTable,
 "Cj": _emscripten_glColorTableParameterfv,
 "Bj": _emscripten_glColorTableParameteriv,
 "Aj": _emscripten_glCompileShader,
 "zj": _emscripten_glCompressedTexImage1D,
 "yj": _emscripten_glCompressedTexImage2D,
 "xj": _emscripten_glCompressedTexImage3D,
 "wj": _emscripten_glCompressedTexSubImage1D,
 "vj": _emscripten_glCompressedTexSubImage2D,
 "uj": _emscripten_glCompressedTexSubImage3D,
 "tj": _emscripten_glConvolutionFilter1D,
 "sj": _emscripten_glConvolutionFilter2D,
 "rj": _emscripten_glConvolutionParameterf,
 "qj": _emscripten_glConvolutionParameterfv,
 "pj": _emscripten_glConvolutionParameteri,
 "oj": _emscripten_glConvolutionParameteriv,
 "nj": _emscripten_glCopyColorSubTable,
 "mj": _emscripten_glCopyColorTable,
 "lj": _emscripten_glCopyConvolutionFilter1D,
 "kj": _emscripten_glCopyConvolutionFilter2D,
 "jj": _emscripten_glCopyPixels,
 "ij": _emscripten_glCopyTexImage1D,
 "hj": _emscripten_glCopyTexImage2D,
 "gj": _emscripten_glCopyTexSubImage1D,
 "fj": _emscripten_glCopyTexSubImage2D,
 "ej": _emscripten_glCopyTexSubImage3D,
 "dj": _emscripten_glCreateProgram,
 "cj": _emscripten_glCreateProgramObjectARB,
 "bj": _emscripten_glCreateShader,
 "aj": _emscripten_glCreateShaderObjectARB,
 "$i": _emscripten_glCullFace,
 "_i": _emscripten_glDeleteBuffers,
 "Zi": _emscripten_glDeleteFramebuffers,
 "Yi": _emscripten_glDeleteLists,
 "Xi": _emscripten_glDeleteProgram,
 "Wi": _emscripten_glDeleteProgramsARB,
 "Vi": _emscripten_glDeleteQueries,
 "Ui": _emscripten_glDeleteRenderbuffers,
 "Ti": _emscripten_glDeleteShader,
 "Si": _emscripten_glDeleteTextures,
 "Ri": _emscripten_glDeleteVertexArrays,
 "Qi": _emscripten_glDepthFunc,
 "Pi": _emscripten_glDepthMask,
 "Oi": _emscripten_glDepthRange,
 "Ni": _emscripten_glDepthRangef,
 "Mi": _emscripten_glDetachObjectARB,
 "Li": _emscripten_glDetachShader,
 "Ki": _emscripten_glDisable,
 "Ji": _emscripten_glDisableVertexAttribArray,
 "Ii": _emscripten_glDisablei,
 "Hi": _emscripten_glDrawArrays,
 "Gi": _emscripten_glDrawArraysInstanced,
 "Fi": _emscripten_glDrawBuffers,
 "Ei": _emscripten_glDrawElements,
 "Di": _emscripten_glDrawElementsInstanced,
 "Ci": _emscripten_glDrawPixels,
 "Bi": _emscripten_glDrawRangeElements,
 "Ai": _emscripten_glEdgeFlag,
 "zi": _emscripten_glEdgeFlagPointer,
 "yi": _emscripten_glEdgeFlagv,
 "xi": _emscripten_glEnable,
 "wi": _emscripten_glEnableVertexAttribArray,
 "vi": _emscripten_glEnablei,
 "ui": _emscripten_glEndConditionalRender,
 "ti": _emscripten_glEndList,
 "si": _emscripten_glEndQuery,
 "ri": _emscripten_glEndTransformFeedback,
 "qi": _emscripten_glEvalCoord1d,
 "pi": _emscripten_glEvalCoord1dv,
 "oi": _emscripten_glEvalCoord1f,
 "ni": _emscripten_glEvalCoord1fv,
 "mi": _emscripten_glEvalCoord2d,
 "li": _emscripten_glEvalCoord2dv,
 "ki": _emscripten_glEvalCoord2f,
 "ji": _emscripten_glEvalCoord2fv,
 "ii": _emscripten_glEvalMesh1,
 "hi": _emscripten_glEvalMesh2,
 "gi": _emscripten_glEvalPoint1,
 "fi": _emscripten_glEvalPoint2,
 "ei": _emscripten_glFeedbackBuffer,
 "di": _emscripten_glFinish,
 "ci": _emscripten_glFlush,
 "bi": _emscripten_glFogf,
 "ai": _emscripten_glFogfv,
 "$h": _emscripten_glFogi,
 "_h": _emscripten_glFogiv,
 "Zh": _emscripten_glFramebufferRenderbuffer,
 "Yh": _emscripten_glFramebufferTexture1D,
 "Xh": _emscripten_glFramebufferTexture2D,
 "Wh": _emscripten_glFramebufferTexture3D,
 "Vh": _emscripten_glFramebufferTextureLayer,
 "Uh": _emscripten_glFrontFace,
 "Th": _emscripten_glGenBuffers,
 "Sh": _emscripten_glGenFramebuffers,
 "Rh": _emscripten_glGenLists,
 "Qh": _emscripten_glGenProgramsARB,
 "Ph": _emscripten_glGenQueries,
 "Oh": _emscripten_glGenRenderbuffers,
 "Nh": _emscripten_glGenTextures,
 "Mh": _emscripten_glGenVertexArrays,
 "Lh": _emscripten_glGenerateMipmap,
 "Kh": _emscripten_glGetActiveAttrib,
 "Jh": _emscripten_glGetActiveUniform,
 "Ih": _emscripten_glGetActiveUniformBlockName,
 "Hh": _emscripten_glGetActiveUniformBlockiv,
 "Gh": _emscripten_glGetActiveUniformName,
 "Fh": _emscripten_glGetActiveUniformsiv,
 "Eh": _emscripten_glGetAttachedObjectsARB,
 "Dh": _emscripten_glGetAttachedShaders,
 "Ch": _emscripten_glGetAttribLocation,
 "Bh": _emscripten_glGetBooleani_v,
 "Ah": _emscripten_glGetBooleanv,
 "zh": _emscripten_glGetBufferParameteriv,
 "yh": _emscripten_glGetBufferPointerv,
 "xh": _emscripten_glGetBufferSubData,
 "wh": _emscripten_glGetClipPlane,
 "vh": _emscripten_glGetColorTable,
 "uh": _emscripten_glGetColorTableParameterfv,
 "th": _emscripten_glGetColorTableParameteriv,
 "sh": _emscripten_glGetCompressedTexImage,
 "rh": _emscripten_glGetConvolutionFilter,
 "qh": _emscripten_glGetConvolutionParameterfv,
 "ph": _emscripten_glGetConvolutionParameteriv,
 "oh": _emscripten_glGetDoublev,
 "nh": _emscripten_glGetError,
 "mh": _emscripten_glGetFloatv,
 "lh": _emscripten_glGetFragDataLocation,
 "kh": _emscripten_glGetFramebufferAttachmentParameteriv,
 "jh": _emscripten_glGetHandleARB,
 "ih": _emscripten_glGetHistogram,
 "hh": _emscripten_glGetHistogramParameterfv,
 "gh": _emscripten_glGetHistogramParameteriv,
 "fh": _emscripten_glGetIntegeri_v,
 "eh": _emscripten_glGetIntegerv,
 "dh": _emscripten_glGetLightfv,
 "ch": _emscripten_glGetLightiv,
 "bh": _emscripten_glGetMapdv,
 "ah": _emscripten_glGetMapfv,
 "$g": _emscripten_glGetMapiv,
 "_g": _emscripten_glGetMaterialfv,
 "Zg": _emscripten_glGetMaterialiv,
 "Yg": _emscripten_glGetMinmax,
 "Xg": _emscripten_glGetMinmaxParameterfv,
 "Wg": _emscripten_glGetMinmaxParameteriv,
 "Vg": _emscripten_glGetObjectParameterfvARB,
 "Ug": _emscripten_glGetObjectParameterivARB,
 "Tg": _emscripten_glGetPixelMapfv,
 "Sg": _emscripten_glGetPixelMapuiv,
 "Rg": _emscripten_glGetPixelMapusv,
 "Qg": _emscripten_glGetPointerv,
 "Pg": _emscripten_glGetPolygonStipple,
 "Og": _emscripten_glGetProgramEnvParameterdvARB,
 "Ng": _emscripten_glGetProgramEnvParameterfvARB,
 "Mg": _emscripten_glGetProgramInfoLog,
 "Lg": _emscripten_glGetProgramLocalParameterdvARB,
 "Kg": _emscripten_glGetProgramLocalParameterfvARB,
 "Jg": _emscripten_glGetProgramStringARB,
 "Ig": _emscripten_glGetProgramiv,
 "Hg": _emscripten_glGetQueryObjectiv,
 "Gg": _emscripten_glGetQueryObjectuiv,
 "Fg": _emscripten_glGetQueryiv,
 "Eg": _emscripten_glGetRenderbufferParameteriv,
 "Dg": _emscripten_glGetSeparableFilter,
 "Cg": _emscripten_glGetShaderInfoLog,
 "Bg": _emscripten_glGetShaderPrecisionFormat,
 "Ag": _emscripten_glGetShaderSource,
 "zg": _emscripten_glGetShaderiv,
 "yg": _emscripten_glGetString,
 "xg": _emscripten_glGetStringi,
 "wg": _emscripten_glGetTexGendv,
 "vg": _emscripten_glGetTexGenfv,
 "ug": _emscripten_glGetTexGeniv,
 "tg": _emscripten_glGetTexImage,
 "sg": _emscripten_glGetTexParameterIiv,
 "rg": _emscripten_glGetTexParameterIuiv,
 "qg": _emscripten_glGetTexParameterfv,
 "pg": _emscripten_glGetTexParameteriv,
 "og": _emscripten_glGetTransformFeedbackVarying,
 "ng": _emscripten_glGetUniformBlockIndex,
 "mg": _emscripten_glGetUniformIndices,
 "lg": _emscripten_glGetUniformLocation,
 "kg": _emscripten_glGetUniformfv,
 "jg": _emscripten_glGetUniformiv,
 "ig": _emscripten_glGetUniformuiv,
 "hg": _emscripten_glGetVertexAttribIiv,
 "gg": _emscripten_glGetVertexAttribIuiv,
 "fg": _emscripten_glGetVertexAttribPointerv,
 "eg": _emscripten_glGetVertexAttribdv,
 "dg": _emscripten_glGetVertexAttribfv,
 "cg": _emscripten_glGetVertexAttribiv,
 "bg": _emscripten_glHint,
 "ag": _emscripten_glHistogram,
 "$f": _emscripten_glIndexMask,
 "_f": _emscripten_glIndexPointer,
 "Zf": _emscripten_glIndexd,
 "Yf": _emscripten_glIndexdv,
 "Xf": _emscripten_glIndexf,
 "Wf": _emscripten_glIndexfv,
 "Vf": _emscripten_glIndexi,
 "Uf": _emscripten_glIndexiv,
 "Tf": _emscripten_glIndexs,
 "Sf": _emscripten_glIndexsv,
 "Rf": _emscripten_glIndexub,
 "Qf": _emscripten_glIndexubv,
 "Pf": _emscripten_glInitNames,
 "Of": _emscripten_glInterleavedArrays,
 "Nf": _emscripten_glIsBuffer,
 "Mf": _emscripten_glIsEnabled,
 "Lf": _emscripten_glIsEnabledi,
 "Kf": _emscripten_glIsFramebuffer,
 "Jf": _emscripten_glIsList,
 "If": _emscripten_glIsProgram,
 "Hf": _emscripten_glIsQuery,
 "Gf": _emscripten_glIsRenderbuffer,
 "Ff": _emscripten_glIsShader,
 "Ef": _emscripten_glIsTexture,
 "Df": _emscripten_glIsVertexArray,
 "Cf": _emscripten_glLineStipple,
 "Bf": _emscripten_glLineWidth,
 "Af": _emscripten_glLinkProgram,
 "zf": _emscripten_glListBase,
 "yf": _emscripten_glLoadName,
 "xf": _emscripten_glLoadTransposeMatrixd,
 "wf": _emscripten_glLoadTransposeMatrixf,
 "vf": _emscripten_glLogicOp,
 "uf": _emscripten_glMap1d,
 "tf": _emscripten_glMap1f,
 "sf": _emscripten_glMap2d,
 "rf": _emscripten_glMap2f,
 "qf": _emscripten_glMapBuffer,
 "pf": _emscripten_glMapGrid1d,
 "of": _emscripten_glMapGrid1f,
 "nf": _emscripten_glMapGrid2d,
 "mf": _emscripten_glMapGrid2f,
 "lf": _emscripten_glMinmax,
 "kf": _emscripten_glMultTransposeMatrixd,
 "jf": _emscripten_glMultTransposeMatrixf,
 "hf": _emscripten_glMultiDrawArrays,
 "gf": _emscripten_glMultiDrawElements,
 "ff": _emscripten_glMultiTexCoord1d,
 "ef": _emscripten_glMultiTexCoord1dv,
 "df": _emscripten_glMultiTexCoord1f,
 "cf": _emscripten_glMultiTexCoord1fv,
 "bf": _emscripten_glMultiTexCoord1i,
 "af": _emscripten_glMultiTexCoord1iv,
 "$e": _emscripten_glMultiTexCoord1s,
 "_e": _emscripten_glMultiTexCoord1sv,
 "Ze": _emscripten_glMultiTexCoord2d,
 "Ye": _emscripten_glMultiTexCoord2dv,
 "Xe": _emscripten_glMultiTexCoord2f,
 "We": _emscripten_glMultiTexCoord2fv,
 "Ve": _emscripten_glMultiTexCoord2i,
 "Ue": _emscripten_glMultiTexCoord2iv,
 "Te": _emscripten_glMultiTexCoord2s,
 "Se": _emscripten_glMultiTexCoord2sv,
 "Re": _emscripten_glMultiTexCoord3d,
 "Qe": _emscripten_glMultiTexCoord3dv,
 "Pe": _emscripten_glMultiTexCoord3f,
 "Oe": _emscripten_glMultiTexCoord3fv,
 "Ne": _emscripten_glMultiTexCoord3i,
 "Me": _emscripten_glMultiTexCoord3iv,
 "Le": _emscripten_glMultiTexCoord3s,
 "Ke": _emscripten_glMultiTexCoord3sv,
 "Je": _emscripten_glMultiTexCoord4d,
 "Ie": _emscripten_glMultiTexCoord4dv,
 "He": _emscripten_glMultiTexCoord4f,
 "Ge": _emscripten_glMultiTexCoord4fv,
 "Fe": _emscripten_glMultiTexCoord4i,
 "Ee": _emscripten_glMultiTexCoord4iv,
 "De": _emscripten_glMultiTexCoord4s,
 "Ce": _emscripten_glMultiTexCoord4sv,
 "Be": _emscripten_glNewList,
 "Ae": _emscripten_glPassThrough,
 "ze": _emscripten_glPixelMapfv,
 "ye": _emscripten_glPixelMapuiv,
 "xe": _emscripten_glPixelMapusv,
 "we": _emscripten_glPixelStoref,
 "ve": _emscripten_glPixelStorei,
 "ue": _emscripten_glPixelTransferf,
 "te": _emscripten_glPixelTransferi,
 "se": _emscripten_glPixelZoom,
 "re": _emscripten_glPointParameterf,
 "qe": _emscripten_glPointParameterfv,
 "pe": _emscripten_glPointParameteri,
 "oe": _emscripten_glPointParameteriv,
 "ne": _emscripten_glPointSize,
 "me": _emscripten_glPolygonOffset,
 "le": _emscripten_glPolygonStipple,
 "ke": _emscripten_glPopAttrib,
 "je": _emscripten_glPopClientAttrib,
 "ie": _emscripten_glPopName,
 "he": _emscripten_glPrimitiveRestartIndex,
 "ge": _emscripten_glPrioritizeTextures,
 "fe": _emscripten_glProgramEnvParameter4dARB,
 "ee": _emscripten_glProgramEnvParameter4dvARB,
 "de": _emscripten_glProgramEnvParameter4fARB,
 "ce": _emscripten_glProgramEnvParameter4fvARB,
 "be": _emscripten_glProgramLocalParameter4dARB,
 "ae": _emscripten_glProgramLocalParameter4dvARB,
 "$d": _emscripten_glProgramLocalParameter4fARB,
 "_d": _emscripten_glProgramLocalParameter4fvARB,
 "Zd": _emscripten_glProgramStringARB,
 "Yd": _emscripten_glPushAttrib,
 "Xd": _emscripten_glPushClientAttrib,
 "Wd": _emscripten_glPushName,
 "Vd": _emscripten_glRasterPos2d,
 "Ud": _emscripten_glRasterPos2dv,
 "Td": _emscripten_glRasterPos2f,
 "Sd": _emscripten_glRasterPos2fv,
 "Rd": _emscripten_glRasterPos2i,
 "Qd": _emscripten_glRasterPos2iv,
 "Pd": _emscripten_glRasterPos2s,
 "Od": _emscripten_glRasterPos2sv,
 "Nd": _emscripten_glRasterPos3d,
 "Md": _emscripten_glRasterPos3dv,
 "Ld": _emscripten_glRasterPos3f,
 "Kd": _emscripten_glRasterPos3fv,
 "Jd": _emscripten_glRasterPos3i,
 "Id": _emscripten_glRasterPos3iv,
 "Hd": _emscripten_glRasterPos3s,
 "Gd": _emscripten_glRasterPos3sv,
 "Fd": _emscripten_glRasterPos4d,
 "Ed": _emscripten_glRasterPos4dv,
 "Dd": _emscripten_glRasterPos4f,
 "Cd": _emscripten_glRasterPos4fv,
 "Bd": _emscripten_glRasterPos4i,
 "Ad": _emscripten_glRasterPos4iv,
 "zd": _emscripten_glRasterPos4s,
 "yd": _emscripten_glRasterPos4sv,
 "xd": _emscripten_glReadPixels,
 "wd": _emscripten_glRectd,
 "vd": _emscripten_glRectdv,
 "ud": _emscripten_glRectf,
 "td": _emscripten_glRectfv,
 "sd": _emscripten_glRecti,
 "rd": _emscripten_glRectiv,
 "qd": _emscripten_glRects,
 "pd": _emscripten_glRectsv,
 "od": _emscripten_glReleaseShaderCompiler,
 "nd": _emscripten_glRenderMode,
 "md": _emscripten_glRenderbufferStorage,
 "ld": _emscripten_glRenderbufferStorageMultisample,
 "kd": _emscripten_glResetHistogram,
 "jd": _emscripten_glResetMinmax,
 "id": _emscripten_glSampleCoverage,
 "hd": _emscripten_glScissor,
 "gd": _emscripten_glSecondaryColor3b,
 "fd": _emscripten_glSecondaryColor3bv,
 "ed": _emscripten_glSecondaryColor3d,
 "dd": _emscripten_glSecondaryColor3dv,
 "cd": _emscripten_glSecondaryColor3f,
 "bd": _emscripten_glSecondaryColor3fv,
 "ad": _emscripten_glSecondaryColor3i,
 "$c": _emscripten_glSecondaryColor3iv,
 "_c": _emscripten_glSecondaryColor3s,
 "Zc": _emscripten_glSecondaryColor3sv,
 "Yc": _emscripten_glSecondaryColor3ub,
 "Xc": _emscripten_glSecondaryColor3ubv,
 "Wc": _emscripten_glSecondaryColor3ui,
 "Vc": _emscripten_glSecondaryColor3uiv,
 "Uc": _emscripten_glSecondaryColor3us,
 "Tc": _emscripten_glSecondaryColor3usv,
 "Sc": _emscripten_glSecondaryColorPointer,
 "Rc": _emscripten_glSelectBuffer,
 "Qc": _emscripten_glSeparableFilter2D,
 "Pc": _emscripten_glShaderBinary,
 "Oc": _emscripten_glShaderSource,
 "Nc": _emscripten_glStencilFunc,
 "Mc": _emscripten_glStencilFuncSeparate,
 "Lc": _emscripten_glStencilMask,
 "Kc": _emscripten_glStencilMaskSeparate,
 "Jc": _emscripten_glStencilOp,
 "Ic": _emscripten_glStencilOpSeparate,
 "Hc": _emscripten_glTexBuffer,
 "Gc": _emscripten_glTexEnvf,
 "Fc": _emscripten_glTexEnvfv,
 "Ec": _emscripten_glTexEnvi,
 "Dc": _emscripten_glTexEnviv,
 "Cc": _emscripten_glTexImage2D,
 "Bc": _emscripten_glTexImage3D,
 "Ac": _emscripten_glTexParameterIiv,
 "zc": _emscripten_glTexParameterIuiv,
 "yc": _emscripten_glTexParameterf,
 "xc": _emscripten_glTexParameterfv,
 "wc": _emscripten_glTexParameteri,
 "vc": _emscripten_glTexParameteriv,
 "uc": _emscripten_glTexStorage2D,
 "tc": _emscripten_glTexStorage3D,
 "sc": _emscripten_glTexSubImage1D,
 "rc": _emscripten_glTexSubImage2D,
 "qc": _emscripten_glTexSubImage3D,
 "pc": _emscripten_glTransformFeedbackVaryings,
 "oc": _emscripten_glUniform1f,
 "nc": _emscripten_glUniform1fv,
 "mc": _emscripten_glUniform1i,
 "lc": _emscripten_glUniform1iv,
 "kc": _emscripten_glUniform1ui,
 "jc": _emscripten_glUniform1uiv,
 "ic": _emscripten_glUniform2f,
 "hc": _emscripten_glUniform2fv,
 "gc": _emscripten_glUniform2i,
 "fc": _emscripten_glUniform2iv,
 "ec": _emscripten_glUniform2ui,
 "dc": _emscripten_glUniform2uiv,
 "cc": _emscripten_glUniform3f,
 "bc": _emscripten_glUniform3fv,
 "ac": _emscripten_glUniform3i,
 "$b": _emscripten_glUniform3iv,
 "_b": _emscripten_glUniform3ui,
 "Zb": _emscripten_glUniform3uiv,
 "Yb": _emscripten_glUniform4f,
 "Xb": _emscripten_glUniform4fv,
 "Wb": _emscripten_glUniform4i,
 "Vb": _emscripten_glUniform4iv,
 "Ub": _emscripten_glUniform4ui,
 "Tb": _emscripten_glUniform4uiv,
 "Sb": _emscripten_glUniformBlockBinding,
 "Rb": _emscripten_glUniformMatrix2fv,
 "Qb": _emscripten_glUniformMatrix2x3fv,
 "Pb": _emscripten_glUniformMatrix2x4fv,
 "Ob": _emscripten_glUniformMatrix3fv,
 "Nb": _emscripten_glUniformMatrix3x2fv,
 "Mb": _emscripten_glUniformMatrix3x4fv,
 "Lb": _emscripten_glUniformMatrix4fv,
 "Kb": _emscripten_glUniformMatrix4x2fv,
 "Jb": _emscripten_glUniformMatrix4x3fv,
 "Ib": _emscripten_glUnmapBuffer,
 "Hb": _emscripten_glUseProgram,
 "Gb": _emscripten_glUseProgramObjectARB,
 "Fb": _emscripten_glValidateProgram,
 "Eb": _emscripten_glVertexAttrib1d,
 "Db": _emscripten_glVertexAttrib1dv,
 "Cb": _emscripten_glVertexAttrib1f,
 "Bb": _emscripten_glVertexAttrib1fv,
 "Ab": _emscripten_glVertexAttrib1s,
 "zb": _emscripten_glVertexAttrib1sv,
 "yb": _emscripten_glVertexAttrib2d,
 "xb": _emscripten_glVertexAttrib2dv,
 "wb": _emscripten_glVertexAttrib2f,
 "vb": _emscripten_glVertexAttrib2fv,
 "ub": _emscripten_glVertexAttrib2s,
 "tb": _emscripten_glVertexAttrib2sv,
 "sb": _emscripten_glVertexAttrib3d,
 "rb": _emscripten_glVertexAttrib3dv,
 "qb": _emscripten_glVertexAttrib3f,
 "pb": _emscripten_glVertexAttrib3fv,
 "ob": _emscripten_glVertexAttrib3s,
 "nb": _emscripten_glVertexAttrib3sv,
 "mb": _emscripten_glVertexAttrib4Nbv,
 "lb": _emscripten_glVertexAttrib4Niv,
 "kb": _emscripten_glVertexAttrib4Nsv,
 "jb": _emscripten_glVertexAttrib4Nub,
 "ib": _emscripten_glVertexAttrib4Nubv,
 "hb": _emscripten_glVertexAttrib4Nuiv,
 "gb": _emscripten_glVertexAttrib4Nusv,
 "fb": _emscripten_glVertexAttrib4bv,
 "eb": _emscripten_glVertexAttrib4d,
 "db": _emscripten_glVertexAttrib4dv,
 "cb": _emscripten_glVertexAttrib4f,
 "bb": _emscripten_glVertexAttrib4fv,
 "ab": _emscripten_glVertexAttrib4iv,
 "$a": _emscripten_glVertexAttrib4s,
 "_a": _emscripten_glVertexAttrib4sv,
 "Za": _emscripten_glVertexAttrib4ubv,
 "Ya": _emscripten_glVertexAttrib4uiv,
 "Xa": _emscripten_glVertexAttrib4usv,
 "Wa": _emscripten_glVertexAttribDivisor,
 "Va": _emscripten_glVertexAttribI1i,
 "Ua": _emscripten_glVertexAttribI1iv,
 "Ta": _emscripten_glVertexAttribI1ui,
 "Sa": _emscripten_glVertexAttribI1uiv,
 "Ra": _emscripten_glVertexAttribI2i,
 "Qa": _emscripten_glVertexAttribI2iv,
 "Pa": _emscripten_glVertexAttribI2ui,
 "Oa": _emscripten_glVertexAttribI2uiv,
 "Na": _emscripten_glVertexAttribI3i,
 "Ma": _emscripten_glVertexAttribI3iv,
 "La": _emscripten_glVertexAttribI3ui,
 "Ka": _emscripten_glVertexAttribI3uiv,
 "Ja": _emscripten_glVertexAttribI4bv,
 "Ia": _emscripten_glVertexAttribI4i,
 "Ha": _emscripten_glVertexAttribI4iv,
 "Ga": _emscripten_glVertexAttribI4sv,
 "Fa": _emscripten_glVertexAttribI4ubv,
 "Ea": _emscripten_glVertexAttribI4ui,
 "Da": _emscripten_glVertexAttribI4uiv,
 "Ca": _emscripten_glVertexAttribI4usv,
 "Ba": _emscripten_glVertexAttribIPointer,
 "Aa": _emscripten_glVertexAttribPointer,
 "za": _emscripten_glViewport,
 "ya": _emscripten_glWindowPos2d,
 "xa": _emscripten_glWindowPos2dv,
 "wa": _emscripten_glWindowPos2f,
 "va": _emscripten_glWindowPos2fv,
 "ua": _emscripten_glWindowPos2i,
 "ta": _emscripten_glWindowPos2iv,
 "sa": _emscripten_glWindowPos2s,
 "ra": _emscripten_glWindowPos2sv,
 "qa": _emscripten_glWindowPos3d,
 "pa": _emscripten_glWindowPos3dv,
 "oa": _emscripten_glWindowPos3f,
 "na": _emscripten_glWindowPos3fv,
 "ma": _emscripten_glWindowPos3i,
 "la": _emscripten_glWindowPos3iv,
 "ka": _emscripten_glWindowPos3s,
 "ja": _emscripten_glWindowPos3sv,
 "ia": _emscripten_memcpy_big,
 "ha": _emscripten_request_fullscreen_strategy,
 "Q": _emscripten_request_pointerlock,
 "ga": _emscripten_resize_heap,
 "P": _emscripten_sample_gamepad_data,
 "O": _emscripten_set_blur_callback_on_thread,
 "l": _emscripten_set_canvas_element_size,
 "r": _emscripten_set_element_css_size,
 "N": _emscripten_set_focus_callback_on_thread,
 "M": _emscripten_set_fullscreenchange_callback_on_thread,
 "o": _emscripten_set_gamepadconnected_callback_on_thread,
 "n": _emscripten_set_gamepaddisconnected_callback_on_thread,
 "L": _emscripten_set_keydown_callback_on_thread,
 "K": _emscripten_set_keypress_callback_on_thread,
 "J": _emscripten_set_keyup_callback_on_thread,
 "fa": _emscripten_set_main_loop,
 "I": _emscripten_set_mousedown_callback_on_thread,
 "H": _emscripten_set_mouseenter_callback_on_thread,
 "G": _emscripten_set_mouseleave_callback_on_thread,
 "F": _emscripten_set_mousemove_callback_on_thread,
 "E": _emscripten_set_mouseup_callback_on_thread,
 "D": _emscripten_set_pointerlockchange_callback_on_thread,
 "C": _emscripten_set_resize_callback_on_thread,
 "B": _emscripten_set_touchcancel_callback_on_thread,
 "A": _emscripten_set_touchend_callback_on_thread,
 "z": _emscripten_set_touchmove_callback_on_thread,
 "y": _emscripten_set_touchstart_callback_on_thread,
 "x": _emscripten_set_visibilitychange_callback_on_thread,
 "w": _emscripten_set_wheel_callback_on_thread,
 "ea": _exit,
 "k": _getenv,
 "q": _gettimeofday,
 "d": _llvm_stackrestore,
 "c": _llvm_stacksave,
 "v": _nanosleep,
 "da": _pthread_cond_wait,
 "f": _sigaction,
 "ca": _signal,
 "ba": _strftime_l,
 "m": _time,
 "aa": abortOnCannotGrowMemory,
 "a": DYNAMICTOP_PTR
};

var asm = Module["asm"](asmGlobalArg, asmLibraryArg, buffer);

Module["asm"] = asm;

var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = function() {
 return Module["asm"]["ol"].apply(null, arguments);
};

var ___errno_location = Module["___errno_location"] = function() {
 return Module["asm"]["pl"].apply(null, arguments);
};

var _emscripten_GetProcAddress = Module["_emscripten_GetProcAddress"] = function() {
 return Module["asm"]["ql"].apply(null, arguments);
};

var _free = Module["_free"] = function() {
 return Module["asm"]["rl"].apply(null, arguments);
};

var _main = Module["_main"] = function() {
 return Module["asm"]["sl"].apply(null, arguments);
};

var _malloc = Module["_malloc"] = function() {
 return Module["asm"]["tl"].apply(null, arguments);
};

var globalCtors = Module["globalCtors"] = function() {
 return Module["asm"]["xm"].apply(null, arguments);
};

var stackAlloc = Module["stackAlloc"] = function() {
 return Module["asm"]["ym"].apply(null, arguments);
};

var stackRestore = Module["stackRestore"] = function() {
 return Module["asm"]["zm"].apply(null, arguments);
};

var stackSave = Module["stackSave"] = function() {
 return Module["asm"]["Am"].apply(null, arguments);
};

var dynCall_i = Module["dynCall_i"] = function() {
 return Module["asm"]["ul"].apply(null, arguments);
};

var dynCall_ii = Module["dynCall_ii"] = function() {
 return Module["asm"]["vl"].apply(null, arguments);
};

var dynCall_iii = Module["dynCall_iii"] = function() {
 return Module["asm"]["wl"].apply(null, arguments);
};

var dynCall_iiii = Module["dynCall_iiii"] = function() {
 return Module["asm"]["xl"].apply(null, arguments);
};

var dynCall_iiiii = Module["dynCall_iiiii"] = function() {
 return Module["asm"]["yl"].apply(null, arguments);
};

var dynCall_iiiiid = Module["dynCall_iiiiid"] = function() {
 return Module["asm"]["zl"].apply(null, arguments);
};

var dynCall_iiiiidii = Module["dynCall_iiiiidii"] = function() {
 return Module["asm"]["Al"].apply(null, arguments);
};

var dynCall_iiiiii = Module["dynCall_iiiiii"] = function() {
 return Module["asm"]["Bl"].apply(null, arguments);
};

var dynCall_iiiiiid = Module["dynCall_iiiiiid"] = function() {
 return Module["asm"]["Cl"].apply(null, arguments);
};

var dynCall_iiiiiii = Module["dynCall_iiiiiii"] = function() {
 return Module["asm"]["Dl"].apply(null, arguments);
};

var dynCall_iiiiiiii = Module["dynCall_iiiiiiii"] = function() {
 return Module["asm"]["El"].apply(null, arguments);
};

var dynCall_iiiiiiiii = Module["dynCall_iiiiiiiii"] = function() {
 return Module["asm"]["Fl"].apply(null, arguments);
};

var dynCall_iiiiiiiiii = Module["dynCall_iiiiiiiiii"] = function() {
 return Module["asm"]["Gl"].apply(null, arguments);
};

var dynCall_iiiiij = Module["dynCall_iiiiij"] = function() {
 return Module["asm"]["Hl"].apply(null, arguments);
};

var dynCall_ji = Module["dynCall_ji"] = function() {
 return Module["asm"]["Il"].apply(null, arguments);
};

var dynCall_jiji = Module["dynCall_jiji"] = function() {
 return Module["asm"]["Jl"].apply(null, arguments);
};

var dynCall_v = Module["dynCall_v"] = function() {
 return Module["asm"]["Kl"].apply(null, arguments);
};

var dynCall_vd = Module["dynCall_vd"] = function() {
 return Module["asm"]["Ll"].apply(null, arguments);
};

var dynCall_vdd = Module["dynCall_vdd"] = function() {
 return Module["asm"]["Ml"].apply(null, arguments);
};

var dynCall_vddd = Module["dynCall_vddd"] = function() {
 return Module["asm"]["Nl"].apply(null, arguments);
};

var dynCall_vdddd = Module["dynCall_vdddd"] = function() {
 return Module["asm"]["Ol"].apply(null, arguments);
};

var dynCall_vf = Module["dynCall_vf"] = function() {
 return Module["asm"]["Pl"].apply(null, arguments);
};

var dynCall_vff = Module["dynCall_vff"] = function() {
 return Module["asm"]["Ql"].apply(null, arguments);
};

var dynCall_vfff = Module["dynCall_vfff"] = function() {
 return Module["asm"]["Rl"].apply(null, arguments);
};

var dynCall_vffff = Module["dynCall_vffff"] = function() {
 return Module["asm"]["Sl"].apply(null, arguments);
};

var dynCall_vfi = Module["dynCall_vfi"] = function() {
 return Module["asm"]["Tl"].apply(null, arguments);
};

var dynCall_vi = Module["dynCall_vi"] = function() {
 return Module["asm"]["Ul"].apply(null, arguments);
};

var dynCall_vid = Module["dynCall_vid"] = function() {
 return Module["asm"]["Vl"].apply(null, arguments);
};

var dynCall_vidd = Module["dynCall_vidd"] = function() {
 return Module["asm"]["Wl"].apply(null, arguments);
};

var dynCall_viddd = Module["dynCall_viddd"] = function() {
 return Module["asm"]["Xl"].apply(null, arguments);
};

var dynCall_vidddd = Module["dynCall_vidddd"] = function() {
 return Module["asm"]["Yl"].apply(null, arguments);
};

var dynCall_viddidd = Module["dynCall_viddidd"] = function() {
 return Module["asm"]["Zl"].apply(null, arguments);
};

var dynCall_viddiiddiii = Module["dynCall_viddiiddiii"] = function() {
 return Module["asm"]["_l"].apply(null, arguments);
};

var dynCall_viddiii = Module["dynCall_viddiii"] = function() {
 return Module["asm"]["$l"].apply(null, arguments);
};

var dynCall_vif = Module["dynCall_vif"] = function() {
 return Module["asm"]["am"].apply(null, arguments);
};

var dynCall_viff = Module["dynCall_viff"] = function() {
 return Module["asm"]["bm"].apply(null, arguments);
};

var dynCall_vifff = Module["dynCall_vifff"] = function() {
 return Module["asm"]["cm"].apply(null, arguments);
};

var dynCall_viffff = Module["dynCall_viffff"] = function() {
 return Module["asm"]["dm"].apply(null, arguments);
};

var dynCall_viffiff = Module["dynCall_viffiff"] = function() {
 return Module["asm"]["em"].apply(null, arguments);
};

var dynCall_viffiiffiii = Module["dynCall_viffiiffiii"] = function() {
 return Module["asm"]["fm"].apply(null, arguments);
};

var dynCall_viffiii = Module["dynCall_viffiii"] = function() {
 return Module["asm"]["gm"].apply(null, arguments);
};

var dynCall_vii = Module["dynCall_vii"] = function() {
 return Module["asm"]["hm"].apply(null, arguments);
};

var dynCall_viidddd = Module["dynCall_viidddd"] = function() {
 return Module["asm"]["im"].apply(null, arguments);
};

var dynCall_viif = Module["dynCall_viif"] = function() {
 return Module["asm"]["jm"].apply(null, arguments);
};

var dynCall_viiffff = Module["dynCall_viiffff"] = function() {
 return Module["asm"]["km"].apply(null, arguments);
};

var dynCall_viiffffi = Module["dynCall_viiffffi"] = function() {
 return Module["asm"]["lm"].apply(null, arguments);
};

var dynCall_viifi = Module["dynCall_viifi"] = function() {
 return Module["asm"]["mm"].apply(null, arguments);
};

var dynCall_viii = Module["dynCall_viii"] = function() {
 return Module["asm"]["nm"].apply(null, arguments);
};

var dynCall_viiii = Module["dynCall_viiii"] = function() {
 return Module["asm"]["om"].apply(null, arguments);
};

var dynCall_viiiii = Module["dynCall_viiiii"] = function() {
 return Module["asm"]["pm"].apply(null, arguments);
};

var dynCall_viiiiii = Module["dynCall_viiiiii"] = function() {
 return Module["asm"]["qm"].apply(null, arguments);
};

var dynCall_viiiiiii = Module["dynCall_viiiiiii"] = function() {
 return Module["asm"]["rm"].apply(null, arguments);
};

var dynCall_viiiiiiii = Module["dynCall_viiiiiiii"] = function() {
 return Module["asm"]["sm"].apply(null, arguments);
};

var dynCall_viiiiiiiii = Module["dynCall_viiiiiiiii"] = function() {
 return Module["asm"]["tm"].apply(null, arguments);
};

var dynCall_viiiiiiiiii = Module["dynCall_viiiiiiiiii"] = function() {
 return Module["asm"]["um"].apply(null, arguments);
};

var dynCall_viiiiiiiiiii = Module["dynCall_viiiiiiiiiii"] = function() {
 return Module["asm"]["vm"].apply(null, arguments);
};

var dynCall_viijii = Module["dynCall_viijii"] = function() {
 return Module["asm"]["wm"].apply(null, arguments);
};

Module["asm"] = asm;

Module["getMemory"] = getMemory;

Module["addRunDependency"] = addRunDependency;

Module["removeRunDependency"] = removeRunDependency;

Module["FS_createFolder"] = FS.createFolder;

Module["FS_createPath"] = FS.createPath;

Module["FS_createDataFile"] = FS.createDataFile;

Module["FS_createPreloadedFile"] = FS.createPreloadedFile;

Module["FS_createLazyFile"] = FS.createLazyFile;

Module["FS_createLink"] = FS.createLink;

Module["FS_createDevice"] = FS.createDevice;

Module["FS_unlink"] = FS.unlink;

function ExitStatus(status) {
 this.name = "ExitStatus";
 this.message = "Program terminated with exit(" + status + ")";
 this.status = status;
}

ExitStatus.prototype = new Error();

ExitStatus.prototype.constructor = ExitStatus;

var calledMain = false;

dependenciesFulfilled = function runCaller() {
 if (!Module["calledRun"]) run();
 if (!Module["calledRun"]) dependenciesFulfilled = runCaller;
};

Module["callMain"] = function callMain(args) {
 args = args || [];
 ensureInitRuntime();
 var argc = args.length + 1;
 var argv = stackAlloc((argc + 1) * 4);
 HEAP32[argv >> 2] = allocateUTF8OnStack(Module["thisProgram"]);
 for (var i = 1; i < argc; i++) {
  HEAP32[(argv >> 2) + i] = allocateUTF8OnStack(args[i - 1]);
 }
 HEAP32[(argv >> 2) + argc] = 0;
 try {
  var ret = Module["_main"](argc, argv, 0);
  exit(ret, true);
 } catch (e) {
  if (e instanceof ExitStatus) {
   return;
  } else if (e == "SimulateInfiniteLoop") {
   Module["noExitRuntime"] = true;
   return;
  } else {
   var toLog = e;
   if (e && typeof e === "object" && e.stack) {
    toLog = [ e, e.stack ];
   }
   err("exception thrown: " + toLog);
   Module["quit"](1, e);
  }
 } finally {
  calledMain = true;
 }
};

function run(args) {
 args = args || Module["arguments"];
 if (runDependencies > 0) {
  return;
 }
 preRun();
 if (runDependencies > 0) return;
 if (Module["calledRun"]) return;
 function doRun() {
  if (Module["calledRun"]) return;
  Module["calledRun"] = true;
  if (ABORT) return;
  ensureInitRuntime();
  preMain();
  if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
  if (Module["_main"] && shouldRunNow) Module["callMain"](args);
  postRun();
 }
 if (Module["setStatus"]) {
  Module["setStatus"]("Running...");
  setTimeout(function() {
   setTimeout(function() {
    Module["setStatus"]("");
   }, 1);
   doRun();
  }, 1);
 } else {
  doRun();
 }
}

Module["run"] = run;

function exit(status, implicit) {
 if (implicit && Module["noExitRuntime"] && status === 0) {
  return;
 }
 if (Module["noExitRuntime"]) {} else {
  ABORT = true;
  EXITSTATUS = status;
  exitRuntime();
  if (Module["onExit"]) Module["onExit"](status);
 }
 Module["quit"](status, new ExitStatus(status));
}

function abort(what) {
 if (Module["onAbort"]) {
  Module["onAbort"](what);
 }
 if (what !== undefined) {
  out(what);
  err(what);
  what = JSON.stringify(what);
 } else {
  what = "";
 }
 ABORT = true;
 EXITSTATUS = 1;
 throw "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
}

Module["abort"] = abort;

if (Module["preInit"]) {
 if (typeof Module["preInit"] == "function") Module["preInit"] = [ Module["preInit"] ];
 while (Module["preInit"].length > 0) {
  Module["preInit"].pop()();
 }
}

var shouldRunNow = true;

if (Module["noInitialRun"]) {
 shouldRunNow = false;
}

Module["noExitRuntime"] = true;

run();
