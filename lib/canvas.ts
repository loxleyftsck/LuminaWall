/** Shared canvas primitives for the window and render workers. */
export type RenderCanvas = HTMLCanvasElement | OffscreenCanvas;
export type RenderContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function canvasSize(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    throw new Error("Invalid canvas dimensions");
  }
  return { width: Math.max(1, Math.floor(width)), height: Math.max(1, Math.floor(height)) };
}

export function createRenderCanvas(width: number, height: number): RenderCanvas {
  const size = canvasSize(width, height);
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(size.width, size.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  return canvas;
}

export function supportedSize(width:number,height:number){const size=canvasSize(width,height);if(size.width>16384||size.height>16384||size.width*size.height>45000000)throw new Error("Image exceeds the supported size");return size;}
export function previewSize(width:number,height:number,maxEdge=960){const size=canvasSize(width,height);if(!Number.isFinite(maxEdge)||maxEdge<1)throw new Error("Invalid preview size");const scale=Math.min(1,maxEdge/Math.max(size.width,size.height));return canvasSize(Math.max(1,size.width*scale),Math.max(1,size.height*scale));}
