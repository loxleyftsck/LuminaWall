import type { ReactNode } from "react";
import { ExternalLink, Keyboard, Lamp, Monitor } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface AffiliateItem {
  name: string;
  blurb: string;
  icon: ReactNode;
  /** Replace with real affiliate URLs when partnerships land. */
  href: string;
}

const ITEMS: AffiliateItem[] = [
  {
    name: "4K Studio Monitor",
    blurb: "Where these wallpapers belong.",
    icon: <Monitor size={18} />,
    href: "#",
  },
  {
    name: "Ambient Desk Lamp",
    blurb: "Soft light, zero glare.",
    icon: <Lamp size={18} />,
    href: "#",
  },
  {
    name: "Minimal Keyboard",
    blurb: "Quiet keys for a quiet desk.",
    icon: <Keyboard size={18} />,
    href: "#",
  },
];

/** Affiliate recommendations placeholder (monetization-ready). */
export default function AffiliateSection() {
  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-xl italic">Desk Setup Recommendations</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-dim">
        Gear that pairs with your new wallpaper. Curated picks — affiliate
        links coming soon.
      </p>
      <ul className="mt-4 space-y-2">
        {ITEMS.map((item) => (
          <li key={item.name}>
            <a
              href={item.href}
              rel="sponsored noopener"
              className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
            >
              <span className="text-lumen-a">{item.icon}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium">{item.name}</span>
                <span className="block text-xs text-faint">{item.blurb}</span>
              </span>
              <ExternalLink
                size={14}
                className="text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-dim"
              />
            </a>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
