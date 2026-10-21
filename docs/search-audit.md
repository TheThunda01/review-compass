# Inspect an exact search draft

Terminology: [glossary](glossary.md). For assumptions and their limits, see [assumptions](assumptions.md).

The standalone checker helps catch a narrow set of structural problems before a query is reviewed in its target database. It accepts a UTF-8 text file and produces JSON containing the exact input file's SHA-256, diagnostics, and explicit limitations. It does not contact any external service.

From the repository root, with Node.js 22 or later:

```sh
node tools/audit-search.mjs --input examples/search-draft.txt
node tools/audit-search.mjs --input examples/search-draft.txt --output my-search-audit.json
```

The bundled text is a synthetic teaching draft, not a validated literature search. The [included report](../examples/search-audit.json) is reproducible from it. Existing output files are never overwritten. File inputs are limited to 1,000,000 bytes; the pure function is limited to 1,000,000 UTF-16 code units. Invalid UTF-8 is rejected. The program does not execute query text.

| Exit code | Meaning |
| --- | --- |
| `0` | No listed structural issue detected; manual review still required |
| `1` | Structural issues found; inspect the report |
| `2` | Input, argument, or output error; no successful report |

## What is checked

- Nonempty text and closed ASCII double quotes.
- Matched, correctly nested parentheses and square brackets outside quoted text.
- Empty quoted phrases and empty parenthesis groups.
- Curly double quotes, backslashes, and selected ASCII control characters that warrant manual inspection. Tabs and line endings are allowed.

Offsets are zero-based UTF-16 code units. Quotes toggle quoted text; backslash escaping is not interpreted. Punctuation inside quoted phrases is not treated as a structural delimiter. Diagnostics are deliberately lexical: the scanner does not know whether a field tag, phrase, operator, proximity expression, or other construct is supported by the target database. Empty-group checks are only applied outside quotes.

## What to do with a report

If an issue is flagged, return to the query and investigate it; the program does not repair the text. Then test the exact query in the intended platform. Inspect term mapping, known relevant records, eligibility concepts, limits, and source coverage with a librarian or an experienced reviewer. A lack of flagged issues does not establish query validity, completeness, sensitivity, or precision.

The planner's concept builder now retains all supplied terms after case-insensitive deduplication. Its previous six-term cap could silently omit a seventh term and later entries. Tests cover this regression. The built-in suggested alternatives are still educational suggestions that require review; they are not an ontology, a validated synonym set, or a complete database search.

[McGowan et al. (2016): PRESS](https://doi.org/10.1016/j.jclinepi.2016.01.021) motivates careful peer review of the broader search strategy. [Rethlefsen et al. (2021): PRISMA-S](https://doi.org/10.1186/s13643-020-01542-z) motivates recording enough detail to understand and reproduce the search. Neither guideline validates this implementation. Code is original; no code from a search engine or screening package was copied.
