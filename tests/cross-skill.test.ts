import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("onboarding guides a non-admin through their own steps only", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /When `viewerRole` is not `ADMIN`[^\n]*guide only the steps with `canDo: true`/u);
  assert.match(onboarding, /Do not try the 管理者 steps\./u);
});

test("onboarding runs 募集終了の整理 at 3:00 JST on weekdays by default", () => {
  assert.match(read("onboarding"), /\| 募集終了の整理 \| 平日 3:00 JST \(`0 18 \* \* 0-4` UTC\) \|/u);
});

test("spreadsheet ingest is its own task, less often than mail", () => {
  assert.match(read("onboarding"), /\| スプレッドシート取り込み \| 平日 9:00・13:00 JST \(`0 0,4 \* \* 1-5` UTC\) \|/u);
});

test("mail and sheet ingest run one subagent per company or sheet", () => {
  assert.match(read("process-inbox"), /### 2b\. One subagent per company/u);
  assert.match(read("process-inbox"), /do not call `record_scheduled_task_start`/u);
  assert.match(read("register-spreadsheet-listings"), /one subagent per sheet/u);
  assert.match(read("process-inbox"), /`companyIds: \[<companyId>\]`/u);
  assert.match(read("process-inbox"), /`companyIds: \["unset"\]`/u);
  assert.match(read("onboarding"), /look in the mail ledger first: `list_mail_sources` \(`companyIds: \[<companyId>\]`/u);
});

test("scheduled-task prompts work without the plugin loaded", () => {
  const onboarding = read("onboarding");
  for (const name of ["process-inbox", "evaluate-recent-matchings", "close-stale-source-listings", "register-spreadsheet-listings"]) {
    assert.ok(onboarding.includes(`https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/${name}/SKILL.md`), name);
  }
  assert.doesNotMatch(onboarding, /get_agent_instructions/u);
});

test("every skill folder matches its name", () => {
  for (const name of ["onboarding", "process-inbox", "structured-conditions", "evaluate-recent-matchings", "evaluate-project-matchings", "evaluate-candidate-matchings", "close-stale-source-listings", "register-ses-partner-business-card", "read-office-attachments", "register-spreadsheet-listings"]) {
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
  assert.match(onboarding, /## 2\. 会社スキル/u);
  assert.match(onboarding, /# <会社名> 会社スキル/u);
  assert.match(onboarding, /save each one with `set_company_skill`/u);
  assert.match(onboarding, /No file is handed over or installed on claude\.ai/u);
  assert.doesNotMatch(onboarding, /[Zz]ip|アップロード|upload/u);
  assert.match(onboarding, /Only a difference from these, or a mail layout the shared rules cannot split, needs a 会社スキル/u);
  assert.ok(onboarding.indexOf("## 2. 会社スキル") < onboarding.indexOf("## 5. 定期実行"));
});

test("onboarding lets the customer choose: propose 会社スキル from up to 5 mails per company, or keep the shared skills", () => {
  const onboarding = read("onboarding");
  const section = onboarding.slice(onboarding.indexOf("## 2. 会社スキル"), onboarding.indexOf("## 3. スプレッドシート"));
  assert.match(section, /\*\*メールから提案する（おすすめ）\*\*/u);
  assert.match(section, /\*\*会社スキルは作らない\*\*/u);
  assert.match(section, /List the companies in the 会社台帳 with `list_companies`/u);
  assert.match(section, /Do not pull a whole month of mail with `sync_mail_ledger` here/u);
  assert.doesNotMatch(section, /Pull the last month of mail/u);
  assert.match(section, /look in the mail ledger first: `list_mail_sources` \(`companyIds: \[<companyId>\]`, `direction: INBOUND`, `take: 5`/u);
  assert.match(section, /`sync_company_recent_mail` \(`companyId`, `limit: 5`/u);
  assert.match(section, /read at most 5 of them with `get_mail_source`/u);
  assert.match(section, /one subagent per company/u);
  assert.match(section, /change nothing else: no `set_company_skill`/u);
  assert.doesNotMatch(section, /Ask in one message whether any partner writes mail in its own way/u);
});

test("onboarding does not offer a first spreadsheet import", () => {
  assert.doesNotMatch(read("onboarding"), /Offer to run the first import now/u);
});

test("onboarding starts 会社スキル and 定期実行 only after every required earlier step is done", () => {
  assert.match(read("onboarding"), /Start 2, 3, 4, and 5 only when every earlier required step \(`optional: false`\) is `done`/u);
});

test("onboarding builds the partner list from contacts, not from mail that is not ingested yet", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /連絡先から取得する: call `search_mail_contacts`/u);
  assert.doesNotMatch(onboarding, /メールの送信元から拾って/u);
});

test("onboarding asks first whether to take the partner list from contacts or from text and images", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /First ask where to take the partner list from, with these two choices, and wait for the answer/u);
  assert.match(onboarding, /「連絡先から取得する」/u);
  assert.match(onboarding, /「テキストや画像から取得する」: pasted text, a CSV or Excel file, or an image/u);
});

test("onboarding registers the companies before asking about per-company sorting", () => {
  const onboarding = read("onboarding");
  const register = onboarding.indexOf("4. Register every company first");
  const ask = onboarding.indexOf("5. Before asking about sorting, read how the customer's mail is sorted now");
  assert.ok(register > 0 && ask > register);
  assert.match(onboarding, /the fix plan, made in the same shape as the existing setup/u);
  assert.match(onboarding, /When nothing needs fixing, say so and still give the 取り込みフォルダ plan/u);
  assert.match(onboarding, /The 取り込みフォルダ plan is then every company folder in that plan/u);
  assert.match(onboarding, /If yes, ask how to sort, with the default first: 「受信トレイ\/<会社名>（既定）」 \(Outlook 受信トレイ\/<会社名> and 送信済みアイテム\/<会社名>, Gmail label <会社名>\)/u);
  assert.match(onboarding, /when they have no preference, use the default/u);
  assert.match(onboarding, /Never delete or rename existing folders or rules/u);
  assert.ok(onboarding.indexOf("create_outlook_rule", register) > ask);
  assert.ok(onboarding.indexOf("create_gmail_filter", register) > ask);
});

test("onboarding sets 取り込みフォルダ together with the sorting, with one OK, and leaves 手動同期 to 会社スキル", () => {
  const onboarding = read("onboarding");
  const section = onboarding.slice(onboarding.indexOf("5. Before asking about sorting"), onboarding.indexOf("## 2. 会社スキル"));
  assert.match(section, /Do not show or ask about the folders that are already ingested/u);
  assert.doesNotMatch(section, /Show the folders that are already on/u);
  assert.match(section, /Show the plan as one list and get one OK/u);
  assert.ok(section.indexOf("enable_mail_ingest_folders") > section.indexOf("create_gmail_filter"));
  assert.doesNotMatch(section, /手動同期/u);
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
  const sheet = onboarding.indexOf("## 3. スプレッドシート");
  assert.equal(onboarding.indexOf("## 2. 取り込みフォルダ"), -1);
  assert.match(onboarding, /When `companies` is `done` but `ingest_folders` is not .*start at 5\./u);
  assert.ok(onboarding.indexOf("## 2. 会社スキル") < sheet && sheet < onboarding.indexOf("## 5. 定期実行"));
  assert.match(onboarding, /the company and the sheet URL for each/u);
  assert.match(onboarding, /export\?format=xlsx/u);
  assert.match(onboarding, /「リンクを知っている全員」が閲覧可/u);
  assert.match(onboarding, /Read that company's 会社スキル with `get_company_skill` and add the `## スプレッドシート` section/u);
  assert.match(onboarding, /\| スプレッドシート取り込み \|[^\n]*register-spreadsheet-listings/u);
  assert.match(onboarding, /Create this task only when at least one 会社スキル has a `## スプレッドシート` section/u);
});

test("company skills are read from FlowSES with get_company_skill / list_company_skills", () => {
  for (const name of ["process-inbox", "register-spreadsheet-listings"]) {
    assert.match(read(name), /get_company_skill/u, name);
    assert.doesNotMatch(read(name), /older setups|account skills/u, name);
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

test("onboarding asks about each matching default one at a time and saves three instructions", () => {
  const onboarding = read("onboarding");
  const step = onboarding.indexOf("## 4. マッチングの指示");
  assert.ok(onboarding.indexOf("## 3. スプレッドシート") < step && step < onboarding.indexOf("## 5. 定期実行"));
  const body = onboarding.slice(step, onboarding.indexOf("## 5. 定期実行"));
  assert.match(body, /ask about each item below one at a time/u);
  assert.match(body, /1\. 絞り込み方 /u);
  assert.match(body, /勤務地（都道府県）: 出社がある案件は、要員の都道府県が案件と同じ地方のときだけ候補にする/u);
  assert.doesNotMatch(body, /同じエリアと隣のエリア/u);
  assert.match(body, /2\. 比較の仕方 /u);
  assert.match(body, /3\. 理由の書き方 /u);
  assert.match(body, /単価とマージン \(ask together as one item\)/u);
  assert.match(body, /派遣契約必須の案件: 派遣契約必須の案件もマッチングする/u);
  assert.doesNotMatch(body, /these do not change and are not asked/u);
  assert.match(body, /`set_matching_instructions` \(`filterInstructions`, `comparisonInstructions`, `reasonInstructions`; ADMIN only\)/u);
});

test("both matching skills treat every rule as a default an instruction may change", () => {
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    const skill = read(name) + read("matching-rules");
    assert.match(read(name), /Read and follow `flow-ses:matching-rules`/u, name);
    assert.match(skill, /Call `get_matching_instructions` once/u, name);
    assert.match(skill, /## 自社の指示 \(company matching instructions\)/u, name);
    assert.match(skill, /`filterInstructions` \(絞り込み方\)/u, name);
    assert.match(skill, /`comparisonInstructions` \(比較の仕方\)/u, name);
    assert.match(skill, /`reasonInstructions` \(理由の書き方\)/u, name);
    assert.match(skill, /Where an instruction and the matching skill differ, follow the instruction/u, name);
    assert.doesNotMatch(skill, /Fixed rules/u, name);
    assert.match(skill, /Every rule of the matching skill is a default that an instruction may change/u, name);
    assert.doesNotMatch(skill, /a borderline pair \(微妙\) is never created/u, name);
    assert.doesNotMatch(skill, /a pair with a ✕ on any 必須 item is never created/u, name);
    assert.match(skill, /必須が3つ以上なら✕を1つまで認める/u, name);
    assert.match(skill, /the default has no margin/u, name);
    assert.doesNotMatch(skill, /comparableUnitPrice|5万, or 3万/u, name);
    assert.match(skill, /時給 × 160 ÷ 10,000 is its 1人月あたり 万円 \(160時間\)/u, name);
    assert.match(skill, /"instructionsApplied": \{ "filter": false, "comparison": false, "reason": false \}/u, name);
  }
});

test("the plugin has no distribution draft skill", () => {
  assert.equal(existsSync(new URL("../skills/generate-distribution-draft", import.meta.url)), false);
  for (const name of ["process-inbox", "onboarding", "structured-conditions"]) {
    assert.doesNotMatch(read(name), /generate-distribution-draft/u, name);
  }
});

test("onboarding asks which partners decline distribution and saves it on the company", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /ask which partners do not want 案件配信 or 要員配信/u);
  assert.match(onboarding, /`set_company_distribution_acceptance` with `projectDistributionAccepted: false` or `candidateDistributionAccepted: false`/u);
  assert.ok(onboarding.indexOf("set_company_distribution_acceptance") < onboarding.indexOf("5. Before asking about sorting"));
});

test("the two matching skills keep their shared rules only in matching-rules", () => {
  const rules = read("matching-rules");
  assert.match(rules, /^name: matching-rules$/mu);
  assert.match(rules, /Do not use it on its own/u);
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    const skill = read(name);
    for (const heading of ["3. Read overview and the skill sheet", "4. Create or skip"]) {
      assert.match(skill, new RegExp(`### ${heading}`, "u"), name);
      assert.match(skill, new RegExp(`「${heading}」`, "u"), name);
    }
    // 共有部分の本文はここに無い。
    assert.doesNotMatch(skill, /\*\*主業務と売り方 \(required\):\*\*/u, name);
    assert.doesNotMatch(skill, /### 5\./u, name);
  }
  assert.doesNotMatch(rules, /単価についてもご相談可能と拝見しております/u);
});

test("onboarding reads the 会社スキル, スプレッドシート, and マッチングの指示 steps from get_onboarding_status", () => {
  const onboarding = read("onboarding");
  for (const key of ["company_skills", "spreadsheets", "matching_instructions"]) {
    assert.match(onboarding, new RegExp(`\`${key}\``, "u"), key);
  }
  assert.doesNotMatch(onboarding, /`get_onboarding_status` does not track this step/u);
});

test("onboarding asks about each 募集終了の整理 default one at a time and writes the answers into the prompt", () => {
  const onboarding = read("onboarding");
  const body = onboarding.slice(onboarding.indexOf("## 5. 定期実行"), onboarding.indexOf("## Finish"));
  assert.match(body, /Then ask how 募集終了の整理 should work, as in 4/u);
  assert.match(body, /AskUserQuestion/u);
  assert.match(body, /1\. いつ動かすか: 既定は平日 3:00 JST/u);
  assert.match(body, /2\. 何営業日で閉じるか: 既定は、新しい元ソースが直近3営業日/u);
  assert.match(body, /3\. 閉じない会社: 既定はなし/u);
  assert.match(body, /4\. 未設定のマッチングの却下: 既定は/u);
  assert.match(body, /replace 「直近3営業日」 in the prompt with 「直近N営業日」/u);
  assert.match(body, /「未設定のマッチングの却下はしない。」/u);
  assert.match(read("close-stale-source-listings"), /「対象外の会社: <会社名>、…」/u);
});

test("onboarding asks every question with AskUserQuestion choices", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /^## Questions$/mu);
  assert.match(onboarding, /Ask every question to the customer with this session's question tool with choices \(AskUserQuestion\)/u);
  assert.match(onboarding, /do not add your own 「その他」 choice/u);
  assert.match(onboarding, /「設定した」「やり方がわからない」/u);
  // 選択肢のない聞き方が残っていない。
  assert.doesNotMatch(onboarding, /Ask in one message/u);
  assert.doesNotMatch(onboarding, /Wait until the customer says it is done/u);
});
