import {RESOLUTIONS,type Resolution} from "@/lib/wallpaper";
export type DeviceKind="monitor"|"laptop"|"phone"|"tablet"|"canvas";
export type DeviceId="monitor"|"studio-display"|"macbook"|"laptop"|"iphone"|"iphone-notch"|"android"|"android-ultra"|"xperia"|"ipad"|"tablet"|"canvas";
export interface ScreenBounds {x:number;y:number;width:number;height:number;radius:number}
export interface DeviceGeometry {width:number;height:number;radius:number;screen:ScreenBounds}
export interface DeviceProfile {id:DeviceId;label:string;kind:DeviceKind;camera:"none"|"island"|"notch"|"punch"|"bezel";sizes:string[];geometry:DeviceGeometry}
/** Fixed chassis coordinates, independent of export dimensions. */
const phone=(height:number,radius:number,screenWidth:number,ratio:number):DeviceGeometry=>({width:400,height,radius,screen:{x:(400-screenWidth)/2,y:(height-screenWidth/ratio)/2,width:screenWidth,height:screenWidth/ratio,radius:Math.max(4,radius-(400-screenWidth)/2+6)}});
export const DEVICES:DeviceProfile[]=[
{id:"monitor",label:"Dell UltraSharp · 27″",kind:"monitor",camera:"none",sizes:["desktop4k","desktop8k"],geometry:{width:1000,height:770,radius:7,screen:{x:7,y:8,width:986,height:554.625,radius:2}}},
{id:"studio-display",label:"Apple Studio Display · 27″",kind:"monitor",camera:"bezel",sizes:["desktop5k","desktop4k","desktop8k"],geometry:{width:1000,height:768,radius:9,screen:{x:17,y:17,width:966,height:543.375,radius:3}}},
{id:"macbook",label:"MacBook Pro · 14″",kind:"laptop",camera:"notch",sizes:["macbook"],geometry:{width:1000,height:790,radius:19,screen:{x:49,y:19,width:902,height:902*1964/3024,radius:10}}},
{id:"laptop",label:"Laptop · 16:10",kind:"laptop",camera:"bezel",sizes:["laptop_qhd"],geometry:{width:1000,height:764,radius:10,screen:{x:49,y:22,width:902,height:563.75,radius:3}}},
{id:"iphone",label:"iPhone 16 Pro Max",kind:"phone",camera:"island",sizes:["iphone"],geometry:phone(827,61,366,1320/2868)},
{id:"iphone-notch",label:"iPhone 13 Pro Max",kind:"phone",camera:"notch",sizes:["iphone_notch"],geometry:phone(811,59,366,1284/2778)},
{id:"android",label:"Galaxy S25",kind:"phone",camera:"punch",sizes:["galaxy_s25"],geometry:phone(820.5,47,372,1080/2340)},
{id:"android-ultra",label:"Galaxy S25 Ultra",kind:"phone",camera:"punch",sizes:["galaxy_ultra"],geometry:phone(826,25,374,1440/3120)},
{id:"xperia",label:"Xperia 1 V · 21:9",kind:"phone",camera:"bezel",sizes:["mobile_4k"],geometry:phone(914,15,374,1644/3840)},
{id:"ipad",label:"iPad Pro · 13″",kind:"tablet",camera:"bezel",sizes:["ipad"],geometry:{width:640,height:836,radius:36,screen:{x:25,y:24.667,width:590,height:590*2752/2064,radius:24}}},
{id:"tablet",label:"Galaxy Tab S10 Ultra",kind:"tablet",camera:"notch",sizes:["tablet_android"],geometry:{width:640,height:998,radius:23,screen:{x:21,y:(998-598*2960/1848)/2,width:598,height:598*2960/1848,radius:13}}},
{id:"canvas",label:"Canvas",kind:"canvas",camera:"none",sizes:RESOLUTIONS.map(item=>item.id),geometry:{width:1,height:1,radius:0,screen:{x:0,y:0,width:1,height:1,radius:0}}}
];
export function getDevice(id:DeviceId){return DEVICES.find(item=>item.id===id)??DEVICES[0];}
export function deviceResolutions(id:DeviceId):Resolution[]{return getDevice(id).sizes.map(size=>RESOLUTIONS.find(item=>item.id===size)).filter((item):item is Resolution=>Boolean(item));}
