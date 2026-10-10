"use client";
import Link from "next/link";
import {useLanguage} from "@/lib/i18n";
import Logo from "@/components/Logo";
export default function Footer(){const {t,lang}=useLanguage();return <footer className="site-footer"><div><Link href="/" className="brand footer-brand"><Logo className="brand-mark"/><span>LuminaWall</span></Link><p>{t("footerText")}</p></div><div className="footer-links"><Link href="/studio">{t("studio")}</Link><Link href="/attractor">Attractor</Link><Link href="/lsystem">L-System</Link><span>© {new Date().getFullYear()} Herald Ginting</span><span>{lang==="id"?"Dibuat untuk layarmu.":"Made for your screen."}</span></div></footer>;}
