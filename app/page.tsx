"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WallpaperStudio from "@/components/WallpaperStudio";
import AdSlot from "@/components/AdSlot";
import AffiliateSection from "@/components/AffiliateSection";
import PremiumCard from "@/components/PremiumCard";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();

  return (
    <main className="grain relative mx-auto min-h-screen max-w-6xl px-5 pt-8 pb-24 sm:px-8 lg:px-10 lg:pb-8">
      <Header />

      <section className="mt-12 mb-10 max-w-2xl">
        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          {t("heroTitle")}
          <em className="font-display text-lumen font-normal">{t("heroTitleEm")}</em>
          {t("heroTitleEnd")}
        </h1>
        <p className="mt-4 text-dim">
          {t("heroSubtitle")}
        </p>
      </section>

      <WallpaperStudio />

      <AdSlot className="mt-10" />

      <div id="pro" className="mt-10 grid gap-6 md:grid-cols-2">
        <AffiliateSection />
        <PremiumCard />
      </div>

      <Footer />
    </main>
  );
}
