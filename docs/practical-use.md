# Practical use

Terminology: [glossary](glossary.md). For assumptions and their limits, see [assumptions](assumptions.md).

## Where this fits

Use Review Compass to plan and document a review. The browser app helps you state a question and inspect literal search or screening cues. The standalone recorder stores the exact search text with the context you report. It does not submit the search or verify a database response.

## Input and output contract

Use Node.js 22 or later. `tools/record-search.mjs` accepts a UTF-8 query file of at most 1,000,000 bytes and a UTF-8 JSON metadata file of at most 65,536 bytes. Existing [query audit](search-audit.md) limits also apply. These are the metadata fields:

| Field | Required meaning |
| --- | --- |
| `recordId` | Nonblank local identifier, at most 500 characters |
| `database` | Named database, at most 500 characters |
| `platform` | Named interface/provider, at most 500 characters |
| `searchDate` | Valid `YYYY-MM-DD` date supplied by the operator |
| `executionStatus` | `draft` or `reported_executed` |
| `resultCount` | Nonnegative safe integer, or `null` when unknown; drafts require `null` |
| `limits` | Text, at most 10,000 characters; empty means not recorded, not “no limits” |
| `notes` | Optional text, at most 10,000 characters |

The recorder rejects unknown fields and missing required fields. The output schema is `review-compass-search-record/1`. It preserves query text, including a UTF-8 BOM if present, metadata, original input SHA-256 fingerprints, and the existing structural audit. It labels all execution details as operator-reported. One record describes one search version; it does not append to a database.

Exit `0` means a record was written or printed, even if its query has structural findings. Exit `2` means invalid arguments, encoding, metadata, limits, or an output error. This differs from the standalone audit's exit `1`: a record of a flawed query is still a valid historical record. Use `--output` with a new path; inputs and existing output files are never overwritten. Without it, JSON goes to standard output.

**Round 2, 20 October 2026:** optional `--predecessor PRIOR.json --reason TEXT` links a revision to a supported `review-compass-search-record/1` file of at most 8 MiB. Both flags and `--output NEW.json` are required together. The new `recordId` must differ from the predecessor and its directly visible predecessor, if any. Reason text must be nonblank and at most 10,000 characters; surrounding whitespace is removed.

The optional `revision` block uses schema `review-compass-revision/1` and stores `predecessorRecordId`, `predecessorSha256`, and `reason`. The hash covers the exact predecessor JSON file, including formatting. Before writing, the CLI checks the predecessor’s core metadata schema and any immediate revision block. It also recomputes the UTF-8 hash of the stored predecessor query text and requires it to match that record’s query fingerprint. It does not open or check files named by the predecessor. If validation fails, it exits with status 2 without creating a record. With no predecessor flags, the previous output is unchanged.

## Worked use case

```sh
node tools/record-search.mjs --query examples/search-draft.txt --metadata examples/search-record-metadata.json --output my-search-record.json
```

The bundled metadata is a fictional teaching draft. Its output contains `executionStatus: "draft"` and `resultCount: null`. To document a real run, save the actual submitted query and replace every metadata field with the recorded database context. Select `reported_executed` only if the search was run; `0` then means an explicitly reported zero hits, while `null` remains unknown. Preserve the database export separately. [The included example](../examples/search-record.json) shows the format.

The README revision command adds an explicitly educational synonym and keeps the output marked `draft` with a null result count. [The new fixture](../examples/search-revision.json) points to the unchanged [earlier record](../examples/search-record.json). Re-run the command with a new output path and compare them. Retain both files: an ID alone cannot recover a missing predecessor.

## Checks before relying on a result

- Compare the recorded query with the exact text used in the named platform, including limits applied outside the text box.
- Check date, database coverage, platform, and count against your search notes or saved response.
- Inspect structural findings and test database-specific syntax; absence of findings is not validation.
- Keep query revisions and exports under distinct identifiers, with review decisions and deduplication procedures documented separately.
- Have an appropriate information specialist or reviewer assess the strategy and inspect known relevant records.

For a revision, compare the stored predecessor digest with the file you intend to retain, read the reason, and check that the change is justified for the actual review. Reformatting a predecessor changes its file fingerprint even if its JSON values are equivalent. The revision's search date is operator metadata, not evidence of when an edit occurred.

## Known limits

The custom schema covers only part of PRISMA-S reporting. It does not record every reporting item, authenticate the operator, establish coverage, calculate recall, or deduplicate retrievals. The operator supplies the date. Query syntax and hit counts can change across platforms and over time.

The browser planner does not connect to a database or decide eligibility. Its flow calculator assumes one retained record per sought report; it does not reconcile records with documents or distinct studies. Its search builder combines all generated blocks with AND, so outcome or context blocks may exclude useful evidence. Inspect JSON exports before sharing them; they may contain sensitive notes.

The recorder links each revision to its immediate predecessor. It rejects reuse of IDs visible in that predecessor and its one stored link, but it does not trace the full revision history. It cannot detect a missing older revision, a fabricated predecessor, or unsupported claims in an execution field. The original metadata-file byte hash cannot be recomputed from parsed metadata because its original formatting is absent. The pure `linkRevision` helper checks structure; the CLI performs the query-hash comparison. No signature, authenticated history, or database response is created. The browser planner does not yet import these linked records.

## Next improvements

1. **UI import and export:** expose this same schema in the planner; acceptance means round trips preserve every field and keep draft/executed status visible.
2. **Complete lineage inspection:** accept a collection of predecessor records and check every referenced fingerprint; acceptance means missing ancestors, altered bytes, and cycles are reported without claiming authenticated history.
3. **Optional retrieval manifests:** fingerprint separately supplied database-export files; acceptance means no record count is inferred from file size or equated with distinct studies.
4. **User evaluation:** test whether reviewers can reconstruct a supplied search history; acceptance means prespecified usability observations are reported without claims about recall or review quality.
