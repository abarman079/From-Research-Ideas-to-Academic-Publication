/** Phase 3 preflight. Run with: node scripts/audit-phase3.mjs */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const paths = {
  landing: 'src/components/BookLanding.tsx',
  finale: 'src/components/SignatureFinale.tsx',
  css: 'src/components/SignatureFinale.module.css',
  tracking: 'src/components/PurchaseIntentEvents.tsx',
  logo: 'public/brand/iojh-logo-cropped.png',
  front: 'public/books/research-method-manuscript-publication/hero-cutouts/cover-main.png',
  back: 'public/books/research-method-manuscript-publication/hero-cutouts/back-cover.png',
};
let failed = 0;
for (const [label, file] of Object.entries(paths)) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`MISSING [${label}] ${file}`);
    failed += 1;
  } else {
    console.log(`OK [${label}] ${file}`);
  }
}
if (!failed) {
  const book = fs.readFileSync(path.join(root,paths.landing),'utf8');
  const required = ['<SignatureFinale', '<PurchaseIntentEvents', '<CampaignHero', '<BookTopicsExplorer', '<AuthorAndPurchase', '<BookFAQ', '<HeroFlipReader', '<EditorialMotion'];
  for (const item of required) {
    if (!book.includes(item)) { console.error(`MISSING INTEGRATION ${item}`); failed++; }
    else console.log(`OK integration ${item}`);
  }
  if (/<SiteFooter\b/.test(book)) { console.error('The old SiteFooter is still mounted.'); failed++; }
  // Quick binary check: user-supplied cutouts must really have an alpha channel.
  for (const image of [paths.front, paths.back]) {
    const data = fs.readFileSync(path.join(root, image));
    const valid = data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const color = valid ? data[25] : -1;
    if (!valid) { console.error('NOT PNG:',image); failed++; }
    else if (![4,6].includes(color) && !data.includes(Buffer.from('tRNS'))) {
      console.warn('CHECK ALPHA: this PNG may not contain transparency:',image);
    } else console.log('OK potential transparency:',image);
  }
}
console.log('\nMANUAL REQUIRED: both languages, 360–390px mobile, retailer links, original 15-page reader, Meta consent/attribution setup, Vercel deployment.');
console.log('Custom events are disabled unless NEXT_PUBLIC_IOJH_CUSTOM_EVENTS=true; custom events may require a qualifying Vercel plan.');
console.log(failed ? `FAIL: ${failed} check(s).` : 'PASS: local Phase 3 file and mount checks.');
if (failed) process.exitCode=1;
