/**
 * Strange-attractor compute engine with a dual backend:
 *
 *  1. WebAssembly — if `/wasm/attractor.wasm` (compiled from
 *     wasm/attractor.cpp via Emscripten, see wasm/build.sh) is
 *     present, orbits are computed in C++ and read zero-copy from
 *     Wasm linear memory.
 *  2. TypeScript fallback — an identical implementation used when
 *     the .wasm file hasn't been built. Same math, same contract,
 *     ~2–3× slower; the app works either way.
 *
 * Everything is strictly client-side.
 */

import { buildPaletteLUT, type Palette } from "@/lib/wallpaper";

export type AttractorType = "dejong" | "clifford";

export interface AttractorParams {
  type: AttractorType;
  a: number;
  b: number;
  c: number;
  d: number;
  iterations: number;
}

export type EngineKind = "wasm" | "js";

export interface AttractorEngine {
  kind: EngineKind;
  /** Returns interleaved [x0, y0, x1, y1, ...] orbit coordinates. */
  compute(params: AttractorParams): Float32Array;
}

/* ---------- WebAssembly backend ---------- */

interface WasmExports {
  memory: WebAssembly.Memory;
  dejong_compute(a: number, b: number, c: number, d: number, n: number): number;
  clifford_compute(a: number, b: number, c: number, d: number, n: number): number;
  orbit_free(): void;
}

async function loadWasmEngine(): Promise<AttractorEngine | null> {
  try {
    const res = await fetch("/wasm/attractor.wasm");
    if (!res.ok) return null;
    const bytes = await res.arrayBuffer();
    // Standalone Emscripten modules may import a handful of WASI
    // shims (proc_exit etc.); stub anything requested.
    const wasiStubs = new Proxy(
      {},
      { get: () => () => 0 },
    ) as WebAssembly.ModuleImports;
    const { instance } = await WebAssembly.instantiate(bytes, {
      wasi_snapshot_preview1: wasiStubs,
      env: wasiStubs,
    });
    const exp = instance.exports as unknown as WasmExports;
    if (!exp.dejong_compute || !exp.clifford_compute) return null;

    return {
      kind: "wasm",
      compute({ type, a, b, c, d, iterations }) {
        const ptr =
          type === "dejong"
            ? exp.dejong_compute(a, b, c, d, iterations)
            : exp.clifford_compute(a, b, c, d, iterations);
        if (!ptr) throw new Error("Wasm orbit allocation failed");
        // Copy out of linear memory: the view would be invalidated by
        // the next memory.grow, so hand back an owned array.
        return new Float32Array(exp.memory.buffer, ptr, iterations * 2).slice();
      },
    };
  } catch {
    return null;
  }
}

/* ---------- TypeScript fallback backend ---------- */

const TRANSIENT = 100;

function jsCompute({ type, a, b, c, d, iterations }: AttractorParams): Float32Array {
  const out = new Float32Array(iterations * 2);
  let x = 0.1;
  let y = 0.1;
  const { sin, cos } = Math;

  if (type === "dejong") {
    // Peter de Jong: x' = sin(a·y) − cos(b·x); y' = sin(c·x) − cos(d·y)
    for (let i = 0; i < TRANSIENT; i++) {
      const nx = sin(a * y) - cos(b * x);
      const ny = sin(c * x) - cos(d * y);
      x = nx; y = ny;
    }
    for (let i = 0; i < iterations; i++) {
      const nx = sin(a * y) - cos(b * x);
      const ny = sin(c * x) - cos(d * y);
      x = nx; y = ny;
      out[i * 2] = x;
      out[i * 2 + 1] = y;
    }
  } else {
    // Clifford: x' = sin(a·y) + c·cos(a·x); y' = sin(b·x) + d·cos(b·y)
    for (let i = 0; i < TRANSIENT; i++) {
      const nx = sin(a * y) + c * cos(a * x);
      const ny = sin(b * x) + d * cos(b * y);
      x = nx; y = ny;
    }
    for (let i = 0; i < iterations; i++) {
      const nx = sin(a * y) + c * cos(a * x);
      const ny = sin(b * x) + d * cos(b * y);
      x = nx; y = ny;
      out[i * 2] = x;
      out[i * 2 + 1] = y;
    }
  }
  return out;
}

