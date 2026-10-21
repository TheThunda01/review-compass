# Review Compass

**Turn a review idea into an inspectable plan, and keep a record of how each search was described.**

## Why this project

Review Compass helps organize a review question, eligibility rules, search terms, extraction fields, and reporting notes before discussion with a librarian, mentor, or research team. The aim is to make decisions visible, not to replace scientific judgment. Start with the [background and themes](docs/project-context.md) or [evidence-review concepts](docs/biology-and-concepts.md).

## What it does

An evidence review brings sources together to answer a question; eligibility rules say which sources belong. The working app is in [`review-compass-showcase/`](review-compass-showcase/). It includes a planner, educational method pages, a manual search checklist, a record-count calculator, and a Markdown export. The page uses HyperText Markup Language (HTML), Cascading Style Sheets (CSS), and JavaScript in your browser; no model, inference service, or database search runs behind it.

The command-line interface (CLI), used through a terminal, inspects query structure and creates a portable **operator-reported search record** pairing exact query text and input fingerprints with an operator's database, platform, date, limits, and result count. Drafts remain drafts; unknown counts remain `null`. A recorded count is not independently verified.

## Quick start

From the repository root, use Python 3 to serve the static files:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory review-compass-showcase
```

Open <http://127.0.0.1:8000/> and choose **Open the planner**. No Node dependencies need to be installed to use the app.

1. Enter your review question components and draft eligibility rules.
2. Inspect the generated search draft and the method prompts. Test and revise the search in the actual database; a generated string is not a verified search strategy.
3. In **Screen**, paste a title and abstract to inspect literal keyword signals. Every record remains **Needs human review**, including empty text and records with potential exclusion cues.
4. Use **Export** to save the current draft and keyword notes as Markdown. It does not record an automated inclusion decision.

Create an example search record with Node.js 22 or later:

```sh
node tools/record-search.mjs --query examples/search-draft.txt --metadata examples/search-record-metadata.json --output my-search-record.json
```

The metadata fixture is explicitly a synthetic draft. No search is executed. Choose a new output path; existing files are not overwritten.

To preserve a revision as a new file, supply the prior record and a reason:

```sh
node tools/record-search.mjs --query examples/search-revision.txt --metadata examples/search-revision-metadata.json --predecessor examples/search-record.json --reason "Add a teaching synonym; this remains an unexecuted draft." --output my-search-revision.json
```

The new record must have a different `recordId`. The predecessor is never rewritten, and a revision requires a new output path.

## Example results

The [example search record](examples/search-record.json) retains the synthetic query, its SHA-256 fingerprint of exact file bytes, a structural audit, and `executionStatus: "draft"` with `resultCount: null`. The app's built-in screening examples all remain **Needs human review**, including apparently relevant text, missing text, and exclusion cues. No recall, precision, or time-saving claim follows from those examples.

## Practical use and limitations

### What the indicators mean

The planner shows how many fields contain text and whether certain words were mentioned. It does not score protocol quality, certify search coverage, or establish that screening or piloting has happened. For example, writing “we will pilot the form” produces a mention prompt, not a completed-pilot status.

Keyword matching recognizes complete words and literal phrases. It can show “animal study” even in “this was not an animal study,” because it does not interpret negation or context. It also misses relevant synonyms that are not in your configured phrases. These limitations are visible in the app and export. [Methods and limitations](docs/methods-and-limitations.md) explain the behavior and its rationale.

The manual search checklist reports checked boxes, not independently verified work. The flow calculator checks arithmetic relationships in entered counts; it cannot establish that the records, reports, and studies were counted correctly.

### Inspect a search draft

The standalone [search checker](docs/search-audit.md) records the input fingerprint and flags a small set of structural issues without sending the query anywhere:

```sh
node tools/audit-search.mjs --input examples/search-draft.txt
```

It checks quotes, delimiters, empty groups, and selected text hazards. A clean result does not validate the strategy or the database syntax. The planner now also retains concept terms beyond the previous six-term cap, so user-supplied alternatives are not silently omitted.

An operator-reported search record is a handoff format, not a full PRISMA-S report. It does not capture every source, query revision, deduplication procedure, or independent review decision. See the [practical-use contract](docs/practical-use.md) for its fields and failure behavior.

The optional revision block records the immediate predecessor's record ID and exact file SHA-256, plus your reason. It does not prove that the history is complete, authenticate authorship, or verify reported execution. Search dates still describe searches rather than revision timestamps; a corrected historical record can retain its earlier search date.

## Documentation

| Page | Purpose |
| --- | --- |
| [Glossary](docs/glossary.md) | Definitions of scientific, statistical, and software terms |
| [Assumptions](docs/assumptions.md) | Rationale, checks, and consequences of each material assumption |
| [Reference list](docs/references.md) | Complete citations and the role of each source |
| [Reference audit](docs/reference-audit.json) | Source checks, access levels, and remaining limitations |
| [Maintenance and source review](docs/review-2026-10-21.md) | Static-tool cleanup, source checks, validation, and remaining limits |
| [Editorial review](docs/review-2026-10-20.md) | Corrections and checks completed on October 20, 2026 |
| [Project context](docs/project-context.md) | Background, rationale, and themes |
| [Biology and concepts](docs/biology-and-concepts.md) | Evidence-review concepts and boundaries |
| [Methods and limitations](docs/methods-and-limitations.md) | Literal matching and planning semantics |
| [Data provenance](docs/data-provenance.md) | Synthetic fixtures and operator-supplied content |
| [Practical use](docs/practical-use.md) | Search record contract and worked example |
| [References](review-compass-showcase/references.html) | Educational sources and reporting guidance |
| [Rapid literature review](docs/literature-review.md) | Exact search log and source-to-code decisions |
| [Search audit](docs/search-audit.md) | Query scanner, offsets, and exit codes |

## Development and reuse

### Static application and development tools

The application is the existing HTML, CSS, and JavaScript in
`review-compass-showcase/`. Serve those files with the Python command in the quick
start; no bundling, npm dependency installation, or build step is required.
The root npm package is a dependency-free test entry point, so `npm test` is an
alternative to the Node command below. The dev container runs the tests and leaves
starting the local server to you.

### Run the tests

With Node.js 22 or later:

```sh
node --test tests/*.test.mjs
```

The tests cover relevant and empty records, absent keywords, negation, exclusion cues, partial-word errors such as `rat` matching `rate`, Unicode phrases, literal regular-expression characters, exports, and the separation between entered text and completed work. GitHub Actions runs these checks and checks the two UI modules for JavaScript syntax errors.

### Sources and scope

The project uses published reporting guidance as a reference for planning prompts. PRISMA-S supports transparent reporting of search methods; it does not validate this app or convert a checklist into a measure of review quality. An established research tool such as ASReview LAB uses trained models and reviewer labels for a different screening workflow. This app neither implements that system nor claims comparable performance.

- Rethlefsen ML et al. (2021). PRISMA-S: an extension to the PRISMA Statement for Reporting Literature Searches in Systematic Reviews. *Systematic Reviews*, 10, 39. [Rethlefsen et al. (2021): doi:10.1186/s13643-020-01542-z](https://doi.org/10.1186/s13643-020-01542-z).
- de Bruin J et al. (2025). ASReview LAB v.2: Open-source text screening with multiple agents and a crowd of experts. *Patterns*, 6(7), 101318. [doi:10.1016/j.patter.2025.101318](https://doi.org/10.1016/j.patter.2025.101318).

The 2025 ASReview citation concerns version 2; its current repository advertises version 3. Results and capabilities must be attributed to the evaluated version. The [in-app reference page](review-compass-showcase/references.html) includes the broader educational sources. No sensitivity, specificity, recall, reliability, or time-saving estimate has been established for Review Compass.

### Data handling and repository history

The static app does not send entered text to a server. When served from `localhost` or `127.0.0.1` (or opened as a local file if the browser permits storage), the planner may save project text, record text, and notes in browser local storage so they survive a reload. On other hosts, those fields use tab memory. Exports contain your entered information, so inspect them before sharing. The manual audit and flow inputs use in-memory state.

This repository began with Microsoft's JavaScript portfolio template. The original instructions are preserved in [`TEMPLATE_ORIGIN.md`](TEMPLATE_ORIGIN.md), and the unused root `src/` directory remains as historical template material. Its React/Parcel dependency and deployment configuration is available in Git history; it is no longer installed by the active root package. The inherited MIT license and attribution are retained. The Spanish and Portuguese files under `translations/`, and inherited Microsoft support, conduct, and pull-request instructions, belong to that template; they are not translations, contacts, or support commitments for Review Compass. Use this repository’s issue tracker for reproducible non-sensitive project bugs and the [security policy](SECURITY.md) to report suspected vulnerabilities privately; do not post private records or credentials. No source code was copied from PRISMA-S or ASReview.

The [rapid practice review](docs/literature-review.md) records the sources behind the new search handoff format. Its fields were written for this project; no third-party search or screening code was copied.
