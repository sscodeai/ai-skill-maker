#!/usr/bin/env node
// Enforce the Markdown instruction-file budget guardrail for the maker's own payload.
// Usage: node scripts/file-budget.mjs [<skill-folder>]
//   Default: check the maker repository itself.
//   With a folder: check a generated/installed skill payload.
// Exit 0 when every active Markdown instruction file is within budget; exit 1 otherwise.
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const target = process.argv[2] || repoRoot;
const HARD_CEILING_TOKENS = 9000;
const budgetDirs = ["references", "assets", "templates"];
const skipDirs = new Set([".git", "node_modules"]);
const skipFiles = new Set(["README.md", "README.ja.md", "LICENSE", "LICENSING.md", "CHANGELOG.md"]);

function walk(dir, root, out) {
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, root, out);
    } else if (name.endsWith(".md") && !skipFiles.has(name)) {
      out.push(relative(root, full));
    }
  }
}

function estimateTokens(path) {
  const bytes = Buffer.byteLength(readFileSync(path, "utf8"), "utf8");
  return Math.ceil(bytes / 4);
}

const files = [];
for (const dir of budgetDirs) {
  const full = join(target, dir);
  if (existsSync(full) && statSync(full).isDirectory()) walk(full, target, files);
}
// Include SKILL.md itself when checking the maker repo.
if (target === repoRoot && existsSync(join(target, "SKILL.md"))) files.push("SKILL.md");

let failed = false;
for (const file of files.sort()) {
  const tokens = estimateTokens(join(target, file));
  const flag = tokens > HARD_CEILING_TOKENS ? "OVER" : "ok";
  if (tokens > HARD_CEILING_TOKENS) failed = true;
  console.log(`${flag.padEnd(5)} ${String(tokens).padStart(6)} tokens  ${file}`);
}

if (failed) {
  console.error(`FAIL file budget: at least one Markdown instruction file exceeds ${HARD_CEILING_TOKENS} tokens`);
  process.exit(1);
}
console.log(`OK file budget: all active Markdown instruction files within ${HARD_CEILING_TOKENS} tokens`);
