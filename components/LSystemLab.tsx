"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Download, TreePine } from "lucide-react";
import { PRESETS, renderLSystem, type LSystemPreset } from "@/lib/lsystem";
import { downloadCanvas, type Palette } from "@/lib/wallpaper";
import PaletteDots from "@/components/ui/PaletteDots";

/**
 * Full-screen interactive L-System wallpaper lab. The canvas fills
 * the viewport; a floating glass panel controls preset, iterations,
 * turn angle and line length. All rendering is client-side.
 */
export default function LSystemLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [preset, setPreset] = useState<LSystemPreset>(PRESETS[0]);
  const [iterations, setIterations] = useState(5);
  const [angle, setAngle] = useState(PRESETS[0].angle);
  const [lengthScale, setLengthScale] = useState(1);
  const [segmentCount, setSegmentCount] = useState(0);
  const [palette, setPalette] = useState<Palette | null>(null);

  // Re-render on any committed control change (debounced for sliders).
  useEffect(() => {
    const doRender = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const { segments } = renderLSystem(
        canvas,
        preset,
        { iterations, angle, lengthScale, palette: palette ?? undefined },
        window.innerWidth * dpr,
        window.innerHeight * dpr,
      );
      // Fix DPR mismatch: physical canvas is dpr× larger; CSS must
      // clamp it back to logical pixels so it fills (not overflows) the
      // viewport and stays pixel-sharp on HiDPI screens.
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      setSegmentCount(segments);
    };
    const t = setTimeout(doRender, 80);
    return () => clearTimeout(t);
  }, [preset, iterations, angle, lengthScale, palette]);

  // Re-render when the viewport resizes (debounced 150ms).
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      t = setTimeout(() => {
        const { segments } = renderLSystem(
          canvas,
          preset,
          { iterations, angle, lengthScale, palette: palette ?? undefined },
          window.innerWidth * dpr,
          window.innerHeight * dpr,
        );
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        setSegmentCount(segments);
      }, 150);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [preset, iterations, angle, lengthScale, palette]);

  const selectPreset = (p: LSystemPreset) => {
    setPreset(p);
    setAngle(p.angle); // each preset has its canonical angle
    setIterations(p.defaultIterations);
  };

  const download = () =>
    canvasRef.current &&
    downloadCanvas(
      canvasRef.current,
      `luminawall-lsystem-${preset.id}-i${iterations}-a${angle}.png`,
    );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0b0e14]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`L-System render: ${preset.name}`}
        className="absolute inset-0 h-full w-full"
      />

      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        aria-label="L-System controls"
        className="glass absolute top-4 left-4 flex w-72 flex-col gap-4 rounded-3xl p-5 sm:top-6 sm:left-6"
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-dim transition-colors hover:text-mist"
          >
            <ArrowLeft size={13} /> Studio
          </Link>
          <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-faint">
            {segmentCount.toLocaleString()} segments
          </span>
        </div>

        <h1 className="font-display flex items-center gap-2 text-xl italic">
          <TreePine size={18} className="text-lumen-a" /> L-System Lab
        </h1>

        {/* Preset */}
        <div role="radiogroup" aria-label="L-System preset" className="grid gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              role="radio"
              aria-checked={preset.id === p.id}
              onClick={() => selectPreset(p)}
              className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                preset.id === p.id
                  ? "border-white/30 bg-white/10 text-mist"
                  : "border-white/10 text-dim hover:text-mist"
              }`}
            >
              {p.name}
              <span className="mt-0.5 block font-mono text-[10px] text-faint">
                {p.axiom} · {Object.entries(p.rules)[0][0]}→
                {Object.entries(p.rules)[0][1].slice(0, 18)}
                {Object.entries(p.rules)[0][1].length > 18 ? "…" : ""}
              </span>
            </button>
          ))}
        </div>

        {/* Iterations */}
        <label className="block">
          <span className="mb-1 flex justify-between text-xs text-dim">
            Iterations
            <span className="font-mono text-mist">{iterations}</span>
          </span>
          <input
            type="range"
            min={1}
            max={preset.maxIterations}
            step={1}
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            className="w-full accent-[#7dd3fc]"
            aria-label="Iterations"
          />
        </label>

        {/* Turn angle */}
        <label className="block">
          <span className="mb-1 flex justify-between text-xs text-dim">
            Turn angle
            <span className="font-mono text-mist">{angle}°</span>
          </span>
          <input
            type="range"
            min={5}
            max={90}
            step={1}
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-[#7dd3fc]"
            aria-label="Turn angle in degrees"
          />
        </label>

        {/* Line length (zoom) */}
        <label className="block">
          <span className="mb-1 flex justify-between text-xs text-dim">
            Line length
            <span className="font-mono text-mist">{lengthScale.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            min={0.4}
            max={2.5}
            step={0.05}
            value={lengthScale}
            onChange={(e) => setLengthScale(Number(e.target.value))}
            className="w-full accent-[#7dd3fc]"
            aria-label="Line length multiplier"
          />
        </label>

        <PaletteDots value={palette} onChange={setPalette} />

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