/**
 * Probe whether a parameter set produces a genuinely chaotic orbit
 * (rather than collapsing to a fixed point or a thin periodic loop):
 * a short orbit must both span space and visit many distinct coarse
 * grid cells. Used by Generate to resample bad random draws.
 */
export function isChaotic(
  type: AttractorType,
  a: number,
  b: number,
  c: number,
  d: number,
): boolean {
  const probe = jsCompute({ type, a, b, c, d, iterations: 2000 });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const cells = new Set<number>();
  for (let i = 0; i < probe.length; i += 2) {
    const x = probe[i], y = probe[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    const gx = Math.min(63, Math.max(0, Math.floor(((x + 3) / 6) * 64)));
    const gy = Math.min(63, Math.max(0, Math.floor(((y + 3) / 6) * 64)));
    cells.add(gx * 64 + gy);
  }
  return (
    Number.isFinite(minX) &&
    maxX - minX > 0.8 &&
    maxY - minY > 0.8 &&
    cells.size > 300
  );
}

/* ---------- public loader ---------- */

let enginePromise: Promise<AttractorEngine> | null = null;

/** Resolve the best available engine (Wasm if built, else JS). Cached. */
export function getEngine(): Promise<AttractorEngine> {
  enginePromise ??= loadWasmEngine().then(
    (wasm) => wasm ?? { kind: "js" as const, compute: jsCompute },
  );
  return enginePromise;
}

/* ---------- density-mapped renderer ---------- */

/**
 * Plot an orbit as a ghostly density map: hits are accumulated into a
 * per-pixel histogram, then tone-mapped (log + gamma) into a single
 * putImageData pass — orders of magnitude faster than per-point
 * fillRect at millions of points, with the same low-opacity glow.
 *
 * With a palette, intensity is mapped through the palette ramp
 * (darkest color as background, lightest as the glowing core);
 * without one it renders classic white-on-black.
 */
export function renderDensity(
  canvas: HTMLCanvasElement,
  orbit: Float32Array,
  width: number,
  height: number,
  palette?: Palette,
): void {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Dynamic bounds (attractors usually live within ±2 but parameters
  // can stretch that); uniform scale, centered, 6% margin.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < orbit.length; i += 2) {
    const x = orbit[i], y = orbit[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const scale = Math.min((width * 0.88) / spanX, (height * 0.88) / spanY);
  const offX = (width - spanX * scale) / 2 - minX * scale;
  const offY = (height - spanY * scale) / 2 - minY * scale;

  // Accumulate the density histogram.
  const density = new Uint32Array(width * height);
  let maxDensity = 0;
  for (let i = 0; i < orbit.length; i += 2) {
    const px = (orbit[i] * scale + offX) | 0;
    const py = (orbit[i + 1] * scale + offY) | 0;
    if (px < 0 || px >= width || py < 0 || py >= height) continue;
    const idx = py * width + px;
    const v = ++density[idx];
    if (v > maxDensity) maxDensity = v;
  }

  // Tone-map: log compression + gamma lift → smooth smoke, no clipping.
  const img = ctx.createImageData(width, height);
  const data = img.data;
  const logMax = Math.log1p(maxDensity);
  // "dark" tone orders the LUT darkest → lightest, so density climbs
  // from the palette's deep background into its luminous highlights.
  const lut = palette ? buildPaletteLUT(palette, "dark") : null;
  for (let i = 0; i < density.length; i++) {
    const t = density[i] ? Math.pow(Math.log1p(density[i]) / logMax, 0.45) : 0;
    const v = (t * 255) | 0;
    const o = i * 4;
    if (lut) {
      const l = v * 3;
      data[o] = lut[l];
      data[o + 1] = lut[l + 1];
      data[o + 2] = lut[l + 2];
    } else {
      // Ghostly particles: white core with a faint cool cast in midtones.
      data[o] = v;
      data[o + 1] = v;
      data[o + 2] = Math.min(255, (v * 1.08) | 0);
    }
    data[o + 3] = 255; // solid background where t = 0
  }
  ctx.putImageData(img, 0, 0);
}
