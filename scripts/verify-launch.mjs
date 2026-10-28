/** Batch 5 checks — no dependencies, no external requests, no file edits.
 * Run from anywhere: node scripts/verify-launch.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const base = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bookDir = join(
  base,
  "public",
  "books",
  "research-method-manuscript-publication",
);
const imageNames = [
  "hero/cover-main.jpg",
  "gallery/back-cover.jpg",
  "gallery/spine.jpg",
  "gallery/interior.jpg",
  ...Array.from(
    { length: 5 },
    (_, index) => `preview/sample-${String(index + 1).padStart(2, "0")}.jpg`,
  ),
];
let problems = 0;
let warnings = 0;
function logGood(message) {
  console.log(`  PASS  ${message}`);
}
function fail(message) {
  problems++;
  console.error(`  FAIL  ${message}`);
}
function warn(message) {
  warnings++;
  console.warn(`  WARN  ${message}`);
}

console.log("\nIOJH BOOK — BATCH 5 LAUNCH CHECK\n");
for (const relative of imageNames) {
  const file = join(bookDir, relative);
  if (!existsSync(file)) {
    fail(
      `Missing image: public/books/research-method-manuscript-publication/${relative}`,
    );
    continue;
  }
  const bytes = statSync(file).size;
  if (bytes < 10000)
    warn(`Very small image file (${bytes} bytes): ${relative}`);
  else logGood(`Image: ${relative} (${Math.round(bytes / 1024)} KB)`);
  const data = readFileSync(file);
  const jpeg = data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (extname(file).toLowerCase() === ".jpg" && !jpeg)
    fail(`Not a valid JPEG file: ${relative}`);
}
for (const relative of [
  "src/app/(localized)/[locale]/page.tsx",
  "src/app/(localized)/[locale]/layout.tsx",
  "src/app/(redirect)/page.tsx",
  "src/components/BookLanding.tsx",
  "src/app/globals.css",
  "src/i18n/copy.ts",
  "src/lib/book.ts",
  "src/lib/site.ts",
  "src/app/sitemap.ts",
  "src/app/robots.ts",
]) {
  existsSync(join(base, relative))
    ? logGood(`Code: ${relative}`)
    : fail(`Missing code: ${relative}`);
}
function inspectPublicFiles(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) inspectPublicFiles(full);
    if (entry.isFile() && /\.(pdf|docx|zip)$/i.test(entry.name)) {
      fail(
        `Private document/archive may be publicly accessible: ${full.slice(base.length + 1)}`,
      );
    }
  }
}
inspectPublicFiles(bookDir);
if (process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
    if (url.protocol !== "https:")
      warn("NEXT_PUBLIC_SITE_URL should use https:// for production.");
    else logGood(`Canonical origin configured: ${url.origin}`);
  } catch {
    fail("NEXT_PUBLIC_SITE_URL is not a valid URL.");
  }
} else {
  warn(
    "NEXT_PUBLIC_SITE_URL not set. Vercel can use VERCEL_PROJECT_PRODUCTION_URL automatically; confirm metadata on the live site.",
  );
}
if (process.env.SITE_ALLOW_INDEXING === "true") {
  warn(
    "SITE_ALLOW_INDEXING=true: search engines may index the production site. Confirm final launch approval.",
  );
} else {
  logGood(
    "Review mode: search indexing is disabled until SITE_ALLOW_INDEXING=true.",
  );
}
console.log(`\nResult: ${problems} error(s), ${warnings} warning(s).`);
console.log(
  "Also run: npm run build; test /bn, /en, /sitemap.xml and /robots.txt on the deployed domain.\n",
);
process.exitCode = problems ? 1 : 0;
