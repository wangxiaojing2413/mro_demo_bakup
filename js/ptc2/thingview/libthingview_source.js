var Module = typeof Module !== "undefined" ? Module: {};
var moduleOverrides = {};
var key;
for (key in Module) {
    if (Module.hasOwnProperty(key)) {
        moduleOverrides[key] = Module[key]
    }
}
Module["arguments"] = [];
Module["thisProgram"] = "./this.program";
Module["quit"] = function(status, toThrow) {
    throw toThrow
};
Module["preRun"] = [];
Module["postRun"] = [];
var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === "object";
ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
ENVIRONMENT_HAS_NODE = typeof process === "object" && typeof require === "function";
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
var scriptDirectory = "";
function locateFile(path) {
    if (Module["locateFile"]) {
        return Module["locateFile"](path, scriptDirectory)
    } else {
        return scriptDirectory + path
    }
}
if (ENVIRONMENT_IS_NODE) {
    scriptDirectory = __dirname + "/";
    var nodeFS;
    var nodePath;
    Module["read"] = function shell_read(filename, binary) {
        var ret;
        ret = tryParseAsDataURI(filename);
        if (!ret) {
            if (!nodeFS) nodeFS = require("fs");
            if (!nodePath) nodePath = require("path");
            filename = nodePath["normalize"](filename);
            ret = nodeFS["readFileSync"](filename)
        }
        return binary ? ret: ret.toString()
    };
    Module["readBinary"] = function readBinary(filename) {
        var ret = Module["read"](filename, true);
        if (!ret.buffer) {
            ret = new Uint8Array(ret)
        }
        assert(ret.buffer);
        return ret
    };
    if (process["argv"].length > 1) {
        Module["thisProgram"] = process["argv"][1].replace(/\\/g, "/")
    }
    Module["arguments"] = process["argv"].slice(2);
    if (typeof module !== "undefined") {
        module["exports"] = Module
    }
    process["on"]("uncaughtException",
        function(ex) {
            if (! (ex instanceof ExitStatus)) {
                throw ex
            }
        });
    process["on"]("unhandledRejection", abort);
    Module["quit"] = function(status) {
        process["exit"](status)
    };
    Module["inspect"] = function() {
        return "[Emscripten Module object]"
    }
} else if (ENVIRONMENT_IS_SHELL) {
    if (typeof read != "undefined") {
        Module["read"] = function shell_read(f) {
            var data = tryParseAsDataURI(f);
            if (data) {
                return intArrayToString(data)
            }
            return read(f)
        }
    }
    Module["readBinary"] = function readBinary(f) {
        var data;
        data = tryParseAsDataURI(f);
        if (data) {
            return data
        }
        if (typeof readbuffer === "function") {
            return new Uint8Array(readbuffer(f))
        }
        data = read(f, "binary");
        assert(typeof data === "object");
        return data
    };
    if (typeof scriptArgs != "undefined") {
        Module["arguments"] = scriptArgs
    } else if (typeof arguments != "undefined") {
        Module["arguments"] = arguments
    }
    if (typeof quit === "function") {
        Module["quit"] = function(status) {
            quit(status)
        }
    }
} else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href
    } else if (document.currentScript) {
        scriptDirectory = document.currentScript.src
    }
    if (scriptDirectory.indexOf("blob:") !== 0) {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
    } else {
        scriptDirectory = ""
    }
    Module["read"] = function shell_read(url) {
        try {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.send(null);
            return xhr.responseText
        } catch(err) {
            var data = tryParseAsDataURI(url);
            if (data) {
                return intArrayToString(data)
            }
            throw err
        }
    };
    if (ENVIRONMENT_IS_WORKER) {
        Module["readBinary"] = function readBinary(url) {
            try {
                var xhr = new XMLHttpRequest;
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response)
            } catch(err) {
                var data = tryParseAsDataURI(url);
                if (data) {
                    return data
                }
                throw err
            }
        }
    }
    Module["readAsync"] = function readAsync(url, onload, onerror) {
        var xhr = new XMLHttpRequest;
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = function xhr_onload() {
            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                onload(xhr.response);
                return
            }
            var data = tryParseAsDataURI(url);
            if (data) {
                onload(data.buffer);
                return
            }
            onerror()
        };
        xhr.onerror = onerror;
        xhr.send(null)
    };
    Module["setWindowTitle"] = function(title) {
        document.title = title
    }
} else {}
var out = Module["print"] || (typeof console !== "undefined" ? console.log.bind(console) : typeof print !== "undefined" ? print: null);
var err = Module["printErr"] || (typeof printErr !== "undefined" ? printErr: typeof console !== "undefined" && console.warn.bind(console) || out);
for (key in moduleOverrides) {
    if (moduleOverrides.hasOwnProperty(key)) {
        Module[key] = moduleOverrides[key]
    }
}
moduleOverrides = undefined;
var STACK_ALIGN = 16;
function dynamicAlloc(size) {
    var ret = HEAP32[DYNAMICTOP_PTR >> 2];
    var end = ret + size + 15 & -16;
    if (end > _emscripten_get_heap_size()) {
        abort()
    }
    HEAP32[DYNAMICTOP_PTR >> 2] = end;
    return ret
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
                return 4
            } else if (type[0] === "i") {
                var bits = parseInt(type.substr(1));
                assert(bits % 8 === 0, "getNativeTypeSize invalid bits " + bits + ", type " + type);
                return bits / 8
            } else {
                return 0
            }
        }
    }
}
function warnOnce(text) {
    if (!warnOnce.shown) warnOnce.shown = {};
    if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text)
    }
}
var jsCallStartIndex = 1;
var functionPointers = new Array(0);
var funcWrappers = {};
function getFuncWrapper(func, sig) {
    if (!func) return;
    assert(sig);
    if (!funcWrappers[sig]) {
        funcWrappers[sig] = {}
    }
    var sigCache = funcWrappers[sig];
    if (!sigCache[func]) {
        if (sig.length === 1) {
            sigCache[func] = function dynCall_wrapper() {
                return dynCall(sig, func)
            }
        } else if (sig.length === 2) {
            sigCache[func] = function dynCall_wrapper(arg) {
                return dynCall(sig, func, [arg])
            }
        } else {
            sigCache[func] = function dynCall_wrapper() {
                return dynCall(sig, func, Array.prototype.slice.call(arguments))
            }
        }
    }
    return sigCache[func]
}
function dynCall(sig, ptr, args) {
    if (args && args.length) {
        return Module["dynCall_" + sig].apply(null, [ptr].concat(args))
    } else {
        return Module["dynCall_" + sig].call(null, ptr)
    }
}
var tempRet0 = 0;
var setTempRet0 = function(value) {
    tempRet0 = value
};
var getTempRet0 = function() {
    return tempRet0
};
var GLOBAL_BASE = 8;
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
            tempI64 = [value >>> 0, (tempDouble = value, +Math_abs(tempDouble) >= +1 ? tempDouble > +0 ? (Math_min( + Math_floor(tempDouble / +4294967296), +4294967295) | 0) >>> 0 : ~~ + Math_ceil((tempDouble - +(~~tempDouble >>> 0)) / +4294967296) >>> 0 : 0)],
                HEAP32[ptr >> 2] = tempI64[0],
                HEAP32[ptr + 4 >> 2] = tempI64[1];
            break;
        case "float":
            HEAPF32[ptr >> 2] = value;
            break;
        case "double":
            HEAPF64[ptr >> 3] = value;
            break;
        default:
            abort("invalid type for setValue: " + type)
    }
}
function getValue(ptr, type, noSafe) {
    type = type || "i8";
    if (type.charAt(type.length - 1) === "*") type = "i32";
    switch (type) {
        case "i1":
            return HEAP8[ptr >> 0];
        case "i8":
            return HEAP8[ptr >> 0];
        case "i16":
            return HEAP16[ptr >> 1];
        case "i32":
            return HEAP32[ptr >> 2];
        case "i64":
            return HEAP32[ptr >> 2];
        case "float":
            return HEAPF32[ptr >> 2];
        case "double":
            return HEAPF64[ptr >> 3];
        default:
            abort("invalid type for getValue: " + type)
    }
    return null
}
var ABORT = false;
var EXITSTATUS = 0;
function assert(condition, text) {
    if (!condition) {
        abort("Assertion failed: " + text)
    }
}
function getCFunc(ident) {
    var func = Module["_" + ident];
    assert(func, "Cannot call unknown function " + ident + ", make sure it is exported");
    return func
}
function ccall(ident, returnType, argTypes, args, opts) {
    var toC = {
        "string": function(str) {
            var ret = 0;
            if (str !== null && str !== undefined && str !== 0) {
                var len = (str.length << 2) + 1;
                ret = stackAlloc(len);
                stringToUTF8(str, ret, len)
            }
            return ret
        },
        "array": function(arr) {
            var ret = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret);
            return ret
        }
    };
    function convertReturnValue(ret) {
        if (returnType === "string") return UTF8ToString(ret);
        if (returnType === "boolean") return Boolean(ret);
        return ret
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    if (args) {
        for (var i = 0; i < args.length; i++) {
            var converter = toC[argTypes[i]];
            if (converter) {
                if (stack === 0) stack = stackSave();
                cArgs[i] = converter(args[i])
            } else {
                cArgs[i] = args[i]
            }
        }
    }
    var ret = func.apply(null, cArgs);
    ret = convertReturnValue(ret);
    if (stack !== 0) stackRestore(stack);
    return ret
}
var ALLOC_NORMAL = 0;
var ALLOC_NONE = 3;
function allocate(slab, types, allocator, ptr) {
    var zeroinit, size;
    if (typeof slab === "number") {
        zeroinit = true;
        size = slab
    } else {
        zeroinit = false;
        size = slab.length
    }
    var singleType = typeof types === "string" ? types: null;
    var ret;
    if (allocator == ALLOC_NONE) {
        ret = ptr
    } else {
        ret = [_malloc, stackAlloc, dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length))
    }
    if (zeroinit) {
        var stop;
        ptr = ret;
        assert((ret & 3) == 0);
        stop = ret + (size & ~3);
        for (; ptr < stop; ptr += 4) {
            HEAP32[ptr >> 2] = 0
        }
        stop = ret + size;
        while (ptr < stop) {
            HEAP8[ptr++>>0] = 0
        }
        return ret
    }
    if (singleType === "i8") {
        if (slab.subarray || slab.slice) {
            HEAPU8.set(slab, ret)
        } else {
            HEAPU8.set(new Uint8Array(slab), ret)
        }
        return ret
    }
    var i = 0,
        type, typeSize, previousType;
    while (i < size) {
        var curr = slab[i];
        type = singleType || types[i];
        if (type === 0) {
            i++;
            continue
        }
        if (type == "i64") type = "i32";
        setValue(ret + i, curr, type);
        if (previousType !== type) {
            typeSize = getNativeTypeSize(type);
            previousType = type
        }
        i += typeSize
    }
    return ret
}
function getMemory(size) {
    if (!runtimeInitialized) return dynamicAlloc(size);
    return _malloc(size)
}
var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (u8Array[endPtr] && !(endPtr >= endIdx))++endPtr;
    if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
        return UTF8Decoder.decode(u8Array.subarray(idx, endPtr))
    } else {
        var str = "";
        while (idx < endPtr) {
            var u0 = u8Array[idx++];
            if (! (u0 & 128)) {
                str += String.fromCharCode(u0);
                continue
            }
            var u1 = u8Array[idx++] & 63;
            if ((u0 & 224) == 192) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue
            }
            var u2 = u8Array[idx++] & 63;
            if ((u0 & 240) == 224) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2
            } else {
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | u8Array[idx++] & 63
            }
            if (u0 < 65536) {
                str += String.fromCharCode(u0)
            } else {
                var ch = u0 - 65536;
                str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
            }
        }
    }
    return str
}
function UTF8ToString(ptr, maxBytesToRead) {
    return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
}
function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
    if (! (maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023
        }
        if (u <= 127) {
            if (outIdx >= endIdx) break;
            outU8Array[outIdx++] = u
        } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            outU8Array[outIdx++] = 192 | u >> 6;
            outU8Array[outIdx++] = 128 | u & 63
        } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            outU8Array[outIdx++] = 224 | u >> 12;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        } else {
            if (outIdx + 3 >= endIdx) break;
            outU8Array[outIdx++] = 240 | u >> 18;
            outU8Array[outIdx++] = 128 | u >> 12 & 63;
            outU8Array[outIdx++] = 128 | u >> 6 & 63;
            outU8Array[outIdx++] = 128 | u & 63
        }
    }
    outU8Array[outIdx] = 0;
    return outIdx - startIdx
}
function stringToUTF8(str, outPtr, maxBytesToWrite) {
    return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
}
function lengthBytesUTF8(str) {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
        if (u <= 127)++len;
        else if (u <= 2047) len += 2;
        else if (u <= 65535) len += 3;
        else len += 4
    }
    return len
}
var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;
function allocateUTF8(str) {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8Array(str, HEAP8, ret, size);
    return ret
}
function writeArrayToMemory(array, buffer) {
    HEAP8.set(array, buffer)
}
function writeAsciiToMemory(str, buffer, dontAddNull) {
    for (var i = 0; i < str.length; ++i) {
        HEAP8[buffer++>>0] = str.charCodeAt(i)
    }
    if (!dontAddNull) HEAP8[buffer >> 0] = 0
}
function demangle(func) {
    return func
}
function demangleAll(text) {
    var regex = /__Z[\w\d_]+/g;
    return text.replace(regex,
        function(x) {
            var y = demangle(x);
            return x === y ? x: y + " [" + x + "]"
        })
}
function jsStackTrace() {
    var err = new Error;
    if (!err.stack) {
        try {
            throw new Error(0)
        } catch(e) {
            err = e
        }
        if (!err.stack) {
            return "(no stack trace available)"
        }
    }
    return err.stack.toString()
}
function stackTrace() {
    var js = jsStackTrace();
    if (Module["extraStackTrace"]) js += "\n" + Module["extraStackTrace"]();
    return demangleAll(js)
}
function alignUp(x, multiple) {
    if (x % multiple > 0) {
        x += multiple - x % multiple
    }
    return x
}
var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
function updateGlobalBufferViews() {
    Module["HEAP8"] = HEAP8 = new Int8Array(buffer);
    Module["HEAP16"] = HEAP16 = new Int16Array(buffer);
    Module["HEAP32"] = HEAP32 = new Int32Array(buffer);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(buffer);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(buffer);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(buffer);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(buffer);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(buffer)
}
var STACK_BASE = 944080,
    DYNAMIC_BASE = 6186960,
    DYNAMICTOP_PTR = 944048;
