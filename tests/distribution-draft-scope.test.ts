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

test("partner draft skill never sends; sending is a person's job on the dashboard", () => {
  assert.doesNotMatch(partnerSkill, /send_project_distribution|send_candidate_distribution/u);
  assert.match(partnerSkill, /The FlowSES connector has no send tool/u);
  assert.match(partnerSkill, /Never sends mail/u);
});

test("no skill calls an MCP send tool", async () => {
  const { readdirSync } = await import("node:fs");
  const skillsDir = new URL("../skills/", import.meta.url);
  for (const name of readdirSync(skillsDir)) {
    const text = readFileSync(new URL(`${name}/SKILL.md`, skillsDir), "utf8");
    assert.doesNotMatch(text, /send_(project|candidate)_distribution/u, name);
  }
});
