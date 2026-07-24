/**
 * Pure client-side wallpaper rendering engine.
 * All drawing happens on an HTML5 Canvas in the browser —
 * no backend, no uploads, zero server cost.
 */

import { createNoise2D, fbm } from "@/lib/noise";

export interface Palette {
  id: string;
  name: string;
  /** Ordered light→dark; the renderer picks from these freely. */
  colors: [string, string, string, string];
}

export interface Resolution {
  id: string;
  label: string;
  width: number;
  height: number;
}

export type StyleId =
  | "flow"
  | "cosmic"
  | "gradient"
  | "waves"
  | "geometric"
  | "aurora"
  | "mandala"
  | "landscape"
  | "parametric"
  | "chladni"
  | "julia"
  | "lorenz"
  | "flora"
  | "tokyo"
  | "rome";
export type Tone = "light" | "dark";

export interface RenderOptions {
  style: StyleId;
  palette: Palette;
  resolution: Resolution;
  tone: Tone;
}

export const PALETTES: Palette[] = [
  {
    id: "obsidian_gold",
    name: "Obsidian Gold",
    colors: ["#faf6ee", "#e5c185", "#b38b47", "#11100e"],
  },
  {
    id: "royal_velvet",
    name: "Royal Velvet",
    colors: ["#fcf8f5", "#e0b083", "#772b3a", "#260c12"],
  },
  {
    id: "sage_platinum",
    name: "Sage & Platinum",
    colors: ["#f3f5f3", "#d2dad1", "#768c74", "#1b291d"],
  },
  {
    id: "monaco_midnight",
    name: "Monaco Midnight",
    colors: ["#f1f4f8", "#b0c1d4", "#2c4a6f", "#091424"],
  },
  {
    id: "dawn",
    name: "Dawn Haze",
    colors: ["#f6e7d7", "#efb7a3", "#b96d8c", "#4f3a65"],
  },
  {
    id: "fjord",
    name: "Fjord",
    colors: ["#dfe9ec", "#93b8c4", "#3d6b7d", "#152836"],
  },
  {
    id: "matcha",
    name: "Matcha",
    colors: ["#f1eee2", "#c3cf9f", "#7d9b6a", "#33472f"],
  },
  {
    id: "graphite",
    name: "Graphite",
    colors: ["#e8e6e3", "#9e9a94", "#4d4a46", "#191817"],
  },
  {
    id: "rose",
    name: "Rose",
    colors: ["#f7dcd0", "#f0a8b0", "#d64f70", "#7a2440"],
  },
  {
    id: "midnight",
    name: "Midnight",
    colors: ["#e3e6f2", "#8f9bc4", "#3f4a7e", "#141b33"],
  },
  {
    id: "gilded",
    name: "Gilded",
    colors: ["#f6e8c8", "#ddb36c", "#8a6431", "#171008"],
  },
  {
    id: "emerald",
    name: "Emerald",
    colors: ["#e9f3ec", "#a8ccb4", "#2f6e50", "#0a2018"],
  },
];

export const RESOLUTIONS: Resolution[] = [
  { id: "desktop4k", label: "Desktop 4K", width: 3840, height: 2160 },
  { id: "iphone", label: "iPhone", width: 1290, height: 2796 },
  { id: "ipad", label: "iPad", width: 2048, height: 2732 },
  { id: "macbook", label: "MacBook", width: 3024, height: 1964 },
];

export const STYLES: { id: StyleId; name: string }[] = [
  { id: "flow", name: "Flow" },
  { id: "cosmic", name: "Cosmic" },
  { id: "gradient", name: "Gradient" },
  { id: "aurora", name: "Aurora" },
  { id: "waves", name: "Waves" },
  { id: "geometric", name: "Geometric" },
  { id: "mandala", name: "Mandala" },
  { id: "landscape", name: "Landscape" },
  { id: "parametric", name: "Parametric" },
  { id: "chladni", name: "Chladni" },
  { id: "julia", name: "Julia" },
  { id: "lorenz", name: "Lorenz" },
  { id: "flora", name: "Fractal Flora" },
  { id: "tokyo", name: "Tokyo Neon Grid" },
  { id: "rome", name: "Roman Colosseum" },
];

/* ---------- helpers ---------- */

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

/** Tone decides which end of the palette dominates the background. */
const baseColor = (p: Palette, tone: Tone) =>
  tone === "light" ? p.colors[0] : p.colors[3];
const farColor = (p: Palette, tone: Tone) =>
  tone === "light" ? p.colors[1] : p.colors[2];

function paintBase(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, baseColor(p, tone));
  g.addColorStop(1, farColor(p, tone));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Build a 256-entry RGB lookup table interpolating linearly across the
 * palette's four stops (tone decides direction). Sampling a smooth
 * noise field through a LUT quantizes to 256 levels; the renderer
 * dithers the sample index to keep transitions band-free.
 */
export function buildPaletteLUT(p: Palette, tone: Tone): Uint8ClampedArray {
  const stops = (tone === "light" ? p.colors : [...p.colors].reverse()).map(
    (hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ],
  );
  const lut = new Uint8ClampedArray(256 * 3);
  const segments = stops.length - 1;
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * segments;
    const s = Math.min(segments - 1, Math.floor(t));
    const f = t - s;
    for (let c = 0; c < 3; c++) {
      lut[i * 3 + c] = Math.round(stops[s][c] + (stops[s + 1][c] - stops[s][c]) * f);
    }
  }
  return lut;
}

/* ---------- styles ---------- */

