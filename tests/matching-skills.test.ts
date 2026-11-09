// 案件側・要員側のマッチングスキルと、共通の決まり（matching-rules）の決まりごと。
// 文の言い回しではなく、ツール名・引数名・禁止事項・データ（エリアのコード）を確かめる。
import assert from "node:assert/strict";
import test from "node:test";
import { isProhibition, readSkill, sentencesMentioning, toolMentions } from "./skill-rules.ts";

const rules = readSkill("matching-rules");

const SIDES = [
  {
    skill: "evaluate-project-matchings",
    other: "evaluate-candidate-matchings",
    anchorGet: "get_project",
    partnerList: "list_candidates",
    condition: "candidateCondition",
    exclude: "excludeMatchedProjectId",
    otherExclude: "excludeMatchedCandidateId",
  },
  {
    skill: "evaluate-candidate-matchings",
    other: "evaluate-project-matchings",
    anchorGet: "get_candidate",
    partnerList: "list_projects",
    condition: "projectCondition",
    exclude: "excludeMatchedCandidateId",
    otherExclude: "excludeMatchedProjectId",
  },
] as const;

// マッチングで書き込んでよいのは create_matching だけ。
const READ_TOOLS = /^(?:list|get|search|match|preview)_/u;

for (const side of SIDES) {
  const text = readSkill(side.skill);

  test(`${side.skill}: points to the shared rules and to the other side`, () => {
    assert.ok(text.includes("flow-ses:matching-rules"));
    assert.ok(text.includes(`flow-ses:${side.other}`));
  });

  test(`${side.skill}: searches partners with ${side.partnerList} and the right arguments`, () => {
    for (const name of [
      side.partnerList,
      side.anchorGet,
      "create_matching",
      "get_candidate_attachment_download_link",
      "get_matching_instructions",
    ]) {
      assert.ok(text.includes(`\`${name}\``) || rules.includes(`\`${name}\``), name);
    }
    for (const argument of [
      `recruitmentStatuses: ["unset"]`,
      `${side.condition}.skillNames`,
      `${side.condition}.includeChildSkills: true`,
      `${side.condition}.unitPriceConditions`,
      side.exclude,
      "excludeCompanyIds",
      "updatedAtFrom",
    ]) {
      assert.ok(text.includes(argument), argument);
    }
  });

  test(`${side.skill}: never uses the other side's exclusion or the stored 商流 position`, () => {
    for (const sentence of sentencesMentioning(text, side.otherExclude)) {
      assert.ok(isProhibition(sentence), sentence);
    }
    for (const sentence of sentencesMentioning(text, "commercialFlowPosition")) {
      assert.ok(isProhibition(sentence) || /is the stored integer|is not a hard mismatch/u.test(sentence), sentence);
    }
  });

  test(`${side.skill}: writes nothing but create_matching`, () => {
    for (const tool of toolMentions(text + rules)) {
      if (READ_TOOLS.test(tool) || tool === "create_matching") continue;
      if (tool === "search_skills" || tool === "record_scheduled_task_start") continue;
      for (const sentence of sentencesMentioning(text + "\n" + rules, tool)) {
        assert.ok(isProhibition(sentence) || /^- Out of scope/u.test(sentence), `${tool}: ${sentence}`);
      }
    }
  });
}

test("matching-rules: skill-name search widens one level up at most, and never to zero names", () => {
  assert.ok(rules.includes("`search_skills`"));
  assert.ok(rules.includes("`parentSkill`"));
  assert.ok(rules.includes("includeChildSkills: true"));
  assert.match(rules, /Try at most 5 parents/u);
  assert.match(rules, /never use the parent's parent/u);
  assert.match(rules, /Do not search with zero names/u);
  assert.ok(rules.includes('"widenedToParent"'));
});

test("matching-rules: the result JSON keeps its keys", () => {
  for (const key of ["window", "matchingProcessed", "widenedToParent"]) {
    assert.ok(rules.includes(`"${key}"`), key);
  }
  assert.ok(rules.includes("`matching_skipped`"));
});

test("matching-rules: the reads use stored sheet text before downloading", () => {
  const sentence = sentencesMentioning(rules, "get_candidate_attachment_download_link").join(" ");
  assert.match(sentence, /includeText: true/u);
  assert.ok(rules.includes("`extractedText`"));
});

test("matching-rules: reason says nothing about 単価 by default", () => {
  assert.match(rules, /write nothing about 単価 in `reason`/u);
});

// 都道府県のエリア: 47 のコードがちょうど1回ずつどこかのエリアに入り、
// 「隣接エリアこみのコード」が、自分のエリア＋隣接エリアのコードと一致する。
test("matching-rules: 都道府県のエリア covers every prefecture once and the neighbor codes add up", () => {
  const section = rules.slice(rules.indexOf("### 都道府県のエリア"), rules.indexOf("### 単価の比べ方"));
  assert.ok(section.length > 0, "section");
  const codes = (text: string) => [...text.matchAll(/`(\d{2})`/gu)].map((match) => match[1]);
  const areaList = /エリア: (.*?)\. When/u.exec(section)?.[1] ?? "";
  const areas = new Map<string, string[]>();
  for (const part of areaList.split(";")) {
    const [name, ...rest] = part.trim().split(" ");
    areas.set(name, codes(rest.join(" ")));
  }
  const all = [...areas.values()].flat().sort();
  assert.deepEqual(all, Array.from({ length: 47 }, (_, index) => String(index + 1).padStart(2, "0")));

  const pairs = [...(/隣接エリア: (.*?)\. Codes/u.exec(section)?.[1] ?? "").matchAll(/(\S+?)–(\S+?)(?:,|$)/gu)]
    .map((match) => [match[1], match[2]] as const);
  assert.ok(pairs.length > 0, "neighbor pairs");
  const withNeighbors = /Codes with 隣接エリア: (.*?)\.(?:\n|$)/u.exec(section)?.[1] ?? "";
  for (const part of withNeighbors.split(";")) {
    const [name, rest] = part.split("→").map((value) => value.trim());
    const expected = new Set(areas.get(name));
    for (const [left, right] of pairs) {
      if (left === name) areas.get(right)?.forEach((code) => expected.add(code));
      if (right === name) areas.get(left)?.forEach((code) => expected.add(code));
    }
    assert.deepEqual(codes(rest).sort(), [...expected].sort(), name);
  }
});
