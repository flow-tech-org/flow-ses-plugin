import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const conditions = readFileSync(
  new URL("../skills/structured-conditions/SKILL.md", import.meta.url),
  "utf8",
);

test("structured conditions keeps source 万円 on overview and forbids side effects", () => {
  assert.match(conditions, /do \*\*not\*\* map 元請直→0/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /弊社を挟む。`2社先` → `1`、`1社先` → `0`/u);
  assert.match(conditions, /フルリモート可かつ出社可（フル出社可）なら週1–4も含めて 0–5/u);
  assert.match(conditions, /`即日` \/ `即日のみ` \/ `即日開始`/u);
  assert.match(conditions, /`随時` で開始年月が無いときも、即日と同じ月の入れ方/u);
  assert.match(conditions, /随時は即日という語にはしない/u);
  assert.match(conditions, /年月が書いてあればその月のまま/u);
  assert.match(conditions, /`即日以外の開始日` は即日ではない/u);
  assert.match(conditions, /開始の記載自体が無いときも、保存前に Asia\/Tokyo の現在の年月/u);
  assert.doesNotMatch(conditions, /保存エラー/u);
  assert.match(conditions, /`immediateStart` は無い/u);
  assert.match(conditions, /両方にレンジがあるときだけ交差を見る/u);
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`初日出社OK` \/ `初日出社可` を `出社可` と読まない/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
});

test("structured conditions classifies skill lines by meaning", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
  assert.match(conditions, /There is no `requiredSkills` or `preferredSkills` column/u);
});

test("structured conditions maps 一部出社 to hybrid and 出社 to フル出社", () => {
  assert.match(conditions, /週5はフル出社/u);
  assert.match(conditions, /一部出社` \/ `リモート併用` \/ 週1–4日出社は週1–4であり、週5にしない/u);
  assert.match(conditions, /週5日のみがフル出社/u);
});

test("structured conditions compares on-site days when both sides state a range", () => {
  assert.match(conditions, /両方にレンジがあるときだけ交差を見る/u);
  assert.match(conditions, /片方が未記載なら不一致にしない/u);
  assert.match(conditions, /A missing 出社頻度 is not a mismatch/u);
});

test("structured conditions sets bare 常駐 to 週5–5 and capability phrases to 週0–5", () => {
  assert.match(conditions, /`常駐` \/ `客先常駐` \/ `出社` だけでリモート可否や週数が無いときは `onSiteDaysPerWeekMin=5`、`onSiteDaysPerWeekMax=5`（週5–5）/u);
  assert.doesNotMatch(conditions, /から週5を補完しない/u);
  assert.doesNotMatch(conditions, /do \*\*not\*\* invent 週5 from 常駐/u);
  assert.doesNotMatch(conditions, /出社頻度も `null`/u);
  assert.match(conditions, /案件の勤務指定 `フル常駐` \/ `完全常駐` \/ `フル出社` \/ `出社のみ` \/ `フル出社必須` \/ `リモート不可` はリモート不可/u);
  assert.match(conditions, /同じソースにリモート許容があるときはその記載を優先し、許容された週をレンジに含める/u);
  assert.match(conditions, /要員の `フル常駐可能` \/ `フル出社可能` \/ `常駐可` \/ `出社可` は「できる」だけでリモート不可ではない/u);
  assert.match(conditions, /Project `フル常駐` \/ `完全常駐` \/ `フル出社` \/ `出社のみ` \/ `フル出社必須` sets 出社頻度 to 週5/u);
  assert.match(conditions, /For 要員 `フル常駐可能` \/ `フル出社可能` \/ `常駐可` \/ `出社可`, that is capability only for denying remote, and 出社頻度 is 週0–5/u);
  assert.match(conditions, /案件側の同じ語は週0–5にしない/u);
  assert.match(conditions, /`一部リモート可（週1程度）` → `onSiteDaysPerWeekMin=4`、`onSiteDaysPerWeekMax=5`（週4–5）/u);
  assert.match(conditions, /Project `一部リモート可（週1程度）` is 週4–5, not 週1–1/u);
  assert.match(conditions, /案件で週数の無い `一部リモート可` は週1–5（`onSiteDaysPerWeekMin=1`、`onSiteDaysPerWeekMax=5`）/u);
  assert.match(conditions, /Project bare `一部リモート可` is 週1–5, not 週1–4/u);
  assert.match(conditions, /案件の `フルリモート` だけ（可なし）は週0–0/u);
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
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`初日出社OK` \/ `初日出社可` を `出社可` と読まない/u);
  assert.match(conditions, /`月1` \/ `月数回` \/ `月1程度の出社応相談` は週5フル出社ではない/u);
  assert.match(conditions, /`リモート希望（初日出社OK、月1程度の出社応相談）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`/u);
  assert.doesNotMatch(conditions, /`リモート希望（初日出社OK、月1程度の出社応相談）` → `acceptsFullRemote=true`/u);
  assert.match(conditions, /do not read `初日出社OK` as `出社可`/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
  assert.doesNotMatch(conditions, /常駐を週5として登録/u);
});

test("structured conditions leaves unstated 出社頻度 null and does not treat a missing range as a mismatch", () => {
  assert.match(conditions, /片方が未記載なら不一致にしない/u);
  assert.match(conditions, /A missing 出社頻度 is not a mismatch/u);
});

test("structured conditions includes 週1–4 when full remote and on-site are both allowed", () => {
  assert.match(conditions, /週0はフルリモート、週1–4は一部リモート、週5はフル出社/u);
  assert.match(conditions, /フルリモート可かつ出社可（フル出社可）なら週1–4も含めて 0–5/u);
  assert.match(conditions, /`フルリモート可、出社も可` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=5`/u);
  assert.match(conditions, /片方だけ可のときはその端だけ/u);
  assert.match(conditions, /両端が可のときに週1–4だけを外さない/u);
  assert.doesNotMatch(conditions, /`一部リモート不可` が明示されているときは立てない/u);
});

