"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Cpu, Dices, Download, Loader2 } from "lucide-react";
import {
  type AttractorParams,
  type AttractorType,
  type EngineKind,
  getEngine,
  isChaotic,
  renderDensity,
} from "@/lib/attractor";
import { downloadCanvas, type Palette } from "@/lib/wallpaper";
import PaletteDots from "@/components/ui/PaletteDots";

const PARAM_KEYS = ["a", "b", "c", "d"] as const;

const DEFAULTS: AttractorParams = {
  type: "dejong",
  a: -2.24,
  b: 0.43,
  c: -0.65,
  d: -2.43,
  iterations: 1_000_000,
};

const randParam = () => Math.round((Math.random() * 4 - 2) * 100) / 100;

/**
 * Full-screen strange-attractor wallpaper lab. The canvas fills the
 * viewport; controls float on top as a glass panel. Compute runs in
 * Wasm when public/wasm/attractor.wasm is built, otherwise in an
 * identical TypeScript engine — the badge shows which one is live.
 */
export default function AttractorLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [params, setParams] = useState<AttractorParams>(DEFAULTS);
  const [engineKind, setEngineKind] = useState<EngineKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [palette, setPalette] = useState<Palette | null>(null);

  const render = useCallback(async (p: AttractorParams, pal: Palette | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    // Let the busy indicator paint before the compute pass blocks.
    await new Promise((r) => requestAnimationFrame(r));
    const engine = await getEngine();
    setEngineKind(engine.kind);
    const orbit = engine.compute(p);
    const dpr = window.devicePixelRatio || 1;
    const physW = window.innerWidth * dpr;
    const physH = window.innerHeight * dpr;
    renderDensity(canvas, orbit, physW, physH, pal ?? undefined);
    // Fix DPR mismatch: canvas buffer is physW×physH but CSS must show
    // it at logical size so it appears sharp, not scaled-up/blurry.
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    setBusy(false);
  }, []);

  // Render on mount and whenever committed params change (debounced so
  // slider drags don't queue a compute per pixel of travel).
  useEffect(() => {
    const t = setTimeout(() => void render(params, palette), 120);
    return () => clearTimeout(t);
  }, [params, palette, render]);

  // Re-render when the viewport resizes (debounced 150ms to avoid
  // firing on every pixel during a drag resize).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => void render(params, palette), 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [params, palette, render]);

  const randomize = () =>
    setParams((p) => {
      // Resample until the orbit is genuinely chaotic — random draws
      // often collapse to a fixed point (blank screen otherwise).
      for (let attempt = 0; attempt < 50; attempt++) {
        const a = randParam(), b = randParam(), c = randParam(), d = randParam();
        if (isChaotic(p.type, a, b, c, d)) return { ...p, a, b, c, d };
      }
      return { ...p, a: -2.24, b: 0.43, c: -0.65, d: -2.43 }; // known-good
    });

  const download = () => {
    if (!canvasRef.current) return;
    const { type, a, b, c, d } = params;
    downloadCanvas(canvasRef.current, `luminawall-${type}-${a}_${b}_${c}_${d}.png`);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      {/* The wallpaper itself — full viewport, device-pixel sharp. */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Strange attractor density render"
        className="absolute inset-0 h-full w-full"
      />

      {/* Floating control panel */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Attractor controls"
        className="glass absolute top-4 left-4 flex w-72 flex-col gap-4 rounded-3xl p-5 sm:top-6 sm:left-6"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-mist"
          >
            <ArrowLeft size={13} /> Studio
          </Link>
          <span
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] tracking-[0.14em] text-faint uppercase"
            title="Compute backend"
          >
            <Cpu size={11} className={engineKind === "wasm" ? "text-lumen-a" : ""} />
            {engineKind === null ? "…" : engineKind === "wasm" ? "Wasm" : "JS engine"}
          </span>
        </div>

        <h1 className="font-display text-xl italic">Attractor Lab</h1>

        {/* Attractor type */}
        <div role="radiogroup" aria-label="Attractor type" className="grid grid-cols-2 gap-1.5">
          {(["dejong", "clifford"] as AttractorType[]).map((t) => (
            <button
              key={t}
              role="radio"
              aria-checked={params.type === t}
              onClick={() => setParams((p) => ({ ...p, type: t }))}
              className={`rounded-xl border px-2 py-2 text-sm transition-colors ${
                params.type === t
                  ? "border-white/30 bg-white/10 text-mist"
                  : "border-white/10 text-dim hover:text-mist"
              }`}
            >
              {t === "dejong" ? "de Jong" : "Clifford"}
            </button>
          ))}
        </div>

        {/* Parameter sliders */}
        {PARAM_KEYS.map((k) => (
          <label key={k} className="block">
            <span className="mb-1 flex justify-between text-xs text-dim">
              <span className="font-mono">{k}</span>
              <span className="font-mono text-mist">{params[k].toFixed(2)}</span>
            </span>
            <input
              type="range"
              min={-3}
              max={3}
              step={0.01}
              value={params[k]}
              onChange={(e) =>
                setParams((p) => ({ ...p, [k]: Number(e.target.value) }))
              }
              className="w-full accent-[#7dd3fc]"
              aria-label={`Parameter ${k}`}
            />
          </label>
        ))}

        {/* Iterations */}
        <label className="block">
          <span className="mb-1 flex justify-between text-xs text-dim">
            Iterations
            <span className="font-mono text-mist">
              {(params.iterations / 1_000_000).toFixed(1)}M
            </span>
          </span>
          <input
            type="range"
            min={200_000}
            max={4_000_000}
            step={200_000}
            value={params.iterations}
            onChange={(e) =>
              setParams((p) => ({ ...p, iterations: Number(e.target.value) }))
            }
            className="w-full accent-[#7dd3fc]"
            aria-label="Iteration count"
          />
        </label>

        <PaletteDots value={palette} onChange={setPalette} />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={randomize}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-2xl bg-mist px-5 py-3 font-semibold text-black disabled:opacity-60"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Dices size={16} />}
          Generate
        </motion.button>
        <button
          onClick={download}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-2.5 text-sm text-mist transition-colors hover:bg-white/[0.06]"
        >
          <Download size={15} /> Download PNG
        </button>
      </motion.aside>
    </main>
  );
}
