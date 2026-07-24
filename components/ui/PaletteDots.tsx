"use client";

import { PALETTES, type Palette } from "@/lib/wallpaper";

interface PaletteDotsProps {
  /** null = monochrome (no palette). */
  value: Palette | null;
  onChange: (palette: Palette | null) => void;
}

/**
 * Compact palette picker for the lab panels: a row of swatch dots
 * plus a "mono" option, sized to fit a floating control rail.
 */
export default function PaletteDots({ value, onChange }: PaletteDotsProps) {
  return (
    <div>
      <span className="mb-1.5 block text-xs text-dim">Palette</span>
      <div role="radiogroup" aria-label="Palette" className="flex flex-wrap gap-1.5">
        <button
          role="radio"
          aria-checked={value === null}
          aria-label="Monochrome"
          title="Monochrome"
          onClick={() => onChange(null)}
          className={`h-7 w-7 rounded-full border bg-[linear-gradient(135deg,#fff_50%,#0b0e14_50%)] transition-transform hover:scale-110 ${
            value === null ? "border-white ring-2 ring-white/40" : "border-white/20"
          }`}
        />
        {PALETTES.map((p) => (
          <button
            key={p.id}
            role="radio"
            aria-checked={value?.id === p.id}
            aria-label={p.name}
            title={p.name}
            onClick={() => onChange(p)}
            className={`h-7 w-7 rounded-full border transition-transform hover:scale-110 ${
              value?.id === p.id
                ? "border-white ring-2 ring-white/40"
                : "border-white/20"
            }`}
            style={{
              background: `conic-gradient(${p.colors[0]} 0 25%, ${p.colors[1]} 0 50%, ${p.colors[2]} 0 75%, ${p.colors[3]} 0)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
