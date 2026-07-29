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
import { useLanguage } from "@/lib/i18n";

const PreviewCanvas = forwardRef<HTMLCanvasElement, PreviewCanvasProps>(
  function PreviewCanvas({ resolution, version }, ref) {
    const { t } = useLanguage();
    const [scope, animate] = useAnimate();
    const reduceMotion = useReducedMotion();

    useEffect(() => {
      if (version === 0 || reduceMotion) return;
      animate(
        scope.current,
        { opacity: [0.75, 1], scale: [0.995, 1] },
        { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      );
    }, [version, animate, scope, reduceMotion]);

    const bezel =
      "border-[#1c1e24] bg-[#1c1e24] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9),inset_0_0_2px_rgba(255,255,255,0.25)]";

    const isMobilePhone = [
      "iphone",
      "fhd_plus",
      "one_five_k",
      "qhd_plus",
      "mobile_4k",
    ].includes(resolution.id);

    return (
      <figure className="m-0 flex flex-col items-center">
        <div ref={scope} className="flex flex-col items-center">
          {isMobilePhone && (
            /* ---- Smartphone frame (iPhone, FHD+, 1.5K, QHD+, Mobile 4K) ---- */
            <div
              className={`relative ${
                resolution.id === "qhd_plus"
                  ? "rounded-[1.8rem] border-[8px]" // Galaxy S24 Ultra sharp-flat sleek bezel
                  : resolution.id === "mobile_4k"
                  ? "rounded-[1.5rem] border-[9px]" // Sony Xperia 21:9 tall frame
                  : "rounded-[2.6rem] border-[10px]" // Standard curved phone frame
              } ${bezel}`}
            >
              {/* Top Notch / Punch Hole / Camera Bar Cutouts */}
              {resolution.id === "iphone" && (
                /* Dynamic Island */
                <div
                  aria-hidden
                  className="absolute top-2.5 left-1/2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black/95 shadow-sm"
                />
              )}

              {(resolution.id === "fhd_plus" ||
                resolution.id === "one_five_k" ||
                resolution.id === "qhd_plus") && (
                /* Android Punch-hole Camera (Galaxy S24 / Xiaomi 14T / OnePlus 12) */
                <div
                  aria-hidden
                  className="absolute top-2.5 left-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-black/95 ring-1 ring-white/10"
                />
              )}

              {resolution.id === "mobile_4k" && (
                /* Sony Xperia bezel camera & ear speaker strip */
                <div
                  aria-hidden
                  className="absolute top-1.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
                >
                  <div className="h-1.5 w-8 rounded-full bg-[#2a2d35]" />
                  <div className="h-2 w-2 rounded-full bg-black/95 ring-1 ring-white/10" />
                </div>
              )}

              {/* Side Buttons */}
              <div
                aria-hidden
                className="absolute top-24 -right-[12px] h-12 w-[3px] rounded-r bg-[#2a2d35]"
              />
              <div
                aria-hidden
                className="absolute top-40 -right-[12px] h-8 w-[3px] rounded-r bg-[#2a2d35]"
              />

              <Screen
                canvasRef={ref}
                resolution={resolution}
                className={`block h-auto max-h-[62vh] w-auto max-w-full ${
                  resolution.id === "qhd_plus"
                    ? "rounded-[1.3rem]"
                    : resolution.id === "mobile_4k"
                    ? "rounded-[1.1rem]"
                    : "rounded-[1.9rem]"
                }`}
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

          {["desktop4k", "desktop5k", "desktop8k", "desktop10k"].includes(resolution.id) && (
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

        <figcaption className="mt-5 flex flex-col items-center gap-1 text-center">
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-faint uppercase font-semibold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lumen-a" />
            {resolution.label} · {resolution.width} × {resolution.height} px
          </div>
          {resolution.deviceRef && (
            <p className="text-xs text-mist/80 font-medium">
              {t("deviceReference")}: <span className="text-lumen font-semibold">{resolution.deviceRef}</span>
              {resolution.ppi && (
                <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-dim">
                  {resolution.ppi} ({resolution.panelTech})
                </span>
              )}
            </p>
          )}
        </figcaption>
      </figure>
    );
  },
);

export default PreviewCanvas;
