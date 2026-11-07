---
name: register-ses-partner-business-card
description: >-
  Register an SES partner from a business card or supplied contact details:
  company ledger, distribution recipients, Outlook folders and rules,
  mail-ledger ingest folders, and Outlook contacts. Use whenever the user asks
  to register or save a partner business card or contact sheet. Do not use for
  extraction-only requests.
---

# Register SES partner contacts with FlowSES

## Scope summary

Read business-card images or supplied contact details for SES partner companies, separate personal and distribution addresses, register the company in the ledger, create Outlook folders and receive/send rules with generic MCP tools, enable those Inbox and Sent Items folders as mail-ledger ingest folders, and create or safely update personal Outlook contacts plus ordinary Outlook contacts for distribution addresses. Company-ledger 配信先 remains the SES Agent recipient of record. Use whenever the user asks to register or save an SES partner business card, SES contact sheet, or supplied partner contact details in Outlook, including cards that contain only an SES distribution address. Do not use for extraction-only requests that do not authorize saving.

Register contacts in the authenticated user's personal Outlook Contacts folder for lookup. When the user's drafts go to Gmail, the same contact tools save to their Google contacts instead (categories become Google contact labels); folders and rules stay Outlook only, so skip those steps and report them as `not registered` when Outlook is not connected. Do not create or update a separate business-card database record. Company-ledger 配信先 remains the SES Agent distribution recipient of record.

## Authorization and tools

- Create contacts only after the user clearly authorizes registration or saving. A direct request such as "FlowSESで保存" is sufficient for new contacts; do not ask for redundant confirmation.
- Extraction-only requests must return the extracted fields without mutations and wait for a later save request.
- Use generic MCP tools: `ensure_company`, `add_company_contact`, `set_company_distribution_recipients`, `list_companies`, `list_outlook_mail_folders`, `create_outlook_mail_folder`, `list_outlook_rules`, `create_outlook_rule`, `update_outlook_rule`, `list_mail_ingest_folders`, `refresh_mail_ingest_folders`, `enable_mail_ingest_folders`, `search_mail_contacts`, `create_mail_contact`, and, only for an approved existing-contact change, `update_mail_contact`. If tools are not callable, discover them. If the MCP server or Outlook authorization is unavailable, stop and provide the returned connection URL without asking for credentials.

## Extract and classify addresses

1. Extract only values visible in the source. Do not guess unreadable text.
2. Trim surrounding whitespace, preserve written names and company names, normalize unambiguous phone/postal hyphens, and lowercase email addresses.
3. Require at least one valid email address. If none is visible, return the extracted details and explain that safe duplicate checking and registration are not possible.
4. Classify an address as an SES distribution address when its source label explicitly identifies an SES, project, candidate, personnel, or matching-information distribution destination, such as `SES配信先` or `案件・要員情報送付先`.
5. Do not infer SES distribution use from a generic role address alone. Addresses such as `sales@`, `eigyo@`, or `info@` are ambiguous unless the source labels their SES use. Ask the user which ambiguous addresses, if any, to register as distribution addresses before any write.
6. When two or more distribution candidates exist, ask which addresses to register and whether to put the selected addresses in one distribution contact or create one contact per address. Ask before any write, even when every candidate is explicitly labeled.

## Company ledger, folders, and rules

Resolve every ambiguous distribution choice and obtain any required existing-contact change approval before writing anything.

1. Derive the unique registrable parent domains from every selected personal and distribution email address and call `ensure_company` with the legal company name and those domains. This writes the company ledger only. It does not touch Outlook.
2. Call `list_outlook_mail_folders` for well-known `inbox`, `drafts`, and `sentitems`.
3. Choose the parent folder for each well-known root. If the user named a group folder, use that direct child. If they did not, use the direct child named `SES協力会社`. If the chosen parent is missing under a root, report that root and stop before creating company folders or writing contacts.
4. Under each chosen parent, call `create_outlook_mail_folder` with the legal company name. If a same-name folder already exists, use it.
5. Call `list_outlook_rules`. Then create or update only these two enabled rules. Do not delete unrelated rules.
   - `<legal company name> 受信`: match the company domains in the sender and move the message to the Inbox company folder.
   - `<legal company name> 送信`: match mail from the authenticated mailbox whose recipients contain the company domains, then move the self-BCC copy to the Sent Items company folder.
   Use `create_outlook_rule` when the named rule is missing and `update_outlook_rule` when it already exists. When creating, pass `sequence` from the `list_outlook_rules` result you already have: the largest listed `sequence` plus 1, and plus 2 for the second new rule. Without `sequence` the server lists every rule again for each create.
