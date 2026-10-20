import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createSearchRecord, linkRevision} from '../review-compass-showcase/src/searchRecord.mjs';

const meta={recordId:'first',database:'Example',platform:'Example',searchDate:'2026-10-20',executionStatus:'draft',resultCount:null,limits:'Example only'};
const fp={querySha256:createHash('sha256').update('cell').digest('hex'),metadataSha256:'b'.repeat(64)};
const prior=()=>createSearchRecord(meta,'cell',fp);
const next=()=>createSearchRecord({...meta,recordId:'second'},'cell OR yeast',fp);

test('optional revision retains operator semantics and does not mutate predecessor',()=>{
  const old=prior(),before=JSON.stringify(old),record=linkRevision(next(),old,'c'.repeat(64),'  Broaden example terms.  ');
  assert.equal(record.revision.predecessorRecordId,'first');
  assert.equal(record.revision.predecessorSha256,'c'.repeat(64));
  assert.equal(record.revision.reason,'Broaden example terms.');
  assert.equal(record.recordedMetadata.executionStatus,'draft');
  assert.equal(record.recordedMetadata.resultCount,null);
  assert.equal(JSON.stringify(old),before);assert.equal(Object.hasOwn(old,'revision'),false);
});

test('revision rejects reused IDs, unsupported records, blank reasons and malformed linkage',()=>{
  assert.throws(()=>linkRevision(prior(),prior(),'c'.repeat(64),'x'),/new recordId/);
  for (const [old,digest,reason] of [[{},'c'.repeat(64),'x'],[prior(),'no','x'],[prior(),'c'.repeat(64),' '],[{...prior(),revision:null},'c'.repeat(64),'x']]) {
    assert.throws(()=>linkRevision(next(),old,digest,reason));
  }
  const second=linkRevision(next(),prior(),'c'.repeat(64),'Second version');
  assert.throws(()=>linkRevision(prior(),second,'d'.repeat(64),'Reusing earlier ID'),/ancestor/);
});

test('CLI revision hashes exact predecessor bytes, requires a fresh output, and preserves input files',()=>{
  const dir=mkdtempSync(join(tmpdir(),'review-revision-'));
  try {
    const q=join(dir,'q.txt'),m=join(dir,'meta.json'),p=join(dir,'prior.json'),out=join(dir,'next.json');
    writeFileSync(q,'cell OR yeast');writeFileSync(m,JSON.stringify({...meta,recordId:'second'}));
    const bytes=Buffer.from(JSON.stringify(prior(),null,2)+'\n');writeFileSync(p,bytes);
    const run=(...args)=>spawnSync(process.execPath,['tools/record-search.mjs','--query',q,'--metadata',m,...args],{encoding:'utf8'});
    const flags=['--predecessor',p,'--reason','Added a synonym'];
    assert.equal(run(...flags).status,2);
    assert.equal(run('--predecessor',p,'--output',out).status,2);
    assert.equal(run('--reason','x','--output',out).status,2);
    const ok=run(...flags,'--output',out);assert.equal(ok.status,0,ok.stderr);
    const r=JSON.parse(readFileSync(out,'utf8'));
    assert.equal(r.revision.predecessorSha256,createHash('sha256').update(bytes).digest('hex'));
    assert.deepEqual(readFileSync(p),bytes);
    assert.equal(run(...flags,'--output',out).status,2);
    assert.equal(run(...flags,'--output',p).status,2);
    assert.deepEqual(readFileSync(p),bytes);
  } finally {rmSync(dir,{recursive:true});}
});

test('CLI fails without partial output for an invalid predecessor',()=>{
  const dir=mkdtempSync(join(tmpdir(),'review-revision-'));
  try {
    const q=join(dir,'q'),m=join(dir,'m'),p=join(dir,'p'),out=join(dir,'out');
    writeFileSync(q,'cell');writeFileSync(m,JSON.stringify({...meta,recordId:'next'}));writeFileSync(p,'{}');
    const r=spawnSync(process.execPath,['tools/record-search.mjs','--query',q,'--metadata',m,'--predecessor',p,'--reason','x','--output',out],{encoding:'utf8'});
    assert.equal(r.status,2);assert.equal(r.stdout,'');assert.throws(()=>readFileSync(out));
  } finally {rmSync(dir,{recursive:true});}
});

test('CLI rejects predecessor text changed without updating its query fingerprint',()=>{
  const dir=mkdtempSync(join(tmpdir(),'review-revision-'));
  try {
    const q=join(dir,'q'),m=join(dir,'m'),p=join(dir,'p'),out=join(dir,'out');
    writeFileSync(q,'cell');writeFileSync(m,JSON.stringify({...meta,recordId:'next'}));
    writeFileSync(p,JSON.stringify({...prior(),queryText:'changed query'}));
    const r=spawnSync(process.execPath,['tools/record-search.mjs','--query',q,'--metadata',m,'--predecessor',p,'--reason','x','--output',out],{encoding:'utf8'});
    assert.equal(r.status,2);assert.match(r.stderr,/query text does not match/);assert.equal(r.stdout,'');assert.throws(()=>readFileSync(out));
  } finally {rmSync(dir,{recursive:true});}
});
