import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('public/books/research-method-manuscript-publication/preview');
let bad = false;
for (let i = 1; i <= 15; i++) {
  const name = `research-book-first-15-pages_page-${String(i).padStart(4, '0')}.jpg`;
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) {
    console.error(`MISSING: ${name}`);
    bad = true;
  } else {
    const bytes = fs.statSync(file).size;
    console.log(`${String(i).padStart(2, '0')}. ${name} (${(bytes / 1024).toFixed(0)} KB)`);
    if (bytes < 15_000) { console.warn(`WARNING: ${name} is unusually small.`); }
  }
}
if (bad) { console.error('FAILED: Fix missing filenames before running the reader.'); process.exitCode = 1; }
else console.log('\nPASS: All 15 JPG files exist.');
