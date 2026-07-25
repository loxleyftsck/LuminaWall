"use client";

import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-8 pb-4 text-center">
      <p className="flex items-center gap-2 text-xs text-faint">
        <ShieldCheck size={14} className="text-lumen-a" />
        {t("footerText")}
      </p>
      <p className="text-xs text-faint">
        © {new Date().getFullYear()} LuminaWall · Minimalist Wallpaper Studio
      </p>
    </footer>
  );
}
