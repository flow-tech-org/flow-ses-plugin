---
name: structured-conditions
description: >-
  Fill projectCondition / candidateCondition, 原文, and the SOURCE_RECIPE
  overview excerpt from a listing or mail, including skill tags and candidate
  gender. Use whenever a registration or inbox skill writes structured
  conditions, originalText, or overview. Does not log in, resolve identity, or
  write drafts.
---

# 構造化条件と概要

## Scope summary

Fill structured conditions and the overview excerpt from a listing or a mail, for both PROJECT and CANDIDATE. Meaning wins over the heading and over where the line sits. 原文 stores the listing or mail as written. The overview is that record's SOURCE_RECIPE excerpt, and 商流, 所属, and 商流制限 depth go in that excerpt's replacements. Skill requirement lines stay in that overview, and skill names go in skills with role and years. Skill names are broad: technologies, 業務分野 (業界・業務知識), 工程, and 役割・ポジション, not technology names only. Before tagging, search_skills and reuse a canonical name or alias. Candidate gender is read from the listing, mail, or cell first, and only then from that candidate's skill sheet; when neither states it, gender is null (未設定). Use when writing projectCondition, candidateCondition, originalText, or overview. Do not log in, look up identity, or write drafts.

案件と要員の両方で、掲載文またはメールから `projectCondition` / `candidateCondition` と概要を埋める。スキル要件と歓迎は概要の抜粋と原文に残し、スキル名は `skills` にも渡す。スキル名は技術名だけでなく、業務分野（業界・業務知識）、工程、役割・ポジションも含めて幅広く登録する。必須は `REQUIRED`、歓迎・尚可は `PREFERRED`、要員は年数だけ。原文に年数が無いときは `null`。概要からスキル行を消さない。スキルシートは添付ファイル化する。本文は別欄へ写さない。原文はその掲載文またはメール本文をそのまま保存する。あいさつ、結び、署名、電話、メール、担当者も残す。複数人がいても全文はその元ソースに1回だけ残す。概要はその案件・要員の行だけにし、商流・所属・商流制限の段数は概要レシピの置換で構造化条件に合わせる。ログイン、同一人物の検索、掲載 URL の正規化、会社ごとの登録手順、配信下書きはここには書かない。Listing-URL canonicalization and per-company registration steps stay out of this skill. Drive フォルダからスキルシートのファイルを選ぶ規則は下に書く。保存の呼び方（URLなら `create_url_source` の `originalText`、そのあと `link_source_to_record`、そのあと `set_*_overview` の `mode=SOURCE_RECIPE`）は各会社スキルが書く。リンクされていない sourceId には `set_*_overview` を呼ばない。`match_*_overviews` はリンクの前でもよい。Outlookの原文はメール本文のまま条件へコピーしない。タグの前に `search_skills` する。名前か別名が既存の正規スキルに一致すればそれを使う。`create_skill` の前に、接頭辞（Amazon・Azure など）を外した名前、末尾のバージョン番号を外した名前、空白・中黒の有無、旧名と新名、略称と正式名、日本語と英語の表記でも `search_skills` し、同じものがあればそれを使う。本当の同義語は `update_skill` か `move_skill_aliases` でまとめる。近いだけの名前はまとめない。どれにも無ければ `create_skill` してからタグを付ける。原文は書き換えない。

会社ごとに見出しも行の位置も違う。例にない言い回しでも、意味が同じなら同じ欄へ入れる。

## 意味で振り分ける

Meaning wins over the exact heading and over where the line sits (単価 block, 勤務 block, or 案件内容 prose). Companies format text differently. Lists below are examples, not a closed word list. Slightly different wording with the same meaning goes to the same field. Move a whole line verbatim. Do not store the heading itself. Do not cut words out of the middle of a sentence. If one line mixes a skill requirement with 単価 or 勤務, do not slice it: if the line's meaning is a skill requirement, keep the whole line in the overview excerpt; if its meaning is 単価 or 勤務, keep the whole line on that structured field.

### 案件のスキル要件

Skill requirements stay in the overview excerpt even when the word 必須 is absent, including 案件内容 body and unfamiliar headings. Examples: 【スキル要件】【スキル】必要スキル、求めるスキル、求める経験、必須経験、応募要件、スキル条件、MUST、`スキル(必須)`、`【必須ワード】`、and unlabeled experience/tech/years lines. Also pass the skill names in those lines (see スキルタグ: technologies, 業務分野, 工程, 役割), not the whole sentence, as `skills` with `role: "REQUIRED"`, using the dictionary pass in スキルタグ. Do not remove those lines from the overview.

歓迎/尚可 lines stay in the overview excerpt. Examples: 【歓迎】【歓迎スキル】歓迎条件、あれば尚可、尚良し、WANT、NICE TO HAVE、`スキル(尚可)`. Keep those lines verbatim in the overview. Pass the skill names in those lines as `skills` with `role: "PREFERRED"`, using the dictionary pass in スキルタグ. A project whose only skill text is 歓迎 still keeps that line in the overview. The same canonical skill on both 必須 and 歓迎 keeps `REQUIRED`.

### 要員のスキル

【スキル】【スキル要件】【保有スキル】 and experience lines stay in the overview excerpt even without 必須. 歓迎/尚可 lines also stay in the overview because there is no second field. Do not leave them out of the overview when the source states them. Pass the skill names from those lines, including chips, and from the experience and 経歴 lines (see スキルタグ: technologies, 業務分野, 工程, 役割), as `skills` with `years` only, using the dictionary pass in スキルタグ. A candidate skill has no 必須/歓迎 role.

氏名・案件名など、構造化フィールドを持たない識別行は原文と、そのレコードの概要に残る。原文は全文なので見出しも残す。概要の抜粋には見出し語自体を入れない。

## スキルタグ

### 何をスキルとして登録するか

スキル名は技術名に限らない。原文、概要、要員はスキルシートの FILE に書かれている次の短い名前を、幅広く `skills` に登録する。

