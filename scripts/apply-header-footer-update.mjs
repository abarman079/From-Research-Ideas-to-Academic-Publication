import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const file = resolve(root, 'src/components/BookLanding.tsx');
if (!existsSync(file)) {
  console.error('ERROR: Run from the root of the IOJH Next.js project. BookLanding.tsx not found.');
  process.exit(1);
}
let original = readFileSync(file, 'utf8');
if (original.includes('<SiteHeader ') || original.includes('<SiteFooter ')) {
  console.log('ALREADY INSTALLED: SiteHeader / SiteFooter are present. No files changed.');
  process.exit(0);
}
const headerStart = original.indexOf('<header className="site-header">');
const footerStart = original.indexOf('<footer className="site-footer">');
const headerEnd = headerStart >= 0 ? original.indexOf('</header>', headerStart) : -1;
const footerEnd = footerStart >= 0 ? original.indexOf('</footer>', footerStart) : -1;
const importAnchor = /import AuthorAndPurchase from [\"']@\/components\/AuthorAndPurchase[\"'];/;
if ([headerStart,headerEnd,footerStart,footerEnd].some(n => n < 0) || !importAnchor.test(original) || footerStart <= headerEnd) {
  console.error('STOP: Could not safely identify the current header/footer boundaries. No files changed.');
  console.error('Please provide the current BookLanding.tsx so the patch can be adapted without overwriting newer work.');
  process.exit(1);
}
for (const path of ['src/components/SiteChrome.tsx','src/components/SiteChrome.module.css','src/lib/brand.ts']) {
  if (!existsSync(join(root,path))) {
    console.error(`STOP: Missing ${path}. Copy all files from the ZIP before running this script.`);
    process.exit(1);
  }
}
const backupDir = join(root, '.iojh-backups');
mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replaceAll(':','-').replaceAll('.','-');
const backupPath = join(backupDir, `BookLanding-before-chrome-${stamp}.tsx`);
writeFileSync(backupPath, original, 'utf8');
const header = `<SiteHeader
        locale={locale}
        hasReviews={hasApprovedReviews}
        navOpen={navOpen}
        onNavOpenChange={setNavOpen}
        menuButtonRef={mobileMenuButton}
        onPreview={(trigger) => openReader(trigger)}
        onLocaleChange={switchLocale}
      />`;
const footer = `<SiteFooter locale={locale} hasReviews={hasApprovedReviews} onPreview={(trigger) => openReader(trigger)} />`;
let result = original.slice(0, footerStart) + footer + original.slice(footerEnd + '</footer>'.length);
result = result.slice(0, headerStart) + header + result.slice(headerEnd + '</header>'.length);
result = result.replace(importAnchor, (match) => match + '\nimport { SiteHeader, SiteFooter } from "@/components/SiteChrome";');
// The prior header was the only user of the Menu icon. Keep other imports untouched.
if (!result.includes('<Menu ')) result = result.replace(/^\s*Menu,\r?\n/m, '');
writeFileSync(file, result, 'utf8');
const gitignore = join(root, '.gitignore');
if (existsSync(gitignore)) {
  const rules = readFileSync(gitignore, 'utf8');
  if (!rules.includes('.iojh-backups/')) writeFileSync(gitignore, `${rules.trimEnd()}\n\n# Local installation backups\n.iojh-backups/\n`, 'utf8');
}
console.log('SUCCESS: Replaced only the header and footer in BookLanding.tsx.');
console.log(`Backup created: ${backupPath}`);
console.log('Next: add your original logo to public/brand and set IOJH_LOGO_PATH in src/lib/brand.ts.');
console.log('Run npm run dev, then npm run build before committing.');
