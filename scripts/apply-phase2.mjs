#!/usr/bin/env node
/** Safe, repeatable Phase 2 integration. Patches exactly one line, never replaces the hero. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src/components/BookLanding.tsx');
const dryRun = process.argv.includes('--dry-run');
const oldLine = '<BookTopicsExplorer locale={locale} />';
const newLine = '<BookTopicsExplorer locale={locale} onPreview={(trigger) => openReader(trigger)} />';
const required = [
  'src/components/BookTopicsExplorer.tsx',
  'src/components/BookTopicsExplorer.module.css',
  'src/components/AuthorAndPurchase.module.css',
  'src/components/ReaderReviews.tsx',
  'src/components/ReaderReviews.module.css',
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) {
    console.error(`Missing: ${file}. Copy the Phase 2 files into the project before running the installer.`);
    process.exit(1);
  }
}
if (!fs.existsSync(target)) { console.error('BookLanding.tsx not found: run from your project root.'); process.exit(1); }
const content = fs.readFileSync(target, 'utf8');
if (!content.includes('const openReader =') || !content.includes('from "@/components/BookTopicsExplorer"')) {
  console.error('Your BookLanding.tsx structure differs from the inspected version. No files modified.');
  process.exit(1);
}
if (content.includes(newLine)) {
  console.log('ALREADY APPLIED: Phase 2 sample-reader connection is installed.');
  process.exit(0);
}
if (content.split(oldLine).length !== 2) {
  console.error('Expected the exact existing BookTopicsExplorer element once. No files modified.');
  process.exit(1);
}
if (dryRun) {
  console.log('DRY RUN PASS: can connect topic-section CTA to existing 15-page reader.');
  console.log('No files modified.');
  process.exit(0);
}
const backupDir = path.join(root, '.iojh-backups');
fs.mkdirSync(backupDir, { recursive: true });
const backupName = `BookLanding.phase2.${new Date().toISOString().replace(/[:.]/g,'-')}.tsx`;
fs.copyFileSync(target, path.join(backupDir, backupName));
fs.writeFileSync(target, content.replace(oldLine, newLine), 'utf8');
console.log('SUCCESS: Phase 2 integrated without changing the approved Phase 1 hero.');
console.log(`Backup: .iojh-backups/${backupName}`);
