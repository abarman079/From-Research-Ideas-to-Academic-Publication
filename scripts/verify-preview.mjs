/** Run before deploying the PDF sample. Prevent accidental publication of the entire book. */
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node scripts/verify-preview.mjs "public/books/research-method-manuscript-publication/preview/your-filename.pdf"');
  process.exit(1);
}
const path = resolve(filename);
const info = await stat(path);
if (info.size > 20 * 1024 * 1024) {
  console.warn('Warning: the sample PDF is larger than 20 MB. Compress it for mobile visitors.');
}
const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
const bytes = new Uint8Array(await readFile(path));
const task = getDocument({ data: bytes });
const pdf = await task.promise;
console.log(`Sample file: ${path}`);
console.log(`Pages in file: ${pdf.numPages}`);
if (pdf.numPages !== 15) {
  console.error('BLOCKED: The public PDF must contain exactly 15 approved pages. Never place your full manuscript under public/.');
  await task.destroy();
  process.exit(2);
}
console.log('PASS: 15-page count. Manually inspect every page for approval and private content before publishing.');
await task.destroy();
