# Glossary

Review Compass uses evidence-review terms alongside software terms. The definitions below explain the planning prompts; they do not turn the prompts into an assessment of research quality.

## Evidence-review terms

| Term | Meaning here |
| --- | --- |
| Evidence synthesis / systematic review | Bringing sources together to answer a question / a synthesis using explicit, planned methods. A systematic review may have a broad or narrow scope. |
| Scoping review / evidence map | A synthesis that maps the extent and characteristics of evidence / a structured display of evidence across categories. Terminology varies; specify the actual methods and purpose. |
| Meta-analysis | Statistical combination of numerical results from separate studies. It is an analysis method, not a required part of every systematic review. |
| Rapid review | A synthesis conducted with justified, explicit streamlining to meet a time-sensitive need. “Rapid” describes how a review is conducted and can apply to different synthesis types. |
| Umbrella review / overview of reviews | A synthesis of existing reviews. Different reviews may include the same primary studies, so their results are not automatically independent. |
| Qualitative synthesis | Bringing together evidence about experiences, meanings, or processes using a stated qualitative method. |
| Mixed-methods review | Integrating quantitative and qualitative evidence using a planned relationship between the two. |
| Integrative review | A review that brings together diverse empirical or theoretical material using an explicit method. The label alone does not specify that method. |
| Narrative review / narrative synthesis | An explanatory review format / a way to synthesize findings without statistical pooling. Narrative synthesis can be part of a systematic review. |
| Realist synthesis / program theory | Examining how context and mechanisms help explain outcomes / an explanation of how a program is thought to work. |
| PICO / PICOS | Population, Intervention, Comparator, Outcome / those elements plus Study design. Exposure questions may adapt the intervention element. These are optional question structures, not mandatory search blocks. |
| PCC | Population, Concept, Context. JBI suggests this structure for scoping-review questions. |
| SPIDER | Sample, Phenomenon of Interest, Design, Evaluation, Research type. A proposed structure for qualitative and mixed-methods questions, not a universally superior search method. |
| CMO | Context, Mechanism, Outcome. A way to express an explanatory configuration in realist research. |
| Eligibility criteria / protocol | Rules for deciding which evidence belongs in a review / the planned question and methods, including changes and their reasons. |
| Record / report / study | A database entry / a document / an investigation. Several entries may identify one report; several reports may describe one study. |
| Screening / triage | Applying eligibility criteria / drawing attention to a record. The app's keyword triage never makes an eligibility decision. |
| Controlled vocabulary / MeSH | Standardized indexing terms / Medical Subject Headings used by the US National Library of Medicine. They differ from words used by authors. |
| Boolean operators | AND, OR, and NOT combine search concepts. Their implementation and field syntax depend on the database platform. |
| Deduplication | Identifying repeated records. It does not establish whether separate reports describe the same study. |
| Recall (sensitivity) / precision | Proportion of relevant records retrieved / proportion of retrieved records that are relevant. The app has no known complete reference set and does not estimate these quantities. |
| Risk of bias / heterogeneity | Concern about systematic distortion of a result / variation among studies or their findings. Neither is measured by a completed form. |
| Effect estimate / confidence interval | A numerical comparison or relationship / an interval produced by a statistical procedure under specified assumptions. The app does not calculate them. |
| GRADE / RoB 2 | Grading of Recommendations Assessment, Development and Evaluation, for certainty in a body of evidence / a result-specific risk-of-bias tool for randomized trials. Neither is implemented by the planner. |
| PRISMA / PRISMA-S / PRISMA-ScR | Preferred Reporting Items for Systematic reviews and Meta-Analyses / its search-reporting extension / its scoping-review extension. They guide reporting rather than certify research quality. |
| PRESS | Peer Review of Electronic Search Strategies: guidance for a structured expert review of a search. A delimiter check is not a PRESS review. |
| JBI / Cochrane | Organizations producing evidence-synthesis methods and resources. Citing them does not imply endorsement. |
| DOI / PMID | Digital Object Identifier / PubMed identifier, used to locate a publication. A valid identifier does not establish the correctness of its findings. |
| RAMESES | Realist And MEta-narrative Evidence Syntheses: Evolving Standards. The cited realist-synthesis standards address reporting that form of review. |
| Pilot / validation | A small preliminary trial of a workflow / an evaluation of whether a method supports an intended use. Entering “pilot” does not establish either occurred. |

## Software and audit terms

| Term | Meaning here |
| --- | --- |
| Literal match / negation | A match to specified text / wording that denies something. Literal matching can find “animal study” inside “not an animal study.” |
| Normalization / regular expression | Standardizing specified text features / a pattern language used in matching. The app escapes user phrases so punctuation is treated literally. |
| Unicode / UTF-8 / UTF-16 | A character standard / encodings of characters. File sizes count UTF-8 bytes; scanner positions count UTF-16 code units and start at zero. |
| BOM | A byte-order mark at the start of some text files. The recorder preserves it in the query text. |
| CLI / UI / API | Command-line interface / user interface / application programming interface. |
| HTML / CSS / JavaScript | HyperText Markup Language defines a page, Cascading Style Sheets control its presentation, and JavaScript supplies interactive behavior. |
| AI / LLM | Artificial intelligence / large language model. Review Compass contains neither a trained screening model nor a language-model service. |
| JSON / schema | JavaScript Object Notation, a structured text format / the expected structure and allowed values of that format. |
| SHA-256 / fingerprint | Secure Hash Algorithm with 256-bit output / its digest of exact bytes. A matching fingerprint is not a signature or proof of authorship. |
| Provenance / lineage | Information about origin and processing / relationships among versions. Operator-supplied provenance can be wrong. |
| Predecessor / revision | An earlier record / a changed record linked to it. This app checks one immediate link, not a complete history. |
| W3C PROV-O / RDF | World Wide Web Consortium provenance ontology / Resource Description Framework. They are context for version relationships; this custom JSON is not an implementation of those standards. |
| Operator-reported | Entered by the person using the tool, without independent database confirmation. `reported_executed` is such a statement. |
| `null` / zero | Unknown or absent information / an explicitly reported count of none. These are not interchangeable. |
| MiB / safe integer | 1,048,576 bytes / a whole number JavaScript can represent exactly. Limits avoid resource or numerical problems; they are not scientific thresholds. |
| Local storage / tab memory | Browser data that can survive reloads / working data held only in the current page. Downloads can persist independently. |
| Unit test / fixture | A check of a defined software behavior / example input with an expected output. These do not establish research effectiveness. |

See [concepts](biology-and-concepts.md), [assumptions](assumptions.md), and [references](references.md) for further context.
