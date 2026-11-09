import assert from "node:assert/strict";
import test from "node:test";
import { FLOW_SES_TOOLS, REMOVED_TOOLS } from "./flow-ses-tools.ts";
import {
  frontmatter,
  isProhibition,
  rawSkillLinks,
  readSkill,
  sentencesMentioning,
  skillReferences,
  SKILL_NAMES,
  toolMentions,
} from "./skill-rules.ts";

for (const name of SKILL_NAMES) {
  const text = readSkill(name);

  test(`${name}: frontmatter names the skill and has a short description`, () => {
    const meta = frontmatter(text);
    assert.ok(meta, "frontmatter");
    assert.equal(meta.name, name);
    assert.ok(meta.description.length > 0, "description");
    assert.ok(meta.description.length <= 1024, "description is at most 1024 characters");
  });

  test(`${name}: every tool it names exists in the flow-ses connector`, () => {
    for (const tool of toolMentions(text)) {
      if (REMOVED_TOOLS.has(tool)) {
        for (const sentence of sentencesMentioning(text, tool)) {
          assert.ok(isProhibition(sentence), `${tool} may only appear as "do not use": ${sentence}`);
        }
        continue;
      }
      assert.ok(FLOW_SES_TOOLS.has(tool), `unknown tool ${tool}`);
    }
  });

  test(`${name}: every skill it points to exists`, () => {
    for (const reference of skillReferences(text)) {
      assert.ok(SKILL_NAMES.includes(reference), `flow-ses:${reference}`);
    }
    for (const link of rawSkillLinks(text)) {
      if (link.startsWith("<")) continue;
      assert.ok(SKILL_NAMES.includes(link), `raw link to ${link}`);
    }
  });

  test(`${name}: never sends mail unless the user asked for that distribution`, () => {
    for (const tool of ["send_project_distribution", "send_candidate_distribution"]) {
      for (const sentence of sentencesMentioning(text, tool)) {
        assert.ok(
          isProhibition(sentence) || /explicitly asked|明示/u.test(sentence),
          `${tool}: ${sentence}`,
        );
      }
    }
  });
}
