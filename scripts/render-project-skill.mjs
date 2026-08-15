#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { formatValidation, validateConfig } from "./validate-config.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = dirname(here);
const defaultTemplate = join(skillRoot, "assets", "templates", "project-skill");
const examplesDir = join(skillRoot, "assets", "examples");
const configSchemaPath = join(skillRoot, "references", "config-schema.md");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--input") args.input = argv[++i];
    else if (arg === "--output") args.output = argv[++i];
    else if (arg === "--template") args.template = argv[++i];
    else if (arg === "--init-config") args.initConfig = argv[++i];
    else if (arg === "--print-schema") args.printSchema = true;
    else if (arg === "--strict") args.strict = true;
    else if (arg === "--help") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function usage() {
  console.log(`Usage:
  node scripts/render-project-skill.mjs --input config.json --output <skill-dir> [--template <dir>] [--strict]
  node scripts/render-project-skill.mjs --init-config genesis|repo
  node scripts/render-project-skill.mjs --print-schema`);
}

function slugify(value) {
  return String(value || "project-maintainer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63) || "project-maintainer";
}

function listFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

function valueFor(config, key) {
  const defaults = {
    skillName: slugify(config.skillName || `${config.projectName || "project"}-maintainer`),
    projectName: config.projectName || "Project",
    projectDisplayName: `${config.projectName || "Project"} Maintainer`,
    projectSkillDescription: config.projectSkillDescription || `Maintain ${config.projectName || "this project"} as a project-specific AI maintainer skill. Use when an AI coding agent needs to understand this project's intent, architecture, coding standards, content style, workflows, generated files, verification commands, releases, or long-term maintenance conventions before making or reviewing changes.`,
    shortDescription: config.shortDescription || `Maintain ${config.projectName || "this project"}`,
    defaultPrompt: `Use $${slugify(config.skillName || `${config.projectName || "project"}-maintainer`)} to make a well-verified change to this project.`,
    projectPurpose: "- inferred_assumption: Project purpose has not been fully declared yet.",
    audience: "- inferred_assumption: Audience has not been fully declared yet.",
    publicVoice: "- inferred_assumption: Public voice has not been fully declared yet.",
    constraints: "- inferred_assumption: Constraints have not been fully declared yet.",
    maintenanceGoals: "- inferred_assumption: Maintenance goals have not been fully declared yet.",
    questionsToRevisit: "- inferred_assumption: Revisit unresolved project decisions after initial implementation.",
    importantPaths: "- inferred_assumption: Important paths should be filled from repo scan or genesis plan.",
    entryPoints: "- inferred_assumption: Entry points should be filled from repo scan or genesis plan.",
    ownershipBoundaries: "- inferred_assumption: Ownership boundaries are not yet explicit.",
    systemShape: "- inferred_assumption: Architecture should be updated once implementation exists.",
    dataFlow: "- inferred_assumption: Data/content flow is not yet explicit.",
    integrationPoints: "- inferred_assumption: Integration points are not yet explicit.",
    designConstraints: "- inferred_assumption: Design constraints are not yet explicit.",
    stylePatterns: "- recommended_standard: Follow the repository's existing patterns before adding new abstractions.",
    dependencyPolicy: "- recommended_standard: Add dependencies only when they remove real complexity or match project policy.",
    patternsToAvoid: "- recommended_standard: Avoid unrelated refactors while performing maintenance tasks.",
    languagePolicy: "- declared_intent: Use the project language selected during skill creation.",
    toneAndNaming: "- inferred_assumption: Match existing project terminology and public tone.",
    documentationConventions: "- recommended_standard: Update user-facing documentation when behavior changes.",
    commonChangeFlow: "- recommended_standard: Inspect relevant references, make a focused change, run verification, and summarize risks.",
    firstRepositoryTasks: "- inferred_assumption: Define first repository tasks during genesis or after repo scan.",
    reviewFlow: "- recommended_standard: Review behavior, verification, generated files, docs, and release impact.",
    verificationCommands: "- inferred_assumption: Verification commands have not been confirmed yet.",
    manualQa: "- inferred_assumption: Manual QA steps should be added for user-facing changes.",
    riskGates: "- recommended_standard: Escalate when changes affect releases, generated files, public APIs, or security-sensitive behavior.",
    versioning: "- inferred_assumption: Versioning policy has not been confirmed yet.",
    changelog: "- inferred_assumption: Changelog policy has not been confirmed yet.",
    deployPublish: "- inferred_assumption: Deploy/publish workflow has not been confirmed yet.",
    rollback: "- inferred_assumption: Rollback workflow has not been confirmed yet.",
    generatedOutput: "- inferred_assumption: Generated/build output should be identified from repo scan.",
    lockfiles: "- inferred_assumption: Lockfile policy should follow the selected package manager.",
    snapshotsSchemasVendored: "- inferred_assumption: Snapshots, schemas, and vendored files should be identified from repo scan.",
    editRestrictions: "- recommended_standard: Confirm before hand-editing generated, vendored, or release artifact files.",
    evidenceLedger: "- inferred_assumption: Evidence ledger should be refreshed from observed facts and declared intent.",
  };
  const value = config[key] ?? defaults[key] ?? "";
  return Array.isArray(value) ? value.join("\n") : String(value);
}

function render(text, config) {
  return text
    .replace(/\{\{yaml:([a-zA-Z0-9_]+)\}\}/g, (_, key) => yamlString(valueFor(config, key)))
    .replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => valueFor(config, key));
}

