import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = readFileSync(
  new URL(
    "../skills/generate-distribution-draft/SKILL.md",
    import.meta.url,
  ),
  "utf8",
);

test("distribution draft skill converts 税込 to 税抜 before ±5万", () => {
  assert.match(skill, /単価は税抜にしてから ±5万/u);
  assert.match(skill, /1000円未満の端数/u);
  assert.match(skill, /案件は切り捨て、要員は切り上げ/u);
  assert.match(skill, /58\.6万円（税抜）/u);
  assert.match(skill, /68\.7万円（税抜）/u);
  assert.match(skill, /template`: `PARTNER`/u);
  assert.match(skill, /AFFILIATION/u);
  assert.match(skill, /do not create `PARTNER` drafts/u);
  assert.match(skill, /commercialFlowMaxDepth` 0/u);
  assert.match(skill, /lives only on the 紹介元会社 配信ルール/u);
  assert.match(skill, /not when the listing ledger is a listing site or another channel/u);
  assert.match(skill, /do not apply 配信ルール rules marked 協力会社向け/u);
  assert.match(skill, /協力会社向け — 商流制限は structured から −1段/u);
  assert.match(skill, /Replace the source 商流制限 sentence in the core with the line from structured `commercialFlowMaxDepth`/u);
  assert.match(skill, /`1` → `貴社まで`, `2` → `1社先まで`, `3` → `2社先まで`, `4` → `3社先まで`/u);
  assert.match(skill, /`null`（なし）does not invent a 商流制限 line/u);
  assert.match(skill, /Do not write `4社先まで` from a stored `5`/u);
  assert.doesNotMatch(skill, /5社先まで/u);
  assert.match(skill, /Replace the source 商流制限 sentence/u);
  assert.match(skill, /Do not deepen 商流 or 所属 again/u);
  assert.match(skill, /Do \*\*not\*\* apply \+1段 to the \*\*subject\/title\*\* again/u);
  assert.match(skill, /`二次請け` → `三次請け`/u);
  assert.match(skill, /do not deepen 商流 or 所属 again on the overview core/u);
  assert.match(skill, /This record's 概要/u);
  assert.match(skill, /Do \*\*not\*\* read the latest inbound 元ソース body/u);
  assert.match(skill, /Do not fall back to 元ソース/u);
  assert.doesNotMatch(skill, /compareSource/u);
  assert.match(skill, /mode=SOURCE_RECIPE/u);
  assert.match(skill, /overviewLineCount/u);
  assert.match(skill, /preview `title` for the subject/u);
  assert.match(skill, /Empty `subjectReplacements` registers the title as the Outlook subject/u);
  assert.match(skill, /do \*\*not\*\* pass `subject` or `bodyText` on `SOURCE_RECIPE`/u);
  assert.doesNotMatch(skill, /【商流制限】貴社所属まで/u);
});
