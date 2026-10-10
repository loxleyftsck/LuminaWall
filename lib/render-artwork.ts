import { getEngine, renderDensity } from "@/lib/attractor";
import { supportedSize, type RenderCanvas } from "@/lib/canvas";
import { renderLSystem } from "@/lib/lsystem";
import type { ArtworkTask, RenderDetails } from "@/lib/render-types";
import { renderWallpaper } from "@/lib/wallpaper";

export async function renderArtwork(canvas: RenderCanvas, task: ArtworkTask, width: number, height: number): Promise<RenderDetails> {
  const size = supportedSize(width, height);
  if (task.kind === "wallpaper") {
    renderWallpaper(canvas, { ...task.options, resolution: { ...task.options.resolution, ...size } });
    return {};
  }
  if (task.kind === "lsystem") return renderLSystem(canvas, task.preset, task.options, size.width, size.height);
  const engine = await getEngine();
  const orbit = engine.compute(task.params);
  renderDensity(canvas, orbit, size.width, size.height, task.palette ?? undefined);
  return { engine: engine.kind };
}
