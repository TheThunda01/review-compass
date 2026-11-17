export const defaultFlowCounts = {
  databaseRecords: 124,
  registerRecords: 8,
  otherRecords: 12,
  duplicatesRemoved: 18,
  automationExcluded: 0,
  recordsExcluded: 82,
  reportsNotRetrieved: 4,
  reportsExcluded: 21
};

export function flowModel(counts) {
  const invalidFields = [];
  const input = {};
  for (const key of Object.keys(defaultFlowCounts)) {
    const raw = String(counts[key] ?? "").trim();
    const value = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value)) invalidFields.push(key);
    else input[key] = value;
  }
  if (invalidFields.length) return { invalidFields, problems: [] };
  const recordsIdentified = input.databaseRecords + input.registerRecords + input.otherRecords;
  const removed = input.duplicatesRemoved + input.automationExcluded;
  if (![recordsIdentified, removed].every(Number.isSafeInteger)) {
    return { invalidFields, problems: ["The combined count is too large for exact arithmetic. Check the source counts."] };
  }
  const recordsScreened = Math.max(0, recordsIdentified - removed);
  const reportsSought = Math.max(0, recordsScreened - input.recordsExcluded);
  const reportsAssessed = Math.max(0, reportsSought - input.reportsNotRetrieved);
  const reportsIncluded = Math.max(0, reportsAssessed - input.reportsExcluded);
  const problems = [];
  const cautions = [];

  if (recordsIdentified === 0) problems.push("Add at least one record source before using the flow summary.");
  if (removed > recordsIdentified) problems.push("Records removed before screening cannot exceed records identified.");
  if (input.recordsExcluded > recordsScreened) problems.push("Records excluded at title or abstract screening cannot exceed records screened.");
  if (input.reportsNotRetrieved > reportsSought) problems.push("Reports not retrieved cannot exceed reports sought for retrieval.");
  if (input.reportsExcluded > reportsAssessed) problems.push("Reports excluded after eligibility assessment cannot exceed reports assessed.");
  if (problems.length) return { invalidFields, problems };
  if (input.automationExcluded > 0) cautions.push("If automation removed records, document the tool, rule, and human check used.");
  if (input.otherRecords === 0) cautions.push("Consider whether citation searching, websites, organizational sources, or handsearching are needed.");
  if (input.reportsExcluded > 0) cautions.push("Keep reason categories for each full-text exclusion so the final report is transparent.");

  return {
    invalidFields,
    recordsIdentified,
    problems,
    cautions,
    steps: [
      { label: "Records identified", value: recordsIdentified, detail: `${input.databaseRecords} database, ${input.registerRecords} register, ${input.otherRecords} other source.` },
      { label: "Records screened", value: recordsScreened, detail: `${input.duplicatesRemoved} duplicates and ${input.automationExcluded} automation exclusions removed before screening.` },
      { label: "Reports sought", value: reportsSought, detail: `${input.recordsExcluded} records excluded at title or abstract screening.` },
      { label: "Reports assessed", value: reportsAssessed, detail: `${input.reportsNotRetrieved} reports could not be retrieved.` },
      { label: "Reports remaining", value: reportsIncluded, detail: `${input.reportsExcluded} reports excluded after full-text assessment.` }
    ]
  };
}
