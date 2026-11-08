#!/usr/bin/env bash
# 開発用（preview 接続）の一式に書き換える。preview ブランチを作る workflow から呼ぶ。
# 使い方: scripts/make-preview.sh <MCP の URL> <版の後ろに付ける番号>
set -euo pipefail
url="$1"; build="$2"
version="$(jq -r .version .claude-plugin/plugin.json)-preview.$build"

edit() { jq "${@:2}" "$1" > "$1.tmp" && mv "$1.tmp" "$1"; }
edit .mcp.json --arg u "$url" '.mcpServers["flow-ses"].url = $u'
edit .claude-plugin/plugin.json --arg v "$version" '.version = $v'
edit .claude-plugin/marketplace.json --arg v "$version" \
  '.name = "flow-ses-dev" | .description = "Flow SES 開発用（preview）" | .plugins[0].version = $v'

# スキルが読む SKILL.md の場所も preview ブランチに向ける
grep -rl 'flow-ses-plugin/main/' skills README.md | xargs -r sed -i 's#flow-ses-plugin/main/#flow-ses-plugin/preview/#g'

{ printf '> **開発用です。** コネクタの接続先は preview（%s）です。導入先に案内するのは main ブランチです。\n\n' "$url"; cat README.md; } > README.md.tmp
mv README.md.tmp README.md
echo "$version"
