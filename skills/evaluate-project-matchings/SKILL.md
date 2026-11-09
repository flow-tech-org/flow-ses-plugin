---
name: evaluate-project-matchings
description: >-
  Project-side matching: start from each 案件 (default all 募集中), search 募集中 要員
  with structured conditions and skill names, read overviews and skill sheets,
  and create_matching only for a clear fit with a partner-facing reason. Use
  for 案件からのマッチング評価. Candidate-side is flow-ses:evaluate-candidate-matchings.
  Do not use for registration, inbox, or drafts.
---

# Evaluate project-anchored matchings

## Scope summary

Project-side: anchors are 案件 (PROJECT) only, one at a time; partners are 募集中 要員 found with `list_candidates`. Candidate-side is `flow-ses:evaluate-candidate-matchings`. The rules shared by both sides (skill names, 単価, reading, ◯/△/✕, reason, result) are in `flow-ses:matching-rules`.

Operate on the authenticated organization's PROJECT/CANDIDATE ledger through the flow-ses connector. Goal: record clear cross-company project↔candidate fits as MATCHING records. Project-side. Anchors are **PROJECT only**. Take **one project at a time**. Do not start from CANDIDATE. Candidate-side evaluation is `flow-ses:evaluate-candidate-matchings`. Search candidates with `list_candidates` using the partner-pool ids and only the structured `candidateCondition` fields that project states, then call `get_project` / `get_candidate`, read the overviews, and when the candidate has a FILE read it with `get_candidate_attachment_download_link` and `flow-ses:read-office-attachments`. There is no skills column. Do **not** create from titles alone. Do **not** call `get_mail_source` / `get_url_source` / `get_source_attachment_download_link` for mail bodies or skill sheets. Do not register, update, or delete PROJECT/CANDIDATE. Do not save 配信用情報. Do not create Outlook drafts or send mail.

## Scope

- In scope: `list_projects` to collect project anchors and `list_candidates` to collect the partner candidate pool, then one project at a time with `recruitmentStatuses: ["unset"]` (partner `ids`, chunks of at most 200, only when partner ids were specified) plus only the stated `candidateCondition` filters, `excludeMatchedProjectId`, `get_project` / `get_candidate`, `get_candidate_attachment_download_link`, `flow-ses:read-office-attachments`, and `create_matching`. Pass `updatedAtFrom` / `updatedAtTo` only when the user specifies a date window. Optional `list_matchings` / `get_matching` only when diagnosing a slipped pair. Google Spreadsheet / Docs / SharePoint URLs in the overview stay browser-opened. Do **not** call `list_mail_sources` for partner-pool discovery. Do not call `excludeMatchedCandidateId` from this skill.
- Out of scope, what the list tools do not accept, where registration lives, untrusted text, and `ownCompany`: `flow-ses:matching-rules` 「Shared scope」.

## Preflight

Follow `flow-ses:matching-rules` (if the plugin is not loaded, read https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/matching-rules/SKILL.md) 「Preflight」.

## 自社の指示 (company matching instructions)

Apply the three texts from Preflight 4 (`get_matching_instructions`). Read and follow `flow-ses:matching-rules` (if the plugin is not loaded, read https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/matching-rules/SKILL.md) 「自社の指示」 for how the three instructions change this skill. Here, 絞り込み方 changes the `list_candidates` filters (`candidateCondition`) in step 2.

- **派遣契約必須 (only when 絞り込み方 says so):** by default, 派遣契約必須 projects are evaluated like any other. When 絞り込み方 says not to match 派遣契約必須 projects, skip an anchor project whose `dispatchContractRequired` is `true` as `matching_skipped` / `派遣契約必須`; a null (未設定) project is still evaluated. Do not pass `dispatchContractRequired` on `list_candidates`. Do not recover 必須 from the overview.

## Workflow

### 1. Build the processed matching set (required)

**Default (neither project ids nor candidate ids):** anchors are all 募集中 projects. Partner candidates are all 募集中 candidates. Do not limit that default to the last 3 business days. Do **not** invent a narrower “today’s crawl” set. This pool is **independent** of any narrower distribution/attachment target set.

Everything else about the set (one side or both specified, a date window, ids from a prior run, 募集終了, an empty anchor set) follows `flow-ses:matching-rules` 「1. The processed set」.

### 2. Search one processed record at a time

