---
name: matching-rules
description: >-
  Shared rules for the two matching skills: applying マッチングの指示, reading
  the overviews and skill sheet, the 必須・歓迎の判定 and 主業務と売り方
  checks, writing reason, create or skip, the result, and guardrails. Read it
  only when flow-ses:evaluate-project-matchings or
  flow-ses:evaluate-candidate-matchings says so. Do not use it on its own.
---

# Matching rules (shared)

`flow-ses:evaluate-project-matchings` (案件から) and `flow-ses:evaluate-candidate-matchings` (要員から) differ only in which side is the anchor and how the partner search in their steps 1–2 is built. Everything after the search is the same and lives here. "The matching skill" below means whichever of the two sent you here; follow its own text where it adds a side-specific rule.

## 自社の指示 (company matching instructions)

The matching skills' rules are the defaults (共通の決まり). `get_matching_instructions` returns this customer's changes to them, written in 会社設定の「マッチングの指示」 (the onboarding skill asks the customer item by item and saves only what differs). They are the customer's instructions to you, in plain Japanese:

- `filterInstructions` (絞り込み方) changes every check on stored conditions: the partner search in step 2 of the matching skill (`list_candidates` with `candidateCondition` from a project, or `list_projects` with `projectCondition` from a candidate: which fields to pass, and with what values), including 単価. It can also add a rule the defaults do not have, such as a margin or skipping 派遣契約必須 projects, or turn off a default. 例: 開始月は1か月後の要員まで → `startYearMonthTo` を案件の開始月の1か月後に; エリアは同じエリアだけ → search codes are that エリア plus `unset`; 年齢では絞らない → do not pass `ageYearsMin` / `ageYearsMax`.
- `comparisonInstructions` (比較の仕方) changes how a found pair is judged after reading the overviews and the skill sheet (step 3 below): the 必須・歓迎の判定 (what counts as ◯ / △ / ✕, how many △ are allowed, whether 歓迎 counts), 主業務と売り方, and other pairs to skip or checks to add. 例: 必須の△は認めない → every 必須 item must be ◯; 必須が3つ以上なら✕を1つまで認める → allow that ✕ (the line still shows ✕ in the reason); 歓迎も1つ以上◯にする → add that to the decision; 出社がある案件は通勤が片道1時間半までの要員だけにする → read 勤務地 and 居住地 from the two overviews and skip a clearly longer commute as `通勤不可`; 金融系の案件に外国籍の要員は出さない → skip those pairs.
- `reasonInstructions` (理由の書き方) changes how `reason` is written in step 4 below: what to put first, how long, what to add or leave out. 例: 最初の1文で一番合う点を書く; 3文以内にする.

How to apply them:

- Where an instruction and the matching skill differ, follow the instruction. Everything an instruction does not mention follows the matching skill as written. A null field means the matching skill's rules as written.
- **Margin (only when 絞り込み方 sets one):** the default has no margin. When 絞り込み方 sets one (例: 月単価は差を5万円以上、単価相談可なら3万円以上。時給は差を300円以上), it is part of the 単価 check in 単価の比べ方 and 単価の検索 (step 2 of the matching skill): m月 is the 月単価 amount in 1人月相当, which for この稼働割合の月額 is the amount × 稼働率 (例: 5万円 at 稼働率0.5 → 2.5万円), and m時 is the 時給 amount in 円, used only when both sides are 時給. The search uses the smaller 単価相談可 amount when there is one, because the other side may be 単価相談可; after `get_*`, use the 単価相談可 amount only when either side's structured `rateNegotiable` is `true`. Skip as `マージン不足` when the pair passes 単価 without the margin but not with it. Exactly the margin passes. When the instruction gives no 月単価 amount, m月 is 0; when it gives no 時給 amount, m時 is 0.
- **派遣契約必須 (only when 絞り込み方 says so):** the matching skill says how to apply it on its side. Do not recover 必須 from the overview.
- When an instruction removes a filter, also drop the matching hard check: do not skip a pair for that condition later.
- If a point in an instruction is unclear, follow the matching skill for that point and say which point in the result.

Every rule of the matching skill is a default that an instruction may change, including 募集終了 and how `reason` is written. Two things are not matching rules and stay as they are: `create_matching` rejects a same-company pair and returns an existing pair as `reused: true`, and the matching skill writes nothing but `create_matching` and never touches mail or drafts.

### 3. Read overview and the skill sheet (required)

Do not create a matching from titles alone. There is no skills column. There is no `requiredSkills` or `preferredSkills` column. Empty skills is not `スキル未記載` and is not a skip. Do not drop `必須スタック不一致` from a skills field. The `skillNames` list filter is only the search narrowing above. Required-skill judgment is from the overviews and the sheet.

