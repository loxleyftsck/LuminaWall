import type { Metadata } from "next";
import AttractorLab from "@/components/AttractorLab";

export const metadata: Metadata = {
  title: "Attractor Lab — LuminaWall",
  description:
    "Strange-attractor wallpaper generator: millions of density-mapped particles, computed client-side in WebAssembly.",
};

export default function AttractorPage() {
  return <AttractorLab />;
}
