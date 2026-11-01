/**
 * IOJH Phase 3 installer — surgical mount of finale + optional conversion signals.
 * Does not change Phase 1/2/2.5 code or existing styles.
 * Usage: node scripts/apply-phase3.mjs [--dry-run|--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src/components/BookLanding.tsx');
const dryRun = process.argv.includes('--dry-run');
const check = process.argv.includes('--check');
const required = [
  'src/components/SignatureFinale.tsx',
  'src/components/SignatureFinale.module.css',
  'src/components/PurchaseIntentEvents.tsx',
];
function fail(reason) { console.error('ERROR:', reason); process.exitCode = 1; }
for (const f of required) if (!fs.existsSync(path.join(root, f))) fail(`Missing ${f}. Copy the ZIP's src/ directory into this project first.`);
if (!fs.existsSync(file)) fail('Run from the project root: src/components/BookLanding.tsx is missing.');
if (process.exitCode) process.exit();

let s = fs.readFileSync(file, 'utf8');
const initial = s;
const importFinale = 'import SignatureFinale from "@/components/SignatureFinale";';
const importSignals = 'import PurchaseIntentEvents from "@/components/PurchaseIntentEvents";';
const mountSignals = '      <PurchaseIntentEvents />';
const mountFinale = '      <SignatureFinale locale={locale} hasReviews={hasApprovedReviews} onPreview={(trigger) => openReader(trigger)} />';
const oldImport = /import\s+\{\s*SiteFooter\s*\}\s+from\s+['"]@\/components\/SiteChrome['"];?/;
const oldFooter = /<SiteFooter\s+locale=\{locale\}\s+hasReviews=\{hasApprovedReviews\}\s+onPreview=\{\(trigger\)\s*=>\s*openReader\(trigger\)\}\s*\/>/;

function replaceExactlyOnce(reg, to, name) {
  const matches = s.match(new RegExp(reg.source, 'g')) || [];
  if (matches.length !== 1) throw new Error(`Cannot locate unique ${name} (${matches.length} matches). No file written.`);
  s = s.replace(reg, to);
}
try {
  const installed = s.includes(importFinale) && s.includes(importSignals) && s.includes(mountFinale) && s.includes(mountSignals);
  if (check) {
    if (installed && !oldImport.test(s) && !oldFooter.test(s)) console.log('PASS: Phase 3 connected; old footer removed; Phase 1/2 intact.');
    else { fail('Phase 3 is not fully installed. Run the installer without --check.'); }
  } else if (installed) {
    console.log('ALREADY INSTALLED: no changes made.');
  } else {
    if (s.includes('SignatureFinale') || s.includes('PurchaseIntentEvents')) throw new Error('Partial Phase 3 installation found. Stop and inspect BookLanding.tsx.');
    replaceExactlyOnce(oldImport, importFinale + '\n' + importSignals, 'SiteFooter import');
    replaceExactlyOnce(oldFooter, mountFinale, 'SiteFooter component');
    const hook = /<SiteActivity\s+locale=\{locale\}\s*\/>/;
    const matches = s.match(new RegExp(hook.source, 'g')) || [];
    if (matches.length !== 1) throw new Error(`Cannot locate SiteActivity mount (${matches.length} matches).`);
    s = s.replace(hook, match => match + '\n' + mountSignals);
    if (dryRun) {
      console.log('DRY-RUN PASS: imports, purchase signals, and finale footer can be patched. No files changed.');
    } else {
      const backupDir = path.join(root,'.iojh-backups');
      fs.mkdirSync(backupDir,{recursive:true});
      const backup = path.join(backupDir,'BookLanding.before-phase3.'+new Date().toISOString().replace(/[:.]/g,'-')+'.tsx');
      fs.copyFileSync(file,backup);
      fs.writeFileSync(file,s,'utf8');
      console.log('APPLIED: new Signature Finale + footer + anonymous purchase-intent signals.');
      console.log('Backup:',backup);
      console.log('Preserved: cinematic hero, sample reader, topic explorer, reviews, author, FAQ, Phase 2.5 motion.');
    }
  }
} catch(error) { fail(error instanceof Error ? error.message : String(error)); }
