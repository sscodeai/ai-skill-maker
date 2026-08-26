#!/usr/bin/env node
// Check that the protected core principles section matches the committed fingerprint.
// Usage: node scripts/check-core-principles.mjs [--fix]
//   --fix: regenerate core-principles.lock.json from the current protected section.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const rulesPath = join(repoRoot, "references", "rules", "protected-core-principles.md");
const lockPath = join(repoRoot, "references", "rules", "core-principles.lock.json");
const startMarker = "<!-- PROTECTED_CORE_START -->";
const endMarker = "<!-- PROTECTED_CORE_END -->";
const fix = process.argv.includes("--fix");

function extractProtected(text) {
  const start = text.indexOf(startMarker);
  const end = text.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`protected core markers not found in ${rulesPath}`);
  }
  return text.slice(start + startMarker.length, end).trim();
}

function fingerprint(text) {
  return createHash("sha256").update(text).digest("hex");
}

function fail(message) {
  console.error(`FAIL core principles: ${message}`);
  process.exit(1);
}

if (!existsSync(rulesPath)) {
  fail(`missing ${rulesPath}`);
}
const text = readFileSync(rulesPath, "utf8");
let protectedText;
try {
  protectedText = extractProtected(text);
} catch (error) {
  fail(error.message);
}

const current = fingerprint(protectedText);

if (fix) {
  writeFileSync(lockPath, JSON.stringify({ file: "references/rules/protected-core-principles.md", algorithm: "sha256", fingerprint: current, updatedAt: new Date().toISOString() }, null, 2) + "\n");
  console.log(`WROTE core-principles.lock.json fingerprint ${current.slice(0, 16)}...`);
  process.exit(0);
}

if (!existsSync(lockPath)) {
  fail(`missing ${lockPath}; run with --fix to generate`);
}
const lock = JSON.parse(readFileSync(lockPath, "utf8"));
if (lock.fingerprint !== current) {
  fail(`fingerprint mismatch: lock=${lock.fingerprint.slice(0, 16)}... current=${current.slice(0, 16)}... The protected core changed; regenerate the lock ONLY when the user explicitly approved changing a core principle.`);
}
console.log(`OK core principles fingerprint ${current.slice(0, 16)}... matches lock`);
