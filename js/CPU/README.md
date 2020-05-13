## Notes

A stress test in WebAssembly has inherent limitations:
* Code runs through two optimizing compilers; once through emscripten/clang during C++>wasm compile, then again during execution by the wasm VM.
    * Therefore it's very hard to control how the instruction sequence looks like
* 