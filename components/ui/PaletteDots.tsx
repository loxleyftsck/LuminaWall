"use client";
import {useId} from "react";
import {PALETTES,type Palette} from "@/lib/wallpaper";
import {useLanguage} from "@/lib/i18n";
export default function PaletteDots({value,onChange}:{value:Palette|null;onChange:(value:Palette|null)=>void}){
const id=useId();const {t,lang}=useLanguage();const options=[{id:"mono",name:lang==="id"?"Monokrom":"Monochrome",colors:["#fff","#0b0e14"]},...PALETTES];
return <fieldset className="lab-palettes"><legend>{t("palette")}</legend><div>{options.map(palette=><label key={palette.id} title={palette.name}><input className="sr-only" type="radio" name={id} aria-label={palette.name} checked={(value?.id??"mono")===palette.id} onChange={()=>onChange(PALETTES.find(item=>item.id===palette.id)??null)}/><span aria-hidden="true" style={{background:`conic-gradient(${palette.colors.map((color,index)=>`${color} ${index/palette.colors.length*100}% ${(index+1)/palette.colors.length*100}%`).join(",")})`}}/></label>)}</div></fieldset>;
}