- 技術: 言語、フレームワーク、ライブラリ、ミドルウェア、DB、OS、クラウド、ツール、製品・パッケージ（例: `Java`、`Spring Boot`、`AWS`、`SAP`、`Salesforce`、`GitLab`）
- 業務分野: 業界と業務知識（例: `金融`、`銀行`、`証券`、`保険`、`製造業`、`流通`、`公共`、`医療`、`通信`、`会計`、`人事`、`物流`）。`金融系企業のローン関連システム` なら `金融` と `ローン` のように、文から名詞だけを取る。銀行・証券・保険など個別の業界を書いているときは、その業界名と上位の `金融` の両方を付ける。上位と下位は別スキルのままにし、別名にまとめない。
- 工程: `要件定義`、`基本設計`、`詳細設計`、`製造`、`テスト`、`運用保守` など。
- 役割・ポジション: `PM`、`PMO`、`PL`、`SE`、`PG`、`インフラエンジニア`、`テスター` など。
- 資格: 名前が書かれた資格（例: `AWS認定ソリューションアーキテクト`、`基本情報技術者`）。

案件の role は、必須の行にあれば `REQUIRED`、歓迎・尚可の行にあれば `PREFERRED`。案件概要や業務内容の行にだけ出る業務分野・工程・役割は `role: "PREFERRED"`（歓迎）で付ける。`role: null`（未分類）にはしない。要員は年数だけを付け、経歴の業務分野・工程・役割も付ける。単価、場所、日付、勤務形態、人数、面談、年齢、性別、コミュニケーション・キャッチアップなどの人柄の語、`開発`・`経験`・`システム`・`業務` のような一般語はスキルにしない。

Before tagging, `search_skills`. Look up each distinct name once per run and reuse that answer for later records. Search a name again only after this run created or regrouped it. Use an existing canonical skill when the name or an alias matches. Before `create_skill`, also `search_skills` the same name written other ways, and use the existing skill when one matches: without a vendor prefix (`Amazon` / `AWS` / `Azure` / `Google` / `Microsoft` / `IBM` / `VMware`; `Amazon ECS` and `ECS` are one skill), without a trailing version number (`HTML5` → `HTML`), with or without spaces and 中黒 (`VS Code` / `VSCode`), the old or new product name (`Azure AD` / `Entra ID`), the abbreviation or full name (`DDD` / `ドメイン駆動設計`), and the Japanese or English name (`Firewall` / `ファイアウォール`). When the other spelling exists only as a separate canonical skill of the same thing, tag the existing one and do not create a third. Group true synonyms with `update_skill` or `move_skill_aliases`. Do not merge merely related names. If nothing fits, `create_skill`, then tag. On `create_skill`, pass `parentSkillId` (the 上位スキル) only when experience in the new skill always means experience in that existing skill (`銀行` → `金融`, `PostgreSQL` → `SQL`, `Spring Boot` → `Spring`). Merely related names (`Java` and `Kotlin`, `AWS` and `Azure`) get no parent. When unsure, leave it out. Do not change the parent of an existing skill while tagging. Those dictionary tools do not tag a project or candidate. Pass the canonical name on `skills`. There is no `requiredSkills` or `preferredSkills` column. `skills` replaces tags. PROJECT skills are `{ name, role, years }`. 必須 is `REQUIRED`. 歓迎 and 尚可 are `PREFERRED`. CANDIDATE skills are `{ name, years }`. `3年` and `3年以上` are `3`. 半年 and 1年未満 stay `null`. A missing year is `null`. The maximum is 60. Years and role live on the tag, not on the dictionary name. The same canonical skill on both 必須 and 歓迎 keeps `REQUIRED`. Pass names, not whole sentences. Passing `skills` replaces tags. Omit `skills` to keep the previous tags. `[]` clears them. `skillNames` is a name-only replacement that sets every role to PREFERRED and clears years, so ingests pass `skills`, not `skillNames`. Skill requirement and 歓迎/尚可 lines stay in the overview excerpt and in the 原文. Do not remove skill lines from the overview. Do not rewrite 原文. Do not copy 案件概要 or 案件内容 sentences into a skills field. Take only the short names listed above from them. Do not copy 案件概要 or 案件内容 sentences into `skillNames`. Do not report `スキル未記入`. Matching still judges skills from the overview and the skill sheet. Missing tags, role, and years do not drop a pair. 文を作らない。

要員のスキルシートは record の FILE である。プロフィールがスキルシート URL を述べているときは、概要を保存したあと `add_candidate_attachment_from_url` を呼び、ダウンロードを FILE として保存する。その URL を原文へ挿入しない。原文はメールまたは掲載文を書いたまま残す。概要へ `[スキルシート](url)` を足すだけで終わらない。抽出したシート本文を別欄へ写さない。スキルシート FILE を案件へ付けない。どの文字列がスキルシート URL か、掲載 URL の正規化、会社ごとの登録手順、ログインはここでは定義しない。それらは各会社スキルまたは会社スキルに残す。Listing-URL canonicalization and per-company registration steps stay in each registration skill or the 会社スキル. Drive フォルダから要員のファイルを選ぶ規則はここに書く。Google の Docs / Sheets / Drive URL は、公開 HTTPS の書き出しまたはダウンロードでサーバーが取得する。Drive API もユーザーの Google接続も使わない。公開取得に失敗したページ、SharePoint のページ、その他ダウンロードできない URL は `スキルシート未確認` と報告する。FILE を発明しない。代わりの URL を原文や概要へ書かない。登録は、その会社スキルが別段を書いていない限り、シートを開けなかっただけでは `reviewRequired` を出さない。同じ record に同じダウンロード済みバイト列があるときは追加しない（ツールは冪等）。ファイル名が変わったときは、古い FILE を削除してから現在の URL を追加する。

Google Drive のフォルダ URL はスキルシートのファイルではない。A Google Drive folder URL is not the skill-sheet file. フォルダ自体を `add_candidate_attachment_from_url` で付けない。Do not attach the folder itself with `add_candidate_attachment_from_url`. フォルダはブラウザで開く。Drive API は使わない。Open the folder in the browser. Do not use the Drive API. 選んだファイルの URL だけを `add_candidate_attachment_from_url` で添付する。取得は上の公開 HTTPS のまま。フォルダ URL を公開取得の失敗として `スキルシート未確認` にしない。フォルダ内のファイルが1件なら、そのファイルの URL を添付する。If the folder has one file, attach that file's URL. 2件以上のときは、要員のイニシャルがファイル名のちょうど1件に一致すればそのファイルを添付する。If the candidate's initials match exactly one filename, attach that file. 同じイニシャルが複数のファイル名に一致するときは、年齢またはファイル名の日付も一致する1件だけを添付する。If the same initials match several files, attach only the one that also matches age or the date in the filename. どれも一致しないとき、またはなお複数が一致するときは添付しない。それらを報告する。If none match, or more than one still match, do not attach. Report them. 原文と概要は変えない。マークダウンリンクを挿入しない。複数の要員が同じフォルダを指していても、各要員にはその要員自身のファイルだけを添付する。Do not change 原文 or 概要. Do not insert a markdown link. Several candidates may point at the same folder; attach each candidate's own file only.

