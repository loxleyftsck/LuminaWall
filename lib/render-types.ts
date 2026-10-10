import type { AttractorParams, EngineKind } from "@/lib/attractor";
import type { LSystemPreset, RenderOptions as LSystemOptions } from "@/lib/lsystem";
import type { Palette, RenderOptions } from "@/lib/wallpaper";

export type ArtworkTask =
  | { kind: "wallpaper"; options: RenderOptions }
  | { kind: "attractor"; params: AttractorParams; palette: Palette | null }
  | { kind: "lsystem"; preset: LSystemPreset; options: LSystemOptions };

export interface RenderRequest {
  task: ArtworkTask;
  width: number;
  height: number;
  output: "preview" | "png";
}
export interface RenderDetails { segments?: number; engine?: EngineKind }
export type RenderResult = RenderDetails & (
  | { kind: "preview"; bitmap: ImageBitmap }
  | { kind: "png"; blob: Blob }
);
export type RenderResponse = { ok: true; result: RenderResult } | { ok: false; error: string };
