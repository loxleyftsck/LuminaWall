import type {Metadata} from "next";
import StudioPage from "@/components/StudioPage";
export const metadata:Metadata={title:"Wallpaper Studio",alternates:{canonical:"/studio"}};
export default function Page(){return <StudioPage/>;}
