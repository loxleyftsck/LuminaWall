import {useId,type CSSProperties,type ReactNode} from "react";
import {getDevice,type DeviceId} from "@/lib/devices";
interface Props {device:DeviceId;width:number;height:number;children:ReactNode;showClock?:boolean;landscape?:boolean;className?:string}
/** SVG chrome and screen share fixed coordinates; only the artwork canvas is exported. */
export default function DeviceFrame({device,width,height,children,showClock=true,landscape=false,className=""}:Props){
 const profile=getDevice(device),raw=profile.kind==="canvas",g=raw?{width,height,radius:0,screen:{x:0,y:0,width,height,radius:0}}:profile.geometry;
 const s=g.screen,isTablet=profile.kind==="tablet",rotate=landscape&&isTablet;
 const frameWidth=rotate?g.height:g.width,frameHeight=rotate?g.width:g.height;
 const screen=rotate?{...s,x:s.y,y:g.width-s.x-s.width,width:s.height,height:s.width}:s;
 const id=useId().replace(/:/g,""),metal=id+"-metal",deck=id+"-deck";
 const svgProps={viewBox:`0 0 ${frameWidth} ${frameHeight}`,className:"device-vector","aria-hidden":true as const};
 const transform=rotate?`translate(0 ${g.width}) rotate(-90)`:undefined;
 const camera=<>{profile.kind==="phone"&&<>
  {profile.camera==="island"&&<><rect x="145" y={s.y+13} width="110" height="29" rx="15" fill="#09090b"/><circle cx="237" cy={s.y+27.5} r="5" fill="#17212d"/><circle cx="237" cy={s.y+27.5} r="2" fill="#314354"/></>}
  {profile.camera==="notch"&&<><path d={`M 108 ${s.y-2} H 292 V ${s.y+22} Q 292 ${s.y+38} 276 ${s.y+38} H 124 Q 108 ${s.y+38} 108 ${s.y+22} Z`} fill="#101113"/><rect x="177" y={s.y+8} width="46" height="4" rx="2" fill="#343439"/><circle cx="254" cy={s.y+18} r="5" fill="#1a2635"/></>}
  {profile.camera==="punch"&&<><circle cx="200" cy={s.y+21} r="8" fill="#121316"/><circle cx="200" cy={s.y+21} r="3.5" fill="#1f2935"/></>}
  {profile.camera==="bezel"&&<><rect x="170" y="12" width="60" height="3" rx="1.5" fill="#44464b"/><circle cx="284" cy="13" r="4" fill="#263345"/></>}
 </>}
 {profile.kind==="laptop"&&(profile.camera==="notch"?<><path d={`M 447 ${s.y-1} H 553 V ${s.y+24} Q 553 ${s.y+30} 547 ${s.y+30} H 453 Q 447 ${s.y+30} 447 ${s.y+24} Z`} fill="#111215"/><circle cx="500" cy={s.y+13} r="3" fill="#1e2c37"/></>:<circle cx="500" cy="12" r="3.5" fill="#243347"/>)}
 {profile.id==="studio-display"&&<circle cx="500" cy="8" r="3" fill="#27313c"/>}
 {isTablet&&(profile.camera==="notch"?<><path d={`M ${s.x+s.width+2} 443 H ${s.x+s.width-11} Q ${s.x+s.width-19} 443 ${s.x+s.width-19} 451 V 547 Q ${s.x+s.width-19} 555 ${s.x+s.width-11} 555 H ${s.x+s.width+2} Z`} fill="#111215"/><circle cx={s.x+s.width-8} cy="476" r="4" fill="#263548"/><circle cx={s.x+s.width-8} cy="522" r="4" fill="#263548"/></>:<circle cx="625" cy={g.height/2} r="4.5" fill="#293648"/>)}
 </>;
 return <div className={"device-frame device-"+profile.kind+" model-"+profile.id+" "+className} data-device={profile.id} style={{"--device-ratio":frameWidth/frameHeight,aspectRatio:frameWidth/frameHeight} as CSSProperties}>
 <svg {...svgProps}><defs><linearGradient id={metal} x1="0" x2="1" y1="0" y2="0"><stop stopColor="#9c9ea3"/><stop offset=".48" stopColor="#c4c5c9"/><stop offset="1" stopColor="#989ba1"/></linearGradient><linearGradient id={deck} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#a5a8af"/><stop offset="1" stopColor="#c2c4c9"/></linearGradient></defs><g transform={transform}>
 {profile.kind==="phone"&&<><rect x="6" y="6" width="388" height={g.height-12} rx={g.radius} fill="#8b8c90"/><rect x="8" y="8" width="384" height={g.height-16} rx={g.radius-2} fill="#111214"/><rect x="3" y={g.height*.21} width="3" height="24" rx="1.5" fill="#797b80"/><rect x="3" y={g.height*.29} width="3" height="49" rx="1.5" fill="#797b80"/><rect x="3" y={g.height*.37} width="3" height="49" rx="1.5" fill="#797b80"/><rect x="394" y={g.height*.31} width="3" height="70" rx="1.5" fill="#797b80"/></>}
 {isTablet&&<><rect x="5" y="5" width={g.width-10} height={g.height-10} rx={g.radius} fill="#8c8e93"/><rect x="7" y="7" width={g.width-14} height={g.height-14} rx={g.radius-2} fill="#111215"/><rect x="93" y="2" width="45" height="3" rx="1.5" fill="#84878d"/></>}
 {profile.kind==="monitor"&&<>
  {profile.id==="studio-display"?<><path d="M 425 570 H 575 L 588 741 H 412 Z" fill={`url(#${metal})`}/><path d="M 412 726 H 588 L 620 751 H 380 Z" fill="#b8bbc1"/><path d="M 380 751 H 620 V 755 H 380 Z" fill="#969aa2"/></>:<><rect x="467" y="565" width="66" height="169" rx="3" fill={`url(#${metal})`}/><path d="M 374 725 H 626 L 655 749 H 345 Z" fill="#b1b5ba"/><path d="M 345 749 H 655 V 754 H 345 Z" fill="#8e9299"/></>}
  <rect x="0" y="0" width="1000" height="581" rx={g.radius} fill="#8b8e94"/><rect x="2" y="2" width="996" height="577" rx={g.radius-2} fill="#151619"/>
  {profile.id==="monitor"&&<><rect x="3" y="565" width="994" height="13" fill="#303237"/><text x="500" y="574" textAnchor="middle" fontSize="8" fontFamily="Arial,sans-serif" fill="#a0a3aa" letterSpacing="1">DELL</text><circle cx="978" cy="571" r="1.5" fill="#ddd"/></>}
 </>}
 {profile.kind==="laptop"&&<>
  <rect x="34" y="4" width="932" height={s.y+s.height+15} rx={g.radius} fill="#a0a3aa"/><rect x="37" y="7" width="926" height={s.y+s.height+9} rx={g.radius-3} fill="#151619"/>
  <path d={`M 36 ${s.y+s.height+13} H 964 L 997 ${g.height-22} H 3 Z`} fill={`url(#${deck})`} stroke="#95989f" strokeWidth="1"/>
  <rect x="92" y={s.y+s.height+15} width="816" height="4" rx="2" fill="#60636a"/>
  {Array.from({length:4},(_,row)=><g key={row}>{Array.from({length:14},(_,col)=><rect key={col} x={164+col*48} y={s.y+s.height+26+row*12} width="43" height={row===0?7:9} rx="2" fill="#26282d"/>)}{Array.from({length:6},(_,i)=><g key={i}><path d={`M ${93+i*8} ${s.y+s.height+26+row*12} v 8`} stroke="#777b82" strokeWidth="2"/><path d={`M ${866+i*8} ${s.y+s.height+26+row*12} v 8`} stroke="#777b82" strokeWidth="2"/></g>)}</g>)}
  <rect x="164" y={s.y+s.height+74} width="55" height="9" rx="2" fill="#26282d"/><rect x="224" y={s.y+s.height+74} width="55" height="9" rx="2" fill="#26282d"/><rect x="284" y={s.y+s.height+74} width="55" height="9" rx="2" fill="#26282d"/><rect x="344" y={s.y+s.height+74} width="310" height="9" rx="2" fill="#26282d"/><rect x="659" y={s.y+s.height+74} width="55" height="9" rx="2" fill="#26282d"/><rect x="719" y={s.y+s.height+74} width="55" height="9" rx="2" fill="#26282d"/><rect x="779" y={s.y+s.height+74} width="43" height="9" rx="2" fill="#26282d"/>
  <rect x="374" y={s.y+s.height+91} width="252" height="47" rx="5" fill="#b5b8be" stroke="#969aa2" strokeWidth="1.2"/>
  <path d={`M 3 ${g.height-22} H 997 Q 986 ${g.height-7} 958 ${g.height-7} H 42 Q 14 ${g.height-7} 3 ${g.height-22} Z`} fill="#8f939b"/>
  <path d={`M 437 ${g.height-22} H 563 Q 561 ${g.height-16} 555 ${g.height-16} H 445 Q 439 ${g.height-16} 437 ${g.height-22} Z`} fill="#777c85"/>
 </>}
 </g></svg>
 <div className="device-screen" style={{left:screen.x/frameWidth*100+"%",top:screen.y/frameHeight*100+"%",width:screen.width/frameWidth*100+"%",height:screen.height/frameHeight*100+"%",borderRadius:`${screen.radius/screen.width*100}% / ${screen.radius/screen.height*100}%`}}>{children}</div>
 <svg {...svgProps} className="device-vector device-overlay"><g transform={transform}>{camera}
 {showClock&&profile.kind==="phone"&&<g fill="#fff"><text x="200" y={s.y+169} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize={device.startsWith("iphone")?73:66} fontWeight="400" letterSpacing="-2">09:41</text>{profile.camera!=="bezel"&&<rect x="143" y={s.y+s.height-14} width="114" height="4" rx="2" fillOpacity=".85"/>}</g>}
 </g></svg>
 </div>;
}
