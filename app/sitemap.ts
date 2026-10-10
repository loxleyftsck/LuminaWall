import type {MetadataRoute} from "next";
import {SITE_URL} from "@/lib/site";
export default function sitemap():MetadataRoute.Sitemap{return ["","/studio","/attractor","/lsystem"].map((path,index)=>({url:SITE_URL+path,changeFrequency:"monthly",priority:index===0?1:0.8}));}
