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
  for (const name of ["process-inbox", "evaluate-recent-matchings", "close-stale-source-listings", "register-spreadsheet-listings"]) {
    assert.ok(onboarding.includes(`https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/${name}/SKILL.md`), name);
  }
  assert.doesNotMatch(onboarding, /get_agent_instructions/u);
});

test("every skill folder matches its name", () => {
  for (const name of ["onboarding", "process-inbox", "structured-conditions", "evaluate-recent-matchings", "evaluate-project-matchings", "evaluate-candidate-matchings", "close-stale-source-listings", "generate-distribution-draft", "register-ses-partner-business-card", "read-office-attachments", "register-spreadsheet-listings"]) {
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
  assert.match(onboarding, /# <会社名> 会社スキル/u);
  assert.match(onboarding, /save each one with `set_company_skill`/u);
  assert.match(onboarding, /No file is handed over or installed on claude\.ai/u);
  assert.doesNotMatch(onboarding, /[Zz]ip|アップロード|upload/u);
  assert.match(onboarding, /Only a difference from these needs a 会社スキル/u);
  assert.ok(onboarding.indexOf("## 3. 会社スキル") < onboarding.indexOf("## 6. 定期実行"));
});

test("onboarding starts 会社スキル and 定期実行 only after every required earlier step is done", () => {
  assert.match(read("onboarding"), /Start 3, 4, 5, and 6 only when every earlier required step \(`optional: false`\) is `done`/u);
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

test("onboarding asks when to run mail ingest and matching, and the prompts start from the previous run", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /1\. Ask when to run メール取り込み/u);
  assert.match(onboarding, /Then ask when to run マッチング作成/u);
  assert.equal(onboarding.match(/定期実行として、前回の開始時刻から処理する。/gu)?.length, 2);
  assert.doesNotMatch(onboarding, /1時間10分|一つ前の実行予定時刻/u);
});

test("scheduled mail ingest and matching read and record the last start", () => {
  for (const [name, task] of [["process-inbox", "process-inbox"], ["evaluate-recent-matchings", "evaluate-recent-matchings"]]) {
    const skill = read(name);
    const get = skill.indexOf(`\`get_scheduled_task_last_start\` with \`task: "${task}"\``);
    const record = skill.indexOf(`\`record_scheduled_task_start\` with \`task: "${task}"\``);
    assert.ok(get >= 0 && record > get, name);
    assert.match(skill, /1 hour 10 minutes before/u, name);
    assert.match(skill, /Do not record when the run stopped early/u, name);
  }
  assert.match(read("process-inbox"), /`createdAfter` \/ `createdBefore` to every `list_mail_sources` call/u);
});

test("onboarding registers partner spreadsheets after mail import, in the company's 会社スキル", () => {
  const onboarding = read("onboarding");
  const sheet = onboarding.indexOf("## 4. スプレッドシート");
  assert.ok(onboarding.indexOf("## 2. 取り込みフォルダ") < sheet);
  assert.ok(onboarding.indexOf("## 3. 会社スキル") < sheet && sheet < onboarding.indexOf("## 6. 定期実行"));
  assert.match(onboarding, /the company and the sheet URL for each/u);
  assert.match(onboarding, /export\?format=xlsx/u);
  assert.match(onboarding, /「リンクを知っている全員」が閲覧可/u);
  assert.match(onboarding, /Read that company's 会社スキル with `get_company_skill` and add the `## スプレッドシート` section/u);
  assert.match(onboarding, /\| スプレッドシート取り込み \|[^\n]*register-spreadsheet-listings/u);
  assert.match(onboarding, /Create this task only when at least one 会社スキル has a `## スプレッドシート` section/u);
});

test("company skills are read from FlowSES with get_company_skill / list_company_skills", () => {
  for (const name of ["process-inbox", "generate-distribution-draft", "register-spreadsheet-listings"]) {
    assert.match(read(name), /get_company_skill/u, name);
  }
  assert.match(read("register-spreadsheet-listings"), /`list_company_skills` with `query: "## スプレッドシート"`/u);
  assert.match(read("structured-conditions"), /`get_company_skill` で読む/u);
});

test("spreadsheet register skill keeps company facts in the 会社スキル and URL sources append-only", () => {
  const skill = read("register-spreadsheet-listings");
  assert.match(skill, /Every company-specific fact \(sheet URL, tabs, layout, which value means 募集中, tag\) is in that company's 会社スキル/u);
  assert.match(skill, /URL sources are append-only/u);
  assert.match(skill, /Create only on `NONE`/u);
  assert.match(skill, /Do not pass `linkedUrlContains`/u);
  assert.match(skill, /never pass `ownCompany: true`/u);
  assert.match(skill, /flow-ses:close-stale-source-listings/u);
  assert.match(skill, /notPublic/u);
});

test("onboarding asks how to narrow and compare matchings and saves them as two instructions", () => {
  const onboarding = read("onboarding");
  const step = onboarding.indexOf("## 5. マッチングの指示");
  assert.ok(onboarding.indexOf("## 4. スプレッドシート") < step && step < onboarding.indexOf("## 6. 定期実行"));
  assert.match(onboarding, /1\. 絞り込み方\./u);
  assert.match(onboarding, /2\. 比較の仕方\./u);
  assert.ok(onboarding.includes("in 絞り込み方, and rules that need reading the overviews or the skill sheet (the list in 2) in 比較の仕方; never mix them"));
  assert.match(onboarding, /`set_matching_instructions` \(`filterInstructions`, `comparisonInstructions`; ADMIN only\)/u);
});

test("both matching skills read the company's matching instructions and keep the fixed guards", () => {
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    const skill = read(name);
    assert.match(skill, /Call `get_matching_instructions` once/u, name);
    assert.match(skill, /## 自社の指示 \(company matching instructions\)/u, name);
    assert.match(skill, /`filterInstructions` \(絞り込み方\)/u, name);
    assert.match(skill, /`comparisonInstructions` \(比較の仕方\)/u, name);
    assert.match(skill, /Where an instruction and this skill differ, follow the instruction/u, name);
    assert.match(skill, /An instruction never overrides these: no same-company pair/u, name);
    assert.match(skill, /"instructionsApplied"/u, name);
  }
});
