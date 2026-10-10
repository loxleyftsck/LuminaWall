const assert=require('node:assert/strict');
const base=process.env.SMOKE_BASE_URL??'http://127.0.0.1:3000';
const expected=new URL(process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000').origin;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function get(path){const response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(5000)});assert.equal(response.status,200,path+' must return 200');return response.text();}
async function main(){
 let ready=false;for(let i=0;i<30;i++){try{await get('/');ready=true;break;}catch{await delay(500);}}
 assert.ok(ready,'Server did not start');
 for(const path of ['/','/studio','/attractor','/lsystem']){
  const html=await get(path);const canonical=html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  assert.ok(canonical,'Missing canonical: '+path);assert.equal(canonical[1],expected+(path==='/'?'':path),'Wrong canonical: '+path);
 }
 const robots=await get('/robots.txt');assert.ok(robots.includes('Sitemap: '+expected+'/sitemap.xml'),'Wrong robots sitemap URL');
 const sitemap=await get('/sitemap.xml');const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>match[1]);
 assert.equal(urls.length,4);assert.deepEqual(new Set(urls),new Set(['','/studio','/attractor','/lsystem'].map(path=>expected+path)));
 console.log('Metadata smoke checks passed for '+expected);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
