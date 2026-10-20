# Practical use

## Where this fits

Review Compass fits at the planning and documentation stages of a review. Its browser app helps articulate a question and inspect literal search or screening cues. Its new standalone recorder helps keep the text of a search with the context reported by the person who ran it. It does not submit that search or verify a database response.

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

Unknown or missing required fields fail. The output schema is `review-compass-search-record/1`. It preserves query text, including a UTF-8 BOM if present, metadata, original input SHA-256 fingerprints, and the existing structural audit. It labels all execution details as operator-reported. One record describes one search version; it does not append to a database.

Exit `0` means a record was written or printed, even if its query has structural findings. Exit `2` means invalid arguments, encoding, metadata, limits, or an output error. This differs from the standalone audit's exit `1`: a record of a flawed query is still a valid historical record. Use `--output` with a new path; inputs and existing output files are never overwritten. Without it, JSON goes to standard output.

## Worked use case

```sh
node tools/record-search.mjs --query examples/search-draft.txt --metadata examples/search-record-metadata.json --output my-search-record.json
```

The bundled metadata is a fictional teaching draft. Its output contains `executionStatus: "draft"` and `resultCount: null`. To document a real run, save the actual submitted query and replace every metadata field with the recorded database context. Select `reported_executed` only if the search was run; `0` then means an explicitly reported zero hits, while `null` remains unknown. Preserve the database export separately. [The included example](../examples/search-record.json) shows the format.

## Checks before relying on a result

- Compare the recorded query with the exact text used in the named platform, including limits applied outside the text box.
- Check date, database coverage, platform, and count against your search notes or saved response.
- Inspect structural findings and test database-specific syntax; absence of findings is not validation.
- Keep query revisions and exports under distinct identifiers, with review decisions and deduplication procedures documented separately.
- Have an appropriate information specialist or reviewer assess the strategy and inspect known relevant records.

## Known limits

The schema is custom, not a complete PRISMA-S implementation. It does not record every reporting item, authenticate the operator, establish coverage, calculate recall, or deduplicate retrievals. Its date is self-reported. Query syntax and hit counts can change across platforms and over time. The browser planner has not gained a database connector or automated eligibility decision. JSON exports may contain sensitive notes; inspect them before sharing.

## Next improvements

1. **UI import and export:** expose this same schema in the planner; acceptance means round trips preserve every field and keep draft/executed status visible.
2. **Multiple search versions:** add explicit predecessor IDs and revision reasons; acceptance means edits never silently replace the recorded earlier query.
3. **Optional retrieval manifests:** fingerprint separately supplied database-export files; acceptance means no record count is inferred from file size or equated with distinct studies.
4. **User evaluation:** test whether reviewers can reconstruct a supplied search history; acceptance means prespecified usability observations are reported without claims about recall or review quality.
