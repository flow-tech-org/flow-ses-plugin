import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillPath = join(root, "skills/read-office-attachments/SKILL.md");

test("office reader skill is original and covers common SES file types", () => {
  const skill = readFileSync(skillPath, "utf8");
  assert.match(skill, /^name: read-office-attachments$/m);
  assert.match(skill, /get_project_attachment_download_link/u);
  assert.match(skill, /get_candidate_attachment_download_link/u);
  assert.doesNotMatch(skill, /get_record_attachment_download_link/u);
  assert.match(skill, /markitdown/u);
  assert.match(skill, /openpyxl/u);
  assert.match(skill, /pandoc/u);
  assert.match(skill, /pdftotext/u);
  assert.match(skill, /tesseract/u);
  assert.match(skill, /FILE only/u);
  assert.doesNotMatch(skill, /kind=REFERENCE/u);
  assert.match(skill, /添付読取失敗/u);
  assert.doesNotMatch(skill, /anthropics\/skills/u);
  assert.doesNotMatch(skill, /license: Proprietary/u);
  assert.equal(existsSync(join(root, "skills/read-office-attachments/SKILL.md")), true);
  assert.equal(existsSync(join(root, ".cursor/skills/read-office-attachments/SKILL.md")), false);
  assert.equal(existsSync(join(root, ".cursor/skills/xlsx/SKILL.md")), false);
  assert.equal(existsSync(join(root, ".cursor/skills/SOURCE.txt")), false);
});

