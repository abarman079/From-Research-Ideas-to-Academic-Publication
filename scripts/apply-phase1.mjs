/**
 * IOJH Premium V3 – Phase 1 installer.
 * Safely updates only the campaign hero / traditional navbar and imports.
 * Preserves all existing sections, book preview, modal and purchase links.
 * Run from the project root: node scripts/apply-phase1.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src/components/BookLanding.tsx');
const component = path.join(root, 'src/components/CampaignHero.tsx');
const css = path.join(root, 'src/components/CampaignHero.module.css');
const typeCss = path.join(root, 'src/app/campaign-type.css');
const dryRun = process.argv.includes('--dry-run');
const fail = message => { console.error(`\nSTOPPED: ${message}\nNo source files were changed.`); process.exit(1); };
for (const p of [target, component, css, typeCss]) if (!fs.existsSync(p)) fail(`Missing ${path.relative(root,p)}. Extract the ZIP's src/ directory first.`);
let source = fs.readFileSync(target, 'utf8');
if (source.includes('<CampaignHero')) {
  console.log('Phase 1 already installed. No duplicate changes were made.');
  process.exit(0);
}
const headerStart = source.indexOf('      <SiteHeader');
const mainStart = source.indexOf('      <main id="main-content">', headerStart);
const heroStart = source.indexOf('<section id="top"', mainStart);
const topicsStart = source.indexOf('        <BookTopicsExplorer', heroStart);
if (headerStart < 0 || mainStart < 0 || heroStart < 0 || topicsStart < 0 ||
  source.slice(headerStart,mainStart).includes('<SiteFooter') ||
  !source.slice(heroStart,topicsStart).includes('</section>') ||
  source.indexOf('<HeroFlipReader',topicsStart) < 0) {
  fail('Could not safely identify the existing header, hero, topics or reader. Your BookLanding.tsx differs from the supported structure.');
}
let proposed = source.slice(0, headerStart) + source.slice(mainStart);
const hs = proposed.indexOf('<section id="top"');
const te = proposed.indexOf('        <BookTopicsExplorer', hs);
proposed = proposed.slice(0, hs) + `<CampaignHero\n          locale={locale}\n          photoIndex={photoIndex}\n          onPhotoSelect={setPhotoIndex}\n          onPhotoMove={galleryMove}\n          onOpenGallery={openGallery}\n          onOpenReader={openReader}\n          onLocaleChange={switchLocale}\n        />\n\n` + proposed.slice(te);
proposed = proposed.replace(/import heroStyles from ['"]@\/components\/EditorialHero\.module\.css['"];?\r?\n/, '');
proposed = proposed.replace(/import \{ SiteHeader, SiteFooter \} from ['"]@\/components\/SiteChrome['"];?/, 'import { SiteFooter } from "@/components/SiteChrome";');
if (!proposed.includes('import CampaignHero')) proposed = proposed.replace(/import HeroFlipReader from "@\/components\/HeroFlipReader";\r?\n/, m => m + 'import CampaignHero from "@/components/CampaignHero";\n');
if (!proposed.includes("@/app/campaign-type.css")) proposed = proposed.replace(/import ['"]@\/app\/hero-smooth-scroll\.css['"];?\r?\n/, m => m + 'import "@/app/campaign-type.css";\n');
if (!proposed.includes('import CampaignHero') || !proposed.includes('campaign-type.css') || proposed.includes('<SiteHeader') || !proposed.includes('<SiteFooter') || !proposed.includes('<BookTopicsExplorer') || !proposed.includes('<HeroFlipReader')) fail('Post-patch checks failed.');
if (dryRun) { console.log('DRY RUN PASS: Phase 1 can be installed safely.'); process.exit(0); }
const backupDir = path.join(root,'.iojh-backups');
fs.mkdirSync(backupDir,{recursive:true});
const stamp = new Date().toISOString().replace(/[:.]/g,'-');
const backup = path.join(backupDir,`BookLanding.before-phase1.${stamp}.tsx`);
fs.copyFileSync(target,backup);
fs.writeFileSync(target,proposed);
console.log('SUCCESS: Phase 1 campaign hero installed.');
console.log(`Backup: ${path.relative(root,backup)}`);
console.log('Next: npm run build');