var TOTAL_STACK = 5242880;
var INITIAL_TOTAL_MEMORY = Module["TOTAL_MEMORY"] || 16777216;
if (INITIAL_TOTAL_MEMORY < TOTAL_STACK) err("TOTAL_MEMORY should be larger than TOTAL_STACK, was " + INITIAL_TOTAL_MEMORY + "! (TOTAL_STACK=" + TOTAL_STACK + ")");
if (Module["buffer"]) {
    buffer = Module["buffer"]
} else {
    {
        buffer = new ArrayBuffer(INITIAL_TOTAL_MEMORY)
    }
}
updateGlobalBufferViews();
HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE;
function callRuntimeCallbacks(callbacks) {
    while (callbacks.length > 0) {
        var callback = callbacks.shift();
        if (typeof callback == "function") {
            callback();
            continue
        }
        var func = callback.func;
        if (typeof func === "number") {
            if (callback.arg === undefined) {
                Module["dynCall_v"](func)
            } else {
                Module["dynCall_vi"](func, callback.arg)
            }
        } else {
            func(callback.arg === undefined ? null: callback.arg)
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
        if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
        while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPRERUN__)
}
function ensureInitRuntime() {
    if (runtimeInitialized) return;
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    TTY.init();
    callRuntimeCallbacks(__ATINIT__)
}
function preMain() {
    FS.ignorePermissions = false;
    callRuntimeCallbacks(__ATMAIN__)
}
function exitRuntime() {
    runtimeExited = true
}
function postRun() {
    if (Module["postRun"]) {
        if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
        while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift())
        }
    }
    callRuntimeCallbacks(__ATPOSTRUN__)
}
function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb)
}
function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb)
}
if (!Math.imul || Math.imul(4294967295, 5) !== -5) Math.imul = function imul(a, b) {
    var ah = a >>> 16;
    var al = a & 65535;
    var bh = b >>> 16;
    var bl = b & 65535;
    return al * bl + (ah * bl + al * bh << 16) | 0
};
if (!Math.clz32) Math.clz32 = function(x) {
    var n = 32;
    var y = x >> 16;
    if (y) {
        n -= 16;
        x = y
    }
    y = x >> 8;
    if (y) {
        n -= 8;
        x = y
    }
    y = x >> 4;
    if (y) {
        n -= 4;
        x = y
    }
    y = x >> 2;
    if (y) {
        n -= 2;
        x = y
    }
    y = x >> 1;
    if (y) return n - 2;
    return n - x
};
if (!Math.trunc) Math.trunc = function(x) {
    return x < 0 ? Math.ceil(x) : Math.floor(x)
};
var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_min = Math.min;
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null;
function getUniqueRunDependency(id) {
    return id
}
function addRunDependency(id) {
    runDependencies++;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
}
function removeRunDependency(id) {
    runDependencies--;
    if (Module["monitorRunDependencies"]) {
        Module["monitorRunDependencies"](runDependencies)
    }
    if (runDependencies == 0) {
        if (runDependencyWatcher !== null) {
            clearInterval(runDependencyWatcher);
            runDependencyWatcher = null
        }
        if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback()
        }
    }
}
Module["preloadedImages"] = {};
Module["preloadedAudios"] = {};
var memoryInitializer = null;
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(filename) {
    return String.prototype.startsWith ? filename.startsWith(dataURIPrefix) : filename.indexOf(dataURIPrefix) === 0
}
var ASM_CONSTS = [function($0) {
    var http = Browser.wgetRequests[$0];
    if (http) {
        http.abort();
        delete Browser.wgetRequests[$0]
    }
},
    function($0, $1) {
        var _text = UTF8ToString($0);
        var _bbox = $1;
        var d = document.createElement("span");
        d.innerHTML = _text;
        d.style.display = "inline-table";
        document.body.appendChild(d);
        setValue(_bbox + 0, d.offsetWidth, "i16");
        setValue(_bbox + 2, d.offsetHeight, "i16");
        document.body.removeChild(d)
    },
    function($0, $1, $2, $3, $4) {
        var _text = UTF8ToString($0);
        var _textBoxWidth = getValue($1 + 0, "i16");
        var _textBoxHeight = getValue($1 + 2, "i16");
        var _id = getValue($1 + 4, "i16");
        var _buf = $2;
        var _this = $3;
        var _ccallback = $4;
        var data = '<svg xmlns="http://www.w3.org/2000/svg" width="' + _textBoxWidth + '" height="' + _textBoxHeight + '">' + '<foreignObject width="100%" height="100%">' + '<div xmlns="http://www.w3.org/1999/xhtml">\n' + _text + "</div>" + "</foreignObject>" + "</svg>";
        data = encodeURIComponent(data);
        var img = new Image;
        img.src = "data:image/svg+xml," + data;
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = _textBoxWidth;
            canvas.height = _textBoxHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var imageData = ctx.getImageData(0, 0, _textBoxWidth, _textBoxHeight);
            var nDataBytes = imageData.data.length * imageData.data.BYTES_PER_ELEMENT;
            var dataHeap = new Uint8Array(nDataBytes);
            dataHeap.set(new Uint8Array(imageData.data.buffer));
            writeArrayToMemory(dataHeap, _buf);
            dynCall("vii", _ccallback, [_this, _id])
        }
    },
    function($0, $1, $2, $3) {
        var _text = UTF8ToString($0);
        var _font = UTF8ToString($1);
        var _fontSize = $2;
        var _bbox = $3;
        var d = document.createElement("span");
        d.style.fontSize = _fontSize + "px";
        d.style.fontFamily = _font;
        d.textContent = _text;
        document.body.appendChild(d);
        setValue(_bbox + 0, d.offsetWidth, "i16");
        setValue(_bbox + 2, d.offsetHeight, "i16");
        document.body.removeChild(d)
    },
    function($0, $1, $2, $3, $4, $5, $6, $7) {
        var _text = UTF8ToString($0);
        var _textColorR = getValue($1 + 0, "i16");
        var _textColorG = getValue($1 + 2, "i16");
        var _textColorB = getValue($1 + 4, "i16");
        var _textColorA = getValue($1 + 6, "i16");
        var _fillColorR = getValue($2 + 0, "i16");
        var _fillColorG = getValue($2 + 2, "i16");
        var _fillColorB = getValue($2 + 4, "i16");
        var _fillColorA = getValue($2 + 6, "i16");
        var _font = UTF8ToString($3);
        var _fontSize = $4;
        var _textBoxWidth = getValue($5 + 0, "i32");
        var _textBoxHeight = getValue($5 + 4, "i32");
        var _lineHeight = $6;
        var _buf = $7;
        var canvas = document.createElement("canvas");
        canvas.width = _textBoxWidth;
        canvas.height = _textBoxHeight;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(" + _fillColorR + ", " + _fillColorG + ", " + _fillColorB + ", " + _fillColorA / 255 + ")";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(" + _textColorR + ", " + _textColorG + ", " + _textColorB + ", " + _textColorA / 255 + ")";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = _fontSize + "px " + _font;
        var x = _fontSize / 2;
        var y = _fontSize / 2 + _lineHeight / 2;
        var cars = _text.split("\n");
        for (var line = 0; line < cars.length; line++) {
            ctx.fillText(cars[line], x, y);
            y += _lineHeight
        }
        var imageData = ctx.getImageData(0, 0, _textBoxWidth, _textBoxHeight);
        var nDataBytes = imageData.data.length * imageData.data.BYTES_PER_ELEMENT;
        var dataHeap = new Uint8Array(nDataBytes);
        dataHeap.set(new Uint8Array(imageData.data.buffer));
        writeArrayToMemory(dataHeap, _buf)
    },
    function($0, $1, $2, $3, $4, $5, $6) {
        var _request = UTF8ToString($0);
        var _url = UTF8ToString($1);
        var _cross = $2;
        var _arg = $3;
        var _onLoad = $4;
        var _onError = $5;
        var _onProgress = $6;
        var http = new XMLHttpRequest;
        http.open(_request, _url, true);
        http.responseType = "arraybuffer";
        if (_cross) {
            http.withCredentials = true
        }
        var handle = Browser.getNextWgetRequestHandle();
        http.onabort = function http_onabort(e) {
            delete Browser.wgetRequests[handle]
        };
        http.onerror = function http_onerror(e) {
            if (_onError) {
                var header = http.getAllResponseHeaders();
                var statusTextLength = lengthBytesUTF8(http.statusText) + 1;
                var statusTextBuffer = _malloc(statusTextLength);
                stringToUTF8(http.statusText, statusTextBuffer, statusTextLength);
                var headerLength = lengthBytesUTF8(header) + 1;
                var headerBuffer = _malloc(headerLength);
                stringToUTF8(header, headerBuffer, headerLength);
                dynCall("viiii", _onError, [_arg, http.status, statusTextBuffer, headerBuffer]);
                _free(statusTextBuffer);
                _free(headerBuffer)
            }
            delete Browser.wgetRequests[handle]
        };
        http.onprogress = function http_onprogress(e) {
            if (_onProgress) {
                var _total = e.lengthComputable || e.lengthComputable === undefined ? e.total: 0;
                dynCall("viii", _onProgress, [_arg, e.loaded, _total])
            }
        };
        http.onload = function http_onload(e) {
            if (http.status < 400) {
                if (_onLoad) {
                    var contentLength = Number(http.getResponseHeader("Content-Length"));
                    var contentRangeBegin = -1;
                    var contentRangeEnd = -1;
                    var contentRangeTotal = -1;
                    var responseLength = http.response.byteLength;
                    if (http.status == 206) {
                        var contentRange = http.getResponseHeader("Content-Range");
                        if (contentRange && contentRange.beginsWith("bytes ")) {
                            var loc1 = 6;
                            var loc2 = contentRange.indexOf("-");
                            var loc3 = contentRange.indexOf("/");
                            var loc4 = contentRange.length;
                            if (loc1 < loc2 && loc2 < loc3 && loc3 < loc4) {
                                contentRangeBegin = Number(contentRange.slice(loc1, loc2));
                                contentRangeEnd = Number(contentRange.slice(loc2 + 1, loc3));
                                contentRangeTotal = Number(contentRange.slice(loc3 + 1, loc4))
                            }
                        }
                    }
                    var header = http.getAllResponseHeaders();
                    var statusTextLength = lengthBytesUTF8(http.statusText) + 1;
                    var statusTextBuffer = _malloc(statusTextLength);
                    stringToUTF8(http.statusText, statusTextBuffer, statusTextLength);
                    var headerLength = lengthBytesUTF8(header) + 1;
                    var headerBuffer = _malloc(headerLength);
                    stringToUTF8(header, headerBuffer, headerLength);
                    dynCall("viiiiiiiii", _onLoad, [_arg, responseLength, contentLength, contentRangeBegin, contentRangeEnd, contentRangeTotal, http.status, statusTextBuffer, headerBuffer]);
                    _free(statusTextBuffer);
                    _free(headerBuffer)
                }
            } else if (_onError) {
                var header = http.getAllResponseHeaders();
                var statusTextLength = lengthBytesUTF8(http.statusText) + 1;
                var statusTextBuffer = _malloc(statusTextLength);
                stringToUTF8(http.statusText, statusTextBuffer, statusTextLength);
                var headerLength = lengthBytesUTF8(header) + 1;
                var headerBuffer = _malloc(headerLength);
                stringToUTF8(header, headerBuffer, headerLength);
                dynCall("viiii", _onError, [_arg, http.status, statusTextBuffer, headerBuffer]);
                _free(statusTextBuffer);
                _free(headerBuffer)
            }
            delete Browser.wgetRequests[handle]
        };
        try {
            if (http.channel instanceof Ci.nsIHttpChannel) http.channel.redirectionLimit = 0
        } catch(ex) {}
        Browser.wgetRequests[handle] = http;
        return handle
    },
    function($0, $1) {
        var http = Browser.wgetRequests[$0];
        if (http) {
            var _requestBody = UTF8ToString($1);
            if (_requestBody & _requestBody.length > 0) {
                http.send(_requestBody)
            } else {
                http.send(null)
            }
        }
    },
    function($0, $1, $2) {
        var http = Browser.wgetRequests[$0];
        if (http) {
            var _field = UTF8ToString($1);
            var _value = UTF8ToString($2);
            http.setRequestHeader(_field, _value)
        }
    },
    function($0, $1) {
        var http = Browser.wgetRequests[$0];
        if (http) {
            var byteArray = new Uint8Array(http.response);
            HEAPU8.set(byteArray, $1);
            return byteArray.length
        }
        return 0
    },
    function($0) {
        delete Browser.wgetRequests[$0]
    },
    function($0, $1) {
        console.log("Download Failed : " + UTF8ToString($0) + ": " + UTF8ToString($1))
    },
    function() {
        var ratio = window.devicePixelRatio;
        if (ratio != undefined) return ratio;
        else return 1
    },
    function($0) {
        var canvas = document.getElementById(UTF8ToString($0));
        Module["canvas"] = canvas
    },
    function() {
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("windows") > -1) {
            return 1
        } else if (ua.indexOf("macintosh") > -1) {
            return 2
        } else if (ua.indexOf("linux") > -1) {
            return 3
        }
    },
    function($0) {
        var re = new RegExp(UTF8ToString($0), "i");
        var match = navigator.userAgent.match(re);
        if (match) return true;
        return false
    },
    function() {
        Module["canvas"] = null
    },
    function($0) {
        var target = __findEventTarget(UTF8ToString($0));
        if (target) return 1;
        return 0
    },
    function($0) {
        var canvas = document.getElementById(UTF8ToString($0));
        if (canvas) {
            var parent = canvas.parentElement;
            if (parent) {
                var ratio = window.devicePixelRatio;
                if (ratio == undefined) ratio = 1;
                canvas.width = parent.clientWidth * ratio;
                canvas.height = parent.clientHeight * ratio;
                return ratio
            }
        }
        return 1
    },
    function($0, $1) {
        var canvas = document.getElementById(UTF8ToString($0));
        if (canvas) {
            canvas.style["cursor"] = UTF8ToString($1)
        }
    },
    function() {
        var isIE = false || !!document.documentMode;
        return isIE
    },
    function($0, $1, $2) {
        var _dbName = "DataCacheDB";
        var _osName = "DataCacheObjectStore";
        var _arg = $0;
        var _collectInfo = $2;
        var _idbVersion = 2;
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        function openDB() {
            var request = window.indexedDB.open(_dbName, _idbVersion);
            request.onerror = function(event) {
                console.warn("Warning: IndexedDB error occurred, file caching in ThingView will not be available");
                Module.indexeddbready = 0;
                if (event.target.error.name == "VersionError") {
                    console.log("Trying to delete IndexedDB");
                    deleteDB()
                }
            };
            request.onupgradeneeded = function(event) {
                var database = request.result;
                if (database.objectStoreNames.contains(_osName)) {
                    var txn = event.target.transaction;
                    var objectstore = txn.objectStore(_osName);
                    var clearReq = objectstore.clear();
                    clearReq.onsuccess = function(evt) {
                        console.log("Cleared DB on version change")
                    }
                } else {
                    database.createObjectStore(_osName, {
                        keyPath: "key"
                    })
                }
            };
            request.onsuccess = function(event) {
                var database = request.result;
                Module.indexedDB = database;
                Module.WFStimeoutFn = null;
                var store = database.transaction(_osName, "readwrite").objectStore(_osName);
                if (store) {
                    var getReq = store.get("cacheinfo_uids");
                    getReq.onerror = function(e) {
                        console.error("IndexedDB Error - Failed to get cacheinfo_uids from IndexedDB");
                        console.error(e.target.error.message)
                    };
                    getReq.onsuccess = function(e) {
                        if (e.target.result) {
                            var cachetimestamps = e.target.result.timestamps;
                            var keys = Object.keys(cachetimestamps);
                            for (var i = 0; i < keys.length; i++) {
                                var timestamp = Number(cachetimestamps[keys[i]]);
                                var diff = Date.now() - timestamp;
                                if (diff >= $1) {
                                    delete cachetimestamps[keys[i]]
                                }
                            }
                            cachetimestamps[Module.uniqueTVID] = Date.now();
                            store.put({
                                key: "cacheinfo_uids",
                                timestamps: cachetimestamps
                            })
                        } else {
                            var myStamp = new Object;
                            myStamp[Module.uniqueTVID] = Date.now();
                            store.put({
                                key: "cacheinfo_uids",
                                timestamps: myStamp
                            })
                        }
                    };
                    var getRequest = store.get("cacheinfo");
                    getRequest.onsuccess = function(e) {
                        if (e.target.result) {
                            var infotimestamp = Number(e.target.result.timestamp);
                            var cachetimestamps = e.target.result.timestamps;
                            var infofileversion = e.target.result.version;
                            var byteLengths = lengthBytesUTF8(cachetimestamps) + 1;
                            var stampBuffer = _malloc(byteLengths);
                            stringToUTF8(cachetimestamps, stampBuffer, byteLengths);
                            var versionLengths = lengthBytesUTF8(infofileversion) + 1;
                            var versionBuffer = _malloc(versionLengths);
                            stringToUTF8(infofileversion, versionBuffer, versionLengths);
                            dynCall("viiii", _collectInfo, [_arg, infotimestamp, stampBuffer, versionBuffer]);
                            _free(stampBuffer);
                            _free(versionBuffer)
                        } else {
                            Module.indexeddbready = 1
                        }
                    }
                }
            }
        }
        function deleteDB() {
            var delReq = window.indexedDB.deleteDatabase(_dbName);
            delReq.onerror = function(ev) {
                console.error("IndexedDB Error - Failed to delete IndexedDB");
                console.error(ev.target.error.message);
                console.error("IndexedDB Error - Please delete IndexedDB '" + _dbName + "' manually")
            };
            delReq.onsuccess = function(ev) {
                console.log("Deleted IndexedDB on version change");
                openDB()
            }
        }
        if (window.indexedDB) {
            var cryptoObj = window.crypto || window.msCrypto;
            function rng(a) {
                return a ? (a ^ cryptoObj.getRandomValues(new Uint8Array(1))[0] % 36 >> a / 4).toString(36) : ([1e7] + -1e3 + -1e3 + -1e3 + -1e11).replace(/[01]/g, rng)
            }
            Module.uniqueTVID = rng();
            openDB()
        } else {
            console.log("indexedDB is not supported")
        }
        Module.indexeddbready = 0
    },
    function($0, $1, $2, $3) {
        if ($1) {
            function flushTimeout() {
                window.clearTimeout(Module.WFSUIDtimeoutFn);
                Module.WFSUIDtimeoutFn = null;
                dynCall("vi", $2, [$0])
            }
            if (!Module.WFSUIDtimeoutFn) {
                Module.WFSUIDtimeoutFn = window.setTimeout(flushTimeout, $3)
            } else {
                window.clearTimeout(Module.WFSUIDtimeoutFn);
                Module.WFSUIDtimeoutFn = window.setTimeout(flushTimeout, $3)
            }
        } else {
            if (Module.WFSUIDtimeoutFn) {
                window.clearTimeout(Module.WFSUIDtimeoutFn);
                Module.WFSUIDtimeoutFn = null
            }
        }
    },
    function($0, $1, $2) {
        var _osName = "DataCacheObjectStore";
        var _arg = $0;
        var _collectInfo = $1;
        var _callLockFile = $2;
        var store = Module.indexedDB.transaction(_osName, "readonly").objectStore(_osName);
        var getRequest = store.get("cacheinfo");
        getRequest.onsuccess = function(e) {
            if (e.target.result) {
                var infotimestamp = Number(e.target.result.timestamp);
                var cachetimestamps = e.target.result.timestamps;
                var infofileversion = e.target.result.version;
                var byteLengths = lengthBytesUTF8(cachetimestamps) + 1;
                var stampBuffer = _malloc(byteLengths);
                stringToUTF8(cachetimestamps, stampBuffer, byteLengths);
                var versionLengths = lengthBytesUTF8(infofileversion) + 1;
                var versionBuffer = _malloc(versionLengths);
                stringToUTF8(infofileversion, versionBuffer, versionLengths);
                dynCall("viiii", _collectInfo, [_arg, infotimestamp, stampBuffer, versionBuffer]);
                _free(stampBuffer);
                _free(versionBuffer)
            }
            dynCall("vi", _callLockFile, [_arg])
        }
    },
    function($0, $1, $2, $3) {
        var _key = UTF8ToString($0);
        var _osName = "DataCacheObjectStore";
        var _arg = $1;
        var _onGetSuccess = $2;
        var _onGetFail = $3;
        try {
            var store = Module.indexedDB.transaction(_osName, "readonly").objectStore(_osName);
            var getRequest = store.get(_key);
            getRequest.onerror = function(e) {
                console.error("IndexedDB Error - Failed to get '" + _key + "' from IndexedDB");
                console.error(e.target.error.message);
                if (_onGetFail) {
                    var byteLength = lengthBytesUTF8(_key) + 1;
                    var keyBuffer = _malloc(byteLength);
                    stringToUTF8(_key, keyBuffer, byteLength);
                    dynCall("vii", _onGetFail, [_arg, keyBuffer]);
                    _free(keyBuffer)
                }
            };
            getRequest.onsuccess = function(e) {
                if (e.target.result) {
                    if (_onGetSuccess) {
                        var data = e.target.result;
                        Module[_key] = data.ds;
                        var byteLength = lengthBytesUTF8(_key) + 1;
                        var keyBuffer = _malloc(byteLength);
                        stringToUTF8(_key, keyBuffer, byteLength);
                        var timeStamp = Math.floor(Date.now() / 1e3);
                        dynCall("viiii", _onGetSuccess, [_arg, keyBuffer, timeStamp, data.ds.length]);
                        _free(keyBuffer)
                    }
                }
            }
        } catch(e) {
            if (_onGetFail) {
                var byteLength = lengthBytesUTF8(_key) + 1;
                var keyBuffer = _malloc(byteLength);
                stringToUTF8(_key, keyBuffer, byteLength);
                dynCall("vii", _onGetFail, [_arg, keyBuffer]);
                _free(keyBuffer)
            }
        }
    },
    function($0) {
        var key = UTF8ToString($0);
        var store = Module.indexedDB.transaction("DataCacheObjectStore", "readwrite").objectStore("DataCacheObjectStore");
        var delReq = store.delete(key);
        delReq.onsuccess = function() {};
        delReq.onerror = function(e) {
            console.error("IndexedDB Error - Failed to delete '" + key + "' from IndexedDB");
            console.error(e.target.error.message)
        }
    },
    function() {
        var timeStamp = Math.floor(Date.now() / 1e3);
        return timeStamp
    },
    function() {
        var _key = "cacheinfo_uids";
        var _osName = "DataCacheObjectStore";
        var store = Module.indexedDB.transaction(_osName, "readwrite").objectStore(_osName);
        var getRequest = store.get(_key);
        getRequest.onerror = function(e) {
            console.error("IndexedDB Error - Failed to get '" + _key + "' from IndexedDB");
            console.error(e.target.error.message)
        };
        getRequest.onsuccess = function(e) {
            if (e.target.result) {
                var cachetimestamps = e.target.result.timestamps;
                cachetimestamps[Module.uniqueTVID] = Date.now();
                store.put({
                    key: _key,
                    timestamps: cachetimestamps
                })
            } else {
                var myStamp = new Object;
                myStamp[Module.uniqueTVID] = Date.now();
                store.put({
                    key: _key,
                    timestamps: myStamp
                })
            }
        }
    },
    function($0, $1, $2, $3, $4, $5) {
        var _key = UTF8ToString($3);
        var data = new Uint8Array(HEAPU8.buffer, $5, $4);
        var cachedCopy = new Uint8Array(data);
        var store = Module.indexedDB.transaction("DataCacheObjectStore", "readwrite").objectStore("DataCacheObjectStore");
        var putReq = store.put({
            key: _key,
            ds: cachedCopy
        });
        putReq.onsuccess = function() {
            var timeStamp = Math.floor(Date.now() / 1e3);
            var byteLength = lengthBytesUTF8(_key) + 1;
            var keyBuffer = _malloc(byteLength);
            stringToUTF8(_key, keyBuffer, byteLength);
            dynCall("viii", $1, [$0, keyBuffer, timeStamp]);
            _free(keyBuffer)
        };
        putReq.onerror = function(e) {
            console.error("IndexedDB Error - Failed to put '" + _key + "' in IndexedDB");
            console.error(e.target.error.message);
            var byteLength = lengthBytesUTF8(_key) + 1;
            var keyBuffer = _malloc(byteLength);
            stringToUTF8(_key, keyBuffer, byteLength);
            dynCall("vii", $2, [$0, keyBuffer]);
            _free(keyBuffer)
        }
    },
    function($0, $1) {
        var _key = UTF8ToString($0);
        if (Module[_key]) {
            HEAPU8.set(Module[_key], $1);
            delete Module[_key]
        }
    },
    function() {
        Module.indexeddbready = 1
    },
    function($0, $1, $2) {
        var _key = "cacheinfo_lock";
        var _osName = "DataCacheObjectStore";
        if (Module.WFSLtimeoutFn) {
            window.clearTimeout(Module.WFSLtimeoutFn);
            Module.WFSLtimeoutFn = null
        }
        var store = Module.indexedDB.transaction(_osName, "readwrite").objectStore(_osName);
        var getRequest = store.get(_key);
        getRequest.onerror = function(e) {
            console.error("IndexedDB Error - Failed to get '" + _key + "' from IndexedDB");
            console.error(e.target.error.message);
            Module.lockTimestamp = undefined;
            dynCall("vii", $1, [$0, -10])
        };
        getRequest.onsuccess = function(e) {
            if (e.target.result) {
                var lockTimestamp = Number(e.target.result.timestamp);
                var diff = Date.now() - lockTimestamp;
                if (diff >= $2) {
                    var curTimestamp = Date.now();
                    putReq = store.put({
                        key: _key,
                        timestamp: curTimestamp
                    });
                    putReq.onsuccess = function() {
                        Module.lockTimestamp = curTimestamp;
                        dynCall("vii", $1, [$0, 2])
                    }
                } else {
                    if (lockTimestamp == Module.lockTimestamp) {
                        dynCall("vii", $1, [$0, -1])
                    } else {
                        Module.lockTimestamp = undefined;
                        dynCall("vii", $1, [$0, 0])
                    }
                }
            } else {
                var curTimestamp = Date.now();
                putReq = store.put({
                    key: _key,
                    timestamp: curTimestamp
                });
                putReq.onsuccess = function() {
                    Module.lockTimestamp = curTimestamp;
                    dynCall("vii", $1, [$0, 1])
                }
            }
        }
    },
    function($0, $1) {
        if (Module.lockTimestamp != undefined) {
            if (Date.now() - Module.lockTimestamp > $1) {
                Module.lockTimestamp = undefined;
                return 0
            } else {
                return 1
            }
        } else {
            return 0
        }
    },
    function() {
        var _key = "cacheinfo_lock";
        var _osName = "DataCacheObjectStore";
        var store = Module.indexedDB.transaction(_osName, "readwrite").objectStore(_osName);
        var getRequest = store.get(_key);
        getRequest.onerror = function(e) {
            console.error("IndexedDB Error - Failed to get '" + _key + "' from IndexedDB");
            console.error(e.target.error.message);
            Module.lockTimestamp = undefined
        };
        getRequest.onsuccess = function(e) {
            if (e.target.result) {
                if (Module.lockTimestamp == Number(e.target.result.timestamp)) {
                    var delReq = store.delete(_key);
                    delReq.onsuccess = function(e) {
                        Module.lockTimestamp = undefined
                    }
                } else {
                    Module.lockTimestamp = undefined
                }
            } else {
                Module.lockTimestamp = undefined
            }
        }
    },
    function($0, $1) {
        var _key = "cacheinfo_uids";
        var _osName = "DataCacheObjectStore";
        var store = Module.indexedDB.transaction(_osName, "readwrite").objectStore(_osName);
        var getRequest = store.get(_key);
        getRequest.onerror = function(e) {
            console.error("IndexedDB Error - Failed to get '" + _key + "' from IndexedDB");
            console.error(e.target.error.message)
        };
        getRequest.onsuccess = function(e) {
            if (e.target.result) {
                var cachetimestamps = e.target.result.timestamps;
                delete cachetimestamps[Module.uniqueTVID];
                store.put({
                    key: _key,
                    timestamps: cachetimestamps
                });
                if (Object.keys(cachetimestamps).length == 0) {
                    dynCall("vi", $1, [$0])
                }
            }
        }
    },
    function($0, $1, $2) {
        function flushTimeout() {
            window.clearTimeout(Module.WFSLtimeoutFn);
            Module.WFSLtimeoutFn = null;
            dynCall("vi", $1, [$0])
        }
        if (!Module.WFSLtimeoutFn) {
            Module.WFSLtimeoutFn = window.setTimeout(flushTimeout, $2)
        } else {
            window.clearTimeout(Module.WFSLtimeoutFn);
            Module.WFSLtimeoutFn = window.setTimeout(flushTimeout, $2)
        }
    },
    function($0, $1) {
        var _key = "cacheinfo";
        var _timestamps = UTF8ToString($0);
        var _version = UTF8ToString($1);
        var timeStamp = Math.floor(Date.now() / 1e3);
        var store = Module.indexedDB.transaction("DataCacheObjectStore", "readwrite").objectStore("DataCacheObjectStore");
        var putReq = store.put({
            key: _key,
            version: _version,
            timestamp: timeStamp,
            timestamps: _timestamps
        });
        putReq.onerror = function(e) {
            console.error("IndexedDB Error - Failed to put '" + _key + "' in IndexedDB");
            console.error(e.target.error.message)
        };
        return timeStamp
    },
    function($0, $1) {
        var store = Module.indexedDB.transaction("DataCacheObjectStore", "readonly").objectStore("DataCacheObjectStore");
        function CallCFunc(keys) {
            var byteLength = lengthBytesUTF8(keys) + 1;
            var keysBuffer = _malloc(byteLength);
            stringToUTF8(keys, keysBuffer, byteLength);
            dynCall("vii", $1, [$0, keysBuffer]);
            _free(keysBuffer)
        }
        if (typeof store.getAllKeys === "function") {
            var allkeyReq = store.getAllKeys();
            allkeyReq.onsuccess = function(event) {
                var res = allkeyReq.result;
                var keys = "";
                for (var i = 0; i < res.length; i++) {
                    if (res[i].indexOf("cacheinfo") == -1) {
                        keys += res[i];
                        keys += ";"
                    }
                }
                CallCFunc(keys)
            }
        } else {
            var keys = "";
            var cursorReq = store.openCursor();
            cursorReq.onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.key.indexOf("cacheinfo") == -1) {
                        keys += cursor.value.key;
                        keys += ";"
                    }
                    cursor.
                    continue ()
                } else {
                    CallCFunc(keys)
                }
            }
        }
    },
    function($0) {
        var _keys = UTF8ToString($0);
        var splitArr = _keys.split(";");
        function delete_key(os, arr) {
            var key = arr.shift();
            if (key) {
                var delReq = os.delete(key);
                delReq.onsuccess = function(e) {
                    delete_key(os, arr)
                };
                delReq.onerror = function(e) {
                    delete_key(os, arr)
                }
            }
        }
        var store = Module.indexedDB.transaction("DataCacheObjectStore", "readwrite").objectStore("DataCacheObjectStore");
        delete_key(store, splitArr)
    }];
