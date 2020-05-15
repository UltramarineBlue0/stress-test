
var Module = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
  
  return (
function(Module) {
  Module = Module || {};


null;var a;a||(a=typeof Module !== 'undefined' ? Module : {});var e={},f;for(f in a)a.hasOwnProperty(f)&&(e[f]=a[f]);var g="",h;g=self.location.href;_scriptDir&&(g=_scriptDir);0!==g.indexOf("blob:")?g=g.substr(0,g.lastIndexOf("/")+1):g="";h=function(b){var c=new XMLHttpRequest;c.open("GET",b,!1);c.responseType="arraybuffer";c.send(null);return new Uint8Array(c.response)};var k=a.print||console.log.bind(console),l=a.printErr||console.warn.bind(console);
for(f in e)e.hasOwnProperty(f)&&(a[f]=e[f]);e=null;var m;a.wasmBinary&&(m=a.wasmBinary);var noExitRuntime;a.noExitRuntime&&(noExitRuntime=a.noExitRuntime);"object"!==typeof WebAssembly&&l("no native wasm support detected");var n,p=new WebAssembly.Table({initial:1,maximum:1,element:"anyfunc"}),q=!1,t,u,v=a.INITIAL_MEMORY||16777216;a.wasmMemory?n=a.wasmMemory:n=new WebAssembly.Memory({initial:v/65536,maximum:v/65536});n&&(t=n.buffer);v=t.byteLength;var x=t;t=x;a.HEAP8=new Int8Array(x);a.HEAP16=new Int16Array(x);
a.HEAP32=u=new Int32Array(x);a.HEAPU8=new Uint8Array(x);a.HEAPU16=new Uint16Array(x);a.HEAPU32=new Uint32Array(x);a.HEAPF32=new Float32Array(x);a.HEAPF64=new Float64Array(x);u[1016]=5247104;function y(b){for(;0<b.length;){var c=b.shift();if("function"==typeof c)c(a);else{var d=c.g;"number"===typeof d?void 0===c.f?a.dynCall_v(d):a.dynCall_vi(d,c.f):d(void 0===c.f?null:c.f)}}}var z=[],A=[],B=[],C=[];function D(){var b=a.preRun.shift();z.unshift(b)}var E=0,F=null,G=null;a.preloadedImages={};
a.preloadedAudios={};function H(b){if(a.onAbort)a.onAbort(b);k(b);l(b);q=!0;throw new WebAssembly.RuntimeError("abort("+b+"). Build with -s ASSERTIONS=1 for more info.");}var I="WasmTest.wasm";if(String.prototype.startsWith?!I.startsWith("data:application/octet-stream;base64,"):0!==I.indexOf("data:application/octet-stream;base64,")){var J=I;I=a.locateFile?a.locateFile(J,g):g+J}A.push({g:function(){L()}});var M;M=function(){return performance.now()};
var O={a:function(){H()},b:function(b,c){if(0===b)b=Date.now();else if(1===b||4===b)b=M();else return u[N()>>2]=28,-1;u[c>>2]=b/1E3|0;u[c+4>>2]=b%1E3*1E6|0;return 0},memory:n,table:p},P=function(){function b(d){a.asm=d.exports;E--;a.monitorRunDependencies&&a.monitorRunDependencies(E);0==E&&(null!==F&&(clearInterval(F),F=null),G&&(d=G,G=null,d()))}var c={a:O};E++;a.monitorRunDependencies&&a.monitorRunDependencies(E);if(a.instantiateWasm)try{return a.instantiateWasm(c,b)}catch(d){return l("Module.instantiateWasm callback failed with error: "+
d),!1}(function(){try{a:{try{if(m){var d=new Uint8Array(m);break a}if(h){d=h(I);break a}throw"sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";}catch(w){H(w)}d=void 0}var K=new WebAssembly.Module(d);var r=new WebAssembly.Instance(K,c)}catch(w){throw r=w.toString(),l("failed to compile wasm module: "+r),(0<=r.indexOf("imported Memory")||0<=r.indexOf("memory import"))&&l("Memory size incompatibility issues may be due to changing INITIAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set INITIAL_MEMORY at runtime to something smaller than it was at compile time)."),
w;}b(r,K)})();return a.asm}(),L=a.___wasm_call_ctors=P.c;a._runTest=P.d;var N=a.___errno_location=P.e;a.asm=P;var Q;a.then=function(b){if(Q)b(a);else{var c=a.onRuntimeInitialized;a.onRuntimeInitialized=function(){c&&c();b(a)}}return a};G=function R(){Q||S();Q||(G=R)};
function S(){function b(){if(!Q&&(Q=!0,a.calledRun=!0,!q)){y(A);y(B);if(a.onRuntimeInitialized)a.onRuntimeInitialized();if(a.postRun)for("function"==typeof a.postRun&&(a.postRun=[a.postRun]);a.postRun.length;){var c=a.postRun.shift();C.unshift(c)}y(C)}}if(!(0<E)){if(a.preRun)for("function"==typeof a.preRun&&(a.preRun=[a.preRun]);a.preRun.length;)D();y(z);0<E||(a.setStatus?(a.setStatus("Running..."),setTimeout(function(){setTimeout(function(){a.setStatus("")},1);b()},1)):b())}}a.run=S;
if(a.preInit)for("function"==typeof a.preInit&&(a.preInit=[a.preInit]);0<a.preInit.length;)a.preInit.pop()();noExitRuntime=!0;S();


  return Module
}
);
})();
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = Module;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return Module; });
    else if (typeof exports === 'object')
      exports["Module"] = Module;
    