import type { Metadata } from "next";
import AttractorLab from "@/components/AttractorLab";

export const metadata: Metadata = {
  title: "Attractor Lab",
  alternates: { canonical: "/attractor" },
  description:
    "Strange-attractor wallpaper generator: millions of density-mapped particles, computed locally in a background worker.",
};

export default function AttractorPage() {
  return <AttractorLab />;
}
