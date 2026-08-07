#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const evidenceLabels = ["observed_fact", "declared_intent", "recommended_standard", "inferred_assumption"];
const repoRootNames = new Set([
  "src",
  "lib",
  "app",
  "pages",
  "components",
  "content",
  "docs",
  "test",
  "tests",
  "public",
  "assets",
  "build",
  "coverage",
  "dist",
  "scripts",
  "references",
  "agents",
  "vendor",
  "__snapshots__",
  ".github",
  ".cursor",
]);

const knownFields = new Set([
  "skillName",
  "projectName",
  "shortDescription",
  "projectPurpose",
  "audience",
  "publicVoice",
  "constraints",
  "maintenanceGoals",
  "questionsToRevisit",
  "importantPaths",
  "entryPoints",
  "ownershipBoundaries",
  "systemShape",
  "dataFlow",
  "integrationPoints",
  "designConstraints",
  "stylePatterns",
  "dependencyPolicy",
  "patternsToAvoid",
  "languagePolicy",
  "toneAndNaming",
  "documentationConventions",
  "commonChangeFlow",
  "firstRepositoryTasks",
  "reviewFlow",
  "verificationCommands",
  "manualQa",
  "riskGates",
  "versioning",
  "changelog",
  "deployPublish",
  "rollback",
  "generatedOutput",
  "lockfiles",
  "snapshotsSchemasVendored",
  "editRestrictions",
  "evidenceLedger",
]);

const strictFields = [
  "projectName",
  "projectPurpose",
  "audience",
  "constraints",
  "maintenanceGoals",
  "importantPaths",
  "entryPoints",
  "systemShape",
  "stylePatterns",
  "verificationCommands",
  "generatedOutput",
  "editRestrictions",
  "evidenceLedger",
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--mode") args.mode = argv[++i];
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/validate-config.mjs --input config.json [--mode genesis|repo] [--strict]`);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function fieldText(value) {
  if (Array.isArray(value)) return value.join("\n");
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  return String(value);
}

function allText(config) {
  return Object.values(config).map(fieldText).join("\n");
}

function evidenceCounts(text) {
  return Object.fromEntries(evidenceLabels.map((label) => [label, (text.match(new RegExp(`${label}:`, "g")) || []).length]));
}

function observedFactLines(config) {
  const lines = [];
  for (const [field, value] of Object.entries(config)) {
    for (const line of fieldText(value).split(/\r?\n/)) {
      if (line.includes("observed_fact:")) lines.push({ field, line: line.trim() });
    }
  }
  return lines;
}

function hasPathCitation(line) {
  const codeSpans = [...line.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  return codeSpans.some(looksLikeRepoPath);
}

function looksLikeRepoPath(value) {
  const text = String(value || "").trim().replace(/\/$/, "");
  if (!text || /\s/.test(text)) return false;
  if (text.includes("/") || text.includes("*")) return true;
  if (repoRootNames.has(text)) return true;
  if (/^\.[\w.-]+$/.test(text)) return true;
  return /^[\w@.-]+\.[A-Za-z0-9*]+$/.test(text);
}

function inferMode(config, explicitMode) {
  if (explicitMode) return explicitMode;
  const text = allText(config);
  if (text.includes("observed_fact:")) return "repo";
  if (text.includes("declared_intent:")) return "genesis";
  return null;
}

export function validateConfig(config, options = {}) {
  const errors = [];
  const warnings = [];

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, errors: ["Config must be a JSON object."], warnings, mode: null, counts: {} };
  }

  const mode = inferMode(config, options.mode);

  if (!isNonEmptyString(config.projectName)) {
    errors.push("projectName is required and must be a non-empty string.");
  }

  if (config.skillName !== undefined && !/^[a-z0-9][a-z0-9-]{0,62}$/.test(String(config.skillName))) {
    errors.push("skillName must use lowercase letters, digits, and hyphens, starting with a letter or digit, up to 63 characters.");
  }

  if (options.mode && !["genesis", "repo"].includes(options.mode)) {
    errors.push("--mode must be one of: genesis, repo.");
  }

  for (const field of Object.keys(config)) {
    if (!knownFields.has(field)) warnings.push(`Unknown field "${field}" will not render unless the template references it.`);
  }

  const text = allText(config);
  const counts = evidenceCounts(text);
  const unknownEvidence = [...text.matchAll(/\b([a-z_]+):/g)]
    .map((match) => match[1])
    .filter((label) => label.endsWith("_fact") || label.endsWith("_intent") || label.endsWith("_standard") || label.endsWith("_assumption"))
    .filter((label) => !evidenceLabels.includes(label));
  for (const label of new Set(unknownEvidence)) {
    errors.push(`Unknown evidence label "${label}". Use observed_fact, declared_intent, recommended_standard, or inferred_assumption.`);
  }

  if (options.strict) {
    for (const field of strictFields) {
      if (!isNonEmptyString(fieldText(config[field]))) errors.push(`${field} is required in strict mode.`);
    }

    const usedCategories = evidenceLabels.filter((label) => counts[label] > 0);
    if (usedCategories.length < 2) {
      errors.push("Strict mode requires at least two evidence categories.");
    }

    if (mode === "repo") {
      if (counts.observed_fact === 0) errors.push("Repo strict mode requires at least one observed_fact.");
      for (const { field, line } of observedFactLines(config)) {
        if (!hasPathCitation(line)) errors.push(`observed_fact in ${field} should cite a source path in backticks: ${line}`);
      }
    }

    if (mode === "genesis" && counts.declared_intent === 0) {
      errors.push("Genesis strict mode requires at least one declared_intent.");
    }
  }

  if (counts.inferred_assumption > counts.observed_fact + counts.declared_intent + counts.recommended_standard) {
    warnings.push("Config contains more inferred_assumption entries than grounded facts, declared intent, and standards combined.");
  }

  return { ok: errors.length === 0, errors, warnings, mode, counts };
}

export function formatValidation(result, label = "config") {
  const lines = [];
  if (result.ok) lines.push(`Config validation passed: ${label}`);
  else lines.push(`Config validation failed: ${label}`);
  for (const error of result.errors) lines.push(`ERROR: ${error}`);
  for (const warning of result.warnings) lines.push(`WARN: ${warning}`);
  if (result.mode) lines.push(`Mode: ${result.mode}`);
  if (result.counts) {
    const summary = evidenceLabels.map((label) => `${label}=${result.counts[label] || 0}`).join(", ");
    lines.push(`Evidence: ${summary}`);
  }
  return lines.join("\n");
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (error) {
    console.error(error.message);
    usage();
    process.exit(1);
  }

  if (args.help || !args.input) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  let config;
  try {
    config = JSON.parse(readFileSync(args.input, "utf8"));
  } catch (error) {
    console.error(`Config validation failed: ${args.input}`);
    console.error(`ERROR: Could not read or parse JSON: ${error.message}`);
    process.exit(1);
  }

  const result = validateConfig(config, { mode: args.mode, strict: args.strict });
  console.log(formatValidation(result, basename(args.input)));
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
