# Stale 元ソース 募集終了 reference

This skill does not ingest and does not open a site. リンク切れ stays in each site's broken-link close skill.

## Business days

Same rule as `flow-ses:evaluate-candidate-matchings` (candidate-side) or `flow-ses:evaluate-project-matchings` (project-side). JST Monday–Friday. Do not count Saturday, Sunday, or Japanese national holidays (国民の祝日 and 振替休日).

Count backward from the run date until 3 business days are collected (or N when the run prompt sets 「直近N営業日」; see Run settings in SKILL.md). Include the run date when it is a business day. The window runs from the start of the earliest of those days through the end of the run date, JST. Weekends and holidays between those ends are inside the window.

| Run date | Business days | Window (JST, inclusive) |
| --- | --- | --- |
| `2026-08-10` (Monday) | `2026-08-06`, `2026-08-07`, `2026-08-10` | `2026-08-06` through `2026-08-10` |
| `2026-08-12` (Wednesday; `2026-08-11` is 山の日) | `2026-08-07`, `2026-08-10`, `2026-08-12` | `2026-08-07` through `2026-08-12` |
| `2026-10-02` (Friday) | `2026-09-30`, `2026-10-01`, `2026-10-02` | `2026-09-30` through `2026-10-02` |

Do not use `2026-08-08` through `2026-08-10` for the Monday example. That range is 3 calendar days and drops Friday `2026-08-06`.

A source `createdAt` on Saturday `2026-08-08` is inside the Monday example window. When it is the record's latest source, it leaves `recruitmentStatus` alone.

Run date `2026-10-02`: a record has one source created `2026-09-29` 11:32 JST and a newer one created `2026-10-01` 01:06 JST. The latest `createdAt` is `2026-10-01` 01:06 JST, which is inside. Keep that record (`recentSource`). If its latest source were `2026-09-29` 11:32 JST, it would be outside and the record would close, unless the matching hold keeps it.

## Clock

Slim sources from `list_record_sources` with `latestPerUrl: true` (up to 200 ids per call). Every slim source carries `createdAt`.

| Provider | Clock | Meaning |
| --- | --- | --- |
| URL | `createdAt` | `Source.createdAt`: when that URL snapshot was captured |
| OUTLOOK | `createdAt` | `Source.createdAt`: when that mail was ingested into the ledger |

Take the latest `createdAt` among the record's linked sources and compare that one instant to the window. URL sources are append-only snapshots: `create_url_source` always creates a new source, so a listing that is still captured gets a fresh `createdAt` each run.

| Not the clock | Why |
| --- | --- |
| Source-link `linkedAt` | When the source was linked to this record, not when the source was created |
| URL source `updatedAt` | Not the creation time of the source |
| Mail `receivedAt` / `sentAt` | When the mail occurred, not when the source was stored |
| Record `updatedAt` / `createdAt` | The PROJECT or CANDIDATE row, not the source |

Do not call `get_mail_source` or `get_url_source` for this comparison. Slim sources already carry `createdAt` plus `sourceId`, `linkId`, `provider`, `linkedAt`, and for URL sources `sourceUrl`, `tags`, and `updatedAt`.

## Close call

`update_project` / `update_candidate` with `{ projectId | candidateId, recruitmentStatus: "CLOSED" }` only.

Before that call, list the same recruiting rows again with `recruitmentStatuses: ["unset"]` and `relatedConditions: [{ "kind": "MATCHING", "matchingStatuses": ["CONFIRMING", "PROPOSING"] }]`. Paginate `cursor` = `nextCursor`. One linked `MATCHING` whose status is `CONFIRMING` (確認中) or `PROPOSING` (提案中) holds that PROJECT or CANDIDATE. Do not add `unset`, `REJECTED`, `PASSED_OVER`, `WITHDRAWN`, or `CONTRACT_CONFIRMED` to that `matchingStatuses` array. `recruitmentStatuses: ["unset"]` stays. Those matching statuses do not stop the close. If either hold list fails, do not close any record in this run.

- Unset (`null`), every source `createdAt` readable, the latest one outside the window, and no linked `MATCHING` is `CONFIRMING` or `PROPOSING` → `closed`.
- The latest source `createdAt` inside the window → `skipped` / `recentSource`. Leave `recruitmentStatus` alone.
- Any linked `MATCHING` is `CONFIRMING` or `PROPOSING` → `skipped` / `activeMatching`. Leave `recruitmentStatus` alone, including when the latest source is outside the window.
- Zero linked sources → `skipped` / `noSource`. Do not close. Hand-entered 案件・要員 have no 元ソース.
- A source with no readable `createdAt`, and no readable `createdAt` inside the window → `reviewRequired` / `createdAtUnknown`. Do not close.
- Already `CLOSED` → `skipped` / `already-closed`. Do not reopen. `RecruitmentStatus` is only `CLOSED`; unset is `null`.

