// スキルの決まりごと（ツール名・引数名・禁止事項）を確かめるための共通の部品。
// 文の言い回しそのものは確かめない。言い換えても決まりが同じならテストは通る。
import { existsSync, readdirSync, readFileSync } from "node:fs";

const skillsDir = new URL("../skills/", import.meta.url);

export const SKILL_NAMES = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(new URL(`${entry.name}/SKILL.md`, skillsDir)))
  .map((entry) => entry.name)
  .sort();

export function readSkill(name: string) {
  return readFileSync(new URL(`${name.replace(/^flow-ses:/u, "")}/SKILL.md`, skillsDir), "utf8");
}

/** SKILL.md の frontmatter（name と description）。 */
export function frontmatter(text: string) {
  const match = /^---\n([\s\S]*?)\n---\n/u.exec(text);
  if (!match) return null;
  const name = /^name: (.+)$/mu.exec(match[1])?.[1]?.trim() ?? null;
  const descriptionBlock = /^description: >-\n((?: {2}.*\n?)+)/mu.exec(match[1])?.[1]
    ?? /^description: (.+)$/mu.exec(match[1])?.[1]
    ?? "";
  const description = descriptionBlock.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
  return { name, description };
}

const TOOL_PREFIX = /^(?:list|get|create|update|delete|set|send|add|preview|search|match|link|unlink|sync|ensure|record|notify|refresh|enable|move|compare|screen)_/u;

/** バッククォートで囲んだツール名らしい語（`list_projects` など）。 */
export function toolMentions(text: string) {
  const names = new Set<string>();
  for (const match of text.matchAll(/`([a-z]+(?:_[a-z]+)+)`/gu)) {
    if (TOOL_PREFIX.test(match[1])) names.add(match[1]);
  }
  return names;
}

/** 文（行または箇条書き）単位で、その名前が出てくる文を返す。 */
export function sentencesMentioning(text: string, name: string) {
  return text
    .split(/\n|(?<=\.)\s+(?=[A-Z`*])/u)
    .filter((sentence) => sentence.includes(`\`${name}\``));
}

/** 「使わない」と書いている文か。 */
export function isProhibition(sentence: string) {
  return /\b(?:Do not|do not|Do \*\*not\*\*|do \*\*not\*\*|Never|never|not|no|Out of scope|There is no)\b|しない|使わない/u.test(sentence);
}

/** 本文中の `flow-ses:<name>` の参照。 */
export function skillReferences(text: string) {
  return new Set([...text.matchAll(/(?<!plugin:)flow-ses:(?!flow-ses\b)([a-z-]+)/gu)].map((match) => match[1]));
}

/** 本文中の raw.githubusercontent.com の SKILL.md へのリンクが指すスキル名。 */
export function rawSkillLinks(text: string) {
  return [...text.matchAll(/https:\/\/raw\.githubusercontent\.com\/flow-tech-org\/flow-ses-plugin\/main\/skills\/([a-z-]+|<[^>]+>)\/SKILL\.md/gu)]
    .map((match) => match[1]);
}
