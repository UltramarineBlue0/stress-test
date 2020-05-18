
var Module = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};


null;var a;a||(a=typeof Module !== 'undefined' ? Module : {});var e;a.ready=new Promise(function(b){e=b});var f={},g;for(g in a)a.hasOwnProperty(g)&&(f[g]=a[g]);var h="",k;h=self.location.href;_scriptDir&&(h=_scriptDir);0!==h.indexOf("blob:")?h=h.substr(0,h.lastIndexOf("/")+1):h="";k=function(b){var c=new XMLHttpRequest;c.open("GET",b,!1);c.responseType="arraybuffer";c.send(null);return new Uint8Array(c.response)};var l=a.print||console.log.bind(console),m=a.printErr||console.warn.bind(console);
for(g in f)f.hasOwnProperty(g)&&(a[g]=f[g]);f=null;var n;a.wasmBinary&&(n=a.wasmBinary);var noExitRuntime;a.noExitRuntime&&(noExitRuntime=a.noExitRuntime);"object"!==typeof WebAssembly&&m("no native wasm support detected");var p,q=new WebAssembly.Table({initial:1,maximum:1,element:"anyfunc"}),t=!1,u,w,x=a.INITIAL_MEMORY||16777216;a.wasmMemory?p=a.wasmMemory:p=new WebAssembly.Memory({initial:x/65536,maximum:x/65536});p&&(u=p.buffer);x=u.byteLength;var y=u;u=y;a.HEAP8=new Int8Array(y);a.HEAP16=new Int16Array(y);
a.HEAP32=w=new Int32Array(y);a.HEAPU8=new Uint8Array(y);a.HEAPU16=new Uint16Array(y);a.HEAPU32=new Uint32Array(y);a.HEAPF32=new Float32Array(y);a.HEAPF64=new Float64Array(y);w[1016]=5247104;function z(b){for(;0<b.length;){var c=b.shift();if("function"==typeof c)c(a);else{var d=c.g;"number"===typeof d?void 0===c.f?a.dynCall_v(d):a.dynCall_vi(d,c.f):d(void 0===c.f?null:c.f)}}}var A=[],B=[],C=[],D=[];function E(){var b=a.preRun.shift();A.unshift(b)}var F=0,G=null,H=null;a.preloadedImages={};
a.preloadedAudios={};function I(b){if(a.onAbort)a.onAbort(b);l(b);m(b);t=!0;throw new WebAssembly.RuntimeError("abort("+b+"). Build with -s ASSERTIONS=1 for more info.");}var J="WasmTest.wasm";if(String.prototype.startsWith?!J.startsWith("data:application/octet-stream;base64,"):0!==J.indexOf("data:application/octet-stream;base64,")){var K=J;J=a.locateFile?a.locateFile(K,h):h+K}B.push({g:function(){M()}});var N;N=function(){return performance.now()};
var P={a:function(){I()},b:function(b,c){if(0===b)b=Date.now();else if(1===b||4===b)b=N();else return w[O()>>2]=28,-1;w[c>>2]=b/1E3|0;w[c+4>>2]=b%1E3*1E6|0;return 0},memory:p,table:q},Q=function(){function b(d){a.asm=d.exports;F--;a.monitorRunDependencies&&a.monitorRunDependencies(F);0==F&&(null!==G&&(clearInterval(G),G=null),H&&(d=H,H=null,d()))}var c={a:P};F++;a.monitorRunDependencies&&a.monitorRunDependencies(F);if(a.instantiateWasm)try{return a.instantiateWasm(c,b)}catch(d){return m("Module.instantiateWasm callback failed with error: "+
d),!1}(function(){try{a:{try{if(n){var d=new Uint8Array(n);break a}if(k){d=k(J);break a}throw"sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";}catch(v){I(v)}d=void 0}var L=new WebAssembly.Module(d);var r=new WebAssembly.Instance(L,c)}catch(v){throw r=v.toString(),m("failed to compile wasm module: "+r),(0<=r.indexOf("imported Memory")||0<=r.indexOf("memory import"))&&m("Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time)."),
v;}b(r,L)})();return a.asm}(),M=a.___wasm_call_ctors=Q.c;a._runTest=Q.d;var O=a.___errno_location=Q.e;a.asm=Q;var R;H=function S(){R||T();R||(H=S)};
function T(){function b(){if(!R&&(R=!0,a.calledRun=!0,!t)){z(B);z(C);e(a);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var c=a.postRun.shift();D.unshift(c)}z(D)}}if(!(0<F)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)E();z(A);0<F||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);b()},1)):b())}}a.run=T;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();noExitRuntime=!0;T();


  return Module.ready
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = Module;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return Module; });
    else if (typeof exports === 'object')
      exports["Module"] = Module;
    