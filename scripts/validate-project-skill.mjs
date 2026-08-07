#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/validate-project-skill.mjs <skill-dir>");
  process.exit(1);
}

const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/project-intent.md",
  "references/project-map.md",
  "references/architecture.md",
  "references/coding-standards.md",
  "references/content-style.md",
  "references/workflows.md",
  "references/verification.md",
  "references/release.md",
  "references/generated-files.md",
];

function walk(path, out = []) {
  if (!existsSync(path)) return out;
  for (const name of readdirSync(path)) {
    const full = join(path, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const errors = [];
const allFiles = walk(dir);
const templateFiles = allFiles.filter((file) => /\{\{[a-zA-Z0-9_]+\}\}/.test(readFileSync(file, "utf8")));

if (templateFiles.length) {
  console.error("AI project skill validation failed:");
  console.error("- This looks like an unrendered template directory. Render it first, then validate the rendered output.");
  for (const file of templateFiles.slice(0, 8)) {
    console.error(`- Template placeholder found in: ${relative(dir, file)}`);
  }
  if (templateFiles.length > 8) console.error(`- ...and ${templateFiles.length - 8} more template files`);
  process.exit(1);
}

for (const file of required) {
  if (!existsSync(join(dir, file))) errors.push(`Missing required file: ${file}`);
}

const skillPath = join(dir, "SKILL.md");
if (existsSync(skillPath)) {
  const skill = readFileSync(skillPath, "utf8");
  const fm = skill.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) errors.push("SKILL.md is missing YAML frontmatter");
  else {
    const keys = fm[1].split("\n").map((line) => line.split(":")[0].trim()).filter(Boolean);
    for (const key of keys) {
      if (!["name", "description"].includes(key)) errors.push(`SKILL.md frontmatter has unsupported key: ${key}`);
    }
    if (!keys.includes("name")) errors.push("SKILL.md frontmatter missing name");
    if (!keys.includes("description")) errors.push("SKILL.md frontmatter missing description");
  }
}

const markdownFiles = allFiles.filter((f) => f.endsWith(".md"));
for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  const rel = relative(dir, file);
  if (!text.includes("Evidence Ledger") && rel !== "SKILL.md") errors.push(`${rel} missing Evidence Ledger`);
  const begins = (text.match(/BEGIN USER RULES/g) || []).length;
  const ends = (text.match(/END USER RULES/g) || []).length;
  if (begins !== 1 || ends !== 1) errors.push(`${rel} must contain exactly one USER RULES block`);
}

const refs = required.filter((f) => f.startsWith("references/"));
const labelPattern = /(observed_fact|declared_intent|recommended_standard|inferred_assumption):/;
for (const file of refs) {
  const text = existsSync(join(dir, file)) ? readFileSync(join(dir, file), "utf8") : "";
  if (!labelPattern.test(text)) errors.push(`${file} missing evidence labels`);
}

const openaiPath = join(dir, "agents/openai.yaml");
if (existsSync(openaiPath)) {
  const openai = readFileSync(openaiPath, "utf8");
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    if (!new RegExp(`${key}:\\s+".+"`).test(openai)) errors.push(`agents/openai.yaml missing quoted ${key}`);
  }
}

if (errors.length) {
  console.error("AI project skill validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`AI project skill validation passed: ${dir}`);
