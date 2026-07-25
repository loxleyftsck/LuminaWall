"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "en" | "id";

export const DICTIONARY = {
  en: {
    heroTitle: "Wallpapers that feel ",
    heroTitleEm: "designed",
    heroTitleEnd: ", not generated.",
    heroSubtitle:
      "Procedural minimalist backgrounds for Desktop 4K, iPhone, and Android — rendered instantly in your browser. Pick a palette, generate until it feels right, download in full resolution.",
    generate: "Generate",
    download: "Download PNG",
    style: "Style",
    palette: "Palette",
    tone: "Tone",
    toneLight: "Light",
    toneDark: "Dark",
    resolution: "Resolution",
    deviceReference: "Device Ref",
    sharpnessPanel: "Sharpness & Panel",
    journalRef: "Math/Physics Journal",
    goPro: "Go Pro",
    attractor: "Attractor",
    lsystem: "L-System",
    affiliateTitle: "Desk Setup Recommendations",
    affiliateDesc:
      "Curated minimal accessories to complement your clean workspace.",
    premiumTitle: "LuminaWall Pro",
    premiumDesc:
      "Unlock 8K export, vector SVG output, batch generation, and exclusive palette collections.",
    footerText: "Zero server cost. Rendered 100% locally in your browser.",
    langName: "English",
  },
  id: {
    heroTitle: "Wallpaper yang terasa ",
    heroTitleEm: "didesain",
    heroTitleEnd: ", bukan sekadar acak.",
    heroSubtitle:
      "Latar belakang minimalis prosedural untuk Desktop 4K, iPhone, dan Android — dirender secara instan di browser Anda. Pilih palet warna, buat hingga pas, dan unduh resolusi penuh.",
    generate: "Buat Wallpaper",
    download: "Unduh PNG",
    style: "Gaya Visual",
    palette: "Palet Warna",
    tone: "Nuansa",
    toneLight: "Terang",
    toneDark: "Gelap",
    resolution: "Resolusi Layar",
    deviceReference: "Referensi HP",
    sharpnessPanel: "Ketajaman & Panel",
    journalRef: "Jurnal Matematika/Fisika",
    goPro: "Versi Pro",
    attractor: "Attractor",
    lsystem: "L-System",
    affiliateTitle: "Rekomendasi Desk Setup",
    affiliateDesc:
      "Aksesori kurasi khusus untuk menyempurnakan meja kerja minimalis Anda.",
    premiumTitle: "LuminaWall Pro",
    premiumDesc:
      "Buka ekspor 8K, format vektor SVG, pembuat batch, dan koleksi palet warna eksklusif.",
    footerText: "Bebas biaya server. Dirender 100% lokal di browser Anda.",
    langName: "Bahasa Indonesia",
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY["en"];

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => {},
  t: (key) => DICTIONARY.id[key] || key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("id");

  useEffect(() => {
    const saved = localStorage.getItem("luminawall_lang") as Language | null;
    if (saved === "en" || saved === "id") {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("luminawall_lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return DICTIONARY[lang][key] || DICTIONARY.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
