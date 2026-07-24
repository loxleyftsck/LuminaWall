// Strange-attractor compute engine for LuminaWall.
// Compiled to standalone WebAssembly (no JS glue) — see build.sh.
//
// Computes N iterations of a 2D strange attractor and exposes the
// orbit as interleaved [x0, y0, x1, y1, ...] float32 pairs in Wasm
// linear memory. JavaScript reads the result zero-copy via a
// Float32Array view over the returned pointer.

#include <emscripten.h>
#include <cmath>
#include <cstdint>
#include <cstdlib>

extern "C" {

static float*   orbit    = nullptr;
static uint32_t capacity = 0; // in points

// Iterations whose transient hasn't settled yet are not recorded.
static const uint32_t TRANSIENT = 100;

/// Ensure the orbit buffer can hold `points` (x, y) pairs.
static bool ensure_capacity(uint32_t points) {
  if (points <= capacity) return true;
  float* next = static_cast<float*>(
      realloc(orbit, static_cast<size_t>(points) * 2 * sizeof(float)));
  if (!next) return false;
  orbit = next;
  capacity = points;
  return true;
}

/// Peter de Jong attractor:
///   x' = sin(a·y) − cos(b·x)
///   y' = sin(c·x) − cos(d·y)
/// Returns a pointer to `iterations` interleaved (x, y) float pairs,
/// or nullptr if allocation failed.
EMSCRIPTEN_KEEPALIVE
float* dejong_compute(float a, float b, float c, float d,
                      uint32_t iterations) {
  if (!ensure_capacity(iterations)) return nullptr;

  double x = 0.1, y = 0.1;
  // Settle the transient before recording.
  for (uint32_t i = 0; i < TRANSIENT; i++) {
    const double nx = sin(a * y) - cos(b * x);
    const double ny = sin(c * x) - cos(d * y);
    x = nx;
    y = ny;
  }
  float* out = orbit;
  for (uint32_t i = 0; i < iterations; i++) {
    const double nx = sin(a * y) - cos(b * x);
    const double ny = sin(c * x) - cos(d * y);
    x = nx;
    y = ny;
    *out++ = static_cast<float>(x);
    *out++ = static_cast<float>(y);
  }
  return orbit;
}

/// Clifford attractor:
///   x' = sin(a·y) + c·cos(a·x)
///   y' = sin(b·x) + d·cos(b·y)
/// Same buffer contract as dejong_compute.
EMSCRIPTEN_KEEPALIVE
float* clifford_compute(float a, float b, float c, float d,
                        uint32_t iterations) {
  if (!ensure_capacity(iterations)) return nullptr;

  double x = 0.1, y = 0.1;
  for (uint32_t i = 0; i < TRANSIENT; i++) {
    const double nx = sin(a * y) + c * cos(a * x);
    const double ny = sin(b * x) + d * cos(b * y);
    x = nx;
    y = ny;
  }
  float* out = orbit;
  for (uint32_t i = 0; i < iterations; i++) {
    const double nx = sin(a * y) + c * cos(a * x);
    const double ny = sin(b * x) + d * cos(b * y);
    x = nx;
    y = ny;
    *out++ = static_cast<float>(x);
    *out++ = static_cast<float>(y);
  }
  return orbit;
}

/// Release the orbit buffer (call when tearing the component down).
EMSCRIPTEN_KEEPALIVE
void orbit_free() {
  free(orbit);
  orbit = nullptr;
  capacity = 0;
}

} // extern "C"
