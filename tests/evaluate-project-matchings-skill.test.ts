import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const skill = readFileSync(
  new URL("../skills/evaluate-project-matchings/SKILL.md", import.meta.url),
  "utf8",
);

test("evaluate-project-matchings skill is project-anchored", () => {
  assert.match(skill, /^name: evaluate-project-matchings$/mu);
  assert.match(skill, /Project-side/u);
  assert.match(skill, /Anchors are \*\*PROJECT only\*\*/u);
  assert.match(skill, /Do not start from CANDIDATE/u);
  assert.match(skill, /one project at a time/u);
  assert.match(skill, /For one processed PROJECT, call `list_candidates`/u);
  assert.match(skill, /anchors are all 募集中 projects/u);
  assert.match(skill, /Partner candidates are all 募集中 candidates/u);
  assert.match(skill, /Do not limit that default to the last 3 business days/u);
  assert.match(skill, /When only one side is specified/u);
  assert.match(skill, /When both are specified/u);
  assert.match(skill, /updatedAtFrom` \/ `updatedAtTo`/u);
  assert.doesNotMatch(skill, /dateField/u);
  assert.match(skill, /flow-ses:evaluate-candidate-matchings/u);
  assert.doesNotMatch(skill, /Anchors are \*\*CANDIDATE only\*\*/u);
  assert.doesNotMatch(skill, /Do not start from PROJECT/u);
  assert.doesNotMatch(skill, /Build the 3-business-day partner pool/u);
});

test("evaluate-project-matchings searches candidates with skillNames and excludeMatchedProjectId", () => {
  assert.match(skill, /Call `list_candidates` with `recruitmentStatuses: \["unset"\]`\. Add `ids` = the specified CANDIDATE ids \(max 200 per call\) only when candidate ids were specified/u);
  assert.match(skill, /do not collect or pass partner `ids`/u);
  assert.match(skill, /recruitmentStatuses: \["unset"\]/u);
  assert.match(skill, /candidateCondition\.skillNames/u);
  assert.match(skill, /Multiple names stay AND/u);
  assert.match(skill, /Do not pass years or `skillYearsMin`/u);
  assert.match(skill, /Candidates with zero skill tags are excluded while any name is passed/u);
  assert.match(skill, /If the project has no skill names, do not filter by skill/u);
  assert.match(skill, /技術領域: languages, frameworks/u);
  assert.match(skill, /業務分野: industries and business knowledge/u);
  assert.match(skill, /役割: roles and positions/u);
  assert.match(skill, /keep REQUIRED names before PREFERRED names/u);
  assert.match(skill, /The start count is 3 when the project has 3 or more known names/u);
  assert.match(skill, /one name from 技術領域, one from 業務分野, and one from 役割, in that order/u);
  assert.match(skill, /Use その他 names only when 技術領域, 業務分野, and 役割 together have fewer names than the count/u);
  assert.match(skill, /Try at most 5 different combinations at the start count/u);
  assert.match(skill, /When the count is 3 or 2 and a combination returns at least one candidate, do not stop: try the remaining combinations at that same count, still at most 5 in total/u);
  assert.match(skill, /Do not go on to a smaller count after a hit/u);
  assert.match(skill, /At 1 name, stop at the first combination that returns at least one candidate/u);
  assert.doesNotMatch(skill, /Do not search more combinations or merge other results after a hit/u);
  assert.match(skill, /remove one name and try at most 5 different combinations of the smaller count/u);
  assert.match(skill, /report `matching_skipped` \/ `マッチング対象なし` and create nothing/u);
  assert.match(skill, /Do not search with zero names/u);
  assert.match(skill, /Java \+ 金融 \+ PL, then Spring Boot \+ 金融 \+ PL, then Java \+ 銀行 \+ PL/u);
  assert.doesNotMatch(skill, /k-name combination/u);
  assert.doesNotMatch(skill, /drop one name and search again/u);
  assert.doesNotMatch(skill, /only one name remains/u);
  assert.doesNotMatch(skill, /down to one name/u);
  assert.match(skill, /Do not add skill names the project does not have/u);
  assert.match(skill, /excludeMatchedProjectId` = that project id/u);
  assert.match(skill, /including 却下 and お見送り/u);
  assert.match(skill, /Do not use `relatedConditions` kind `MATCHING`/u);
  assert.match(skill, /Do not call `excludeMatchedCandidateId`/u);
  assert.match(skill, /pass only `startYearMonthTo` set to that month/u);
  assert.match(skill, /Do not subtract a month/u);
  assert.match(skill, /Do not pass `startYearMonthFrom`/u);
  assert.match(skill, /Do not pass both bounds/u);
  assert.match(skill, /`2026-10` → `startYearMonthTo: "2026-10"`/u);
  assert.match(skill, /Candidates who start after that month drop/u);
  assert.match(skill, /That month and earlier stay/u);
  assert.match(skill, /pass that month as `startYearMonthTo` with no offset/u);
  assert.doesNotMatch(skill, /minus one month/u);
  assert.doesNotMatch(skill, /startYearMonthFrom: "2026-09"/u);
  assert.doesNotMatch(skill, /pass the stored month as both `startYearMonthFrom` and `startYearMonthTo`/u);
  assert.match(skill, /Do not pass exact `startYearMonth`/u);
  assert.doesNotMatch(skill, /pass `startYearMonth` only when stated/u);
  assert.doesNotMatch(skill, /pass `startYearMonth` or `immediateStart`/u);
  assert.match(skill, /pass `affiliationDepth` as that depth\. Do not add a one-level margin/u);
  assert.doesNotMatch(skill, /1段の余裕/u);
  assert.match(skill, /keeps `affiliationDepth` <= that depth and keeps unknown affiliation \(stored as -1, never null\)/u);
  assert.match(skill, /Do not pass `-1`/u);
  assert.match(skill, /Do not pass `affiliationDepths`/u);
  assert.match(skill, /Do not call `0` 自社要員/u);
  assert.match(skill, /pass `onSiteDaysPerWeekMin` and `onSiteDaysPerWeekMax`/u);
  assert.match(skill, /Do not pass `onSiteDaysPerWeek` \(a week array\)/u);
  assert.match(skill, /When the anchor range is 0 and 5, omit the filter/u);
  assert.match(skill, /If `onSiteDaysPerWeekMin` is 0, do not pass `prefectureCodes`/u);
  assert.match(skill, /Do not filter candidates by prefecture/u);
  assert.match(skill, /if this project has no `prefectureCode`, do not pass `prefectureCodes`/u);
  assert.match(skill, /Do not pass `includeFullRemoteRegardlessOfPrefecture`/u);
  assert.match(skill, /北海道 `01`/u);
  assert.match(skill, /東北 `02` `03` `04` `05` `06` `07`/u);
  assert.match(skill, /首都圏 `11` `12` `13` `14`/u);
  assert.match(skill, /首都圏 → `08` `09` `10` `11` `12` `13` `14` `19` `20`/u);
  assert.match(skill, /隣接エリア: 首都圏–北関東, 首都圏–甲信/u);
  assert.match(skill, /The default is the same エリア only; do not add 隣接エリア unless 絞り込み方 says so/u);
  assert.match(skill, /When 絞り込み方 widens it to 隣の地方まで/u);
  assert.doesNotMatch(skill, /that エリア plus its 隣接エリア/u);
  assert.doesNotMatch(skill, /Skip as `通勤不可` only when both locations are stated/u);
  assert.doesNotMatch(skill, /中部 `15`/u);
  assert.match(skill, /北陸 `15` `16` `17` `18`; 東海 `21` `22` `23` `24`/u);
  assert.match(skill, /関西 `25` `26` `27` `28` `29` `30`/u);
  assert.match(skill, /中国 `31` `32` `33` `34` `35`/u);
  assert.match(skill, /四国 `36` `37` `38` `39`/u);
  assert.match(skill, /九州 `40` `41` `42` `43` `44` `45` `46`; 沖縄 `47`/u);
  assert.doesNotMatch(skill, /The list filter is an exact code/u);
  assert.doesNotMatch(skill, /Pass prefecture when the anchor has one, even if the on-site range includes 0/u);
  assert.doesNotMatch(skill, /includeFullRemoteRegardlessOfPrefecture: true/u);
  assert.match(skill, /genders: \[that gender, "unset"\]`/u);
  assert.match(skill, /Do not pass `unset`/u);
  assert.match(skill, /soloProprietorAllowed` false → `isSoloProprietor: \["no"\]`/u);
  assert.match(skill, /true or null → omit/u);
  assert.match(skill, /- 単価の比べ方: the rule is 案件の上限 ≥ 要員の下限 \+ マージン, at a 稼働率 both sides can work at/u);
  assert.match(skill, /The project min and the candidate max are not used; a cheaper candidate always passes/u);
  assert.match(skill, /U is the overlap of the two sides' ranges\. A side that states neither does not limit U/u);
  assert.match(skill, /its amount does not move with 稼働率/u);
  assert.match(skill, /案件 24〜32万 at 稼働0\.5〜0\.8 → up to 64万; 要員 24〜32万 at 稼働0\.5〜0\.8 → from 30万/u);
  assert.match(skill, /U = 0\.6〜0\.8, bound 32 ÷ 0\.6 ≒ 53\.3万, `単価超過`/u);
  assert.match(skill, /m時 is the 時給 amount in 円, used only when both sides are 時給/u);
  assert.doesNotMatch(skill, /単価不一致/u);
  assert.match(skill, /\| この稼働割合 \| P ÷ aL − m月 \|/u);
  assert.match(skill, /案件が この稼働割合: P − m月 × aL\. 案件が 1人月・時給: T × aU/u);
  assert.match(skill, /1人月 64 − m 万, この稼働割合 32 − 0\.5m 万/u);
  assert.match(skill, /Do not mine overview 万円/u);
  assert.match(skill, /with six items/u);
  assert.match(skill, /If it rejects `unitPriceConditions` \(an older FlowSES\), omit the price filter/u);
  assert.doesNotMatch(skill, /compare one kind with itself|four items|160時間 conversion/u);
  assert.match(skill, /A value whose `unitPriceTaxType` is `INCLUDED` \(税込\) is divided by 1\.1 before any comparison or margin/u);
  assert.match(skill, /A margin applies only when 絞り込み方 sets one/u);
  assert.match(skill, /\*\*Margin \(only when 絞り込み方 sets one\):\*\* the default has no margin/u);
  assert.match(skill, /\*\*派遣契約必須 \(only when 絞り込み方 says so\):\*\* by default, 派遣契約必須 projects are evaluated like any other/u);
  assert.match(skill, /単価 is decided once, by the structured filter you passed/u);
  assert.doesNotMatch(skill, /comparableUnitPrice|The required margin is 50,000円/u);
  assert.doesNotMatch(skill, /Never evaluate a project whose `dispatchContractRequired` is `true`/u);
  assert.match(skill, /Do not fill a missing end with 0, 500, or 30000/u);
  assert.doesNotMatch(skill, /unitPriceKind: "HOURLY"/u);
  assert.doesNotMatch(skill, /Pass a stated hourly end/u);
  assert.doesNotMatch(skill, /Do not omit the price filter to keep those rows/u);
  assert.doesNotMatch(skill, /tax-excluded overlap/u);
  assert.doesNotMatch(skill, /片方が未記載なら不一致にしない/u);
  assert.doesNotMatch(skill, /未記載の相手はいない/u);
  assert.doesNotMatch(skill, /dispatchContractRequired: \["unset"\]/u);
  assert.doesNotMatch(skill, /excludeMatchedCandidateId` =/u);
  assert.doesNotMatch(skill, /projectCondition\.skillNames/u);
  assert.doesNotMatch(skill, /Do not pass `skillNames`/u);
  assert.match(skill, /chunk `ids` to at most 200 per `list_candidates` call/u);
});

test("evaluate-project-matchings keeps the same fit, sheet, and reason rules", () => {
  assert.match(skill, /get_candidate_attachment_download_link/u);
  assert.match(skill, /flow-ses:read-office-attachments/u);
  assert.match(skill, /create_matching/u);
  assert.match(skill, /only when the result is OK/u);
  assert.match(skill, /概要未記載/u);
  assert.match(skill, /概要不一致/u);
  assert.match(skill, /スキルシート不一致/u);
  assert.match(skill, /概要だけでは判断できない/u);
  assert.match(skill, /\*\*必須・歓迎の判定 \(required\):\*\*/u);
  assert.match(skill, /With two or more, every 必須 item must be ◯ except at most one △, and none may be ✕/u);
  assert.match(skill, /歓迎 items are marked for the reason but never decide the pair/u);
  assert.match(skill, /`必須の△が多い`/u);
  assert.match(skill, /【必須】/u);
  assert.match(skill, /Never send mail/u);
  assert.match(skill, /Do not create Outlook drafts/u);
  assert.match(skill, /matchingProcessed` is the project anchor ids/u);
  assert.doesNotMatch(skill, /get_record_attachment_download_link/u);
});


test("evaluate-project-matchings does not skip 株式会社アストロ by company name", () => {
  assert.doesNotMatch(skill, /アストロ/u);
});

test("matching evaluation reads the stored sheet text before downloading", () => {
  assert.match(skill, /`get_candidate_attachment_download_link` with `includeText: true`/u);
  assert.match(skill, /Only when `extractedText` is null, download the file/u);
  assert.match(skill, /reuse it for later anchors/u);
});

test("matching needs the project's 主業務 and the candidate's 売り方 to fit, not only the 必須 lines", () => {
  assert.match(skill, /\*\*主業務と売り方 \(required\):\*\* Passing every 必須 line is not enough for a clear fit/u);
  assert.match(skill, /A shared language or framework alone does not count/u);
  assert.match(skill, /When only the language matches, the pair is not created \(`主業務不一致`\)/u);
  assert.match(skill, /is not created for a project whose 主業務 is a different direction/u);
  assert.match(skill, /`主業務不一致`/u);
  assert.match(skill, /Do not use 単価 for this check/u);
});

test("matching reason writes nothing about 単価 by default", () => {
  assert.match(skill, /By default, write nothing about 単価 in `reason`: no amounts, no margin, and no 単価相談可 note\./u);
  assert.doesNotMatch(skill, /add a 単価相談可 line/u);
  assert.doesNotMatch(skill, /plus a 単価相談可 note/u);
});
