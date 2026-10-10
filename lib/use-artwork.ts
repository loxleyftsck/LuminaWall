"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { downloadBlob } from "@/lib/download";
import { previewSize, runRenderJob } from "@/lib/render-client";
import type { ArtworkTask, RenderDetails } from "@/lib/render-types";
import type { Resolution } from "@/lib/wallpaper";

export function useArtwork(task: ArtworkTask, resolution: Resolution) {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exportController = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const [busy, setBusy] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [details, setDetails] = useState<RenderDetails>({});
  const [version, setVersion] = useState(0);
  const [readyKey, setReadyKey] = useState("");
  const key = JSON.stringify(task);
  const size = previewSize(resolution.width, resolution.height);
  const requestKey = `${key}:${size.width}:${size.height}`;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; exportController.current?.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setBusy(true);
    setError("");
    setNotice("");
    const timer = setTimeout(() => {
      void runRenderJob({ task: JSON.parse(key) as ArtworkTask, ...size, output: "preview" }, controller.signal).then((result) => {
        if (result.kind !== "preview") return;
        try {
          if (controller.signal.aborted || !canvasRef.current) return;
          const canvas = canvasRef.current;
          canvas.width = result.bitmap.width;
          canvas.height = result.bitmap.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is unavailable");
          ctx.drawImage(result.bitmap, 0, 0);
          setDetails({ engine: result.engine, segments: result.segments });
          setVersion((value) => value + 1);
          setReadyKey(requestKey);
        } finally { result.bitmap.close(); }
      }).catch((reason) => {
        if (controller.signal.aborted) return;
        console.error("Preview failed", reason);
        setError(lang === "id" ? "Gambar gagal dibuat. Coba gaya lain atau muat ulang halaman." : "The preview could not be created. Try another style or reload the page.");
      }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    }, 90);
    return () => { clearTimeout(timer); controller.abort(); };
    // The serialized task is the job identity; objects are recreated by controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, size.width, size.height, requestKey, lang]);

  const exportImage = async (filename: string) => {
    if (exportController.current || busy || readyKey !== requestKey) return;
    const mobile = window.matchMedia("(pointer: coarse)").matches;
    if (mobile && resolution.width * resolution.height > 16_000_000) {
      setError(lang === "id" ? "Resolusi ini terlalu besar untuk perangkat mobile. Pilih 4K atau resolusi ponsel." : "This resolution is too large for a mobile device. Choose 4K or a phone resolution.");
      return;
    }
    const controller = new AbortController();
    exportController.current = controller;
    setExporting(true);
    setError("");
    setNotice("");
    try {
      const result = await runRenderJob({ task, width: resolution.width, height: resolution.height, output: "png" }, controller.signal);
      if (controller.signal.aborted || !mounted.current || result.kind !== "png") return;
      downloadBlob(result.blob, filename);
      setNotice(lang === "id" ? "PNG siap. Unduhan dimulai." : "Your PNG is ready. Download started.");
    } catch (reason) {
      if (!controller.signal.aborted && mounted.current) {
        console.error("Export failed", reason);
        setError(reason instanceof Error && reason.message === "unsupported-browser"
          ? (lang === "id" ? "Ekspor memerlukan browser terbaru yang mendukung pemrosesan gambar di latar belakang." : "Export requires an up-to-date browser with background image processing support.")
          : (lang === "id" ? "PNG gagal dibuat. Coba resolusi lebih kecil, lalu unduh kembali." : "The PNG could not be created. Try a smaller resolution and download again."));
      }
    } finally {
      exportController.current = null;
      if (mounted.current) setExporting(false);
    }
  };

  const cancelExport = () => exportController.current?.abort();
  return { canvasRef, busy, exporting, error, notice, details, version, exportImage, cancelExport, ready: readyKey === requestKey && !busy };
}