## 原文と概要

原文 is the source text, saved as written. A URL listing is stored in full on that URL with `create_url_source` `originalText` (max 20,000, empty allowed). An Outlook mail stays `MailReference.bodyText`. Do not copy it onto the project or candidate. Do not summarize. Do not paraphrase. Do not rewrite 商流, 所属, 商流制限, or 万円 in the 原文. Keep greetings, closings, signatures, phone numbers, email addresses, and 担当者 blocks. Dropping them makes the stored text no longer the original.

概要 is that one project or candidate, saved with `set_*_overview` `mode=SOURCE_RECIPE`. Pass `sourceId` of the URL or Outlook source. The server reads `UrlSource.originalText` or `MailReference.bodyText`, applies `coreRanges` and `replacements`, and stores only the excerpt. `coreRanges` keep this record's block, including skill requirement and 歓迎/尚可 lines. Write each `coreRanges` item as `{ startText, endText }` copied from the 原文, not counted line numbers: `startText` is the start of this block's first line and `endText` the start of its last line (例: `{ "startText": "☆名　前：MT", "endText": "※広島県内フル常駐も可能" }`). The server uses the one line whose trimmed text starts with `startText`, and the first line at or after it that starts with `endText`. When `startText` starts several lines (a mail with several people, a repeated heading), copy more of that line until it starts one. Use the same anchors in `preview_source_recipe`, `match_*_overviews`, and `set_*_overview` so the compared and saved text are the same. `preview_source_recipe`, `match_*_overviews`, and `set_*_overview` reject line numbers. `replacements` apply the same 自社 商流, 所属, and 商流制限 depth as the structured fields (協力会社 is one hop deeper; 自社 stays). Do not put those depth edits outside the overview replacements. The server does not rewrite depth by itself. Preview with `preview_source_recipe` and the same `sourceId` before saving. `match_project_overviews` or `match_candidate_overviews` applies this same SOURCE_RECIPE to the source 原文 and compares that result to stored 概要. Pass `sourceId`, `coreRanges`, `replacements`, and `insertions`. Do not pass a pre-rendered excerpt or the full 原文. Save 原文 with `create_url_source` `originalText`, then `link_source_to_record`, then `set_*_overview` `mode=SOURCE_RECIPE`. Do not call `set_*_overview` for a sourceId that is not linked. `match_*_overviews` may still run before the link. A confirmed same listing rewrites overview and structured conditions. 原文 updates only on the source. Unlink an old URL only when it is the same listing being replaced: the same spreadsheet with a different cell, or the same listing-site tag with a different URL. Do not unlink Outlook sources or other tags.

Do not add lines that are not in the source, including `会社:` and 区分. Skill lines, 万円 / 単価, 場所 / 都道府県, and 勤務形態 stay in the 原文. The overview excerpt may keep the lines that belong to this record.

A source that names several people keeps the full text once on that source (URL originalText or MailReference.bodyText). Do not keep only this person's block in the 原文. The title may be this person's display name, and the registration skill may still rewrite depth tokens in that title. Each record's overview excerpt is only this person's lines.

Depth is also written on `projectCondition` / `candidateCondition`. Read it from the source. Do not read it back from a previously rewritten overview. 自社 (`affiliationDepth` 0, source 所属 「弊社…」) stays 0. Do not deepen 自社's own 「弊社…」 in the overview replacements.

Do not invent a 商流制限 line in the title here. Do not invent a dummy sentence when the source has text.

マッチングは概要と、あるときのスキルシートを読む。スキル要件も歓迎も無い案件の概要に、それらを発明して足さない。

## 稼働割合

`utilizationRateMinBasisPoints` / `utilizationRateMaxBasisPoints`。0〜1 を 0〜100 で保存する（0.5人月は 50、80% は 80、1.0 は 100）。案件も要員も下限と上限の両方が必須で、0〜100 の外は拒否する。両方未記載は下限 100、上限 100。下限だけ無いときは下限 0、上限はそのまま。上限だけ無いときは上限 100、下限はそのまま。Both bounds are required for projects and candidates. Both missing saves 100 and 100. A missing min saves 0 and keeps the stated max. A missing max saves 100 and keeps the stated min. Values outside 0–100 are rejected. 計算は四捨五入して整数の basis point にする。Round to the nearest integer basis point. 100 を超える計算結果は 100。

1.0人月 = 週5日 × 1日8時間 = 40時間。

人月と %:

- チルダの無い単独値（`0.8` / `80%` / `0.5人月`）は下限と上限の両方。
- 値の前だけに `～` / `〜` / `~` があるとき（`～0.8` / `〜80%`）は上限のみ。下限は 0。値を下限へコピーしない。
- 値のあとに `～` / `〜` / `~` があるとき（`0.5～`）は下限のみ。上限は 100。
- 閉じた幅（`0.5～1.0` / `50%〜80%`）は下限と上限。

週の時間と週の日数も、その人がどれだけ稼働するかとして書かれているときは同じ欄へ入れる。週の時間は hours/40。`週24～40時間` は `utilizationRateMinBasisPoints` 60、`utilizationRateMaxBasisPoints` 100（0.6～1.0）。週の日数は days/5。`週3日～週5日` と `週3～5日` は 60 と 100。`週4日` は 80。`週32時間` は 80。`N日/週` は `週N日`、`N時間/週` は `週N時間` と同じ。全角数字も同じ。ハイフンの閉じた幅（`週3-5日` / `週24-40時間`）も `～` と同じ。

