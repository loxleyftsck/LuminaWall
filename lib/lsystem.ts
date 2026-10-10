import { canvasSize, type RenderCanvas } from "@/lib/canvas";
/**
 * L-System (Lindenmayer System) engine + turtle-graphics renderer.
 * Pure TypeScript, strictly client-side.
 *
 * String rewriting: starting from an axiom, every character is
 * replaced by its production rule (or itself) once per iteration.
 * Turtle interpretation of the final string:
 *   F → draw one segment forward      + → turn right by the angle
 *   - → turn left by the angle        [ → push position/heading
 *   ] → pop position/heading          (anything else, e.g. X → no-op)
 */

import { shade, type Palette } from "@/lib/wallpaper";

export interface LSystemPreset {
  id: string;
  name: string;
  axiom: string;
  rules: Record<string, string>;
  /** Recommended defaults for this preset. */
  angle: number;
  /** Initial heading in degrees (−90 = growing upward). */
  heading: number;
  maxIterations: number;
  /** Iteration count that looks best on first selection. */
  defaultIterations: number;
}

export const PRESETS: LSystemPreset[] = [
  {
    id: "plant",
    name: "Fractal Plant",
    axiom: "X",
    rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" },
    angle: 25,
    heading: -90,
    maxIterations: 6,
    defaultIterations: 5,
  },
  {
    id: "tree",
    name: "Binary Tree",
    axiom: "F",
    rules: { F: "FF+[+F-F-F]-[-F+F+F]" },
    angle: 22,
    heading: -90,
    maxIterations: 5,
    defaultIterations: 4,
  },
  {
    id: "koch",
    name: "Koch Snowflake",
    axiom: "F--F--F",
    rules: { F: "F+F--F+F" },
    angle: 60,
    heading: 0,
    maxIterations: 6,
    defaultIterations: 5,
  },
  {
    id: "dragon",
    name: "Dragon Curve",
    axiom: "FX",
    rules: { X: "X+YF+", Y: "-FX-Y" },
    angle: 90,
    heading: 0,
    maxIterations: 15, // 2^n segments — 15 ≈ 32k, still instant
    defaultIterations: 12,
  },
  {
    id: "hilbert",
    name: "Hilbert Curve",
    axiom: "X",
    rules: { X: "+YF-XFX-FY+", Y: "-XF+YFY+FX-" },
    angle: 90,
    heading: 0,
    maxIterations: 7, // 4^n − 1 segments — 7 ≈ 16k
    defaultIterations: 6,
  },
];

/** Guard against runaway growth (6 plant iterations ≈ 200k chars). */
const MAX_LENGTH = 2_000_000;

/** Expand the axiom through `iterations` rounds of rewriting. */
export function expand(
  axiom: string,
  rules: Record<string, string>,
  iterations: number,
): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (const ch of current) {
      const replacement = rules[ch] ?? ch;
      if (next.length + replacement.length > MAX_LENGTH) throw new Error("L-System detail limit exceeded");
      next += replacement;
    }
    current = next;
  }
  return current;
}

interface TurtleState {
  x: number;
  y: number;
  heading: number; // radians
}

/**
 * Walk the string once, collecting every drawn segment in abstract
 * turtle space (unit segment length). Returns segments + bounds so
 * the caller can scale/center onto any canvas.
 */
function walk(
  instructions: string,
  angleDeg: number,
  headingDeg: number,
): { segments: Float32Array; count: number; bounds: [number, number, number, number] } {
  const angle = (angleDeg * Math.PI) / 180;
  const stack: TurtleState[] = [];
  let x = 0, y = 0, heading = (headingDeg * Math.PI) / 180;
  let minX = 0, maxX = 0, minY = 0, maxY = 0;

  // Worst case every char is an F: 4 floats per segment.
  const segments = new Float32Array(instructions.length * 4);
  let count = 0;

  for (const ch of instructions) {
    if (ch === "F") {
      const nx = x + Math.cos(heading);
      const ny = y + Math.sin(heading);
      const o = count * 4;
      segments[o] = x; segments[o + 1] = y;
      segments[o + 2] = nx; segments[o + 3] = ny;
      count++;
      x = nx; y = ny;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else if (ch === "+") {
      heading += angle;
    } else if (ch === "-") {
      heading -= angle;
    } else if (ch === "[") {
      stack.push({ x, y, heading });
    } else if (ch === "]") {
      const s = stack.pop();
      if (s) ({ x, y, heading } = s);
    }
    // Any other symbol (X, …) only steers rewriting; the turtle ignores it.
  }
  return { segments, count, bounds: [minX, maxX, minY, maxY] };
}

export interface RenderOptions {
  iterations: number;
  angle: number;
  /** Zoom multiplier; 1 = fit to viewport with a margin. */
  lengthScale: number;
  /** Optional palette; omitted = classic white on dark slate. */
  palette?: Palette;
}

/**
 * Render a preset onto the canvas: expand → walk → auto-fit (uniform
 * scale, centered) → one stroked path. Minimalist geometry: 1px crisp
 * white hairline on near-black slate.
 */
export function renderLSystem(
  canvas: RenderCanvas,
  preset: LSystemPreset,
  { iterations, angle, lengthScale, palette }: RenderOptions,
  width: number,
  height: number,
): { segments: number } {
  ({ width, height } = canvasSize(width, height));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  // Background: the palette's deepest color, pulled darker so the
  // hairline strokes keep their contrast; dark slate without one.
  ctx.fillStyle = palette ? shade(palette.colors[3], 0.55) : "#0b0e14";
  ctx.fillRect(0, 0, width, height);

  const instructions = expand(preset.axiom, preset.rules, iterations);
  const { segments, count, bounds } = walk(instructions, angle, preset.heading);
  if (count === 0) return { segments: 0 };

  const [minX, maxX, minY, maxY] = bounds;
  const spanX = Math.max(1e-6, maxX - minX);
  const spanY = Math.max(1e-6, maxY - minY);
  const scale =
    Math.min((width * 0.86) / spanX, (height * 0.86) / spanY) * lengthScale;
  const offX = (width - spanX * scale) / 2 - minX * scale;
  const offY = (height - spanY * scale) / 2 - minY * scale;

  if (palette) {
    // Diagonal gradient across the figure's bounding box, running
    // through the palette's two lightest colors — subtle, still crisp.
    const g = ctx.createLinearGradient(
      minX * scale + offX,
      minY * scale + offY,
      maxX * scale + offX,
      maxY * scale + offY,
    );
    g.addColorStop(0, palette.colors[0]);
    g.addColorStop(1, palette.colors[1]);
    ctx.strokeStyle = g;
  } else {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
  }
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    ctx.moveTo(segments[o] * scale + offX, segments[o + 1] * scale + offY);
    ctx.lineTo(segments[o + 2] * scale + offX, segments[o + 3] * scale + offY);
  }
  ctx.stroke();
  return { segments: count };
}
