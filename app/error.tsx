"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console or telemetry service in production
    console.error("LuminaWall Runtime Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-abyss px-6 text-center text-mist">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/30 border border-red-500/20 text-red-400">
        <AlertCircle size={32} />
      </div>
      
      <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">
        Something went wrong
      </h2>
      
      <p className="mt-2 max-w-sm text-sm text-dim">
        An error occurred while rendering the wallpaper. This could be due to memory limits on high resolutions.
      </p>

      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-mist px-5 py-3 font-semibold text-abyss hover:opacity-90 transition-opacity"
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </div>
  );
}
