import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-8 pb-4 text-center">
      <p className="flex items-center gap-2 text-xs text-faint">
        <ShieldCheck size={14} className="text-lumen-a" />
        100% client-side — every wallpaper is rendered on your device. Nothing
        is uploaded, ever.
      </p>
      <p className="text-xs text-faint">
        © {new Date().getFullYear()} LuminaWall · Free minimalist wallpapers
      </p>
    </footer>
  );
}
