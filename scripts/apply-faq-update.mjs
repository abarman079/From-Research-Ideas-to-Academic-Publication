/** Apply a targeted FAQ update without overwriting the current landing page. */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src', 'components', 'BookLanding.tsx');

if (!fs.existsSync(target)) {
  console.error(`ERROR: Cannot find ${target}. Run this in the root of your Next.js project.`);
  process.exit(1);
}

const original = fs.readFileSync(target, 'utf8');
const importLine = "import BookFAQ from '@/components/BookFAQ';";
const hasNewSection = original.includes('<BookFAQ locale={locale} />');

if (hasNewSection) {
  console.log('ALREADY INSTALLED: BookFAQ is already rendered in BookLanding.tsx. No changes made.');
  process.exit(0);
}

const oldSection = /[ \t]*<section\s+id=["']faq["']\s+className=["']section faq-section["']\s*>[\s\S]*?<\/section>(?=\s*<\/main>)/g;
const matches = [...original.matchAll(oldSection)];

if (matches.length !== 1) {
  console.error(`ERROR: Expected exactly one original FAQ section; found ${matches.length}.`);
  console.error('No files were changed. Please share the FAQ portion of BookLanding.tsx.');
  process.exit(1);
}

if (!original.includes('export default function BookLanding(')) {
  console.error('ERROR: Unexpected BookLanding.tsx structure; no changes made.');
  process.exit(1);
}

if (!original.includes(importLine) && !original.includes("from '@/components/AuthorAndPurchase'" ) && !original.includes('from "@/components/AuthorAndPurchase"')) {
  console.error('ERROR: Could not identify the component imports safely. No changes made.');
  process.exit(1);
}

const insertion = '        <BookFAQ locale={locale} />';
let updated = original.replace(oldSection, insertion);
if (!updated.includes(importLine)) {
  const anchor = /import AuthorAndPurchase from ["']@\/components\/AuthorAndPurchase["'];/;
  if (!anchor.test(updated)) {
    console.error('ERROR: Could not add BookFAQ import. No changes made.');
    process.exit(1);
  }
  updated = updated.replace(anchor, (line) => `${line}\n${importLine}`);
}
if (!updated.includes(insertion) || updated === original) {
  console.error('ERROR: Update validation failed; no changes made.');
  process.exit(1);
}

// Store backup outside the Git repo so git add . cannot include it accidentally.
const backupDir = path.resolve(root, '..', 'IOJH-backups');
fs.mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `BookLanding-before-faq-${stamp}.tsx`);
fs.writeFileSync(backupFile, original, 'utf8');
fs.writeFileSync(target, updated, 'utf8');
console.log('SUCCESS: Replaced only the FAQ section in src/components/BookLanding.tsx');
console.log(`Backup: ${backupFile}`);
console.log('Added import: BookFAQ');
console.log('Next: npm run dev, test /en#faq and /bn#faq, then npm run build.');
