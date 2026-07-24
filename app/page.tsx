import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WallpaperStudio from "@/components/WallpaperStudio";
import AdSlot from "@/components/AdSlot";
import AffiliateSection from "@/components/AffiliateSection";
import PremiumCard from "@/components/PremiumCard";

export default function Home() {
  return (
    <main className="grain relative mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
      <Header />

      <section className="mt-12 mb-10 max-w-2xl">
        <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          Wallpapers that feel{" "}
          <em className="font-display text-lumen font-normal">designed</em>,
          not generated.
        </h1>
        <p className="mt-4 text-dim">
          Procedural minimalist backgrounds for Desktop 4K and iPhone —
          rendered instantly in your browser. Pick a palette, generate until
          it feels right, download in full resolution.
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
