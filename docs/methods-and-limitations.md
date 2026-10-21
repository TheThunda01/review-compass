# How the planner's checks work

Terminology: [glossary](glossary.md). For assumptions and their limits, see [assumptions](assumptions.md).

The planner is an educational drafting aid. Its useful output is a more explicit question, a reviewable set of method choices, and visible reasons to investigate a record. It cannot establish that a review is complete or that a record meets the protocol.

## Keyword triage

`screenRecord(text, project)` accepts one text string and the current project fields. It returns a pending human-review status, matched phrases grouped by their origin, and explanations. It never returns an inclusion/exclusion decision, a probability, or a confidence label.

The implementation normalizes whitespace and Unicode composition, escapes regular-expression metacharacters, and matches literal phrases with Unicode letter/number boundaries. For example, `rat` matches `(rat)` but not `rate` or `rat_gene`. A phrase such as `C++` is treated literally, not as executable regular-expression syntax. Case is ignored. The project phrases come from the population, concept, outcome, and context fields. A short built-in list supplies study-design words and potential exclusion cues; explicitly entered exclusion phrases are also checked literally.

The matcher does not understand negation, infer meaning, expand synonyms during triage, translate text, resolve abbreviations, or assess the full eligibility criteria. “No food insecurity was observed” still contains “food insecurity”; “not an animal study” still contains “animal study.” All such cases retain the same **Needs human review** status. Absence of a keyword is not evidence of ineligibility. Empty text receives a missing-input explanation instead of automatic exclusion.

The interface and Markdown export use the same result. The export identifies the words found and preserves the limitations; it does not silently convert signals into decisions.

## Search drafts

The builder combines every generated concept block with AND and uses text terms, not controlled vocabulary. Its predefined related terms are suggestions, not verified synonyms. Requiring an outcome, context, or method block can miss relevant reports. The chosen database changes the printed field syntax, but the app does not execute or validate it. Review each block with an information specialist and test the exact query in the target platform. Cochrane’s search guidance discusses why too many required concepts can reduce sensitivity (Lefebvre et al., 2025; [references](references.md#cochrane-04)).

## Planning fields and method prompts

The `x/9` indicator counts nonempty project fields. It measures text entry only. A single character counts as entered text, so the indicator does not reward verbosity or imply that a long answer is scientifically adequate.

The common-methods checks report observations such as “pilot wording mentioned” and “sources named; check coverage.” There are no heuristic quality percentages. A statement of intent is not evidence that piloting, independent review, appraisal, or search testing has occurred. The separate protocol board uses these same checks so it cannot contradict the main interface with a fabricated readiness score.

For compatibility with earlier callers, `computeReadiness` still returns a numeric percentage, but that value is explicitly the fraction of nonempty fields. It is not displayed as scientific readiness. `screenRecord` keeps its name and arguments, while its former `decision` and `confidence` properties have been intentionally removed. Consumers must read `status`, `signals`, and the explanations instead.

The manual search audit is different: its completed-box count comes from the user's own checks. That count is not independently verified, and all boxes checked still calls for human review. The record-flow arithmetic uses user-entered counts; a numerically consistent flow can still describe incorrectly counted records or reports. It assumes one retained record corresponds to one sought report and combines the database and other-source pathways. Reconcile records with reports outside the app; the display is not a complete PRISMA 2020 flow diagram.

## Relationship to published methods

[Rethlefsen et al. (2021): PRISMA-S](https://doi.org/10.1186/s13643-020-01542-z) is reporting guidance for searches, including source/platform details, full strategies, dates, limits, record counts, and deduplication. Those topics inform the app's prompts. The paper does not validate these software checks or prescribe a readiness percentage.

[de Bruin et al. (2025): ASReview LAB v.2](https://doi.org/10.1016/j.patter.2025.101318) describes an open-source system for model-assisted screening with human expertise. It is an example of a substantially different, evaluated research workflow. Review Compass does not train a model, prioritize a record collection, implement active learning, or inherit the performance reported for ASReview. The citation is context and a comparison, not a claim that its code or validation applies here.

No new literature-review outcome or empirical screening-performance estimate is reported by this project. The built-in examples illustrate interaction with the planner. A research team would need a protocol-specific labeled evaluation, appropriate error analysis, and decisions about oversight before using any automated screen for consequential record selection.

## Verification and remaining limits

Node tests check the behaviors above with small, explicit examples. They include both negated and non-negated phrases, exclusion words, Unicode text, regular-expression metacharacters, no-input records, and exports. These tests can demonstrate that the chosen rules are implemented consistently; they cannot demonstrate that the rules identify all relevant studies.

The original educational pages cover several review designs. Their brief descriptions are starting points for discussion, not substitutes for each method's full guidance. Search strings require database-specific testing and peer review. This release changes the unsafe certainty of the old keyword and readiness indicators; it does not claim to implement a full systematic-review management platform.

Sources checked on 2026-10-20. The existing template license is retained, and no code from the cited reporting guideline or ASReview software is copied into this implementation.


## Operator-reported search records

`tools/record-search.mjs` adds a standalone custom JSON record pairing query text and input-file fingerprints with required database, platform, date, execution-status, count, and limits fields. It does not execute a search. `draft` requires a null result count; `reported_executed` records the operator's statement, with null still permitted when a count is unknown. A recorded zero is distinct from missing information. The existing structural audit is embedded without treating a flagged query as an invalid historical record. See [practical use](practical-use.md) for exact input bounds, schema, exit codes, and overwrite protection. The browser planner's state and screening behavior are unchanged.

Round 2 adds optional immediate revision linkage: a required reason, predecessor record ID, and exact predecessor-file fingerprint. A revision must be written to a new output path and use a new record ID. Core predecessor fields are validated, but prior source files and older ancestry are not traversed. Existing calls without revision flags produce the same record format. These links describe operator-supplied history, not independent evidence that a search was run.

The revision CLI additionally checks the predecessor query text against its stored UTF-8 SHA-256 before linking. This detects an internally inconsistent record; it does not reconstruct the original metadata-file bytes or authenticate its claims.
