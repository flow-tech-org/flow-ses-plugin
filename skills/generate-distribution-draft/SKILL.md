---
name: generate-distribution-draft
description: >-
  Write a partner-distribution Outlook draft (subject, profile core except
  greeting/closing/signature, and FILE attachment ids) from this record's
  overview and optional company 配信ルール. Used by agents through
  the FlowSES connector. Does not save 配信用情報. Sends only when the user explicitly
  asks to send.
---

# Generate a partner distribution draft

Produce the Japanese **core** (案件/要員プロファイル) that a SES operator can edit, then create as an unsent Outlook draft per partner company.

Do **not** write あいさつ, 結び, or the calling user's saved draft signature. The app wraps the core from `template`: `PARTNER` (default) uses the company greeting and closing; `AFFILIATION` uses the affiliation opening greeting only (no ledger company name, no closing). The caller's `draftSignatureText` is appended on create. Do **not** persist subject/body to the ledger.

## Inputs

- This record's 概要 (`overview` from `get_project` / `get_candidate`, or `preview_*_distribution_drafts`). The stored 概要 is already 自社 viewpoint. Do **not** read the latest inbound 元ソース body or the collapsed 原文 (`get_mail_source` / `get_url_source`) to write the core. URL 原文 is UrlSource.originalText and is not the draft core. If overview is empty, stop (`プロファイル未整備`). Do not fall back to 元ソース or 原文.
- Record title as the subject seed.
- 紹介元会社's 会社スキル (`get_company_skill` with that company's id: the Markdown text saved on the company in the 会社台帳), its 配信 section when present. If it returns `skill: null`, a skill loaded in this session whose description names that company or its domain is its 会社スキル (older setups kept them as account skills). If there is none, treat as 「配信ルールなし」.
- Attachment candidates: id, name, selectable. Only selectable FILE ids may be attached. REFERENCE and files over Outlook's 3MB simple-attach limit are not selectable.
- This skill (universal rules).

## Output

JSON only:

```ts
{
  subject: string,       // 1..998
  body: string,          // profile core only
  attachmentIds: string[] // selectable FILE ids to attach; omit to mean all selectable
}
```

`body` is the 案件/要員プロファイル core only. Do not include あて先あいさつ, 紹介文, or 結び. The app wraps that core per company on create. Multiple companies share this same subject and core.

## Universal rules

Always apply these, including when a company 配信ルール is present:

- **単価は税抜にしてから ±5万:** monthly 万円を税抜に揃えてから、案件は **−5**、要員は **+5**。配信コアと件名には **税抜** の額を書く（例: `58.6万円（税抜）`）。税込・税別のラベルは残さない。時給は変換も ±5万もしない。単価が無ければ作らない。
  - 税区分は本文の `税込` / `税抜` / `税別` を優先する。無ければ構造化 `unitPriceTaxType`。それも無ければ税抜。税別は税抜。
  - 税込は消費税率 10% で税抜円にする（`円 × 10 / 11`）。**1000円未満の端数**は案件は切り捨て、要員は切り上げ。そのあと ±5万する。
  - 例: 税込 70万円 → 税抜 636,363.63…円。案件は 636,000円 −5万 = **58.6万円（税抜）**。要員は 637,000円 +5万 = **68.7万円（税抜）**。税抜 70万円なら案件 **65万円（税抜）**、要員 **75万円（税抜）**。幅は上下それぞれ同じ手順。
  - preview の `distributionUnitPrice` に計算済みラベルがあるときはそれを使う。
- **商流 / 所属:** The stored 概要 is already 自社 viewpoint. Do not deepen 商流 or 所属 again on the draft core. Do **not** apply +1段 to the **subject/title** again (registration already rewrote the title). A 自社 candidate's 所属「弊社…」 stays. A 配信ルール that asks for a further hop must not override this. Do not invent a 商流制限 line in the title.
- **協力会社向け — 商流制限は structured から −1段:** Replace the source 商流制限 sentence in the core with the line from structured `commercialFlowMaxDepth` (自社 viewpoint) as N-1 for 1–4 (`1` → `貴社まで`, `2` → `1社先まで`, `3` → `2社先まで`, `4` → `3社先まで`). `null`（なし）does not invent a 商流制限 line. Do not write `4社先まで` from a stored `5`. `commercialFlowMaxDepth` `0`（貴社まで） must not create a PARTNER draft; AFFILIATION is allowed. Source-stated restriction tokens may remain on the record title — apply −1段 to the **subject** only (`貴社1社先まで` → `貴社まで`). Company 配信ルール appendix (例: 商流制限の定型3行) still appends after the profile.
- **連絡先を除去:** strip emails, phone numbers, signatures, 担当者 blocks, and personal names that would leak the 紹介元. This strip is only for the draft. Do not change the stored 原文.
- **URL:** drop unrelated or contact URLs. Keep skill-sheet / スキルシート / Drive / Docs profile-document URLs that belong to the profile.
- **区切り線:** keep framing separator lines that enclose the profile block as part of the profile.
- Do not treat leftover greeting/signature in the overview as the profile. Extract the profile core only.
- Do not change or blank a skill-sheet URL that was present in the overview.

