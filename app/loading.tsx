import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-abyss text-mist">
      <Loader2 size={32} className="animate-spin text-lumen-a" />
      <p className="mt-4 text-xs tracking-[0.2em] text-faint uppercase">
        Loading LuminaWall...
      </p>
    </div>
  );
}
