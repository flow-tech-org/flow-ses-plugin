import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const skill = readFileSync(
  new URL("../skills/close-stale-source-listings/SKILL.md", import.meta.url),
  "utf8",
);
const reference = readFileSync(
  new URL("../skills/close-stale-source-listings/reference.md", import.meta.url),
  "utf8",
);

test("stale source close skill uses the last 3 JST business days", () => {
  assert.match(skill, /^name: close-stale-source-listings$/mu);
  assert.match(skill, /flow-ses:evaluate-candidate-matchings/u);
  assert.match(skill, /flow-ses:evaluate-project-matchings/u);
  assert.match(skill, /candidate-side/u);
  assert.match(skill, /project-side/u);
  assert.match(skill, /JST Monday–Friday/u);
  assert.match(skill, /国民の祝日 and 振替休日/u);
  assert.match(skill, /If the run date is a business day, include it/u);
  assert.match(skill, /2026-08-10/u);
  assert.match(skill, /2026-08-06`, `2026-08-07`, `2026-08-10`/u);
  assert.match(skill, /start of the earliest of those 3 business days/u);
  assert.match(skill, /end of the run date/u);
  assert.match(skill, /Do \*\*not\*\* use `2026-08-08` through `2026-08-10`/u);
  assert.match(reference, /2026-08-06`, `2026-08-07`, `2026-08-10`/u);
  assert.match(reference, /2026-08-11` is 山の日/u);
  assert.match(reference, /2026-08-07`, `2026-08-10`, `2026-08-12`/u);
  assert.match(skill, /3 calendar days and drops Friday/u);
});

