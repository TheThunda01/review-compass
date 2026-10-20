/** A portable record of operator-reported search metadata, not a search executor. */
import {auditSearch} from './searchAudit.mjs';

const REQUIRED = ['recordId', 'database', 'platform', 'searchDate', 'executionStatus', 'resultCount', 'limits'];
const OPTIONAL = ['notes'];

export function createSearchRecord(metadata, query, fingerprints) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) throw new TypeError('Metadata must be a JSON object.');
  if (Object.keys(metadata).some(k => ![...REQUIRED, ...OPTIONAL].includes(k)) || REQUIRED.some(k => !Object.hasOwn(metadata, k))) throw new Error('Metadata fields must match the documented search-record schema.');
  for (const key of ['recordId', 'database', 'platform']) {
    if (typeof metadata[key] !== 'string' || !metadata[key].trim() || metadata[key].length > 500) throw new Error(`${key} must be nonblank text, at most 500 characters.`);
  }
  for (const key of ['limits', 'notes']) {
    if (key === 'notes' && !Object.hasOwn(metadata, key)) continue;
    if (typeof metadata[key] !== 'string' || metadata[key].length > 10000) throw new Error(`${key} must be text, at most 10,000 characters.`);
  }
  const date = metadata.searchDate;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10) !== date) throw new Error('searchDate must be a real YYYY-MM-DD calendar date.');
  if (!['draft', 'reported_executed'].includes(metadata.executionStatus)) throw new Error('executionStatus must be draft or reported_executed.');
  if (metadata.resultCount !== null && (!Number.isSafeInteger(metadata.resultCount) || metadata.resultCount < 0)) throw new Error('resultCount must be null (unknown) or a nonnegative safe integer.');
  if (metadata.executionStatus === 'draft' && metadata.resultCount !== null) throw new Error('Draft searches must leave resultCount null.');
  if (typeof query !== 'string' || !query.trim()) throw new Error('The query must contain text.');
  for (const key of ['querySha256', 'metadataSha256']) {
    if (!/^[a-f0-9]{64}$/.test(fingerprints?.[key] ?? '')) throw new Error(`${key} must be a SHA-256 fingerprint.`);
  }
  return {
    schema: 'review-compass-search-record/1',
    recordedMetadata: {...metadata},
    queryText: query,
    sourceFingerprints: {...fingerprints},
    structuralAudit: auditSearch(query),
    interpretation: 'Operator-reported metadata. Review Compass did not execute the search, verify its result count, evaluate recall, or determine eligibility.',
    unknownCountMeaning: 'null means unknown or not recorded; zero means the operator explicitly reported zero results.'
  };
}

/** Link an immediate predecessor; this validates structure, not the reported search. */
export function linkRevision(record, predecessor, predecessorSha256, reason) {
  if (!record || record.schema !== 'review-compass-search-record/1') throw new Error('Revision must be a supported search record.');
  createSearchRecord(record.recordedMetadata, record.queryText, record.sourceFingerprints);
  if (!predecessor || predecessor.schema !== 'review-compass-search-record/1') throw new Error('Predecessor must be a supported search record.');
  createSearchRecord(predecessor.recordedMetadata, predecessor.queryText, predecessor.sourceFingerprints);
  if (!/^[a-f0-9]{64}$/.test(predecessorSha256 ?? '')) throw new Error('Predecessor fingerprint must be SHA-256.');
  if (typeof reason !== 'string' || !reason.trim() || reason.length > 10000) throw new Error('Revision reason must be nonblank text, at most 10,000 characters.');
  if (record.recordedMetadata.recordId.trim() === predecessor.recordedMetadata.recordId.trim()) throw new Error('A revision must have a new recordId.');
  if (Object.hasOwn(predecessor, 'revision')) {
    const old=predecessor.revision;
    if (!old || typeof old !== 'object' || old.schema !== 'review-compass-revision/1' || typeof old.predecessorRecordId !== 'string' || !old.predecessorRecordId.trim() ||
        !/^[a-f0-9]{64}$/.test(old.predecessorSha256 ?? '') || typeof old.reason !== 'string' || !old.reason.trim()) throw new Error('Predecessor revision metadata is malformed.');
    if (record.recordedMetadata.recordId.trim() === old.predecessorRecordId.trim()) throw new Error('Revision would reuse a visible ancestor recordId.');
  }
  return {...record, revision: {
    schema: 'review-compass-revision/1',
    predecessorRecordId: predecessor.recordedMetadata.recordId,
    predecessorSha256,
    reason: reason.trim(),
    scope: 'Immediate predecessor bytes and operator-declared reason; full ancestry, authorship and search execution are not verified.'
  }};
}
