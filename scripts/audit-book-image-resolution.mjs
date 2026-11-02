/** Read-only. Lists native pixel dimensions and export size of public book images. */
import fs from 'node:fs/promises';
import path from 'node:path';

const base = path.join(process.cwd(),'public','books','research-method-manuscript-publication');
let sharp;
try { sharp = (await import('sharp')).default; }
catch { console.error('Missing sharp. Run `npm install` in the project root and rerun.'); process.exitCode = 1; }

if (sharp) {
 const groups = {
  'Hero transparent cutouts': ['hero-cutouts/cover-main.png','hero-cutouts/back-cover.png','hero-cutouts/spine.png','hero-cutouts/interior-v2.png'],
  'Original photos': ['hero/cover-main.jpg','gallery/back-cover.jpg','gallery/spine.jpg','gallery/interior-v2.jpg'],
  'Reader pages': Array.from({length:15},(_,i)=>`preview/research-book-first-15-pages_page-${String(i+1).padStart(4,'0')}.jpg`)
 };
 console.log('\nIOJH image resolution audit (original source pixels):');
 for (const [group,paths] of Object.entries(groups)) {
  console.log(`\n${group}`);
  for (const rel of paths) {
   const file=path.join(base,rel);
   try {
    const [m,st]=await Promise.all([sharp(file).metadata(),fs.stat(file)]);
    const w=m.width??0,h=m.height??0;
    const pixels=(w*h/1e6).toFixed(2);
    const note = Math.max(w,h) < 2000 ? '  LOW for very close zoom' : '';
    console.log(`${rel.padEnd(58)} ${`${w}x${h}`.padEnd(13)} ${`${pixels} MP`.padEnd(10)} ${(st.size/1024/1024).toFixed(2)} MB${note}`);
   } catch { console.log(`MISSING ${rel}`); }
  }
 }
 console.log('\nNote: PNG/JPG bit depth and file size are not megapixels. Enlarging to 8K cannot restore missing authentic printed text.');
}
