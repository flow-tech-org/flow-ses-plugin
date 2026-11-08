import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillUrl = new URL(
  "../skills/register-ses-partner-business-card/SKILL.md",
  import.meta.url,
);
const evalsUrl = new URL(
  "../skills/register-ses-partner-business-card/evals/evals.json",
  import.meta.url,
);

test("business-card skill separates explicit SES distribution addresses", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /explicitly identifies an SES, project, candidate, personnel, or matching-information distribution destination/);
  assert.match(skill, /Do not infer SES distribution use from a generic role address alone/);
  assert.match(skill, /ask which addresses to register and whether to put the selected addresses in one distribution contact/);
  assert.match(skill, /If no person-specific address remains, do not create a personal contact/);
});

test("distribution recipients are company ledger contacts", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /Call `add_company_contact` once per selected address/);
  assert.match(skill, /Distribution-only address: `displayName` is the written name when present, otherwise the email/);
  assert.match(skill, /Do not invent `ご担当者` as the ledger displayName/);
  assert.match(skill, /pass `listedContact: false` and `distributionRecipient: true`/);
  assert.match(skill, /set_company_distribution_greeting/);
  assert.match(skill, /set_company_distribution_recipients/);
  assert.match(skill, /Create an ordinary Outlook contact for the selected distribution addresses/);
  assert.match(skill, /Company-ledger 配信先 remains the SES Agent recipient/);
  assert.match(skill, /`surname`: `配信`/);
  assert.match(skill, /`givenName`: legal company name/);
  assert.match(skill, /`displayName`: `配信　<legal company name>` with a U\+3000 ideographic space/);
  assert.doesNotMatch(skill, /`categories`: exactly the company's saved `distributionContactCategory`/);
  assert.doesNotMatch(skill, /`categories`: exactly `\["SES協力会社　配信先"\]`/);
  assert.doesNotMatch(skill, /`categories`: exactly `\["SES協力会社 配信先"\]`/);
});

test("existing personal contact changes require approval and rollback", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /Make no change until the user approves that exact move/);
  assert.match(skill, /do not convert it into an Outlook “配信” contact/);
  assert.match(skill, /immediately restore the original `emails`/);
  assert.match(skill, /`created`, `duplicate`, `updated`, or `not registered`/);
});

test("business-card skill ensures partner folders and managed rules before contacts", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /call `ensure_company`/);
  assert.match(skill, /list_outlook_mail_folders/);
  assert.match(skill, /create_outlook_mail_folder/);
  assert.match(skill, /If they did not, use the direct child named `SES協力会社`/);
  assert.doesNotMatch(skill, /Do not default to `SES協力会社`/);
  assert.match(skill, /<legal company name> 受信/);
  assert.match(skill, /<legal company name> 送信/);
  assert.match(skill, /Do not delete unrelated rules/);
  assert.doesNotMatch(skill, /set_company_draft_folder/);
  assert.match(skill, /Do not save the Drafts-side company folder anywhere/);
  assert.match(skill, /refresh_mail_ingest_folders/);
  assert.match(skill, /enable_mail_ingest_folders/);
  assert.match(skill, /Do not enable the Drafts company folder/);
  assert.doesNotMatch(skill, /save it with `set_company_contact_categories`/);
  assert.match(skill, /add_company_contact/);
  assert.match(skill, /stop before contact writes/);
});

test("business-card skill evals cover the required registration branches", async () => {
  const parsed = JSON.parse(await readFile(evalsUrl, "utf8")) as {
    skill_name: string;
    evals: Array<{ id: number; prompt: string; expectations: string[] }>;
  };

  assert.equal(parsed.skill_name, "register-ses-partner-business-card");
  assert.equal(parsed.evals.length, 7);
  assert.deepEqual(parsed.evals.map(({ id }) => id), [1, 2, 3, 4, 5, 6, 7]);
  assert.ok(parsed.evals.every(({ prompt }) => prompt.includes("外部への書き込み")));
  assert.ok(parsed.evals.every(({ expectations }) => expectations.length >= 3));
});

test("business-card skill sets up a Gmail label and filter for Gmail mailboxes", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /`mailboxProvider`/);
  assert.match(skill, /### Gmail label and filter/);
  assert.match(skill, /create_gmail_label/);
  assert.match(skill, /create_gmail_filter/);
  assert.match(skill, /Never forward/);
  assert.match(skill, /do not remove `INBOX` unless the user asked/);
  assert.match(skill, /enable_mail_ingest_folders` with the label id/);
  assert.doesNotMatch(skill, /folders and rules stay Outlook only/);
});

test("business-card skill stops before any write when the user is not a 管理者", async () => {
  const skill = await readFile(skillUrl, "utf8");

  assert.match(skill, /can be changed only by a FlowSES 管理者 \(ADMIN\)/);
  assert.match(skill, /When `ensure_company` returns `FORBIDDEN`, write nothing else/);
});