## Company 配信ルール (会社スキル)

When the 会社スキル has a 配信 section, follow it for tone, required preface, brand-token removal, and company-specific framing. 配信ルール wins on those points. Still apply tax-excluded ±5万. Do not deepen 商流 or 所属 again, and do not deepen the subject/title again, even when a 配信ルール still says to deepen `二次請け` → `三次請け`.

Company-specific appendix (例: 商流制限の定型3行) lives only on the 紹介元会社 配信ルール. It applies when that company is on the record — not when the listing ledger is a listing site or another channel. Do not hardcode a named source company or listing channel here.

When template is `AFFILIATION` / 自社向け, do not apply 配信ルール rules marked 協力会社向け / PARTNER-only. A 自社 candidate (`ownCompany: true`) keeps saved 所属「弊社…」; partner distribution must not deepen it, and depth 0 does not invent or block a 商流制限 line. Partner candidates keep the usual distribution rules.

**自社向け — 原文を一度だけ 自社 視点にする:** Apply the same first +1 to the project's 商流 and 所属 in the core. A 自社 candidate's 所属「弊社…」 stays. If restriction tokens remain on the **subject**, delete them (`商流制限` / `【商流制限】` / `商流については弊社N社下まで` / `商流は弊社N社先社員まで` / `貴社所属まで` / `貴社まで` / `N社先まで` as a restriction). Drop leftover partner appendix lines about 上位会社と直接契約 / 営業支援費. Do not deepen the subject again. Do not invent a 商流制限 line in the title.

When 配信ルール is absent, use only the universal rules. Do not invent a greeting, closing, a specific partner company name, or a marketplace 商流制限 block. The selected `template` still wraps the core on create.

## Attachments

Select every selectable FILE unless the 配信ルール or overview makes a file clearly unrelated. Never select REFERENCE or unselectable ids. If unsure, select all selectable FILE ids.

## Agent path (MCP)

An agent that must create Outlook drafts prefers `mode=SOURCE_RECIPE` after `preview_*_distribution_drafts`. Use preview `overview` / `overviewLineCount` for the core and preview `title` for the subject. Pass `coreRanges` against that overview text as `{ startText, endText }` copied from its lines, not line numbers: the server uses the one line that starts with `startText` and the first line at or after it that starts with `endText`. Line numbers are rejected. A continuous block is one entry. Use multiple entries only to narrow a multi-person source to this person, or to drop a contact block from the draft. The stored 原文 stays complete. The server joins ranges in source order with one blank line between them. Do **not** read the latest inbound 元ソース body to write the recipe. Express the universal rules (税抜 ±5万, do not deepen 商流 or 所属 again on the overview core or the title/subject, PARTNER 商流制限 from structured −1段 for 1–4 with null（なし） inventing no line and a stored 5 never becoming 4社先まで, leftover subject tokens −1段, AFFILIATION subject restriction tokens deleted, contact/URL strip) as `replacements` / `insertions` on the overview and `subjectReplacements` on the title. Empty `subjectReplacements` registers the title as the Outlook subject. Preview with `mode=SOURCE_RECIPE` and the same recipe to inspect derived `subject` / `bodyText`, then create with that recipe — do **not** pass `subject` or `bodyText` on `SOURCE_RECIPE`. `mode=MANUAL` with caller-supplied `subject` / core `bodyText` remains available. Always pass `attachments`. For `PARTNER` (協力会社向け, omit `template`) call `create_*_distribution_draft` once per eligible `companyKey`. For PROJECT `AFFILIATION` (自社向け) call create once with `template: "AFFILIATION"` and `ownCandidateIds` from preview `ownCandidates`; do not pass `companyKey`. CANDIDATE drafts are `PARTNER` only — do not pass `AFFILIATION`. When `redistributionAllowed` is false, or when a PROJECT has `commercialFlowMaxDepth` 0 (0社先まで / 貴社まで), do not create `PARTNER` drafts; PROJECT `AFFILIATION` is allowed and preview still lists companies and affiliation members. The tool wraps the core. Do not send unless the user asks (see 送信 below). Never reply or forward. Freelancer-only PROJECT drafts to 所属要員 are out of scope for this skill.

## 送信

Create drafts by default. Send only when the user explicitly asks to send this distribution in the conversation (for example 「送信して」「送って」), not when they ask for a draft.

1. Run `preview_*_distribution_drafts` with the same recipe and show the user the subject, the recipient companies (or 自社要員), and the body.
2. After the user approves, call `send_project_distribution` or `send_candidate_distribution` with the same inputs you would pass to `create_*_distribution_draft`, once per approved company (PROJECT `AFFILIATION` once with the approved `ownCandidateIds`). Each call needs a new UUID `requestId`.
3. `DISTRIBUTION_REQUEST_ALREADY_USED` means that `requestId` already ran and nothing was sent. Do not retry with a new `requestId` unless the user asks to send again.
4. `DRAFT_SEND_FAILED` leaves the draft in the mailbox; give the user its `webLink`. `OUTLOOK_REAUTHORIZATION_REQUIRED` means the user reconnects Outlook in ユーザー設定 (Mail.Send).

Matching new mail and conversation replies stay drafts; there is no send tool for them.