/**
 * Domain-warped fractal gradient noise, rendered per-pixel into an
 * ImageData typed array on a reduced-scale offscreen canvas, then
 * upscaled with high-quality smoothing. Smooth noise loses nothing
 * in the upscale, and it keeps 4K generation fast (≈1M samples
 * instead of 8.3M) — all client-side, $0 server compute.
 */
function drawFlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const scale = Math.min(1, 1280 / Math.max(w, h));
  const sw = Math.max(1, Math.round(w * scale));
  const sh = Math.max(1, Math.round(h * scale));

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const octx = off.getContext("2d");
  if (!octx) return;

  const noise = createNoise2D();
  const warp = createNoise2D();
  const lut = buildPaletteLUT(p, tone);

  // Base frequency: ~1.5–2.5 noise cells across the long edge.
  const freq = rand(1.5, 2.5) / Math.max(sw, sh);
  const warpAmount = rand(0.6, 1.4); // domain-warp strength (in cells)

  const img = octx.createImageData(sw, sh);
  const data = img.data; // Uint8ClampedArray — one pass, no per-pixel GC
  let i = 0;
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const nx = x * freq;
      const ny = y * freq;
      // Warp the sampling domain with a second field — this is what
      // bends the pattern into organic, never-repeating currents.
      const wx = fbm(warp, nx + 5.2, ny + 1.3, 3);
      const wy = fbm(warp, nx + 9.7, ny + 8.1, 3);
      const n = fbm(noise, nx + warpAmount * wx, ny + warpAmount * wy, 4);
      // Map [−1, 1] → [0, 255] with ±1 random dither to break banding.
      const t = (n + 1) * 0.5 * 255 + (Math.random() - 0.5) * 2;
      const idx = (Math.min(255, Math.max(0, t)) | 0) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, w, h);
}

/**
 * Clifford attractor — "Cosmic" mode. Iterates
 *   x' = sin(a·y) + c·cos(a·x)
 *   y' = sin(b·x) + d·cos(b·y)
 * and plots hundreds of thousands of low-opacity points whose
 * overlap accumulates into a glowing particle nebula.
 */
