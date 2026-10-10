import { supportedSize } from "@/lib/canvas";
import { renderArtwork } from "@/lib/render-artwork";
import type { RenderRequest, RenderResponse } from "@/lib/render-types";

const scope = globalThis as unknown as {
  onmessage: (event: MessageEvent<RenderRequest>) => void;
  postMessage: (response: RenderResponse, transfer?: Transferable[]) => void;
};

scope.onmessage = async ({ data }) => {
  try {
    const size = supportedSize(data.width, data.height);
    const canvas = new OffscreenCanvas(size.width, size.height);
    const details = await renderArtwork(canvas, data.task, data.width, data.height);
    if (data.output === "png") {
      const blob = await canvas.convertToBlob({ type: "image/png" });
      if (!blob.size) throw new Error("PNG export failed");
      scope.postMessage({ ok: true, result: { kind: "png", blob, ...details } });
    } else {
      const bitmap = canvas.transferToImageBitmap();
      scope.postMessage({ ok: true, result: { kind: "preview", bitmap, ...details } }, [bitmap]);
    }
  } catch (error) {
    scope.postMessage({ ok: false, error: error instanceof Error ? error.message : "Rendering failed" });
  }
};
