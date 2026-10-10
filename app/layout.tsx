import type {Metadata,Viewport} from "next";
import {Instrument_Serif,Manrope} from "next/font/google";
import "./globals.css";
import "./devices.css";
import "./lightfold-motion.css";
import {SITE_URL} from "@/lib/site";
import {LanguageProvider} from "@/lib/i18n";
const editorial=Instrument_Serif({subsets:["latin"],weight:"400",variable:"--font-editorial"});
const interfaceFont=Manrope({subsets:["latin"],variable:"--font-interface"});
const description="Create minimalist wallpapers in your browser. Explore generative art, choose a palette, and download a PNG. Free, no account required.";
export const metadata:Metadata={metadataBase:new URL(SITE_URL),title:{default:"LuminaWall — Wallpaper Studio",template:"%s — LuminaWall"},description,manifest:"/manifest.json",icons:{icon:[{url:"/favicon.ico",sizes:"32x32"},{url:"/logo.svg",type:"image/svg+xml"}],apple:"/apple-touch-icon.png"},openGraph:{title:"LuminaWall — Wallpaper Studio",description,siteName:"LuminaWall",type:"website",images:[{url:"/opengraph.jpg",width:1200,height:630,alt:"LuminaWall generative wallpaper collection"}]},twitter:{card:"summary_large_image",images:["/opengraph.jpg"]}};
export const viewport:Viewport={themeColor:"#f5f5f7"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="id"><body className={editorial.variable+" "+interfaceFont.variable+" antialiased"}><LanguageProvider>{children}</LanguageProvider></body></html>;}
