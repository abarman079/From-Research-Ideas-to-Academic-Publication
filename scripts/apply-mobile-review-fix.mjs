#!/usr/bin/env node
/**
 * IOJH mobile review card fix + remove duplicated caption beneath author image.
 * Only touches two files. Creates reversible backups, never rewrites unrelated code.
 * Run from project root (or anywhere): node scripts/apply-mobile-review-fix.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = {
  css: path.join(root, 'src/components/ReaderReviews.module.css'),
  author: path.join(root, 'src/components/AuthorAndPurchase.tsx'),
};
const patchPath = path.join(root, 'patches/mobile-review-fix/ReaderReviews.module.css.patch');
const backups = path.join(root, '.iojh-backups/mobile-review-polish-2026-11-03');
const manifestPath = path.join(backups, 'manifest.json');
const begin = '/* IOJH MOBILE & TABLET REVIEW FIX 2026-11-03:BEGIN */';
const caption = /^\s*<p\s+className=\{styles\.portraitCaption\}>\{c\.portraitCaption\}<\/p>[^\S\r\n]*\r?\n/m;
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const read = (p) => fs.readFileSync(p, 'utf8');
const bail = (s) => { console.error('ERROR:', s); process.exit(1); };

const cmd = process.argv[2] ?? 'apply';
if (!['apply', '--dry-run', '--check', '--undo'].includes(cmd)) bail('Use --dry-run, --check, --undo or no argument.');
for (const [label, filename] of Object.entries(files)) {
  if (!fs.existsSync(filename)) bail(`Missing ${label}: ${filename}`);
}
let css = read(files.css);
let author = read(files.author);
const hasCSS = css.includes(begin);
const hasCaption = caption.test(author);

if (cmd === '--check') {
  console.log(`${hasCSS ? 'PASS' : 'FAIL'}: responsive review grid patch`);
  console.log(`${!hasCaption ? 'PASS' : 'FAIL'}: redundant author photo caption removed`);
  if (!hasCSS || hasCaption) process.exitCode = 1;
  process.exit();
}

if (cmd === '--undo') {
  if (!fs.existsSync(manifestPath)) bail(`No backup manifest at ${manifestPath}`);
  const manifest = JSON.parse(read(manifestPath));
  for (const [label, filename] of Object.entries(files)) {
    const stored = path.join(backups, `${label}.original`);
    if (!fs.existsSync(stored)) bail(`Missing backup: ${stored}`);
    if (sha(read(filename)) !== manifest[label].after) {
      bail(`Cannot safely undo ${label}; modified since installer ran. Restore manually from: ${stored}`);
    }
  }
  for (const [label, filename] of Object.entries(files)) fs.copyFileSync(path.join(backups, `${label}.original`), filename);
  console.log('Restored both files from original backups.');
  process.exit();
}

if (!fs.existsSync(patchPath)) bail(`Missing CSS patch: ${patchPath}`);
const patch = read(patchPath).trimEnd();
if (!patch.startsWith(begin)) bail('Patch marker missing.');
const patchCount = css.split(begin).length - 1;
if (patchCount > 1) bail('Duplicate review fix markers detected. Stop and inspect CSS manually.');
let newCSS = css;
if (!hasCSS) newCSS = `${css.replace(/\s*$/, '')}\n\n${patch}\n`;
let newAuthor = author;
if (hasCaption) newAuthor = author.replace(caption, '\n');
if (newCSS === css && newAuthor === author) {
  console.log('Already applied; no changes necessary.');
  process.exit();
}
console.log(`${hasCSS ? 'SKIP' : 'UPDATE'}: ${path.relative(root, files.css)}`);
console.log(`${hasCaption ? 'UPDATE' : 'SKIP'}: ${path.relative(root, files.author)} (photo caption)`);
if (cmd === '--dry-run') {
  console.log('Dry run only. No files modified.');
  process.exit();
}
if (fs.existsSync(manifestPath)) bail('Existing backup manifest found but files differ; refusing to overwrite. Resolve manually.');
fs.mkdirSync(backups, { recursive: true });
for (const [label, filename] of Object.entries(files)) fs.copyFileSync(filename, path.join(backups, `${label}.original`));
const manifest = {
  date: new Date().toISOString(),
  css: { before: sha(css), after: sha(newCSS) },
  author: { before: sha(author), after: sha(newAuthor) },
};
try {
  fs.writeFileSync(files.css, newCSS, 'utf8');
  fs.writeFileSync(files.author, newAuthor, 'utf8');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('PASS: updated reviews layout and removed author photo caption.');
  console.log('Original files backed up to:', path.relative(root, backups));
} catch (err) {
  // Restore both originals to avoid a partially patched working tree.
  for (const [label, filename] of Object.entries(files)) {
    const b = path.join(backups, `${label}.original`);
    if (fs.existsSync(b)) fs.copyFileSync(b, filename);
  }
  console.error(err);
  process.exitCode = 1;
}
