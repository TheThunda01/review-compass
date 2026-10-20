import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createSearchRecord} from '../review-compass-showcase/src/searchRecord.mjs';
const metadata={recordId:'demo',database:'MEDLINE',platform:'PubMed',searchDate:'2026-10-20',executionStatus:'reported_executed',resultCount:0,limits:'None reported'};
const fp={querySha256:'a'.repeat(64),metadataSha256:'b'.repeat(64)};

test('zero and unknown counts remain distinct, with reported execution semantics',()=>{
  assert.equal(createSearchRecord(metadata,'cell',fp).recordedMetadata.resultCount,0);
  const unknown=createSearchRecord({...metadata,resultCount:null},'cell',fp);
  assert.equal(unknown.recordedMetadata.resultCount,null);assert.match(unknown.interpretation,/did not execute/);
});
test('drafts cannot carry retrieval counts, invalid dates and misspelled fields fail',()=>{
  for(const change of [{executionStatus:'draft'},{resultCount:-1},{resultCount:1.5},{searchDate:'2026-02-30'},{database:' '},{extra:true}]) {
    assert.throws(()=>createSearchRecord({...metadata,...change},'cell',fp));
  }
});
test('record preserves exact text including Unicode and structural findings',()=>{
  const q='\uFEFF(🧬 cell';const r=createSearchRecord(metadata,q,fp);
  assert.equal(r.queryText,q);assert.ok(r.structuralAudit.issues.some(x=>x.code==='UNCLOSED_DELIMITER'));
});
test('input fingerprints and required fields are validated',()=>{
  assert.throws(()=>createSearchRecord(metadata,'cell',{...fp,querySha256:'x'}));
  const {platform,...missing}=metadata;assert.throws(()=>createSearchRecord(missing,'cell',fp));
  assert.throws(()=>createSearchRecord(metadata,' ',fp));
});
test('CLI hashes original bytes, refuses overwrite, and records a flawed query without executing it',()=>{
  const dir=mkdtempSync(join(tmpdir(),'search-record-'));const q=join(dir,'q.txt'),m=join(dir,'m.json'),out=join(dir,'record.json');
  const run=(...args)=>spawnSync(process.execPath,['tools/record-search.mjs',...args],{encoding:'utf8'});
  try {
    const raw=Buffer.from('\uFEFF(cell OR yeast');writeFileSync(q,raw);writeFileSync(m,JSON.stringify(metadata));
    const args=['--query',q,'--metadata',m,'--output',out];const p=run(...args);assert.equal(p.status,0,p.stderr);
    const r=JSON.parse(readFileSync(out,'utf8'));assert.equal(r.sourceFingerprints.querySha256,createHash('sha256').update(raw).digest('hex'));
    assert.equal(r.queryText,'\uFEFF(cell OR yeast');assert.equal(r.structuralAudit.manualReviewRequired,true);
    assert.equal(run(...args).status,2);assert.equal(run('--query',q,'--metadata',m,'--output',q).status,2);
    writeFileSync(q,Buffer.from([255]));assert.equal(run('--query',q,'--metadata',m).status,2);
  } finally {rmSync(dir,{recursive:true});}
});
