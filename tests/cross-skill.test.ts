import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

test("matching skills cover company-sheet register runs", () => {
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    assert.match(read(name), /\| Company spreadsheet register skill \(one partner company's sheet\) \|/u);
  }
});

test("onboarding sets up the new-matching notification as an agent task", () => {
  assert.match(read("onboarding"), /\| 新着通知 \|[^\n]*notify_new_matchings_to_teams と notify_new_matchings_to_slack/u);
});

test("scheduled-task prompts work without the plugin loaded", () => {
  const onboarding = read("onboarding");
  for (const name of ["process-inbox", "evaluate-recent-matchings", "close-stale-source-listings"]) {
    assert.ok(onboarding.includes(`https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/${name}/SKILL.md`), name);
  }
  assert.doesNotMatch(onboarding, /get_agent_instructions/u);
});

test("every skill folder matches its name", () => {
  for (const name of ["onboarding", "process-inbox", "structured-conditions", "evaluate-recent-matchings", "evaluate-project-matchings", "evaluate-candidate-matchings", "close-stale-source-listings", "generate-distribution-draft", "register-ses-partner-business-card", "read-office-attachments"]) {
    assert.match(read(name), new RegExp(`^name: ${name}$`, "mu"));
  }
});

test("onboarding writes 会社スキル only for partners that differ from the shared defaults", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /## 3\. 会社スキル/u);
  assert.match(onboarding, /description: <会社名>（<ドメイン>）の会社スキル/u);
  assert.match(onboarding, /Only a difference from these needs a 会社スキル/u);
  assert.ok(onboarding.indexOf("## 3. 会社スキル") < onboarding.indexOf("## 4. 定期実行"));
});
