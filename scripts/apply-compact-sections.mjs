#!/usr/bin/env node
/**
 * IOJH section density adjustment, CSS-only and repeatable.
 * Usage:
 *   node scripts/apply-compact-sections.mjs --dry-run
 *   node scripts/apply-compact-sections.mjs
 *   node scripts/apply-compact-sections.mjs --check
 *   node scripts/apply-compact-sections.mjs --undo
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jobs = [
  ['ReaderReviews.module.css', ['.section', '.reviewCard', '.introRow']],
  ['AuthorAndPurchase.module.css', ['.section', '.authorCard', '.purchasePanel']],
  ['SignatureFinale.module.css', ['.finale', '.footer', '.typographicBrand']],
];
const flags = new Set(process.argv.slice(2));
const modes = ['--dry-run', '--check', '--undo'].filter((flag) => flags.has(flag));
if (modes.length > 1 || [...flags].some((flag) => !['--dry-run', '--check', '--undo'].includes(flag))) {
  console.error('Usage: node scripts/apply-compact-sections.mjs [--dry-run | --check | --undo]');
  process.exit(2);
}
const mode = modes[0] || '--apply';
const normalize = (str) => str.replace(/\r\n/g, '\n');
const tasks = [];

for (const [name, anchors] of jobs) {
  const target = path.join(root, 'src', 'components', name);
  const patchFile = path.join(root, 'patches', 'compact-sections', `${name}.patch`);
  let css, patch;
  try {
    css = await readFile(target, 'utf8');
    patch = await readFile(patchFile, 'utf8');
  } catch (err) {
    console.error(`Missing required file for ${name}: ${err.message}`);
    process.exit(1);
  }
  if (!anchors.every((v) => css.includes(v))) {
    console.error(`Refusing to alter unexpected stylesheet ${target}; missing expected CSS selectors.`);
    process.exit(1);
  }
  const start = `/* IOJH COMPACT SECTIONS 2026 ${name}:BEGIN */`;
  const end = `/* IOJH COMPACT SECTIONS 2026 ${name}:END */`;
  const canonical = normalize(css);
  const occurrences = (marker) => canonical.split(marker).length - 1;
  if (occurrences(start) !== occurrences(end) || occurrences(start) > 1) {
    console.error(`Partial/duplicate compact patch detected in ${name}. No files were changed.`);
    process.exit(1);
  }
  const installed = occurrences(start) === 1;
  const block = `${start}\n${normalize(patch).trimEnd()}\n${end}`;
  const begin = canonical.indexOf(start);
  const finish = installed ? canonical.indexOf(end, begin + start.length) : -1;
  if (installed && finish < begin) {
    console.error(`Broken marker order in ${name}. No files were changed.`);
    process.exit(1);
  }
  const existingBlock = installed ? canonical.slice(begin, finish + end.length) : null;
  if (mode === '--check') {
    console.log(`${installed && existingBlock === block ? 'PASS' : 'FAIL'} ${name}: ${installed ? 'patch present' : 'patch missing'}${installed && existingBlock !== block ? ' (contents differ)' : ''}`);
    if (!installed || existingBlock !== block) process.exitCode = 1;
    continue;
  }
  let updated;
  if (mode === '--undo') {
    if (!installed) { console.log(`SKIP ${name}: no compact patch`); continue; }
    updated = canonical.slice(0, begin).replace(/\n\n$/, '\n') + canonical.slice(finish + end.length).replace(/^\n?/, '');
  } else {
    if (installed && existingBlock === block) { console.log(`SKIP ${name}: already up to date`); continue; }
    if (installed) {
      updated = canonical.slice(0, begin) + block + canonical.slice(finish + end.length);
    } else {
      updated = canonical.trimEnd() + '\n\n' + block + '\n';
    }
  }
  const crlf = css.includes('\r\n');
  if (crlf) updated = updated.replace(/\n/g, '\r\n');
  if (mode === '--dry-run') {
    console.log(`DRY RUN ${name}: ${installed ? 'update existing patch' : 'append compact patch'}`);
  } else {
    tasks.push({ name, target, before: css, after: updated });
  }
}
if (mode === '--check') {
  if (!process.exitCode) console.log('All three sections have the expected compact layout patch.');
  process.exit();
}
if (mode === '--dry-run') {
  console.log('Dry run complete. No source files changed.');
  process.exit();
}
if (!tasks.length) {
  console.log('No changes required.');
  process.exit();
}
const backupDir = path.join(root, '.iojh-backups', `compact-sections-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(backupDir, { recursive: true });
for (const job of tasks) {
  await writeFile(path.join(backupDir, job.name), job.before, 'utf8');
}
for (const job of tasks) {
  await writeFile(job.target, job.after, 'utf8');
  console.log(`${mode === '--undo' ? 'UNDO' : 'UPDATED'} ${job.name}`);
}
console.log(`Original files backed up to: ${backupDir}`);
console.log(mode === '--undo' ? 'Undo complete. Re-run npm run build.' : 'Done. Run npm run build and test /en and /bn on desktop and mobile.');
