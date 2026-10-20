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
