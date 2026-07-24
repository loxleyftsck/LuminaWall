"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PALETTES, type Palette } from "@/lib/wallpaper";

interface PaletteSelectorProps {
  value: Palette;
  onChange: (palette: Palette) => void;
}

/** Palette picker with swatch dots and an animated selection ring. */
export default function PaletteSelector({ value, onChange }: PaletteSelectorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <fieldset>
      <legend className="mb-2.5 text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
        Palette
      </legend>
      <div role="radiogroup" aria-label="Palette" className="grid grid-cols-2 gap-1.5">
        {PALETTES.map((p) => {
          const selected = p.id === value.id;
          return (
            <button
              key={p.id}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(p)}
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors ${
                selected ? "text-mist" : "text-dim hover:text-mist"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="palette-pill"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 34 }
                  }
                  className="glass absolute inset-0 rounded-xl"
                />
              )}
              <span className="relative flex shrink-0 -space-x-1">
                {p.colors.map((c) => (
                  <span
                    key={c}
                    className="h-4 w-4 rounded-full ring-2 ring-abyss/60"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <span className="relative text-sm">{p.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
