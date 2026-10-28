/**
 * IOJH targeted update. Run from project root:
 * node scripts/apply-topics-update.mjs
 * This preserves all other website sections and makes a local backup.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'src', 'components', 'BookLanding.tsx');
const requiredFiles = [
  'src/components/BookTopicsExplorer.tsx',
  'src/components/BookTopicsExplorer.module.css',
  'src/lib/bookTopics.ts',
];
for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) {
    console.error(`MISSING: ${relative}\nCopy the three new files before running this script.`);
    process.exit(1);
  }
}
if (!fs.existsSync(file)) { console.error('Cannot find src/components/BookLanding.tsx. Run from your project root.'); process.exit(1); }
let source = fs.readFileSync(file, 'utf8');
if (source.includes('<BookTopicsExplorer locale={locale} />')) {
  console.log('Already updated. No changes needed.');
  process.exit(0);
}
// We match both the section ID and the next known component to avoid modifying
// author, testimonials, hero, gallery, reader or purchase components.
const section = /(^[ \t]*)<section\s+id="inside"[\s\S]*?\n\1<\/section>(?=\s*\{hasApprovedReviews)/m;
const multilineSection = /(^[ \t]*)<section\s*\n\s*id="inside"[\s\S]*?\n\1<\/section>(?=\s*\{hasApprovedReviews)/m;
const match = source.match(section) || source.match(multilineSection);
if (!match) {
  console.error('Safety stop: unable to find the original Inside the Book section exactly. No files were changed.');
  console.error('Please share src/components/BookLanding.tsx so the patch can be adapted to your version.');
  process.exit(1);
}
const original = source;
const indent = match[1];
source = source.replace(match[0], `${indent}<BookTopicsExplorer locale={locale} />`);
// Remove obsolete data/filtering used exclusively by the old eight cards.
source = source.replace(/type TopicFilter = [^\n]+\nconst TOPIC_GROUPS = \[[\s\S]*?\] as const;\n\n/, '');
source = source.replace(/^\s*const \[topicFilter, setTopicFilter\] = useState<TopicFilter>\(["\']all["\']\);\n/m, '\n');
source = source.replace(/\n  const visibleTopics = t\.contents\.topics[\s\S]*?\.filter\(\(item\) => topicFilter === ["\']all["\'] \|\| item\.group === topicFilter\);\n/, '\n');
// Insert the new component import by a stable neighboring import.
const importAnchor = /import AuthorAndPurchase from ["\']@\/components\/AuthorAndPurchase["\'];/;
if (!importAnchor.test(source)) {
  console.error('Safety stop: import anchor changed. No files were changed.');
  process.exit(1);
}
source = source.replace(importAnchor, match => `${match}\nimport BookTopicsExplorer from "@/components/BookTopicsExplorer";`);
const backupDir = path.join(root, '.iojh-backups');
fs.mkdirSync(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `BookLanding-before-topics-${Date.now()}.tsx`);
fs.writeFileSync(backupFile, original);
fs.writeFileSync(file, source);
const gitignore = path.join(root, '.gitignore');
if (fs.existsSync(gitignore)) {
  const ignore = fs.readFileSync(gitignore,'utf8');
  if (!ignore.includes('.iojh-backups')) fs.appendFileSync(gitignore, '\n# Local copies made by the IOJH topic-section installer\n/.iojh-backups/\n');
}
console.log('SUCCESS: Inside the Book section updated.');
console.log('Backup stored at', backupFile);
console.log('Other sections were preserved.');
