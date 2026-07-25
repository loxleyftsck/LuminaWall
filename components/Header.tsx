"use client";

import { motion } from "framer-motion";
import { Aperture, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-wrap items-center justify-between gap-4"
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
          {t("attractor")}
        </a>
        <a
          href="/lsystem"
          className="glass rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-mist"
        >
          {t("lsystem")}
        </a>
        <a
          href="#pro"
          className="glass rounded-full px-4 py-2 text-sm font-medium text-dim transition-colors hover:text-mist"
        >
          {t("goPro")}
        </a>

        {/* Language Switcher Toggle */}
        <div className="glass ml-2 flex items-center rounded-full p-1 border border-white/10">
          <Globe size={14} className="ml-2.5 mr-1 text-dim" />
          <button
            onClick={() => setLang("id")}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
              lang === "id"
                ? "bg-white/20 text-mist shadow-sm"
                : "text-dim hover:text-mist"
            }`}
          >
            🇮🇩 ID
          </button>
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
              lang === "en"
                ? "bg-white/20 text-mist shadow-sm"
                : "text-dim hover:text-mist"
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
