#!/bin/bash -eux

export EMCC_STRICT=1
# Disable WASM_ASYNC_COMPILATION since streaming compilation requires the webserver to return the correct MIME type
# Disable DYNAMIC_EXECUTION making it to play nicely with a restrictive CSP
# TODO: switch to ES module output when firefox supports module workers. Disable closure compiler when switching
em++ -std=c++17 -Wall -Wextra -pedantic -O3 -ffast-math -flto -fno-rtti -fno-exceptions --closure 1 --llvm-opts '["-Ofast"]' -s EXPORTED_FUNCTIONS='["_runTest"]' -s WASM_ASYNC_COMPILATION=0 -s DYNAMIC_EXECUTION=0 -s FILESYSTEM=0 -s EXIT_RUNTIME=0 -s ASSERTIONS=0 -s MODULARIZE=1 -s ENVIRONMENT='worker' -o WasmTest.js ./CPU-test.cpp -lm

cp -a -x -i ./WasmTest.wasm ../
cp -a -x -i ./WasmTest.js ../