function drawCosmic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const dark = tone === "dark";

  // Randomize a, b, c, d per generation; some parameter sets collapse
  // to a point or a thin loop, so resample until the orbit's bounding
  // box shows a genuinely 2D spread (or fall back to a known-good set).
  let a = 0, b = 0, c = 0, d = 0;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  let ok = false;
  for (let attempt = 0; attempt < 12 && !ok; attempt++) {
    a = rand(-2, 2);
    b = rand(-2, 2);
    c = rand(-2, 2);
    d = rand(-2, 2);
    let x = 0.1, y = 0.1;
    minX = Infinity; maxX = -Infinity; minY = Infinity; maxY = -Infinity;
    // Discard the transient, then probe extent AND coverage: a periodic
    // orbit can span a wide box while visiting only a handful of points,
    // so also count distinct cells on a coarse 64×64 grid.
    const cells = new Set<number>();
    for (let i = 0; i < 4000; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      const ny = Math.sin(b * x) + d * Math.cos(b * y);
      x = nx; y = ny;
      if (i > 200) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        // Orbit values live in [-3, 3]; quantize to grid cells.
        const gx = Math.min(63, Math.max(0, Math.floor(((x + 3) / 6) * 64)));
        const gy = Math.min(63, Math.max(0, Math.floor(((y + 3) / 6) * 64)));
        cells.add(gx * 64 + gy);
      }
    }
    ok =
      Number.isFinite(minX) &&
      maxX - minX > 1 &&
      maxY - minY > 1 &&
      cells.size > 350;
  }
  if (!ok) {
    // Classic well-behaved Clifford parameters.
    a = -1.4; b = 1.6; c = 1.0; d = 0.7;
    minX = -1 - Math.abs(c); maxX = 1 + Math.abs(c);
    minY = -1 - Math.abs(d); maxY = 1 + Math.abs(d);
  }

  // Background: deepest palette tone (glow needs darkness; in light
  // tone the points are dark inks on the palette's palest color).
  ctx.fillStyle = dark ? p.colors[3] : p.colors[0];
  ctx.fillRect(0, 0, w, h);

  // Map orbit space → canvas: uniform scale, centered, 8% margin,
  // resolution-independent (works for 4K landscape and iPhone portrait).
  const margin = 0.08;
  const scale = Math.min(
    (w * (1 - 2 * margin)) / (maxX - minX),
    (h * (1 - 2 * margin)) / (maxY - minY),
  );
  const offX = (w - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = (h - (maxY - minY) * scale) / 2 - minY * scale;

  // Palette-tinted point colors at very low alpha; density accumulates
  // the glow. "lighter" compositing makes dark-tone overlaps luminous.
  const inks = (dark ? p.colors.slice(0, 3) : p.colors.slice(1)) as string[];
  const alpha = dark ? "14" : "10"; // hex alpha ≈ 0.08 / 0.06
  ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

  // Iteration count scales with pixel count: ~600k on iPhone, ~1.2M at
  // 4K — dense enough to glow, and measured ≈1s at 4K so a synchronous
  // pass stays within the same budget as the Flow style (no rAF
  // batching needed; the UI never freezes beyond a single beat).
  const iterations = Math.round(
    Math.min(1_200_000, Math.max(600_000, ((w * h) / (3840 * 2160)) * 1_200_000)),
  );
  const dot = Math.max(1, Math.round(Math.min(w, h) / 1400)); // 1–2 px

  // Color by *iteration chunk*, not by x-position: each chunk of the
  // orbit covers the whole attractor spatially, so the hues blend
  // through overlap instead of meeting at a hard positional seam.
  const chunk = Math.ceil(iterations / inks.length);
  let x = 0.1, y = 0.1;
  for (let bucket = 0; bucket < inks.length; bucket++) {
    ctx.fillStyle = inks[bucket] + alpha;
    const end = Math.min(iterations, (bucket + 1) * chunk) - bucket * chunk;
    for (let i = 0; i < end; i++) {
      const nx = Math.sin(a * y) + c * Math.cos(a * x);
      const ny = Math.sin(b * x) + d * Math.cos(b * y);
      x = nx; y = ny;
      ctx.fillRect(x * scale + offX, y * scale + offY, dot, dot);
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

/** Lighten (factor > 1) or darken (factor < 1) a #rrggbb color. */
export function shade(hex: string, factor: number): string {
  let out = "#";
  for (let i = 1; i < 7; i += 2) {
    const v = Math.min(
      255,
      Math.max(0, Math.round(parseInt(hex.slice(i, i + 2), 16) * factor)),
    );
    out += v.toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * Shape modifiers for one generation's petals. All are sampled from a
 * single "form" factor (0 = sharp crystal, 1 = wide lotus leaf) so
 * pointiness and curvature never contradict each other.
 */
interface PetalShape {
  /** Where the widest point sits along the petal (0.42 dagger → 0.68 leaf). */
  peak: number;
  /** Side-bulge control multiplier (1.2 faceted crystal → 2.4 soft lotus). */
  bulge: number;
  /** Center ridge width as a fraction of the petal half-width. */
  ridge: number;
}

/** Sample coherent petal shape modifiers from one random form factor. */
function randomPetalShape(): PetalShape {
  const form = Math.random(); // 0 = crystal, 1 = lotus
  return {
    peak: 0.42 + form * 0.26,
    bulge: 1.2 + form * 1.2,
    ridge: 0.24 + form * 0.14,
  };
}

/**
 * Draw one origami petal along the +y axis, base at the origin, tip
 * at `length`. The silhouette is two quadratic curves bulging to
 * ±halfWidth at `shape.peak` of the length. Three solid facets —
 * dark left half, lit right half, bright center ridge — make the
 * fold read as 3D paper. Fills only, no strokes.
 */
function drawPetal(
  ctx: CanvasRenderingContext2D,
  length: number,
  halfWidth: number,
  color: string,
  shape: PetalShape,
) {
  const midY = length * shape.peak; // widest point of the petal

  // Right half (lit side): curve out toward +halfWidth, back along the
  // seam. A quadratic curve's widest point reaches half its
  // control-point offset, so bulge 2 ≈ full intended width; smaller
  // values pull the sides flat and read as crystal facets.
  ctx.fillStyle = shade(color, 1.08);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(halfWidth * shape.bulge, midY, 0, length);
  ctx.closePath();
  ctx.fill();

  // Left half (shadow side of the fold).
  ctx.fillStyle = shade(color, 0.74);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-halfWidth * shape.bulge, midY, 0, length);
  ctx.closePath();
  ctx.fill();

  // Center ridge: a slim inner diamond catching the light.
  ctx.fillStyle = shade(color, 1.22);
  ctx.beginPath();
  ctx.moveTo(0, length * 0.08);
  ctx.lineTo(-halfWidth * shape.ridge, midY);
  ctx.lineTo(0, length * 0.94);
  ctx.lineTo(halfWidth * shape.ridge, midY);
  ctx.closePath();
  ctx.fill();
}

/**
 * Geometric origami mandala: concentric layers of solid folded-paper
 * petals, drawn outermost-first so each smaller layer stacks on top.
 */
function drawMandala(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const cx = w / 2;
  const cy = h / 2;
  // Dynamic rose formula: n petals per layer stays constant within a
  // generation (varying it between layers breaks the interlock); layer
  // radius shrinks geometrically r(k) = R·s^k; each layer rotates by a
  // randomized fraction of a step so the petals interlock uniquely.
  const layers = 6 + Math.floor(rand(0, 9)); // 6–14
  const petals = 10 + Math.floor(rand(0, 15)); // 10–24
  const maxRadius = Math.min(w, h) * rand(0.38, 0.46);
  // Adaptive shrink: solve s so the innermost layer always lands near
  // 12% of the max radius — few layers shrink faster, many slower, and
  // the flower closes toward its heart either way.
  const shrink = Math.pow(0.12, 1 / layers);
  const step = (Math.PI * 2) / petals;
  const overlap = rand(1.05, 1.35);
  const shape = randomPetalShape(); // crystal ↔ lotus form
  const baseAngle = rand(0, Math.PI * 2);
  // Two alternating layer inks — deep rose and pale cream — sampled
  // from opposite ends of the palette (away from the background end).
  const [deep, pale] =
    tone === "light"
      ? [p.colors[2], shade(p.colors[1], 1.15)]
      : [p.colors[1], shade(p.colors[0], 0.92)];

  // Soft drop shadow gives the paper stack physical depth.
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = maxRadius * 0.03;
  ctx.shadowOffsetY = maxRadius * 0.012;

  let radius = maxRadius;
  let offset = baseAngle;
  for (let layer = 0; layer < layers; layer++) {
    // Advance 30–70% of a step per layer: always inside the previous
    // layer's gap (interlocked), never aligned, unique every time.
    if (layer > 0) offset += step * rand(0.3, 0.7);
    // Alternate deep/pale, drifting darker toward the heart of the rose.
    const color = shade(layer % 2 === 0 ? pale : deep, 1 - layer * 0.02);
    const halfWidth = radius * Math.tan(step / 2) * overlap;

    for (let i = 0; i < petals; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(offset + i * step);
      drawPetal(ctx, radius, halfWidth, color, shape);
      ctx.restore();
    }
    radius *= shrink;
  }

  // Tiny bright heart closes the spiral cleanly.
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = shade(p.colors[tone === "light" ? 0 : 1], 1.1);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Procedural silhouette landscape — Musgrave-style fBm terrain with
 * atmospheric perspective. Each ridge line is a per-x sum of noise
 * octaves (lacunarity 2, randomized gain); layers render back-to-front,
 * far ridges sitting higher, lighter and flatter (fog), near ridges
 * lower, darker and rougher.
 */
function drawLandscape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // Sky: soft vertical gradient from the palette's background end.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, shade(baseColor(p, tone), tone === "light" ? 1.06 : 0.9));
  sky.addColorStop(1, farColor(p, tone));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // A hazy sun/moon disc gives the composition a focal point.
  const orbX = rand(0.2, 0.8) * w;
  const orbY = rand(0.14, 0.3) * h;
  const orbR = rand(0.05, 0.09) * Math.min(w, h);
  const glow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 4);
  const orbColor = tone === "light" ? "#ffffff" : shade(p.colors[0], 1.05);
  glow.addColorStop(0, orbColor + "e6");
  glow.addColorStop(0.25, orbColor + "66");
  glow.addColorStop(1, orbColor + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const noise = createNoise2D();
  const lut = buildPaletteLUT(p, tone);
  const layers = 5 + Math.floor(rand(0, 4)); // 5–8 ridge lines
  // Per-generation randomization: base frequency, roughness (fBm gain),
  // amplitude and a noise-space offset so every range is unique.
  const baseFreq = rand(1.6, 3.2) / w;
  const gain = rand(0.48, 0.62); // Musgrave: higher gain → rougher ridges
  const baseAmp = rand(0.1, 0.16) * h;
  const xOffset = rand(0, 1000);
  // Sample every ~2px at 4K (invisible after filling), every px on small
  // canvases — keeps the loop fast at any resolution.
  const stepX = Math.max(1, Math.round(w / 1920));

  for (let layer = 0; layer < layers; layer++) {
    const depth = layer / (layers - 1); // 0 = farthest, 1 = nearest
    // Atmospheric perspective: near ridges sit lower, swing higher,
    // and carry more octave detail than the fog-flattened far ones.
    const horizon = h * (0.34 + 0.52 * depth);
    const amp = baseAmp * (0.45 + 0.9 * depth);
    const freq = baseFreq * (1 + depth * rand(0.4, 0.9));
    const octaves = 3 + Math.round(depth * 2); // 3 far → 5 near
    const ridgeSeed = layer * 7.31 + rand(0, 3);
    // Nearest ridge is always the darkest silhouette; the farthest
    // fades toward the sky. The LUT runs background-end → far-end, so
    // in light tone darkness grows with depth, while in dark tone the
    // dark end sits at index 0 and haze brightens with distance
    // against the moonlit horizon.
    const t = tone === "light" ? 0.25 + 0.75 * depth : 0.55 * (1 - depth) + 0.02;
    const idx = Math.round(t * 255) * 3;
    ctx.fillStyle = `rgb(${lut[idx]},${lut[idx + 1]},${lut[idx + 2]})`;

    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += stepX) {
      const y = horizon + fbm(noise, x * freq + xOffset, ridgeSeed, octaves, gain) * amp;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Yeganeh-inspired parametric curve family. In the spirit of Hamid
 * Naderi Yeganeh's "A Bird in Flight": thousands of primitives whose
 * positions are pure trigonometric functions of the index — here with
 * randomized integer harmonics so every generation is a new figure.
 *
 * Two families:
 *  · segments — chords A(t) → B(t) between two Lissajous-like loci,
 *    weaving a silky string-art surface;
 *  · circles  — a drifting family of thin rings tracing an envelope.
 */
function drawParametric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const inks =
    tone === "light" ? p.colors.slice(1) : (p.colors.slice(0, 3) as string[]);
  const lut = buildPaletteLUT(p, tone);
  const TAU = Math.PI * 2;
  // Random integer harmonics keep the curves closed and periodic;
  // the phase de-correlates x from y.
  const H = () => 1 + Math.floor(rand(0, 5)); // 1–5
  const [ha, hb, hc, hd] = [H(), H(), H(), H()];
  const phase = rand(0, TAU);
  const family = pick(["segments", "circles", "yeganeh_bird"] as const);
  const N = family === "yeganeh_bird" ? 1000 : (family === "segments" ? 2200 : 900);

  // Locus functions in abstract [-1, 1]² space.
  const ax = (t: number) => {
    if (family === "yeganeh_bird") {
      return 1.5 * Math.pow(Math.sin(TAU * t + Math.PI / 3), 7);
    }
    return Math.pow(Math.sin(TAU * ha * t + phase), 3);
  };
  const ay = (t: number) => {
    if (family === "yeganeh_bird") {
      return -0.25 * Math.pow(Math.cos(3 * TAU * t), 2); // inverted for canvas coordinates
    }
    return -Math.cos(TAU * hb * t);
  };
  const bx = (t: number) => {
    if (family === "yeganeh_bird") {
      return 0.2 * Math.sin(3 * TAU * t + Math.PI / 5);
    }
    return 0.85 * Math.sin(TAU * hc * t);
  };
  const by = (t: number) => {
    if (family === "yeganeh_bird") {
      return 0.66 * Math.pow(Math.sin(TAU * t - Math.PI / 3), 2); // inverted for canvas coordinates
    }
    return -0.85 * Math.pow(Math.cos(TAU * hd * t + phase), 3);
  };

  // Measure bounds over the family, then fit (uniform, centered, 10% margin).
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    for (const [x, y] of [
      [ax(t), ay(t)],
      [bx(t), by(t)],
    ]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const scale = Math.min((w * 0.8) / spanX, (h * 0.8) / spanY);
  const offX = (w - spanX * scale) / 2 - minX * scale;
  const offY = (h - spanY * scale) / 2 - minY * scale;

  ctx.lineWidth = Math.max(1, Math.min(w, h) / 1800);
  if (family === "segments" || family === "yeganeh_bird") {
    // One stroke pass per ink, interleaved through t so the colors
    // weave together instead of forming blocks.
    for (let k = 0; k < inks.length; k++) {
      ctx.strokeStyle = inks[k] + (family === "yeganeh_bird" ? "4d" : "3d"); // ~30% alpha for bird lines
      ctx.beginPath();
      for (let i = k; i <= N; i += inks.length) {
        const t = i / N;
        ctx.moveTo(ax(t) * scale + offX, ay(t) * scale + offY);
        ctx.lineTo(bx(t) * scale + offX, by(t) * scale + offY);
      }
      ctx.stroke();
    }
  } else {
    // Ring family: radius modulated by its own harmonic, color drawn
    // through the palette ramp along t.
    const hr = H();
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const r =
        (0.06 + 0.16 * Math.abs(Math.sin(TAU * hr * t + phase))) * scale * 0.5;
      const l = Math.round(t * 255) * 3;
      ctx.strokeStyle = `rgba(${lut[l]},${lut[l + 1]},${lut[l + 2]},0.22)`;
      ctx.beginPath();
      ctx.arc(ax(t) * scale + offX, ay(t) * scale + offY, r, 0, TAU);
      ctx.stroke();
    }
  }
}

/** Layered radial "mesh" gradient — soft glowing blobs of palette colors. */
function drawGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  const blobs = 5 + Math.floor(rand(0, 3));
  for (let i = 0; i < blobs; i++) {
    const x = rand(0, w);
    const y = rand(0, h);
    const r = rand(0.35, 0.75) * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const color = pick(p.colors);
    g.addColorStop(0, color + "cc");
    g.addColorStop(1, color + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

/**
 * Physically-motivated aurora curtains, after Baranoski et al.,
 * "Simulating the Aurora" (Pacific Graphics 2000 / J. Vis. Comput.
 * Anim. 2003): each curtain is a sheet of vertical rays whose feet
 * follow a folded footprint arc (fBm wander + sinusoidal
 * Kelvin–Helmholtz-style folds), and each ray's brightness follows a
 * Chapman emission profile — I(z) ∝ exp(1 − z − e^(−z)) — bright at
 * the curtain's lower edge, fading toward the top.
 */
function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const dark = tone === "dark";
  // Night-sky gradient base.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, shade(baseColor(p, tone), dark ? 0.75 : 1.05));
  sky.addColorStop(1, baseColor(p, tone));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Faint starfield on dark skies.
  if (dark) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    const stars = Math.round((w * h) / 60000);
    for (let i = 0; i < stars; i++) {
      const s = rand(0.4, 1.4) * (w / 3840);
      ctx.globalAlpha = rand(0.15, 0.7);
      ctx.fillRect(rand(0, w), rand(0, h * 0.85), Math.max(1, s), Math.max(1, s));
    }
    ctx.globalAlpha = 1;
  }

  // Curtain colors: lower edge takes the palette's brightest ink,
  // upper reaches its deeper hue (like green → red/purple altitudes).
  const [lower, upper] = dark
    ? [p.colors[0], p.colors[1]]
    : [p.colors[2], p.colors[3]];
  // Chapman profile I(z) ∝ exp(1 − z − e^(−z)), z = normalized height
  // above the curtain foot, peaking just above z = 0. Sampled into
  // gradient stops per ray.
  const chapman = (z: number) => Math.exp(1 - z - Math.exp(-z));

  const noise = createNoise2D();
  ctx.globalCompositeOperation = dark ? "lighter" : "source-over";

  const curtains = 2 + Math.floor(rand(0, 2)); // 2–3 sheets
  const colW = Math.max(2, Math.round(w / 640)); // ray width
  for (let cIdx = 0; cIdx < curtains; cIdx++) {
    const baseY = h * rand(0.45, 0.72) - cIdx * h * 0.08;
    const wanderAmp = h * rand(0.1, 0.18);
    const foldAmp = h * rand(0.015, 0.035);
    const foldFreq = rand(3, 8) * ((Math.PI * 2) / w);
    const foldPhase = rand(0, Math.PI * 2);
    const rayBase = h * rand(0.3, 0.45); // curtain height
    const seed = cIdx * 11.7 + rand(0, 3);
    const alpha = dark ? 0.5 / curtains + 0.12 : 0.55;

    for (let x = 0; x < w; x += colW) {
      const t = x / w;
      // Footprint arc: fBm wander dominates; the sinusoidal folds are
      // noise-modulated so they appear in localized trains (as K-H
      // vortex folds do) instead of a uniform periodic wave.
      const foldGate = 0.5 + 0.5 * fbm(noise, t * 3, seed + 8.3, 2);
      const foot =
        baseY +
        fbm(noise, t * 3.5, seed, 4) * wanderAmp +
        Math.sin(x * foldFreq + foldPhase) * foldAmp * foldGate;
      // Ray length varies sharply along the arc — individual searchlight
      // rays are what make a curtain read as aurora, not a smooth band.
      const len =
        rayBase *
        (0.25 + 0.75 * Math.pow(Math.abs(fbm(noise, t * 16, seed + 4.2, 4)), 1.3));

      const g = ctx.createLinearGradient(0, foot, 0, foot - len);
      // Sample the Chapman profile at 4 altitudes (z ≈ 0, 0.6, 1.8, 3.6).
      g.addColorStop(0, lower + "00"); // soft under-edge
      g.addColorStop(0.06, hexWithAlpha(lower, chapman(0.2) * alpha));
      g.addColorStop(0.35, hexWithAlpha(lower, chapman(0.9) * alpha));
      g.addColorStop(0.7, hexWithAlpha(upper, chapman(2.2) * alpha * 0.9));
      g.addColorStop(1, upper + "00");
      ctx.fillStyle = g;
      ctx.fillRect(x, foot - len, colW, len);
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

/** #rrggbb + numeric alpha (0–1) → 8-digit hex color. */
function hexWithAlpha(hex: string, a: number): string {
  const v = Math.round(Math.min(1, Math.max(0, a)) * 255);
  return hex + v.toString(16).padStart(2, "0");
}

/** Stacked sine-curve bands flowing across the frame. */
function drawWaves(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  const noise = createNoise2D();
  const bands = 6 + Math.floor(rand(0, 4));
  for (let i = 0; i < bands; i++) {
    const baseY = (h / (bands + 1)) * (i + 1) + rand(-h * 0.05, h * 0.05);
    const amp = rand(0.03, 0.1) * h;
    const freq = rand(1, 3) * ((Math.PI * 2) / w);
    const phase = rand(0, Math.PI * 2);
    // Fractal-noise perturbation on top of the sine carrier breaks the
    // perfect periodicity that made bands read as mechanical repeats.
    const nAmp = rand(0.4, 0.9) * amp;
    const nFreq = rand(2, 4) / w;

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= w; x += Math.max(2, w / 800)) {
      const drift = fbm(noise, x * nFreq, i * 0.73, 3) * nAmp;
      ctx.lineTo(x, baseY + Math.sin(x * freq + phase) * amp + drift);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = pick(p.colors) + "b8";
    ctx.fill();
  }
}

/**
 * Bauhaus-poster geometric composition: a sun disc anchored on a
 * rule-of-thirds point, an offset ring accent, and translucent
 * horizon bands — always balanced, never random scatter.
 */
function drawGeometric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  const inks =
    tone === "light" ? p.colors.slice(1) : (p.colors.slice(0, 3) as string[]);

  // Sun disc on a rule-of-thirds anchor, with a soft cast shadow.
  const cx = w * pick([1 / 3, 0.5, 2 / 3]);
  const cy = h * rand(0.3, 0.42);
  const r = Math.min(w, h) * rand(0.16, 0.26);
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = r * 0.3;
  ctx.shadowOffsetY = r * 0.08;
  ctx.fillStyle = inks[0];
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Concentric ring accent, slightly offset for tension.
  ctx.strokeStyle = inks[1 % inks.length] + "b8";
  ctx.lineWidth = r * rand(0.05, 0.09);
  ctx.beginPath();
  ctx.arc(cx + r * rand(-0.25, 0.25), cy + r * rand(-0.15, 0.25), r * rand(1.3, 1.6), 0, Math.PI * 2);
  ctx.stroke();

  // Layered translucent horizon bands over the lower third — they
  // clip across the sun, giving the flat shapes spatial depth.
  const horizon = h * rand(0.58, 0.7);
  const bands = 3 + Math.floor(rand(0, 3));
  let y = horizon;
  for (let i = 0; i < bands; i++) {
    const bandH = ((h - horizon) / bands) * rand(0.85, 1.3);
    ctx.fillStyle = inks[(i + 1) % inks.length] + "a6";
    ctx.fillRect(0, y, w, h - y);
    y += bandH;
  }
}

/**
 * Ernst Chladni resonance acoustic patterns.
 * Evaluates the node equation cos(n*pi*x)*cos(m*pi*y) - cos(m*pi*x)*cos(n*pi*y) = 0.
 * Rendered using a dense stochastic scatter of point sand to keep it clean.
 */
function drawChladni(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  const dark = tone === "dark";
  const sandColor = dark ? p.colors[0] : p.colors[3];
  ctx.fillStyle = sandColor + "1a"; // Soft particles

  // Pick resonant harmonics
  const n = Math.floor(rand(2, 8));
  const m = Math.floor(rand(3, 9));

  const particles = Math.round(w * h * 0.15);
  for (let i = 0; i < particles; i++) {
    const px = Math.random();
    const py = Math.random();

    // Chladni nodal plate equation
    const val =
      Math.cos(n * Math.PI * px) * Math.cos(m * Math.PI * py) -
      Math.cos(m * Math.PI * px) * Math.cos(n * Math.PI * py);

    // If close to nodal line, deposit a grain of sand
    if (Math.abs(val) < 0.12) {
      ctx.fillRect(px * w, py * h, 1.5, 1.5);
    }
  }
}

/**
 * Julia fractal set with clean smooth tone mapping.
 * Uses z' = z^2 + c with dynamic parameters c to draw minimal organic boundaries.
 */
function drawJulia(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const scale = Math.min(1, 1000 / Math.max(w, h));
  const sw = Math.max(1, Math.round(w * scale));
  const sh = Math.max(1, Math.round(h * scale));

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const octx = off.getContext("2d");
  if (!octx) return;

  const img = octx.createImageData(sw, sh);
  const data = img.data;
  const lut = buildPaletteLUT(p, tone);

  // Julia parameter seed (c) picked to give clean, minimalist shapes
  const cx = rand(-0.8, -0.4);
  const cy = rand(0.1, 0.3);
  const maxIt = 45;

  let i = 0;
  for (let y = 0; y < sh; y++) {
    const j = (y / sh - 0.5) * 3.0;
    for (let x = 0; x < sw; x++) {
      const r = (x / sw - 0.5) * 3.0 * (sw / sh);

      let zr = r;
      let zi = j;
      let it = 0;

      // Iteration loop
      while (zr * zr + zi * zi < 4 && it < maxIt) {
        const temp = zr * zr - zi * zi + cx;
        zi = 2.0 * zr * zi + cy;
        zr = temp;
        it++;
      }

      // Smooth color mapping for modern minimal look
      let t = 0;
      if (it < maxIt) {
        const log_zn = Math.log(zr * zr + zi * zi) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        t = (it + 1 - nu) / maxIt;
      }

      const idx = (Math.min(255, Math.max(0, (t * 255) | 0)) | 0) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, w, h);
}

/**
 * Lorenz Attractor in Chaos Theory.
 * Simulates Lorenz differential equations in 3D and projects it cleanly.
 */
function drawLorenz(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  const dark = tone === "dark";
  const ink = dark ? p.colors[0] : p.colors[3];

  // Parameters
  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;

  let x = 0.1, y = 0, z = 0;
  const dt = 0.006;
  const steps = 14000;

  // Track 3D points
  const points: {x: number, y: number, z: number}[] = [];
  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push({x, y, z});
  }

  // Centering project
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const cos = Math.cos(0.5);
  const sin = Math.sin(0.5);

  const projected = points.map(pt => {
    // Rotate slightly in 3D space to look artistic
    const rx = pt.x * cos - pt.z * sin;
    const rz = pt.x * sin + pt.z * cos;
    return { x: rx, y: pt.y, z: rz };
  });

  projected.forEach(pt => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const scale = Math.min(w * 0.7 / spanX, h * 0.7 / spanY);
  const cx = w / 2 - (minX + spanX / 2) * scale;
  const cy = h / 2 - (minY + spanY / 2) * scale;

  // Draw clean trails
  ctx.strokeStyle = ink + "1f"; // Very fine translucent lines
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  projected.forEach((pt, idx) => {
    const px = pt.x * scale + cx;
    const py = pt.y * scale + cy;
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
}

/**
 * Fractal Flora.
 * Creates elegant, clean organic flower structures spreading across the canvas.
 * Derived from the boundaries of the complex transcendental Julia Set: z' = sin(z) * c.
 */
function drawFlora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // Paint standard background wash
  paintBase(ctx, w, h, p, tone);

  const dark = tone === "dark";
  const lut = buildPaletteLUT(p, tone);

  const scale = Math.min(1, 1000 / Math.max(w, h));
  const sw = Math.max(1, Math.round(w * scale));
  const sh = Math.max(1, Math.round(h * scale));

  const off = document.createElement("canvas");
  off.width = sw;
  off.height = sh;
  const octx = off.getContext("2d");
  if (!octx) return;

  const img = octx.createImageData(sw, sh);
  const data = img.data;

  // Transcendental Julia constant c = cx + i*cy
  // Tuned to generate organic plant-like structures with clean flower petals
  const cx = rand(1.0, 1.25);
  const cy = rand(0.1, 0.3);
  const maxIt = 30;

  // Complex sinh and cosh helpers
  const sinh = (v: number) => (Math.exp(v) - Math.exp(-v)) / 2;
  const cosh = (v: number) => (Math.exp(v) + Math.exp(-v)) / 2;

  let i = 0;
  for (let y = 0; y < sh; y++) {
    // Standard mapping to complex plane [-2, 2]
    const j = (y / sh - 0.5) * 3.2;
    for (let x = 0; x < sw; x++) {
      const r = (x / sw - 0.5) * 3.2 * (sw / sh);

      let zr = r;
      let zi = j;
      let it = 0;

      // Iterative complex function: z_next = sin(z) * c
      // Under complex trigonometry: sin(x + i*y) = sin(x)*cosh(y) + i * cos(x)*sinh(y)
      while (zr * zr + zi * zi < 25.0 && it < maxIt) {
        // sin(z) components
        const sin_r = Math.sin(zr) * cosh(zi);
        const cos_i = Math.cos(zr) * sinh(zi);

        // Complex multiplication with c = cx + i*cy
        const next_r = sin_r * cx - cos_i * cy;
        const next_i = sin_r * cy + cos_i * cx;

        zr = next_r;
        zi = next_i;
        it++;
      }

      // Extract boundary curves to draw elegant flower veins
      let density = 0;
      if (it < maxIt) {
        const log_zn = Math.log(zr * zr + zi * zi) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        const smoothIt = it + 1 - nu;

        // Overlay sinus ripples to extract leaf/petal layers
        density = Math.abs(Math.sin(smoothIt * 0.95));
      }

      const idx = (Math.min(255, Math.max(0, (density * 255) | 0)) | 0) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalCompositeOperation = dark ? "lighter" : "multiply";
  ctx.drawImage(off, 0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

/**
 * Tokyo Neon Grid (Cyber-Minimalism).
 * Generates an abstract, clean metropolis skyline using recursive grid subdivision.
 * Features thin neon accent glowing wires over dark cityscapes.
 */
function drawTokyo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  
  const dark = tone === "dark";
  const neonColor = dark ? p.colors[0] : p.colors[3];
  const windowColor = dark ? p.colors[1] : p.colors[2];

  // Base setup
  ctx.save();
  ctx.strokeStyle = neonColor + "3d"; // Translucent neon wire
  ctx.lineWidth = Math.max(1, Math.min(w, h) / 2200);

  const cityWidth = w * 0.9;
  const cityHeight = h * 0.7;
  const startX = (w - cityWidth) / 2;
  const startY = h - cityHeight;

  // Recursive subdivision algorithm to generate clean skyscrapers blocks
  function subdivide(x: number, y: number, blockW: number, blockH: number, depth: number) {
    if (depth > 4 || blockW < w * 0.05 || Math.random() < 0.2) {
      // Draw building block silhouette outline
      ctx.strokeRect(x, y, blockW, blockH);
      
      // Draw minimal repeating windows grid internally
      const winCols = Math.max(2, Math.floor(blockW / 24));
      const winRows = Math.max(3, Math.floor(blockH / 32));
      const stepX = blockW / (winCols + 1);
      const stepY = blockH / (winRows + 1);

      ctx.fillStyle = windowColor + "14"; // Ultra soft window fill
      for (let c = 1; c <= winCols; c++) {
        for (let r = 1; r <= winRows; r++) {
          if (Math.random() > 0.4) { // random lit windows
            ctx.fillRect(x + c * stepX - 2, y + r * stepY - 2, 4, 4);
          }
        }
      }
      return;
    }

    // Split vertically or horizontally
    if (Math.random() > 0.4) {
      const split = blockW * rand(0.3, 0.7);
      subdivide(x, y, split, blockH, depth + 1);
      subdivide(x + split, y, blockW - split, blockH, depth + 1);
    } else {
      const split = blockH * rand(0.4, 0.8);
      subdivide(x, y, blockW, split, depth + 1);
      subdivide(x, y + split, blockW, blockH - split, depth + 1);
    }
  }

  // Draw 8 columns of skyscraper networks
  const colCount = 6 + Math.floor(rand(0, 3));
  const colW = cityWidth / colCount;
  for (let c = 0; c < colCount; c++) {
    const colX = startX + c * colW;
    const colH = cityHeight * rand(0.5, 1.0);
    const colY = h - colH;
    subdivide(colX, colY, colW - 8, colH, 0);
  }

  ctx.restore();
}

/**
 * Roman Colosseum (Classical Arch Geometry).
 * Draws sweeping concentrical arches and columns inspired by Roman structural engineering.
 * Uses polar coordinate projection for clean, classical geometry.
 */
function drawRome(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);
  
  const dark = tone === "dark";
  const archColor = dark ? p.colors[0] : p.colors[3];
  const shadowColor = dark ? p.colors[1] : p.colors[2];

  ctx.save();
  ctx.translate(w / 2, h * 0.45); // Center Colosseum arena

  // Scale bounds
  const size = Math.min(w, h);
  const tiers = 3; // Colosseum levels
  const radiusStep = size * 0.09;
  let r = size * 0.15;

  ctx.lineWidth = Math.max(1, size / 1600);

  for (let t = 0; t < tiers; t++) {
    const nextR = r + radiusStep;
    
    // 1. Concentric horizontal support lines
    ctx.strokeStyle = archColor + "3d";
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.arc(0, 0, nextR, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Pillars and arches layout around the circle
    const archCount = 18 + t * 6; // Arches increase with radius
    const angleStep = (Math.PI * 2) / archCount;

    for (let a = 0; a < archCount; a++) {
      const angle = a * angleStep;
      
      ctx.save();
      ctx.rotate(angle);

      // Draw pillars
      ctx.strokeStyle = shadowColor + "22";
      ctx.beginPath();
      ctx.moveTo(-2, r);
      ctx.lineTo(-2, nextR);
      ctx.moveTo(2, r);
      ctx.lineTo(2, nextR);
      ctx.stroke();

      // Draw arch top curvature (bezier arches)
      ctx.strokeStyle = archColor + "4d";
      ctx.beginPath();
      const archW = r * Math.tan(angleStep / 2) * 1.5;
      const archTop = nextR - radiusStep * 0.35;
      ctx.moveTo(-archW, archTop);
      ctx.bezierCurveTo(-archW, nextR, archW, nextR, archW, archTop);
      ctx.stroke();

      ctx.restore();
    }
    
    r = nextR;
  }

  // Draw ground radial axis guidelines
  ctx.strokeStyle = shadowColor + "14";
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 32; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(i * Math.PI / 16) * r, Math.sin(i * Math.PI / 16) * r);
    ctx.stroke();
  }

  ctx.restore();
}

/* ---------- public API ---------- */

const RENDERERS: Record<
  StyleId,
  (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    p: Palette,
    tone: Tone,
  ) => void
> = {
  flow: drawFlow,
  cosmic: drawCosmic,
  gradient: drawGradient,
  aurora: drawAurora,
  waves: drawWaves,
  geometric: drawGeometric,
  mandala: drawMandala,
  landscape: drawLandscape,
  parametric: drawParametric,
  chladni: drawChladni,
  julia: drawJulia,
  lorenz: drawLorenz,
  flora: drawFlora,
  tokyo: drawTokyo,
  rome: drawRome,
};

/**
 * Render a wallpaper onto the given canvas at full target resolution.
 * Each call produces a new random composition.
 */
export function renderWallpaper(
  canvas: HTMLCanvasElement,
  { style, palette, resolution, tone }: RenderOptions,
): void {
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  RENDERERS[style](ctx, resolution.width, resolution.height, palette, tone);
}

/** Convert the canvas to a PNG blob and trigger a browser download. */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    // Append to DOM so Firefox triggers the download correctly,
    // then revoke after a short delay to prevent memory leaks
    // while still giving the browser time to initiate the download.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, "image/png");
}