List with `recruitmentStatuses: ["unset"]` and paginate `cursor` = `nextCursor`. Do not pass `createdAtFrom`, `createdAtTo`, `updatedAtFrom`, `updatedAtTo`, `createdAfter`, `createdBefore`, `updatedAfter`, or `updatedBefore`. Those filters use record `updatedAt` / `createdAt`.

Do not pass `overview` or `originalText`. Do not `unlink_source_from_record`. Do not `delete_url_source`. Do not `set_project_overview` / `set_candidate_overview`.

## Reject unset matchings

Skip this section when the run prompt says 「未設定のマッチングの却下はしない。」. Otherwise, after the closes above. Matching status null, and the linked project or the linked candidate is `recruitmentStatus` `CLOSED` (募集終了). Includes sides closed in this run and sides already `CLOSED`. Do not limit the search to ids closed in this run.

`list_matchings` has no top-level `recruitmentStatuses`. `matchingStatus` does not accept `unset`. Pass `matchingStatuses: ["unset"]` (status null). Related rows AND together, so call twice and paginate each with `cursor` = `nextCursor`:

1. `relatedConditions: [{ "kind": "PROJECT", "recruitmentStatuses": ["CLOSED"] }]`
2. `relatedConditions: [{ "kind": "CANDIDATE", "recruitmentStatuses": ["CLOSED"] }]`

Do not put both kinds in one `relatedConditions` array. Do not pass `query`, `matchingStatus`, `companyIds`, `projectCompanyIds`, `candidateCompanyIds`, `createdAtFrom`, `createdAtTo`, `updatedAtFrom`, or `updatedAtTo`.

Union by item `id` and handle each id once, in this order:

1. `create_collaboration_comment` with `{ recordType: "MATCHING", recordId, body: "鮮度を保つ為却下" }`. The body is exactly `鮮度を保つ為却下`.
2. Only after that comment succeeds, `update_matching` with `{ matchingId, matchingStatus: "REJECTED" }` only. Do not pass `title`, `reason`, or `matchingStatus: null`.

If the comment fails, do not reject that matching.

Leave `CONFIRMING`, `PROPOSING`, `REJECTED`, `PASSED_OVER`, `WITHDRAWN`, and `CONTRACT_CONFIRMED`. Do not set `CONFIRMING` to `REJECTED`. Leave a matching whose project and candidate are both still recruiting (`recruitmentStatus` null). A single linked side that is `CLOSED` is rejected.

Do not call `get_matching`, `get_project`, or `get_candidate` for this step. Do not call `create_matching`. Use `create_collaboration_comment` only for the one `鮮度を保つ為却下` comment before each reject. `update_matching` also writes a SYSTEM やりとり when `matchingStatus` changes. Do not add any other comment and do not delete that SYSTEM comment.

`rejected` counts successful updates. A failed comment or a failed update goes in `errors` and is not counted in `rejected`.

## Do not call

- `match_project_overviews` or `match_candidate_overviews`
- `create_project` / `create_candidate` / `set_*_overview`
- `create_url_source` / `link_source_to_record` / `unlink_source_from_record` / `delete_url_source`
- `create_matching`
- `create_collaboration_comment` for anything other than the `鮮度を保つ為却下` comment before a reject
- `get_mail_source` / `get_url_source` for the clock

## Report

```json
{
  "window": "2026-08-06/2026-08-10",
  "runDate": "2026-08-10",
  "businessDays": ["2026-08-06", "2026-08-07", "2026-08-10"],
  "businessDayCount": 3,
  "rejectUnsetMatchings": true,
  "checked": 0,
  "closed": 0,
  "skippedRecentSource": 0,
  "skippedAlreadyClosed": 0,
  "skippedActiveMatching": 0,
  "skippedNoSource": 0,
  "rejected": 0,
  "failed": 0,
  "listings": [],
  "reviewRequired": [],
  "errors": []
}
```

`checked` counts recruiting records read (closed + skipped + failed), not rows left unread. `rejected` counts matchings set to `REJECTED`. State that no mail was sent and that no draft was created.
