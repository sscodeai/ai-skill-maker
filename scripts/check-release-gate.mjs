#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir || process.argv.includes("--help")) {
  console.log("Usage: node scripts/check-release-gate.mjs <skill-dir>");
  process.exit(dir ? 0 : 1);
}

const releaseGatePath = join(dir, "references", "evals", "release-gate.md");
const requiredGates = new Map([
  ["trigger", "trigger tests"],
  ["output", "output assertions"],
  ["structure", "structure validation"],
  ["budget", "file budget"],
  ["trust", "trust"],
  ["license", "license attribution"],
]);

function block(message, details = []) {
  console.error(`BLOCK release gate: ${message}`);
  for (const detail of details) console.error(`- ${detail}`);
  process.exit(1);
}

function tableRows(text) {
  return text
    .split("\n")
    .filter((line) => line.trim().startsWith("|") && !/^\|\s*-+\s*\|/.test(line))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 4 && !/^gate$/i.test(cells[0]));
}

function isFilled(value) {
  const text = String(value || "").trim();
  if (!text) return false;
  if (/^(tbd|todo|n\/a|none|pass\/fail|block\/allow|\?)$/i.test(text)) return false;
  return true;
}

if (!existsSync(releaseGatePath)) {
  block("missing references/evals/release-gate.md");
}

const text = readFileSync(releaseGatePath, "utf8");
if (/\{\{[a-zA-Z0-9_:]+\}\}/.test(text)) {
  block("release gate still contains template placeholders");
}

const rows = tableRows(text);
if (!rows.length) {
  block("release gate table was not found");
}

const found = new Map();
for (const cells of rows) {
  const key = cells[0].toLowerCase();
  found.set(key, {
    gate: cells[0],
    check: cells[1],
    result: cells[2],
    evidence: cells[3],
  });
}

const errors = [];
for (const [gate, evidenceName] of requiredGates) {
  const row = found.get(gate);
  if (!row) {
    errors.push(`missing ${evidenceName} row (${gate})`);
    continue;
  }
  if (!isFilled(row.result)) errors.push(`${evidenceName} row has no recorded BLOCK/ALLOW result`);
  if (!isFilled(row.evidence)) errors.push(`${evidenceName} row has no recorded evidence`);
}

if (errors.length) {
  block("release gate evidence is incomplete", errors);
}

console.log("PASS release gate evidence check");
console.log("Checked: trigger tests, output assertions, structure validation, file budget, trust, license attribution");
console.log("Note: this verifies recorded release-gate evidence only; it does not prove the skill is absolutely safe or publication-ready.");