Run each project anchor in its own subagent as `flow-ses:matching-rules` 「One subagent per anchor」 says (if the plugin is not loaded, read https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/matching-rules/SKILL.md). Steps 2 to 4 below are what one subagent does for its anchor; with one anchor or no subagent tool, this session does them one anchor at a time.

The processed record is a PROJECT. Walk anchors one project at a time. Do not start from CANDIDATE. Do **not** call `list_projects` to find counterparts. For one processed PROJECT, call `list_candidates`.

Keep the anchors as an ID list and finish one before the next, as `flow-ses:matching-rules` 「2. Search: shared rules」 says.

**Structured search (required before content reads):** `get_project` the anchor if you do not already have its condition. Skip it when `recruitmentStatus` is `CLOSED` (募集終了). Call `list_candidates` with `recruitmentStatuses: ["unset"]`. Add `ids` = the specified CANDIDATE ids (max 200 per call) only when candidate ids were specified. Add only `candidateCondition` fields that this project actually states. Omit null and omitted fields. Unstated fields are not filters. Pass the 単価 filter as described below. Do not pass `commercialFlowPosition`.

**Skills:** if the project has skill names, pass the names chosen below as `candidateCondition.skillNames`, and always pass `candidateCondition.includeChildSkills: true` with them. A name then also matches its 下位スキル at any depth (for example `Spring` also matches `Spring Boot`). Each returned item carries `skillMatches: [{ requested, matched }]`, the candidate's tags that matched each name. Multiple names stay AND. Do not pass years or `skillYearsMin`. Do not pass `skillRole`. Do not add a name the project does not have. Candidates with zero skill tags are excluded while any name is passed. If the project has no skill names, do not filter by skill.

**Choosing skill names:** follow `flow-ses:matching-rules` 「Choosing skill names」 (unknown names, the four groups, at most 5 tries per count, merging after a 3- or 2-name hit, the 上位スキル fallback). On this side, within each group, keep REQUIRED names before PREFERRED names, then the stored order.

Also pass `excludeMatchedProjectId` = that project id. Candidates that already have a Matching row with this project are omitted, any matching status, including 却下 and お見送り. Do not use `relatedConditions` kind `MATCHING` for this exclusion. Do not call `excludeMatchedCandidateId`.

