"use client";
import {useState} from "react";
import {Shuffle} from "lucide-react";
import {type AttractorParams,type AttractorType,isChaotic} from "@/lib/attractor";
import {RESOLUTIONS,type Palette} from "@/lib/wallpaper";
import {useArtwork} from "@/lib/use-artwork";
import {useLanguage} from "@/lib/i18n";
import PaletteDots from "@/components/ui/PaletteDots";
import SegmentedControl from "@/components/ui/SegmentedControl";
import LabWorkspace from "@/components/LabWorkspace";
const DEFAULTS:AttractorParams={type:"dejong",a:-2.24,b:0.43,c:-0.65,d:-2.43,iterations:1000000};
const KEYS=["a","b","c","d"] as const;
export default function AttractorLab(){
const {lang,t}=useLanguage();const [params,setParams]=useState(DEFAULTS),[palette,setPalette]=useState<Palette|null>(null),[resolution,setResolution]=useState(RESOLUTIONS[0]);
const artwork=useArtwork({kind:"attractor",params,palette},resolution);
const randomize=()=>{for(let attempt=0;attempt<50;attempt++){const values=Object.fromEntries(KEYS.map(key=>[key,Math.round((Math.random()*6-3)*100)/100])) as Record<typeof KEYS[number],number>;if(isChaotic(params.type,values.a,values.b,values.c,values.d)){setParams({...params,...values});return;}}setParams({...params,...DEFAULTS,type:"dejong"});};
return <LabWorkspace title="Attractor Lab" description={lang==="id"?"Pola cahaya dari gerak yang tak terduga.":"Light patterns from unpredictable motion."} artwork={artwork} resolution={resolution} onResolution={setResolution} onDownload={()=>void artwork.exportImage(`luminawall-${params.type}-${params.a}_${params.b}_${params.c}_${params.d}-${resolution.width}x${resolution.height}.png`)}><SegmentedControl<AttractorType> id="attractor-type" label={lang==="id"?"Jenis pola":"Pattern"} value={params.type} onChange={type=>setParams({...params,type})} options={[{value:"dejong",label:"de Jong"},{value:"clifford",label:"Clifford"}]}/>{KEYS.map(key=><label className="range-control" key={key}><span>{key}<output>{params[key].toFixed(2)}</output></span><input type="range" min={-3} max={3} step={0.01} value={params[key]} onChange={event=>setParams({...params,[key]:Number(event.target.value)})} aria-label={`Parameter ${key}`}/></label>)}<label className="range-control"><span>{lang==="id"?"Jumlah titik":"Points"}<output>{(params.iterations/1000000).toFixed(1)}M</output></span><input type="range" min={200000} max={4000000} step={200000} value={params.iterations} onChange={event=>setParams({...params,iterations:Number(event.target.value)})}/></label><PaletteDots value={palette} onChange={setPalette}/><button type="button" className="button-secondary" onClick={randomize}><Shuffle size={16}/>{t("generate")}</button></LabWorkspace>;
}
