@echo off
REM Compile the attractor compute engine to standalone WebAssembly.
REM Requires Emscripten (emsdk) on PATH — run emsdk_env.bat first.
cd /d "%~dp0"
if not exist ..\public\wasm mkdir ..\public\wasm

call emcc attractor.cpp ^
  -O3 ^
  --no-entry ^
  -s STANDALONE_WASM=1 ^
  -s ALLOW_MEMORY_GROWTH=1 ^
  -s INITIAL_MEMORY=33554432 ^
  -s EXPORTED_FUNCTIONS=_dejong_compute,_clifford_compute,_orbit_free ^
  -o ..\public\wasm\attractor.wasm

echo Built: public\wasm\attractor.wasm
