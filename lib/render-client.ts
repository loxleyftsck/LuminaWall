import { previewSize } from "@/lib/canvas";
import type { RenderRequest, RenderResponse, RenderResult } from "@/lib/render-types";

export { previewSize } from "@/lib/canvas";

/** A worker per job means abort stops computation, rather than only ignoring its result. */
export async function runRenderJob(request: RenderRequest, signal: AbortSignal): Promise<RenderResult> {
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
    if (request.output === "png") throw new Error("unsupported-browser");
    const { renderArtwork } = await import("@/lib/render-artwork");
    const canvas = document.createElement("canvas");
    const size = previewSize(request.width, request.height, 480);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    const details = await renderArtwork(canvas, request.task, size.width, size.height);
    return { kind: "preview", bitmap: await createImageBitmap(canvas), ...details };
  }
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/render.worker.ts", import.meta.url), { type: "module" });
    const cleanup = () => { clearTimeout(timeout); signal.removeEventListener("abort", abort); worker.terminate(); };
    const fail = (error: Error) => { cleanup(); reject(error); };
    const abort = () => fail(new DOMException("Cancelled", "AbortError"));
    const timeout = setTimeout(() => fail(new Error("render-timeout")), request.output === "png" ? 180_000 : 20_000);
    signal.addEventListener("abort", abort, { once: true });
    worker.onerror = () => fail(new Error("render-failed"));
    worker.onmessageerror = () => fail(new Error("render-failed"));
    worker.onmessage = ({ data }: MessageEvent<RenderResponse>) => {
      if (!data.ok) { fail(new Error(data.error)); return; }
      cleanup();
      resolve(data.result);
    };
    worker.postMessage(request);
    if (signal.aborted) abort();
  });
}
