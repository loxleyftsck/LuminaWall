"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  /** Unique per instance — scopes the animated selection pill. */
  id: string;
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}

/**
 * Reusable segmented control with a spring-animated selection pill
 * (shared-layout animation via Framer Motion).
 */
export default function SegmentedControl<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  columns = 2,
}: SegmentedControlProps<T>) {
  const reduceMotion = useReducedMotion();
  const cols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" }[columns];

  return (
    <fieldset>
      <legend className="mb-2.5 text-[11px] font-semibold tracking-[0.18em] text-faint uppercase">
        {label}
      </legend>
      <div role="radiogroup" aria-label={label} className={`grid ${cols} gap-1.5`}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm transition-colors ${
                selected ? "text-mist" : "text-dim hover:text-mist"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={`segment-pill-${id}`}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 450, damping: 34 }
                  }
                  className="glass absolute inset-0 rounded-xl"
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
