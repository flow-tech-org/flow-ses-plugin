import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (name: string) => readFileSync(new URL(`../skills/${name}/SKILL.md`, import.meta.url), "utf8");
const skill = read("review-skill-dictionary");

test("スキル辞書の整理は新しいスキルを対象に、別名のまとめと上位スキルだけをする", () => {
  assert.match(skill, /^name: review-skill-dictionary$/mu);
  assert.match(skill, /`search_skills` with `createdAfter` = the window start/u);
  assert.match(skill, /`aliasNames` = its current aliases \(every one/u);
  assert.match(skill, /`forceMerge: true`/u);
  assert.match(skill, /Merely related names are not the same thing/u);
  assert.match(skill, /The parent must already exist\. Do not create one\. When unsure, leave it out/u);
  assert.match(skill, /Never `create_skill` or `delete_skill`/u);
  assert.match(skill, /Never change a 上位スキル that is already set/u);
});

test("スキル辞書の整理の定期実行は最初に開始時刻を記録する", () => {
  const get = skill.indexOf('`get_scheduled_task_last_start` with `task: "review-skill-dictionary"`');
  const record = skill.indexOf("Right away, before searching, call `record_scheduled_task_start`");
  assert.ok(get >= 0 && record > get);
  assert.match(skill, /Record it even if the run later stops early/u);
});

test("導入スキルはスキル辞書の整理を6つ目の定期実行として作る", () => {
  const onboarding = read("onboarding");
  assert.match(onboarding, /\| スキル辞書の整理 \| 平日 20:00 JST \(`0 11 \* \* 1-5` UTC\) \| Flow SES プラグインの review-skill-dictionary スキルに従って実行。/u);
  assert.match(onboarding, /Then ask about スキル辞書の整理 in one message and one question/u);
  assert.match(onboarding, /スキル辞書の別名へのまとめと上位スキルの設定/u);
});
