#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const evidenceLabels = ["observed_fact", "declared_intent", "recommended_standard", "inferred_assumption"];

const knownFields = new Set([
  "skillName",
  "displayName",
  "skillDescription",
  "shortDescription",
  "defaultTask",
  "skillPurpose",
  "capability",
  "usersAndTriggers",
  "inputsAndOutputs",
  "boundaries",
  "workflow",
  "resources",
  "verification",
  "standardFlow",
  "edgeCases",
  "failureHandling",
  "referenceResources",
  "assetResources",
  "scriptResources",
  "automatedChecks",
  "manualQa",
  "forwardTests",
  "generatedOutputs",
  "editRestrictions",
  "evidenceLedger",
]);

const strictFields = [
  "skillName",
  "displayName",
  "skillDescription",
  "shortDescription",
  "defaultTask",
  "skillPurpose",
  "capability",
  "usersAndTriggers",
  "inputsAndOutputs",
  "boundaries",
  "workflow",
  "resources",
  "verification",
  "standardFlow",
  "referenceResources",
  "scriptResources",
  "automatedChecks",
  "manualQa",
  "forwardTests",
  "generatedOutputs",
  "editRestrictions",
  "evidenceLedger",
];

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/validate-skill-config.mjs --input config.json [--strict]`);
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

export function validateSkillConfig(config, options = {}) {
  const errors = [];
  const warnings = [];

  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return { ok: false, errors: ["Config must be a JSON object."], warnings, counts: {} };
  }

  if (config.skillName !== undefined && !/^[a-z0-9][a-z0-9-]{0,62}$/.test(String(config.skillName))) {
    errors.push("skillName must use lowercase letters, digits, and hyphens, starting with a letter or digit, up to 63 characters.");
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

    if (!isNonEmptyString(config.skillName) && !isNonEmptyString(config.displayName)) {
      errors.push("Strict mode requires skillName or displayName.");
    }

    const usedCategories = evidenceLabels.filter((label) => counts[label] > 0);
    if (usedCategories.length < 2) {
      errors.push("Strict mode requires at least two evidence categories.");
    }
  }

  if (counts.inferred_assumption > counts.observed_fact + counts.declared_intent + counts.recommended_standard) {
    warnings.push("Config contains more inferred_assumption entries than grounded facts, declared intent, and standards combined.");
  }

  return { ok: errors.length === 0, errors, warnings, counts };
}

export function formatSkillConfigValidation(result, label = "config") {
  const lines = [];
  if (result.ok) lines.push(`Skill config validation passed: ${label}`);
  else lines.push(`Skill config validation failed: ${label}`);
  for (const error of result.errors) lines.push(`ERROR: ${error}`);
  for (const warning of result.warnings) lines.push(`WARN: ${warning}`);
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
    console.error(`Skill config validation failed: ${args.input}`);
    console.error(`ERROR: Could not read or parse JSON: ${error.message}`);
    process.exit(1);
  }

  const result = validateSkillConfig(config, { strict: args.strict });
  console.log(formatSkillConfigValidation(result, basename(args.input)));
  process.exit(result.ok ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
