import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) =>
  readFileSync(new URL(`../skills/${name.replace("flow-ses:", "")}/SKILL.md`, import.meta.url), "utf8");

for (const [name, condition] of [
  ["flow-ses:evaluate-project-matchings", "candidateCondition"],
  ["flow-ses:evaluate-candidate-matchings", "projectCondition"],
] as const) {
  test(`${name} searches skills with 下位スキル and falls back one level up`, () => {
    const skill = read(name);
    assert.ok(skill.includes(`always pass \`${condition}.includeChildSkills: true\``));
    assert.match(skill, /When every 1-name try also returns zero, go one level up \(上位スキル fallback\)/u);
    assert.match(skill, /Try at most 5 parents/u);
    assert.match(skill, /Stop at the first parent that returns at least one/u);
    assert.match(skill, /never use the parent's parent/u);
    assert.match(skill, /Widened hit \(上位スキル fallback, required\)/u);
    assert.match(skill, /ご対応可能かご確認いただけますと幸いです/u);
    assert.match(skill, /"widenedToParent": 0/u);
    assert.match(skill, /Do not go to zero names or two levels up/u);
  });
}

test("structured-conditions sets a 上位スキル on create_skill only when sure", () => {
  const skill = read("flow-ses:structured-conditions");
  assert.match(skill, /On `create_skill`, pass `parentSkillId`/u);
  assert.match(skill, /When unsure, leave it out/u);
});
