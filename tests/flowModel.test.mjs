import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultFlowCounts, flowModel } from "../review-compass-showcase/src/flowModel.mjs";

test("flow preserves zero and derives each stage from the previous one", () => {
  const result = flowModel({ ...defaultFlowCounts, automationExcluded: "0" });
  assert.deepEqual(result.invalidFields, []);
  assert.deepEqual(result.steps.map(step => step.value), [144, 126, 44, 40, 19]);
});

test("incomplete, fractional, negative or oversized counts withhold totals", () => {
  for (const value of ["", "  ", "3.5", "-1", "9007199254740992", "3e7"]) {
    const result = flowModel({ ...defaultFlowCounts, databaseRecords: value });
    assert.deepEqual(result.invalidFields, ["databaseRecords"]);
    assert.equal(result.steps, undefined);
  }
});

test("impossible counts and sums that exceed exact arithmetic withhold totals", () => {
  for (const update of [{ recordsExcluded: 999 }, { databaseRecords: Number.MAX_SAFE_INTEGER }]) {
    const result = flowModel({ ...defaultFlowCounts, ...update });
    assert.ok(result.problems.length);
    assert.equal(result.steps, undefined);
  }
});
