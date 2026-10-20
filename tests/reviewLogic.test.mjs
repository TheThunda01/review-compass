import test from 'node:test';
import assert from 'node:assert/strict';
import {
  defaultProject, matchesLiteralTerm, screenRecord, buildExportMarkdown,
  buildCommonGapChecks, buildProtocolSnapshot, projectFieldSummary,
  buildReadinessGuidance, buildSearchString
} from '../review-compass-showcase/src/reviewLogic.mjs';

function pendingOnly(result) {
  assert.equal(result.status, 'Needs human review');
  assert.equal(Object.hasOwn(result, 'decision'), false);
  assert.equal(Object.hasOwn(result, 'confidence'), false);
}

test('a relevant record supplies signals, never an inclusion decision', () => {
  const result = screenRecord('A survey of college students studied food insecurity and academic performance.', defaultProject);
  pendingOnly(result);
  assert.deepEqual(result.signals.population, ['college students']);
  assert.deepEqual(result.signals.concept, ['food insecurity']);
  assert.deepEqual(result.signals.design, ['survey']);
});

test('empty text remains unassessed', () => {
  const result = screenRecord(' \n\t ', defaultProject);
  pendingOnly(result);
  assert.equal(result.inputStatus, 'No text supplied');
  assert.deepEqual(result.matchedTerms, []);
  assert.deepEqual(result.matchedExclusions, []);
});

test('off-topic text cannot be automatically excluded', () => {
  const result = screenRecord('A report on astronomical instruments and distant galaxies.', defaultProject);
  pendingOnly(result);
  assert.deepEqual(result.matchedTerms, []);
  assert.match(result.reasons.join(' '), /do not establish ineligibility/);
});

test('negated inclusion and exclusion words remain literal signals requiring review', () => {
  const result = screenRecord('No food insecurity was found among college students. This is not an animal study.', defaultProject);
  pendingOnly(result);
  assert.deepEqual(result.signals.concept, ['food insecurity']);
  assert.ok(result.matchedExclusions.includes('animal study'));
  assert.match(result.reasons.join(' '), /Negation/);
});

test('explicit exclusion cue is shown without making the final decision', () => {
  const result = screenRecord('This editorial describes an animal study involving a rat.', defaultProject);
  pendingOnly(result);
  assert.ok(result.matchedExclusions.includes('editorial'));
  assert.ok(result.matchedExclusions.includes('rat'));
});

test('short words do not match inside unrelated words', () => {
  const result = screenRecord('The rate was higher; a separate analysis examined cooperation.', defaultProject);
  assert.equal(result.matchedExclusions.includes('rat'), false);
  assert.equal(matchesLiteralTerm('rates and ratings', 'rat'), false);
  assert.equal(matchesLiteralTerm('rat_gene', 'rat'), false);
  assert.equal(matchesLiteralTerm('(rat)', 'rat'), true);
});

test('Unicode boundaries and canonical accents are handled', () => {
  assert.equal(matchesLiteralTerm('Un CAFÉ local', 'cafe\u0301'), true);
  assert.equal(matchesLiteralTerm('décaféiné', 'café'), false);
  assert.equal(matchesLiteralTerm('préétude', 'étude'), false);
  assert.equal(matchesLiteralTerm('une étude.', 'étude'), true);
});

test('regex characters in user terms remain literal', () => {
  assert.equal(matchesLiteralTerm('Uses C++ for analysis.', 'C++'), true);
  assert.equal(matchesLiteralTerm('Uses C for analysis.', 'C++'), false);
  assert.equal(matchesLiteralTerm('Observed x or y.', 'x|y'), false);
  assert.equal(matchesLiteralTerm('Observed x|y.', 'x|y'), true);
  assert.equal(matchesLiteralTerm('trial (phase 2)', 'trial (phase 2)'), true);
});

test('whitespace variation in phrases matches without stemming or synonym inference', () => {
  assert.equal(matchesLiteralTerm('food\n  insecurity', 'food insecurity'), true);
  assert.equal(matchesLiteralTerm('food insecure students', 'food insecurity'), false);
});

test('exports contain the pending status and no automated decision or confidence field', () => {
  const markdown = buildExportMarkdown(defaultProject, 'pubmed', 'An editorial about food insecurity.');
  assert.match(markdown, /## Keyword Triage\nStatus: Needs human review/);
  assert.doesNotMatch(markdown, /^Decision:|^Confidence:/m);
  assert.match(markdown, /Negation/);
});

test('gap checks report mentions rather than fabricated completion scores', () => {
  const project = { ...defaultProject, teamPlan: 'We will pilot extraction and ask two reviewers.' };
  const gaps = buildCommonGapChecks(project);
  assert.ok(gaps.every((gap) => !Object.hasOwn(gap, 'score')));
  assert.equal(gaps.find((g) => g.gap === 'Extraction piloting').statusLabel, 'Pilot wording mentioned');
  assert.ok(gaps.every((g) => !['Broad enough', 'Piloted', 'Ready', 'Checked'].includes(g.statusLabel)));
  assert.ok(buildProtocolSnapshot(project).cards.every((card) => !Object.hasOwn(card, 'score')));
});

test('field completion counts entered text and does not certify methods', () => {
  assert.deepEqual(projectFieldSummary({}), { present: 0, total: 9, missing: ['topic', 'population', 'concept', 'context', 'outcomes', 'databases', 'include', 'exclude', 'teamPlan'] });
  assert.equal(projectFieldSummary({ topic: 'x' }).present, 1);
  assert.match(buildReadinessGuidance(defaultProject).label, /not validated/);
});

test('existing search draft remains executable as a pure function', () => {
  assert.match(buildSearchString(defaultProject, 'pubmed'), /Title\/Abstract/);
  assert.match(buildSearchString(defaultProject, 'scopus'), /TITLE-ABS-KEY/);
});
