#!/usr/bin/env node
/**
 * IOJH Premium V3 -> Green brand palette.
 * Surgical, repeat-safe color patch. Does not replace any existing component.
 * Usage:
 *   node scripts/apply-iojh-brand-green.mjs --dry-run
 *   node scripts/apply-iojh-brand-green.mjs
 *   node scripts/apply-iojh-brand-green.mjs --check
 *   node scripts/apply-iojh-brand-green.mjs --undo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const overrides = path.join(root, 'patches');
const START = '/* IOJH BRAND GREEN V4:BEGIN */';
const END = '/* IOJH BRAND GREEN V4:END */';
const files = [
  ['src/app/campaign-type.css', 'campaign-type.css'],
  ['src/components/CampaignHero.module.css', 'CampaignHero.module.css'],
  ['src/components/BookTopicsExplorer.module.css', 'BookTopicsExplorer.module.css'],
  ['src/components/AuthorAndPurchase.module.css', 'AuthorAndPurchase.module.css'],
  ['src/components/ReaderReviews.module.css', 'ReaderReviews.module.css'],
  ['src/components/BookFAQ.module.css', 'BookFAQ.module.css'],
  ['src/components/SignatureFinale.module.css', 'SignatureFinale.module.css'],
];
const topicsFile = 'src/components/BookTopicsExplorer.tsx';
const oldColors = "['#E6C66F', '#F2A7B0', '#B5DAD0', '#D4C3EF', '#9CAFD3', '#F1B58E', '#C7C3A6', '#A5CBE7']";
const newColors = "['#D5E8CE', '#DDEABC', '#B9DCD0', '#E7D6A1', '#BBD5C3', '#D6E9E5', '#D5E1BB', '#AED7C5']";
const oldInk = "'--topic-ink': '#241A26'";
const newInk = "'--topic-ink': '#143224'";
const oldAccent = "'--topic-accent': '#7E2355'";
const newAccent = "'--topic-accent': '#0A6847'";
const args = process.argv.slice(2);
const allowed = ['--dry-run','--check','--undo'];
if(args.length>1 || (args.length===1 && !allowed.includes(args[0]))) {
  console.error('Usage: node scripts/apply-iojh-brand-green.mjs [--dry-run | --check | --undo]');
  process.exit(2);
}
const mode = args[0] || '--apply';
function read(file) {return fs.readFileSync(path.join(root,file),'utf8');}
function removeBlock(text) {
  const begin = text.indexOf(START);
  const end = text.indexOf(END);
  if (begin < 0 && end < 0) return {text,found:false};
  if (begin < 0 || end < 0 || end < begin || text.indexOf(START,begin+START.length)>=0 || text.indexOf(END,end+END.length)>=0) {
    throw new Error('Partial or duplicate green theme markers: refusing unsafe modification');
  }
  return {text:(text.slice(0,begin).trimEnd()+'\n'+text.slice(end+END.length).trimStart()).trimEnd()+'\n',found:true};
}
const changes=[];
for(const [name,patchName] of files) {
  if(!fs.existsSync(path.join(root,name))) throw new Error(`Missing existing stylesheet: ${name}`);
  const original=read(name);
  const base=removeBlock(original);
  const patch=fs.readFileSync(path.join(overrides,patchName),'utf8').trim();
  const next=mode==='--undo' ? base.text : base.text.trimEnd()+`\n\n${START}\n${patch}\n${END}\n`;
  changes.push({name,original,next,applied:base.found});
}
if(!fs.existsSync(path.join(root,topicsFile))) throw new Error('Missing '+topicsFile);
const origTopics=read(topicsFile);
const topicChanged=origTopics.includes(newColors);
if(!origTopics.includes(oldColors) && !topicChanged) {
  throw new Error('Topic palette structure has changed since this package was built. Do not overwrite it; request an updated patch.');
}
if(!origTopics.includes(oldInk) && !origTopics.includes(newInk)) throw new Error('Topic ink property differs from expected structure');
if(!origTopics.includes(oldAccent) && !origTopics.includes(newAccent)) throw new Error('Topic accent property differs from expected structure');
const mapPairs=mode==='--undo' ? [[newColors,oldColors],[newInk,oldInk],[newAccent,oldAccent]] : [[oldColors,newColors],[oldInk,newInk],[oldAccent,newAccent]];
let nextTopics=origTopics;
for(const [oldVal,newVal] of mapPairs) nextTopics=nextTopics.replace(oldVal,newVal);
changes.push({name:topicsFile,original:origTopics,next:nextTopics,applied:topicChanged});

if(mode==='--check') {
 const broken=changes.filter(c=> !c.applied);
 if(broken.length) {console.error('Not fully installed: '+broken.map(c=>c.name).join(', ')); process.exit(1);}
 console.log('PASS: IOJH brand green theme installed in all 8 files.'); process.exit(0);
}
if(mode==='--dry-run') {
 for(const c of changes) console.log(`${c.original===c.next ? 'UNCHANGED' : 'WOULD UPDATE'}  ${c.name}`);
 console.log('Dry run complete; no files changed.'); process.exit(0);
}
const todo=changes.filter(c=>c.original!==c.next);
if(!todo.length) {console.log('Already '+(mode==='--undo'?'removed':'installed')+'; no changes needed.');process.exit(0);}
// Read and validate every target before changing anything. Write backups before applying.
const backupsRoot=path.join(root,'.iojh-backups');
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const backupDir=path.join(backupsRoot,`green-theme-${stamp}`);
fs.mkdirSync(backupDir,{recursive:true});
for(const c of todo){const target=path.join(backupDir,c.name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,c.original,'utf8');}
for(const c of todo) fs.writeFileSync(path.join(root,c.name),c.next,'utf8');
for(const c of todo) console.log(`${mode==='--undo'?'RESTORED':'UPDATED'}  ${c.name}`);
console.log('Backup created: '+path.relative(root,backupDir));
console.log(mode==='--undo'?'Brand green override removed.':'Brand green theme installed. Run npm run build and inspect both locales.');
