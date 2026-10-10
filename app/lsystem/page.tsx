import type { Metadata } from "next";
import LSystemLab from "@/components/LSystemLab";

export const metadata: Metadata = {
  title: "L-System Lab",
  alternates: { canonical: "/lsystem" },
  description:
    "Interactive Lindenmayer-system wallpaper generator: fractal plants and curves drawn with turtle graphics, fully client-side.",
};

export default function LSystemPage() {
  return <LSystemLab />;
}
