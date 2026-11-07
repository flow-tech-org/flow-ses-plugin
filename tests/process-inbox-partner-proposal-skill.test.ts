import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = readFileSync(
  new URL("../skills/process-inbox/SKILL.md", import.meta.url),
  "utf8",
);
const conditions = readFileSync(
  new URL("../skills/structured-conditions/SKILL.md", import.meta.url),
  "utf8",
);

test("inbox skill still forbids list_projects as a distribution update-target scan", () => {
  assert.match(skill, /Do \*\*not\*\* call `list_projects` \/ `list_candidates` to invent an update set/u);
  assert.match(skill, /Do \*\*not\*\* use this list call to invent distribution\/attachment update targets/u);
});

test("inbox skill refreshes overview and attachments only for newly linked or created records", () => {
  assert.match(skill, /match_project_overviews/u);
  assert.match(skill, /match_candidate_overviews/u);
  assert.match(skill, /Touched for overview\/conditions\*\* is only mail that `match_project_overviews` or `match_candidate_overviews` returns `NEAR`, `AMBIGUOUS`, or `NONE`/u);
  assert.doesNotMatch(skill, /unique `newlyLinkedRecords` with `recordId` \/ `recordType` \/ `title` \/ `sourceIds`/u);
  assert.match(skill, /Touched for overview\/conditions\*\* is only/u);
  assert.match(skill, /Do \*\*not\*\* scan `list_mail_sources` with `hasRecordLink: true` to refresh overview or attachments/u);
  assert.match(skill, /Do \*\*not\*\* call `list_projects` \/ `list_candidates` to invent an update set/u);
  assert.doesNotMatch(skill, /Touched for distribution and overview\/attachments\*\* is the union of/u);
  assert.doesNotMatch(skill, /already linked to an inbound 元メール \(profile or re-send/u);
  assert.match(skill, /Matching is out of scope: use `flow-ses:evaluate-candidate-matchings` \(candidate-side\) or `flow-ses:evaluate-project-matchings` \(project-side\)/u);
});

test("inbox skill leaves matching evaluation to the candidate-side and project-side skills", () => {
  assert.match(skill, /match_project_overviews/u);
  assert.match(skill, /match_candidate_overviews/u);
  assert.match(skill, /Matching evaluation is out of scope/u);
  assert.match(skill, /flow-ses:evaluate-candidate-matchings/u);
  assert.match(skill, /flow-ses:evaluate-project-matchings/u);
  assert.match(skill, /candidate-side/u);
  assert.match(skill, /project-side/u);
  assert.match(skill, /create_matching/u);
  assert.doesNotMatch(skill, /Build the processed matching set/u);
  assert.doesNotMatch(skill, /Build the 3-business-day partner pool/u);
  assert.doesNotMatch(skill, /matchingProcessed/u);
  assert.doesNotMatch(skill, /create_matching only rejects same-company pairs/u);
});

test("inbox skill follows the sender company's 会社スキル when splitting one mail", () => {
  assert.doesNotMatch(skill, /get_company_registration_habit/u);
  assert.doesNotMatch(skill, /get_company_distribution_habit/u);
  assert.doesNotMatch(skill, /registrationHabitText/u);
  assert.match(skill, /the customer's own skill for that company, whose description lists that company's mail domain/u);
  assert.match(skill, /ordinals: \[1, 2, …, N\]/u);
  assert.doesNotMatch(skill, /add_project_attachment_reference/u);
  assert.match(skill, /スキルシート未確認/u);
  assert.match(skill, /never in this shared skill and never on the company ledger/u);
  assert.match(skill, /how to interpret structured conditions/u);
  assert.match(skill, /会社スキルに税区分の解釈があるときはそれに従う/u);
  assert.match(skill, /ある会社のサイト掲載は 案件情報 \/ 希望条件 \/ 契約情報を省略せず載せる/u);
});

test("inbox skill follows structured conditions for candidate gender and keeps mail targeting", () => {
  assert.match(skill, /#### 要員の性別/u);
  assert.match(skill, /対象は、この実行でまだ紐づいていない受信の要員メールである/u);
  assert.match(skill, /返信、送信、提案、`OTHER` は対象にしない/u);
  assert.match(skill, /要員の性別は `flow-ses:structured-conditions` に従う/u);
  assert.match(skill, /手順の本文はそこが正本で、ここでは繰り返さない/u);
  assert.match(skill, /新規の性別を `MALE` にしない/u);
  assert.match(skill, /個人事業主はスキルシート必須にしない/u);
  assert.match(skill, /新規の個人事業主を `false` にしない/u);
  assert.match(skill, /開始年月は、これまでどおり、本文と会社スキルに無くシートにあれば使う/u);
  assert.match(skill, /Do not use the sheet for projects/u);
  assert.match(skill, /メールに付いた FILE/u);
  assert.match(skill, /概要を保存したあと `add_candidate_attachment_from_url` で URL を FILE にし/u);
  assert.match(skill, /エージェントがその URL を別にダウンロードして読まない/u);
  assert.match(skill, /`includeText: true` で呼び、返った `extractedText`/u);
  assert.match(skill, /get_candidate_attachment_download_link/u);
  assert.match(skill, /`get_source_attachment_download_link` はこの読みに使わない/u);
  assert.match(skill, /delete_candidate/u);
  // A public sheet URL is fetched once, by the server, and read from its stored text.
  assert.doesNotMatch(skill, /record を作る前に読む/u);
  assert.doesNotMatch(skill, /公開 URL のシートは読んでから/u);
  assert.match(
    skill,
    /before `update_candidate` when the sheet is a mail FILE, and after the overview save and `add_candidate_attachment_from_url` when the sheet is a public Docs \/ Sheets \/ Drive URL/u,
  );
  assert.match(skill, /Do not read the sheet only because `isSoloProprietor` is unstated/u);
  assert.doesNotMatch(skill, /#### 要員登録の前にスキルシートを読む/u);
  assert.doesNotMatch(skill, /シートを見ても性別または個人事業主が決まらなければ、その要員は登録しない/u);
  assert.doesNotMatch(skill, /要員の性別と個人事業主がメールから決まらなければそのレコードは作らない/u);
  assert.match(conditions, /## 要員の性別/u);
  assert.match(conditions, /要員の性別は、掲載文・メール本文・セルを先に読む。男性か女性と書いてあればそれを使う/u);
  assert.match(conditions, /そこに無いときだけ、その要員のスキルシートを読んで性別を決める/u);
  assert.match(conditions, /公開の Google Docs \/ Sheets \/ Drive のファイル、または添付/u);
  assert.match(conditions, /シートに男性か女性とあればそれを保存する/u);
  assert.match(conditions, /シートにも無い、またはシートを読めないときは `gender: null`（未設定）で登録する/u);
  assert.match(skill, /性別が無いことで要員を `delete_candidate` しない/u);
  assert.match(conditions, /新規の性別を `MALE` にしない/u);
  assert.match(conditions, /シートを開けなかっただけでは、他の理由が無い限り `reviewRequired` にしない/u);
  assert.match(conditions, /`スキルシート未確認` と、性別を未設定で登録した旨を報告する/u);
  assert.match(conditions, /個人事業主の未記載をスキルシート必須にはしない/u);
  assert.match(conditions, /エージェントは同じ URL を別に書き出したりダウンロードしたりしない/u);
  assert.match(conditions, /`update_candidate` で `gender` だけを送る/u);
  assert.match(conditions, /flow-ses:read-office-attachments/u);
  assert.doesNotMatch(
    conditions,
    /要員の性別と個人事業主がソースからも会社スキルからも、受信処理が登録前に読むスキルシートからも決まらなければ登録しない/u,
  );
  assert.doesNotMatch(
    conditions,
    /要員の性別と個人事業主がソースからも会社スキルからも決まらなければ登録しない/u,
  );
});

test("inbox skill decides identity only with match_project_overviews or match_candidate_overviews", () => {
  assert.match(skill, /match_project_overviews/u);
  assert.match(skill, /match_candidate_overviews/u);
  assert.match(skill, /recruitmentStatuses: \["unset"\]/u);
  assert.match(skill, /候補は `match_project_overviews` または `match_candidate_overviews` が返す。会社スキルの件名尾・氏名年齢・案件名の一致では紐づけない/u);
  assert.match(skill, /Do not pass a pre-rendered overview or the full mail body/u);
  assert.doesNotMatch(skill, /`overview` = the excerpt this run would save/u);
  assert.match(skill, /profile_resend_exact/u);
  assert.match(skill, /profile_resend_near/u);
  assert.match(skill, /profile_resend_ambiguous/u);
  assert.match(skill, /`NEAR`: read the mail and each returned record's stored 概要/u);
  assert.match(skill, /`AMBIGUOUS`: the same confirmation/u);
  assert.match(skill, /Link and update only a record the stored 概要 shows is the same 案件 or 要員/u);
  assert.doesNotMatch(skill, /`NEAR`: link every returned record/u);
  assert.doesNotMatch(skill, /`AMBIGUOUS`: link every returned record/u);
  assert.doesNotMatch(skill, /`AMBIGUOUS`: `review_required`/u);
  assert.match(skill, /`NONE`: continue to create/u);
  assert.match(skill, /`link_source_to_record`/u);
  assert.doesNotMatch(skill, /find_outlook_profile_resend/u);
  assert.doesNotMatch(skill, /registration_habit_reuse/u);
  assert.doesNotMatch(skill, /▼/u);
  assert.doesNotMatch(skill, /会社スキル既存複数/u);
});

test("inbox skill creates clear external proposals but not ordinary replies", () => {
  assert.match(skill, /create_matching_from_mail_source/u);
  assert.doesNotMatch(skill, /matching_proposal|MATCHING_PROPOSAL/u);
  assert.match(skill, /list_mail_sources/u);
  assert.doesNotMatch(skill, /create_matching_proposal_from_mail|list_mail_references/u);
  assert.match(skill, /concrete candidate in response to a project distribution/u);
  assert.match(skill, /concrete project in response to a candidate distribution/u);
  assert.match(skill, /Do not create a マッチング for an acknowledgement, question, interview scheduling, decline/u);
  assert.match(skill, /create a マッチング merely because the subject starts with `Re:`/u);
});

test("inbox skill refreshes overview and record attachments from the latest source", () => {
  assert.match(skill, /### 5b\. Set or refresh 案件概要 \/ 要員概要 \(`overview`\), structured conditions, and record attachments/u);
  assert.match(skill, /add_project_attachment_from_mail_source/u);
  assert.match(skill, /profileSet/u);
  assert.match(skill, /既に最新元ソース/u);
  assert.match(skill, /Do not copy the mail body onto the condition/u);
  assert.doesNotMatch(skill, /Always `set_\*_overview` after a successful preview/u);
  assert.match(skill, /`既に最新元ソース` is not a profile skip/u);
  assert.match(skill, /compare_project_profile_source/u);
  assert.match(skill, /compare_candidate_profile_source/u);
  assert.match(skill, /元メールの内容に変更なし/u);
  assert.match(skill, /`EXACT` is the same skip when the body matches and the subject differs/u);
  assert.doesNotMatch(skill, /MISSING_FINGERPRINT/u);
  assert.match(skill, /Do not call `get_mail_source`, `set_\*_overview`/u);
  assert.doesNotMatch(skill, /Do \*\*not\*\* skip `set_\*_overview` when stored `overview` already equals the previewed core/u);
  assert.doesNotMatch(skill, /Identical 再送 text still needs `set_\*_overview`/u);
  assert.match(skill, /Do \*\*not\*\* call `add_project_attachment_from_mail_source` \/ `add_candidate_attachment_from_mail_source` to refresh Outlook FILE copies/u);
  assert.match(skill, /add_candidate_attachment_from_url/u);
  assert.match(skill, /Google Docs, Sheets, and Drive URLs are a public HTTPS download/u);
  assert.match(skill, /does not call Drive API or use a user access token/u);
  assert.match(skill, /Do not ask the user to connect or reauthenticate Google/u);
  assert.doesNotMatch(skill, /calling user's Drive connection/u);
  assert.doesNotMatch(skill, /tell the user to reauthenticate/u);
  assert.doesNotMatch(skill, /ユーザー設定の Google接続/u);
  assert.match(skill, /Do not copy that URL into 原文/u);
  assert.match(skill, /Do not append `\[スキルシート\]\(url\)` to the overview/u);
  assert.doesNotMatch(skill, /append them to the overview as markdown links/u);
  assert.doesNotMatch(skill, /append each URL to that record's overview as a markdown link/u);
  assert.match(skill, /Do not copy Outlook reference-only attachments/u);
  assert.doesNotMatch(skill, /stored `overview` already equals the previewed core — skip overview/u);
  assert.doesNotMatch(skill, /Skip overview when stored `overview` already equals the SOURCE_RECIPE preview/u);
  assert.doesNotMatch(skill, /preview_project_overview/u);
  assert.doesNotMatch(skill, /preview_candidate_overview/u);
  assert.match(skill, /set_project_overview/u);
  assert.match(skill, /preview_source_recipe/u);
  assert.doesNotMatch(skill, /the no-duplicate split wins/u);
  assert.match(skill, /会社スキル rules for block count, 税区分, and 再配信 still apply/u);
  assert.match(skill, /Before tagging, `search_skills`/u);
  assert.doesNotMatch(skill, /There is no `skills` column/u);
  assert.doesNotMatch(skill, /Write project `requiredSkills` \/ `preferredSkills` and candidate `skills` on the condition update/u);
  assert.match(skill, /Put 必須 and 歓迎 lines in the overview excerpt/u);
  assert.doesNotMatch(skill, /requiredSkills/u);
  assert.doesNotMatch(skill, /overviewInformation/u);
  assert.match(skill, /Do not pass `expectedVersion`/u);
  assert.match(skill, /copiedFromSourceId/u);
  assert.match(skill, /手動 upload/u);
  assert.match(skill, /Auto-link does \*\*not\*\* refresh attachments/u);
  assert.match(skill, /Create copies copyable Outlook FILE attachments from that source/u);
  assert.match(skill, /Do \*\*not\*\* pass `overview` on this call/u);
  assert.match(skill, /未記載は `EXCLUDED`（税抜）/u);
  assert.match(skill, /未記載は `false`（不可）/u);
  assert.match(skill, /unstated 単価税区分 is `EXCLUDED` and unstated 単価相談 is `false`/u);
  assert.match(skill, /projectCondition/u);
  assert.match(skill, /Do not call `get_url_source` to read a mail body/u);
  assert.doesNotMatch(skill, /get_project_sources|get_candidate_sources|get_\*_sources/u);
  assert.doesNotMatch(skill, /get_\* still hydrates Outlook bodies/u);
  assert.match(skill, /do \*\*not\*\* apply the distribution ±5万 shift/u);
  assert.doesNotMatch(skill, /Build the processed matching set/u);
  assert.doesNotMatch(skill, /compatibleWithProjectId/u);
  assert.doesNotMatch(skill, /Tone \(required\)/u);
});

test("inbox skill maps 一部出社 to hybrid and 出社 to フル出社", () => {
  assert.match(skill, /flow-ses:structured-conditions/u);
  assert.match(conditions, /週5はフル出社/u);
  assert.match(conditions, /一部出社` \/ `リモート併用` \/ 週1–4日出社は週1–4であり、週5にしない/u);
  assert.match(conditions, /週5日のみがフル出社/u);
  assert.doesNotMatch(conditions, /排他のフル\/一部\/出社にしない/u);
});

test("inbox skill compares on-site days when both sides state a range", () => {
  assert.match(conditions, /両方にレンジがあるときだけ交差を見る/u);
  assert.match(conditions, /片方が未記載なら不一致にしない/u);
});

test("structured conditions save 副業 without an amount as 0〜1.0人月", () => {
  assert.match(conditions, /`副業` \/ `副業希望` とあり、人月・%・週の日数・週の時間のどれも書かれていないときは、下限 0、上限 100（0〜1\.0人月）/u);
  assert.match(conditions, /save min 0 and max 100 instead of the both-missing 100 \/ 100/u);
});

test("inbox skill sets bare 常駐 to 週5–5 and capability phrases to 週0–5", () => {
  assert.match(conditions, /`常駐` \/ `客先常駐` \/ `出社` だけでリモート可否や週数が無いときは `onSiteDaysPerWeekMin=5`、`onSiteDaysPerWeekMax=5`（週5–5）/u);
  assert.doesNotMatch(conditions, /から週5を補完しない/u);
  assert.doesNotMatch(conditions, /出社頻度も `null`/u);
  assert.match(conditions, /案件の勤務指定 `フル常駐` \/ `完全常駐` \/ `フル出社` \/ `出社のみ` \/ `フル出社必須` \/ `リモート不可` はリモート不可/u);
  assert.match(conditions, /同じソースにリモート許容があるときはその記載を優先し、許容された週をレンジに含める/u);
  assert.match(conditions, /要員の `フル常駐可能` \/ `フル出社可能` \/ `常駐可` \/ `出社可` は「できる」だけでリモート不可ではない/u);
  assert.doesNotMatch(conditions, /do \*\*not\*\* invent 週5 from 常駐/u);
  assert.match(conditions, /Project `フル常駐` \/ `完全常駐` \/ `フル出社` \/ `出社のみ` \/ `フル出社必須` sets 出社頻度 to 週5/u);
  assert.match(conditions, /For 要員 `フル常駐可能` \/ `フル出社可能` \/ `常駐可` \/ `出社可`, that is capability only for denying remote, and 出社頻度 is 週0–5/u);
  assert.match(conditions, /案件側の同じ語は週0–5にしない/u);
  assert.match(conditions, /`一部リモート可（週1程度）` → `onSiteDaysPerWeekMin=4`、`onSiteDaysPerWeekMax=5`（週4–5）/u);
  assert.match(conditions, /Project `一部リモート可（週1程度）` is 週4–5, not 週1–1/u);
  assert.match(conditions, /The parenthetical `週N程度` is remote days/u);
  assert.match(conditions, /For N from 1 to 4, `onSiteDaysPerWeekMin` is 5−N and `onSiteDaysPerWeekMax` is 5/u);
  assert.match(conditions, /案件で週数の無い `一部リモート可` は週1–5（`onSiteDaysPerWeekMin=1`、`onSiteDaysPerWeekMax=5`）/u);
  assert.match(conditions, /Project bare `一部リモート可` is 週1–5, not 週1–4/u);
  assert.match(conditions, /案件の `フルリモート` だけ（可なし）は週0–0/u);
  assert.match(conditions, /Bare project `フルリモート` without 可 is 週0–0 and does not add 常駐/u);
  assert.match(conditions, /`フルリモート可` は可があるので常駐を含み、週0–5のまま/u);
  assert.doesNotMatch(conditions, /週数の無い `一部リモート可` だけは週1–4のまま/u);
  assert.match(conditions, /要員の同じ文は変えない/u);
  assert.match(conditions, /`一部出社可（週1程度）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=1`（週0–1）/u);
  assert.match(conditions, /Candidate `一部出社可（週1程度）` is 週0–1, not 週1–1/u);
  assert.match(conditions, /The parenthetical `週N程度` on 要員 `一部出社可` is on-site days/u);
  assert.match(conditions, /For candidate N from 1 to 4, `onSiteDaysPerWeekMin` is 0 and `onSiteDaysPerWeekMax` is N/u);
  assert.match(conditions, /要員で週数の無い `一部出社可` は週0–4（`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=4`）/u);
  assert.match(conditions, /Candidate bare `一部出社可` is 週0–4, not 週1–4/u);
  assert.match(conditions, /A candidate includes implicit フルリモート（週0） unless the source states an explicit style without 可, such as `常駐` \/ `フル出社` \/ `フル常駐`/u);
  assert.match(conditions, /Bare `常駐` \/ `客先常駐` \/ `出社` without 可 stays 週5–5 and does not add フルリモート/u);
  assert.match(conditions, /Candidate `フルリモート希望` \/ `リモート希望` \/ `フルリモートのみ` stays 週0–0/u);
  assert.match(conditions, /Do not apply this candidate on-site parenthetical rule to 案件/u);
  assert.match(conditions, /要員の `フルリモート希望` \/ `リモート希望` \/ `フルリモートのみ` は希望であり、上の能力ルールではない/u);
  assert.match(conditions, /`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`/u);
  assert.match(conditions, /Candidate `フルリモート希望` \/ `リモート希望` \/ `フルリモートのみ` is a preference for full remote, not the capability rule: set `onSiteDaysPerWeekMin` and `onSiteDaysPerWeekMax` to 0/u);
  assert.match(conditions, /`リモート希望` and `フルリモートのみ` are the same preference as `フルリモート希望`/u);
  assert.match(conditions, /`フルリモート可能` \/ `フルリモート可` are not this preference and do not force the range to 週0 only/u);
  assert.match(conditions, /If the same candidate source also allows 一部リモート or 出社, follow that allowance and do not force the range to 週0 only/u);
  assert.match(conditions, /Unstated candidate 出社頻度 is 週0–5, not 週0 only/u);
  assert.match(conditions, /`リモート希望（初日出社OK、月1程度の出社応相談）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`/u);
  assert.doesNotMatch(conditions, /`リモート希望（初日出社OK、月1程度の出社応相談）` → `acceptsFullRemote=true`/u);
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`初日出社OK` \/ `初日出社可` を `出社可` と読まない/u);
  assert.match(conditions, /`月1` \/ `月数回` \/ `月1程度の出社応相談` は週5フル出社ではない/u);
  assert.match(conditions, /do not read `初日出社OK` as `出社可`/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
  assert.doesNotMatch(conditions, /常駐を週5として登録/u);
});

test("inbox skill leaves unstated 出社頻度 null and does not treat a missing range as a mismatch", () => {
  assert.match(conditions, /片方が未記載なら不一致にしない/u);
  assert.match(conditions, /A missing 出社頻度 is not a mismatch/u);
  assert.match(skill, /a missing 出社頻度 is not a mismatch/u);
  assert.doesNotMatch(skill, /要員リモートの既定（必須）/u);
  assert.doesNotMatch(skill, /`acceptsFullRemote=true` と `acceptsHybrid=true` を常に立てる/u);
  assert.doesNotMatch(skill, /未記載でも `null` のままにしない/u);
  assert.doesNotMatch(skill, /except 要員 `acceptsFullRemote` \/ `acceptsHybrid` which default to `true`/u);
});

test("inbox skill includes 週1–4 when full remote and on-site are both allowed", () => {
  assert.match(conditions, /週0はフルリモート、週1–4は一部リモート、週5はフル出社/u);
  assert.match(conditions, /フルリモート可かつ出社可（フル出社可）なら週1–4も含めて 0–5/u);
  assert.match(conditions, /`フルリモート可、出社も可` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=5`/u);
  assert.match(conditions, /片方だけ可のときはその端だけ/u);
  assert.match(conditions, /両端が可のときに週1–4だけを外さない/u);
  assert.doesNotMatch(conditions, /`一部リモート不可` が明示されているときは立てない/u);
});

test("inbox skill rewrites 商流 lines in the overview to the structured depth", () => {
  const generate = readFileSync(
    new URL("../skills/generate-distribution-draft/SKILL.md", import.meta.url),
    "utf8",
  );
  assert.match(skill, /do \*\*not\*\* apply the distribution ±5万 shift/u);
  assert.match(skill, /keep the mail body as written/u);
  assert.match(skill, /Do not rewrite 商流, 所属, or 商流制限 in the 原文/u);
  assert.match(skill, /`replacements` carry 商流, 所属, and 商流制限 depth/u);
  assert.match(skill, /Do not drop greetings, contacts, or other people/u);
  assert.match(skill, /Do not use multiple entries to trim the 原文/u);
  assert.match(skill, /The 原文 keeps the source 所属 line/u);
  assert.doesNotMatch(skill, /A `NEAR` resend calls `set_\*_overview` `mode=MAIL_BODY`/u);
  assert.doesNotMatch(skill, /copies the mail body onto the overview/u);
  assert.doesNotMatch(skill, /Create copies the mail body onto the overview/u);
  assert.match(conditions, /Skill lines, 万円 \/ 単価, 場所 \/ 都道府県, and 勤務形態 stay/u);
  assert.doesNotMatch(skill, /`coreRanges` keep only lines that are not skill lines and not structured-condition lines/u);
  assert.doesNotMatch(skill, /Delete 商流, 所属, 商流制限, 単価, and 勤務形態 from the record title/u);
  assert.doesNotMatch(skill, /still omit lines that duplicate structured fields/u);
  assert.doesNotMatch(skill, /do \*\*not\*\* keep 商流制限 sentences in the overview/u);
  assert.match(generate, /Do not deepen 商流 or 所属 again/u);
  assert.match(generate, /協力会社向け — 商流制限は structured から −1段/u);
});

test("inbox skill registers partner candidate affiliation from 自社 viewpoint", () => {
  assert.match(conditions, /自社視点/u);
  assert.match(conditions, /協力会社の「弊社」= 自社の1つ下/u);
  assert.match(conditions, /協力会社「弊社」→ `1`/u);
  assert.match(conditions, /自社直所属「弊社」→ `0`/u);
  assert.match(conditions, /\*\*\+1 しない\*\*/u);
  assert.match(conditions, /`弊社1社下社員まで` → `0`/u);
  assert.match(conditions, /Do \*\*not\*\* apply this shift to `commercialFlowMaxDepth`/u);
  assert.match(conditions, /do \*\*not\*\* map 元請直→0/u);
  assert.match(conditions, /貴社社員を優先/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /弊社を挟む。`2社先` → `1`、`1社先` → `0`/u);
  assert.match(conditions, /ここでの弊社は協力会社/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
  assert.doesNotMatch(skill, /affiliationDepth`（0=弊社、ソース視点）/u);
  assert.match(skill, /`ownCompany: true` and `affiliationDepth: 0` only when the person is 自社 直所属/u);
  assert.match(skill, /When the listing or mail is from a 協力会社 and the text says 弊社 \/ 弊社正社員 \/ 弊社個人事業主 \/ 弊社直所属, that 「弊社」 is the partner, not 自社/u);
  assert.match(skill, /Create a normal partner candidate with that company's `companyId`/u);
  assert.match(skill, /Do not pass `ownCompany: true`/u);
  assert.match(skill, /Do not require an email/u);
  assert.match(skill, /Structured 所属 is 1 \(弊社 → 1社先\)/u);
  assert.match(skill, /Overview recipe replacements state the 自社 label \(1社先…\), one hop only/u);
  assert.match(skill, /Do not add a second hop on top of an already-deepened depth/u);
  assert.match(skill, /Stay on `create_candidates_from_mail_source`/u);
  assert.match(skill, /Do not call `create_candidate` for a 協力会社「弊社」/u);
  assert.doesNotMatch(skill, /with `ownCompany: true`/u);
  assert.doesNotMatch(skill, /`candidateCondition` \(`affiliationDepth: 0`\)/u);
  assert.doesNotMatch(skill, /自社 keeps 所属「弊社…」/u);
  assert.doesNotMatch(skill, /do not rewrite 弊社個人事業主 to 1社先個人事業主/u);
  assert.doesNotMatch(skill, /When the person is 弊社直所属/u);
  assert.doesNotMatch(skill, /do \*\*not\*\* call `create_candidates_from_mail_source`/u);
});

test("inbox skill links mail that is not a ledger type to OTHER", () => {
  assert.match(skill, /create_other_from_mail_source/u);
  assert.match(skill, /交流会/u);
  assert.match(skill, /セミナー/u);
  assert.match(skill, /御礼/u);
  assert.match(skill, /事務連絡/u);
  assert.match(skill, /Unlinked replies and unlinked outbound are included/u);
  assert.match(skill, /One mail links to one OTHER/u);
  assert.match(skill, /titled from the subject/u);
  assert.match(skill, /outcome `created` or `reused`/u);
  assert.match(skill, /"others": \[\]/u);
  assert.match(skill, /OTHER_THREAD_AMBIGUOUS/u);
  assert.match(skill, /Do not create a PROJECT or CANDIDATE shell/u);
  assert.match(skill, /Do not send mail/u);
  assert.match(skill, /Do not report them as `skippedOther`/u);
  assert.doesNotMatch(skill, /"skippedOther"/u);
  assert.doesNotMatch(skill, /Skip `OTHER`/u);
  assert.match(skill, /`CONTRACT` stays on the existing webhook auto-link path/u);
  assert.match(skill, /`DISTRIBUTION` mail belongs to 配信履歴, not to any record/u);
  assert.doesNotMatch(skill, /PROJECT_DISTRIBUTION|CANDIDATE_DISTRIBUTION/u);
  assert.match(skill, /do not leave the mail as `review_required` only because it is not a 案件 or 要員/u);
});

test("structured conditions link the source before set_*_overview", () => {
  assert.match(
    conditions,
    /`create_url_source` の `originalText`、そのあと `link_source_to_record`、そのあと `set_\*_overview` の `mode=SOURCE_RECIPE`/u,
  );
  assert.match(conditions, /リンクされていない sourceId には `set_\*_overview` を呼ばない/u);
  assert.match(conditions, /`match_\*_overviews` はリンクの前でもよい/u);
  assert.match(conditions, /Outlookの原文はメール本文のまま条件へコピーしない/u);
  assert.match(
    conditions,
    /Save 原文 with `create_url_source` `originalText`, then `link_source_to_record`, then `set_\*_overview` `mode=SOURCE_RECIPE`/u,
  );
  assert.match(conditions, /Do not call `set_\*_overview` for a sourceId that is not linked/u);
  assert.match(conditions, /`match_\*_overviews` may still run before the link/u);
  assert.match(conditions, /An Outlook mail stays `MailReference\.bodyText`/u);
  assert.match(conditions, /Do not copy it onto the project or candidate/u);
  assert.doesNotMatch(conditions, /`originalText`、そのあと `set_\*_overview`/u);
  assert.doesNotMatch(conditions, /Save 原文 on the source first\. A record link is not required yet/u);
});

test("inbox skill links only unambiguous project or candidate and keeps ambiguous proposals as matchings", () => {
  assert.match(skill, /Pass `projectId` only when exactly one existing PROJECT/u);
  assert.match(skill, /Pass `candidateId` only when exactly one existing CANDIDATE/u);
  assert.match(skill, /keep the clear external proposal as a マッチング with only the mail linked/u);
  assert.match(skill, /案件・要員接続要確認/u);
  assert.match(skill, /set_matching_reason` `mode=SOURCE_RECIPE`/u);
  assert.match(skill, /reuses one マッチング per organization \+ Outlook conversation/u);
});
