# Data provenance and repository origin

Terminology: [glossary](glossary.md). For assumptions and their limits, see [assumptions](assumptions.md).

The planner uses user-entered text and bundled teaching examples, not a research dataset. `examples/search-draft.txt` and `examples/search-record-metadata.json` are synthetic fixtures. Their [generated record](../examples/search-record.json) explicitly says `draft`, leaves the result count unknown, and reports no executed database search.

The standalone recorder preserves query text and SHA-256 fingerprints of the original query and metadata files. Those fingerprints identify bytes; database, platform, date, limits, and counts remain the operator's statements. The app does not verify an external database response.

The repository began with Microsoft's JavaScript portfolio template. [TEMPLATE_ORIGIN.md](../TEMPLATE_ORIGIN.md), the original MIT license, and attribution remain. The unused root template is distinct from the working `review-compass-showcase/` app. New recorder code is original and uses no external package. Prior guidance and reviewed literature are credited in [references and methods](methods-and-limitations.md) and the [rapid review](literature-review.md).
