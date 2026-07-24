#!/usr/bin/env bash
# Compile the attractor compute engine to standalone WebAssembly.
# Requires Emscripten (emsdk): https://emscripten.org/docs/getting_started/downloads.html
set -euo pipefail
cd "$(dirname "$0")"

mkdir -p ../public/wasm

emcc attractor.cpp \
  -O3 \
  --no-entry \
  -s STANDALONE_WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s INITIAL_MEMORY=33554432 \
  -s EXPORTED_FUNCTIONS=_dejong_compute,_clifford_compute,_orbit_free \
  -o ../public/wasm/attractor.wasm

echo "Built: public/wasm/attractor.wasm"
