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
  deviceRef?: string;
  ppi?: string;
  panelTech?: string;
}

export type StyleId =
  | "misty_pines"
  | "silent_dunes"
  | "lunar_arches"
  | "touch_of_god"
  | "iridescent_kiss"
  | "aurora_glow"
  | "topography"
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
  | "penrose"
  | "quantum"
  | "tokyo"
  | "rome";
export type Tone = "light" | "dark";

export interface RenderOptions {
  style: StyleId;
  palette: Palette;
  resolution: Resolution;
  tone: Tone;
  seed?: number;
}

export const PALETTES: Palette[] = [
  {
    id: "misty_nordic",
    name: "Misty Nordic Pines",
    colors: ["#f2f5f4", "#a3b8b0", "#48665c", "#0f1c17"],
  },
  {
    id: "sahara_gold",
    name: "Sahara Golden Dunes",
    colors: ["#fdf6e2", "#ebc178", "#b87333", "#1f1006"],
  },
  {
    id: "lunar_shadow",
    name: "Lunar Eclipse Shadow",
    colors: ["#f8fafc", "#94a3b8", "#334155", "#020617"],
  },
  {
    id: "touch_of_god",
    name: "Touch of God",
    colors: ["#f4f7f6", "#a8c5be", "#1e3330", "#080c0c"],
  },
  {
    id: "iridescent_kiss",
    name: "Iridescent Kiss",
    colors: ["#fff2e6", "#fbd3d4", "#c1e5e6", "#8fb9cf"],
  },
  {
    id: "electric_aurora",
    name: "Electric Aurora",
    colors: ["#f0abfc", "#c084fc", "#3b82f6", "#09051d"],
  },
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
  {
    id: "amoled_black",
    name: "AMOLED True Black",
    colors: ["#f8fafc", "#60a5fa", "#2563eb", "#000000"],
  },
  {
    id: "champagne_silk",
    name: "Champagne Silk",
    colors: ["#faf5ef", "#e8d3b9", "#b38968", "#1c1410"],
  },
];

export const RESOLUTIONS: Resolution[] = [
  {
    id: "desktop4k",
    label: "Desktop 4K",
    width: 3840,
    height: 2160,
    deviceRef: "4K Monitor / Studio Display",
    ppi: "Ultra Sharp Desktop",
    panelTech: "IPS / OLED Monitor",
  },
  {
    id: "desktop5k",
    label: "Desktop 5K",
    width: 5120,
    height: 2880,
    deviceRef: "Apple Studio Display / iMac 27",
    ppi: "~218 PPI Ultra Retina",
    panelTech: "5K Retina Display",
  },
  {
    id: "desktop8k",
    label: "Desktop 8K",
    width: 7680,
    height: 4320,
    deviceRef: "Dell UltraSharp 8K / Pro Workstation",
    ppi: "Ultra High-Fidelity 8K",
    panelTech: "IPS / OLED Master Monitor",
  },
  {
    id: "desktop10k",
    label: "Ultra 10K",
    width: 10240,
    height: 4320,
    deviceRef: "Ultra-Wide 32:9 Multi-Monitor / 10K Canvas",
    ppi: "Extreme 10K Master Canvas",
    panelTech: "Ultrawide Master Display",
  },
  {
    id: "iphone",
    label: "iPhone Pro Max",
    width: 1290,
    height: 2796,
    deviceRef: "iPhone 16 / 15 Pro Max",
    ppi: "~460 PPI",
    panelTech: "Super Retina XDR OLED",
  },
  {
    id: "fhd_plus",
    label: "FHD+ (1080p)",
    width: 1080,
    height: 2400,
    deviceRef: "Galaxy S24 / Redmi Note 13 / Poco X6",
    ppi: "~390 - 410 PPI",
    panelTech: "Super AMOLED / OLED",
  },
  {
    id: "one_five_k",
    label: "1.5K (1220p)",
    width: 1220,
    height: 2712,
    deviceRef: "Xiaomi 14T / Poco F6 Pro / Realme GT 6",
    ppi: "~440 - 460 PPI (Sweet Spot)",
    panelTech: "Dynamic AMOLED 2X / Fluid AMOLED",
  },
  {
    id: "qhd_plus",
    label: "QHD+ (1440p)",
    width: 1440,
    height: 3200,
    deviceRef: "Galaxy S24 Ultra / OnePlus 12 / Pixel 9 Pro",
    ppi: "~500 - 525 PPI (Gold Standard)",
    panelTech: "LTPO OLED / LTPO AMOLED",
  },
  {
    id: "mobile_4k",
    label: "Mobile 4K",
    width: 1644,
    height: 3840,
    deviceRef: "Sony Xperia 1 VI / Xperia 1 V",
    ppi: "~643 PPI (Highest Mobile)",
    panelTech: "4K HDR OLED",
  },
  {
    id: "ipad",
    label: "iPad",
    width: 2048,
    height: 2732,
    deviceRef: "iPad Pro 13-inch",
    ppi: "~264 PPI",
    panelTech: "Tandem OLED / Liquid Retina",
  },
  {
    id: "macbook",
    label: "MacBook",
    width: 3024,
    height: 1964,
    deviceRef: 'MacBook Pro 16"',
    ppi: "~254 PPI",
    panelTech: "Liquid Retina XDR",
  },
];

export const STYLES: { id: StyleId; name: string; journalRef?: string }[] = [
  { id: "misty_pines", name: "Misty Pine Forest", journalRef: "Atmospheric Volumetric Valley & Fbm Ridges" },
  { id: "silent_dunes", name: "Silent Desert Dunes", journalRef: "Silky Dune Crest & Gradient Slopes" },
  { id: "lunar_arches", name: "Lunar Eclipse Arches", journalRef: "Concentric Orbital Rings & Caustics" },
  { id: "touch_of_god", name: "Touch of God", journalRef: "Minimalist Light & Shadow Contrast Curve" },
  { id: "iridescent_kiss", name: "Iridescent Kiss", journalRef: "Holographic Pastel Silk Gradient" },
  { id: "aurora_glow", name: "Aurora Glow", journalRef: "Electric Luminous Fluid Mesh" },
  { id: "topography", name: "Gradient Topography" },
  { id: "flow", name: "Flow" },
  { id: "cosmic", name: "Cosmic" },
  { id: "gradient", name: "Gradient" },
  { id: "aurora", name: "Aurora" },
  { id: "waves", name: "Waves" },
  { id: "geometric", name: "Geometric" },
  { id: "mandala", name: "Mandala" },
  { id: "landscape", name: "Landscape" },
  { id: "parametric", name: "Parametric" },
  { id: "chladni", name: "Chladni Plate", journalRef: "E. Chladni (1787) - Entdeckungen über die Theorie des Klanges" },
  { id: "julia", name: "Julia Set", journalRef: "G. Julia (1918) - Journal de Mathématiques Pures et Appliquées" },
  { id: "lorenz", name: "Lorenz Attractor", journalRef: "E. Lorenz (1963) - Journal of the Atmospheric Sciences" },
  { id: "flora", name: "Fractal Flora", journalRef: "P. Prusinkiewicz (1990) - The Algorithmic Beauty of Plants" },
  { id: "penrose", name: "Penrose Tiling", journalRef: "R. Penrose (1974) - Inst. Math. Appl. / Math. Intelligencer" },
  { id: "quantum", name: "Quantum Waves", journalRef: "E. Schrödinger (1926) - Annalen der Physik" },
];

