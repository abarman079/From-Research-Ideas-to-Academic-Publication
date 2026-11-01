/**
 * IOJH V3 — Phase 2.5, motion-only integration.
 * Run in the root of iojh-book-landing.
 * Flags: --dry-run (no write), default (back up and patch), --check (verify).
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src', 'components', 'BookLanding.tsx');
const dryRun = process.argv.includes('--dry-run');
const check = process.argv.includes('--check');
const required = [
  'src/components/EditorialMotion.tsx',
  'src/components/ReaderReviews.tsx',
  'src/components/ReaderReviews.module.css',
  'src/app/editorial-motion.css',
];

function die(message) { console.error('ERROR:', message); process.exitCode = 1; }
for (const f of required) {
  if (!fs.existsSync(path.join(root, f))) {
    die(`Missing ${f}. Copy the ZIP files to the matching project folders first.`);
  }
}
if (process.exitCode) process.exit();
if (!fs.existsSync(file)) { die('Cannot find src/components/BookLanding.tsx. Run from the project root.'); process.exit(); }

let code = fs.readFileSync(file, 'utf8');
const original = code;
const motionImport = 'import EditorialMotion from "@/components/EditorialMotion";';
const cssImport = 'import "@/app/editorial-motion.css";';
const mount = '      <EditorialMotion locale={locale} />';
const importAnchor = /import SmoothPageScroll from ['"]@\/components\/SmoothPageScroll['"];?/;
const cssAnchor = /import ['"]@\/app\/campaign-type\.css['"];?/;
const mountAnchor = /<SmoothPageScroll\s+paused=\{readerOpen\s*\|\|\s*lightboxOpen\}\s*\/>/;

function insertAfter(regex, insert, label) {
  if (code.includes(insert)) return;
  const matches = [...code.matchAll(new RegExp(regex.source, 'g'))];
  if (matches.length !== 1) throw new Error(`Cannot safely find the unique ${label} anchor (found ${matches.length}). No files were changed.`);
  code = code.replace(regex, match => match + '\n' + insert);
}

try {
  if (check) {
    const okay = [motionImport, cssImport, mount].every(x => code.includes(x));
    console.log(okay ? 'PASS: Phase 2.5 motion is connected.' : 'NOT INSTALLED: Motion imports or component mount missing.');
    if (!okay) process.exitCode = 1;
  } else {
    insertAfter(importAnchor, motionImport, 'SmoothPageScroll import');
    insertAfter(cssAnchor, cssImport, 'campaign-type.css import');
    insertAfter(mountAnchor, mount, 'SmoothPageScroll component');
    if (code === original) {
      console.log('ALREADY INSTALLED: BookLanding.tsx is unchanged.');
    } else if (dryRun) {
      console.log('DRY RUN PASS: All three integration points are valid. No files changed.');
    } else {
      const backupDir = path.join(root, '.iojh-backups');
      fs.mkdirSync(backupDir, { recursive: true });
      const backup = path.join(backupDir, 'BookLanding.before-phase2-5.' + new Date().toISOString().replace(/[:.]/g, '-') + '.tsx');
      fs.copyFileSync(file, backup);
      fs.writeFileSync(file, code, 'utf8');
      console.log('APPLIED: Added the Phase 2.5 motion controller.');
      console.log('Backup:', backup);
    }
    console.log('Preserved: Phase 1 hero, Lenis setup, reader, topic dialogs, and current page sections.');
  }
} catch (err) {
  die(err instanceof Error ? err.message : String(err));
}
