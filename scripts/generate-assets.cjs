const fs=require('node:fs');
const path=require('node:path');
const {createCanvas,loadImage}=require('@napi-rs/canvas');
const {loadEngine}=require('./load-engine.cjs');
global.OffscreenCanvas=class{constructor(w,h){return createCanvas(w,h)}};
const {renderWallpaper,PALETTES}=loadEngine('lib/wallpaper.ts');
const publicDir=path.resolve(__dirname,'../public');fs.mkdirSync(path.join(publicDir,'wallpapers'),{recursive:true});
const samples=[['pines','misty_pines','misty_nordic',1000,800],['dunes','silent_dunes','sahara_gold',800,650],['arches','lunar_arches','lunar_shadow',800,650],['flow','flow','misty_nordic',400,820]];
for(const [name,style,palette,width,height]of samples){const canvas=createCanvas(width,height);renderWallpaper(canvas,{style,palette:PALETTES.find(p=>p.id===palette),resolution:{id:'sample',label:'Sample',width,height},tone:'light',seed:37});fs.writeFileSync(path.join(publicDir,'wallpapers',name+'.jpg'),canvas.toBuffer('image/jpeg',85));console.log('Generated '+name);}
const svg=fs.readFileSync(path.join(publicDir,"brand/lightfold.svg"),"utf8");
fs.writeFileSync(path.join(publicDir,'logo.svg'),svg);
async function main(){const mark=await loadImage(Buffer.from(svg));for(const size of [32,180,192,512]){const c=createCanvas(size,size);c.getContext('2d').drawImage(mark,0,0,size,size);const png=c.toBuffer('image/png');if(size===32){const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=32;header[7]=32;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);fs.writeFileSync(path.join(publicDir,'favicon.ico'),Buffer.concat([header,png]));}else fs.writeFileSync(path.join(publicDir,size===180?'apple-touch-icon.png':'icon-'+size+'.png'),png);}
const og=createCanvas(1200,630),ctx=og.getContext('2d');ctx.fillStyle='#f5f5f7';ctx.fillRect(0,0,1200,630);ctx.drawImage(mark,70,70,64,64);ctx.fillStyle='#202024';ctx.font='bold 28px sans-serif';ctx.fillText('LuminaWall',150,112);ctx.font='58px serif';ctx.fillText('Your screen.',70,265);ctx.fillText('Your atmosphere.',70,340);ctx.font='20px sans-serif';ctx.fillStyle='#64646d';ctx.fillText('Generative wallpapers. Free. Made in your browser.',70,445);ctx.drawImage(await loadImage(path.join(publicDir,'wallpapers/pines.jpg')),660,60,475,510);fs.writeFileSync(path.join(publicDir,'opengraph.jpg'),og.toBuffer('image/jpeg',88));console.log('Generated icons and social image');}
main().catch(error=>{console.error(error);process.exitCode=1});