6. Do not save the Drafts-side company folder anywhere. Each member's ユーザー設定「下書きの置き場所」 names the parent folder, and drafts go into its child named after the company, so the folder from step 4 is enough.
7. Call `refresh_mail_ingest_folders` so the Inbox and Sent Items company folders appear in the mail ledger catalog. Then call `enable_mail_ingest_folders` with those two folder graph ids from `create_outlook_mail_folder`. Do not enable the Drafts company folder. Do not enable the well-known Inbox or Sent Items roots unless the user asked. `enable_mail_ingest_folders` only turns the given folders on; do not replace the full selection or disable other companies' folders. If a named folder is missing after refresh, report it and stop before contact writes.
8. Call `add_company_contact` for every selected personal and distribution address. Person-specific addresses stay 連絡先. Distribution-only addresses pass `listedContact: false` and `distributionRecipient: true` (配信先 To). Then call `set_company_distribution_recipients` with those distribution contact ids so the company ledger 配信先 To matches the selected distribution addresses. Do not set 配信先 Cc unless the user asked to put an address in Cc. Matching new-mail can pick listed 連絡先; partner drafts use 配信先 To (and optional Cc). Do not look up or save an Outlook contact category. Same email on the same company is already registered; continue, then include that existing contact id in `set_company_distribution_recipients` when it is a distribution address (`list_companies` contacts).
9. Create or update Outlook personal contacts when a person-specific address remains. Attach a personal-contact category only when the user explicitly supplied one.
10. Also create ordinary Outlook contacts for selected distribution addresses so people can find them in Outlook. Name each one `配信　<legal company name>` using U+3000. Do not add `SES協力会社　配信先` or any other category just to mark distribution use. Company-ledger 配信先 remains the SES Agent recipient.

If folder, rule, or mail-ledger ingest-folder setup partially fails, report every completed folder, rule, or ingest-folder result and stop before contact writes. A later retry must call the same generic tools again.

## Personal contact

Create the personal contact only when at least one person-specific address remains after separating selected distribution addresses.

- `surname`: written family name
- `givenName`: written given name
- `displayName`: printed name only when it differs from the default `surname givenName`
- `yomiSurname` and `yomiGivenName`: kana only when explicitly shown and separable
- `companyName`: legal company name
- `yomiCompanyName`: only when explicitly shown
- `department`: multiple department lines in display order
- `jobTitle`: role or title
- `emails`: visible non-distribution addresses that belong on the personal contact
- `dedupeEmails`: person-specific addresses only; exclude shared or role-based addresses
- `mobilePhone`: mobile number
- `businessPhones`: office numbers, excluding fax
- `businessAddress`: visible street/building, city, state, postal code, and country
- `website`: visible company or personal website
- `notes`: English name, fax number, or useful visible fields without dedicated properties
- `categories`: only when the user explicitly supplied personal-contact categories; never add `連絡先`, `名刺`, or `SES協力会社` automatically

Call `create_mail_contact` directly. It checks every `dedupeEmails` address for an exact existing match before creating and returns `status: "duplicate"` with the matched contact instead of creating one. Report that as the personal contact `duplicate`. Do not call `search_mail_contacts` first for this check; it pages through every Outlook contact.

A personal `duplicate` result does not stop distribution-address searches, ledger registration, or Outlook distribution-contact creation. Report and process the two contact kinds independently.

If no person-specific address remains, do not create a personal contact. Continue with distribution registration and report the personal result as `not registered`.

## Ledger contacts

Call `add_company_contact` once per selected address:

