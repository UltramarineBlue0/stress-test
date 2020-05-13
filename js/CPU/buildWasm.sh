#!/bin/bash -eux

export EMCC_STRICT=1

em++ -std=c++17 -Wall -Wextra -pedantic -g3 -O3 -ffast-math -flto -fno-rtti -fno-exceptions --closure 0 --llvm-opts '["-Ofast"]' -s EXPORTED_FUNCTIONS='["_runTest"]' -s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall", "cwrap"]' -s DYNAMIC_EXECUTION=0 -s FILESYSTEM=0 -s ASSERTIONS=0 -s ENVIRONMENT='web,worker' -o WasmTest.mjs ./CPU-test.cpp -lm

cp -a -x -i ./WasmTest.wasm ../
