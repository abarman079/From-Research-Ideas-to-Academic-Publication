/**
 * Create favicon, apple touch icon and real-book Open Graph social card from
 * approved assets already in the project. Never redraw the original logo.
 * Needs sharp, already in this project's devDependencies.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const brandDir = path.join(root, 'public', 'brand');
const logoCandidates = ['iojh-logo-cropped.png', 'iojh-logo.png'];
const logo = logoCandidates.map(p => path.join(brandDir, p)).find(fs.existsSync);
const cover = path.join(root, 'public', 'books', 'research-method-manuscript-publication', 'hero', 'cover-main.jpg');
const app = path.join(root, 'src', 'app');

if (!logo || !fs.existsSync(cover)) {
  console.error('Approved branding assets missing. Expected one original PNG at public/brand/iojh-logo[-cropped].png and the existing hero/cover-main.jpg.');
  process.exit(1);
}
fs.mkdirSync(app, { recursive: true });

const background = '#f7f6f1';
const originalLogo = sharp(logo).trim({ background: '#ffffff00', threshold: 8 });
const logoBuffer = await originalLogo.png().toBuffer();
const logoMeta = await sharp(logoBuffer).metadata();

for (const [file, size, inset] of [
  ['icon.png', 128, 12],
  ['apple-icon.png', 180, 17],
]) {
  const logoHeight = size - 2 * inset;
  const logoWidth = Math.max(1, Math.round(logoHeight * (logoMeta.width / logoMeta.height)));
  const scale = Math.min((size - inset * 2) / logoWidth, (size - inset * 2) / logoHeight, 1);
  const width = Math.max(1, Math.round(logoWidth * scale));
  const height = Math.max(1, Math.round(logoHeight * scale));
  const img = await sharp(logoBuffer).resize({ width, height, fit: 'contain' }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: img, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .png().toFile(path.join(app, file));
}

// Browser fallback for /favicon.ico. Encapsulate a 32x32 PNG in the ICO
// container, supported by modern desktop and mobile browsers.
const faviconPng = await sharp(path.join(app, 'icon.png')).resize(32, 32).png().toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // icon image
icoHeader.writeUInt16LE(1, 4); // single frame
icoHeader.writeUInt8(32, 6);
icoHeader.writeUInt8(32, 7);
icoHeader.writeUInt16LE(1, 10); // planes
icoHeader.writeUInt16LE(32, 12); // bit depth
icoHeader.writeUInt32LE(faviconPng.length, 14);
icoHeader.writeUInt32LE(22, 18); // data offset
fs.writeFileSync(path.join(app, 'favicon.ico'), Buffer.concat([icoHeader, faviconPng]));

const w = 1200, h = 630;
const coverWidth = 438, coverHeight = 535;
const coverImage = await sharp(cover)
  .resize(coverWidth, coverHeight, { fit: 'contain', background })
  .jpeg({ quality: 91 }).toBuffer();
const logoOnCard = await sharp(logoBuffer).resize({ width: 138, height: 75, fit: 'inside' }).png().toBuffer();
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#f7f6f1"/>
  <rect x="735" width="465" height="630" fill="#e7ebeb"/>
  <rect x="67" y="125" width="3" height="33" fill="#c5a34b"/>
  <text x="84" y="148" font-family="Arial,DejaVu Sans,sans-serif" font-size="21" font-weight="600" letter-spacing="2" fill="#326a52">IOJH BOOK COLLECTION</text>
  <text x="70" y="239" font-family="DejaVu Serif,Georgia,serif" font-size="51" font-weight="700" fill="#17324a">Research Method</text>
  <text x="70" y="310" font-family="DejaVu Serif,Georgia,serif" font-size="42" fill="#17324a">Manuscript Preparation</text>
  <text x="70" y="381" font-family="DejaVu Serif,Georgia,serif" font-size="42" fill="#4c7fbc">&amp; Publication</text>
  <line x1="70" y1="422" x2="657" y2="422" stroke="#cdd6d7"/>
  <text x="70" y="459" font-family="Arial,DejaVu Sans,sans-serif" font-size="23" fill="#4d6471">A Bengali-language research guide</text>
  <text x="70" y="499" font-family="Arial,DejaVu Sans,sans-serif" font-size="19" fill="#4d6471">Printed edition · Read 15 sample pages</text>
  <text x="70" y="579" font-family="Arial,DejaVu Sans,sans-serif" font-size="18" fill="#326a52">iojh.com.bd</text>
</svg>`;
const composites = [
  { input: Buffer.from(svg), left: 0, top: 0 },
  { input: coverImage, left: 759, top: 48 },
  { input: logoOnCard, left: 70, top: 27 },
];
await sharp({create: {width: w, height: h, channels: 4, background}})
  .composite(composites).jpeg({ quality: 91, mozjpeg: true })
  .toFile(path.join(app, 'opengraph-image.jpg'));

console.log('Created src/app/favicon.ico, icon.png, apple-icon.png, and opengraph-image.jpg from approved original assets.');
console.log('Review the image visually before committing or sharing the landing page.');
