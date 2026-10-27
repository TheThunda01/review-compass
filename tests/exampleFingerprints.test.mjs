import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const directory = new URL('../examples/', import.meta.url);
const bytes = name => readFileSync(new URL(name, directory));
const json = name => JSON.parse(bytes(name).toString('utf8'));
const digest = input => createHash('sha256').update(input).digest('hex');

test('committed structural audit identifies the exact query bytes', () => {
  const audit = json('search-audit.json');
  assert.equal(audit.inputSha256, digest(bytes(audit.inputFile)));
});

test('committed search records retain exact query and metadata fingerprints', () => {
  for (const name of ['search-record.json', 'search-revision.json']) {
    const record = json(name), source = record.sourceFingerprints;
    assert.equal(source.querySha256, digest(bytes(source.queryFile)), `${name}: query bytes`);
    assert.equal(source.metadataSha256, digest(bytes(source.metadataFile)), `${name}: metadata bytes`);
    assert.equal(source.querySha256, digest(Buffer.from(record.queryText, 'utf8')), `${name}: saved query text`);
    assert.deepEqual(record.recordedMetadata, json(source.metadataFile), `${name}: reported metadata`);
  }
});

test('committed revision links the exact predecessor file and preserves draft unknown count', () => {
  const prior = json('search-record.json'), revision = json('search-revision.json');
  assert.equal(revision.revision.predecessorSha256, digest(bytes('search-record.json')));
  assert.equal(revision.revision.predecessorRecordId, prior.recordedMetadata.recordId);
  assert.notEqual(revision.recordedMetadata.recordId, prior.recordedMetadata.recordId);
  assert.equal(revision.recordedMetadata.executionStatus, 'draft');
  assert.equal(revision.recordedMetadata.resultCount, null);
});
