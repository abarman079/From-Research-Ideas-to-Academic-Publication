/**
 * IOJH logo visibility fix for the existing Next.js book website.
 * Preserves the source PNG exactly. Crops its empty border into a new file,
 * updates only brand.ts and appends scoped styling to SiteChrome.module.css.
 * Run: node scripts/fix-iojh-logo.mjs
 * Requires: npm install -D sharp
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.cwd();
const source = path.join(root, 'public', 'brand', 'iojh-logo.png');
const cropped = path.join(root, 'public', 'brand', 'iojh-logo-cropped.png');
const brandFile = path.join(root, 'src', 'lib', 'brand.ts');
const cssFile = path.join(root, 'src', 'components', 'SiteChrome.module.css');
const backup = path.join(root, '.iojh-backups', 'logo-visibility');
const begin = '/* IOJH LOGO SIZE FINAL — START */';
const end = '/* IOJH LOGO SIZE FINAL — END */';

const css = `
${begin}
/* Keep the artwork legible while preserving header alignment. */
.header .headerInner { min-height: 94px; }
.header .brandLink { min-width: 132px; }
.header .brandLink .brandImage {
  display: block;
  width: auto;
  height: 66px;
  max-width: 210px;
  max-height: none;
  object-fit: contain;
  object-position: left center;
}
.header .brandDescriptor { margin-top: -2px; font-size: 9px; }
/* The footer has its own larger mark, without affecting the header. */
.footer .footerLogoPlate {
  min-height: 112px;
  min-width: 194px;
  padding: 10px 20px;
  justify-content: flex-start;
}
.footer .footerLogoPlate .brandImage {
  width: auto;
  height: 86px;
  max-width: 200px;
  max-height: none;
  object-fit: contain;
}
@media (max-width: 1020px) {
  .header .headerInner { min-height: 79px; }
  .header .brandLink .brandImage { height: 56px; max-width: 180px; }
}
@media (max-width: 640px) {
  .header .headerInner { min-height: 74px; }
  .header .brandLink { min-width: 0; }
  .header .brandLink .brandImage { height: 49px; max-width: 102px; }
  .header .brandDescriptor { font-size: 8px; letter-spacing: .02em; }
  .footer .footerLogoPlate .brandImage { height: 78px; }
}
@media (max-width: 365px) {
  .header .headerInner { min-height: 70px; }
  .header .brandLink .brandImage { height: 43px; max-width: 90px; }
  .header .brandDescriptor { display: none; }
}
${end}
`;

for (const file of [source, brandFile, cssFile]) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required project file: ${path.relative(root, file)}`);
    process.exit(1);
  }
}

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('The image-processing package sharp is not installed.');
  console.error('Run: npm install -D sharp');
  console.error('Then run: node scripts/fix-iojh-logo.mjs');
  process.exit(1);
}

/* Determine the visible pixels without redrawing or modifying the logo. */
const { data, info } = await sharp(source)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const pixel = (x, y) => {
  const offset = (y * width + x) * channels;
  return [data[offset], data[offset + 1], data[offset + 2], data[offset + 3]];
};
const corners = [pixel(0, 0), pixel(width - 1, 0), pixel(0, height - 1), pixel(width - 1, height - 1)];
const transparent = corners.filter(c => c[3] < 18).length >= 3;
const white = !transparent && corners.filter(c => c[3] > 220 && c[0] >= 236 && c[1] >= 236 && c[2] >= 236).length >= 3;
const back = corners[0];
const cornerMatch = corners.every(c => Math.max(Math.abs(c[0] - back[0]), Math.abs(c[1] - back[1]), Math.abs(c[2] - back[2])) < 24 && Math.abs(c[3] - back[3]) < 24);
const visible = (r, g, b, a) => {
  if (transparent) return a >= 18;
  if (white) return !(r > 235 && g > 235 && b > 235);
  if (cornerMatch) return Math.max(Math.abs(r - back[0]), Math.abs(g - back[1]), Math.abs(b - back[2])) > 25 || Math.abs(a - back[3]) > 25;
  return true;
};
let left = width, top = height, right = -1, bottom = -1;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const p = (y * width + x) * channels;
    if (visible(data[p], data[p + 1], data[p + 2], data[p + 3])) {
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
}
if (right < left || bottom < top) {
  console.error('Could not detect a visible logo. No files were changed.');
  process.exit(1);
}
// Preserve a small breathing area around the visible artwork.
const pad = Math.max(5, Math.round(Math.min(right - left + 1, bottom - top + 1) * .06));
left = Math.max(0, left - pad);
top = Math.max(0, top - pad);
right = Math.min(width - 1, right + pad);
bottom = Math.min(height - 1, bottom + pad);
await sharp(source)
  .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
  .png()
  .toFile(cropped);

fs.mkdirSync(backup, { recursive: true });
for (const file of [brandFile, cssFile]) {
  const dst = path.join(backup, path.basename(file) + '.before-logo-fix');
  if (!fs.existsSync(dst)) fs.copyFileSync(file, dst);
}
const oldBrand = fs.readFileSync(brandFile, 'utf8');
const brandLines = oldBrand.split(/\r?\n/);
const declarationIndex = brandLines.findIndex(line => /^\s*export\s+const\s+IOJH_LOGO_PATH\s*:/.test(line));
if (declarationIndex < 0) {
  console.error('Could not locate IOJH_LOGO_PATH declaration. Cropped PNG was created, but source files were not changed.');
  process.exit(1);
}
brandLines[declarationIndex] = brandLines[declarationIndex].replace(
  /=\s*(?:null|"[^"]*"|'[^']*')\s*;?\s*$/,
  '= "/brand/iojh-logo-cropped.png";'
);
if (!brandLines[declarationIndex].includes('/brand/iojh-logo-cropped.png')) {
  console.error('Logo path declaration has an unexpected format. Source files were not changed.');
  process.exit(1);
}
const newBrand = brandLines.join('\n');
let oldCss = fs.readFileSync(cssFile, 'utf8');
if (oldCss.includes(begin) && oldCss.includes(end)) {
  const start = oldCss.indexOf(begin);
  const finish = oldCss.indexOf(end, start) + end.length;
  oldCss = oldCss.slice(0, start) + oldCss.slice(finish);
}
fs.writeFileSync(brandFile, newBrand);
fs.writeFileSync(cssFile, oldCss.trimEnd() + '\n\n' + css);
console.log('SUCCESS: Larger original IOJH logo configured for header and footer.');
console.log(`Original canvas: ${width} x ${height} pixels`);
console.log(`Cropped canvas: ${right - left + 1} x ${bottom - top + 1} pixels`);
console.log('Original file preserved: public/brand/iojh-logo.png');
console.log('New file: public/brand/iojh-logo-cropped.png');
console.log('Updated: src/lib/brand.ts and src/components/SiteChrome.module.css');
console.log('Backups: .iojh-backups/logo-visibility/');
console.log('Next: npm run dev');
