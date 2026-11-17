import { buildProtocolSnapshot } from "./reviewLogic.mjs";

import { defaultFlowCounts, flowModel } from "./flowModel.mjs";

const auditGroups = [
  {
    title: "Question Translation",
    helper: "Check that the search matches the review question instead of drifting toward a nearby topic.",
    items: [
      ["question-concepts", "The main question concepts are visible in the search.", "A reviewer should be able to point to the population, concept or intervention, and outcome or context groups."],
      ["question-scope", "The search is neither too broad nor too narrow for the review purpose.", "Broad reviews may need flexible terms, while focused effect questions need sharper concept boundaries."],
      ["question-line-counts", "Line counts or test counts were checked before screening begins.", "Big jumps or tiny result sets can reveal a logic mistake early."]
    ]
  },
  {
    title: "Boolean And Line Logic",
    helper: "Review the structure of AND, OR, parentheses, and database-specific syntax.",
    items: [
      ["logic-or", "Synonyms within the same concept are connected with OR.", "OR gathers similar terms before the concept groups are combined."],
      ["logic-and", "Different concept groups are connected with AND.", "AND should combine the major concepts after each concept group is complete."],
      ["logic-parentheses", "Parentheses, quotation marks, and field tags are balanced.", "A missing symbol can quietly change the entire retrieval set."]
    ]
  },
  {
    title: "Vocabulary Coverage",
    helper: "Look for missing controlled vocabulary, natural-language terms, spelling variants, and abbreviations.",
    items: [
      ["vocab-controlled", "Controlled vocabulary or subject headings were considered where available.", "Examples include MeSH, CINAHL Headings, Emtree, or other database-specific indexing."],
      ["vocab-textwords", "Text words include synonyms, spelling variants, and common abbreviations.", "Student searches often miss records because authors use different wording for the same idea."],
      ["vocab-phrase", "Important phrases are quoted or searched in a way the database supports.", "Phrase handling differs across databases, so the same strategy may need translation."]
    ]
  },
  {
    title: "Documentation And Limits",
    helper: "Make the search reproducible enough for a librarian, mentor, or reader to check later.",
    items: [
      ["docs-sources", "Every database, registry, website, and supplementary source is named.", "The source list should match the discipline and the review type."],
      ["docs-dates", "Search dates, limits, filters, and deduplication steps will be recorded.", "This is essential for PRISMA-S style reporting and future updates."],
      ["docs-peer-review", "A librarian, mentor, or experienced reviewer will check the strategy.", "Structured peer review helps catch search errors before they affect screening."]
    ]
  }
];

const form = document.querySelector("#project-form");
const protocolOutput = document.querySelector("#protocol-output");
const auditOutput = document.querySelector("#audit-output");
const flowForm = document.querySelector("#flow-form");
const flowOutput = document.querySelector("#flow-output");
const resetButton = document.querySelector("#reset-button");

let flowCounts = { ...defaultFlowCounts };
let auditState = {};

if (form && protocolOutput && auditOutput && flowForm && flowOutput) {
  hydrateFlowForm();
  renderEnhancements();

  form.addEventListener("input", renderEnhancements);
  flowForm.addEventListener("input", (event) => {
    if (!event.target.matches("input")) return;
    flowCounts = Object.fromEntries(new FormData(flowForm));
    renderFlow();
  });
  auditOutput.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-audit-item]");
    if (!checkbox) return;
    auditState = { ...auditState, [checkbox.value]: checkbox.checked };
    renderAudit();
  });
  resetButton?.addEventListener("click", () => {
    flowCounts = { ...defaultFlowCounts };
    auditState = {};
    hydrateFlowForm();
    renderEnhancements();
  });
}

function renderEnhancements() {
  renderProtocol();
  renderAudit();
  renderFlow();
}

function readProject() {
  const data = new FormData(form);
  return Object.fromEntries([...data.entries()].map(([key, value]) => [key, normalizeText(value)]));
}

function renderProtocol() {
  const snapshot = buildProtocolSnapshot(readProject());
  protocolOutput.innerHTML = `
    <section class="snapshot-hero watch">
      <div>
        <p class="surface-label">Protocol snapshot</p>
        <h4>Methods still need human review</h4>
        <p>These prompts describe text entered in the form. They do not verify search coverage, completed piloting, or protocol quality.</p>
      </div>
      <div class="snapshot-score"><strong>${snapshot.fields.present}/${snapshot.fields.total}</strong><span>fields contain text</span></div>
    </section>
    <div class="snapshot-grid">
      ${snapshot.cards.map((item) => `
        <article class="snapshot-card watch">
          <div class="card-kicker"><span>${escapeHtml(item.statusLabel)}</span></div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.text)}</p>
          <em>${escapeHtml(item.action)}</em>
        </article>`).join("")}
    </div>
  `;
}

