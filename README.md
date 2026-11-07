# Flow SES

FlowSES の案件・要員・マッチングの台帳に Claude をつなぎ、メール取り込み・マッチング作成・配信下書き・導入を進めます。

Claude のプラグインです。FlowSES コネクタの接続先と、作業ごとのスキルが入っています。FlowSES のアカウントでサインインしないと使えません。

## 入れ方

- **Team / Enterprise:** 組織のオーナーが「組織設定 → Plugins & skills → Add marketplace」でこのリポジトリ（flow-tech-org/flow-ses-plugin）を追加し、flow-ses を「Installed by default」にします。
- **Pro / Max:** 「カスタマイズ → プラグイン → Add marketplace」でこのリポジトリを追加し、flow-ses を入れます。
- **Claude Code:** `/plugin marketplace add flow-tech-org/flow-ses-plugin` のあと `/plugin install flow-ses@flow-ses`。自動更新をオンにしておくと、新しい手順がすぐ届きます。

最初に使うとき、FlowSES コネクタのサインイン画面が開きます。導入は `/flow-ses:onboarding` から始めます。

## スキル

| スキル |
|---|
| `/flow-ses:close-stale-source-listings` |
| `/flow-ses:evaluate-candidate-matchings` |
| `/flow-ses:evaluate-project-matchings` |
| `/flow-ses:evaluate-recent-matchings` |
| `/flow-ses:generate-distribution-draft` |
| `/flow-ses:onboarding` |
| `/flow-ses:process-inbox` |
| `/flow-ses:read-office-attachments` |
| `/flow-ses:register-ses-partner-business-card` |
| `/flow-ses:structured-conditions` |

## 更新するとき

スキルを直したら `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json` の `version` を上げます。スキルの中には会社名・取引先名・掲載サイト名を書きません。スキルの決まりごとは tests/ にあり、`node --test tests/*.test.ts`（Node 24）で確かめます。
