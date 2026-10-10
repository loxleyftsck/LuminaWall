import type {CSSProperties} from "react";
interface LogoMarkProps {size?:number;className?:string;reverse?:boolean;animated?:boolean}
/** Decorative mark: the surrounding home link/wordmark supplies its accessible name. */
export default function LogoMark({size=36,className="",reverse=false,animated=true}:LogoMarkProps){
 return <svg width={size} height={size} viewBox="0 0 180 180" aria-hidden="true" focusable="false" className={`lightfold-mark ${animated?"lightfold-enter":""} ${className}`} style={{"--lightfold-base":reverse?"#f5f3ef":"#232228"} as CSSProperties}>
  <g transform="translate(23 0)"><path className="lightfold-leaf" d="M24 42 64 21V100L24 137Z" fill="#8d91c8"/><path className="lightfold-base" d="m24 137 40-29 46 25-40 24Z" fill="var(--lightfold-base)"/></g>
 </svg>;
}
