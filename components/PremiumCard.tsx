"use client";

import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function PremiumCard() {
  const { lang, t } = useLanguage();

  const proFeatures = lang === "id" ? [
    "Ekspor 8K & resolusi kustom",
    "Palet warna tak terbatas",
    "Ekspor batch (10 sekaligus)",
    "Bebas iklan sepenuhnya",
  ] : [
    "8K & custom resolutions",
    "Custom color palettes",
    "Batch export (10 at once)",
    "Ad-free experience",
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl p-px">
      {/* Gradient border */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(125,211,252,0.5),rgba(196,181,253,0.5),transparent_70%)]"
      />
      <div className="relative rounded-[calc(1.5rem-1px)] bg-carbon p-6">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-lumen-b" />
          <h2 className="text-lg font-semibold">
            LuminaWall <span className="text-lumen">Pro</span>
          </h2>
        </div>
        <ul className="mt-4 space-y-2.5">
          {proFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-dim">
              <Check size={15} className="shrink-0 text-lumen-a" />
              {f}
            </li>
          ))}
        </ul>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert(lang === "id" ? "Pro akan segera hadir — terima kasih atas minat Anda!" : "Pro is coming soon — thanks for your interest!")}
          className="mt-5 w-full rounded-2xl bg-[linear-gradient(120deg,#7dd3fc,#c4b5fd)] px-5 py-3 text-sm font-semibold text-abyss"
        >
          {lang === "id" ? "Gabung Daftar Tunggu" : "Join the waitlist"}
        </motion.button>
        <p className="mt-2.5 text-center text-[11px] text-faint">
          {lang === "id" ? "Gratis selamanya untuk resolusi standar." : "Free forever for standard resolutions."}
        </p>
      </div>
    </div>
  );
}