function yamlString(value) {
  return JSON.stringify(String(value ?? ""));
}

function manualBlock(text) {
  const match = text.match(/<!-- BEGIN USER RULES -->([\s\S]*?)<!-- END USER RULES -->/);
  return match ? match[1] : null;
}

function preserveManualBlock(next, previous) {
  const block = manualBlock(previous);
  if (block === null) return next;
  return next.replace(/<!-- BEGIN USER RULES -->[\s\S]*?<!-- END USER RULES -->/, `<!-- BEGIN USER RULES -->${block}<!-- END USER RULES -->`);
}

const args = parseArgs(process.argv);
if (args.printSchema) {
  console.log(readFileSync(configSchemaPath, "utf8"));
  process.exit(0);
}

if (args.initConfig) {
  const mode = String(args.initConfig).toLowerCase();
  if (!["genesis", "repo"].includes(mode)) {
    console.error("--init-config must be one of: genesis, repo");
    process.exit(1);
  }
  console.log(readFileSync(join(examplesDir, `${mode}-config.json`), "utf8"));
  process.exit(0);
}

if (args.help || !args.input || !args.output) {
  usage();
  process.exit(args.help ? 0 : 1);
}

const config = JSON.parse(readFileSync(args.input, "utf8"));
const validation = validateConfig(config, { strict: args.strict });
if (!validation.ok) {
  console.error(formatValidation(validation, args.input));
  process.exit(1);
}
if (validation.warnings.length) {
  console.error(formatValidation({ ...validation, ok: true, errors: [] }, args.input));
}
config.skillName = slugify(config.skillName || `${config.projectName || "project"}-maintainer`);

const template = args.template || defaultTemplate;
mkdirSync(args.output, { recursive: true });

for (const source of listFiles(template)) {
  const rel = relative(template, source);
  const dest = join(args.output, rel);
  mkdirSync(dirname(dest), { recursive: true });
  const raw = readFileSync(source);
  if (/\.(md|yaml|yml|mjs|json|txt)$/.test(source)) {
    let text = render(raw.toString("utf8"), config);
    if (existsSync(dest) && text.includes("BEGIN USER RULES")) {
      text = preserveManualBlock(text, readFileSync(dest, "utf8"));
    }
    writeFileSync(dest, text);
  } else {
    copyFileSync(source, dest);
  }
}

console.log(`Rendered ${config.skillName} to ${args.output}`);
