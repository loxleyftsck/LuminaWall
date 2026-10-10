"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useLanguage} from "@/lib/i18n";
import Logo from "@/components/Logo";
export default function Header(){
const {lang,setLang,t}=useLanguage();const pathname=usePathname();
return <header className="site-header"><Link href="/" className="brand" aria-label="LuminaWall home"><Logo className="brand-mark"/><span>LuminaWall</span></Link><nav aria-label={lang==="id"?"Navigasi utama":"Main navigation"} className="site-nav"><Link href="/attractor" className="nav-lab">{t("attractor")}</Link><Link href="/lsystem" className="nav-lab">{t("lsystem")}</Link><div className="language-switch" role="group" aria-label={lang==="id"?"Bahasa":"Language"}><button type="button" aria-pressed={lang==="id"} onClick={()=>setLang("id")}>ID</button><button type="button" aria-pressed={lang==="en"} onClick={()=>setLang("en")}>EN</button></div><Link href={pathname==="/studio"?"/":"/studio"} className="header-cta">{pathname==="/studio"?t("home"):t("studio")}</Link></nav></header>;
}
