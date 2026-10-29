/**
 * Safe, repeatable launch-readiness integration for the current IOJH website.
 * Patches ONLY FAQ integration, site activity, approved-book metadata, and
 * analytics pageview activation. It never replaces the hero/reader or theme CSS.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = p => path.join(root, p);
const required = [
  'src/components/BookLanding.tsx',
  'src/components/BookFAQ.tsx',
  'src/components/BookFAQ.module.css',
  'src/lib/faqContent.ts',
  'src/lib/book.ts',
  'src/app/(localized)/[locale]/layout.tsx',
  'src/app/(localized)/[locale]/page.tsx',
  'src/components/SiteActivity.tsx',
];
const missing = required.filter(p => !fs.existsSync(target(p)));
if (missing.length) {
  console.error('Missing required project files:\n' + missing.map(p => ` - ${p}`).join('\n'));
  console.error('Copy the package files into the project and confirm you are in the correct project root.');
  process.exit(1);
}
const read = p => fs.readFileSync(target(p), 'utf8');
const source = {
  landing: read('src/components/BookLanding.tsx'),
  layout: read('src/app/(localized)/[locale]/layout.tsx'),
  page: read('src/app/(localized)/[locale]/page.tsx'),
  book: read('src/lib/book.ts'),
};
const original = { ...source };
function assert(check, message) {
  if (!check) throw new Error(message + ' No project files were changed.');
}
function addImport(s, spec, afterAnchor) {
  if (s.includes(spec)) return s;
  const idx = s.indexOf(afterAnchor);
  assert(idx !== -1, `Could not locate import insertion point: ${afterAnchor}`);
  const lineEnd = s.indexOf('\n', idx);
  return s.slice(0, lineEnd + 1) + spec + '\n' + s.slice(lineEnd + 1);
}
try {
  // Reuse the FAQ design already present in the user's GitHub repo.
  source.landing = addImport(source.landing,
    "import BookFAQ from '@/components/BookFAQ';",
    'import BookTopicsExplorer');
  source.landing = addImport(source.landing,
    "import SiteActivity from '@/components/SiteActivity';",
    "import BookFAQ from '@/components/BookFAQ';");

  if (!source.landing.includes('<BookFAQ locale={locale} />')) {
    const start = source.landing.indexOf('<section id="faq"');
    assert(start !== -1, 'The original FAQ section was not found');
    const end = source.landing.indexOf('</section>', start);
    assert(end !== -1, 'FAQ closing tag missing');
    const block = source.landing.slice(start, end + '</section>'.length);
    assert(block.includes('faq-list') && block.includes('faq-grid'),
      'FAQ layout differs from the expected source (manual merge needed)');
    source.landing = source.landing.slice(0, start) + '<BookFAQ locale={locale} />' + source.landing.slice(end + '</section>'.length);
  }

  if (!source.landing.includes('<SiteActivity locale={locale} />')) {
    const pos = source.landing.indexOf('<SmoothPageScroll ');
    assert(pos !== -1, 'SmoothPageScroll placement not found');
    const end = source.landing.indexOf('/>', pos);
    assert(end !== -1, 'SmoothPageScroll tag terminator missing');
    source.landing = source.landing.slice(0, end + 2) + '\n      <SiteActivity locale={locale} />' + source.landing.slice(end + 2);
  }

  if (!source.landing.includes("window.dispatchEvent(new Event('iojh:sample-open'))")) {
    const rx = /(const openReader\s*=\s*\(trigger\?: HTMLElement\)\s*=>\s*\{)/;
    assert(rx.test(source.landing), 'Could not find book reader opening callback');
    source.landing = source.landing.replace(rx, "$1\n    window.dispatchEvent(new Event('iojh:sample-open'));");
  }

  // Enable anonymous Vercel pageview analytics. The dashboard setting still
  // needs to be switched on by the project owner.
  source.layout = addImport(source.layout,
    "import { Analytics } from '@vercel/analytics/next';",
    "import type { ReactNode } from 'react';");
  if (!source.layout.includes('<Analytics />')) {
    assert(/<body>\{children\}<\/body>/.test(source.layout), 'Root layout body pattern changed');
    source.layout = source.layout.replace('<body>{children}</body>', '<body>{children}<Analytics /></body>');
  }

  // Use a proper 1200x630 social-sharing picture generated from the exact book.
  const social = 'const imageUrl = `${siteUrl}/opengraph-image.jpg`;';
  if (!source.page.includes(social)) {
    assert(source.page.includes('const imageUrl = `${siteUrl}${gallery[0].src}`;'),
      'Could not find the old metadata social-image URL');
    source.page = source.page.replace('const imageUrl = `${siteUrl}${gallery[0].src}`;', social);
  }
  source.page = source.page.replace(/\bnumberOfPages:\s*book\.pageCount\s*,\s*/g, '');
  if (!source.page.includes('images: [') || !source.page.includes('const imageUrl')) {
    throw new Error('Page metadata did not pass the post-change sanity check.');
  }
  // Remove unverified page count from source data until the final printed
  // edition has been confirmed. The site currently doesn't display it.
  source.book = source.book.replace(/\bpageCount:\s*\d+\s*,\s*/g, '');
  assert(!source.page.includes('book.pageCount'), 'Unverified book page count reference still in structured data');

  // Calculate/validate ALL changes before writing anything.
  assert(source.landing.includes('<BookFAQ locale={locale} />'), 'FAQ update missing');
  assert(source.landing.includes('<SiteActivity locale={locale} />'), 'Activity hook update missing');
  assert(source.layout.includes('<Analytics />'), 'Analytics component missing');
  assert(source.page.includes('opengraph-image.jpg'), 'Social metadata reference missing');
} catch (error) {
  console.error('STOPPED: ' + error.message);
  process.exit(1);
}

const changes = [
  ['src/components/BookLanding.tsx', 'landing'],
  ['src/app/(localized)/[locale]/layout.tsx', 'layout'],
  ['src/app/(localized)/[locale]/page.tsx', 'page'],
  ['src/lib/book.ts', 'book'],
].filter(([, key]) => source[key] !== original[key]);

if (!changes.length) {
  console.log('Already applied. No source files needed changes.');
} else {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = target(`.iojh-backups/launch-readiness-${timestamp}`);
  for (const [file] of changes) {
    const destination = path.join(backupDir, file);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(target(file), destination);
  }
  console.log('Backup saved at ' + path.relative(root, backupDir));
  for (const [file, key] of changes) {
    fs.writeFileSync(target(file), source[key], 'utf8');
    console.log('UPDATED ' + file);
  }
}

const ignoreFile = target('.gitignore');
const ignoreText = fs.existsSync(ignoreFile) ? fs.readFileSync(ignoreFile, 'utf8') : '';
if (!ignoreText.split(/\r?\n/).includes('.iojh-backups/')) {
  fs.appendFileSync(ignoreFile, '\n# Local restoration copies (do not commit)\n.iojh-backups/\n');
}
console.log('DONE. Next: node scripts/generate-brand-assets.mjs; npm run build');