After the structured search, call `get_project` and `get_candidate` for each remaining pair (reuse a payload you already loaded). Read the project **overview** (`get_project` `overview`) and the candidate **overview** (`get_candidate` `overview`). `projectCondition` and `candidateCondition` do not repeat the overview. Do **not** read `skills`. The `list_projects` / `list_candidates` items carry no overview.

An empty overview is `概要未記載`. Do not fall back to a skill sheet. Do not create that pair.

When the candidate has a record FILE, call `get_candidate_attachment_download_link` with `includeText: true` and read the returned `extractedText`, the text the server read when the file was stored. Only when `extractedText` is null, download the file and read it with `flow-ses:read-office-attachments`. Use the latest candidate FILE. Within one run, keep the sheet text you already read for a candidate and reuse it for later anchors instead of fetching the same FILE again. Do not use `get_source_attachment_download_link` for this sheet. Google Spreadsheet / Google Docs / SharePoint listing URLs in the overview stay browser-opened. Do not download them as office files. Do **not** call `get_mail_source` / `get_url_source` for source mail bodies.

**Structured hard checks (when both sides are set; not 単価)** were already applied by the filters you passed: age, gender, on-site days, commercial flow, solo proprietor, foreign nationality, start month, and prefecture. Do not re-check them from overview or attachments. **Missing is not mismatch** for an unset structured field you did not filter. An omitted 万円 is not a mismatch. An unstated detail in an overview is not a clear mismatch. Unstated 経験年数 is not a mismatch. **No second rate pass:** Sheet reads are **not** a second 単価 pass. Do not re-evaluate 単価, `単価超過`, or `利益不足` from overview or attachments. Do not compare source monthly 万円 from overview or record attachments.

**必須・歓迎の判定 (required):** Judge from the project overview, the candidate overview, and the skill-sheet text when you read it. There is no skills column. Do not take skills or years from a separate skills field. Do not pass `skillYearsMin`.

1. List the project's items: each line or point the project overview gives as 必須 (例: 必須スキル, 必須要件, MUST) and each it gives as 歓迎 (例: 歓迎スキル, 尚可, WANT). Keep one item per line or point as written; do not split one line into several items or merge lines. When the overview lists requirements without saying 必須 or 歓迎, treat them as 必須. When it states no requirement at all, skip the pair as `概要だけでは判断できない`.
2. Mark each item for the candidate:
   - ◯: the candidate overview or the sheet clearly shows it, and a stated year minimum is met (`5年` meets `5年以上`). When the item states no years, or the candidate text shows the skill without years, years do not lower the mark.
   - △: partly met. 例: the skill is there but stated years fall short (`4年` or `5年程度` against `5年以上`, or a single date range clearly shorter than the minimum for that skill); the item names several skills or duties and the candidate shows only some; only a related skill is shown (例: the 上位スキル of a widened hit).
   - ✕: the candidate overview and the sheet show nothing for it, or show the opposite.
   Do not invent a year count, and do not add overlapping project periods into a total the text does not state.
3. Decide on 必須 only. With one 必須 item, it must be ◯. With two or more, every 必須 item must be ◯ except at most one △, and none may be ✕. 歓迎 items are marked for the reason but never decide the pair. Skip a pair with a 必須 ✕ as `必須不一致`, and a pair with more △ than allowed as `必須の△が多い`.
4. A pair that passes 3 still needs 主業務と売り方 below.

**主業務と売り方 (required):** Passing every 必須 line is not enough for a clear fit. Before judging, name the project's 主業務 in one phrase: what the work actually is (例: `RPAのロボットをPythonへ移行する業務自動化`, `金融系勘定系のJava保守`), not the language. Also name the candidate's 売り方: the direction the supplier markets the candidate in the overview title or opening lines (例: `AIエンジニア`, `Webエンジニア`, `PMO`). The pair is a clear fit only when both hold:

