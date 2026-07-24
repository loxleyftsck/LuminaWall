"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Laptop,
  Monitor,
  Moon,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
} from "lucide-react";
import {
  PALETTES,
  RESOLUTIONS,
  STYLES,
  type Palette,
  type Resolution,
  type StyleId,
  type Tone,
  downloadCanvas,
  renderWallpaper,
} from "@/lib/wallpaper";
import GlassCard from "@/components/ui/GlassCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import PaletteSelector from "@/components/PaletteSelector";
import PreviewCanvas from "@/components/PreviewCanvas";
import AdInterstitial from "@/components/AdInterstitial";

/** Every 4th Generate click triggers the interstitial placeholder. */
const AD_FREQUENCY = 4;

/**
 * WallpaperStudio — client-side orchestrator. Owns all generation
 * state and the full-resolution canvas; child components are pure UI.
 */
export default function WallpaperStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickCount = useRef(0);
  // version ref: incremented on every render and passed to PreviewCanvas
  // as a prop to trigger its reveal animation — kept as a ref so it does
  // NOT cause an extra re-render cycle on top of the deps-driven render.
  const versionRef = useRef(0);
  const [animVersion, setAnimVersion] = useState(0);

  const [style, setStyle] = useState<StyleId>("flow");
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);
  const [tone, setTone] = useState<Tone>("light");
  const [resolution, setResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [showAd, setShowAd] = useState(false);
  // Bumped by the Generate button to force a fresh composition.
  const [seed, setSeed] = useState(0);

  // Rendering is derived from state: any setting change (or seed bump)
  // regenerates with the *committed* values, so no handler can ever
  // render from a stale closure. Version is bumped via ref+state pair
  // to avoid a second render cycle after each generation.
  useEffect(() => {
    if (!canvasRef.current) return;
    renderWallpaper(canvasRef.current, { style, palette, resolution, tone });
    versionRef.current += 1;
    setAnimVersion(versionRef.current);
  }, [style, palette, resolution, tone, seed]);

  const handleGenerate = () => {
    clickCount.current += 1;
    if (clickCount.current % AD_FREQUENCY === 0) {
      setShowAd(true); // generation resumes when the ad is dismissed
    } else {
      setSeed((s) => s + 1);
    }
  };

  const dismissAd = () => {
    setShowAd(false);
    setSeed((s) => s + 1);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    downloadCanvas(
      canvasRef.current,
      `luminawall-${style}-${palette.id}-${resolution.width}x${resolution.height}.png`,
    );
  };


  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Preview */}
      <GlassCard className="flex-1 p-4 sm:p-6">
        <PreviewCanvas ref={canvasRef} resolution={resolution} version={animVersion} />
      </GlassCard>

      {/* Control rail */}
      <GlassCard className="w-full shrink-0 space-y-7 p-6 lg:w-[340px]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mist px-6 py-4 font-semibold text-abyss shadow-[0_10px_40px_-10px_rgba(238,241,246,0.35)]"
        >
          <Sparkles size={18} />
          Generate
        </motion.button>

        <SegmentedControl
          id="style"
          label="Style"
          columns={3}
          value={style}
          onChange={setStyle}
          options={STYLES.map((s) => ({ value: s.id, label: s.name }))}
        />

        <PaletteSelector value={palette} onChange={setPalette} />

        <SegmentedControl<Tone>
          id="tone"
          label="Tone"
          columns={2}
          value={tone}
          onChange={setTone}
          options={[
            { value: "light", label: "Light", icon: <Sun size={15} /> },
            { value: "dark", label: "Dark", icon: <Moon size={15} /> },
          ]}
        />

        <SegmentedControl
          id="resolution"
          label="Resolution"
          columns={2}
          value={resolution.id}
          onChange={(id) =>
            setResolution(RESOLUTIONS.find((r) => r.id === id) ?? RESOLUTIONS[0])
          }
          options={RESOLUTIONS.map((r) => {
            const icons: Record<string, ReactNode> = {
              desktop4k: <Monitor size={15} />,
              iphone: <Smartphone size={15} />,
              ipad: <Tablet size={15} />,
              macbook: <Laptop size={15} />,
            };
            return { value: r.id, label: r.label, icon: icons[r.id] };
          })}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 font-medium text-mist transition-colors hover:bg-white/[0.06]"
        >
          <Download size={17} />
          Download PNG
        </motion.button>
      </GlassCard>

      <AdInterstitial open={showAd} onDismiss={dismissAd} />
    </div>
  );
}
