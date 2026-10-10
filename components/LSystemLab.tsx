"use client";
import {useState} from "react";
import {PRESETS,type LSystemPreset} from "@/lib/lsystem";
import {RESOLUTIONS,type Palette} from "@/lib/wallpaper";
import {useArtwork} from "@/lib/use-artwork";
import {useLanguage} from "@/lib/i18n";
import PaletteDots from "@/components/ui/PaletteDots";
import LabWorkspace from "@/components/LabWorkspace";
export default function LSystemLab(){
const {lang}=useLanguage();const [preset,setPreset]=useState<LSystemPreset>(PRESETS[0]),[iterations,setIterations]=useState(PRESETS[0].defaultIterations),[angle,setAngle]=useState(PRESETS[0].angle),[lengthScale,setLengthScale]=useState(1),[palette,setPalette]=useState<Palette|null>(null),[resolution,setResolution]=useState(RESOLUTIONS[0]);
const artwork=useArtwork({kind:"lsystem",preset,options:{iterations,angle,lengthScale,palette:palette??undefined}},resolution);
return <LabWorkspace title="L-System Lab" description={lang==="id"?"Bentuk organik dari aturan yang sederhana.":"Organic forms from simple rules."} artwork={artwork} resolution={resolution} onResolution={setResolution} onDownload={()=>void artwork.exportImage(`luminawall-lsystem-${preset.id}-i${iterations}-a${angle}-${resolution.width}x${resolution.height}.png`)}><label className="select-control"><span>{lang==="id"?"Bentuk":"Form"}</span><select value={preset.id} onChange={event=>{const value=PRESETS.find(item=>item.id===event.target.value)??PRESETS[0];setPreset(value);setAngle(value.angle);setIterations(value.defaultIterations);}}>{PRESETS.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="range-control"><span>{lang==="id"?"Detail":"Detail"}<output>{iterations}</output></span><input type="range" min={1} max={preset.maxIterations} step={1} value={iterations} onChange={event=>setIterations(Number(event.target.value))}/></label><label className="range-control"><span>{lang==="id"?"Sudut":"Angle"}<output>{angle}°</output></span><input type="range" min={5} max={90} step={1} value={angle} onChange={event=>setAngle(Number(event.target.value))}/></label><label className="range-control"><span>{lang==="id"?"Perbesar":"Zoom"}<output>{lengthScale.toFixed(2)}×</output></span><input type="range" min={0.3} max={2} step={0.05} value={lengthScale} onChange={event=>setLengthScale(Number(event.target.value))}/></label><PaletteDots value={palette} onChange={setPalette}/><p className="control-hint">{(artwork.details.segments??0).toLocaleString(lang==="id"?"id-ID":"en-US")} {lang==="id"?"garis":"segments"}</p></LabWorkspace>;
}
