import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const reviewsFile=path.join(root,'src/lib/reviews.ts');
const pageFile=path.join(root,'src/components/BookLanding.tsx');
const names=['sifatul-haque','sanjida-rahman','fiona-chy','shahin-ali','ashraful'];
const src=fs.readFileSync(reviewsFile,'utf8');
const page=fs.readFileSync(pageFile,'utf8');
let failed=false;
function report(ok,msg){console.log(`${ok?'PASS':'FAIL'} ${msg}`);if(!ok)failed=true;}
report(page.includes('<ReaderReviews locale={locale} onPreview={(trigger) => openReader(trigger)} />'),'ReaderReviews section is mounted in the page');
report(page.includes('hasReviews={true}'),'Final footer links to the reviews section');
for(const name of names){
 const img=path.join(root,'public/reviewers',name+'.jpg');
 report(fs.existsSync(img),`${name}.jpg exists`);
 report(src.includes(`/reviewers/${name}.jpg`),`${name} photo is configured in src/lib/reviews.ts`);
}
const approved=(src.match(/approved:\s*true/g)||[]).length;
console.log(`INFO ${approved} entries marked approved in reviews.ts. These must be real, reviewer-authorized comments and ratings before production.`);
console.log('INFO Production will not render unapproved sample quotes, photos or ratings as testimonials.');
if(failed)process.exitCode=1;
