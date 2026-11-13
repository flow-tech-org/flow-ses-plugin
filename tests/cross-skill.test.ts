import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");

test("matching skills cover company URL register runs", () => {
  // 処理対象の表は両側共通なので matching-rules にある。
  assert.match(read("matching-rules"), /\| Company URL register skill \(one partner company's URL: a spreadsheet, a shared file, or a page\) \|/u);
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    assert.match(read(name), /flow-ses:matching-rules/u);
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

test("URL ingest is its own task, less often than mail", () => {
  assert.match(read("onboarding"), /\| URL取り込み \| 平日 9:00・13:00 JST \(`0 0,4 \* \* 1-5` UTC\) \|/u);
});

test("mail and sheet ingest run one subagent per company or sheet", () => {
  assert.match(read("process-inbox"), /### 2b\. One subagent per company/u);
  assert.match(read("process-inbox"), /do not call `record_scheduled_task_start`/u);
  assert.match(read("register-url-listings"), /one subagent per target/u);
  assert.match(read("process-inbox"), /`companyIds: \[<companyId>\]`/u);
  assert.match(read("process-inbox"), /`companyIds: \["unset"\]`/u);
  assert.match(read("onboarding"), /list that mail with `list_mail_sources` \(`companyIds: \[<companyId>\]`/u);
});

test("scheduled tasks are created without connectors and the customer adds flow-ses and the URL hosts", () => {
  assert.match(read("onboarding"), /create them without a connector and ask the customer to add the flow-ses connector/u);
  assert.match(read("onboarding"), /to the allowed domains of the environment the URL取り込み task runs in/u);
});

test("onboarding asks the scheduled-task model with Haiku as the default", () => {
  assert.match(read("onboarding"), /ask which model the tasks run on, with the question tool \(AskUserQuestion/u);
  assert.match(read("onboarding"), /「Haiku（既定・おすすめ）」「Sonnet」「タスクごとに選ぶ」/u);
  assert.match(read("onboarding"), /新着通知 and 募集終了の整理 always run on Haiku and are not asked/u);
  assert.match(read("onboarding"), /\(新着通知 and 募集終了の整理 to Haiku\)/u);
});

test("mail ingest handles mail oldest first and finishes each before the next", () => {
  assert.match(read("process-inbox"), /### 2c\. Oldest first, one mail at a time/u);
  assert.match(read("process-inbox"), /oldest first\. Then take one mail at a time and finish it before the next/u);
  assert.match(read("process-inbox"), /oldest first and one mail at a time as in \[2c\]/u);
});

test("scheduled-task prompts work without the plugin loaded", () => {
  const onboarding = read("onboarding");
  for (const name of ["process-inbox", "evaluate-recent-matchings", "close-stale-source-listings", "register-url-listings"]) {
    assert.ok(onboarding.includes(`https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/${name}/SKILL.md`), name);
  }
  assert.doesNotMatch(onboarding, /get_agent_instructions/u);
});

test("every skill folder matches its name", () => {
  for (const name of ["onboarding", "process-inbox", "structured-conditions", "evaluate-recent-matchings", "evaluate-project-matchings", "evaluate-candidate-matchings", "close-stale-source-listings", "register-ses-partner-business-card", "read-office-attachments", "register-url-listings"]) {
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
  assert.ok(onboarding.indexOf("## 2. 会社スキル") < onboarding.indexOf("## 6. 定期実行"));
});

test("onboarding lets the customer choose: propose 会社スキル from each company's mail of a chosen period, or keep the shared skills", () => {
  const onboarding = read("onboarding");
  const section = onboarding.slice(onboarding.indexOf("## 2. 会社スキル"), onboarding.indexOf("## 3. URL取り込み"));
  assert.match(section, /\*\*メールから提案する（おすすめ）\*\*/u);
  assert.match(section, /\*\*会社スキルは作らない\*\*/u);
  assert.match(section, /Ask how far back to read, with these choices: \*\*1週間（おすすめ）\*\* \(7 days\)/u);
  assert.match(section, /List the companies in the 会社台帳 with `list_companies`/u);
  assert.match(section, /Do not pull every company's mail at once with `sync_mail_ledger` here/u);
  assert.match(section, /`sync_company_recent_mail` \(`companyId`, `days: N`, no `limit`/u);
  assert.match(section, /`list_mail_sources` \(`companyIds: \[<companyId>\]`, `direction: INBOUND`, `occurredFrom`: N days before now/u);
  assert.doesNotMatch(section, /limit: 5|take: 5|at most 5/u);
  assert.match(section, /one subagent per company/u);
  assert.match(section, /change nothing else: no `set_company_skill`/u);
  assert.doesNotMatch(section, /Ask in one message whether any partner writes mail in its own way/u);
});

test("onboarding does not offer a first URL import", () => {
  assert.doesNotMatch(read("onboarding"), /Offer to run the first import now/u);
});

test("onboarding starts 会社スキル and 定期実行 only after every required earlier step is done", () => {
  assert.match(read("onboarding"), /Start 2, 3, 4, 5, and 6 only when every earlier required step \(`optional: false`\) is `done`/u);
});

test("onboarding does not ask whether to set optional dashboard steps such as Teams・Slack 通知", () => {
  const onboarding = read("onboarding");
  assert.doesNotMatch(onboarding, /ask whether they want it \(「設定する」「今はしない」\)/u);
  assert.match(onboarding, /An optional step \(`optional: true`, such as `notification` or `signature`\) is not a question/u);
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
  const register = onboarding.indexOf("4. Register every company");
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

test("onboarding registers partner URLs after mail import, in the company's 会社スキル", () => {
  const onboarding = read("onboarding");
  const step = onboarding.indexOf("## 3. URL取り込み");
  assert.equal(onboarding.indexOf("## 2. 取り込みフォルダ"), -1);
  assert.match(onboarding, /When `companies` is `done` but `ingest_folders` is not .*start at 5\./u);
  assert.ok(onboarding.indexOf("## 2. 会社スキル") < step && step < onboarding.indexOf("## 6. 定期実行"));
  assert.match(onboarding, /the company and the URL for each/u);
  assert.match(onboarding, /only URLs that open without signing in can be imported/u);
  assert.match(onboarding, /「リンクを知っている全員」が閲覧可/u);
  assert.match(onboarding, /Read that company's 会社スキル with `get_company_skill` and add the `## URL取り込み` section/u);
  assert.match(onboarding, /\| URL取り込み \|[^\n]*register-url-listings/u);
  assert.match(onboarding, /Create this task only when at least one 会社スキル has a `## URL取り込み` section/u);
});

test("onboarding lists every host a URL download reaches for the task's allowed domains", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /Those hosts are the ドメイン the scheduled task's environment must allow/u);
  assert.match(onboarding, /`docs\.google\.com` and `\*\.googleusercontent\.com`/u);
  assert.doesNotMatch(read("register-url-listings"), /## スプレッドシート/u);
  assert.match(onboarding, /add every ドメイン written in the 会社スキル `## URL取り込み` parts/u);
  assert.doesNotMatch(onboarding, /add `docs\.google\.com` to the allowed domains/u);
});

test("company skills are read from Flow SES with get_company_skill / list_company_skills", () => {
  for (const name of ["process-inbox", "register-url-listings"]) {
    assert.match(read(name), /get_company_skill/u, name);
    assert.doesNotMatch(read(name), /older setups|account skills/u, name);
  }
  assert.match(read("register-url-listings"), /`list_company_skills` with `query: "## URL取り込み"` and paginate/u);
  assert.match(read("structured-conditions"), /`get_company_skill` で読む/u);
});

test("URL register skill keeps company facts in the 会社スキル and URL sources append-only", () => {
  const skill = read("register-url-listings");
  assert.match(skill, /Every company-specific fact \(URL, format, tabs or page layout, which value means 募集中, tag\) is in that company's 会社スキル/u);
  assert.match(skill, /URL sources are append-only/u);
  assert.match(skill, /Create only on `NONE`/u);
  assert.doesNotMatch(skill, /linkedUrlContains/u);
  assert.match(skill, /never pass `ownCompany: true`/u);
  assert.match(skill, /flow-ses:close-stale-source-listings/u);
  assert.match(skill, /notPublic/u);
});

test("URL register skill never signs in and reads tables and pages", () => {
  const skill = read("register-url-listings");
  assert.match(skill, /Only URLs that open without signing in are in scope/u);
  assert.match(skill, /Never sign in, never enter a password/u);
  assert.match(skill, /export\?format=xlsx/u);
  assert.match(skill, /`download=1`/u);
  assert.match(skill, /`needsBrowser`/u);
  assert.match(skill, /`downloadBlocked` \(with the host\)/u);
  assert.match(skill, /When the 会社スキル gives ページ送り, follow it to the next list page/u);
  assert.match(skill, /Read only what the sheet shows: skip a tab whose `sheet_state` is not `visible`, a row whose `row_dimensions\[r\]\.hidden` is true/u);
  assert.match(skill, /`非表示も読む`/u);
  assert.match(read("onboarding"), /- ページ送り: なし \//u);
});

test("onboarding asks about each matching default one at a time and saves three instructions", () => {
  const onboarding = read("onboarding");
  const step = onboarding.indexOf("## 4. マッチングの指示");
  assert.ok(onboarding.indexOf("## 3. URL取り込み") < step && step < onboarding.indexOf("## 6. 定期実行"));
  const body = onboarding.slice(step, onboarding.indexOf("## 6. 定期実行"));
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
  assert.match(onboarding, /Ask which partners do not want 案件配信 or 要員配信/u);
  assert.match(onboarding, /`projectDistributionAccepted: false` or `candidateDistributionAccepted: false`/u);
  assert.ok(onboarding.indexOf("projectDistributionAccepted: false") < onboarding.indexOf("5. Before asking about sorting"));
});

test("onboarding registers the partner list with one register_companies call", () => {
  const onboarding = read("onboarding");
  const step = onboarding.slice(onboarding.indexOf("4. Register every company"), onboarding.indexOf("5. Before asking about sorting"));
  assert.match(step, /in one `register_companies` call/u);
  assert.match(step, /Do not call `add_company_contact` or `set_company_distribution_acceptance` company by company/u);
  assert.doesNotMatch(onboarding, /ensure_company/u);
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

test("onboarding reads the 会社スキル, URL取り込み, and マッチングの指示 steps from get_onboarding_status", () => {
  const onboarding = read("onboarding");
  for (const key of ["company_skills", "url_imports", "matching_instructions"]) {
    assert.match(onboarding, new RegExp(`\`${key}\``, "u"), key);
  }
  assert.doesNotMatch(onboarding, /`get_onboarding_status` does not track this step/u);
});

test("onboarding asks about each 募集終了の整理 default one at a time and writes the answers into the prompt", () => {
  const onboarding = read("onboarding");
  const body = onboarding.slice(onboarding.indexOf("## 6. 定期実行"), onboarding.indexOf("## Finish"));
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
  // 画面のステップは「設定しましたか」と聞かず、状態を取り直して手順を示す。
  assert.doesNotMatch(onboarding, /「設定しましたか」/u);
  assert.doesNotMatch(onboarding, /「やり方がわからない」/u);
  assert.match(onboarding, /Do not ask whether the customer has set it/u);
  assert.match(onboarding, /画面の手順 \(the Flow SES screen labels\)/u);
  // 選択肢のない聞き方が残っていない。
  assert.doesNotMatch(onboarding, /Ask in one message/u);
  assert.doesNotMatch(onboarding, /Wait until the customer says it is done/u);
});

test("onboarding checks the partner list with two questions and no third OK", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /Check the list with exactly two questions, and do not ask a third OK on the whole table after them/u);
  assert.doesNotMatch(onboarding, /この内容で登録する/u);
});

test("onboarding checks and saves the 配信メールの文面 through the connector", () => {
  const skill = read("onboarding");
  const step = skill.indexOf("## 5. 配信メールの文面 (`mail_texts`)");
  assert.ok(skill.indexOf("## 4. マッチングの指示") < step && step < skill.indexOf("## 6. 定期実行"));
  assert.match(skill, /`get_mail_texts`[\s\S]*「既定のままでよい（おすすめ）」「変えたい」[\s\S]*`set_mail_texts`/u);
  // 質問の前に、今の文面を項目ごとにそのまま見せる（聞かれるまで文面が分からなかった）
  const body = skill.slice(step, skill.indexOf("## 6. 定期実行"));
  assert.match(body, /before any question, send one message that shows every field it returns/u);
  assert.match(body, /the text in use \(`text`\) word for word/u);
  assert.ok(body.indexOf("send one message") < body.indexOf("「上の文面でよいですか」"));
});

test("マッチングは元1件ずつサブエージェントで進め、作る直前に保存値で単価をもう一度確かめる", () => {
  const rules = read("matching-rules");
  assert.match(rules, /## One subagent per anchor/u);
  assert.match(rules, /start one subagent per anchor with this session's subagent tool \(the Agent \/ Task tool\), several at once \(about 5 at a time\)/u);
  assert.match(rules, /do not call `get_matching_instructions`, `get_scheduled_task_last_start`, or `record_scheduled_task_start`/u);
  assert.match(rules, /A subagent that failed or did not finish counts as stopping early/u);
  assert.match(rules, /With one anchor, or when this session has no subagent tool, do steps 2 to 4 here one anchor at a time/u);
  assert.match(rules, /\*\*単価の最終確認 \(required\):\*\* right before each `create_matching`/u);
  assert.match(rules, /単価相談可 \(`rateNegotiable`\) never lets a pair over the project's max/u);
  assert.match(rules, /案件 80万（税別・相談不可）, 要員 85万（税別・相談可）, no margin → `単価超過`/u);
  assert.doesNotMatch(rules, /do not require another rate-ceiling check/u);
  for (const name of ["evaluate-project-matchings", "evaluate-candidate-matchings"]) {
    assert.match(read(name), /in its own subagent as `flow-ses:matching-rules` 「One subagent per anchor」 says/u);
  }
  assert.match(read("evaluate-recent-matchings"), /a side whose matching skill lists any anchor under `errors`/u);
});

test("直近の新規マッチングは案件側と要員側を同時にサブエージェントで動かす", () => {
  const skill = read("evaluate-recent-matchings");
  assert.match(skill, /Run the two sides at the same time, not one after the other/u);
  assert.match(skill, /about 5 at a time in total across both sides/u);
  assert.match(skill, /a subagent cannot start its own subagents, so this session starts them for both sides/u);
  assert.match(skill, /`reused: true`, which is not an error and is not counted as created/u);
  assert.doesNotMatch(skill, /Finish one side before starting the other/u);
});

test("onboarding ends every scheduled-task prompt with the advance permission line", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /End every prompt \(all five, after any lines added in 1\) with this 許可の一文, word for word:/u);
  assert.match(onboarding, /> この定期実行は人が見ていないときに動く。[^\n]*すべて事前に許可している。確認を求めずにそのまま実行する。手順書が禁じている操作とメールの送信はしない。/u);
});

test("onboarding gives hand-work steps per scheduled task and asks for a report instead of a question card", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /is not a question\. Never ask with the question tool whether it is done/u);
  assert.match(onboarding, /\| 定期実行の名前 \| コネクタ \| ネットワーク（許可するドメイン） \| モデル \|/u);
  assert.match(onboarding, /End the message with 「終わったら、ひとこと送ってください。」 and wait\. Do not ask with the question tool whether it is done\./u);
  assert.doesNotMatch(onboarding, /[Aa]sk (with the choices )?「(設定した|できた|登録した)」/u);
});

test("onboarding gives sharing-change steps instead of a question card", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /「一般的なアクセス」 to 「リンクを知っている全員」/u);
  assert.match(onboarding, /「共有を変えたら、ひとこと送ってください。/u);
  assert.doesNotMatch(onboarding, /「共有を変えた」「このURLは飛ばす」/u);
});

test("Google exports always allow *.googleusercontent.com", () => {
  assert.match(read("register-url-listings"), /its ドメイン are `docs\.google\.com` and `\*\.googleusercontent\.com`/u);
  assert.match(read("register-url-listings"), /name `\*\.googleusercontent\.com` instead of that one host/u);
  assert.match(read("onboarding"), /list both `docs\.google\.com` and `\*\.googleusercontent\.com`/u);
});

test("URL register skill reads JavaScript pages with the bundled page reader", () => {
  const skill = read("register-url-listings");
  assert.match(skill, /node <this skill's directory>\/scripts\/read-page\.cjs <URL>/u);
  assert.match(skill, /raw\.githubusercontent\.com\/flow-tech-org\/flow-ses-plugin\/main\/skills\/register-url-listings\/scripts\/read-page\.cjs/u);
  assert.match(skill, /- 読み方 \(`ページ` only, optional\): `ダウンロード`/u);
  assert.match(skill, /Report `botCheck` and skip the URL\. Never try to solve or get around it\./u);
  assert.match(skill, /never solve or get around a robot check/u);
  const onboarding = read("onboarding");
  assert.match(onboarding, /every host in its `hosts` goes into ドメイン too/u);
  assert.match(onboarding, /- 読み方: ダウンロード \/ ブラウザ（ページのときだけ）/u);
  assert.ok(existsSync(new URL("../skills/register-url-listings/scripts/read-page.cjs", import.meta.url)));
});
