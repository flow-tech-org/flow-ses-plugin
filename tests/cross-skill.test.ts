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

test("onboarding creates Gmail labels and filters instead of skipping Gmail", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /create_gmail_label/u);
  assert.match(onboarding, /create_gmail_filter/u);
  assert.doesNotMatch(onboarding, /Gmail mailboxes have no folders or rules/u);
});

test("onboarding writes 会社スキル only for partners that differ from the shared defaults", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /## 3\. 会社スキル/u);
  assert.match(onboarding, /description: <会社名>（<ドメイン>）の会社スキル/u);
  assert.match(onboarding, /Only a difference from these needs a 会社スキル/u);
  assert.ok(onboarding.indexOf("## 3. 会社スキル") < onboarding.indexOf("## 4. 定期実行"));
});

test("onboarding starts 会社スキル and 定期実行 only after every required earlier step is done", () => {
  assert.match(read("onboarding"), /Start 3 and 4 only when every earlier required step \(`optional: false`\) is `done`/u);
});

test("onboarding builds the partner list from contacts, not from mail that is not ingested yet", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /"連絡先から拾って": call `search_mail_contacts`/u);
  assert.doesNotMatch(onboarding, /メールの送信元から拾って/u);
});

test("onboarding registers the companies before asking about per-company sorting", () => {
  const onboarding = read("onboarding");
  const register = onboarding.indexOf("4. Register every company first");
  const ask = onboarding.indexOf("5. Before asking about sorting, read how the customer's mail is sorted now");
  assert.ok(register > 0 && ask > register);
  assert.match(onboarding, /If yes, make the plan in the same shape as the existing setup/u);
  assert.match(onboarding, /the plan is Outlook 受信トレイ\/<会社名> and 送信済みアイテム\/<会社名>, Gmail label <会社名>/u);
  assert.match(onboarding, /Never delete or rename existing folders or rules/u);
  assert.ok(onboarding.indexOf("create_outlook_rule", register) > ask);
  assert.ok(onboarding.indexOf("create_gmail_filter", register) > ask);
});

test("onboarding shows the folders already ingested and links the メール台帳 for 手動同期", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /Show the folders that are already on \(`enabled: true`\) first/u);
  assert.match(onboarding, /show the `ingest_folders` step's `url` from `get_onboarding_status` as a link/u);
});
