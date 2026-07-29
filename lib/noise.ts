/**
 * 2D gradient noise implemented from first principles, following
 * Ken Perlin's "An Image Synthesizer" (1985) and the improved
 * interpolant from "Improving Noise" (2002):
 *
 *  1. A shuffled permutation table hashes each integer lattice point
 *     to a pseudo-random *unit gradient vector*.
 *  2. The noise value at (x, y) is the interpolation of the four
 *     corner contributions — each the DOT PRODUCT of the corner's
 *     gradient with the displacement vector from that corner.
 *  3. Interpolation weights use the quintic smoothstep
 *     f(t) = 6t⁵ − 15t⁴ + 10t³, whose first AND second derivatives
 *     vanish at t = 0 and t = 1, eliminating the lattice artifacts
 *     (visible "banding" creases) of the original cubic 3t² − 2t³.
 *
 * Everything runs client-side; no dependencies.
 */

/** 8 unit-ish gradient directions (axis + diagonal), per Perlin 2002. */
const GRADIENTS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [Math.SQRT1_2, Math.SQRT1_2],
  [-Math.SQRT1_2, Math.SQRT1_2],
  [Math.SQRT1_2, -Math.SQRT1_2],
  [-Math.SQRT1_2, -Math.SQRT1_2],
];

/** Quintic smoothstep: 6t⁵ − 15t⁴ + 10t³ (C² continuous). */
const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

const lerp = (a: number, b: number, t: number): number => a + t * (b - a);

export interface Noise2D {
  /** Single octave of gradient noise, range ≈ [−1, 1]. */
  (x: number, y: number): number;
}

/**
 * Build a gradient-noise sampler with its own shuffled permutation
 * table (Fisher–Yates), so every wallpaper generation gets a fresh,
 * non-repeating field.
 */
export function createNoise2D(randomFn: () => number = Math.random): Noise2D {
  // Doubled 256-entry permutation table avoids index wrapping checks.
  const perm = new Uint8Array(512);
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  /** Dot product of the hashed corner gradient with displacement (dx, dy). */
  const grad = (hash: number, dx: number, dy: number): number => {
    const [gx, gy] = GRADIENTS[hash & 7];
    return gx * dx + gy * dy;
  };

  return (x: number, y: number): number => {
    // Lattice cell containing the point.
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    // Displacement inside the cell.
    const dx = x - Math.floor(x);
    const dy = y - Math.floor(y);
    // Quintic interpolation weights.
    const u = fade(dx);
    const v = fade(dy);
    // Hash the four cell corners.
    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];
    // Corner dot products, bilinearly blended with faded weights.
    return lerp(
      lerp(grad(aa, dx, dy), grad(ba, dx - 1, dy), u),
      lerp(grad(ab, dx, dy - 1), grad(bb, dx - 1, dy - 1), u),
      v,
    );
  };
}

/**
 * Fractal Brownian motion: sum `octaves` layers of noise, each at
 * double frequency and `gain`× amplitude, normalized to ≈ [−1, 1].
 * This is what turns smooth single-octave noise into natural,
 * detail-rich, non-repeating texture.
 */
export function fbm(
  noise: Noise2D,
  x: number,
  y: number,
  octaves = 4,
  gain = 0.5,
): number {
  let sum = 0;
  let amplitude = 1;
  let norm = 0;
  let fx = x;
  let fy = y;
  for (let i = 0; i < octaves; i++) {
    sum += amplitude * noise(fx, fy);
    norm += amplitude;
    amplitude *= gain;
    fx *= 2;
    fy *= 2;
  }
  return sum / norm;
}
