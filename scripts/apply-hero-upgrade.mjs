import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src/components/BookLanding.tsx');
const required = [
  'src/components/EditorialHero.module.css',
  'src/components/SmoothPageScroll.tsx',
  'src/app/hero-smooth-scroll.css',
];
for (const p of required) {
  if (!fs.existsSync(path.join(root, p))) {
    console.error(`MISSING: ${p}. Copy all ZIP files before running this installer.`);
    process.exit(1);
  }
}
if (!fs.existsSync(target)) { console.error('BookLanding.tsx is not in the expected location.'); process.exit(1); }
const before = fs.readFileSync(target,'utf8');
if (before.includes('heroStyles.editorialHero') && before.includes('SmoothPageScroll')) {
  console.log('This hero upgrade is already installed. No changes made.');
  process.exit(0);
}
if (before.includes('heroStyles') || before.includes('SmoothPageScroll')) {
  console.error('A partial hero upgrade exists. Restore the backup or inspect the file before retrying.');
  process.exit(1);
}
const checks = [
  ['HeroFlipReader import', /import HeroFlipReader from ['"]@\/components\/HeroFlipReader['"];/],
  ['Hero opening tag', /<section id="top" className="hero-section">/],
  ['Book facts area', /<div\s+className="hero-facts hero-enter"/],
  ['Root wrapper', /<div ref=\{root\} className="site-wrap">/],
];
for (const [name, re] of checks) {
  if (!re.test(before)) { console.error(`STOP: ${name} was not found. Existing file was not modified.`); process.exit(1); }
}
let output = before;
output = output.replace(
  /import HeroFlipReader from ['"]@\/components\/HeroFlipReader['"];/,
  (match) => `${match}\nimport heroStyles from '@/components/EditorialHero.module.css';\nimport SmoothPageScroll from '@/components/SmoothPageScroll';\nimport '@/app/hero-smooth-scroll.css';`
);
output = output.replace('<div ref={root} className="site-wrap">',
  '<div ref={root} className="site-wrap">\n      <SmoothPageScroll paused={readerOpen || lightboxOpen} />');
output = output.replace('<section id="top" className="hero-section">',
  '<section id="top" className={`hero-section ${heroStyles.editorialHero}`}>');
const chapterLinks = `
              <ul className={heroStyles.chapterLine} aria-label={locale === 'bn' ? 'বইয়ের তিনটি প্রধান বিষয়' : 'Three core subjects in the book'}>
                <li><a href="#inside"><span aria-hidden="true" />{locale === 'bn' ? 'গবেষণা পদ্ধতি' : 'Research methods'}</a></li>
                <li><a href="#inside"><span aria-hidden="true" />{locale === 'bn' ? 'পাণ্ডুলিপি প্রস্তুতি' : 'Manuscript preparation'}</a></li>
                <li><a href="#inside"><span aria-hidden="true" />{locale === 'bn' ? 'একাডেমিক প্রকাশনা' : 'Academic publication'}</a></li>
              </ul>
              `;
output = output.replace(/<div\s+className="hero-facts hero-enter"/, `${chapterLinks}<div className="hero-facts hero-enter"`);
// Remove the old scroll-scrub transform that could make a large product image look jittery.
const oldParallax = /\s*gsap\.to\("\.hero-gallery-media", \{\s*y: 10,\s*ease: "none",\s*scrollTrigger: \{\s*trigger: "\.hero-section",\s*start: "top top",\s*end: "bottom top",\s*scrub: 0\.7,\s*\},\s*\}\);/;
if (oldParallax.test(output)) output = output.replace(oldParallax, '\n          // Product photography stays anchored while the page scrolls.');
const backup = path.join(root,'.iojh-backups',`BookLanding.hero-${Date.now()}.tsx`);
fs.mkdirSync(path.dirname(backup),{recursive:true});
fs.writeFileSync(backup,before,'utf8');
fs.writeFileSync(target,output,'utf8');
console.log('SUCCESS: Updated only the BookLanding hero and added smooth scrolling integration.');
console.log(`BACKUP: ${path.relative(root,backup)}`);
console.log('NEXT: npm install lenis && npm run dev');
