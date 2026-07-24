/**
 * AdSense banner placeholder. When going live, replace the inner
 * markup with the real <ins class="adsbygoogle"> snippet and load
 * the AdSense script in app/layout.tsx.
 */
export default function AdSlot({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="Advertisement"
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="XXXXXXXXXX"
      className={`flex h-24 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] ${className}`}
    >
      <p className="text-xs tracking-[0.2em] text-faint uppercase">
        Advertisement · AdSense 728 × 90
      </p>
    </aside>
  );
}
