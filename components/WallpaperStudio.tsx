"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Laptop,
  Monitor,
  Moon,
  Palette as PaletteIcon,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  Tablet,
  Wand2,
  X,
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
import { useLanguage } from "@/lib/i18n";

/** Every 4th Generate click triggers the interstitial placeholder. */
const AD_FREQUENCY = 4;

/**
 * WallpaperStudio — client-side orchestrator. Owns all generation
 * state and the full-resolution canvas; child components are pure UI.
 */
export default function WallpaperStudio() {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickCount = useRef(0);
  const versionRef = useRef(0);
  const [animVersion, setAnimVersion] = useState(0);

  const [style, setStyle] = useState<StyleId>("flow");
  const [palette, setPalette] = useState<Palette>(PALETTES[0]);
  const [tone, setTone] = useState<Tone>("light");
  const [resolution, setResolution] = useState<Resolution>(RESOLUTIONS[0]);
  const [showAd, setShowAd] = useState(false);
  const [seed, setSeed] = useState(0);

  // Mobile Bottom Sheet active tab state
  const [activeMobileTab, setActiveMobileTab] = useState<"none" | "style" | "palette" | "resolution">("none");

  useEffect(() => {
    if (!canvasRef.current) return;
    renderWallpaper(canvasRef.current, { style, palette, resolution, tone });
    versionRef.current += 1;
    setAnimVersion(versionRef.current);
  }, [style, palette, resolution, tone, seed]);

  const handleGenerate = () => {
    clickCount.current += 1;
    if (clickCount.current % AD_FREQUENCY === 0) {
      setShowAd(true);
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

      {/* Desktop Control rail (lg:block) */}
      <GlassCard className="w-full shrink-0 space-y-7 p-6 lg:w-[340px]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mist px-6 py-4 font-semibold text-abyss shadow-[0_10px_40px_-10px_rgba(238,241,246,0.35)]"
        >
          <Sparkles size={18} />
          {t("generate")}
        </motion.button>

        <SegmentedControl
          id="style"
          label={t("style")}
          columns={3}
          value={style}
          onChange={setStyle}
          options={STYLES.map((s) => ({ value: s.id, label: s.name }))}
        />

        {(() => {
          const currentStyleObj = STYLES.find((s) => s.id === style);
          if (!currentStyleObj?.journalRef) return null;
          return (
            <div className="-mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
              <p className="text-[11px] text-mist/90">
                📄 {t("journalRef")}: <span className="text-lumen font-medium">{currentStyleObj.journalRef}</span>
              </p>
            </div>
          );
        })()}

        <PaletteSelector value={palette} onChange={setPalette} />

        <SegmentedControl<Tone>
          id="tone"
          label={t("tone")}
          columns={2}
          value={tone}
          onChange={setTone}
          options={[
            { value: "light", label: t("toneLight"), icon: <Sun size={15} /> },
            { value: "dark", label: t("toneDark"), icon: <Moon size={15} /> },
          ]}
        />

        <SegmentedControl
          id="resolution"
          label={t("resolution")}
          columns={2}
          value={resolution.id}
          onChange={(id) =>
            setResolution(RESOLUTIONS.find((r) => r.id === id) ?? RESOLUTIONS[0])
          }
          options={RESOLUTIONS.map((r) => {
            const icons: Record<string, ReactNode> = {
              desktop4k: <Monitor size={15} />,
              iphone: <Smartphone size={15} />,
              fhd_plus: <Smartphone size={15} />,
              one_five_k: <Smartphone size={15} />,
              qhd_plus: <Smartphone size={15} />,
              mobile_4k: <Smartphone size={15} />,
              ipad: <Tablet size={15} />,
              macbook: <Laptop size={15} />,
            };
            return { value: r.id, label: r.label, icon: icons[r.id] ?? <Smartphone size={15} /> };
          })}
        />

        {resolution.deviceRef && (
          <div className="-mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
            <p className="text-dim font-medium">
              <span className="text-mist font-semibold">{resolution.label}</span> ({resolution.width}×{resolution.height}px)
            </p>
            <p className="mt-1 text-[11px] text-mist/90">
              📱 {t("deviceReference")}: <span className="text-lumen font-medium">{resolution.deviceRef}</span>
            </p>
            {resolution.ppi && (
              <p className="mt-0.5 text-[10px] text-faint">
                ⚡ {t("sharpnessPanel")}: {resolution.ppi} · {resolution.panelTech}
              </p>
            )}
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 font-medium text-mist transition-colors hover:bg-white/[0.06]"
        >
          <Download size={17} />
          {t("download")}
        </motion.button>
      </GlassCard>

      {/* Mobile Floating Bottom Bar (lg:hidden) */}
      <div className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-between gap-1.5 rounded-2xl border border-white/15 bg-[#090b10]/95 p-2 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] lg:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-mist px-3 py-2.5 text-xs font-bold text-abyss shadow-md"
        >
          <Sparkles size={15} />
          {t("generate")}
        </motion.button>

        <button
          onClick={() => setActiveMobileTab(activeMobileTab === "style" ? "none" : "style")}
          className={`flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeMobileTab === "style"
              ? "bg-white/20 text-mist"
              : "text-dim hover:text-mist"
          }`}
        >
          <Wand2 size={15} />
          <span>{t("style")}</span>
        </button>

        <button
          onClick={() => setActiveMobileTab(activeMobileTab === "palette" ? "none" : "palette")}
          className={`flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeMobileTab === "palette"
              ? "bg-white/20 text-mist"
              : "text-dim hover:text-mist"
          }`}
        >
          <PaletteIcon size={15} />
          <span>{t("palette")}</span>
        </button>

        <button
          onClick={() => setActiveMobileTab(activeMobileTab === "resolution" ? "none" : "resolution")}
          className={`flex items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
            activeMobileTab === "resolution"
              ? "bg-white/20 text-mist"
              : "text-dim hover:text-mist"
          }`}
        >
          <SlidersHorizontal size={15} />
          <span>{t("resolution")}</span>
        </button>

        <button
          onClick={handleDownload}
          aria-label={t("download")}
          className="flex items-center justify-center rounded-xl border border-white/15 p-2.5 text-mist hover:bg-white/10"
        >
          <Download size={15} />
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {activeMobileTab !== "none" && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveMobileTab("none")}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-3xl border-t border-white/15 bg-[#0d0f17] p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-10 rounded-full bg-white/20" />
                  <span className="text-sm font-bold uppercase tracking-wider text-mist">
                    {activeMobileTab === "style" && t("style")}
                    {activeMobileTab === "palette" && t("palette")}
                    {activeMobileTab === "resolution" && t("resolution")}
                  </span>
                </div>
                <button
                  onClick={() => setActiveMobileTab("none")}
                  className="rounded-full p-1 text-dim hover:bg-white/10 hover:text-mist"
                >
                  <X size={18} />
                </button>
              </div>

              {activeMobileTab === "style" && (
                <div className="space-y-4">
                  <SegmentedControl
                    id="mobile_style"
                    label={t("style")}
                    columns={3}
                    value={style}
                    onChange={setStyle}
                    options={STYLES.map((s) => ({ value: s.id, label: s.name }))}
                  />
                  {(() => {
                    const currentStyleObj = STYLES.find((s) => s.id === style);
                    if (!currentStyleObj?.journalRef) return null;
                    return (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                        <p className="text-[11px] text-mist/90">
                          📄 {t("journalRef")}: <span className="text-lumen font-medium">{currentStyleObj.journalRef}</span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}

              {activeMobileTab === "palette" && (
                <div className="space-y-4">
                  <PaletteSelector value={palette} onChange={setPalette} />
                  <SegmentedControl<Tone>
                    id="mobile_tone"
                    label={t("tone")}
                    columns={2}
                    value={tone}
                    onChange={setTone}
                    options={[
                      { value: "light", label: t("toneLight"), icon: <Sun size={15} /> },
                      { value: "dark", label: t("toneDark"), icon: <Moon size={15} /> },
                    ]}
                  />
                </div>
              )}

              {activeMobileTab === "resolution" && (
                <div className="space-y-4">
                  <SegmentedControl
                    id="mobile_resolution"
                    label={t("resolution")}
                    columns={2}
                    value={resolution.id}
                    onChange={(id) =>
                      setResolution(RESOLUTIONS.find((r) => r.id === id) ?? RESOLUTIONS[0])
                    }
                    options={RESOLUTIONS.map((r) => {
                      const icons: Record<string, ReactNode> = {
                        desktop4k: <Monitor size={15} />,
                        iphone: <Smartphone size={15} />,
                        fhd_plus: <Smartphone size={15} />,
                        one_five_k: <Smartphone size={15} />,
                        qhd_plus: <Smartphone size={15} />,
                        mobile_4k: <Smartphone size={15} />,
                        ipad: <Tablet size={15} />,
                        macbook: <Laptop size={15} />,
                      };
                      return { value: r.id, label: r.label, icon: icons[r.id] ?? <Smartphone size={15} /> };
                    })}
                  />
                  {resolution.deviceRef && (
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
                      <p className="text-dim font-medium">
                        <span className="text-mist font-semibold">{resolution.label}</span> ({resolution.width}×{resolution.height}px)
                      </p>
                      <p className="mt-1 text-[11px] text-mist/90">
                        📱 {t("deviceReference")}: <span className="text-lumen font-medium">{resolution.deviceRef}</span>
                      </p>
                      {resolution.ppi && (
                        <p className="mt-0.5 text-[10px] text-faint">
                          ⚡ {t("sharpnessPanel")}: {resolution.ppi} · {resolution.panelTech}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AdInterstitial open={showAd} onDismiss={dismissAd} />
    </div>
  );
}