function renderAudit() {
  const groups = auditGroups.map((group) => {
    const items = group.items.map(([id, label, detail]) => ({ id, label, detail, checked: Boolean(auditState[id]) }));
    return { ...group, items, checked: items.filter((item) => item.checked).length, total: items.length };
  });
  const checked = groups.reduce((sum, group) => sum + group.checked, 0);
  const total = groups.reduce((sum, group) => sum + group.total, 0);
  const percent = Math.round((checked / total) * 100);
  const nextItem = groups.flatMap((group) => group.items).find((item) => !item.checked);

  auditOutput.innerHTML = `
    <section class="audit-summary">
      <div>
        <p class="surface-label">Search peer review</p>
        <h4>${checked} of ${total} checks complete</h4>
        <p>${escapeHtml(nextItem ? `Next, check: ${nextItem.label}` : "All boxes are self-marked complete; a librarian or mentor should still review the search.")}</p>
      </div>
      <div class="audit-meter"><meter min="0" max="100" value="${percent}">${percent}%</meter><strong>${percent}%</strong></div>
    </section>
    <div class="audit-groups">
      ${groups
        .map(
          (group) => `
          <section class="audit-group ${group.checked === group.total ? "steady" : group.checked > 0 ? "watch" : "needs"}">
            <div class="audit-group-heading"><div><h4>${escapeHtml(group.title)}</h4><p>${escapeHtml(group.helper)}</p></div><span>${group.checked}/${group.total}</span></div>
            <div class="audit-items">
              ${group.items
                .map(
                  (item) => `
                  <label class="audit-item">
                    <input type="checkbox" value="${escapeHtml(item.id)}" data-audit-item ${item.checked ? "checked" : ""}>
                    <span><strong>${escapeHtml(item.label)}</strong><em>${escapeHtml(item.detail)}</em></span>
                  </label>`
                )
                .join("")}
            </div>
          </section>`
        )
        .join("")}
    </div>
  `;
}

function renderFlow() {
  const flow = flowModel(flowCounts);
  const invalidLabels = [];
  for (const field of flowForm.querySelectorAll("input")) {
    const invalid = flow.invalidFields.includes(field.name);
    field.setAttribute("aria-invalid", String(invalid));
    if (invalid) invalidLabels.push(field.labels[0].textContent.trim());
  }
  if (invalidLabels.length) {
    flowOutput.innerHTML = messageList("Enter a whole number of zero or more in each field", invalidLabels, "problem");
    return;
  }
  if (flow.problems.length) {
    flowOutput.innerHTML = messageList("Check the counts before calculating the flow", flow.problems, "problem");
    return;
  }
  flowOutput.innerHTML = `
    <figure class="flow-figure">
      <figcaption>
        <h4>How many records made it through screening?</h4>
        <p>Each bar uses the same scale, starting with ${flow.recordsIdentified.toLocaleString("en-US")} records. The final three stages count reports.</p>
      </figcaption>
      <ol class="flow-stages">
        ${flow.steps.map(step => `
          <li>
            <div><strong>${escapeHtml(step.label)}</strong><b>${step.value.toLocaleString("en-US")}</b></div>
            <div class="flow-track" aria-hidden="true"><i style="width:${100 * step.value / flow.recordsIdentified}%"></i></div>
            <p>${escapeHtml(step.detail)}</p>
          </li>`).join("")}
      </ol>
    </figure>
    ${flow.cautions.length ? messageList("What to document", flow.cautions, "caution") : ""}
  `;
}

function hydrateFlowForm() {
  for (const [key, value] of Object.entries(flowCounts)) {
    const field = flowForm.elements.namedItem(key);
    if (field && field.value !== String(value)) field.value = value;
  }
}

function messageList(title, items, modifier) {
  return `<section class="message-list ${modifier}"><h4>${escapeHtml(title)}</h4><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>`;
}

function splitList(value) {
  return normalizeText(value)
    .split(/\s*(?:,|;|\n|\band\b)\s*/i)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
