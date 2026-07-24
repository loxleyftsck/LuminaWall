"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface AdInterstitialProps {
  open: boolean;
  onDismiss: () => void;
}

const SKIP_DELAY_S = 3;

/**
 * Simulated interstitial ad overlay (monetization placeholder).
 * Mirrors real ad-network UX: a short countdown before the user
 * can continue. Swap the inner box for a real ad unit later.
 */
export default function AdInterstitial({ open, onDismiss }: AdInterstitialProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Advertisement"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-abyss/80 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass w-full max-w-sm rounded-3xl p-8 text-center"
          >
            <p className="text-[11px] tracking-[0.22em] text-faint uppercase">
              Advertisement
            </p>
            {/* Ad creative placeholder */}
            <div className="mt-5 flex h-40 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03]">
              <p className="font-display text-2xl text-dim italic">
                Interstitial ad unit
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-mist px-5 py-3 font-semibold text-abyss transition-opacity hover:opacity-90"
            >
              Continue to wallpaper
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
