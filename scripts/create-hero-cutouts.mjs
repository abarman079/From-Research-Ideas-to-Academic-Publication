/**
 * Make transparent hero-only cutouts while preserving every original pixel of
 * the printed book (including exact Bengali lettering).
 *
 * Usage (from Next.js project root): node scripts/create-hero-cutouts.mjs
 * Relies on sharp, already present in this project's devDependencies.
 * No source photograph is overwritten.
 */
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const base = join(root, 'public/books/research-method-manuscript-publication');
const output = join(base, 'hero-cutouts');
const sources = [
  { id: 'front', file: join(base,'hero/cover-main.jpg') },
  { id: 'back', file: join(base,'gallery/back-cover.jpg') },
  { id: 'spine', file: join(base,'gallery/spine.jpg') },
  { id: 'inside', file: join(base,'gallery/interior-v2.jpg') },
];

function median(values) {
  const sorted = [...values].sort((a,b)=>a-b);
  return sorted[Math.floor(sorted.length/2)];
}

function similarity(r, g, b, colors, white) {
  if (white) {
    // White or cream backgrounds are intentionally considered. Only pixels
    // connected to the outside edge will be removed, protecting the white book.
    if (Math.min(r,g,b)<155) return false;
    const spread = Math.max(r,g,b)-Math.min(r,g,b);
    if(spread > 42) return false;
    return colors.some(c => {
      const dr=r-c[0],dg=g-c[1],db=b-c[2];
      return dr*dr+dg*dg+db*db < 34*34;
    });
  }
  // Studio backgrounds with a saturated fabric surface, e.g. original red photos.
  // Preserve white book edges by requiring background saturation/chroma.
  const mx = Math.max(r,g,b), mn=Math.min(r,g,b);
  if(mx-mn < 34) return false;
  for(const c of colors) {
    const dr=r-c[0],dg=g-c[1],db=b-c[2];
    if(dr*dr+dg*dg+db*db < 108*108 && (r > g*1.16 || b > g*1.16)) return true;
  }
  return false;
}