- 単独値（`週4日` / `週32時間`）は下限と上限の両方。
- 片側だけのチルダは上の開区間と同じ。`～週4日` は上限 80、下限 0。`週3日～` は下限 60、上限 100。
- `参画日数` / `稼働日数` / `週N日` / `週N時間` が稼働の量として書いてあるときに適用する。Apply this when the source states 参画日数, 稼働日数, 週N日, or 週N時間 as how much the person works.
- 出社頻度（`週1出社` / `週2日まで出社`）は稼働割合にしない。Do not treat 出社頻度 (週1出社, 週2日まで出社) as 稼働割合.
- `常駐` / `フル出社` から週5を作らない。Do not invent 週5 from 常駐 or フル出社.
- `参画日数` から `onSiteDaysPerWeek` を立てない。Do not set `onSiteDaysPerWeek` from 参画日数.
- 同じソースに人月または % の稼働割合が明示されているときは、その明示値を残し、週の日数や時間で上書きしない。If the same source also states an explicit 人月 or % 稼働割合, keep that explicit value and do not also overwrite it from weekly days or hours.

副業:

- `副業` / `副業希望` とあり、人月・%・週の日数・週の時間のどれも書かれていないときは、下限 0、上限 100（0〜1.0人月）。両方未記載の 100 / 100 にしない。When the source says 副業 or 副業希望 and states no 人月, %, weekly days, or weekly hours, save min 0 and max 100 instead of the both-missing 100 / 100.
- 人月・%・週の日数・週の時間が書かれているときは、その値を上のルールで保存する。If any of those amounts is stated, save it by the rules above.

## 単価

月額万円は `unitPriceKind` `MONTHLY` と `unitPriceMinManYen` / `unitPriceMaxManYen`（書いた端は 0〜500）。時給・時間単価・円/時は `HOURLY` と `unitPriceMinYen` / `unitPriceMaxYen`（書いた端は 0〜30000円）。案件も要員も同じ。欠けた下限は `null`（下限なし、負の無限大）。欠けた上限は `null`（上限なし、正の無限大）。0、500、30000 で埋めない。使っていない単位は null のまま。未記載の `unitPriceKind` は `MONTHLY`（月額）。金額の `null` は残す。範囲外の書いた端は拒否する。ソースの金額のまま。Do **not** apply ±5万。時給には ±5万を足さない。検索の月額条件は、欠けた端が null の行も、両端が null の行も返す。残すために 0 や 500 を渡さない。検索の時給条件も、欠けた端が null の行も、両端が null の行も返す。残すために 0 や 30000 を渡さない。

両方の単位が同じ行にあるときは、記載の単位を一つに決める。時給を万円列へ、月額を時給列へ、同時に入れない。

月単価と、稼働割合の下限または上限が両方あるときは、原文の意味で `monthlyUnitPriceBasis` を決めてから保存する。`万円/人月`、`100%換算`、`稼働100%の場合` は `PER_PERSON_MONTH`。`稼働0.5で40万`、`この稼働での月額` は `AT_STATED_UTILIZATION`。どちらとも読めないとき、および未記載は `AT_STATED_UTILIZATION`（この稼働割合の月額）。`null` は拒否される。キーを省くと前回の基準が残る。

- 金額の前だけに `～` / `〜` / `~` があるとき（`～100万` / `～100万円` / `〜100万円`）は上限のみ。下限は `null`（下限なし、負の無限大）。金額を下限へコピーしない。A tilde only before the amount states the max. The missing min stays null.
- 金額のあとに `～` / `〜` / `~` があるとき（`100万～` / `100万円～` / `100万円〜`）は下限のみ。上限は `null`（上限なし）。
- 閉じた幅（`45～52万` / `80〜100万円`）は下限と上限。
- チルダの無い単独値は両方へ。`前後` も同じ値を両方へ。

予算 / 単金 / 月額 / スキル見合い are 単価 meaning. スキル見合い is `rateNegotiable` true. `相談可` / `応相談` / `調整可能` / `相談可能` も `rateNegotiable` true。未記載の `rateNegotiable` は `false`（不可）。`null` は拒否される。未記載でも登録は止めない。超過ハードスキップは覆さない。

## 単価税区分

`unitPriceTaxType`。`税抜` / `税別` → `EXCLUDED`。`税込` → `INCLUDED`。未記載の既定は `EXCLUDED`（税抜）。`null` は拒否される。Unstated tax stays the skill default `EXCLUDED` unless the registration skill states a different default。比較時の未設定も税抜。会社スキルが別の既定を書いているときはそちら。ソースが税抜 / 税別 / 税込と明示していればそれが最優先。

## 再配信

`redistributionAllowed`。再配信可 → `true`。再配信不可 → `false`。未記載の既定は `true`（可）。`null` は拒否される。会社スキルが別の既定を書いているときはそちら。ソースの可/不可が最優先。例外として、会社スキルが「ソースの記載にかかわらず常に不可」と書く会社は、ソースに再配信可とあっても `false`。

## 出社頻度

勤務形態の3区分は置かない。`onSiteDaysPerWeekMin` / `onSiteDaysPerWeekMax` が勤務の構造化条件。週0〜5。週0はフルリモート、週1–4は一部リモート、週5はフル出社。`一部出社` / `リモート併用` / 週1–4日出社は週1–4であり、週5にしない。これは出社日数が週1–4と書いてあるとき。要員の週数の無い `一部出社可` はこの週1–4だけにはしない。案件の週数の無い `一部リモート可` は週5を含む。案件も要員も下限と上限は両方必須で 0〜5。両方未記載は 0 と 5。案件は、上限だけ無いとき上限 5、下限だけ無いとき下限をその上限にする。要員は、下限だけ無いとき下限 0、上限だけ無いとき上限をその下限にする。すでに入っている側は上書きしない。範囲外は拒否する。Unstated 出社頻度 is 週0–5 for both projects and candidates. Values outside 0–5 are rejected.

マッチングは、両方にレンジがあるときだけ交差を見る。片方が未記載なら不一致にしない。レンジが交差しなければ不一致。都道府県は、どちらかのレンジが週0を含むとき見ない。A missing 出社頻度 is not a mismatch.

`onSiteDaysPerWeekMin` / `onSiteDaysPerWeekMax` は、ソースに出社の週数があるときはその週数。`参画日数` からは立てない。Do not set `onSiteDaysPerWeek` from 参画日数。週5日のみがフル出社。未記載の出社頻度は 0 と 5。`常駐` / `客先常駐` / `出社` だけでリモート許容も週数も無いときは `onSiteDaysPerWeekMin=5`、`onSiteDaysPerWeekMax=5`（週5–5）。`可` / `可能` はこの週5–5にしない。