function _emscripten_asm_const_i(code) {
    return ASM_CONSTS[code]()
}
function _emscripten_asm_const_d(code) {
    return ASM_CONSTS[code]()
}
function _emscripten_asm_const_iii(code, a0, a1) {
    return ASM_CONSTS[code](a0, a1)
}
function _emscripten_asm_const_ii(code, a0) {
    return ASM_CONSTS[code](a0)
}
function _emscripten_asm_const_iiii(code, a0, a1, a2) {
    return ASM_CONSTS[code](a0, a1, a2)
}
function _emscripten_asm_const_iiiii(code, a0, a1, a2, a3) {
    return ASM_CONSTS[code](a0, a1, a2, a3)
}
function _emscripten_asm_const_iiiiiii(code, a0, a1, a2, a3, a4, a5) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5)
}
function _emscripten_asm_const_iiiiiiii(code, a0, a1, a2, a3, a4, a5, a6) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5, a6)
}
function _emscripten_asm_const_iiiiii(code, a0, a1, a2, a3, a4) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4)
}
function _emscripten_asm_const_iiiiiiiii(code, a0, a1, a2, a3, a4, a5, a6, a7) {
    return ASM_CONSTS[code](a0, a1, a2, a3, a4, a5, a6, a7)
}
function _emscripten_asm_const_di(code, a0) {
    return ASM_CONSTS[code](a0)
}
__ATINIT__.push({
    func: function() {
        globalCtors()
    }
});