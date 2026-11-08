# Flow SES

Flow SES の案件・要員・マッチングの台帳に Claude をつなぎ、メール取り込み・マッチング作成・導入を進めます。

Claude のプラグインです。flow-ses コネクタの接続先と、作業ごとのスキルが入っています。Flow SES のアカウントでサインインしないと使えません。

## 入れ方

- **claude.ai（Pro / Max / Team / Enterprise の各メンバー）:** [カスタマイズ → プラグイン](https://claude.ai/customize/plugins) で「追加」→「マーケットプレイスを追加」→「リポジトリから追加」にこのリポジトリ（`flow-tech-org/flow-ses-plugin`）を入れ、flow-ses をインストールし、プラグインの「コネクタ」タブで Flow SES を接続します（プラグインを入れただけではコネクタは追加されません）。接続するとコネクタ一覧にも入り、定期実行からも使えます。「自動的に同期」をオンにすると、更新が自動で届きます。
- **Claude Code:** `/plugin marketplace add flow-tech-org/flow-ses-plugin` のあと `/plugin install flow-ses@flow-ses`。
- **定期実行と Claude Code on the web:** プラグインのスキルが読み込まれない場合があります。そのときは `https://raw.githubusercontent.com/flow-tech-org/flow-ses-plugin/main/skills/<名前>/SKILL.md` を読めば同じ手順で動きます。

組織のマーケットプレイス（組織設定 → Plugins & skills）は非公開か internal のリポジトリしか登録できません。組織でまとめて配るときは、このリポジトリを自社の非公開リポジトリに複製して登録します。複製には、こちらの更新は自動では届きません。

最初に使うとき、flow-ses コネクタのサインイン画面が開きます。導入は `/flow-ses:onboarding` から始めます。

## スキル

| スキル |
|---|
| `/flow-ses:close-stale-source-listings` |
| `/flow-ses:evaluate-candidate-matchings` |
| `/flow-ses:evaluate-project-matchings` |
| `/flow-ses:evaluate-recent-matchings` |
| `/flow-ses:matching-rules`（2つのマッチングスキルが読む共通の決まり。単独では使わない） |
| `/flow-ses:onboarding` |
| `/flow-ses:process-inbox` |
| `/flow-ses:read-office-attachments` |
| `/flow-ses:register-ses-partner-business-card` |
| `/flow-ses:register-spreadsheet-listings` |
| `/flow-ses:structured-conditions` |

## 更新するとき

スキルを直したら `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json` の `version` を上げます。スキルの中には会社名・取引先名・掲載サイト名を書きません。スキルの決まりごとは tests/ にあり、`node --test tests/*.test.ts`（Node 24）で確かめます。

## 開発用（preview 接続）

`preview` ブランチは main と同じ中身で、コネクタの接続先だけ preview（develop）になっています。main に push すると自動で作り直します。作業中のブランチを試すときは Actions の preview-branch を手動実行して元のブランチを選びます。直接は編集しません。

- **Claude Code:** `/plugin marketplace add flow-tech-org/flow-ses-plugin#preview` のあと `/plugin install flow-ses@flow-ses-dev`。本番用の flow-ses@flow-ses とは同時に入れず、切り替えて使います。
