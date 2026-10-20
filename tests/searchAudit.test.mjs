import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, writeFileSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {auditSearch} from '../review-compass-showcase/src/searchAudit.mjs';
import {buildSearchTerms, defaultProject} from '../review-compass-showcase/src/reviewLogic.mjs';

test('balanced text remains subject to scientific and platform review', () => {
  const r = auditSearch('("cell (culture)"[Title/Abstract] OR yeast[Title/Abstract])');
  assert.deepEqual(r.issues, []);
  assert.equal(r.maximumParenthesisDepth, 1);
  assert.equal(r.closedQuotedPhrases, 1);
  assert.equal(r.manualReviewRequired, true);
  assert.match(r.limitations.join(' '), /not validated/);
});

test('delimiter errors are found without treating quoted punctuation as structure', () => {
  assert.equal(auditSearch('"[("').issues.length, 0);
  assert.equal(auditSearch('"()"').issues.length, 0);
  assert.ok(auditSearch('([)]').issues.some(x => x.code === 'CROSSED_DELIMITERS'));
  assert.ok(auditSearch('cell)').issues.some(x => x.code === 'UNEXPECTED_CLOSE'));
  assert.ok(auditSearch('(cell').issues.some(x => x.code === 'UNCLOSED_DELIMITER'));
  assert.ok(auditSearch('"cell').issues.some(x => x.code === 'UNCLOSED_QUOTE'));
});

test('empty input, empty phrases, curly quotes, escapes and controls are explicit', () => {
  for (const [query, code] of [['  ', 'EMPTY_QUERY'], ['" "', 'EMPTY_PHRASE'], ['()', 'EMPTY_GROUP'], ['“cell”', 'SMART_QUOTES'], ['cell\\x', 'BACKSLASH'], ['cell\0', 'CONTROL_CHARACTER']]) {
    assert.ok(auditSearch(query).issues.some(x => x.code === code));
  }
});

test('input types and size are bounded; reported offsets use the documented convention', () => {
  assert.throws(() => auditSearch(null), TypeError);
  assert.throws(() => auditSearch('x'.repeat(1_000_001)), RangeError);
  assert.equal(auditSearch('🧬)').issues[0].offset, 2);
  assert.equal(auditSearch('('.repeat(2000) + 'cell' + ')'.repeat(2000)).maximumParenthesisDepth, 2000);
});

test('search terms are not silently truncated after six entries', () => {
  const project = {...defaultProject, population: 'alpha; beta; gamma; delta; epsilon; zeta; eta; theta'};
  assert.equal(buildSearchTerms(project)[0].terms.length, 8);
  assert.ok(buildSearchTerms(project)[0].terms.includes('theta'));
});

test('CLI fingerprints exact bytes, distinguishes issues from errors, and refuses overwrite', () => {
  const dir = mkdtempSync(join(tmpdir(), 'review-compass-'));
  const input = join(dir, 'query.txt'); const output = join(dir, 'report.json');
  const run = (...args) => spawnSync(process.execPath, ['tools/audit-search.mjs', ...args], {encoding: 'utf8'});
  try {
    writeFileSync(input, '(cell OR yeast)');
    const ok = run('--input', input, '--output', output);
    assert.equal(ok.status, 0, ok.stderr);
    const r = JSON.parse(readFileSync(output, 'utf8'));
    assert.match(r.inputSha256, /^[a-f0-9]{64}$/);
    assert.equal(r.inputFile, 'query.txt');
    const old = readFileSync(output, 'utf8');
    assert.equal(run('--input', input, '--output', output).status, 2);
    assert.equal(readFileSync(output, 'utf8'), old);
    writeFileSync(input, '(cell');
    assert.equal(run('--input', input).status, 1);
    writeFileSync(input, Buffer.from([0xff]));
    assert.equal(run('--input', input).status, 2);
    assert.equal(run('--wat', input).status, 2);
  } finally {rmSync(dir, {recursive: true});}
});
