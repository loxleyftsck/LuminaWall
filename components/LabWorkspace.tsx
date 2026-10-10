"use client";
import {useEffect,useState,type ReactNode} from "react";
import Link from "next/link";
import {ArrowLeft,Download,SlidersHorizontal,X} from "lucide-react";
import LoadingIndicator from "@/components/LoadingIndicator";
import {useLanguage} from "@/lib/i18n";
import {RESOLUTIONS,type Resolution} from "@/lib/wallpaper";
import type {useArtwork} from "@/lib/use-artwork";
interface Props{title:string;description:string;artwork:ReturnType<typeof useArtwork>;resolution:Resolution;onResolution:(value:Resolution)=>void;onDownload:()=>void;children:ReactNode}
export default function LabWorkspace({title,description,artwork,resolution,onResolution,onDownload,children}:Props){
const {t}=useLanguage();const [open,setOpen]=useState(true);
useEffect(()=>{if(window.matchMedia("(max-width: 700px)").matches)setOpen(false);},[]);
const downloadButton=<button type="button" className="button-primary" disabled={!artwork.ready||artwork.exporting} onClick={onDownload}>{artwork.exporting?<LoadingIndicator variant="ring" size={17} label=""/>:<Download size={17}/>} {t("download")}</button>;
return <main id="main-content" className="lab-page"><canvas ref={artwork.canvasRef} role="img" aria-label={title} className="lab-canvas"/><Link className="lab-back" href="/studio"><ArrowLeft size={17}/> Studio</Link><aside className="lab-panel" hidden={!open} aria-label={t("settings")}><div className="lab-panel-heading"><div><h1>{title}</h1><p>{description}</p></div><button type="button" aria-label={t("close")} onClick={()=>setOpen(false)}><X size={22}/></button></div><fieldset disabled={artwork.exporting} className="lab-scroll">{children}<label className="select-control"><span>{t("resolution")}</span><select value={resolution.id} onChange={event=>onResolution(RESOLUTIONS.find(item=>item.id===event.target.value)??RESOLUTIONS[0])}>{RESOLUTIONS.map(item=><option key={item.id} value={item.id}>{item.label} — {item.width} × {item.height}</option>)}</select></label></fieldset><div className="lab-panel-actions">{downloadButton}</div></aside>{!open&&<div className="lab-floating-actions"><button type="button" className="button-secondary" onClick={()=>setOpen(true)}><SlidersHorizontal size={18}/>{t("settings")}</button>{downloadButton}</div>}<div className="lab-feedback" aria-live="polite">{artwork.busy&&<p><LoadingIndicator variant="ring" size={16} label=""/>{t("generating")}</p>}{artwork.exporting&&<p>{t("exporting")}<button type="button" onClick={artwork.cancelExport}>{t("cancel")}</button></p>}{artwork.error&&<p role="alert">{artwork.error}</p>}{artwork.notice&&<p>{artwork.notice}</p>}</div></main>;
}
