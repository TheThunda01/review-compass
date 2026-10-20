# Rapid literature and practice review

## Question and scope

What should accompany a saved search query so another reviewer can understand its context and distinguish a draft from a reported database run? This bounded review informed an operator-reported search-record format. It did not evaluate Review Compass's effectiveness or seek a complete inventory of search software.

## Search record

PubMed was searched on 20 October 2026, with publication dates 2022-01-01 through 2026-10-20 and relevance ordering. A query combining systematic review with search reporting/documentation/reproducibility returned **14** records. A second title-focused query returned **49**. The first ten results of each were title-screened: **20 distinct records**. Two directly relevant methodological evaluations were selected for appraisal. Later result pages were not screened. [search-log.json](search-log.json) contains the exact queries, translations, retrieved IDs, filters, page limits, and decisions; totals are not a fabricated flow diagram.

Rethlefsen et al.'s complete abstract was inspected. Young et al.'s abstract and the first 12,000 of 63,357 body characters were inspected through the PubMed full-text connector; the remaining results, discussion, and supplements were not read in this review. Targeted official pages and the full PRISMA-S statement supplied foundational reporting guidance. These supplementary selections were purposive, not an exhaustive web search.

## What the sources support

| Source | Type and access | Relevant finding | Limit | Implementation consequence |
| --- | --- | --- | --- | --- |
| [Rethlefsen et al., 2024; PMID 38052277](https://pubmed.ncbi.nlm.nih.gov/38052277/) | Original cross-sectional metaresearch; complete abstract | Reproduction of searches was limited in its sample; database names, exact strategies, limits, dates, and counts were assessed separately. | One sample and an operational reproducibility definition; full methods not appraised here. | Store distinct context fields alongside the query; do not equate a syntactic check with reproducibility. |
| [Young et al., 2024; PMID 39176233](https://pubmed.ncbi.nlm.nih.gov/39176233/) | Original assessment of 111 Campbell reviews; abstract and opening/methods text | Reporting varied by item, including platforms and coverage dates. The inspected methods explicitly excluded precision/sensitivity assessment. | Particular review collection; not evidence that this recorder improves searches. | Keep declared metadata separate from verified retrieval performance and preserve limits as text. |
| [PRISMA-S statement, 2021; PMID 33499930](https://pubmed.ncbi.nlm.nih.gov/33499930/) | Consensus reporting guideline; [full statement inspected](https://pmc.ncbi.nlm.nih.gov/articles/PMC7839230/) | Reporting identifies database and platform, full strategies, dates, limits, totals, and other search methods. | Reporting guidance is not a certification of methodological quality or this software. | Add a small structured record; explain which reporting items it does not cover. |
| [Official PRISMA-Search resources](https://www.prisma-statement.org/prisma-search) | Official resource page, inspected 2026-10-20 | Maintains statement, checklist, and links to tracking-record guidance. | The checklist must be applied to the actual review; completion is not inferred from text entry. | Link users to the complete guidance rather than label the custom schema “PRISMA-compliant.” |

The practical gap was local: the existing checker fingerprinted a query but did not carry structured database/platform/date/count context. The literature supports making that context inspectable. It does not establish that more fields alone make a search valid or comprehensive.

## Changes made

`searchRecord.mjs` validates an explicit metadata schema and embeds the existing structural audit. `tools/record-search.mjs` pairs that metadata with query text and original file fingerprints, rejecting invalid dates, counts, encoding, and overwrites. It preserves `null` for an unknown count and `0` for an explicitly reported zero. A draft cannot contain a retrieval count. No search is submitted, and structural problems are preserved rather than repaired silently. Synthetic examples and tests demonstrate those boundaries.

The existing app and inherited template attribution remain intact. The new implementation is original and has no added package dependency. No source code from PRISMA or an external screening system was copied.

## Remaining work

The custom schema could be exposed in the browser app and expanded into versioned search histories. Any database connector, export parser, or claims about workflow benefit would require additional implementation and validation. Librarian or information-specialist review remains a practical next step for actual strategies.

## Limits of this review

This review used one bibliographic database, English terms, two first-result pages, purposive selection, and one reviewer with AI assistance. It was not preregistered or independently screened. Abstract-only and partial-full-text access limit appraisal. Search totals overlap conceptually and are not a count of all relevant publications. No findings from a particular research sample are presented as Review Compass performance.
