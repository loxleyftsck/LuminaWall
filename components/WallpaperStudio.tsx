"use client";
import {useEffect,useRef,useState} from "react";
import {Download,Shuffle,SlidersHorizontal,X} from "lucide-react";
import {PALETTES,RESOLUTIONS,STYLES,type StyleId,type Tone} from "@/lib/wallpaper";
import {useArtwork} from "@/lib/use-artwork";
import LoadingIndicator from "@/components/LoadingIndicator";
import {useLanguage} from "@/lib/i18n";
import SegmentedControl from "@/components/ui/SegmentedControl";
import PaletteSelector from "@/components/PaletteSelector";
import DeviceFrame from "@/components/DeviceFrame";
import {DEVICES,getDevice,deviceResolutions,type DeviceId} from "@/lib/devices";
const CURATED:StyleId[]=["misty_pines","silent_dunes","lunar_arches","flow","iridescent_kiss","mandala"];
export default function WallpaperStudio(){
const {t,lang}=useLanguage();
const [style,setStyle]=useState<StyleId>("misty_pines"),[palette,setPalette]=useState(PALETTES[0]),[tone,setTone]=useState<Tone>("light"),[resolution,setResolution]=useState(RESOLUTIONS[0]),[seed,setSeed]=useState(37),[allStyles,setAllStyles]=useState(false);
const [device,setDevice]=useState<DeviceId>("monitor");
const [showClock,setShowClock]=useState(true),[landscape,setLandscape]=useState(false);
const exportResolution=landscape&&getDevice(device).kind==="tablet"?{...resolution,width:resolution.height,height:resolution.width}:resolution;
const artwork=useArtwork({kind:"wallpaper",options:{style,palette,tone,resolution:exportResolution,seed}},exportResolution);
const profile=getDevice(device);
const sizes=deviceResolutions(device);
const changeDevice=(value:DeviceId)=>{setDevice(value);setLandscape(false);const available=deviceResolutions(value);setResolution(available[0]);};
const devicePicker=<label className="select-control device-picker"><span>{lang==="id"?"Perangkat":"Device"}</span><select aria-label={lang==="id"?"Perangkat preview":"Preview device"} disabled={artwork.exporting} value={device} onChange={event=>changeDevice(event.target.value as DeviceId)}>{DEVICES.map(item=><option key={item.id} value={item.id}>{item.id==="canvas"?(lang==="id"?"Tanpa bingkai":"No frame"):item.label}</option>)}</select></label>;
const dialogRef=useRef<HTMLDialogElement>(null);
const devicePreviewRef=useRef<HTMLDivElement>(null);
const previousDeviceView=useRef(device+":"+landscape);
useEffect(()=>{
 const view=device+":"+landscape;
 if(previousDeviceView.current===view)return;
 previousDeviceView.current=view;
 const frame=devicePreviewRef.current?.querySelector<HTMLElement>(".device-frame");
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)");
 if(!frame||reducedMotion.matches)return;
 // Keep the canvas mounted so switching devices with the same export size preserves the artwork.
 const animation=frame.animate([
  {opacity:0,transform:"translateY(12px) scale(0.96)"},
  {opacity:1,transform:"translateY(0) scale(1)"}
 ],{duration:360,easing:"cubic-bezier(0.22, 1, 0.36, 1)"});
 const stopForReducedMotion=()=>{if(reducedMotion.matches)animation.cancel();};
 reducedMotion.addEventListener("change",stopForReducedMotion);
 return ()=>{animation.cancel();reducedMotion.removeEventListener("change",stopForReducedMotion);};
},[device,landscape]);
const styles=allStyles?STYLES:STYLES.filter(item=>CURATED.includes(item.id)||item.id===style);
useEffect(()=>{const query=new URLSearchParams(window.location.search);const selected=STYLES.find(item=>item.id===query.get("style"));if(selected)setStyle(selected.id);const selectedPalette=PALETTES.find(item=>item.id===query.get("palette"));if(selectedPalette)setPalette(selectedPalette);},[]);
const download=()=>void artwork.exportImage(`luminawall-${style}-${palette.id}-${seed}-${exportResolution.width}x${exportResolution.height}.png`);
const controls=(id:string)=><fieldset disabled={artwork.exporting} className="studio-controls">{id==="mobile"&&devicePicker}<SegmentedControl id={`${id}-style`} label={t("style")} columns={2} value={style} onChange={setStyle} options={styles.map(item=>({value:item.id,label:item.name}))}/><button type="button" className="text-button" onClick={()=>setAllStyles(value=>!value)}>{allStyles?t("fewerStyles"):t("allStyles")}</button><PaletteSelector value={palette} onChange={setPalette}/><SegmentedControl<Tone> id={`${id}-tone`} label={t("tone")} value={tone} onChange={setTone} options={[{value:"light",label:t("toneLight")},{value:"dark",label:t("toneDark")}]}/><label className="select-control"><span>{t("resolution")}</span><select value={resolution.id} onChange={event=>setResolution(RESOLUTIONS.find(item=>item.id===event.target.value)??RESOLUTIONS[0])}>{sizes.map(item=><option key={item.id} value={item.id}>{item.label} — {landscape&&profile.kind==="tablet"?item.height:item.width} × {landscape&&profile.kind==="tablet"?item.width:item.height}</option>)}</select></label><p className="control-hint">{lang==="id"?"Preview ringan. Bingkai hanya untuk preview. PNG diunduh tanpa perangkat. Bentuk perangkat tetap saat ukuran ekspor berubah.":"A lightweight preview. Device frames are for preview only. Your PNG contains only the wallpaper. Export size does not change the device shape."}</p></fieldset>;
return <div className="studio-workspace"><section className="artwork-stage" aria-label={t("preview")} aria-busy={artwork.busy}><div className="preview-topline"><span>{STYLES.find(item=>item.id===style)?.name}</span><span>{profile.label}</span></div><div className="device-stage-toolbar">{devicePicker}</div>{(profile.kind==="phone"||profile.kind==="tablet")&&<div className="device-display-options">{profile.kind==="phone"&&<label><input type="checkbox" checked={showClock} onChange={event=>setShowClock(event.target.checked)}/>{lang==="id"?"Tampilkan jam":"Show clock"}</label>}{profile.kind==="tablet"&&<label><span>{lang==="id"?"Orientasi":"Orientation"}</span><select aria-label={lang==="id"?"Orientasi tablet":"Tablet orientation"} value={landscape?"landscape":"portrait"} onChange={event=>setLandscape(event.target.value==="landscape")} disabled={artwork.exporting}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>}</div>}<div ref={devicePreviewRef} className="device-preview-viewport"><DeviceFrame device={device} width={exportResolution.width} height={exportResolution.height} showClock={showClock} landscape={landscape}><canvas ref={artwork.canvasRef} role="img" aria-label={t("artwork")}/>{artwork.busy&&<div className="preview-loading"><LoadingIndicator size={52} label={t("generating")}/></div>}</DeviceFrame></div><div className="preview-bottomline"><span>{palette.name}</span><span>{t("exportSize")}: {exportResolution.width} × {exportResolution.height}</span></div><div className="job-feedback" aria-live="polite">{artwork.error&&<p role="alert">{artwork.error}</p>}{artwork.notice&&<p>{artwork.notice}</p>}{artwork.exporting&&<p>{t("exporting")} <button type="button" onClick={artwork.cancelExport}>{t("cancel")}</button></p>}</div><p className="creator-credit">by Creator Herald Michain Samuel Theo Ginting</p></section><aside className="desktop-controls"><div className="controls-scroll">{controls("desktop")}</div><div className="studio-actions"><button type="button" className="button-secondary" disabled={artwork.exporting} onClick={()=>setSeed(value=>value+1)}><Shuffle size={17}/>{t("generate")}</button><button type="button" className="button-primary" disabled={!artwork.ready||artwork.exporting} onClick={download}>{artwork.exporting?<LoadingIndicator variant="ring" size={17} label=""/>:<Download size={17}/>} {t("download")}</button></div></aside><div className="mobile-actions"><button type="button" disabled={artwork.exporting} aria-label={t("generate")} onClick={()=>setSeed(value=>value+1)}><Shuffle size={20}/></button><button type="button" disabled={artwork.exporting} onClick={()=>dialogRef.current?.showModal()}><SlidersHorizontal size={18}/><span>{t("settings")}</span></button><button type="button" className="button-primary" disabled={!artwork.ready||artwork.exporting} onClick={download}>{artwork.exporting?<LoadingIndicator variant="ring" size={18} label=""/>:<Download size={18}/>}<span>{t("download")}</span></button></div><dialog ref={dialogRef} className="settings-dialog" aria-labelledby="settings-title"><div className="dialog-heading"><h2 id="settings-title">{t("settings")}</h2><button type="button" aria-label={t("close")} onClick={()=>dialogRef.current?.close()}><X size={22}/></button></div><div className="dialog-content">{controls("mobile")}</div><button type="button" className="button-primary dialog-done" onClick={()=>dialogRef.current?.close()}>{t("done")}</button></dialog></div>;
}
