import LogoMark from "./LogoMark";
interface LoadingIndicatorProps {label?:string;variant?:"brand"|"ring";size?:number;className?:string}
/** Mount only during pending work. Real job state supplies the label; no simulated percentage. */
export default function LoadingIndicator({label="Membuat wallpaper…",variant="brand",size=40,className=""}:LoadingIndicatorProps){
 return <span role="status" aria-live="polite" className={`lightfold-status ${className}`}>
  {variant==="brand"?<LogoMark size={size} animated={false} className="lightfold-loading"/>:<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className="lightfold-ring" fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"/></svg>}
  {label&&<span>{label}</span>}
 </span>;
}