test("structured conditions registers partner candidate affiliation from 自社 viewpoint", () => {
  assert.match(conditions, /自社視点/u);
  assert.match(conditions, /協力会社の「弊社」= 自社の1つ下/u);
  assert.match(conditions, /協力会社「弊社」→ `1`/u);
  assert.match(conditions, /自社直所属「弊社」→ `0`/u);
  assert.match(conditions, /\*\*\+1 しない\*\*/u);
  assert.match(conditions, /`弊社1社下社員まで` → `0`/u);
  assert.match(conditions, /Do \*\*not\*\* apply this shift to `commercialFlowMaxDepth`/u);
  assert.match(conditions, /do \*\*not\*\* map 元請直→0/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /弊社を挟む。`2社先` → `1`、`1社先` → `0`/u);
  assert.match(conditions, /ここでの弊社は協力会社/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
});

test("structured conditions classifies skill lines by meaning (1)", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
  assert.match(conditions, /There is no `requiredSkills` or `preferredSkills` column/u);
});

test("structured conditions keeps source 万円 on overview and forbids side effects (2)", () => {
  assert.match(conditions, /do \*\*not\*\* map 元請直→0 or 二次請け→2/u);
  assert.match(conditions, /`元請` \/ `元請直`/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /弊社を挟む。`2社先` → `1`、`1社先` → `0`/u);
  assert.match(conditions, /`弊社1社下社員まで` → `0`/u);
  assert.match(conditions, /do \*\*not\*\* copy `1`/u);
  assert.match(conditions, /両方にレンジがあるときだけ交差を見る/u);
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`月1` \/ `月数回` \/ `月1程度の出社応相談` は週5フル出社ではない/u);
});

test("structured conditions classifies skill lines by meaning (3)", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
});

test("structured conditions keeps source 万円 on 原文 and forbids side effects", () => {
  assert.match(conditions, /両方にレンジがあるときだけ交差を見る/u);
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`初日出社OK` \/ `初日出社可` を `出社可` と読まない/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
});

