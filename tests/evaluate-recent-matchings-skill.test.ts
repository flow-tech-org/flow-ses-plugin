import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = readFileSync(
  new URL("../skills/evaluate-recent-matchings/SKILL.md", import.meta.url),
  "utf8",
);

test("recent matchings skill names the window and the createdAt instant filters", () => {
  assert.match(skill, /^name: evaluate-recent-matchings$/mu);
  assert.doesNotMatch(skill, /disable-model-invocation/u);
  assert.match(skill, /user-specified instant/u);
  assert.match(skill, /executedAt` from the previous result of this skill/u);
  assert.match(skill, /today 00:00 JST/u);
  assert.match(skill, /\*\*End\*\* is now/u);
  assert.match(skill, /createdAfter` \/ `createdBefore`/u);
  assert.match(skill, /createdAfter` is the start \(inclusive\)/u);
  assert.match(skill, /createdBefore` is now \(exclusive\)/u);
  assert.match(skill, /recruitmentStatuses: \["unset"\]/u);
  assert.match(skill, /Do not use `updatedAt`/u);
  assert.match(skill, /Do not post-filter timestamps/u);
  assert.match(skill, /Do not pass `dateField`, `dateFrom`, or `dateTo`/u);
  assert.doesNotMatch(skill, /createdAtFrom|updatedAtFrom/u);
  assert.doesNotMatch(skill, /dateField: "updatedAt"/u);
  assert.doesNotMatch(skill, /dateField: "createdAt"/u);
  assert.match(skill, /Do not invent a 3-business-day default/u);
  assert.doesNotMatch(skill, /last 3 business days/u);
});

test("recent matchings skill calls the two matching skills separately", () => {
  assert.match(skill, /Pass only the new PROJECT ids to `flow-ses:evaluate-project-matchings`/u);
  assert.match(skill, /Partners are all 募集中 candidates/u);
  assert.match(skill, /Pass only the new CANDIDATE ids to `flow-ses:evaluate-candidate-matchings`/u);
  assert.match(skill, /Partners are all 募集中 projects/u);
  assert.match(skill, /Never pass both id sets into one skill/u);
  assert.match(skill, /do not call that skill/u);
  assert.match(skill, /evaluated with zero anchors/u);
  assert.match(skill, /Do not send mail/u);
  assert.match(skill, /"executedAt": "2026-10-03T04:48:00.000Z"/u);
  assert.match(skill, /If the next run cannot see this result, start is again today 00:00 JST/u);
  assert.match(skill, /Do not call `create_matching` from this skill/u);
});

test("an unreadable skill sheet does not stop the scheduled start record", () => {
  const rules = readFileSync(
    new URL("../skills/matching-rules/SKILL.md", import.meta.url),
    "utf8",
  );
  assert.match(skill, /not a failure: it goes under `sheetUnreadable`, not `errors`, so record the start as usual/u);
  assert.match(rules, /"sheetUnreadable": \[\]/u);
  assert.match(rules, /A skill sheet that could not be read is \*\*not\*\* an error/u);
});
