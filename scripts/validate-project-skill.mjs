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

function parseYamlScalar(value) {
  const text = value.trim();
  if (!text) return { ok: false, error: "empty value" };
  if (text.startsWith('"')) {
    try {
      const parsed = JSON.parse(text);
      return typeof parsed === "string" ? { ok: true } : { ok: false, error: "not a string" };
    } catch {
      return { ok: false, error: "invalid quoted string" };
    }
  }
  if (text.startsWith("'")) {
    if (!/^'(?:[^']|'')*'$/.test(text)) return { ok: false, error: "invalid quoted string" };
    return { ok: true };
  }
  if (text.includes(": ") || text.includes('"') || text.includes("'")) {
    return { ok: false, error: "unquoted unsafe string" };
  }
  return { ok: true };
}

function yamlKeyValues(text) {
  const map = new Map();
  const yamlErrors = [];
  for (const line of text.split("\n").filter((item) => item.trim())) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      yamlErrors.push(`invalid YAML line: ${line}`);
      continue;
    }
    map.set(match[1], match[2]);
  }
  return { map, yamlErrors };
}

function hasInterfaceSection(text) {
  return /^interface:\s*$/m.test(text);
}

function interfaceValueForKey(text, key) {
  const lines = text.split("\n");
  let inInterface = false;
  for (const line of lines) {
    if (/^interface:\s*$/.test(line)) {
      inInterface = true;
      continue;
    }
    if (!inInterface) continue;
    if (!line.trim()) continue;
    if (!/^\s+/.test(line)) break;
    const match = line.match(new RegExp(`^\\s+${key}:\\s*(.+)$`));
    if (match) return match[1].trim();
  }
  return null;
}

const errors = [];
const allFiles = walk(dir);
const templateFiles = allFiles.filter((file) => {
  const rel = relative(dir, file);
  return !rel.startsWith("assets/") && /\{\{[a-zA-Z0-9_:]+\}\}/.test(readFileSync(file, "utf8"));
});

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
    const { map, yamlErrors } = yamlKeyValues(fm[1]);
    for (const error of yamlErrors) errors.push(`SKILL.md frontmatter has ${error}`);
    const keys = [...map.keys()];
    for (const key of keys) {
      if (!["name", "description"].includes(key)) errors.push(`SKILL.md frontmatter has unsupported key: ${key}`);
    }
    if (!keys.includes("name")) errors.push("SKILL.md frontmatter missing name");
    if (!keys.includes("description")) errors.push("SKILL.md frontmatter missing description");
    for (const [key, value] of map) {
      const parsed = parseYamlScalar(value);
      if (!parsed.ok) errors.push(`SKILL.md frontmatter value for ${key} is invalid YAML: ${parsed.error}`);
    }
  }
}

function isInstructionMarkdown(file) {
  const rel = relative(dir, file);
  return rel === "SKILL.md" || rel.startsWith("references/");
}

const markdownFiles = allFiles.filter((file) => file.endsWith(".md") && isInstructionMarkdown(file));
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
  if (!hasInterfaceSection(openai)) errors.push("agents/openai.yaml missing interface section");
  for (const key of ["display_name", "short_description", "default_prompt"]) {
    const value = interfaceValueForKey(openai, key);
    if (!value) {
      errors.push(`agents/openai.yaml missing quoted ${key}`);
      continue;
    }
    if (!/^["']/.test(value)) errors.push(`agents/openai.yaml ${key} must be quoted`);
    const parsed = parseYamlScalar(value);
    if (!parsed.ok) errors.push(`agents/openai.yaml ${key} is invalid YAML: ${parsed.error}`);
  }
}

if (errors.length) {
  console.error("AI project skill validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`AI project skill validation passed: ${dir}`);
