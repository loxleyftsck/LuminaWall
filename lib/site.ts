/** Public origin used consistently by canonical metadata, robots and sitemap. */
export function resolveSiteURL(value:string,{requirePublicOrigin=false}:{requirePublicOrigin?:boolean}={}):string{
 let url:URL;
 try{url=new URL(value);}catch{throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute origin");}
 if(!["http:","https:"].includes(url.protocol)||url.username||url.password||url.pathname!=="/"||url.search||url.hash)throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query or fragment");
 if(requirePublicOrigin){
  const host=url.hostname.toLowerCase();
  const placeholder=/^(?:example\.(?:com|net|org)|your-domain\.)/.test(host)||/\.(?:example|invalid|test|localhost|local)$/.test(host)||/\.example\.(?:com|net|org)$/.test(host);
  if(url.protocol!=="https:"||host==="localhost"||!host.includes(".")||host.includes(":")||/^\d+\.\d+\.\d+\.\d+$/.test(host)||placeholder)throw new Error("Production requires a real public HTTPS domain in NEXT_PUBLIC_SITE_URL");
 }
 return url.origin;
}
const configured=process.env.NEXT_PUBLIC_SITE_URL??(process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:"http://localhost:3000");
export const SITE_URL=resolveSiteURL(configured,{requirePublicOrigin:process.env.REQUIRE_PRODUCTION_URL==="true"||process.env.VERCEL_ENV==="production"});