Also pass `excludeCompanyIds` = [that project's company id] (the linked company with role `PROJECT_OWNER`) when the project has a company. Candidates linked to that company are omitted before any read, so 同社同士 pairs never enter the search. A project with no company passes nothing. Keep the 同社同士 check after `get_*` as a backstop.

Map a stated project value onto `candidateCondition`:

- 単価の比べ方: follow `flow-ses:matching-rules` 「単価の比べ方」. The search below uses its rules.
- 単価の検索: on `list_candidates`, when the project max is set, pass `candidateCondition.unitPriceConditions` with six items: for each kind of candidate in the second table, one `unitPriceTaxType: "EXCLUDED"` item with the bound as its max and one `"INCLUDED"` item with the bound × 1.1. Each item keeps candidates of that kind and tax type whose min is at most the bound, and those with a null min; the server returns their union and never converts. Pass the 稼働率 filter as usual, so the candidates' 稼働率 overlaps the project's. Let P be the project's 税別 max in 万円 (a 時給 project: 円 × 160 ÷ 10,000), and aL〜aU the project's 稼働率 range (rules in matching-rules 「単価の比べ方」; when the project states no 稼働率, aU is 1.00 and aL is unknown). T is the most the project pays per full person-month, less m月:

  | 案件 | T |
  |---|---|
  | 1人月 | P − m月 |
  | この稼働割合 | P ÷ aL − m月 |
  | 時給 | P − m月 |

  | 相手の要員 | item | max |
  |---|---|---|
  | 1人月 | `MONTHLY`, `monthlyUnitPriceBasis: "PER_PERSON_MONTH"`, `unitPriceMaxManYen` | T |
  | この稼働割合 | `MONTHLY`, `monthlyUnitPriceBasis: "AT_STATED_UTILIZATION"`, `unitPriceMaxManYen` | 案件が この稼働割合: P − m月 × aL. 案件が 1人月・時給: T × aU |
  | 時給 | `HOURLY`, `unitPriceMaxYen` | T × 10,000 ÷ 160. 案件も時給なら、案件の時給 − m時 (円) |

  例 (案件 この稼働割合 24〜32万・稼働0.5〜0.8, 税別, margin m): 1人月 64 − m 万, この稼働割合 32 − 0.5m 万, 時給 (64 − m) × 10,000 ÷ 160 円. 案件 80万（税込）・1人月・稼働未記載: P = 80 ÷ 1.1 ≒ 72.7万, so 1人月 72.7 − m 万, この稼働割合 72.7 − m 万, 時給 (72.7 − m) × 10,000 ÷ 160 円.

  A bound that needs an unknown aL gives no bound (P ÷ aL when the project states no 稼働率); in P − m月 × aL, use P. Round each bound down to a whole number in its unit; when it is over 500 (万円) or 30000 (円), pass the item with no bound. If `list_candidates` rejects `monthlyUnitPriceBasis`, pass one `MONTHLY` item per tax type with the larger of the two 月単価 bounds (no bound when either has none). If it rejects `unitPriceConditions` (an older Flow SES), omit the price filter. If the project max is null, omit the price filter. Do not pass the min filters or `unitPriceKind`. Do not fill a missing end with 0, 500, or 30000.
- Age: pass the project's stated `ageMin` as `ageYearsMin` and `ageMax` as `ageYearsMax` so the candidate age must fall in that band. Pass only a bound the project states. A null bound is unstated. Do not pass 15 or 99 for it. Unstated age is not a filter. An age filter still returns projects whose age bounds are null. Do not pass 15 or 99 to keep those rows.
- Gender: when `requiredGender` is stated, pass `genders: [that gender, "unset"]` so candidates whose gender is null (未設定) stay. Unknown gender is not a mismatch.
- 個人事業主: `soloProprietorAllowed` false → `isSoloProprietor: ["no"]`. true or null → omit. Do not pass `unset`.
- 外国籍: `foreignNationalityAllowed` false → `isForeignNationality: ["no"]`. true or null → omit. Do not pass `unset`.
- 都道府県: if this project has no `prefectureCode`, do not pass `prefectureCodes`. If `onSiteDaysPerWeekMin` is 0, do not pass `prefectureCodes`. Do not filter candidates by prefecture. When the range does not include 週0 and a prefecture is set, pass the codes of this prefecture's エリア (地方) plus `unset`. The default is the same エリア only; do not add 隣接エリア unless 絞り込み方 says so. The エリア, the 隣接エリア pairs, and the codes for each are in `flow-ses:matching-rules` 「都道府県のエリア」. Do not pass `includeFullRemoteRegardlessOfPrefecture`.
- 開始月: when this project has a stored start month, pass only `startYearMonthTo` set to that month. Do not subtract a month. Do not pass `startYearMonthFrom`. Do not pass both bounds. Do not pass exact `startYearMonth`. `2026-10` → `startYearMonthTo: "2026-10"`. Candidates who start after that month drop. That month and earlier stay. `即日` already stored as the current Asia/Tokyo year-month is a stated month; pass that month as `startYearMonthTo` with no offset. Do not invent the current month when start is missing. A missing stored start is not a search value. Do not pass `immediateStart`.
- 稼働率: follow `flow-ses:matching-rules` 「2. Search: shared rules」.
- 商流: stored `commercialFlowMaxDepth` is null or 0–4. null is なし. 0 is 弊社まで. 1–4 are N社先まで. Do not pass or store 5. Do not call `0` 自社要員. 協力会社の「弊社」is `affiliationDepth` 1, not `ownCompany`. `ownCompany` is 自社 直所属 only. Do not treat `affiliationDepth` 0 as `ownCompany`. When `commercialFlowMaxDepth` is null, do not filter 所属. When it is 0–4, pass `affiliationDepth` as that depth. Do not add a one-level margin. The filter keeps `affiliationDepth` <= that depth and keeps unknown affiliation (stored as -1, never null). Do not pass `-1`. Do not pass `affiliationDepths`, `affiliationDepthMin`, or `affiliationDepthMax`. When matching, use structured `commercialFlowMaxDepth` when set. Do not read 商流制限 from the overview. Structured null is なし and is not a mismatch. Do not read max depth from position/preference labels (`エンド` / `元請直` / `一次請け` / `二次請け` / `三次請け` / `元請` / `貴社社員を優先`). `commercialFlowPosition` is the stored integer (不明 = -1, エンド = 1) and is not a hard mismatch. Do not pass it and do not compare it.
- 勤務: pass `onSiteDaysPerWeekMin` and `onSiteDaysPerWeekMax`. Overlap is both comparisons: project max >= candidate min AND project min <= candidate max. Do not pass `onSiteDaysPerWeek` (a week array). When the anchor range is 0 and 5, omit the filter. 週0はフルリモート、週1–4は一部リモート、週5はフル出社. Do not re-check 出社頻度 from the overview after this filter. When the project's `onSiteDaysPerWeekMin` is 0, do not pass `prefectureCodes`. Otherwise pass the エリア codes plus `unset` when the project has a prefecture.

If the search is still too wide, and for what is decided after it (単価 once, 同社同士, an existing pair, a 募集終了 partner), follow `flow-ses:matching-rules` 「Choosing skill names」 and 「After the search」.

### 3. Read overview and the skill sheet (required)

Read and follow `flow-ses:matching-rules` (if the plugin is not loaded, read https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/matching-rules/SKILL.md) 「3. Read overview and the skill sheet」.

### 4. Create or skip

Read and follow `flow-ses:matching-rules` (if the plugin is not loaded, read https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/matching-rules/SKILL.md) 「4. Create or skip」. On this side:

- **Widened hit (上位スキル fallback, required):** the reason states that the requested skill is not stated, names the related skill the 要員 side does have (from `skillMatches` and the text you read), and asks the partner to confirm. 例: `Spring Bootのご経験は記載がございませんが、Springのご経験がございます。\nご対応可能かご確認いただけますと幸いです。` Do not write a widened hit as a plain skill match.
- project outside the anchor set (do not start from CANDIDATE, and do not evaluate leftover candidates against each other)

## Result

Report as `flow-ses:matching-rules` 「Result」 says. On this side:

- `matchingProcessed` is the project anchor ids finished in this run. `window` is `all-recruiting` unless a user-specified date window narrowed the pool.

## Guardrails

- Matching **anchors** are PROJECT only (default: all 募集中 projects; or the projects in a user-supplied / prior-run set). Do not start from CANDIDATE. Matching **partners** are 募集中 candidates (or the specified candidate ids). Do not limit that default to the last 3 business days. A user-specified date window narrows further by record `updatedAt`. Do **not** use Outlook `receivedAt` / `sentAt`, listing Source `updatedAt`, or record `createdAt` as the window. This pool is **independent** of any narrower distribution/attachment target set. Do **not** pair a project outside the anchor set. Partner-pool discovery uses `list_candidates` / `list_projects`. Pass `updatedAtFrom` / `updatedAtTo` only when the user specified a date window — that is not a body read.
- **One record at a time:** finish that record before the next, and choose skill names as `flow-ses:matching-rules` 「2. Search: shared rules」 and 「Choosing skill names」 say. If the search is too wide, add stated conditions and search again before reading sheets. Do not drop a non-skill filter already passed. Do **not** sample, cap, or omit pairs inside the record you started.
- **Matching review:** one project against the partner candidate pool, then `list_candidates` with `recruitmentStatuses: ["unset"]` (plus the specified candidate `ids`, max 200, only when given), `excludeMatchedProjectId`, and only the `candidateCondition` fields that project states (unstated fields are not filters; pass `skillNames` only when the project has skill names; do not pass years or `skillYearsMin`; numeric filters constrain stated values only; pass the same-kind 単価 filter; do not pass `commercialFlowPosition`). Then `get_*`, read the overviews, and read a candidate FILE with `get_candidate_attachment_download_link` and `flow-ses:read-office-attachments`. Google Spreadsheet / Docs / SharePoint URLs in the overview stay browser-opened. Empty either overview is `概要未記載`. Mark each 必須 and 歓迎 item ◯ / △ / ✕ (必須・歓迎の判定): every 必須 item ◯, or with two or more 必須 items at most one △ and no ✕; 歓迎 never decides. Row-3 **visible filenames** alone are not a sheet. With no sheet, or an unreadable one, mark the items from the two overviews. Create only when the result is OK, and write `reason` from the overviews and from the sheet when it was read. Do not create same-company pairs or existing MATCHING pairs. `create_matching` reused is not a new create; do not call it to probe. `create_matching` only rejects same-company pairs. 単価 / `単価超過` / `利益不足` are decided by the filters you passed and are not re-checked later. Use structured `commercialFlowMaxDepth` when set — missing 商流制限 in overview is not a reason to ignore stored depth.
- Every guardrail in `flow-ses:matching-rules` 「Guardrails」 also applies.
