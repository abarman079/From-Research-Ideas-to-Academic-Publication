/**
 * IOJH Premium V3 — mount reviewer section safely.
 * Usage: node scripts/apply-reader-reviews.mjs [--dry-run|--check]
 * Run from repository root after copying the two replacement component files.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'src/components/BookLanding.tsx');
const component = path.join(root, 'src/components/ReaderReviews.tsx');
const css = path.join(root, 'src/components/ReaderReviews.module.css');
const args = new Set(process.argv.slice(2));
function assert(cond, msg) { if (!cond) throw new Error(msg); }

for (const file of [target, component, css]) assert(fs.existsSync(file), `Missing ${path.relative(root,file)}. Copy ZIP files into the project first.`);
let before = fs.readFileSync(target,'utf8');
const oldMount = '{hasApprovedReviews && <ReaderReviews locale={locale} />}';
const newMount = '<ReaderReviews locale={locale} onPreview={(trigger) => openReader(trigger)} />';
const oldFooter = 'hasReviews={hasApprovedReviews}';
const newFooter = 'hasReviews={true}';
const reviewImport = /\r?\nimport \{ reviews \} from ['"]@\/lib\/reviews['"];?/;
const approvedVar = /\r?\n\s*const hasApprovedReviews = reviews\.some\(\(item\) => item\.approved\);/;
const already = before.includes(newMount) && before.includes(newFooter) && !before.includes(oldMount);
if (args.has('--check')) {
  assert(already, 'Reviewer mount is not fully installed. Run node scripts/apply-reader-reviews.mjs.');
  assert(!before.includes('const hasApprovedReviews ='), 'Old review filter still present.');
  console.log('PASS: ReaderReviews always mounted; preview handler connected; finale review link enabled.');
  process.exit(0);
}
if (already) {
  console.log('SKIP: review section already integrated (idempotent).');
  process.exit(0);
}
assert(before.includes(oldMount), 'Expected gated <ReaderReviews> mount not found. Your BookLanding.tsx may differ from the inspected main branch; no changes made.');
assert(before.includes(oldFooter), 'Expected SignatureFinale review link flag not found; no changes made.');
assert(reviewImport.test(before) && approvedVar.test(before), 'Old review filter has changed; no changes made.');
assert(before.includes('import ReaderReviews') && before.includes('import SignatureFinale'), 'Expected components not found; no changes made.');
let after = before.replace(oldMount, newMount).replace(oldFooter, newFooter).replace(reviewImport,'').replace(approvedVar,'');
assert(after !== before && after.includes(newMount) && after.includes(newFooter) && !after.includes(oldMount), 'Patch verification failed.');
if (args.has('--dry-run')) {
  console.log('DRY RUN PASS. Would mount reviews unconditionally, link the 15-page preview, and enable the footer link. No files changed.');
  process.exit(0);
}
const backupDir = path.join(root,'.iojh-backups');
fs.mkdirSync(backupDir,{recursive:true});
const name = `BookLanding.before-review-fix.${new Date().toISOString().replace(/[.:]/g,'-')}.tsx`;
const backup = path.join(backupDir,name);
fs.copyFileSync(target,backup);
const staging = `${target}.iojh-tmp`;
fs.writeFileSync(staging,after,'utf8');
fs.renameSync(staging,target);
console.log('PASS: BookLanding.tsx updated.');
console.log('Backup:',path.relative(root,backup));
console.log('Review photos automatically load from public/reviewers/*.jpg.');
console.log('Current production: unapproved samples remain hidden; local dev displays a clearly labeled demo.');
