import fs from 'node:fs';
import path from 'node:path';
const exists = p => fs.existsSync(path.join(process.cwd(),p));
const read = p => exists(p) ? fs.readFileSync(path.join(process.cwd(),p),'utf8') : '';
const b=read('src/components/BookLanding.tsx');
const p=read('src/app/(localized)/[locale]/page.tsx');
const checks=[
 ['New bilingual FAQ mounted', b.includes('<BookFAQ locale={locale} />')],
 ['Preview activity handler present', b.includes("iojh:sample-open")],
 ['Browser favicon and icon available', exists('src/app/favicon.ico') && exists('src/app/icon.png')],
 ['Apple icon available', exists('src/app/apple-icon.png')],
 ['Branded social card available', exists('src/app/opengraph-image.jpg')],
 ['Structured data omits disputed page count', !p.includes('numberOfPages:')],
 ['Canonical/hreflang metadata present', p.includes('canonical:') && p.includes('"bn-BD"')],
 ['Analytics component present', read('src/app/(localized)/[locale]/layout.tsx').includes('<Analytics />')],
 ['15 original JPGs present', Array.from({length:15}, (_,i) => exists(`public/books/research-method-manuscript-publication/preview/research-book-first-15-pages_page-${String(i+1).padStart(4,'0')}.jpg`)).every(Boolean)],
];
for (const [name, ok] of checks) console.log(`${ok?'PASS':'CHECK'}  ${name}`);
if (checks.some(([,ok])=>!ok)) process.exitCode=1;
