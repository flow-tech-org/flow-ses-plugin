import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const partnerSkill = readFileSync(
  new URL(
    "../skills/generate-distribution-draft/SKILL.md",
    import.meta.url,
  ),
  "utf8",
);

test("partner draft skill leaves freelancer-only drafts out of scope", () => {
  assert.match(partnerSkill, /Freelancer-only PROJECT drafts to 所属要員 are out of scope/u);
  assert.match(partnerSkill, /ownCandidateIds/u);
  assert.match(partnerSkill, /自社/u);
});
