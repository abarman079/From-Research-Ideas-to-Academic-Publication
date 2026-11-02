/** IOJH final large-photo gallery + slightly enlarged sample reader. No dependencies. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const ownRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dry = process.argv.includes('--dry-run');
const check = process.argv.includes('--check');
const undo = process.argv.includes('--undo');
const TAG = 'IOJH-FINAL-READABILITY-2026';
const cssTagStart = `/* ${TAG}:START */`;
const cssTagEnd = `/* ${TAG}:END */`;
const backupRoot = path.join(root, '.iojh-backups', 'final-book-readability-2026');
const locations = {
  landing: 'src/components/BookLanding.tsx',
  hero: 'src/components/CampaignHero.tsx',
  reader: 'src/components/HeroFlipReader.tsx',
  globalCss: 'src/app/globals.css',
  readerCss: 'src/components/HeroFlipReader.module.css',
};
const originals = {};
for (const [key, rel] of Object.entries(locations)) {
  const target = path.join(root, rel);
  if (!fs.existsSync(target)) { console.error(`Missing ${rel}. Run from your project root.`); process.exit(1); }
  originals[key] = fs.readFileSync(target, 'utf8');
}
const isPatched = Object.values(originals).map(v => v.includes(TAG));
if (check) {
  const missing = Object.keys(locations).filter((_,i)=>!isPatched[i]);
  if (missing.length) { console.error('Not fully installed: ' + missing.join(', ')); process.exit(1); }
  console.log('PASS: gallery zoom, original-resolution images, and enlarged sample reader are installed.');
  process.exit(0);
}
if (undo) {
  if (!fs.existsSync(backupRoot)) { console.error('No backup available: ' + backupRoot); process.exit(1); }
  if (dry) { console.log('Would restore all five backed-up files.'); process.exit(0); }
  for (const [key, rel] of Object.entries(locations)) {
    const b = path.join(backupRoot, rel);
    if (!fs.existsSync(b)) { console.error('Backup missing: ' + b); process.exit(1); }
  }
  for (const rel of Object.values(locations)) fs.copyFileSync(path.join(backupRoot, rel), path.join(root, rel));
  console.log('Restored all five files to their pre-install state.');
  process.exit(0);
}
if (isPatched.some(Boolean)) {
  if (isPatched.every(Boolean)) {console.log('Already installed. No changes.');process.exit(0);}
  console.error('Partial installation detected. No changes made. Run --check and inspect your files.');
  process.exit(1);
}
function once(s, before, after, description) {
  const hits=s.split(before).length-1;
  if (hits!==1) throw new Error(`${description}: expected 1 exact match; found ${hits}. No changes made. Save your files and provide this error.`);
  return s.replace(before,after);
}
function maybeAddUnoptimized(s) {
  if (/fill\s+unoptimized=\{true\}/.test(s)) return s;
  return once(s, '      fill\n      priority={priority}', '      fill\n      unoptimized={true}\n      priority={priority}', 'source-image rendering');
}
let updated={...originals};
try {
  let landing=updated.landing;
  landing=once(landing,
    '  const [lightboxOpen, setLightboxOpen] = useState(false);',
    `  const [lightboxOpen, setLightboxOpen] = useState(false);\n  const [photoZoomed, setPhotoZoomed] = useState(false); // ${TAG}\n  const photoViewportRef = useRef<HTMLDivElement>(null);`,
    'gallery zoom state');
  landing=once(landing,
    '    setLightboxOpen(true);',
    '    setPhotoZoomed(false);\n    setLightboxOpen(true);',
    'gallery zoom reset on open');
  landing=once(landing,
    '  const galleryMove = (direction: number) =>\n    setPhotoIndex((i) => (i + direction + gallery.length) % gallery.length);',
    '  const galleryMove = (direction: number) => {\n    setPhotoZoomed(false);\n    setPhotoIndex((i) => (i + direction + gallery.length) % gallery.length);\n  };',
    'gallery zoom reset on navigation');
  landing=once(landing,
    '  const currentImage = gallery[photoIndex];',
    `  const currentImage = gallery[photoIndex];\n  // Prefer the approved transparent book photographs when viewing a larger image.\n  const fullSizeBookImages: Record<string, string> = {\n    front: '/books/research-method-manuscript-publication/hero-cutouts/cover-main.png',\n    back: '/books/research-method-manuscript-publication/hero-cutouts/back-cover.png',\n    spine: '/books/research-method-manuscript-publication/hero-cutouts/spine.png',\n    inside: '/books/research-method-manuscript-publication/hero-cutouts/interior-v2.png',\n  }; // ${TAG}\n  const fullSizeBookSrc = fullSizeBookImages[currentImage.id] ?? currentImage.src;`,
    'full-resolution cutout mapping');
  landing=once(landing,
    '  const currentImage = gallery[photoIndex];',
    `  // Keep a zoomed book centered when its larger canvas becomes scrollable.\n  useEffect(() => {\n    const el = photoViewportRef.current;\n    if (!el) return;\n    const frame = requestAnimationFrame(() => {\n      el.scrollLeft = photoZoomed ? (el.scrollWidth - el.clientWidth) / 2 : 0;\n      el.scrollTop = photoZoomed ? (el.scrollHeight - el.clientHeight) / 2 : 0;\n    });\n    return () => cancelAnimationFrame(frame);\n  }, [photoZoomed, photoIndex, lightboxOpen]);\n  const currentImage = gallery[photoIndex];`,
    'gallery centered zoom effect');
  landing=once(landing,
    '            <div className="modal-image">\n              <Photo',
    '            <div ref={photoViewportRef} className={`modal-image ${photoZoomed ? "iojh-photo-zoomed" : ""}`} onDoubleClick={() => setPhotoZoomed(v => !v)}>\n              <div className="iojh-photo-canvas">\n              <Photo',
    'gallery scroll and zoom canvas');
  landing=once(landing,
    '                src={currentImage.src}\n                alt={t.gallery.alts[photoIndex]}',
    '                src={fullSizeBookSrc}\n                alt={t.gallery.alts[photoIndex]}',
    'use updated PNG for enlarged display');
  landing=once(landing,
    '                sizes="90vw"\n              />\n            </div>',
    '                sizes="(max-width: 740px) 200vw, 1800px"\n              />\n              </div>\n            </div>',
    'close zoom canvas');
  landing=once(landing,
    '              <button\n                type="button"\n                ref={closeButton}',
    `              <button type="button" className="iojh-photo-zoom-toggle"\n                aria-pressed={photoZoomed} onClick={() => setPhotoZoomed(v => !v)}\n                aria-label={photoZoomed ? (locale === 'bn' ? 'পুরো ছবি দেখুন' : 'Fit photograph') : (locale === 'bn' ? 'ছবিটি বড় করুন' : 'Zoom photograph')}\n              >{photoZoomed ? (locale === 'bn' ? 'পুরো ছবি' : 'Fit image') : (locale === 'bn' ? 'বড় করে দেখুন' : 'Zoom in')}</button>\n              <button\n                type="button"\n                ref={closeButton}`,
    'gallery zoom toolbar');
  landing=maybeAddUnoptimized(landing);
  landing += `\n// ${TAG}\n`;
  updated.landing=landing;
  let hero=updated.hero;
  if (!/fill\s+unoptimized=\{true\}/.test(hero)) hero=once(hero,
    '                  fill\n                  priority={photoIndex === 0}',
    '                  fill\n                  unoptimized={true}\n                  priority={photoIndex === 0}',
    'hero no extra compression');
  hero += `\n// ${TAG}\n`;
  updated.hero=hero;
  let reader=updated.reader;
  reader=once(reader,
    '  const widthAvailable = Math.max(150, dimensions.width - 98);',
    `  const widthAvailable = Math.max(150, dimensions.width - (single ? 40 : 66)); // ${TAG}`,
    'sample reader width');
  reader=once(reader,
    '  const heightAvailable = Math.max(130, dimensions.height - 36);',
    '  const heightAvailable = Math.max(130, dimensions.height - 12);',
    'sample reader height');
  reader=once(reader,
    '  const canvasWidth = Math.max(dimensions.width, scaledWidth + 48);',
    '  const canvasWidth = Math.max(dimensions.width, scaledWidth + 22);',
    'page canvas width');
  reader=once(reader,
    '  const canvasHeight = Math.max(dimensions.height, scaledHeight + 36);',
    '  const canvasHeight = Math.max(dimensions.height, scaledHeight + 14);',
    'page canvas height');
  updated.reader=reader;
  let css=fs.readFileSync(path.join(ownRoot,'patches/photo-gallery.css'),'utf8');
  let readerCss=fs.readFileSync(path.join(ownRoot,'patches/sample-reader.css'),'utf8');
  updated.globalCss += `\n${cssTagStart}\n${css}\n${cssTagEnd}\n`;
  updated.readerCss += `\n${cssTagStart}\n${readerCss}\n${cssTagEnd}\n`;
  // Save nothing unless all replacements succeeded.
  if(dry){
    for(const [k,txt] of Object.entries(updated)) console.log(`DRY RUN ${locations[k]}: ${originals[k].length} -> ${txt.length} characters`);
    console.log('No files changed.');
    process.exit(0);
  }
  for(const rel of Object.values(locations)) {
    if(fs.existsSync(path.join(backupRoot, rel))) throw new Error('Existing backup would be overwritten. Aborting.');
  }
  for(const rel of Object.values(locations)) {
    const backup=path.join(backupRoot,rel);
    fs.mkdirSync(path.dirname(backup),{recursive:true});
    fs.copyFileSync(path.join(root,rel),backup);
  }
  for(const [k,rel] of Object.entries(locations)) fs.writeFileSync(path.join(root,rel), updated[k], 'utf8');
  console.log('Applied final readability update. Backup:', backupRoot);
} catch (error) {console.error('No code changed: '+error.message); process.exit(1)}
