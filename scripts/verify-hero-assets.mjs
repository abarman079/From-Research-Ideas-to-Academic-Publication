
/**
 * Run `node scripts/verify-hero-assets.mjs` at your project root.
 * This script checks file existence, filename and PNG transparency support.
 * It never edits your images.
 */
import fs from 'node:fs';
import path from 'node:path';

const base = path.join(process.cwd(), 'public', 'books', 'research-method-manuscript-publication', 'hero-cutouts');
const files = ['cover-main.png', 'back-cover.png', 'spine.png', 'interior-v2.png'];
let errors = 0;
for (const file of files) {
  const full = path.join(base, file);
  if (!fs.existsSync(full)) {
    console.error(`MISSING: ${file}`);
    errors++;
    continue;
  }
  const data = fs.readFileSync(full);
  const isPNG = data.length >= 26 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (!isPNG) {
    console.error(`INVALID PNG: ${file}`);
    errors++;
    continue;
  }
  const colorType = data[25];
  const possibleTransparency = colorType === 6 || colorType === 4 || (colorType === 3 && data.includes(Buffer.from('tRNS')));
  if (!possibleTransparency) {
    console.warn(`CHECK ALPHA: ${file} — PNG doesn't have an obvious alpha channel.`);
    errors++;
    continue;
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  console.log(`OK  ${file.padEnd(17)} ${width} × ${height}  ${(data.length / 1024).toFixed(0)} KB`);
}
if (errors) {
  console.error(`\n${errors} asset(s) require attention. The originals were not changed.`);
  process.exitCode = 1;
} else {
  console.log('\nPASS: all four named PNGs are present and support transparency.');
  console.log('Visually inspect each PNG as this does not guarantee clean edges.');
}
