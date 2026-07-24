"use client";

import { forwardRef, useEffect, type Ref } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";
import type { Resolution } from "@/lib/wallpaper";

interface PreviewCanvasProps {
  resolution: Resolution;
  /** Increments on every generation — re-triggers the reveal animation. */
  version: number;
}

/** Shared canvas element so every frame wraps the identical node. */
function Screen({
  canvasRef,
  resolution,
  className,
}: {
  canvasRef: Ref<HTMLCanvasElement>;
  resolution: Resolution;
  className: string;
}) {
  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Generated minimalist wallpaper, ${resolution.label}`}
      className={className}
    />
  );
}

/**
 * Device-simulation preview: the full-resolution canvas is shown
 * inside a CSS device frame matching the selected resolution —
 * monitor (Desktop 4K), phone (iPhone), tablet (iPad) or laptop
 * (MacBook) — so the wallpaper is judged the way it will be seen.
 *
 * NOTE: swapping frames remounts the canvas, which is safe because
 * WallpaperStudio's render effect redraws after every resolution
 * change. Frames are CSS-only, so downloads stay frameless.
 */
const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewCanvasProps>(
  function PreviewCanvas({ resolution, version }, ref) {
    const [scope, animate] = useAnimate();
    const reduceMotion = useReducedMotion();

    useEffect(() => {
      if (version === 0 || reduceMotion) return;
      animate(
        scope.current,
        { opacity: [0.35, 1], scale: [0.985, 1] },
        { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
      );
    }, [version, animate, scope, reduceMotion]);

    const bezel =
      "border-[#1c1e24] bg-[#1c1e24] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9),inset_0_0_2px_rgba(255,255,255,0.25)]";

    return (
      <figure className="m-0">
        <div ref={scope} className="flex flex-col items-center">
          {resolution.id === "iphone" && (
            /* ---- Phone: bezel, dynamic island, side button ---- */
            <div className={`relative rounded-[2.6rem] border-[10px] ${bezel}`}>
              <div
                aria-hidden
                className="absolute top-2.5 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black/90"
              />
              <div
                aria-hidden
                className="absolute top-24 -right-[13px] h-14 w-[3px] rounded-r bg-[#2a2d35]"
              />
              <Screen
                canvasRef={ref}
                resolution={resolution}
                className="block h-auto max-h-[62vh] w-auto max-w-full rounded-[1.9rem]"
              />
            </div>
          )}

          {resolution.id === "ipad" && (
            /* ---- Tablet: even bezel, front camera dot ---- */
            <div className={`relative rounded-[1.8rem] border-[14px] ${bezel}`}>
              <div
                aria-hidden
                className="absolute -top-[9px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#3a3f4a]"
              />
              <Screen
                canvasRef={ref}
                resolution={resolution}
                className="block h-auto max-h-[62vh] w-auto max-w-full rounded-[0.9rem]"
              />
            </div>
          )}

          {resolution.id === "macbook" && (
            /* ---- Laptop: screen with camera notch + keyboard deck ---- */
            <div className="flex w-full max-w-[86%] flex-col items-center">
              <div className={`relative w-full rounded-t-xl rounded-b-sm border-[8px] ${bezel}`}>
                <div
                  aria-hidden
                  className="absolute top-0 left-1/2 z-10 h-2.5 w-16 -translate-x-1/2 rounded-b-lg bg-[#1c1e24]"
                />
                <Screen
                  canvasRef={ref}
                  resolution={resolution}
                  className="block h-auto w-full rounded-t-md"
                />
              </div>
              {/* Deck with thumb scoop */}
              <div
                aria-hidden
                className="relative h-3.5 w-[118%] rounded-b-xl bg-gradient-to-b from-[#2a2d35] to-[#16181d] shadow-[0_16px_28px_-10px_rgba(0,0,0,0.8)]"
              >
                <div className="absolute top-0 left-1/2 h-1.5 w-20 -translate-x-1/2 rounded-b-full bg-[#101216]" />
              </div>
            </div>
          )}

          {resolution.id === "desktop4k" && (
            /* ---- Monitor: bezel, status LED, neck + base ---- */
            <div className="flex w-full flex-col items-center">
              <div className={`relative w-full rounded-2xl border-[10px] pb-5 ${bezel}`}>
                <Screen
                  canvasRef={ref}
                  resolution={resolution}
                  className="block h-auto w-full rounded-lg"
                />
                <div
                  aria-hidden
                  className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lumen-a/70"
                />
              </div>
              <div aria-hidden className="h-10 w-16 bg-gradient-to-b from-[#16181d] to-[#22252c]" />
              <div aria-hidden className="h-2.5 w-52 rounded-full bg-[#22252c] shadow-[0_14px_24px_-8px_rgba(0,0,0,0.8)]" />
            </div>
          )}
        </div>
        <figcaption className="mt-4 flex items-center justify-center gap-2 text-[11px] tracking-[0.18em] text-faint uppercase">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-lumen-a" />
          {resolution.label} · {resolution.width} × {resolution.height} px
        </figcaption>
      </figure>
    );
  },
);

export default PreviewCanvas;
