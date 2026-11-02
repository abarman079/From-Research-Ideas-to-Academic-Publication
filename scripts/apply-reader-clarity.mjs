/** IOJH reader & photo sharpness patch, reversible and dependency-free. */
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
// Resolve Windows paths through fileURLToPath, not URL pathname.
import {fileURLToPath} from 'node:url';
const packageRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const cssFragment=fs.readFileSync(path.join(packageRoot,'patches/reader-clarity.css'),'utf8');
const BEGIN='/* IOJH-READER-CLARITY-BEGIN */';
const END='/* IOJH-READER-CLARITY-END */';
const dry=process.argv.includes('--dry-run');
const check=process.argv.includes('--check');
const undo=process.argv.includes('--undo');
const basename='iojh-reader-clarity';
const backupsDir=path.join(root,'.iojh-backups',basename);
const files={
 reader:path.join(root,'src/components/HeroFlipReader.tsx'),
 readerCss:path.join(root,'src/components/HeroFlipReader.module.css'),
 hero:path.join(root,'src/components/CampaignHero.tsx'),
 landing:path.join(root,'src/components/BookLanding.tsx')
};
const fileValues={};
for(const [key,f] of Object.entries(files)){
 if(!fs.existsSync(f)){console.error(`Missing ${f}. Open the project root first.`);process.exit(1)}
 fileValues[key]=fs.readFileSync(f,'utf8');
}
const state=Object.fromEntries(Object.entries(fileValues).map(([k,s])=>[k,s.includes(k==='readerCss'?BEGIN: k==='hero'?'unoptimized={true}': k==='landing'?'unoptimized={true}': 'IOJH Reader Clarity v1')]));
if(check){
 const missing=Object.keys(state).filter(k=>!state[k]);
 if(missing.length){console.error('NOT FULLY INSTALLED: '+missing.join(', '));process.exit(1)}
 console.log('PASS: reader controls, CSS, hero and lightbox original-resolution mode are installed.');process.exit(0);
}
if(undo){
 if(!fs.existsSync(backupsDir)){console.error('Backup not found: '+backupsDir);process.exit(1)}
 if(dry){console.log('DRY RUN undo four files');process.exit(0)}
 for(const [key,dest] of Object.entries(files)){
  const b=path.join(backupsDir,path.basename(dest));
  if(!fs.existsSync(b)){console.error('Missing backup: '+b);process.exit(1)}
  fs.copyFileSync(b,dest);
 }
 console.log('Restored 4 backed-up files.');process.exit(0);
}
if(Object.values(state).some(Boolean)){
 if(Object.values(state).every(Boolean)){console.log('Already installed. Nothing to change.');process.exit(0)}
 console.error('Partial or existing patch found. Not overwriting. Run --check and inspect changes.');process.exit(1);
}
function replaceOnce(s,needle,replacement,label){
 const n=s.split(needle).length-1;
 if(n!==1) throw Error(`${label}: expected one anchor, found ${n}`);
 return s.replace(needle,replacement);
}
try {
 // Full TSX patch is incremental: no unrelated book-turn logic changes.
 let reader=fileValues.reader;
 reader=replaceOnce(reader, '  const [zoom, setZoom] = useState(100);',
  '  const [zoom, setZoom] = useState(100);\n  const [showThumbnails, setShowThumbnails] = useState(false); // IOJH Reader Clarity v1', 'reader state');
 reader=replaceOnce(reader, "    missing: bangla ? 'পৃষ্ঠা পাওয়া যায়নি' : 'Page image missing',",
  "    missing: bangla ? 'পৃষ্ঠা পাওয়া যায়নি' : 'Page image missing',\n    largeRead: bangla ? 'বড় করে এক পৃষ্ঠা পড়ুন' : 'Read larger · one page',\n    spreadRead: bangla ? 'দুই পৃষ্ঠার বই দেখুন' : 'Return to two-page book',\n    showPages: bangla ? 'পৃষ্ঠা তালিকা দেখুন' : 'Choose a page',\n    hidePages: bangla ? 'পৃষ্ঠা তালিকা লুকান' : 'Hide pages',", 'reader bilingual labels');
 reader=replaceOnce(reader,
  '    setZoom(100); // Turn at book-fit size; the reader may zoom in again afterwards.',
  '    if (!single) setZoom(100); // Keep enlarged single-page reading size as pages turn.',
  'reader zoom persistence');
 reader=replaceOnce(reader,
  '      scroll.scrollTop = Math.max(0, (scroll.scrollHeight - scroll.clientHeight) / 2);',
  '      scroll.scrollTop = zoom > 100 ? 0 : Math.max(0, (scroll.scrollHeight - scroll.clientHeight) / 2);',
  'start enlarged pages at the top');
 reader=replaceOnce(reader, '<div className={styles.controls}>', `<div className={styles.controls}>
            <button type="button" className={styles.readMode} aria-pressed={single}
              onClick={() => {
                setTurn(null);
                setPageIndex(p => single ? Math.floor(p / 2) * 2 : p);
                setSingle(!single);
                setZoom(single ? 100 : 150);
              }}>
              {single ? copy.spreadRead : copy.largeRead}
            </button>`, 'reader toolbar');
 reader=replaceOnce(reader, '        <footer className={styles.footer}>\n          <nav className={styles.thumbnails}',
 `        <footer className={styles.footer}>
          <button type="button" className={styles.thumbsButton} aria-controls="iojh-reader-thumbnails"
            aria-expanded={showThumbnails} onClick={() => setShowThumbnails(v => !v)}>
            {showThumbnails ? copy.hidePages : copy.showPages}
          </button>
          <nav id="iojh-reader-thumbnails" hidden={!showThumbnails} className={styles.thumbnails}`, 'reader thumbnails');
 // Full source resolution. Reader already renders native unoptimized images.
 let hero=fileValues.hero;
 hero=replaceOnce(hero,'                  fill\n                  priority={photoIndex === 0}',
 '                  fill\n                  unoptimized={true}\n                  priority={photoIndex === 0}', 'hero image quality');
 let landing=fileValues.landing;
 landing=replaceOnce(landing,'      fill\n      priority={priority}',
 '      fill\n      unoptimized={true}\n      priority={priority}', 'lightbox image quality');
 let readerCss=fileValues.readerCss + '\n'+BEGIN+'\n'+cssFragment+'\n'+END+'\n';
 const changed={reader,readerCss,hero,landing};
 if(dry){for(const [k,s] of Object.entries(changed)) console.log(`DRY RUN ${k}: ${fileValues[k].length} -> ${s.length} bytes`);process.exit(0)}
 if(!fs.existsSync(backupsDir))fs.mkdirSync(backupsDir,{recursive:true});
 for(const [k,dest] of Object.entries(files)){
  const backup=path.join(backupsDir,path.basename(dest));
  if(fs.existsSync(backup)){console.error(`Backup already exists: ${backup}. Refusing to overwrite.`);process.exit(1)}
 }
 for(const [k,dest] of Object.entries(files))fs.copyFileSync(dest,path.join(backupsDir,path.basename(dest)));
 for(const [k,dest] of Object.entries(files))fs.writeFileSync(dest,changed[k]);
 console.log('Installed reader clarity and source-quality gallery changes. Backups:',backupsDir);
} catch(e){console.error('No changes made: '+e.message);process.exit(1)}
