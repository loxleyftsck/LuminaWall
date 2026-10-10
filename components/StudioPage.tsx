"use client";
import Header from "@/components/Header";
import WallpaperStudio from "@/components/WallpaperStudio";
import {useLanguage} from "@/lib/i18n";
export default function StudioPage(){const {t}=useLanguage();return <div className="site-shell studio-page"><Header/><main id="main-content"><div className="studio-intro"><h1>{t("studioTitle")}</h1><p>{t("studioSubtitle")}</p></div><WallpaperStudio/></main></div>;}