test("stale source close skill closes when the newest linked source createdAt is outside the window", () => {
  assert.match(skill, /recruitmentStatuses: \["unset"\]/u);
  assert.match(skill, /Paginate `cursor` = `nextCursor` until exhausted/u);
  assert.match(skill, /recruitmentStatus: CLOSED/u);
  assert.match(skill, /募集終了/u);
  assert.match(skill, /最も直近に作成されたものが直近3営業日にない/u);
  assert.match(skill, /leave `recruitmentStatus` alone/u);
  assert.match(skill, /Do not reopen/u);
  assert.match(skill, /already-closed/u);
  assert.match(skill, /recentSource/u);
  assert.match(skill, /Zero sources/u);
  assert.match(skill, /`Source\.createdAt`/u);
  assert.match(skill, /Take the \*\*latest\*\* `createdAt` among the record's linked sources/u);
  assert.match(skill, /URL and Outlook alike/u);
  assert.match(reference, /Source\.createdAt`: when that mail was ingested into the ledger/u);
  assert.match(reference, /2026-10-01` 01:06 JST, which is inside/u);
  assert.match(skill, /"skippedRecentSource": 0/u);
  assert.match(skill, /"skippedAlreadyClosed": 0/u);
  assert.doesNotMatch(skill, /recentUpdate|recentLink|skippedRecentUpdate|skippedRecentLink/u);
  assert.doesNotMatch(reference, /recentUpdate|recentLink|skippedRecentUpdate|skippedRecentLink/u);
  assert.doesNotMatch(skill, /UrlSource\.updatedAt/u);
  assert.doesNotMatch(skill, /newerSource/u);
});

test("stale source close skill does not use linkedAt, URL updatedAt, mail, or record times as the clock", () => {
  assert.match(skill, /Do \*\*not\*\* use source-link `linkedAt`, URL source `updatedAt`, mail `receivedAt` \/ `sentAt`, or record `updatedAt` \/ `createdAt` as the clock/u);
  assert.match(skill, /Do \*\*not\*\* call `get_mail_source` or `get_url_source` to invent a time/u);
  assert.match(skill, /No `createdAtFrom` \/ `createdAtTo`/u);
  assert.match(skill, /No `updatedAtFrom` \/ `updatedAtTo`/u);
  assert.match(skill, /No `createdAfter` \/ `createdBefore`/u);
  assert.match(skill, /No `updatedAfter` \/ `updatedBefore`/u);
  assert.match(skill, /createdAtUnknown/u);
  assert.doesNotMatch(skill, /updatedAtUnknown|linkedAtUnknown/u);
  assert.match(reference, /Source-link `linkedAt`/u);
  assert.match(reference, /URL source `updatedAt`/u);
  assert.match(reference, /Mail `receivedAt` \/ `sentAt`/u);
  assert.match(reference, /Record `updatedAt` \/ `createdAt`/u);
  assert.doesNotMatch(skill, /listingUpdatedFrom/u);
  assert.doesNotMatch(skill, /dateField: "updatedAt"/u);
});

test("stale source close skill does not unlink, delete, rewrite, or send mail", () => {
  assert.match(skill, /Do \*\*not\*\* pass `overview`, `originalText`, title, or conditions/u);
  assert.match(skill, /Do \*\*not\*\* unlink/u);
  assert.match(skill, /Do \*\*not\*\* `delete_url_source`/u);
  assert.match(skill, /Never rewrite 原文/u);
  assert.match(skill, /Never send mail/u);
  assert.match(skill, /each site's broken-link close skill/u);
  assert.doesNotMatch(skill, /chotatsu|ohgi/iu);
  assert.match(skill, /Do not call `match_project_overviews` or `match_candidate_overviews`/u);
  assert.match(reference, /update_project` \/ `update_candidate` with `\{ projectId \| candidateId, recruitmentStatus: "CLOSED" \}` only/u);
  assert.doesNotMatch(skill, /create_project/u);
  assert.doesNotMatch(skill, /set_project_overview/u);
  assert.doesNotMatch(skill, /set_project_original_text/u);
});

test("stale source close skill rejects unset matchings when a linked side is closed", () => {
  assert.match(skill, /### 5\. Reject unset matchings/u);
  assert.match(skill, /matchingStatuses: \["unset"\]/u);
  assert.match(skill, /"kind": "PROJECT", "recruitmentStatuses": \["CLOSED"\]/u);
  assert.match(skill, /"kind": "CANDIDATE", "recruitmentStatuses": \["CLOSED"\]/u);
  assert.match(skill, /Related rows AND together/u);
  assert.match(skill, /Do not put `PROJECT` and `CANDIDATE` in the same `relatedConditions` array/u);
  assert.match(skill, /Do not pass `matchingStatus: "unset"`/u);
  assert.match(skill, /`list_matchings` has no top-level `recruitmentStatuses`/u);
  assert.match(skill, /update_matching` with `matchingId` set to that id and `matchingStatus: "REJECTED"` only/u);
  assert.match(skill, /Do not pass `title` or `reason`/u);
  assert.match(skill, /Do not pass `matchingStatus: null`/u);
  assert.match(skill, /both still recruiting/u);
  assert.match(skill, /CONFIRMING` \(確認中\), `PROPOSING` \(提案中\), `REJECTED` \(却下\), `PASSED_OVER` \(お見送り\), `WITHDRAWN` \(辞退\), and `CONTRACT_CONFIRMED` \(契約確定\)/u);
  assert.match(skill, /Do not set `CONFIRMING` to `REJECTED`/u);
  assert.match(reference, /Do not set `CONFIRMING` to `REJECTED`/u);
  assert.doesNotMatch(skill, /Do not call `create_collaboration_comment`/u);
  assert.doesNotMatch(reference, /Do not call `create_collaboration_comment`/u);
  assert.match(skill, /Do not call `create_matching`/u);
  assert.match(skill, /"rejected": 0/u);
  assert.match(reference, /## Reject unset matchings/u);
  assert.match(reference, /matchingStatuses: \["unset"\]/u);
  assert.match(reference, /"kind": "PROJECT", "recruitmentStatuses": \["CLOSED"\]/u);
  assert.match(reference, /"kind": "CANDIDATE", "recruitmentStatuses": \["CLOSED"\]/u);
  assert.match(reference, /update_matching` with `\{ matchingId, matchingStatus: "REJECTED" \}` only/u);
  assert.match(reference, /"rejected": 0/u);
});

test("stale source close skill comments 鮮度を保つ為却下 before each reject", () => {
  assert.match(skill, /`create_collaboration_comment` with `recordType: "MATCHING"`, `recordId` set to that id, and `body: "鮮度を保つ為却下"` exactly/u);
  assert.match(skill, /Only after that comment succeeds, `update_matching`/u);
  assert.match(skill, /If the comment fails, do not reject that matching/u);
  assert.match(skill, /first create_collaboration_comment on that MATCHING with body 「鮮度を保つ為却下」, then update_matching/u);
  assert.match(reference, /`create_collaboration_comment` with `\{ recordType: "MATCHING", recordId, body: "鮮度を保つ為却下" \}`/u);
  assert.match(reference, /Only after that comment succeeds, `update_matching`/u);
  assert.doesNotMatch(skill, /Do not add a comment\./u);
  assert.doesNotMatch(skill, /projectRecruitmentStatus/u);
  assert.doesNotMatch(skill, /candidateRecruitmentStatus/u);
});

test("stale source close skill leaves a listing open when a linked matching is 確認中 or 提案中", () => {
  assert.match(skill, /### Hold for 確認中 or 提案中/u);
  assert.match(skill, /relatedConditions: \[\{ "kind": "MATCHING", "matchingStatuses": \["CONFIRMING", "PROPOSING"\] \}\]/u);
  assert.match(skill, /One linked `MATCHING` with either status holds that PROJECT or CANDIDATE/u);
  assert.match(skill, /Do not add `unset`, `REJECTED`, `PASSED_OVER`, `WITHDRAWN`, or `CONTRACT_CONFIRMED` to that `matchingStatuses` array/u);
  assert.match(skill, /`recruitmentStatuses: \["unset"\]` stays/u);
  assert.match(reference, /`recruitmentStatuses: \["unset"\]` stays/u);
  assert.match(skill, /Those matching statuses do not stop the close/u);
  assert.match(reference, /Those matching statuses do not stop the close/u);
  assert.doesNotMatch(skill, /MATCHING_PROPOSAL/u);
  assert.match(skill, /activeMatching/u);
  assert.match(skill, /"skippedActiveMatching": 0/u);
  assert.match(skill, /If either hold list fails, do not close any record in this run/u);
  assert.match(skill, /Do not reject `CONFIRMING`/u);
  assert.match(reference, /relatedConditions: \[\{ "kind": "MATCHING", "matchingStatuses": \["CONFIRMING", "PROPOSING"\] \}\]/u);
  assert.match(reference, /skipped` \/ `activeMatching/u);
  assert.match(reference, /"skippedActiveMatching": 0/u);
  assert.match(reference, /Leave `CONFIRMING`, `PROPOSING`, `REJECTED`, `PASSED_OVER`, `WITHDRAWN`, and `CONTRACT_CONFIRMED`/u);
  assert.match(skill, /`Source\.createdAt`/u);
});

test("stale source close skill leaves records with zero linked sources open", () => {
  assert.match(skill, /Records with zero\n {2}元ソース are out of scope/u);
  assert.match(skill, /Zero sources → do \*\*not\*\* close\. Status `skipped` \/ `noSource`/u);
  assert.match(skill, /Zero sources never close \(`noSource`\)/u);
  assert.match(skill, /"skippedNoSource": 0/u);
  assert.match(reference, /Zero linked sources → `skipped` \/ `noSource`\. Do not close/u);
  assert.match(reference, /"skippedNoSource": 0/u);
  assert.doesNotMatch(skill, /Zero sources, or a latest createdAt outside the window/u);
  assert.doesNotMatch(skill, /including when there are zero sources/u);
  assert.doesNotMatch(skill, /Zero sources close only when/u);
  assert.doesNotMatch(reference, /\(or zero sources\)/u);
});

test("stale source close skill leaves listings and matchings of excluded companies alone", () => {
  assert.match(skill, /## Excluded companies/u);
  assert.match(skill, /pass those ids as `excludeCompanyIds` on `list_projects` and `list_candidates`/u);
  assert.match(skill, /drop every listed matching whose `companies` include an excluded company id/u);
  assert.match(skill, /"skippedExcludedCompany": 0/u);
  assert.match(skill, /An unresolved name stops the run with an error/u);
});
