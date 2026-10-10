"use client";
import type {ReactNode} from "react";
export interface SegmentOption<T extends string>{value:T;label:string;icon?:ReactNode}
interface Props<T extends string>{id:string;label:string;options:SegmentOption<T>[];value:T;onChange:(value:T)=>void;columns?:2|3|4}
export default function SegmentedControl<T extends string>({id,label,options,value,onChange,columns=2}:Props<T>){
return <fieldset className="control-group"><legend>{label}</legend><div className="choice-grid" style={{gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`}}>{options.map(option=><label key={option.value} className="choice"><input type="radio" name={id} value={option.value} checked={value===option.value} onChange={()=>onChange(option.value)}/><span>{option.icon}{option.label}</span></label>)}</div></fieldset>;
}
