"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
export type Language = "en" | "id";
const en = {
generate:"New variation",download:"Download PNG",style:"Style",palette:"Palette",tone:"Appearance",toneLight:"Light",toneDark:"Dark",resolution:"Export size",deviceReference:"Device reference",sharpnessPanel:"Display details",journalRef:"Research reference",goPro:"Pro",attractor:"Attractor",lsystem:"L-System",langName:"English",affiliateTitle:"Desk setup recommendations",affiliateDesc:"Accessories for your workspace.",premiumTitle:"LuminaWall Pro",premiumDesc:"More ways to create, coming later.",footerText:"Made in your browser. Your images stay on your device.",studio:"Open studio",home:"Home",settings:"Settings",done:"Done",close:"Close",cancel:"Cancel",generating:"Creating preview…",exporting:"Preparing your PNG…",studioTitle:"Make room for a little wonder.",studioSubtitle:"Pick a style, find your colours, and make it yours.",preview:"Preview",exportSize:"PNG size",allStyles:"All styles",fewerStyles:"Fewer styles",artwork:"Wallpaper preview",learn:"How it works",start:"Create your wallpaper",explore:"Explore the collection",free:"Free, with no sign-up",more:"Explore the labs",copyReady:"Your PNG is ready. Download started."
};
const id: Record<keyof typeof en,string> = {
generate:"Variasi baru",download:"Unduh PNG",style:"Gaya",palette:"Palet",tone:"Nuansa",toneLight:"Terang",toneDark:"Gelap",resolution:"Ukuran ekspor",deviceReference:"Referensi perangkat",sharpnessPanel:"Detail layar",journalRef:"Referensi riset",goPro:"Pro",attractor:"Attractor",lsystem:"L-System",langName:"Bahasa Indonesia",affiliateTitle:"Rekomendasi desk setup",affiliateDesc:"Aksesori untuk ruang kerja Anda.",premiumTitle:"LuminaWall Pro",premiumDesc:"Lebih banyak cara berkreasi, segera hadir.",footerText:"Dibuat di browser. Gambar tetap di perangkat Anda.",studio:"Buka studio",home:"Beranda",settings:"Pengaturan",done:"Selesai",close:"Tutup",cancel:"Batalkan",generating:"Membuat preview…",exporting:"Menyiapkan PNG…",studioTitle:"Beri ruang untuk sesuatu yang indah.",studioSubtitle:"Pilih gaya, temukan warna, lalu jadikan milikmu.",preview:"Preview",exportSize:"Ukuran PNG",allStyles:"Semua gaya",fewerStyles:"Ringkas gaya",artwork:"Preview wallpaper",learn:"Cara kerjanya",start:"Buat wallpaper kamu",explore:"Jelajahi koleksi",free:"Gratis, tanpa daftar akun",more:"Jelajahi lab",copyReady:"PNG siap. Unduhan dimulai."
};
export const DICTIONARY = {en,id};
export type TranslationKey = keyof typeof en;
interface LanguageContextType {lang:Language;setLang:(lang:Language)=>void;t:(key:TranslationKey)=>string}
const LanguageContext=createContext<LanguageContextType|null>(null);
export function LanguageProvider({children}:{children:ReactNode}) {
const [lang,setLangState]=useState<Language>("id");
useEffect(()=>{try{const saved=localStorage.getItem("luminawall_lang");if(saved==="en"||saved==="id")setLangState(saved);}catch{/* Optional preference storage. */}},[]);
useEffect(()=>{document.documentElement.lang=lang;},[lang]);
const setLang=(value:Language)=>{setLangState(value);try{localStorage.setItem("luminawall_lang",value);}catch{/* Language remains available without storage. */}};
return <LanguageContext.Provider value={{lang,setLang,t:(key)=>DICTIONARY[lang][key]}}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const context=useContext(LanguageContext);if(!context)throw new Error("LanguageProvider is missing");return context;}