/* ---------- PRNG Engine ---------- */

let activePRNG: () => number = Math.random;

/**
 * Fast, high-quality 32-bit PRNG (Mulberry32).
 * Produces deterministic, float random values in range [0, 1).
 */
export function createPRNG(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const prng = (): number => activePRNG();
const rand = (min: number, max: number) => min + prng() * (max - min);
const pick = <T,>(arr: readonly T[]): T =>
  arr[Math.floor(prng() * arr.length)];

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
 * ImageData typed array at true 1:1 native target resolution.
 */
function drawFlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const noise = createNoise2D(prng);
  const warp = createNoise2D(prng);
  const lut = buildPaletteLUT(p, tone);

  // Base frequency: ~1.5–2.8 noise cells across the long edge.
  const freq = rand(1.5, 2.8) / Math.max(w, h);
  const warpAmount = rand(0.5, 1.6); // domain-warp strength (in cells)
  const seedX1 = rand(0, 100);
  const seedY1 = rand(0, 100);
  const seedX2 = rand(0, 100);
  const seedY2 = rand(0, 100);

  const img = ctx.createImageData(w, h);
  const data = img.data;
  let i = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x * freq;
      const ny = y * freq;
      // Warp the sampling domain with a second field — this is what
      // bends the pattern into organic, never-repeating currents.
      const wx = fbm(warp, nx + seedX1, ny + seedY1, 3);
      const wy = fbm(warp, nx + seedX2, ny + seedY2, 3);
      const n = fbm(noise, nx + warpAmount * wx, ny + warpAmount * wy, 4);
      // Map [−1, 1] → [0, 255] with ±1 random dither to break banding.
      const t = (n + 1) * 0.5 * 255 + (prng() - 0.5) * 2;
      const idx = (Math.min(255, Math.max(0, t)) | 0) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
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

export function shade(color: string, factor: number): string {
  if (color.startsWith("rgb")) return color;
  let hex = color.startsWith("#") ? color.slice(1) : color;
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  let out = "#";
  for (let i = 0; i < 6; i += 2) {
    const v = Math.min(
      255,
      Math.max(0, Math.round(parseInt(hex.slice(i, i + 2), 16) * factor)),
    );
    out += v.toString(16).padStart(2, "0");
  }
  return out;
}

export function hexWithAlpha(color: string, alpha: number): string {
  if (color.startsWith("rgb")) {
    return color.replace("rgb", "rgba").replace(")", `, ${alpha})`);
  }
  let hex = color.startsWith("#") ? color.slice(1) : color;
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const v = Math.round(Math.min(1, Math.max(0, alpha)) * 255);
  return "#" + hex + v.toString(16).padStart(2, "0");
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

  // Pick resonant harmonics from PRNG
  const n = Math.floor(rand(2, 9));
  const m = Math.floor(rand(2, 9));
  const dotSize = Math.max(1.5, Math.min(w, h) / 1000);

  const particles = Math.round(w * h * 0.12);
  for (let i = 0; i < particles; i++) {
    const px = prng();
    const py = prng();

    // Chladni nodal plate equation
    const val =
      Math.cos(n * Math.PI * px) * Math.cos(m * Math.PI * py) -
      Math.cos(m * Math.PI * px) * Math.cos(n * Math.PI * py);

    // If close to nodal line, deposit a grain of sand
    if (Math.abs(val) < 0.12) {
      ctx.fillRect(px * w, py * h, dotSize, dotSize);
    }
  }
}

/**
 * Julia fractal set with clean smooth tone mapping.
 * Rendered at 1:1 native resolution using z' = z^2 + c with dynamic parameters.
 */
function drawJulia(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const lut = buildPaletteLUT(p, tone);

  // Julia parameter seed (c) picked from PRNG
  const cx = rand(-0.82, -0.38);
  const cy = rand(0.08, 0.35);
  const maxIt = 50;

  const img = ctx.createImageData(w, h);
  const data = img.data;

  let i = 0;
  for (let y = 0; y < h; y++) {
    const j = (y / h - 0.5) * 3.0;
    for (let x = 0; x < w; x++) {
      const r = (x / w - 0.5) * 3.0 * (w / h);

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
  ctx.putImageData(img, 0, 0);
}

/**
 * Lorenz Attractor in Chaos Theory.
 * Simulates Lorenz differential equations in 3D with dynamic rotation.
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
  const steps = 16000;

  // Track 3D points
  const points: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
    x += dx;
    y += dy;
    z += dz;
    points.push({ x, y, z });
  }

  // Dynamic 3D rotation angle
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const angleX = rand(0.2, 1.2);
  const cos = Math.cos(angleX);
  const sin = Math.sin(angleX);

  const projected = points.map((pt) => {
    const rx = pt.x * cos - pt.z * sin;
    const rz = pt.x * sin + pt.z * cos;
    return { x: rx, y: pt.y, z: rz };
  });

  projected.forEach((pt) => {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  });

  const spanX = maxX - minX;
  const spanY = maxY - minY;
  const scale = Math.min((w * 0.7) / spanX, (h * 0.7) / spanY);
  const cx = w / 2 - (minX + spanX / 2) * scale;
  const cy = h / 2 - (minY + spanY / 2) * scale;

  // Draw clean trails with resolution-aware line width
  ctx.strokeStyle = ink + "1f";
  ctx.lineWidth = Math.max(1.5, Math.min(w, h) / 1200);
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
 * Creates elegant, clean organic flower structures spreading across the canvas at 1:1 resolution.
 */
function drawFlora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const dark = tone === "dark";
  const lut = buildPaletteLUT(p, tone);

  const cx = rand(1.0, 1.28);
  const cy = rand(0.08, 0.32);
  const maxIt = 35;

  const sinh = (v: number) => (Math.exp(v) - Math.exp(-v)) / 2;
  const cosh = (v: number) => (Math.exp(v) + Math.exp(-v)) / 2;

  const img = ctx.createImageData(w, h);
  const data = img.data;
  let i = 0;

  for (let y = 0; y < h; y++) {
    const j = (y / h - 0.5) * 3.2;
    for (let x = 0; x < w; x++) {
      const r = (x / w - 0.5) * 3.2 * (w / h);

      let zr = r;
      let zi = j;
      let it = 0;

      while (zr * zr + zi * zi < 25.0 && it < maxIt) {
        const sin_r = Math.sin(zr) * cosh(zi);
        const cos_i = Math.cos(zr) * sinh(zi);

        const next_r = sin_r * cx - cos_i * cy;
        const next_i = sin_r * cy + cos_i * cx;

        zr = next_r;
        zi = next_i;
        it++;
      }

      let density = 0;
      if (it < maxIt) {
        const log_zn = Math.log(zr * zr + zi * zi) / 2;
        const nu = Math.log(log_zn / Math.log(2)) / Math.log(2);
        const smoothIt = it + 1 - nu;
        density = Math.abs(Math.sin(smoothIt * 0.95));
      }

      const idx = (Math.min(255, Math.max(0, (density * 255) | 0)) | 0) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tctx = tempCanvas.getContext("2d");
  if (tctx) {
    tctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = dark ? "lighter" : "multiply";
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  }
}

/**
 * Penrose Aperiodic Tiling (Quasicrystal Geometry).
 */
function drawPenrose(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const dark = tone === "dark";
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

  interface Triangle {
    type: number;
    a: [number, number];
    b: [number, number];
    c: [number, number];
  }

  const center: [number, number] = [
    w * rand(0.38, 0.62),
    h * rand(0.38, 0.62),
  ];
  const radius = Math.max(w, h) * 0.8;
  const rotOffset = rand(0, Math.PI * 2);
  let triangles: Triangle[] = [];

  for (let i = 0; i < 10; i++) {
    const angle1 = rotOffset + ((i - 0.5) * Math.PI) / 5;
    const angle2 = rotOffset + ((i + 0.5) * Math.PI) / 5;
    const b: [number, number] = [
      center[0] + radius * Math.cos(angle1),
      center[1] + radius * Math.sin(angle1),
    ];
    const c: [number, number] = [
      center[0] + radius * Math.cos(angle2),
      center[1] + radius * Math.sin(angle2),
    ];
    if (i % 2 === 0) {
      triangles.push({ type: 0, a: center, b: b, c: c });
    } else {
      triangles.push({ type: 0, a: center, b: c, c: b });
    }
  }

  const subdivisions = 6;
  for (let step = 0; step < subdivisions; step++) {
    const next: Triangle[] = [];
    for (const tri of triangles) {
      if (tri.type === 0) {
        const pPoint: [number, number] = [
          tri.a[0] + (tri.b[0] - tri.a[0]) / GOLDEN_RATIO,
          tri.a[1] + (tri.b[1] - tri.a[1]) / GOLDEN_RATIO,
        ];
        next.push({ type: 0, a: tri.c, b: pPoint, c: tri.a });
        next.push({ type: 1, a: tri.c, b: tri.b, c: pPoint });
      } else {
        const qPoint: [number, number] = [
          tri.b[0] + (tri.a[0] - tri.b[0]) / GOLDEN_RATIO,
          tri.b[1] + (tri.a[1] - tri.b[1]) / GOLDEN_RATIO,
        ];
        const rPoint: [number, number] = [
          tri.b[0] + (tri.c[0] - tri.b[0]) / GOLDEN_RATIO,
          tri.b[1] + (tri.c[1] - tri.b[1]) / GOLDEN_RATIO,
        ];
        next.push({ type: 1, a: qPoint, b: tri.c, c: tri.a });
        next.push({ type: 0, a: qPoint, b: rPoint, c: tri.c });
        next.push({ type: 1, a: rPoint, b: tri.b, c: qPoint });
      }
    }
    triangles = next;
  }

  ctx.save();
  const strokeColor = dark ? p.colors[0] : p.colors[3];
  const alphaStroke = dark ? "40" : "60";
  ctx.lineWidth = Math.max(0.8, Math.min(w, h) / 2000);

  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i];
    const colHex = p.colors[tri.type === 0 ? 1 : 2];

    ctx.fillStyle = colHex + (dark ? "18" : "25");
    ctx.beginPath();
    ctx.moveTo(tri.a[0], tri.a[1]);
    ctx.lineTo(tri.b[0], tri.b[1]);
    ctx.lineTo(tri.c[0], tri.c[1]);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = strokeColor + alphaStroke;
    ctx.stroke();
  }

  ctx.strokeStyle = p.colors[0] + "20";
  ctx.lineWidth = Math.max(1, Math.min(w, h) / 1800);
  for (let r = radius * 0.1; r < radius; r += radius * 0.18) {
    ctx.beginPath();
    ctx.arc(center[0], center[1], r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Quantum Wave Interference & Superposition at 1:1 resolution.
 */
function drawQuantum(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const dark = tone === "dark";
  const numSources = 6;
  const sources: { x: number; y: number; k: number; phase: number; amp: number }[] = [];

  const centerOffX = w * rand(0.4, 0.6);
  const centerOffY = h * rand(0.4, 0.6);

  for (let i = 0; i < numSources; i++) {
    const angle = (i * Math.PI * 2) / numSources + rand(-0.2, 0.2);
    const rad = Math.min(w, h) * rand(0.15, 0.38);
    sources.push({
      x: centerOffX + Math.cos(angle) * rad,
      y: centerOffY + Math.sin(angle) * rad,
      k: rand(0.015, 0.04),
      phase: rand(0, Math.PI * 2),
      amp: rand(0.8, 1.3),
    });
  }

  const img = ctx.createImageData(w, h);
  const data = img.data;
  const lut = buildPaletteLUT(p, tone);

  let i = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let re = 0;
      let im = 0;

      for (let s = 0; s < numSources; s++) {
        const src = sources[s];
        const dx = x - src.x;
        const dy = y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1.0;
        const arg = src.k * dist + src.phase;
        const amp = src.amp / Math.pow(dist, 0.35);
        re += amp * Math.cos(arg);
        im += amp * Math.sin(arg);
      }

      const probDensity = re * re + im * im;
      const val = Math.sin(probDensity * 1.8) * 0.5 + 0.5;

      const idx = Math.min(255, Math.floor(val * 255)) * 3;
      data[i++] = lut[idx];
      data[i++] = lut[idx + 1];
      data[i++] = lut[idx + 2];
      data[i++] = 255;
    }
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tctx = tempCanvas.getContext("2d");
  if (tctx) {
    tctx.putImageData(img, 0, 0);
    ctx.save();
    ctx.globalCompositeOperation = dark ? "lighter" : "multiply";
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  }

  ctx.save();
  ctx.strokeStyle = dark ? p.colors[0] + "50" : p.colors[3] + "50";
  ctx.lineWidth = Math.max(1.5, Math.min(w, h) / 1200);

  for (let s = 0; s < numSources; s++) {
    const src = sources[s];
    const waveRadiusStep = Math.PI / src.k;
    for (let r = waveRadiusStep; r < Math.max(w, h); r += waveRadiusStep) {
      ctx.beginPath();
      ctx.arc(src.x, src.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Gradient Topography (Smooth Layered Shapes).
 * Draws stacked contour layers with resolution-proportional shadow blurs.
 */
function drawTopography(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  paintBase(ctx, w, h, p, tone);

  const dark = tone === "dark";
  const colors = dark ? [...p.colors].reverse() : p.colors;
  const numLayers = 14;

  const originX = w * rand(0.55, 1.35);
  const originY = -h * rand(0.05, 0.4);
  const maxRadius = Math.sqrt(w * w + h * h) * 1.35;

  const noise2D = createNoise2D(prng);
  const seedOffset = rand(0, 100);

  ctx.save();

  function getLayerColor(t: number): string {
    const clampedT = Math.max(0, Math.min(1, t));
    const stops = colors.map((hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ]);
    const segs = stops.length - 1;
    const pos = clampedT * segs;
    const idx = Math.min(segs - 1, Math.floor(pos));
    const frac = pos - idx;
    const c1 = stops[idx];
    const c2 = stops[idx + 1];
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * frac);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * frac);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * frac);
    return `rgb(${r}, ${g}, ${b})`;
  }

  for (let k = 0; k < numLayers; k++) {
    const layerFrac = k / (numLayers - 1);
    const radius = maxRadius * (1 - layerFrac * 0.88);

    const fillColor = getLayerColor(layerFrac);

    ctx.fillStyle = fillColor;

    // Draw soft subtle layer shadow scaled dynamically to resolution
    const shadowBase = Math.min(w, h) * 0.02;
    ctx.shadowColor = dark ? "rgba(0, 0, 0, 0.45)" : "rgba(0, 0, 0, 0.07)";
    ctx.shadowBlur = shadowBase * (1 - layerFrac * 0.4);
    ctx.shadowOffsetX = -shadowBase * 0.28;
    ctx.shadowOffsetY = shadowBase * 0.35;

    ctx.beginPath();
    
    const numPoints = 60;
    const points: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 1.35 + Math.PI * 0.45;
      const nScale = 1.1;
      const nx = Math.cos(angle) * nScale + seedOffset + k * 0.12;
      const ny = Math.sin(angle) * nScale + seedOffset + k * 0.12;
      const nVal = noise2D(nx, ny);

      const rOffset = radius + nVal * (maxRadius * 0.075);
      const px = originX + Math.cos(angle) * rOffset;
      const py = originY + Math.sin(angle) * rOffset;
      points.push([px, py]);
    }

    ctx.moveTo(w * 2, -h * 2);
    ctx.lineTo(points[0][0], points[0][1]);

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0[0] + p1[0]) / 2;
      const midY = (p0[1] + p1[1]) / 2;
      ctx.quadraticCurveTo(p0[0], p0[1], midX, midY);
    }
    const lastP = points[points.length - 1];
    ctx.lineTo(lastP[0], lastP[1]);

    ctx.lineTo(w * 2, h * 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * "Touch of God" — Minimalist Divine Light & Shadow Contrast Curve.
 * Draws an organic S-curve boundary separating a luminous light field from a deep obsidian shadow,
 * with soft rim glow along the contact line and fine photographic film grain.
 */
function drawTouchOfGod(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // Paint background wash
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  const lightBg = tone === "light" ? p.colors[0] : shade(p.colors[1], 1.1);
  const lightFar = tone === "light" ? p.colors[1] : p.colors[0];
  bgGrad.addColorStop(0, lightBg);
  bgGrad.addColorStop(1, lightFar);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  const noise = createNoise2D(prng);
  const seedOffset = rand(0, 100);

  // Light focal bloom on upper-left
  const bloomX = w * rand(0.15, 0.4);
  const bloomY = h * rand(0.15, 0.4);
  const bloomR = Math.max(w, h) * rand(0.45, 0.75);
  const bloomGrad = ctx.createRadialGradient(bloomX, bloomY, 0, bloomX, bloomY, bloomR);
  bloomGrad.addColorStop(0, shade(p.colors[0], 1.15) + "ee");
  bloomGrad.addColorStop(0.5, p.colors[1] + "77");
  bloomGrad.addColorStop(1, p.colors[1] + "00");
  ctx.fillStyle = bloomGrad;
  ctx.fillRect(0, 0, w, h);

  // Draw organic dark shadow mass sweeping from bottom-right (aspect ratio safe)
  const darkColor = tone === "light" ? p.colors[3] : "#050608";
  const numSteps = 140;
  const shadowPoints: [number, number][] = [];

  const startX = w * rand(0.55, 0.85);
  const startY = -h * 0.2;
  const endX = w * 1.2;
  const endY = h * rand(0.55, 0.85);

  ctx.save();

  // Multi-pass soft shadow layers for silky 3D volumetric falloff
  const shadowPasses = 5;
  for (let pass = shadowPasses; pass >= 1; pass--) {
    const passFrac = pass / shadowPasses;
    
    ctx.beginPath();
    ctx.moveTo(w * 2.0, -h * 0.5);

    shadowPoints.length = 0;
    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * (w * 0.45) + t * t * endX;
      const by = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * (h * 0.45) + t * t * endY;

      const nScale = 1.8;
      const nVal = fbm(noise, t * nScale + seedOffset + pass * 0.05, pass * 0.1, 3);
      const offsetAmt = Math.min(w, h) * (0.04 + passFrac * 0.08);

      const px = bx + nVal * offsetAmt;
      const py = by + nVal * offsetAmt;
      shadowPoints.push([px, py]);
    }

    ctx.lineTo(shadowPoints[0][0], shadowPoints[0][1]);
    for (let i = 0; i < shadowPoints.length - 1; i++) {
      const p0 = shadowPoints[i];
      const p1 = shadowPoints[i + 1];
      const mx = (p0[0] + p1[0]) / 2;
      const my = (p0[1] + p1[1]) / 2;
      ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
    }
    const lastP = shadowPoints[shadowPoints.length - 1];
    ctx.lineTo(lastP[0], lastP[1]);
    ctx.lineTo(w * 2.0, h * 2.0);
    ctx.closePath();

    ctx.fillStyle = hexWithAlpha(darkColor, pass === 1 ? 0.96 : 0.18);
    ctx.shadowColor = darkColor;
    ctx.shadowBlur = Math.min(w, h) * 0.06 * passFrac;
    ctx.fill();
  }

  // Dual-contact glowing rim along the edge curve for maximum 3D rim depth
  ctx.shadowBlur = Math.min(w, h) * 0.015;
  ctx.shadowColor = p.colors[1];
  ctx.strokeStyle = hexWithAlpha(p.colors[1], 0.55);
  ctx.lineWidth = Math.max(2.5, Math.min(w, h) / 500);
  ctx.beginPath();
  ctx.moveTo(shadowPoints[0][0], shadowPoints[0][1]);
  for (let i = 0; i < shadowPoints.length - 1; i++) {
    const p0 = shadowPoints[i];
    const p1 = shadowPoints[i + 1];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    ctx.quadraticCurveTo(p0[0], p0[1], mx, my);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * "Iridescent Kiss" — Holographic Pastel Silk Ribbon Mesh.
 * Draws sweeping 3D holographic silk ribbons with pearlescent pastel gradients,
 * distinct organic folds, metallic shimmer contours, and subtle paper grain.
 */
function drawIridescentKiss(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // Base soft background wash
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, tone === "dark" ? "#14111d" : p.colors[0]);
  bg.addColorStop(0.5, tone === "dark" ? "#1e182b" : p.colors[1]);
  bg.addColorStop(1, tone === "dark" ? "#0b0914" : p.colors[3]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const noise = createNoise2D(prng);
  const seedX = rand(0, 100);

  ctx.save();

  // Multi-layer sweeping 3D holographic silk ribbons
  const ribbonCount = 5;
  const numSteps = 160;

  for (let r = 0; r < ribbonCount; r++) {
    const colMain = p.colors[r % p.colors.length];
    const colSecondary = p.colors[(r + 1) % p.colors.length];
    const yAnchor = h * (0.15 + 0.16 * r) + rand(-h * 0.04, h * 0.04);
    const ribbonWidth = Math.min(w, h) * rand(0.18, 0.35);

    const topPts: [number, number][] = [];
    const botPts: [number, number][] = [];

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const x = w * (t * 1.2 - 0.1);
      const waveVal = Math.sin(t * Math.PI * 2.5 + r * 1.2 + seedX) * (h * 0.12);
      const noiseVal = fbm(noise, t * 2.0 + seedX, r * 1.5, 3) * (h * 0.18);
      const yTop = yAnchor + waveVal + noiseVal;
      const yBot = yTop + ribbonWidth * (0.8 + 0.4 * Math.sin(t * Math.PI * 3 + r));

      topPts.push([x, yTop]);
      botPts.push([x, yBot]);
    }

    // Path for ribbon body
    ctx.beginPath();
    ctx.moveTo(topPts[0][0], topPts[0][1]);
    for (let i = 0; i < topPts.length - 1; i++) {
      const p0 = topPts[i];
      const p1 = topPts[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.lineTo(topPts[topPts.length - 1][0], topPts[topPts.length - 1][1]);
    ctx.lineTo(botPts[botPts.length - 1][0], botPts[botPts.length - 1][1]);
    for (let i = botPts.length - 1; i > 0; i--) {
      const p0 = botPts[i];
      const p1 = botPts[i - 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.closePath();

    // Fill with holographic linear gradient across ribbon flow
    const rGrad = ctx.createLinearGradient(0, yAnchor - ribbonWidth, w, yAnchor + ribbonWidth * 2);
    rGrad.addColorStop(0, hexWithAlpha(colMain, tone === "dark" ? 0.75 : 0.65));
    rGrad.addColorStop(0.5, hexWithAlpha(colSecondary, tone === "dark" ? 0.6 : 0.45));
    rGrad.addColorStop(1, hexWithAlpha(p.colors[(r + 2) % p.colors.length], 0.1));

    ctx.fillStyle = rGrad;
    ctx.shadowColor = colMain;
    ctx.shadowBlur = Math.min(w, h) * 0.025;
    ctx.fill();

    // Shimmer line along top crest of silk fold
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexWithAlpha("#ffffff", tone === "dark" ? 0.6 : 0.8);
    ctx.lineWidth = Math.max(1.5, Math.min(w, h) / 700);
    ctx.beginPath();
    ctx.moveTo(topPts[0][0], topPts[0][1]);
    for (let i = 0; i < topPts.length - 1; i++) {
      const p0 = topPts[i];
      const p1 = topPts[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.stroke();
  }

  // Pearlescent diagonal sheen
  const sheen = ctx.createLinearGradient(-w * 0.2, 0, w * 1.2, h);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.25)");
  sheen.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
  sheen.addColorStop(1, "rgba(255, 255, 255, 0.2)");
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

/**
 * "Aurora Glow" — Electric Luminous Fluid Mesh.
 * Blends vibrant electric violet, deep cobalt blue, and neon magenta floating fluid curtains
 * across a deep night sky without blinding white flashbang clipping.
 */
function drawAuroraGlow(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // Deep rich dark night-sky base
  const darkBg = tone === "dark" ? p.colors[3] : shade(p.colors[3], 0.7);
  ctx.fillStyle = darkBg;
  ctx.fillRect(0, 0, w, h);

  const noise = createNoise2D(prng);
  const seedY = rand(0, 100);

  ctx.save();
  // Use "screen" instead of "lighter" to prevent white flashbang clipping!
  ctx.globalCompositeOperation = "screen";

  // Deep ambient luminous blooms (non-blinding alpha)
  const numBlobs = 5;
  for (let b = 0; b < numBlobs; b++) {
    const frac = b / (numBlobs - 1);
    const color = p.colors[b % p.colors.length];

    const cx = w * (0.15 + 0.7 * fbm(noise, frac * 2.5, seedY, 3));
    const cy = h * (0.2 + 0.6 * fbm(noise, frac * 2.5 + 4.2, seedY, 3));
    const radius = Math.max(w, h) * rand(0.35, 0.55);

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    g.addColorStop(0, hexWithAlpha(color, 0.42));
    g.addColorStop(0.5, hexWithAlpha(color, 0.18));
    g.addColorStop(1, hexWithAlpha(color, 0.0));

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Floating volumetric aurora curtains
  const ribbonCount = 4;
  for (let r = 0; r < ribbonCount; r++) {
    const col = p.colors[(r + 1) % p.colors.length];
    const rY = h * (0.2 + 0.45 * (r / ribbonCount)) + rand(-h * 0.04, h * 0.04);
    const rThickness = h * rand(0.12, 0.25);
    const rAmp = h * rand(0.08, 0.16);
    const rFreq = (Math.PI * 2 * rand(1.2, 2.2)) / w;

    const topCurve: [number, number][] = [];
    const botCurve: [number, number][] = [];
    const stepX = Math.max(2, w / 400);

    for (let x = 0; x <= w; x += stepX) {
      const dy = Math.sin(x * rFreq + r * 1.5) * rAmp + fbm(noise, x * 0.001, r * 3.1 + seedY, 3) * (rAmp * 0.6);
      topCurve.push([x, rY + dy]);
      botCurve.push([x, rY + dy + rThickness]);
    }

    ctx.beginPath();
    ctx.moveTo(topCurve[0][0], topCurve[0][1]);
    for (let i = 0; i < topCurve.length - 1; i++) {
      const p0 = topCurve[i];
      const p1 = topCurve[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.lineTo(topCurve[topCurve.length - 1][0], topCurve[topCurve.length - 1][1]);
    ctx.lineTo(botCurve[botCurve.length - 1][0], botCurve[botCurve.length - 1][1]);

    for (let i = botCurve.length - 1; i > 0; i--) {
      const p0 = botCurve[i];
      const p1 = botCurve[i - 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.closePath();

    const g = ctx.createLinearGradient(0, rY - rAmp, 0, rY + rThickness + rAmp);
    g.addColorStop(0, hexWithAlpha(col, 0.0));
    g.addColorStop(0.4, hexWithAlpha(col, 0.5));
    g.addColorStop(0.8, hexWithAlpha(col, 0.2));
    g.addColorStop(1, hexWithAlpha(col, 0.0));

    ctx.fillStyle = g;
    ctx.fill();
  }

  // Shimmering vertical ray curtains (authentic aurora rays)
  ctx.globalCompositeOperation = "screen";
  const numRays = 18;
  for (let i = 0; i < numRays; i++) {
    const rx = w * (0.05 + 0.9 * (i / numRays) + rand(-0.02, 0.02));
    const ry = h * rand(0.15, 0.45);
    const rLen = h * rand(0.25, 0.5);
    const rW = Math.max(2, w * rand(0.003, 0.008));
    const rayCol = p.colors[i % p.colors.length];

    const rg = ctx.createLinearGradient(rx, ry, rx, ry + rLen);
    rg.addColorStop(0, hexWithAlpha(rayCol, 0.0));
    rg.addColorStop(0.3, hexWithAlpha(rayCol, 0.35));
    rg.addColorStop(0.7, hexWithAlpha(rayCol, 0.15));
    rg.addColorStop(1, hexWithAlpha(rayCol, 0.0));

    ctx.fillStyle = rg;
    ctx.fillRect(rx - rW / 2, ry, rW, rLen);
  }

  ctx.restore();
}

/**
 * "Misty Pine Forest" — Adapted directly from the proven Landscape style algorithm.
 * Uses Musgrave fBm ridges, palette LUT atmospheric depth, glowing celestial orb,
 * and sparse, elegant pine silhouettes along middle & foreground ridges.
 */
function drawMistyPines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  // 1. Sky: soft vertical gradient from palette's background end
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, shade(baseColor(p, tone), tone === "light" ? 1.06 : 0.9));
  sky.addColorStop(1, farColor(p, tone));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Hazy sun/moon disc for celestial focus
  const orbX = rand(0.3, 0.7) * w;
  const orbY = rand(0.16, 0.3) * h;
  const orbR = rand(0.06, 0.1) * Math.min(w, h);
  const glow = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orbR * 3.5);
  const orbColor = tone === "light" ? "#ffffff" : shade(p.colors[0], 1.1);
  glow.addColorStop(0, orbColor + "e6");
  glow.addColorStop(0.3, orbColor + "55");
  glow.addColorStop(1, orbColor + "00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Disc core
  ctx.fillStyle = orbColor;
  ctx.beginPath();
  ctx.arc(orbX, orbY, orbR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  const noise = createNoise2D(prng);
  const lut = buildPaletteLUT(p, tone);
  const layers = 6;
  const baseFreq = rand(1.8, 3.0) / w;
  const gain = rand(0.5, 0.6);
  const baseAmp = rand(0.1, 0.15) * h;
  const xOffset = rand(0, 1000);
  const stepX = Math.max(1, Math.round(w / 1920));

  for (let layer = 0; layer < layers; layer++) {
    const depth = layer / (layers - 1);
    const horizon = h * (0.36 + 0.5 * depth);
    const amp = baseAmp * (0.5 + 0.85 * depth);
    const freq = baseFreq * (1 + depth * 0.6);
    const octaves = 3 + Math.round(depth * 2);
    const ridgeSeed = layer * 7.31 + rand(0, 3);

    const t = tone === "light" ? 0.2 + 0.8 * depth : 0.6 * (1 - depth) + 0.02;
    const idx = Math.round(t * 255) * 3;
    const ridgeColor = `rgb(${lut[idx]},${lut[idx + 1]},${lut[idx + 2]})`;
    ctx.fillStyle = ridgeColor;

    const ridgeYVals: number[] = [];
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += stepX) {
      const y = horizon + fbm(noise, x * freq + xOffset, ridgeSeed, octaves, gain) * amp;
      ridgeYVals.push(y);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Sparse pine trees on middle and foreground layers (layer 2, 3, 4)
    if (layer >= 2 && layer <= 4) {
      const treeCount = Math.floor(rand(8, 16));
      const treeSpacing = w / treeCount;
      ctx.fillStyle = shade(ridgeColor, 0.85);

      for (let k = 0; k < treeCount; k++) {
        const tx = (k + 0.5) * treeSpacing + rand(-treeSpacing * 0.25, treeSpacing * 0.25);
        const sampleIdx = Math.min(ridgeYVals.length - 1, Math.floor((tx / w) * ridgeYVals.length));
        const ty = ridgeYVals[sampleIdx];
        const treeH = Math.min(w, h) * (0.025 + 0.015 * depth) * rand(0.8, 1.2);
        const treeW = treeH * 0.36;

        ctx.beginPath();
        ctx.moveTo(tx, ty - treeH);
        ctx.lineTo(tx - treeW * 0.4, ty - treeH * 0.55);
        ctx.lineTo(tx + treeW * 0.4, ty - treeH * 0.55);
        ctx.lineTo(tx - treeW * 0.5, ty);
        ctx.lineTo(tx + treeW * 0.5, ty);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

/**
 * "Silent Desert Dunes" — Silky Dune Crest & Gradient Slopes.
 * Inspired by WLLPR Dunas, heavily elevated with smooth 3D sweeping sand dune ridges,
 * razor-sharp glowing crest highlights, wind-blown slope shadow gradients, and golden hour haze.
 */
function drawSilentDunes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  const skyTop = tone === "dark" ? p.colors[3] : p.colors[0];
  const skyBot = tone === "dark" ? shade(p.colors[2], 0.8) : p.colors[1];
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const noise = createNoise2D(prng);
  const seedY = rand(0, 100);

  const hazeY = h * 0.35;
  const hazeGrad = ctx.createRadialGradient(w * 0.5, hazeY, 0, w * 0.5, hazeY, Math.max(w, h) * 0.6);
  hazeGrad.addColorStop(0, hexWithAlpha(p.colors[0], tone === "dark" ? 0.4 : 0.6));
  hazeGrad.addColorStop(1, hexWithAlpha(p.colors[0], 0.0));
  ctx.fillStyle = hazeGrad;
  ctx.fillRect(0, 0, w, h);

  const numDunes = 6;
  const numSteps = 160;

  for (let d = 0; d < numDunes; d++) {
    const dAnchorY = h * (0.32 + 0.12 * d);
    const dColor = p.colors[d % p.colors.length];
    const dColorShadow = p.colors[(d + 1) % p.colors.length];

    const dunePts: [number, number][] = [];
    const stepX = w / numSteps;

    for (let i = 0; i <= numSteps; i++) {
      const t = i / numSteps;
      const x = t * w;
      const sineVal = Math.sin(t * Math.PI * 2 + d * 1.4 + seedY) * (h * 0.08);
      const nVal = fbm(noise, t * 1.5 + seedY, d * 2.1, 3) * (h * 0.12);
      const y = dAnchorY + sineVal + nVal;
      dunePts.push([x, y]);
    }

    const duneGrad = ctx.createLinearGradient(0, dAnchorY - h * 0.1, w, dAnchorY + h * 0.25);
    duneGrad.addColorStop(0, hexWithAlpha(dColor, 1.0));
    duneGrad.addColorStop(0.5, hexWithAlpha(dColorShadow, 0.95));
    duneGrad.addColorStop(1, hexWithAlpha(shade(dColorShadow, 0.7), 1.0));

    ctx.save();
    ctx.fillStyle = duneGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(dunePts[0][0], dunePts[0][1]);
    for (let i = 0; i < dunePts.length - 1; i++) {
      const p0 = dunePts[i];
      const p1 = dunePts[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = hexWithAlpha(p.colors[0], tone === "dark" ? 0.7 : 0.85);
    ctx.lineWidth = Math.max(1.8, Math.min(w, h) / 600);
    ctx.shadowColor = p.colors[0];
    ctx.shadowBlur = Math.min(w, h) * 0.015;

    ctx.beginPath();
    ctx.moveTo(dunePts[0][0], dunePts[0][1]);
    for (let i = 0; i < dunePts.length - 1; i++) {
      const p0 = dunePts[i];
      const p1 = dunePts[i + 1];
      ctx.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
    }
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * "Lunar Eclipse Arches" — Landscape-style Layered Concentric Half-Circle Domes.
 * Concentric semi-circular arch domes rising from the bottom horizon, using the exact
 * Landscape sky wash, Palette LUT depth, and glowing lunar disc.
 */
function drawLunarArches(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  p: Palette,
  tone: Tone,
) {
  const dark = tone === "dark";

  // Springline: where every arch meets the ground and the eclipsed
  // disc rises. Radii are measured from here.
  const cx = w * 0.5;
  const cy = h * rand(0.74, 0.82);
  const moonR = Math.min(w, h) * rand(0.085, 0.115);
  // Spans the full width at the springline while keeping the outermost
  // apex just off the top edge, so the run frames rather than crops.
  const maxR = Math.hypot(w * 0.5, cy) * 0.86;
  const rMin = moonR * 1.5;

  // 1. Sky — deepest overhead, warming down toward the springline.
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, shade(baseColor(p, tone), dark ? 0.5 : 1.1));
  sky.addColorStop(0.6, shade(farColor(p, tone), dark ? 0.78 : 1.0));
  sky.addColorStop(1, shade(farColor(p, tone), dark ? 1.1 : 0.9));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Starfield, washed out where the corona is brightest.
  if (dark) {
    ctx.fillStyle = "#ffffff";
    const stars = Math.round((w * h) / 52000);
    for (let i = 0; i < stars; i++) {
      const sx = rand(0, w);
      const sy = rand(0, cy);
      const s = Math.max(1, rand(0.4, 1.5) * (w / 3840));
      const d = Math.hypot(sx - cx, sy - cy) / maxR;
      ctx.globalAlpha = rand(0.1, 0.65) * Math.min(1, d * 1.7);
      ctx.fillRect(sx, sy, s, s);
    }
    ctx.globalAlpha = 1;
  }

  const lightCol = dark ? shade(p.colors[0], 1.3) : "#ffffff";

  // LUT samples come back as hex so shade()/hexWithAlpha() both apply —
  // shade() is a no-op on rgb() strings.
  const lut = buildPaletteLUT(p, tone);
  const lutHex = (t: number) => {
    const i = Math.round(Math.min(1, Math.max(0, t)) * 255) * 3;
    return (
      "#" +
      [lut[i], lut[i + 1], lut[i + 2]]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
    );
  };

  // 3. Corona bloom, laid down before the arches so it reads through
  //    the gaps between them.
  const bloom = ctx.createRadialGradient(cx, cy, moonR * 0.5, cx, cy, maxR * 0.75);
  bloom.addColorStop(0, hexWithAlpha(lightCol, dark ? 0.72 : 0.78));
  bloom.addColorStop(0.12, hexWithAlpha(lightCol, 0.28));
  bloom.addColorStop(0.4, hexWithAlpha(lightCol, 0.09));
  bloom.addColorStop(1, hexWithAlpha(lightCol, 0));
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  // 4. Arches, outermost first so nearer bands overlap correctly.
  const numArches = 7;
  ctx.save();
  for (let i = numArches - 1; i >= 0; i--) {
    const t = i / (numArches - 1); // 1 = outermost, 0 = innermost
    // Gaps and band widths both grow outward, so the run reads as
    // receding perspective rather than a flat target.
    const rOuter = rMin + (maxR - rMin) * Math.pow(t, 1.75);
    const band = (maxR - rMin) * 0.07 * (0.3 + t * 1.2);
    const rInner = Math.max(rMin * 0.92, rOuter - band);

    // An annulus — outer arc left→right, inner arc back right→left —
    // rather than a solid dome, so light spills between the arches.
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, Math.PI, 0, false);
    ctx.arc(cx, cy, rInner, 0, Math.PI, true);
    ctx.closePath();

    const face = lutHex(dark ? 0.15 + t * 0.7 : 0.85 - t * 0.7);
    const g = ctx.createLinearGradient(0, cy - rOuter, 0, cy);
    g.addColorStop(0, hexWithAlpha(shade(face, dark ? 1.15 : 1.0), dark ? 0.95 : 0.9));
    g.addColorStop(1, hexWithAlpha(shade(face, dark ? 0.55 : 0.78), dark ? 0.99 : 0.96));
    ctx.shadowBlur = 0;
    ctx.fillStyle = g;
    ctx.fill();

    // Rim caustic: brightest at the zenith, gone by the springline —
    // the limb glows where it is tangent to the line of sight.
    const rim = ctx.createLinearGradient(0, cy - rOuter, 0, cy);
    rim.addColorStop(0, hexWithAlpha(lightCol, dark ? 0.95 : 0.85));
    rim.addColorStop(0.55, hexWithAlpha(lightCol, dark ? 0.36 : 0.3));
    rim.addColorStop(1, hexWithAlpha(lightCol, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, Math.PI, 0, false);
    ctx.strokeStyle = rim;
    ctx.lineWidth = Math.max(1.5, Math.min(w, h) / 900);
    ctx.shadowColor = hexWithAlpha(lightCol, 0.75);
    ctx.shadowBlur = Math.min(w, h) * 0.012;
    ctx.stroke();
  }
  ctx.restore();

  // 5. Eclipse — halo, occulting body, then the bright limb.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(cx, cy, moonR * 0.9, cx, cy, moonR * 2.6);
  halo.addColorStop(0, hexWithAlpha(lightCol, dark ? 0.95 : 0.8));
  halo.addColorStop(0.3, hexWithAlpha(lightCol, 0.28));
  halo.addColorStop(1, hexWithAlpha(lightCol, 0));
  ctx.fillStyle = halo;
  ctx.fillRect(cx - moonR * 2.8, cy - moonR * 2.8, moonR * 5.6, moonR * 5.6);
  ctx.restore();

  // The occulting body reads dark against the corona, but never flat
  // black: in totality the disc is lit by sunlight refracted through
  // Earth's atmosphere, Rayleigh scattering having stripped the short
  // wavelengths on the way through.
  const bodyCol = lutHex(dark ? 0.06 : 0.1);
  const body = ctx.createRadialGradient(
    cx - moonR * 0.3, cy - moonR * 0.32, moonR * 0.05,
    cx, cy, moonR,
  );
  body.addColorStop(0, shade(bodyCol, dark ? 0.55 : 0.42));
  body.addColorStop(0.65, shade(bodyCol, dark ? 0.3 : 0.22));
  body.addColorStop(1, shade(bodyCol, dark ? 0.16 : 0.12));
  ctx.beginPath();
  ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Earthshine pooling just inside the limb.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const shine = ctx.createRadialGradient(cx, cy, moonR * 0.55, cx, cy, moonR);
  shine.addColorStop(0, hexWithAlpha(lightCol, 0));
  shine.addColorStop(1, hexWithAlpha(lightCol, dark ? 0.3 : 0.22));
  ctx.beginPath();
  ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
  ctx.fillStyle = shine;
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, moonR, 0, Math.PI * 2);
  ctx.strokeStyle = hexWithAlpha(lightCol, dark ? 0.95 : 0.85);
  ctx.lineWidth = Math.max(1.5, Math.min(w, h) / 700);
  ctx.shadowColor = hexWithAlpha(lightCol, 0.9);
  ctx.shadowBlur = moonR * 0.5;
  ctx.stroke();
  ctx.restore();

  // 6. Ground plane — drawn last over the disc's lower half so the
  //    eclipse reads as half-risen at the horizon.
  // Light tone samples nearer the middle of the ramp: the darkest stop
  // reads as a black slab under a near-white sky.
  const groundCol = lutHex(dark ? 0.08 : 0.62);
  const ground = ctx.createLinearGradient(0, cy, 0, h);
  ground.addColorStop(0, shade(groundCol, dark ? 0.5 : 0.92));
  ground.addColorStop(1, shade(groundCol, dark ? 0.28 : 0.68));
  ctx.fillStyle = ground;
  ctx.fillRect(0, cy, w, h - cy);

  // Reflection: corona spilling onto the ground. A vertically stretched
  // radial keeps every edge soft — a clipped ellipse would read as a
  // hard-edged bulge below the horizon.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(cx, cy);
  ctx.scale(1, (h - cy) / (moonR * 2.4));
  const refl = ctx.createRadialGradient(0, 0, 0, 0, 0, moonR * 2.4);
  refl.addColorStop(0, hexWithAlpha(lightCol, dark ? 0.34 : 0.4));
  refl.addColorStop(0.45, hexWithAlpha(lightCol, 0.1));
  refl.addColorStop(1, hexWithAlpha(lightCol, 0));
  ctx.fillStyle = refl;
  ctx.fillRect(-w, 0, w * 2, moonR * 2.4);
  ctx.restore();

  // Horizon haze dissolves the ground's hard upper edge. Stretched into
  // a wide, shallow ellipse around the disc so it fades out toward the
  // frame edges instead of banding straight across.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.translate(cx, cy);
  const hazeH = moonR * 0.55;
  ctx.scale((maxR * 0.85) / hazeH, 1);
  const haze = ctx.createRadialGradient(0, 0, 0, 0, 0, hazeH);
  haze.addColorStop(0, hexWithAlpha(lightCol, dark ? 0.32 : 0.4));
  haze.addColorStop(0.5, hexWithAlpha(lightCol, dark ? 0.12 : 0.16));
  haze.addColorStop(1, hexWithAlpha(lightCol, 0));
  ctx.fillStyle = haze;
  ctx.fillRect(-hazeH, -hazeH, hazeH * 2, hazeH * 2);
  ctx.restore();
}

/** Legacy aliases for backwards compatibility */
const drawTokyo = drawPenrose;
const drawRome = drawQuantum;

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
  misty_pines: drawMistyPines,
  silent_dunes: drawSilentDunes,
  lunar_arches: drawLunarArches,
  touch_of_god: drawTouchOfGod,
  iridescent_kiss: drawIridescentKiss,
  aurora_glow: drawAuroraGlow,
  topography: drawTopography,
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
  penrose: drawPenrose,
  quantum: drawQuantum,
  tokyo: drawTokyo,
  rome: drawRome,
};

let grainTileCanvas: HTMLCanvasElement | null = null;

function getGrainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (typeof window === "undefined") return null;
  if (!grainTileCanvas) {
    grainTileCanvas = document.createElement("canvas");
    grainTileCanvas.width = 256;
    grainTileCanvas.height = 256;
    const tCtx = grainTileCanvas.getContext("2d");
    if (tCtx) {
      const imgData = tCtx.createImageData(256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.floor(Math.random() * 22);
      }
      tCtx.putImageData(imgData, 0, 0);
    }
  }
  return ctx.createPattern(grainTileCanvas, "repeat");
}

/**
 * Applies subtle procedural micro-grain for anti-banding and photographic depth.
 * Fast GPU-accelerated tiled pattern render (<0.2ms).
 */
function drawMicroGrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number = 0.025,
) {
  const pattern = getGrainPattern(ctx);
  if (!pattern) return;
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = Math.min(0.08, amount * 2.5);
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Render a wallpaper onto the given canvas at full target resolution.
 * Each call produces a new deterministic or randomized composition.
 */
export function renderWallpaper(
  canvas: HTMLCanvasElement,
  { style, palette, resolution, tone, seed }: RenderOptions,
): void {
  canvas.width = resolution.width;
  canvas.height = resolution.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const activeSeed = seed !== undefined ? seed : Math.floor(Math.random() * 1000000);
  activePRNG = createPRNG(activeSeed);

  RENDERERS[style](ctx, resolution.width, resolution.height, palette, tone);
  drawMicroGrain(ctx, resolution.width, resolution.height, 0.025);
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }, "image/png");
}
