import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luminawall.vercel.app"),
  title: "LuminaWall — Minimalist Wallpaper Studio",
  description:
    "Generate premium minimalist wallpapers in your browser. 100% client-side, free, no sign-up. Desktop 4K and iPhone resolutions.",
  keywords: ["wallpaper generator", "minimalist wallpaper", "4k wallpaper", "iphone wallpaper"],
  verification: {
    google: "8YtQ3I_rI0NQCkINAYVURsAwFt3SyHm-TBJKyb2eZbo",
  },
  openGraph: {
    title: "LuminaWall — Minimalist Wallpaper Studio",
    description:
      "Generate premium minimalist wallpapers in your browser. 100% client-side, free, no sign-up. Desktop 4K and iPhone resolutions.",
    url: "https://luminawall.vercel.app",
    siteName: "LuminaWall",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminaWall — Minimalist Wallpaper Studio",
    description:
      "Generate premium minimalist wallpapers in your browser. 100% client-side, free, no sign-up. Desktop 4K and iPhone resolutions.",
  },
};

export const viewport: Viewport = {
  themeColor: "#07090d",
};

import { LanguageProvider } from "@/lib/i18n";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${manrope.variable} font-body antialiased`}
      >
        <LanguageProvider>
          {/* Fixed aurora ambiance behind all content */}
          <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="animate-drift absolute -top-1/4 -left-1/4 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.10),transparent_60%)]" />
            <div className="animate-drift-slow absolute -right-1/4 -bottom-1/4 h-[70vmax] w-[70vmax] rounded-full bg-[radial-gradient(circle,rgba(196,181,253,0.10),transparent_60%)]" />
          </div>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
