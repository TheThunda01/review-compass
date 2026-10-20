# Rapid literature and practice review

## Question and scope

What should accompany a saved search query so another reviewer can understand its context and distinguish a draft from a reported database run? This bounded review informed an operator-reported search-record format. It did not evaluate Review Compass's effectiveness or seek a complete inventory of search software.

### Round 2 — 20 October 2026

The second scope asks how to keep a revised search record connected to its predecessor without silently replacing the earlier file. It is a same-day implementation update, not evidence from a later observation period.

## Search record

PubMed was searched on 20 October 2026, with publication dates 2022-01-01 through 2026-10-20 and relevance ordering. A query combining systematic review with search reporting/documentation/reproducibility returned **14** records. A second title-focused query returned **49**. The first ten results of each were title-screened: **20 distinct records**. Two directly relevant methodological evaluations were selected for appraisal. Later result pages were not screened. [search-log.json](search-log.json) contains the exact queries, translations, retrieved IDs, filters, page limits, and decisions; totals are not a fabricated flow diagram.

Rethlefsen et al.'s complete abstract was inspected. Young et al.'s abstract and the first 12,000 of 63,357 body characters were inspected through the PubMed full-text connector; the remaining results, discussion, and supplements were not read in this review. Targeted official pages and the full PRISMA-S statement supplied foundational reporting guidance. These supplementary selections were purposive, not an exhaustive web search.

The [separate round-2 log](search-update-02.json) records a focused PubMed query for title-level search strategies and versions/reproducibility. It returned four records, all screened by complete abstract with the 2022-01-01–2026-10-20 publication window and relevance ordering. Rod and Boruff's search-archiving case was newly retained; Rethlefsen et al. was already appraised in round 1 and is not counted as a new independent source. Full texts were not appraised for this increment. A targeted W3C PROV-O lookup supplied the distinction between an entity and its revision.

## What the sources support

| Source | Type and access | Relevant finding | Limit | Implementation consequence |
| --- | --- | --- | --- | --- |
| [Rethlefsen et al., 2024; PMID 38052277](https://pubmed.ncbi.nlm.nih.gov/38052277/) | Original cross-sectional metaresearch; complete abstract | Reproduction of searches was limited in its sample; database names, exact strategies, limits, dates, and counts were assessed separately. | One sample and an operational reproducibility definition; full methods not appraised here. | Store distinct context fields alongside the query; do not equate a syntactic check with reproducibility. |
| [Young et al., 2024; PMID 39176233](https://pubmed.ncbi.nlm.nih.gov/39176233/) | Original assessment of 111 Campbell reviews; abstract and opening/methods text | Reporting varied by item, including platforms and coverage dates. The inspected methods explicitly excluded precision/sensitivity assessment. | Particular review collection; not evidence that this recorder improves searches. | Keep declared metadata separate from verified retrieval performance and preserve limits as text. |
| [PRISMA-S statement, 2021; PMID 33499930](https://pubmed.ncbi.nlm.nih.gov/33499930/) | Consensus reporting guideline; [full statement inspected](https://pmc.ncbi.nlm.nih.gov/articles/PMC7839230/) | Reporting identifies database and platform, full strategies, dates, limits, totals, and other search methods. | Reporting guidance is not a certification of methodological quality or this software. | Add a small structured record; explain which reporting items it does not cover. |
| [Official PRISMA-Search resources](https://www.prisma-statement.org/prisma-search) | Official resource page, inspected 2026-10-20 | Maintains statement, checklist, and links to tracking-record guidance. | The checklist must be applied to the actual review; completion is not inferred from text entry. | Link users to the complete guidance rather than label the custom schema “PRISMA-compliant.” |

The practical gap was local: the existing checker fingerprinted a query but did not carry structured database/platform/date/count context. The literature supports making that context inspectable. It does not establish that more fields alone make a search valid or comprehensive.

| Source | Type/access | Claim used | Limit | Code consequence |
| --- | --- | --- | --- | --- |
| [Rod and Boruff, 2024; PMID 38911529](https://pubmed.ncbi.nlm.nih.gov/38911529/) | Institutional practice case; complete abstract | Search strategies and related exports can be archived as distinct research outputs with descriptive metadata. | One institutional initiative; not a test of this tool or its performance. | Retain the prior record and create a new file with an explicit reason. |
| [W3C PROV-O, 30 April 2013, `wasRevisionOf`](https://www.w3.org/TR/2013/REC-prov-o-20130430/#wasRevisionOf) | Official recommendation; definition and entity context inspected | A revision is a derived entity related to an earlier entity. | This custom JSON is not an RDF/PROV-O conformance implementation or proof of provenance truth. | Add an immediate predecessor ID and fingerprint without overwriting it. |

The [previous Rethlefsen appraisal](https://pubmed.ncbi.nlm.nih.gov/38052277/) remains context for documenting exact strategies. No reported search-performance estimate is imported into this implementation.

## Changes made

`searchRecord.mjs` validates an explicit metadata schema and embeds the existing structural audit. `tools/record-search.mjs` pairs that metadata with query text and original file fingerprints, rejecting invalid dates, counts, encoding, and overwrites. It preserves `null` for an unknown count and `0` for an explicitly reported zero. A draft cannot contain a retrieval count. No search is submitted, and structural problems are preserved rather than repaired silently. Synthetic examples and tests demonstrate those boundaries.

The existing app and inherited template attribution remain intact. The new implementation is original and has no added package dependency. No source code from PRISMA or an external screening system was copied.

Round 2 adds `linkRevision` and paired `--predecessor`/`--reason` options. Validation requires a supported prior record, a distinct visible ID, a nonblank reason, and a new output path. The existing draft/executed and unknown/zero count semantics remain unchanged. Tests check exact predecessor hashing, input preservation, malformed records, missing options, and refusal to overwrite; a new synthetic revision fixture retains its predecessor.

## Remaining work

The custom schema could be exposed in the browser app and expanded into versioned search histories. Any database connector, export parser, or claims about workflow benefit would require additional implementation and validation. Librarian or information-specialist review remains a practical next step for actual strategies.

Immediate linkage completes the earlier small revision feature. Traversing a full collection of ancestors, inspecting cycles beyond the directly visible link, and importing revisions into the browser remain separate future work with acceptance criteria in the practical-use guide.

## Limits of this review

This review used one bibliographic database, English terms, two first-result pages, purposive selection, and one reviewer with AI assistance. It was not preregistered or independently screened. Abstract-only and partial-full-text access limit appraisal. Search totals overlap conceptually and are not a count of all relevant publications. No findings from a particular research sample are presented as Review Compass performance.

The increment screened four abstracts and one targeted technical definition. It did not assess every versioning system, test authenticated provenance, or evaluate search quality. It extends the first bounded review without changing its original search log or implying elapsed-time evidence.

The revision CLI additionally checks the predecessor query text against its stored UTF-8 SHA-256 before linking. This detects an internally inconsistent record; it does not reconstruct the original metadata-file bytes or authenticate its claims.