- **主業務の経験:** the candidate overview or the sheet shows work of the same kind as the 主業務. A shared language or framework alone does not count (例: Python is required, but the project is RPA migration and the candidate's Python work is machine learning and AI SaaS). When only the language matches, the pair is not created (`主業務不一致`).
- **売り方との一致:** the 主業務 is in the direction the candidate is marketed. A candidate marketed in one direction (例: `AIエンジニアまたはWebエンジニアとして`) is not created for a project whose 主業務 is a different direction (例: RPA移行, 運用保守, PMO), even when the 必須 lines pass.

Skip such a pair as `主業務不一致`. When the 売り方 is not stated, judge only 主業務の経験. Do not use 単価 for this check.

Judge the pair only after the overviews and, when present, the sheet:

- When the sheet text is read, mark the items from the two overviews plus that sheet. The sheet can raise a mark the overview alone left at △ or ✕.
- **When no sheet exists** (no skill-sheet URL in the candidate overview, and no candidate record FILE), or a sheet existed but its body could not be read: mark the items from the two overviews. Do **not** skip the pair as `スキルシートなし` or `スキルシート未確認`; a pair that passes on the two overviews is created. Row-3 **visible filenames** alone are not a sheet.
- Create only a pair that passes the 必須・歓迎の判定 and the 主業務と売り方 check.

Only those pairs advance to `create_matching`.

### 4. Create or skip

Create a matching with `create_matching` **only when the result is OK** **and** the pair is cross-company and not already a MATCHING. Write `reason` on every create. A skill-sheet body belongs in the reason only when you read the sheet. A missing or unreadable sheet does not block a pair that passes on the two overviews. A pair that fails the 必須・歓迎の判定 or 主業務と売り方 is not created. 単価 was already decided by the structured filters you passed and the one 税別 check on the stored values; do not require another rate-ceiling check. Prefer short Japanese titles like `案件名 × 人材名`. The rest of this step is the default way to write `reason`; 理由の書き方 changes any of it. By default, `reason` shows the 必須・歓迎の判定 item by item: a line `【必須】`, then one line per 必須 item as `◯ <item, short, as the project writes it>：<one polite sentence on what the candidate has>` (△ and ✕ the same way), then `【歓迎】` and the 歓迎 items the same way. Leave out the 歓迎 block when the project has no 歓迎 item. For a △, say what falls short and ask the partner to confirm; for a ✕, say it is not stated. Ground each line in the project overview, the candidate overview, and skill-sheet text when read. There is no skills column. Do not ground `reason` in a skills field. By default, write nothing about 単価 in `reason`: no amounts, no margin, and no 単価相談可 note. **Tone (required):** matching `reason` is later pasted into SES協力会社向けの提案メール（`マッチング理由：`）as-is, so each line's sentence is polite business Japanese suitable for an external partner, with です／ます調; avoid telegram-style fragments or internal slang.

- `create_matching` returns 409 only for same-company pairs (`SAME_COMPANY_MATCHING_NOT_ALLOWED`). Structured mismatches and CLOSED (募集終了) rows must be skipped by the agent before the call. If the pair already exists, `reused: true` is success and is not a new create.
- **Line breaks (required):** Put a real newline (`\n`) after each line: each heading and each item. Do **not** pack the whole reason into one long single-line paragraph. The pasted mail body must stay readable.
- Good examples:
  - `【必須】\n◯ Java実務経験5年以上：Javaのご経験が6年ございます。\n◯ Spring Bootでの開発経験：Spring Bootでの開発のご経験がございます。\n△ AWSでの構築経験：AWSのご経験は運用が中心のため、構築のご経験をご確認いただけますと幸いです。\n【歓迎】\n◯ 金融系の業務経験：銀行向けシステムのご経験がございます。\n✕ リーダー経験：記載がございません。`
  - `【必須】\n◯ PHPでのWeb開発経験3年以上：PHPのご経験が4年ございます。`
- **Widened hit (上位スキル fallback, required):** the reason states which skill the other side asks for that is not stated, names the related skill that is stated (from `skillMatches` and the text you read), and asks the partner to confirm. The matching skill gives the example for its side. Do not write a widened hit as a plain skill match.
- Avoid terse notes: `Java/Spring一致・単価相談可`, `AI経験要確認`, `スキルOK`, `単価厳しい`
- Avoid one unbroken blob: `必須スキルは一致しております。単価差がございますがご相談可能です。稼働は9月～のため即日開始可否をご確認ください。`（文の区切りごとに改行すること）
- Do **not** put company-relationship wording in `reason` (禁止例: `別社提案`, `別会社`, `他社人材`, `同社同士ではない`, `クロスカンパニー`). Cross-company is already enforced by the same-company ban — do not restate it in the reason. Do not invent scores.

Skip and report `matching_skipped` with the reason:

- either overview empty (`概要未記載`) — do not fall back to a skill sheet
- same company on both sides (`同社同士`)
- either side `recruitmentStatus: CLOSED` (`募集終了`) — do not create
- `派遣契約必須` — only when 絞り込み方 says to skip those projects
- a rule 絞り込み方 or 比較の仕方 adds (`マージン不足`, or the reason the instruction names) — only when the instruction says so
- 単価, `単価超過`, and `利益不足` — already decided by the structured filters and the one check on the stored values after `get_*` (単価の比べ方); do not add `matching_skipped` by re-reading 万円 from overview, skill text, or attachments
- a 必須 item marked ✕ (`必須不一致`), or more △ than allowed: any △ with one 必須 item, or two or more △ (`必須の△が多い`), per the 必須・歓迎の判定
- the project's 主業務 has no same-kind work in the candidate's overview or sheet, or is outside the direction the candidate is marketed in (`主業務不一致`), per the 主業務と売り方 check
- the project overview states no 必須 or 歓迎 requirement to compare (`概要だけでは判断できない`) — do not create
- a partner outside the resolved partner pool (do not enumerate every excluded record; note the pool was applied)
- a record outside the anchor set (the matching skill says which side is the anchor; do not evaluate leftover partners against each other)

Do **not** skip as `スキル未記載`, `必須スタック不一致`, `概要不一致`, or `スキルシート不一致`. Do **not** skip as `スキルシートなし` or `スキルシート未確認`: with no sheet, or an unreadable one, mark the items from the two overviews.

A 歓迎 item marked △ or ✕ never blocks a pair; it shows in the 歓迎 block of the reason. A 必須 経験年数 shortfall is a △ on that item, decided by the rule in 必須・歓迎の判定. Do not treat a text 万円 or `単価超過` as a soft gap, and do not mine overview or attachments for one.

Do not invent AI scores or evaluation history. Do not draft or send introduction mail.

## Result

Report a compact Japanese summary plus structured counts:

```json
{
  "window": "YYYY-MM-DD or range",
  "matchingProcessed": [],
  "skillScreen": {
    "evaluatedPairs": 0,
    "skipped": 0,
    "created": 0,
    "widenedToParent": 0
  },
  "matchingsCreated": [],
  "matchingSkipped": [],
  "instructionsApplied": { "filter": false, "comparison": false, "reason": false },
  "instructionNotes": [],
  "errors": []
}
```

- `matchingProcessed` is the anchor ids (the matching skill's side) finished in this run. `window` is `all-recruiting` unless a user-specified date window narrowed the pool.
- `skillScreen` should count unique project+candidate pairs you judged for the records you finished. Put `概要未記載` in `matchingSkipped`. Put `必須不一致`, `必須の△が多い`, `主業務不一致`, and `概要だけでは判断できない` in `matchingSkipped`. Do not report `スキル未記載` or `スキルシートなし`. An existing MATCHING (`reused: true`) is not `created`. Report processed CLOSED anchors as `matching_skipped` / `募集終了`.
- `skillScreen.widenedToParent` counts matchings created from a 上位スキル fallback search. Mark each of those entries in `matchingsCreated` with `widenedFrom` (the original skill) and `widenedTo` (the parent searched).
- Each matching entry should include title, matching id, project id, candidate id, and `created` or `reused`.
- `instructionsApplied` is true for each 自社の指示 field that had text. `instructionNotes` lists any instruction point that was unclear or ignored, in one short Japanese line each.
- State clearly that no mail was sent by the matching skill.

## Guardrails

- Matching evaluation is the matching skill's only job. Do not register, update, or delete PROJECT/CANDIDATE here. Use the register / inbox skills for create / refresh / close.
- Never create a new matching from titles alone. First the structured search, then `get_*`, then the overview and sheet, then `create_matching` only for a clear fit.
- Never create a new matching when PROJECT owner and CANDIDATE supplier share the same `companyId` (同社同士).
- By default, never create a new matching when either side has `recruitmentStatus: CLOSED` (募集終了); only an instruction that says so changes this. Unset stays. If `get_*` still shows CLOSED, skip as `matching_skipped` / `募集終了`.
- Never re-check 単価 from overview text or attachments after the structured `projectCondition` / `candidateCondition` search. 単価 is decided once on the stored values after `get_*` (単価の比べ方): 案件の上限 ≥ 要員の下限 + マージン, in 税別 (税込 ÷ 1.1), at a 稼働率 where both sides' 稼働率 ranges overlap. この稼働割合の月額 is the money at any 稼働率 in its range, 1人月あたり is one full person-month, and 時給 × 160時間 is the 1人月あたり. Equal passes. A null bound keeps the pair. A margin applies only when 絞り込み方 sets it. The 派遣契約必須 skip applies only when 絞り込み方 sets it. Do not mine overview or attachments for a 万円 to reject the pair. Do not compare source monthly 万円 from overview or record attachments.
- Judge 経験年数 inside the 必須・歓迎の判定: a stated 必須 minimum the candidate text falls short of makes that item △, not an automatic drop. Unstated years do not lower a mark. Do not invent a year count or sum overlapping periods the text does not total.
- Matching `reason` is the fit reason only: by default the ◯ / △ / ✕ line for each 必須 and 歓迎 item, from the two overviews and from the skill-sheet body when obtained, with nothing about 単価 (no amounts, margin, or 単価相談可 note), written in polite です／ます調 for SES協力会社向け提案メール. There is no skills column. Separate lines with real newlines so the pasted `マッチング理由：` block stays readable. Never include company-relationship phrases such as `別社提案`. Never use telegram-style shorthand. 理由の書き方 can change any of these.
- Never send mail. Never create Outlook drafts from the matching skills.
