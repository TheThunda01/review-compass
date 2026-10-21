# Evidence-review concepts behind Review Compass

Terminology: [glossary](glossary.md). For assumptions and their limits, see [assumptions](assumptions.md).

Review Compass is about how we organize evidence, rather than a biological experiment of its own. A review of a biological or public-health question depends on which studies are found, how their populations and outcomes are defined, and which conclusions their designs support. This guide explains that chain of reasoning and connects it to the app's deliberately limited checks.

## Start with the question

Consider a question about food insecurity and student mental health, the app's illustrative topic. Food insecurity is a construct that investigators must define and measure; mental health can refer to different symptoms, scales, diagnoses, or experiences. Two papers can use similar words but measure different things. A planning form helps make those differences explicit. It cannot decide whether the measurements are equivalent or whether an association is causal.

A structured question is a prompt for thought, not a universal template. PICO identifies population, intervention, comparison, and outcomes; the app also adapts it to exposure questions. PCC identifies population, concept, and context, as described in [JBI’s scoping-review guidance](https://jbi-global.atlassian.net/wiki/spaces/MANUAL/pages/355862687/10.2.3+Defining+and+aligning+the+objective+s+and+question+s). The app offers these and other frames as teaching aids. The selected review purpose should determine which elements matter. A scoping question that maps definitions does not automatically require the same eligibility rules or synthesis as a question about intervention effects. The [Thomas et al. (2024): Cochrane Handbook's guidance on review scope](https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-02) provides a fuller treatment.

## Searching is a measurement step

The evidence available for synthesis depends partly on retrieval. An author may describe a relevant construct using words the reviewer did not anticipate; a database may index a paper with a controlled subject heading; an abstract may omit an outcome that appears in the full text. A text-word query and a subject-heading search therefore answer somewhat different retrieval questions. PubMed's [official search guide](https://pubmed.ncbi.nlm.nih.gov/help/) describes its phrase, field-tag, and term-mapping behavior. These rules should be checked in the actual platform rather than assumed to transfer to another database.

Within a concept block, `OR` retrieves alternatives. Between blocks, `AND` asks for their intersection. For example:

```text
("college students" OR "university students")
AND ("food insecurity" OR "food insufficiency")
```

This illustrates Boolean structure, not a completed search strategy. The phrases are not guaranteed to cover the concept, and adding an outcome block can exclude relevant records that do not mention that outcome in the searched fields. Search sensitivity concerns the proportion of relevant records retrieved; precision concerns the proportion of retrieved records that are relevant. Neither can be calculated here without an appropriate reference set and a definition of relevance. More records alone do not establish a better search.

## What the new structural checker contributes

The command-line checker inspects exact query text for unmatched delimiters, empty phrases or groups, curly quotes, and a few other visible hazards. It records an input fingerprint so a report can be connected to the file that was checked. The planner also retains all supplied concept terms instead of silently taking only the first six.

These are engineering checks. A query with balanced parentheses can still have the wrong Boolean logic, invalid field tags, inappropriate limits, missing concepts, or poor retrieval. The checker does not submit the query or validate a database's grammar. Its result deliberately says “No listed structural issue detected,” rather than calling the search valid. [McGowan et al. (2016), PRESS](https://doi.org/10.1016/j.jclinepi.2016.01.021) addresses the wider task of peer-reviewing a search strategy, including how the question, vocabulary, operators, and restrictions have been translated.

## Finding a word is different from selecting a study

The app's screening view matches literal words and phrases. A phrase can occur in a negation, a discussion of earlier work, or an exclusion criterion. Its absence can reflect different terminology. For example, “not an animal study” still contains “animal study.” Every result therefore remains pending human review. No confidence score, automatic exclusion, or estimate of screening recall is produced.

For comparison, [de Bruin et al. (2025), ASReview LAB v.2](https://doi.org/10.1016/j.patter.2025.101318) describes model-assisted screening with human labels. The [official repository](https://github.com/asreview/asreview) provides an inspectable implementation of that different workflow. Its useful design lesson here is to make the relationship between software assistance, human annotations, and recorded decisions explicit. Review Compass does not implement active learning, borrow its code, or inherit its evaluation results.

## Records, reports, studies, and conclusions

A database record points to a document. A study can produce several reports, and several databases can describe the same report. Removing duplicate records is not the same as resolving multiple reports from one study. These distinctions matter in a selection-flow diagram and in synthesis. The app checks arithmetic in entered report counts; it does not identify duplicates or determine the number of independent studies.

[PRISMA 2020, described by Page et al. (2021)](https://doi.org/10.1136/bmj.n71), means Preferred Reporting Items for Systematic reviews and Meta-Analyses and supports transparent reporting. [PRISMA-S, described by Rethlefsen et al. (2021)](https://doi.org/10.1186/s13643-020-01542-z), is its search-reporting extension, covering sources, strategies, dates, and record management. A completed checklist is not proof of unbiased conduct. Likewise, a filled planning field is evidence that text was entered, not that a pilot, independent extraction, or appraisal has occurred.

The project's practical aim is a draft another person can inspect: clearly defined concepts, visible search choices, recorded uncertainties, and a plan for resolving them. Scientific interpretation still depends on the underlying study designs and evidence. The [methods notes](methods-and-limitations.md) and [search-checker instructions](search-audit.md) state precisely where the software stops.

Sources checked on 2026-10-20. Established methods papers remain useful alongside the more recent ASReview publication; no preprint is presented as peer-reviewed evidence here.
