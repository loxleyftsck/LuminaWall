"use client";

import { motion } from "framer-motion";
import { Aperture } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7dd3fc,#c4b5fd)] text-abyss">
          <Aperture size={20} />
        </span>
        <div>
          <p className="text-lg leading-tight font-bold tracking-tight">
            LuminaWall
          </p>
          <p className="text-[11px] tracking-[0.18em] text-faint uppercase">
            Wallpaper studio
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        <a
          href="/attractor"
          className="glass rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-mist"
        >
          Attractor
        </a>
        <a
          href="/lsystem"
          className="glass rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-mist"
        >
          L-System
        </a>
        <a
          href="#pro"
          className="glass rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-mist"
        >
          Go <span className="text-lumen font-semibold">Pro</span>
        </a>
      </nav>
    </motion.header>
  );
}
