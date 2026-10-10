"use client";
import {useId} from "react";
import {PALETTES,type Palette} from "@/lib/wallpaper";
import {useLanguage} from "@/lib/i18n";
export default function PaletteSelector({value,onChange}:{value:Palette;onChange:(palette:Palette)=>void}){
const id=useId();const {t}=useLanguage();
return <fieldset className="control-group"><legend>{t("palette")}</legend><div className="palette-grid">{PALETTES.map(palette=><label key={palette.id} className="palette-choice"><input type="radio" name={id} value={palette.id} checked={value.id===palette.id} onChange={()=>onChange(palette)}/><span><span className="palette-swatches" aria-hidden="true">{palette.colors.map(color=><i key={color} style={{background:color}}/>)}</span><span>{palette.name}</span></span></label>)}</div></fieldset>;
}