async function cutout({ id, file }) {
  const destination=join(output, `${id}.png`);
  if(existsSync(destination) && !process.argv.includes('--force')){
    console.log(`SKIP ${id}.png already exists (use --force to regenerate)`);
    return;
  }
  if(!existsSync(file)) throw new Error(`Missing source photo: ${relative(root,file)}`);
  const { data, info } = await sharp(file).rotate().removeAlpha().raw().toBuffer({resolveWithObject:true});
  const { width:w, height:h, channels } = info;
  const length = w*h;
  if (channels!==3) throw new Error(`${id}: expected RGB input, found ${channels} channels`);

  // Detect the neutral studio background or the red original-photo backdrop.
  const points=[[.01,.01],[.98,.01],[.01,.98],[.98,.98],[.5,.005],[.5,.995],[.005,.5],[.995,.5]];
  const cornerColors=points.map(([a,b])=>{
    let rr=[],gg=[],bb=[];const cx=Math.floor(a*w),cy=Math.floor(b*h);
    for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){
      let x=Math.max(0,Math.min(w-1,cx+dx)),y=Math.max(0,Math.min(h-1,cy+dy));
      const k=(y*w+x)*3;rr.push(data[k]);gg.push(data[k+1]);bb.push(data[k+2]);
    }
    return [median(rr),median(gg),median(bb)];
  });
  const whiteCount=cornerColors.filter(([r,g,b])=>Math.min(r,g,b)>190&&Math.max(r,g,b)-Math.min(r,g,b)<36).length;
  const white=whiteCount>=4;
  const colors=cornerColors.filter(([r,g,b])=>white ? Math.min(r,g,b)>165 : r>g*1.1 || b>g*1.1);
  if(colors.length<3) throw new Error(`${id}: could not identify a consistent studio background; retain original photo and review manually`);

  // Flood-fill ONLY from image borders. Internal paper remains opaque even
  // where its color matches the white exterior background.
  const visited=new Uint8Array(length);
  const queue=new Int32Array(length);
  let head=0,tail=0;
  function visit(x,y) {
    const idx=y*w+x;
    if(visited[idx])return;
    const j=idx*3;
    if(!similarity(data[j],data[j+1],data[j+2],colors,white))return;
    visited[idx]=1; queue[tail++]=idx;
  }
  for(let x=0;x<w;x++){visit(x,0);visit(x,h-1)}
  for(let y=0;y<h;y++){visit(0,y);visit(w-1,y)}
  while(head<tail){
    const idx=queue[head++],x=idx%w,y=(idx-x)/w;
    if(x>0)visit(x-1,y);
    if(x+1<w)visit(x+1,y);
    if(y>0)visit(x,y-1);
    if(y+1<h)visit(x,y+1);
  }
  // Restore blue printed cover details that are sometimes darkened by
  // compression/shadows and incorrectly marked as red background.
  // Blue ink exists in the supplied cover artwork; red studio fabric does not.
  for(let idx=0;idx<length;idx++){
    if(!visited[idx])continue;
    const k=idx*3,r=data[k],g=data[k+1],b=data[k+2];
    if(b>112 && b>r*1.15 && b>g*1.09) visited[idx]=0;
  }

  // Keep the dominant physical object. This removes any stray unmasked studio
  // background flecks near image borders before calculating its crop.
  const regions=[];
  const marks=new Uint8Array(length);
  for(let seed=0;seed<length;seed++){
    if(visited[seed] || marks[seed]) continue;
    let first=0,last=0;queue[last++]=seed;marks[seed]=1;
    let minx=w,maxx=0,miny=h,maxy=0;
    while(first<last){
      const idx=queue[first++],x=idx%w,y=(idx-x)/w;
      if(x<minx)minx=x;if(x>maxx)maxx=x;
      if(y<miny)miny=y;if(y>maxy)maxy=y;
      const neighbors=[x>0?idx-1:-1,x<w-1?idx+1:-1,y>0?idx-w:-1,y<h-1?idx+w:-1];
      for(const next of neighbors)if(next>=0 && !visited[next] && !marks[next]){marks[next]=1;queue[last++]=next;}
    }
    regions.push({ size:last, bbox:[minx,miny,maxx,maxy], seed });
  }
  regions.sort((a,b)=>b.size-a.size);
  const main=regions[0];
  if(!main || main.size/length<.08) throw new Error(`${id}: insufficient distinguishable foreground; review the source image manually`);
  // Mark non-dominant stray components as transparent, but retain a nearby
  // tassel/bookmark fragment if it is large enough to be intentional.
  const allowedMin=Math.max(600, Math.floor(main.size*.004));
  const [x0,y0,x1,y1]=main.bbox;
  for(let seed=0;seed<length;seed++) marks[seed]=0;
  function preserveComponent(seed){
    let first=0,last=0;queue[last++]=seed;marks[seed]=1;
    while(first<last){
      const idx=queue[first++],x=idx%w,y=(idx-x)/w;
      const n=[x>0?idx-1:-1,x<w-1?idx+1:-1,y>0?idx-w:-1,y<h-1?idx+w:-1];
      for(const next of n)if(next>=0 && !visited[next] && !marks[next]){marks[next]=1;queue[last++]=next;}
    }
  }
  preserveComponent(main.seed);
  for(const reg of regions.slice(1)){
    if(reg.size<allowedMin) continue;
    const [ax,ay,bx,by]=reg.bbox;
    const gapX=Math.max(x0-bx,ax-x1,0),gapY=Math.max(y0-by,ay-y1,0);
    if(gapX<.06*w && gapY<.09*h) preserveComponent(reg.seed);
  }
  for(let i=0;i<length;i++)if(!marks[i])visited[i]=1;
  const ratio=visited.reduce((a,v)=>a+v,0)/length;
  if (ratio < .12 || ratio > .91) throw new Error(`${id}: unusual background fraction (${(ratio*100).toFixed(1)}%). Please inspect source; no cutout generated.`);

  // Preserve original RGB pixels exactly; only adjust alpha at foreground edges.
  const rgba=Buffer.alloc(length*4);
  let minX=w,maxX=0,minY=h,maxY=0;
  for(let idx=0;idx<length;idx++){
    const k=idx*3,o=idx*4;
    rgba[o]=data[k];rgba[o+1]=data[k+1];rgba[o+2]=data[k+2];
    if(visited[idx])rgba[o+3]=0;
    else {
      const x=idx%w,y=(idx-x)/w;
      let feather=false;
      if(x>0 && visited[idx-1])feather=true;
      else if(x<w-1 && visited[idx+1])feather=true;
      else if(y>0 && visited[idx-w])feather=true;
      else if(y<h-1 && visited[idx+w])feather=true;
      rgba[o+3]=feather?175:255;
      if(x<minX)minX=x;if(x>maxX)maxX=x;
      if(y<minY)minY=y;if(y>maxY)maxY=y;
    }
  }
  const padding=Math.max(4,Math.floor(Math.min(w,h)*.008));
  const left=Math.max(0,minX-padding),top=Math.max(0,minY-padding);
  const right=Math.min(w,maxX+padding+1),bottom=Math.min(h,maxY+padding+1);
  await sharp(rgba,{raw:{width:w,height:h,channels:4}})
    .extract({left,top,width:right-left,height:bottom-top})
    .png({compressionLevel:9, effort:6})
    .toFile(destination);
  console.log(`OK  ${id}.png   transparent: ${(ratio*100).toFixed(1)}%   ${right-left}x${bottom-top}`);
}
mkdirSync(output,{recursive:true});
let failed=0;
for (const entry of sources) {
  try {await cutout(entry)} catch(error) {failed++;console.error(`FAIL ${entry.id}: ${error.message}`)}
}
if(failed){console.error(`\n${failed} cutout(s) need manual review. The originals are safe and unchanged.`);process.exitCode=1}
else console.log('\nHero cutouts ready. Inspect all four PNGs carefully before deploying.');