**常駐 / 出社:** `常駐` / `客先常駐` / `出社` だけでリモート可否や週数が無いときは `onSiteDaysPerWeekMin=5`、`onSiteDaysPerWeekMax=5`（週5–5）。案件の勤務指定 `フル常駐` / `完全常駐` / `フル出社` / `出社のみ` / `フル出社必須` / `リモート不可` はリモート不可なので `onSiteDaysPerWeekMin=5`、`onSiteDaysPerWeekMax=5`。Project `フル常駐` / `完全常駐` / `フル出社` / `出社のみ` / `フル出社必須` sets 出社頻度 to 週5 unless the same source also allows テレワーク併用 / リモート可 / フルリモート / 一部リモート。同じソースにリモート許容があるときはその記載を優先し、許容された週をレンジに含める。週5–5だけにしない。フル常駐 denies remote unless the same source also allows remote。

要員の `フル常駐可能` / `フル出社可能` / `常駐可` / `出社可` は「できる」だけでリモート不可ではない。週数が別に無ければ `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=5`（週0–5）。週数が別に書いてあればその週数を優先する。`可` / `可能` を週5–5にしない。案件側の同じ語は週0–5にしない。For 要員 `フル常駐可能` / `フル出社可能` / `常駐可` / `出社可`, that is capability only for denying remote, and 出社頻度 is 週0–5 (`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=5`) unless a weekly count is written。

要員の `フルリモート希望` / `リモート希望` / `フルリモートのみ` は希望であり、上の能力ルールではない。`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`。`リモート希望` と `フルリモートのみ` は `フルリモート希望` と同じ希望。Candidate `フルリモート希望` / `リモート希望` / `フルリモートのみ` is a preference for full remote, not the capability rule: set `onSiteDaysPerWeekMin` and `onSiteDaysPerWeekMax` to 0. `リモート希望` and `フルリモートのみ` are the same preference as `フルリモート希望`. 同じ要員ソースが `一部リモート` または `出社` も許容するときはその許容の週を上限に含める。週数が無い一部リモートは 0–4、出社の許容は 0–5。If the same candidate source also allows 一部リモート or 出社, follow that allowance and do not force the range to 週0 only. `初日出社` / `月1` / `出社応相談` はその許容ではない。`フルリモート可能` / `フルリモート可` は希望ではないので、レンジを週0だけにしない。`フルリモート可能` / `フルリモート可` are not this preference and do not force the range to 週0 only. 案件には適用しない。Do not change 案件 rules. 未記載の要員の出社頻度は週0–5であり、週0だけにはしない。Unstated candidate 出社頻度 is 週0–5, not 週0 only.