test("structured conditions extracts dedicated-page labeled sections including 商流制限", () => {
  assert.match(conditions, /`一部リモート可（週1程度）` → `onSiteDaysPerWeekMin=4`、`onSiteDaysPerWeekMax=5`（週4–5）/u);
  assert.match(conditions, /`一部出社可（週1程度）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=1`（週0–1）/u);
  assert.doesNotMatch(conditions, /do \*\*not\*\* invent 週5/u);
});

test("structured conditions registers candidate affiliation from 自社 viewpoint", () => {
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
});

test("structured conditions classifies skill lines by meaning (4)", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
  assert.match(conditions, /There is no `requiredSkills` or `preferredSkills` column/u);
});

test("structured conditions follow the shared mapping and 自社 affiliation \+1", () => {
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
  assert.match(conditions, /do \*\*not\*\* map 元請直→0/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /ここでの弊社は協力会社/u);
  assert.match(conditions, /`一次請け` \/ `二次請け` \/ `三次請け` \/ `元請` \/ `元請直` は掲載会社の立場であり制限段数ではない/u);
});

test("structured conditions classifies skill lines by meaning (5)", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
});

test("structured conditions follow the shared mapping and does not treat 初日出社 as フル出社", () => {
  assert.match(conditions, /`初日出社` \/ `初日のみ` \/ `顔合わせ出社` はオンボーディングであり勤務形態ではない/u);
  assert.match(conditions, /`月1` \/ `月数回` \/ `月1程度の出社応相談` は週5フル出社ではない/u);
  assert.match(conditions, /Bare `出社応相談` without 週5 \/ 常駐 \/ フル出社 is not フル出社/u);
});

test("structured conditions maps column 要員 and row 案件 plus 自社 affiliation +1", () => {
  assert.match(conditions, /貴社まで/u);
  assert.match(conditions, /`一次請け` \/ `二次請け` \/ `三次請け` \/ `元請` \/ `元請直` は掲載会社の立場であり制限段数ではない/u);
  assert.match(conditions, /do \*\*not\*\* map 元請直→0/u);
  assert.match(conditions, /When matching, use structured `commercialFlowMaxDepth` when set/u);
  assert.match(conditions, /bare `N社先` \/ `N社下`（貴社も弊社も無い）は掲載会社起点なので \*\*N-1\*\*/u);
  assert.match(conditions, /ここでの弊社は協力会社/u);
});

test("structured conditions copies cells verbatim and leaves closing to the stale-source skill", () => {
  assert.match(conditions, /`貴社まで` \/ `貴社プロパーまで` \/ `貴社社員まで` → 0/u);
  assert.match(conditions, /`貴社まで` \/ `貴社プロパーまで` \/ `貴社社員まで` → 0/u);
});

test("structured conditions classifies skill lines by meaning (6)", () => {
  assert.match(conditions, /Meaning wins over the exact heading and over where the line sits/u);
  assert.match(conditions, /Before tagging, `search_skills`/u);
  assert.match(conditions, /Group true synonyms with `update_skill` or `move_skill_aliases`/u);
  assert.match(conditions, /Do not merge merely related names/u);
  assert.match(conditions, /If nothing fits, `create_skill`, then tag/u);
  assert.match(conditions, /so ingests pass `skills`, not `skillNames`/u);
  assert.match(conditions, /Do not rewrite 原文/u);
  assert.doesNotMatch(conditions, /There is no `skills` column/u);
  assert.doesNotMatch(conditions, /Do not merge synonyms during ingest/u);
  assert.match(conditions, /歓迎\/尚可 lines stay in the overview excerpt/u);
});

test("structured conditions treats every 【副業】要員 column as 副業 for 稼働割合", () => {
  assert.match(conditions, /`副業` \/ `副業希望` とあり、人月・%・週の日数・週の時間のどれも書かれていないときは、下限 0、上限 100/u);
});