- Person-specific address: `displayName` is the written name; `email` is that address; omit `listedContact` or pass true; omit `distributionRecipient` or pass false
- Distribution-only address: `displayName` is the written name when present, otherwise the email; pass `listedContact: false` and `distributionRecipient: true`. Do not invent `ご担当者` as the ledger displayName.

After the adds, call `set_company_distribution_recipients` with the contact ids for every selected distribution address, including already-registered rows from `list_companies`. Do not copy person-specific names onto a distribution-only ledger row. Same email on the same company is already registered; continue. Company-ledger 宛名 (`distributionGreetingName`) is the 〇〇様 greeting and is separate from To/Cc names. Leave it unset unless the user supplied a greeting; unset drafts use ご担当者様. Call `set_company_distribution_greeting` when the user supplied one.

## Outlook distribution contact

Create an ordinary Outlook contact for the selected distribution addresses after ledger 配信先 is set. This is for Outlook lookup only. SES Agent drafts still use the company-ledger 配信先.

- One Outlook contact per address when the user chose one contact per address, or when only one address is selected
- One Outlook contact containing every selected address when the user chose a single contact
- `surname`: `配信`
- `givenName`: legal company name
- `displayName`: `配信　<legal company name>` with a U+3000 ideographic space, not an ASCII space
- `companyName`: legal company name
- `emails` and `dedupeEmails`: the selected distribution addresses on that Outlook contact
- `categories`: only when the user explicitly supplied categories for this contact; never add `連絡先`, `名刺`, `SES協力会社`, or `SES協力会社　配信先` automatically

Call `create_mail_contact` directly. It checks every `dedupeEmails` address for an exact existing match and returns `status: "duplicate"` instead of creating one. Report that as the Outlook distribution contact `duplicate`. Do not call `search_mail_contacts` again for addresses you already searched for existing personal-contact conflicts below; reuse that result.

Do not copy a person-specific name onto a distribution-only Outlook contact. A distribution `duplicate` does not stop personal-contact creation.

## Existing personal-contact conflicts

An older personal Outlook contact may contain a selected distribution address. Before any write, call `search_mail_contacts` once with `email` set to each selected distribution address. Because search is partial, compare returned addresses case-insensitively and accept only exact matches. This is the only `search_mail_contacts` call in a run. Changing an existing contact is destructive enough to require a separate preview and confirmation even when the original request authorized saving.

1. Show the existing contact, the addresses to remove, and the resulting personal addresses.
2. Make no change until the user approves that exact move.
3. If person-specific addresses remain, update the personal contact's `emails` without the distribution addresses and set `dedupeEmails` to its remaining person-specific addresses. Preserve its other fields and categories. Then create a new ordinary Outlook contact for the removed distribution addresses unless an exact match already exists.
4. If the existing contact contains only the selected distribution addresses, do not convert it into an Outlook “配信” contact. After approval, leave it as-is and report the Outlook distribution contact as `duplicate`, or delete it only when the user asks. The SES Agent recipient is the ledger row from `add_company_contact`.
5. If a personal-contact update fails after a partial change, immediately restore the original `emails` and matching person-specific `dedupeEmails`. Report whether restoration succeeded and do not hide a partial failure.

## Result report

Report the company ledger result, ledger contacts, three company folders, receive rule, send rule, mail-ledger Inbox and Sent Items ingest-folder selection, personal Outlook contact, and Outlook distribution contact outcomes separately. For each folder, rule, or ingest folder include its Outlook ID and one status: `existing`, `created`, or `updated`. For ingest folders also include `rootKind` (`INBOX` or `SENT_ITEMS`). For each ledger or Outlook contact include the display name or intended name, company, selected email addresses, Outlook contact ID when available, and one status: `created`, `duplicate`, `updated`, or `not registered`. Mention whether this was a new company setup, unreadable omitted values, user-declined addresses, conflicts, partial setup progress, and any rollback result briefly.

## Multiple cards

Process each card separately. Apply classification and confirmation per card, search every relevant email, and report the personal and distribution outcomes for each card.