案件の `フルリモート` だけ（可なし）は週0–0（`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`）。常駐を足さない。Bare project `フルリモート` without 可 is 週0–0 and does not add 常駐. `フルリモート可` は可があるので常駐を含み、週0–5のまま。`フルリモート可` だけ（他の勤務を否定しない）は 0–5。ソースがフルリモート可かつ出社可（フル出社可）なら週1–4も含めて 0–5（例: `フルリモート可、出社も可` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=5`。`フルリモート可、フル出社可` も同じ）。片方だけ可のときはその端だけ。ただし案件の週数の無い `一部リモート可` は週1–5。両端が可のときに週1–4だけを外さない。

案件の `一部リモート可（週N程度）` は、括弧の週数がリモート側であり出社日数ではない。Nが1〜4のとき出社頻度は下限 `5−N`、上限 5。`可` なのでフル出社の週5も上限に含める。例: `一部リモート可（週1程度）` → `onSiteDaysPerWeekMin=4`、`onSiteDaysPerWeekMax=5`（週4–5）。週1–1にはしない。Project `一部リモート可（週1程度）` is 週4–5, not 週1–1. The parenthetical `週N程度` is remote days. For N from 1 to 4, `onSiteDaysPerWeekMin` is 5−N and `onSiteDaysPerWeekMax` is 5. 案件で週数の無い `一部リモート可` は週1–5（`onSiteDaysPerWeekMin=1`、`onSiteDaysPerWeekMax=5`）。一部リモートの週1–4に、可が付かない明示的な指定が無いときの暗黙の常駐（週5）を足す。週1–4にはしない。Project bare `一部リモート可` is 週1–5, not 週1–4. A project includes implicit 常駐（週5） unless the source states an explicit style without 可, such as `フルリモート`. 要員の同じ文は変えない。Do not apply this parenthetical remote-week rule to 要員。

要員の `一部出社可（週N程度）` は、括弧の週数が出社側でありリモート日数ではない。Nが1〜4のとき出社頻度は下限 0、上限 N。例: `一部出社可（週1程度）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=1`（週0–1）。週1–1にはしない。Candidate `一部出社可（週1程度）` is 週0–1, not 週1–1. The parenthetical `週N程度` on 要員 `一部出社可` is on-site days. For candidate N from 1 to 4, `onSiteDaysPerWeekMin` is 0 and `onSiteDaysPerWeekMax` is N. 要員で週数の無い `一部出社可` は週0–4（`onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=4`）。一部出社の週1–4に、可が付かない明示（`常駐` / `フル出社` / `フル常駐` など）が無いときの暗黙のフルリモート（週0）を足す。週1–4にはしない。Candidate bare `一部出社可` is 週0–4, not 週1–4. A candidate includes implicit フルリモート（週0） unless the source states an explicit style without 可, such as `常駐` / `フル出社` / `フル常駐`. `常駐` / `客先常駐` / `出社` だけで可が無いときは週5–5のまま。暗黙のフルリモートは足さない。Bare `常駐` / `客先常駐` / `出社` without 可 stays 週5–5 and does not add フルリモート. `フルリモート希望` / `リモート希望` / `フルリモートのみ` は週0–0のまま。Candidate `フルリモート希望` / `リモート希望` / `フルリモートのみ` stays 週0–0. 未記載の出社頻度は週0–5であり、週0だけにはしない。案件のルール（暗黙の常駐、週数の無い `一部リモート可` は週1–5、`一部リモート可（週1程度）` は週4–5）は変えない。Do not apply this candidate on-site parenthetical rule to 案件.

`初日出社` / `初日のみ` / `顔合わせ出社` はオンボーディングであり勤務形態ではないので、`onSiteDaysPerWeek*` を立てない。`初日出社OK` / `初日出社可` を `出社可` と読まない。do not read `初日出社OK` as `出社可`。`月1` / `月数回` / `月1程度の出社応相談` は週5フル出社ではないので出社頻度を週5にしない。週次の出社日数が無い限り週1–4にもしない。`出社応相談` だけで週5・常駐・フル出社の記載が無いときも出社頻度を立てない。Bare `出社応相談` without 週5 / 常駐 / フル出社 is not フル出社。例: `リモート希望（初日出社OK、月1程度の出社応相談）` → `onSiteDaysPerWeekMin=0`、`onSiteDaysPerWeekMax=0`。`初日出社OK` と `月1程度の出社応相談` は一部リモートや出社の許容ではない。`リモート不可` は週0と週1–4を含めず、週5だけにする。

## 商流の立場

`commercialFlowPosition` on `projectCondition` only. Candidate `commercialFlowPosition` is not stored. Integer from 自社（弊社）viewpoint. Not `commercialFlowMaxDepth` and not `affiliationDepth`. Do not copy one into the other. Minimum -1, maximum 20. `-1` is 不明 only. `0` is not used. Do not store エンド as `-1`. Unstated is `-1`（不明）. Do not leave it `null`. Omit the key to leave a stored value. The table below is the listing company's position. A 協力会社 saves that value + 1. Do not add a second hop on top of that. 自社's own listing stays the table value. 一次請け is 1 on the table, so a 協力会社's stated 二次請け saves as 3, not 2. The 原文 keeps the source wording. The overview replacements use the 自社 label. The integer is stored on `projectCondition` only. Do not pass `commercialFlowPosition` on `candidateCondition`. 要員の商流は保存しない。所属は `affiliationDepth`。

- エンド / エンド直 / 元請 / 一次請け → 1
- 二次請け / 元請直 → 2
- 三次請け → 3
- 四次請け → 4
- 五次請け → 5
- N次請け → N

Do **not** store it in `commercialFlowMaxDepth`. Do not write position into `commercialFlowMaxDepth`. `直（貴社まで/元請）` splits: `commercialFlowMaxDepth` `0` and, for a 協力会社, `commercialFlowPosition` `2`. Matching must not treat `commercialFlowPosition` as a hard mismatch. 所属 stays `affiliationDepth`. The 原文 keeps the source wording (協力会社の二次請け stays 二次請け). The overview replacement is one hop deeper. Do not add a second hop on the structured integer. Text the table does not cover (例: Sier→上位) stays `-1`（不明） and stays in the 原文 unchanged. Do not invent an overview replacement for it.

`一次請け` / `二次請け` / `三次請け` / `元請` / `元請直` は掲載会社の立場であり制限段数ではない。do **not** map 元請直→0 or 二次請け→2。

## 商流制限

`commercialFlowMaxDepth`。0=貴社まで。保存は自社＝弊社起点。

- `貴社まで` / `貴社プロパーまで` / `貴社社員まで` → 0。`貴社N社先` は宛先が 自社 なのでソースどおり。**+1 しない**。`貴社1社先まで` → 1。
- bare `N社先` / `N社下`（貴社も弊社も無い）は掲載会社起点なので **N-1**（弊社を挟む。`2社先` → `1`、`1社先` → `0`）。bare inserts 弊社。
- 協力会社の `弊社N社下` / `弊社N社先` / `弊社N社下社員まで` / `弊社一社先` も掲載会社起点なので **N-1**（ここでの弊社は協力会社。`弊社1社下社員まで` → `0`＝自社社員まで。do **not** copy `1`。数字の1をそのまま入れない）。

案件の `commercialFlowMaxDepth` が未記載のときは null（なし）。5は保存しない。保存できる範囲は null と 0〜4。0は弊社まで。1〜4はN社先まで。同じソースに `貴社まで` / `N社先` / `弊社N社下` があるときはその段数を書く。すでに入っている段数は上書きしない。Unstated project 商流制限 stays null. Do not save 5. Do not fill unstated with 5. Values outside 0–4 are rejected.`支援費NG` / `貴社社員を優先` / `貴社所属個人事業主を優先` は段数ではない。制限文を発明しない。When matching, use structured `commercialFlowMaxDepth` when set. Missing 商流制限 in the overview is not unset and not a mismatch. Do not read max depth from position or preference labels.

所属の +1 を `commercialFlowMaxDepth` に適用しない。

## 所属

要員の `affiliationDepth`。自社視点。0=自社直所属。ソースから読む。原文は書き換えないので、段数はソースから読む。

まずソースの段数を読む（`弊社` / `自社` / `弊社正社員` → 0、`N社先` / `N社下` → N）。協力会社の要員なら保存前に **+1** する（協力会社の「弊社」= 自社の1つ下）。自社は **自社** のみ。Examples: 協力会社「弊社」→ `1`、協力会社「1社下」→ `2`、自社直所属「弊社」→ `0`。所属が未記載なら `-1`（不明）。`null` にはしない。`-1` は弊社ではない。Do **not** apply this shift to `commercialFlowMaxDepth`。The +1 is written on the structured field and on the overview recipe replacements. The 原文 keeps the source 所属 line. Matching does not pass `-1` as `commercialFlowMaxDepth` or as the `affiliationDepth` filter. `0` is still 弊社直所属 and is passed.

## 都道府県・年齢・開始・その他

都道府県 1件: JIS 2桁 `prefectureCode`（東京=`13`）。全国・またぎはメモであり、1件のコードにしない。A station name still implies its prefecture; keep the station line in the overview.

開始: `startYearMonth` (`YYYY-MM`) のみ。`immediateStart` は無い。

- `即日` / `即日のみ` / `即日開始` で開始年月が無いときは、保存前に Asia/Tokyo の現在の年月（`YYYY-MM`）を `startYearMonth` に書く。即日フラグは保存しない。サーバーは null からその月を作らない。
- `随時` で開始年月が無いときも、即日と同じ月の入れ方で、保存前に Asia/Tokyo の現在の年月（`YYYY-MM`）を `startYearMonth` に書く。随時は即日という語にはしない。
- 年月が書いてあればその月のまま。同じ文に `即日` や `随時` があっても上書きしない。
- `即日以外の開始日` は即日ではない。
- 開始の記載自体が無いときも、保存前に Asia/Tokyo の現在の年月（`YYYY-MM`）を `startYearMonth` に書く。開始の未記載ではレコードの保存を止めない。サーバーは null から年月を作らない。検索の開始月を省くことは保存の null ではない。

案件の個人事業主・外国籍、要員の外国籍・個人事業主、案件と要員の単価相談、案件と要員の単価の種類、案件と要員の単価の基準は `null` にできない。

- 案件と要員の `unitPriceKind`。未記載は `MONTHLY`（月額）。時給・時間単価・円/時は `HOURLY`。`null` は拒否される。
- 案件と要員の `monthlyUnitPriceBasis`。未記載は `AT_STATED_UTILIZATION`（この稼働割合の月額）。`万円/人月`、`100%換算`、`稼働100%の場合` は `PER_PERSON_MONTH`。`稼働0.5で40万`、`この稼働での月額` は `AT_STATED_UTILIZATION`。`null` は拒否される。
- 案件と要員の `rateNegotiable`。未記載は `false`（不可）。登録は止めない。
- 案件 `soloProprietorAllowed` / `foreignNationalityAllowed`。未記載はどちらも `true`（可）。
- 要員 `isForeignNationality`。未記載は `false`（非該当）。
- 要員 `gender`（`MALE` / `FEMALE` / `null`）は下の「要員の性別」の順で決める。掲載文・メール本文・セルを先に読み、そこに無いときだけその要員のスキルシートを読む。どちらにも無ければ `null`（未設定）で登録する。新規の性別を `MALE` にしない。Do not default new 要員 gender to `MALE`; save `null` when neither the source nor the skill sheet states it.
- 要員 `isSoloProprietor` は掲載文・メール本文・セルと会社スキルから読む。その要員の所属・雇用形態として `フリーランス`・`所属フリーランス`（`弊社所属フリーランス`・`1社先所属フリーランス` など）・`個人事業主` とあれば `true`（該当）。`正社員`・`契約社員`・`N社先正社員` は `false`（非該当）。メール冒頭の `弊社所属フリーランス人材` のように、同じメールの全員に向けた一文もその全員の所属として読む。PR・職歴に出てくるだけのフリーランス経験は判定に使わない。A 要員 whose own 所属 or 雇用形態 says フリーランス, 所属フリーランス, or 個人事業主 is `true`; 正社員 or 契約社員 is `false`; past freelance work in the PR or history does not decide it. 決まらなければその旨を報告し、そのレコードは登録しない。個人事業主の未記載をスキルシート必須にはしない。`false`（非該当）は既存行の移行値であり、新規の既定ではない。Do not default new 要員 `isSoloProprietor` to `false`.
- 会社スキル（送信元会社ごとに導入先が用意したスキル）がこれらの既定を書いていれば、未記載のときはそれに従う。ソースの明示は既定にも会社スキルにも勝つ。性別はこの既定で埋めない。掲載文・メール本文・セルに男性か女性が無いときは、会社スキルの性別既定より先にスキルシートを読む。

案件のみ: `requiredGender`（`MALE` / `FEMALE`。歓迎はメモであり必須ではない。未記載は `null` のまま）。`ageMin` / `ageMax` は書いた端だけ 15〜99。下限が無いときは `null`（下限なし、負の無限大）、上限が無いときは `null`（上限なし、正の無限大）。15 と 99 で埋めない。端を 15 や 99 に丸めない。Unstated project age stays null. A stated age outside 15–99 is rejected. An age filter still returns projects whose age bounds are null. Do not pass 15 or 99 to keep those rows. Do not clamp an out-of-range end to 15 or 99.

数値の歳はこれまでどおり。年代の語に読み替えない。

- `35歳以下` / `35歳まで` / `～35歳` / `〜35歳` は ageMax 35、ageMin は null。
- `30歳以上` / `30歳～` / `30歳〜` は ageMin 30、ageMax は null。
- `30歳～40歳` / `30～40歳` は ageMin 30、ageMax 40。
- `30歳` だけ（以上・以下・まで・～が無い）は ageMin 30、ageMax 30。

年代も歳の数値として登録する。捨てない。N は 20代の 20、30代の 30 のようにその十の位。`くらい` / `程度` は桁を変えない。帯の内側（前半の 0〜4、半ばの 3〜6、後半の 5〜9）は使わない。幅が最大になる側の1桁だけを、下限でも上限でも同じ桁にする。

- 前半は常にその代の 0。`30代前半` は 30。上限に来ても 0。
- 半ばは常にその代の 3。`30代半ば` は 33。上限に来ても 3。
- 後半は常にその代の 9。`40代後半` は 49。下限に来ても 9。
- 前半・半ば・後半が付かない `N代` は、下限 N0、上限 N9。単独の `30代` は ageMin 30、ageMax 39。`30代～40代` は ageMin 30、ageMax 49。
- 範囲は左の語の桁を ageMin、右の語の桁を ageMax。`30代前半～40代後半` は 30〜49。`30代半ば～40代後半` は 33〜49。`30代後半～40代前半` は 39〜40。
- 単独の `30代前半` は ageMin 30、ageMax 30。単独の `30代半ば` は 33 と 33。単独の `40代後半` は 49 と 49。
- `30代～` / `30代以上` は ageMin 30、ageMax は null。`～40代後半` / `40代後半まで` / `40代後半以下` は ageMax 49、ageMin は null。`～40代前半` は ageMax 40、ageMin は null。`40代後半～` は ageMin 49、ageMax は null。
- 書いていない端は null。15 や 99 で埋めない。15〜99 の外に出た端は拒否する。

同じ文に年代と数値の歳があるとき、`以上` / `以下` / `まで` / 数値の `～` がある数値を優先する。`35歳以下（30代歓迎）` は ageMax 35、ageMin は null。歳が1つだけで開きが無いときは年代を使う。`30代前半（35歳）` は 30 と 30。

Numeric ages stay numbers: `35歳以下`, `35歳まで`, and `～35歳` set ageMax only; `30歳以上` and `30歳～` set ageMin only; `30歳～40歳` and `30～40歳` set both; a bare `30歳` with no 以上, 以下, まで, or ～ sets both bounds to 30. Decade words are stated ages and are not dropped. Do not use the inner band (前半 is not 0–4, 半ば is not 3–6, 後半 is not 5–9). Use one digit, the same digit for ageMin and ageMax: 前半 is always 0 (`30代前半` is 30, even as ageMax), 半ば is always 3 (`30代半ば` is 33, even as ageMax), 後半 is always 9 (`40代後半` is 49, even as ageMin). A range puts the left word's digit in ageMin and the right word's digit in ageMax: `30代前半～40代後半` is 30 and 49, `30代半ば～40代後半` is 33 and 49, `30代後半～40代前半` is 39 and 40. A standalone `30代前半` is ageMin 30 and ageMax 30. Bare N代 with no 前半, 半ば, or 後半 is ageMin N0 and ageMax N9: standalone `30代` is 30–39, and `30代～40代` is 30–49. `30代～` is min 30 and max null. `～40代後半` is max 49 and min null. An unwritten end stays null.

要員のみ: `ageYears`（メールの「35歳」はスナップショット）。未記載は `null`。記載があるときは 15〜99。範囲外は拒否する。Candidate age may stay null. A stated age outside 15–99 is rejected. ソースが一人の歳を `35歳` のように書いているときだけ `ageYears` にする。`30代` や `30代前半～40代後半` の幅は一人の歳にしない。`ageYears` は null のまま。`35歳以下` も一人の歳ではない。Candidate ageYears is only one person's stated age such as `35歳`. Do not turn `30代` or `30代前半～40代後半` into one ageYears.

案件のみ `dispatchContractRequired`。ソースが派遣契約を必須としているとき `true`。未記載は `null`。不可（`false`）は作らない。マッチングの案件検索は常に `dispatchContractRequired: ["unset"]` を渡し、必須の案件を外す。概要に戻って必須を拾わない。要員検索では使わない。起点の案件が必須なら、その案件は評価しない。

## 要員の性別

要員の性別は、掲載文・メール本文・セルを先に読む。男性か女性と書いてあればそれを使う（`MALE` / `FEMALE`）。

そこに無いときだけ、その要員のスキルシートを読んで性別を決める。対象は、公開の Google Docs / Sheets / Drive のファイル、または添付。シートに男性か女性とあればそれを保存する。掲載文・メール本文・セルに男性か女性と書いてあるときは、シートで上書きしない。

シートにも無い、またはシートを読めないときは `gender: null`（未設定）で登録する。性別が無いことでは登録を止めない。新規の性別を `MALE` にしない。推測もしない（氏名・写真・敬称から決めない）。シートを開けなかっただけでは、他の理由が無い限り `reviewRequired` にしない。シートを読めなかったときは `スキルシート未確認` と、性別を未設定で登録した旨を報告する。

この手順がシートから取るのは性別だけである。個人事業主の未記載をスキルシート必須にはしない。単価、スキル、概要はシートで埋めない。シート本文を原文や概要へ写さない。URL を原文へ挿入しない。概要へ `[スキルシート](url)` を足さない。案件のシートは性別のために読まない。

シートは、その要員の FILE として読む。公開の Google Docs / Sheets / Drive のシートは、上のスキルシートの節のとおり、概要を保存したあと `add_candidate_attachment_from_url` で FILE にする。サーバーが公開の書き出しまたはダウンロードで取得し、保存時に本文も読む。エージェントは同じ URL を別に書き出したりダウンロードしたりしない。Drive API もユーザーの Google 接続も使わない。メールに付いたシートは、コピーされた FILE を使う。その FILE を `get_candidate_attachment_download_link` の `includeText: true` で取り、返った `extractedText`（サーバーが保存時に読んだ本文）を読む。`extractedText` が null のときだけファイルをダウンロードし、`.agents/skills/read-office-attachments` で読む。シートで性別が決まったら、その読みのあとに `update_candidate` で `gender` だけを送る。`add_candidate_attachment_from_url` が失敗したときは、そのシートは読めなかったものとして扱う。Drive のフォルダ URL 自体は性別のシートにしない。フォルダ URL を `スキルシート未確認` にしない。中のファイルの選び方は上の Drive フォルダの節。ファイルを一つに決められないときは、そのシートは読んでいない。性別が掲載文・メール本文・セルに無いなら `gender: null` で登録し、性別を未設定で登録した旨を報告する。`reviewRequired` にはしない。

## 未記載と消去

未記載の数値のうち、稼働割合・出社頻度、案件の商流、要員の所属は上の既定で埋める。それらに `null` を残さない。開始年月の未記載は、保存前に Asia/Tokyo の現在の年月（`YYYY-MM`）を書く。開始の未記載では保存を止めない。サーバーは null から年月を作らない。案件の商流制限の未記載は null のまま残す。単価の欠けた端と案件の年齢の欠けた端は `null` のまま残す。年代の言い方は欠けではない。上の年齢の換算で書いた端を歳にする。案件の商流の未記載は `-1`（不明）。`0` は使わない。要員の所属の未記載は `-1`（不明）。範囲外は拒否する。単価の種類 `unitPriceKind` も未記載は `MONTHLY` で、`null` は拒否される。単価の基準 `monthlyUnitPriceBasis` も未記載は `AT_STATED_UTILIZATION` で、`null` は拒否される。それ以外で既定を置いていないフラグは `null`。単価税区分、単価相談、再配信、案件の個人事業主と外国籍、要員の外国籍は未記載でも `null` を送らず、上の既定を送る。単価相談の未記載は登録を止めない。要員の性別は上の順で、掲載文・メール本文・セルのあとスキルシートを読む。シートにも無い、またはシートを読めないときは `null`（未設定）で登録する。要員の個人事業主は掲載文・メール本文・セルと会社スキルから決め、スキルシートは必須にしない。個人事業主がそこから決まらなければ登録しない。キーを省くと前回の値が残る。リフレッシュで `null` を送るかは、その会社スキルが書く。概要などのテキストを消すときは `""`。`null` はテキストでは拒否される。

Keep source 万円 on the monthly columns and hourly yen on the hourly columns. Do **not** apply ±5万. Hourly rates are not shifted.
